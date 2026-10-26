import React, { useState, useEffect } from 'react';
import api from '../api/client';
import ProgressBar from '../components/ProgressBar';
import {
  Search,
  Filter,
  Plus,
  Target,
  Calendar,
  Clock,
  ArrowRight,
  Edit2,
  Trash2,
  RefreshCw
} from 'lucide-react';

const STATUS_FILTERS = ['All', 'Not Started', 'In Progress', 'Completed'];

const GoalsPage = ({
  onSelectGoal,
  onOpenNewGoalModal,
  onEditGoal,
  onOpenLogSessionForGoal
}) => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState(['All']);
  const [error, setError] = useState('');

  const fetchGoals = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (selectedStatus !== 'All') params.status = selectedStatus;
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (search.trim()) params.search = search.trim();

      const res = await api.get('/goals', { params });
      if (res.data.success) {
        setGoals(res.data.data);
        const uniqueCats = ['All', ...new Set(res.data.data.map((g) => g.category).filter(Boolean))];
        setCategories((prev) => Array.from(new Set([...prev, ...uniqueCats])));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load learning goals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchGoals();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, selectedStatus, selectedCategory]);

  const handleDeleteGoal = async (goal) => {
    if (
      window.confirm(
        `Are you sure you want to delete goal "${goal.title}"? All associated activities will also be removed.`
      )
    ) {
      try {
        await api.delete(`/goals/${goal._id}`);
        fetchGoals();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete goal');
      }
    }
  };

  const statusStyles = {
    'Completed': 'bg-[#B7D6A5]/30 text-[#245B52] border-[#B7D6A5] font-bold',
    'In Progress': 'bg-[#245B52]/10 text-[#245B52] border-[#245B52]/20 font-semibold',
    'Not Started': 'bg-[#E5DCBE]/50 text-[#132A2A]/70 border-[#DDD1B8] font-medium'
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#132A2A]">
            Learning Goals
          </h1>
          <p className="text-sm text-[#132A2A]/70 mt-1">
            Organize core subjects (C Programming, DBMS, ML) and track activity progress.
          </p>
        </div>
        <button
          onClick={onOpenNewGoalModal}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 bg-[#245B52] hover:bg-[#1b4740] text-white text-xs font-bold rounded-xl shadow-sm transition active:scale-95"
        >
          <Plus className="w-4 h-4 text-[#B7D6A5]" />
          <span>Set New Goal</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white/95 p-4 rounded-3xl border border-[#DDD1B8] shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#132A2A]/40 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search goals by title or keyword..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-[#DDD1B8] focus:outline-none focus:ring-2 focus:ring-[#245B52]/20 focus:border-[#245B52] transition bg-[#FAF7F0]/60"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3.5 py-2 text-sm rounded-xl border border-[#DDD1B8] focus:outline-none focus:ring-2 focus:ring-[#245B52]/20 focus:border-[#245B52] bg-white transition text-[#132A2A] font-medium"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'All' ? 'All Subjects / Categories' : cat}
              </option>
            ))}
          </select>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-2 pt-2 border-t border-[#DDD1B8]/40 overflow-x-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-[#132A2A]/50 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3 text-[#245B52]" /> Status:
          </span>
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setSelectedStatus(s)}
              className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                selectedStatus === s
                  ? 'bg-[#245B52] text-white shadow-2xs'
                  : 'bg-[#E5DCBE]/40 text-[#132A2A]/70 hover:bg-[#E5DCBE]/80'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Goals Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-8 h-8 text-[#245B52] animate-spin" />
        </div>
      ) : error ? (
        <div className="p-6 bg-[#fdf4ec] border border-[#E6A66A] text-[#8b521c] rounded-3xl text-center text-sm font-semibold">
          {error}
        </div>
      ) : goals.length === 0 ? (
        <div className="text-center py-16 bg-white/95 rounded-3xl border border-dashed border-[#DDD1B8] p-8">
          <Target className="w-14 h-14 text-[#132A2A]/20 mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#132A2A]">No learning goals found</h3>
          <p className="text-xs text-[#132A2A]/60 mt-1 max-w-sm mx-auto">
            Create goals like "Master C Programming" or "Complete DBMS" to organize your syllabus.
          </p>
          <button
            onClick={onOpenNewGoalModal}
            className="mt-5 px-5 py-2.5 bg-[#245B52] text-white rounded-xl text-xs font-bold hover:bg-[#1b4740] shadow-sm transition"
          >
            Create Learning Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => (
            <div
              key={goal._id}
              className="bg-white/95 rounded-3xl border border-[#DDD1B8] shadow-sm hover:shadow-md transition flex flex-col justify-between overflow-hidden group"
            >
              <div className="p-5">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-[#245B52]/10 text-[#245B52] border border-[#245B52]/20 truncate max-w-[150px]">
                    {goal.category}
                  </span>
                  <span className={`text-[11px] px-2.5 py-1 rounded-full border ${statusStyles[goal.status] || statusStyles['Not Started']}`}>
                    {goal.status}
                  </span>
                </div>

                <h3
                  onClick={() => onSelectGoal(goal)}
                  className="text-base font-bold text-[#132A2A] group-hover:text-[#245B52] transition cursor-pointer line-clamp-1"
                >
                  {goal.title}
                </h3>

                <p className="mt-1 text-xs text-[#132A2A]/60 line-clamp-2 min-h-[32px]">
                  {goal.description || 'No detailed learning objectives outlined.'}
                </p>

                <div className="mt-4 flex items-center justify-between text-xs text-[#132A2A]/60">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#245B52]" />
                    {goal.targetDate ? new Date(goal.targetDate).toLocaleDateString() : 'No target date'}
                  </span>
                  <span className="flex items-center gap-1 font-bold text-[#245B52] bg-[#B7D6A5]/20 px-2.5 py-0.5 rounded-lg border border-[#B7D6A5]">
                    <Clock className="w-3 h-3 text-[#245B52]" />
                    {goal.totalStudyHours || 0} hrs studied
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mt-4 pt-3 border-t border-[#DDD1B8]/40">
                  <div className="flex justify-between items-center text-xs mb-1.5 font-bold">
                    <span className="text-[#132A2A]/60">
                      Activities: <strong className="text-[#132A2A]">{goal.completedActivities || 0}</strong> / {goal.totalActivities || 0}
                    </span>
                    <span className="text-[#245B52] font-extrabold">{goal.progress || 0}%</span>
                  </div>
                  <ProgressBar progress={goal.progress || 0} showLabel={false} size="sm" />
                </div>
              </div>

              {/* Actions Footer */}
              <div className="px-5 py-3 bg-[#FAF7F0] border-t border-[#DDD1B8]/50 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onOpenLogSessionForGoal(goal)}
                    title="Log Study Session for this Goal"
                    className="p-1.5 text-[#132A2A]/60 hover:text-[#245B52] hover:bg-white rounded-lg transition"
                  >
                    <Clock className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onEditGoal(goal)}
                    title="Edit Goal"
                    className="p-1.5 text-[#132A2A]/60 hover:text-[#132A2A] hover:bg-white rounded-lg transition"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteGoal(goal)}
                    title="Delete Goal"
                    className="p-1.5 text-[#132A2A]/60 hover:text-[#8b521c] hover:bg-[#E6A66A]/20 rounded-lg transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => onSelectGoal(goal)}
                  className="flex items-center gap-1 font-bold text-[#245B52] hover:text-[#1b4740] transition"
                >
                  <span>View Activities</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GoalsPage;
