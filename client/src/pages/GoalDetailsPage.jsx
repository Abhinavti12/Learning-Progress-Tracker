import React, { useState, useEffect } from 'react';
import api from '../api/client';
import ProgressBar from '../components/ProgressBar';
import ActivityModal from '../components/ActivityModal';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  Edit2,
  Trash2,
  CheckSquare,
  Square,
  ExternalLink,
  BookOpen,
  Sparkles,
  Star,
  Layers
} from 'lucide-react';

const TYPE_COLORS = {
  Lesson: 'bg-[#245B52]/10 text-[#245B52] border-[#245B52]/20',
  Reading: 'bg-[#B7D6A5]/30 text-[#245B52] border-[#B7D6A5]',
  Video: 'bg-[#E6A66A]/20 text-[#8b521c] border-[#E6A66A]/40',
  Practice: 'bg-[#132A2A]/10 text-[#132A2A] border-[#132A2A]/20',
  Project: 'bg-[#245B52] text-white border-[#245B52]',
  Quiz: 'bg-[#B7D6A5]/40 text-[#132A2A] border-[#B7D6A5]'
};

const GoalDetailsPage = ({
  goalId,
  onBack,
  onEditGoal,
  onDeleteGoal,
  onOpenLogSessionForGoal
}) => {
  const [goal, setGoal] = useState(null);
  const [activities, setActivities] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activityFilter, setActivityFilter] = useState('all');
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [error, setError] = useState('');

  const fetchGoalDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/goals/${goalId}`);
      if (res.data.success) {
        setGoal(res.data.data);
        setActivities(res.data.data.activities || []);
        setSessions(res.data.data.sessions || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load goal details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (goalId) {
      fetchGoalDetails();
    }
  }, [goalId]);

  const handleToggleActivity = async (activityId) => {
    try {
      const res = await api.patch(`/activities/${activityId}/toggle`);
      if (res.data.success) {
        setActivities((prev) =>
          prev.map((a) => (a._id === activityId ? { ...a, completed: res.data.data.completed } : a))
        );
        if (res.data.goalStats) {
          setGoal((prev) => ({
            ...prev,
            ...res.data.goalStats
          }));
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle activity');
    }
  };

  const handleDeleteActivity = async (activityId) => {
    if (window.confirm('Are you sure you want to delete this learning activity?')) {
      try {
        await api.delete(`/activities/${activityId}`);
        fetchGoalDetails();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete activity');
      }
    }
  };

  const handleSaveActivity = async (activityData) => {
    if (editingActivity) {
      await api.put(`/activities/${editingActivity._id}`, activityData);
    } else {
      await api.post('/activities', {
        ...activityData,
        goalId
      });
    }
    fetchGoalDetails();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-[#245B52] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !goal) {
    return (
      <div className="p-8 text-center bg-white/95 rounded-3xl border border-[#DDD1B8]">
        <p className="text-[#8b521c] font-bold mb-4">{error || 'Goal not found'}</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-[#132A2A] text-white rounded-xl text-xs font-bold"
        >
          Back to Goals
        </button>
      </div>
    );
  }

  const filteredActivities = activities.filter((a) => {
    if (activityFilter === 'incomplete') return !a.completed;
    if (activityFilter === 'completed') return a.completed;
    return true;
  });

  const totalActivities = activities.length;
  const completedActivities = activities.filter((a) => a.completed).length;
  const progress = totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Back Nav */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-bold text-[#132A2A]/60 hover:text-[#245B52] transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to All Learning Goals</span>
      </button>

      {/* Goal Header */}
      <div className="bg-white/95 rounded-3xl border border-[#DDD1B8] p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-xs font-bold px-3 py-1 rounded-lg bg-[#245B52]/10 text-[#245B52] border border-[#245B52]/20">
                {goal.category}
              </span>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#E5DCBE]/40 text-[#132A2A] border border-[#DDD1B8]">
                {goal.status}
              </span>
              {goal.targetDate && (
                <span className="text-xs text-[#132A2A]/60 flex items-center gap-1.5 ml-1">
                  <Calendar className="w-3.5 h-3.5 text-[#245B52]" />
                  Target: <strong>{new Date(goal.targetDate).toLocaleDateString()}</strong>
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#132A2A] tracking-tight">
              {goal.title}
            </h1>
            <p className="text-sm text-[#132A2A]/70 max-w-3xl leading-relaxed whitespace-pre-line">
              {goal.description || 'No detailed learning objectives described.'}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start shrink-0">
            <button
              onClick={() => onOpenLogSessionForGoal(goal)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#245B52] hover:bg-[#1b4740] rounded-xl shadow-sm transition"
            >
              <Clock className="w-3.5 h-3.5 text-[#B7D6A5]" />
              <span>Log Study Session</span>
            </button>
            <button
              onClick={() => onEditGoal(goal)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#132A2A] bg-[#FAF7F0] hover:bg-[#E5DCBE]/50 border border-[#DDD1B8] rounded-xl transition"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
            <button
              onClick={() => onDeleteGoal(goal)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#8b521c] bg-[#E6A66A]/15 hover:bg-[#E6A66A]/30 border border-[#E6A66A]/30 rounded-xl transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>

        {/* Progress Box (Sage Mint & Botanical Green) */}
        <div className="mt-8 p-5 bg-[#FAF7F0] rounded-2xl border border-[#DDD1B8]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#132A2A]/60 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#245B52]" /> Activity Completion Formula
              </p>
              <p className="text-xs text-[#132A2A]/80 font-mono mt-0.5">
                Progress = ({completedActivities} completed ÷ {totalActivities} total) × 100 ={' '}
                <strong className="text-[#245B52] text-sm font-bold">{progress}%</strong>
              </p>
            </div>
            <div className="text-right flex items-center gap-4">
              <div className="text-right">
                <span className="text-xs text-[#132A2A]/60 block">Total Study Time</span>
                <span className="text-lg font-extrabold text-[#132A2A]">
                  {goal.totalStudyHours || 0} hrs
                </span>
              </div>
              <div className="h-8 w-px bg-[#DDD1B8]" />
              <div className="text-right">
                <span className="text-2xl font-black text-[#245B52]">{progress}%</span>
                <span className="text-xs text-[#132A2A]/60 block">
                  {completedActivities}/{totalActivities} activities
                </span>
              </div>
            </div>
          </div>
          <ProgressBar progress={progress} showLabel={false} size="lg" />
        </div>
      </div>

      {/* Learning Activities Section */}
      <div className="bg-white/95 rounded-3xl border border-[#DDD1B8] p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-[#132A2A]">Learning Activities & Resources</h2>
            <p className="text-xs text-[#132A2A]/60 mt-0.5">
              Lessons, readings, practice exercises, and study material links under this goal.
            </p>
          </div>

          <button
            onClick={() => {
              setEditingActivity(null);
              setIsActivityModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#245B52] hover:bg-[#1b4740] text-white text-xs font-bold rounded-xl shadow-sm transition active:scale-95"
          >
            <Plus className="w-4 h-4 text-[#B7D6A5]" />
            <span>Add Activity</span>
          </button>
        </div>

        {/* Activity Filter Tabs */}
        <div className="flex items-center gap-2 pb-2 border-b border-[#DDD1B8]/40">
          {[
            { id: 'all', label: `All Activities (${activities.length})` },
            { id: 'incomplete', label: `Pending (${activities.length - completedActivities})` },
            { id: 'completed', label: `Completed (${completedActivities})` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActivityFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                activityFilter === tab.id
                  ? 'bg-[#245B52] text-white shadow-2xs'
                  : 'bg-[#E5DCBE]/40 text-[#132A2A]/70 hover:bg-[#E5DCBE]/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Activities List */}
        {filteredActivities.length === 0 ? (
          <div className="text-center py-10 bg-[#FAF7F0] rounded-2xl border border-dashed border-[#DDD1B8]">
            <BookOpen className="w-10 h-10 text-[#132A2A]/20 mx-auto mb-2" />
            <p className="text-xs font-bold text-[#132A2A]">No activities recorded</p>
            <p className="text-[11px] text-[#132A2A]/60 mt-0.5">
              Add your lessons, reading materials, or exercises to begin tracking.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredActivities.map((act) => (
              <div
                key={act._id}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                  act.completed
                    ? 'bg-[#FAF7F0] border-[#DDD1B8]/60 opacity-80'
                    : 'bg-white border-[#DDD1B8] hover:border-[#245B52] shadow-2xs'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <button
                    onClick={() => handleToggleActivity(act._id)}
                    className="shrink-0 transition active:scale-90"
                    title={act.completed ? 'Mark pending' : 'Mark completed'}
                  >
                    {act.completed ? (
                      <CheckSquare className="w-5 h-5 text-[#245B52]" />
                    ) : (
                      <Square className="w-5 h-5 text-[#DDD1B8] hover:text-[#245B52]" />
                    )}
                  </button>

                  <div className="min-w-0">
                    <p
                      className={`text-sm font-semibold ${
                        act.completed ? 'line-through text-[#132A2A]/40' : 'text-[#132A2A]'
                      }`}
                    >
                      {act.title}
                    </p>

                    <div className="flex items-center gap-2 mt-1 flex-wrap text-xs">
                      {/* Activity Type Badge */}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                          TYPE_COLORS[act.type] || TYPE_COLORS.Lesson
                        }`}
                      >
                        {act.type}
                      </span>

                      {/* Resource Link Button */}
                      {act.resourceLink && (
                        <a
                          href={act.resourceLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[11px] font-bold text-[#245B52] hover:underline"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Resource</span>
                        </a>
                      )}

                      {/* Due Date */}
                      {act.dueDate && (
                        <span className="flex items-center gap-1 text-[11px] text-[#132A2A]/60">
                          <Calendar className="w-3 h-3 text-[#245B52]" />
                          {new Date(act.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => {
                      setEditingActivity(act);
                      setIsActivityModalOpen(true);
                    }}
                    title="Edit Activity"
                    className="p-1.5 text-[#132A2A]/40 hover:text-[#132A2A] hover:bg-[#FAF7F0] rounded-lg transition"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteActivity(act._id)}
                    title="Delete Activity"
                    className="p-1.5 text-[#132A2A]/40 hover:text-[#8b521c] hover:bg-[#E6A66A]/20 rounded-lg transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Associated Study Sessions Timeline */}
      <div className="bg-white/95 rounded-3xl border border-[#DDD1B8] p-6 sm:p-8 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-[#132A2A] flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#245B52]" />
          <span>Study Sessions for this Goal</span>
        </h2>

        {sessions && sessions.length > 0 ? (
          <div className="space-y-3">
            {sessions.map((s) => (
              <div
                key={s._id}
                className="p-4 rounded-2xl border border-[#DDD1B8]/60 bg-[#FAF7F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#132A2A]">{s.topicStudied}</span>
                    <span className="text-[11px] px-2.5 py-0.5 rounded-md bg-[#245B52]/10 text-[#245B52] font-bold border border-[#245B52]/20">
                      {s.durationMinutes} min ({Math.round((s.durationMinutes / 60) * 10) / 10} hrs)
                    </span>
                  </div>
                  {s.notes && (
                    <p className="text-xs text-[#132A2A]/70 mt-1 line-clamp-2">{s.notes}</p>
                  )}
                  <p className="text-[11px] text-[#132A2A]/50 mt-1">
                    Studied on {new Date(s.date).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 self-start sm:self-auto shrink-0">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${
                          star <= s.understandingRating
                            ? 'text-[#E6A66A] fill-[#E6A66A]'
                            : 'text-[#DDD1B8]'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-[#132A2A]">
                    {s.understandingRating}/5
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#132A2A]/50 py-4 text-center">
            No study sessions logged for this goal yet. Click "Log Study Session" above to start.
          </p>
        )}
      </div>

      <ActivityModal
        isOpen={isActivityModalOpen}
        onClose={() => {
          setIsActivityModalOpen(false);
          setEditingActivity(null);
        }}
        onSave={handleSaveActivity}
        activity={editingActivity}
        goalTitle={goal.title}
      />
    </div>
  );
};

export default GoalDetailsPage;
