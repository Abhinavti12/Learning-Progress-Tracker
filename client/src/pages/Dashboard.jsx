import React, { useState, useEffect } from 'react';
import api from '../api/client';
import StatsCard from '../components/StatsCard';
import ProgressBar from '../components/ProgressBar';
import {
  Clock,
  Target,
  Star,
  RotateCcw,
  Plus,
  ArrowRight,
  TrendingUp,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  BookOpen
} from 'lucide-react';

const Dashboard = ({
  onNavigateToGoals,
  onSelectGoal,
  onOpenNewGoalModal,
  onOpenLogSessionModal,
  onNavigateToRevision,
  onNavigateToSessions
}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/analytics/dashboard');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load progress dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleResolveRevision = async (sessionId) => {
    try {
      await api.patch(`/sessions/${sessionId}/revision`);
      fetchDashboard();
    } catch (err) {
      console.error('Failed to toggle revision:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#245B52] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[#132A2A]/70 font-semibold">Analyzing your learning progress...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto my-12 p-6 bg-[#fdf4ec] border border-[#E6A66A] rounded-3xl text-center">
        <AlertTriangle className="w-8 h-8 text-[#8b521c] mx-auto mb-2" />
        <h3 className="text-base font-bold text-[#8b521c]">Unable to load dashboard</h3>
        <p className="text-xs text-[#8b521c]/80 mt-1">{error}</p>
        <button
          onClick={fetchDashboard}
          className="mt-4 px-4 py-2 bg-[#8b521c] text-white rounded-xl text-xs font-semibold hover:bg-[#6e3f14] transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  const { metrics, weeklyConsistency, revisionTopics, recentSessions, goalsWithProgress } = data || {};

  // Find max minutes in weekly consistency to scale the chart bars
  const maxWeeklyMinutes = Math.max(...(weeklyConsistency?.map((d) => d.minutes) || [60]), 60);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Header & Fast Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#132A2A]">
            Learning Progress Dashboard
          </h1>
          <p className="text-sm text-[#132A2A]/70 mt-1">
            Track study consistency, self-assess topic grasp, and complete learning goals.
          </p>
        </div>
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={onOpenLogSessionModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#245B52] hover:bg-[#1b4740] text-white text-xs font-bold rounded-xl shadow-sm transition active:scale-95"
          >
            <Clock className="w-4 h-4 text-[#B7D6A5]" />
            <span>Record Study Session</span>
          </button>
          <button
            onClick={onOpenNewGoalModal}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white/90 border border-[#DDD1B8] hover:bg-white text-[#132A2A] text-xs font-bold rounded-xl transition"
          >
            <Plus className="w-4 h-4 text-[#245B52]" />
            <span>New Goal</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard
          title="Total Study Time"
          value={`${metrics?.totalHours || 0} hrs`}
          subtitle={`${metrics?.totalSessions || 0} study sessions logged`}
          icon={Clock}
          color="botanical"
        />
        <StatsCard
          title="Completed Goals"
          value={metrics?.completedGoals || 0}
          subtitle={`Out of ${metrics?.totalGoals || 0} total goals`}
          icon={Target}
          color="sage"
        />
        <StatsCard
          title="Understanding Index"
          value={`${metrics?.avgUnderstandingRating || 0} / 5`}
          subtitle="Self-assessment average rating"
          icon={Star}
          color="copper"
        />
        <StatsCard
          title="Topics Needing Revision"
          value={metrics?.revisionCount || 0}
          subtitle={metrics?.revisionCount > 0 ? 'Review recommended' : 'All topics mastered'}
          icon={RotateCcw}
          color={metrics?.revisionCount > 0 ? 'copper' : 'sage'}
        />
      </div>

      {/* Weekly Study Consistency Bar Chart */}
      <div className="bg-white/95 rounded-3xl border border-[#DDD1B8] p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
          <div>
            <h2 className="text-base font-bold text-[#132A2A] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#245B52]" />
              <span>Weekly Learning Consistency (Past 7 Days)</span>
            </h2>
            <p className="text-xs text-[#132A2A]/60 mt-0.5">
              Evaluates your daily study habits and learning time distribution
            </p>
          </div>
          <span className="text-xs font-bold text-[#245B52] bg-[#B7D6A5]/30 border border-[#B7D6A5] px-3 py-1 rounded-full self-start">
            Total this week:{' '}
            <strong className="text-[#132A2A] font-extrabold">
              {Math.round(
                ((weeklyConsistency?.reduce((acc, d) => acc + d.minutes, 0) || 0) / 60) * 10
              ) / 10}{' '}
              hrs
            </strong>
          </span>
        </div>

        {/* 7-Day Bar Graph */}
        <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end pt-8 pb-2 border-b border-[#DDD1B8]/60 min-h-[160px]">
          {weeklyConsistency?.map((day) => {
            const heightPercent = Math.max(Math.round((day.minutes / maxWeeklyMinutes) * 100), 6);
            const isToday = day.date === new Date().toISOString().substring(0, 10);

            return (
              <div key={day.date} className="flex flex-col items-center gap-2 group">
                {/* Tooltip on hover */}
                <span className="text-[10px] font-bold text-[#132A2A]/50 group-hover:text-[#245B52] transition">
                  {day.minutes > 0 ? `${day.minutes}m` : '-'}
                </span>

                {/* Vertical Bar (Botanical Green #245B52 with Sage Mint #B7D6A5 highlights) */}
                <div className="w-full max-w-[44px] bg-[#E5DCBE]/60 rounded-xl h-28 flex items-end p-1 overflow-hidden border border-[#DDD1B8]/40">
                  <div
                    className={`w-full rounded-lg transition-all duration-700 ease-out ${
                      day.minutes > 0
                        ? isToday
                          ? 'bg-[#245B52] shadow-sm shadow-[#245B52]/30 ring-2 ring-[#B7D6A5]'
                          : 'bg-[#245B52]/80 group-hover:bg-[#245B52]'
                        : 'bg-transparent'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>

                {/* Day label */}
                <div className="text-center">
                  <p className={`text-xs font-bold ${isToday ? 'text-[#245B52]' : 'text-[#132A2A]/70'}`}>
                    {day.day}
                  </p>
                  <p className="text-[10px] text-[#132A2A]/40">{day.date.substring(5)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Grid: Goals Progress & Self-Assessment Revision */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Learning Goals Overview */}
        <div className="lg:col-span-2 bg-white/95 rounded-3xl border border-[#DDD1B8] p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-[#132A2A]">Learning Goals Progress</h2>
              <p className="text-xs text-[#132A2A]/60 mt-0.5">Activity milestones & study hours invested</p>
            </div>
            <button
              onClick={onNavigateToGoals}
              className="text-xs font-bold text-[#245B52] hover:text-[#1b4740] flex items-center gap-1 transition"
            >
              <span>View All Goals</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {goalsWithProgress && goalsWithProgress.length > 0 ? (
            <div className="space-y-4">
              {goalsWithProgress.map((goal) => (
                <div
                  key={goal._id}
                  onClick={() => onSelectGoal(goal)}
                  className="p-4 rounded-2xl border border-[#DDD1B8]/70 hover:border-[#245B52] hover:bg-[#FAF7F0] transition cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#132A2A] group-hover:text-[#245B52] transition">
                        {goal.title}
                      </span>
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-lg bg-[#245B52]/10 text-[#245B52] border border-[#245B52]/20">
                        {goal.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-[#132A2A]/60 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#245B52]" />
                        {goal.totalStudyHours || 0} hrs
                      </span>
                      <span className="font-extrabold text-[#132A2A]">{goal.progress || 0}%</span>
                    </div>
                  </div>
                  <ProgressBar progress={goal.progress || 0} size="sm" showLabel={false} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Target className="w-12 h-12 text-[#132A2A]/20 mx-auto mb-3" />
              <p className="text-sm font-bold text-[#132A2A]">No learning goals defined</p>
              <p className="text-xs text-[#132A2A]/60 mt-1 max-w-sm mx-auto">
                Set goals like "Master C Programming" or "Complete DBMS" to organize your learning journey.
              </p>
              <button
                onClick={onOpenNewGoalModal}
                className="mt-4 px-4 py-2 bg-[#245B52] text-white rounded-xl text-xs font-bold hover:bg-[#1b4740] transition"
              >
                Set First Goal
              </button>
            </div>
          )}
        </div>

        {/* Right Column (1 Col): Topics Needing Revision (Copper Amber #E6A66A) */}
        <div className="space-y-6">
          <div className="bg-white/95 rounded-3xl border border-[#DDD1B8] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-[#132A2A] flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-[#8b521c]" />
                <span>Needs Revision</span>
              </h2>
              <button
                onClick={onNavigateToRevision}
                className="text-xs font-bold text-[#245B52] hover:text-[#1b4740] transition"
              >
                View All
              </button>
            </div>

            {revisionTopics && revisionTopics.length > 0 ? (
              <div className="space-y-3">
                {revisionTopics.map((item) => (
                  <div
                    key={item._id}
                    className="p-3.5 rounded-2xl border border-[#E6A66A]/40 bg-[#fdf4ec] flex items-start justify-between gap-3 shadow-2xs"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#132A2A] line-clamp-1">
                        {item.topicStudied}
                      </p>
                      {item.goalId?.title && (
                        <p className="text-[11px] text-[#132A2A]/60 truncate mt-0.5">
                          Goal: <span className="font-semibold text-[#132A2A]">{item.goalId.title}</span>
                        </p>
                      )}
                      <div className="flex items-center gap-1 mt-1.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3 h-3 ${
                              s <= item.understandingRating
                                ? 'text-[#E6A66A] fill-[#E6A66A]'
                                : 'text-[#DDD1B8]'
                            }`}
                          />
                        ))}
                        <span className="text-[10px] font-bold text-[#8b521c] ml-1">
                          ({item.understandingRating}/5)
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleResolveRevision(item._id)}
                      title="Mark as Revised & Understood"
                      className="shrink-0 p-1.5 rounded-xl bg-white border border-[#B7D6A5] hover:bg-[#B7D6A5]/30 text-[#245B52] transition shadow-2xs"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle2 className="w-8 h-8 text-[#245B52] mx-auto mb-2" />
                <p className="text-xs font-bold text-[#132A2A]">No revision required!</p>
                <p className="text-[11px] text-[#132A2A]/60 mt-0.5">
                  Your self-assessments show strong understanding across topics.
                </p>
              </div>
            )}
          </div>

          {/* Quick Recent Session Card */}
          <div className="bg-white/95 rounded-3xl border border-[#DDD1B8] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-[#132A2A] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#245B52]" />
                <span>Recent Study Sessions</span>
              </h2>
              <button
                onClick={onNavigateToSessions}
                className="text-xs font-bold text-[#245B52] hover:text-[#1b4740] transition"
              >
                Log
              </button>
            </div>

            {recentSessions && recentSessions.length > 0 ? (
              <div className="space-y-3">
                {recentSessions.slice(0, 4).map((s) => (
                  <div key={s._id} className="text-xs pb-3 border-b border-[#DDD1B8]/40 last:border-none last:pb-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#132A2A] truncate max-w-[150px]">
                        {s.topicStudied}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-[#245B52]/10 text-[#245B52] font-bold border border-[#245B52]/20">
                        {s.durationMinutes} min
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[#132A2A]/50 mt-1">
                      <span>{new Date(s.date).toLocaleDateString()}</span>
                      <span className="flex items-center gap-0.5 text-[#8b521c] font-semibold">
                        <Star className="w-3 h-3 fill-[#E6A66A] text-[#E6A66A]" />
                        {s.understandingRating}/5
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#132A2A]/50 text-center py-4">No study sessions recorded yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
