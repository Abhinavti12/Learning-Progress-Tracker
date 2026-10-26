import React, { useState, useEffect } from 'react';
import api from '../api/client';
import StatsCard from '../components/StatsCard';
import ProgressBar from '../components/ProgressBar';
import {
  BarChart3,
  Database,
  Layers,
  Clock,
  Star,
  Code2,
  FolderTree,
  ShieldCheck,
  TrendingUp,
  RotateCcw
} from 'lucide-react';

const ReportsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('visual'); // 'visual' | 'dbms'

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/analytics/dashboard');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-[#245B52] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { metrics, weeklyConsistency, categoryBreakdown } = data || {};

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#132A2A]">
            Progress Analytics & DBMS Evaluation
          </h1>
          <p className="text-sm text-[#132A2A]/70 mt-1">
            Real-time learning progress telemetry backed by MongoDB document references and aggregation pipelines.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-[#E5DCBE]/50 p-1.5 rounded-2xl border border-[#DDD1B8] self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('visual')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl transition ${
              activeTab === 'visual'
                ? 'bg-[#245B52] text-white shadow-2xs'
                : 'text-[#132A2A]/70 hover:text-[#132A2A]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Progress Metrics</span>
          </button>
          <button
            onClick={() => setActiveTab('dbms')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl transition ${
              activeTab === 'dbms'
                ? 'bg-[#245B52] text-white shadow-2xs'
                : 'text-[#132A2A]/70 hover:text-[#132A2A]'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>DBMS Architecture</span>
          </button>
        </div>
      </div>

      {activeTab === 'visual' ? (
        <>
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatsCard
              title="Total Study Hours"
              value={`${metrics?.totalHours || 0} hrs`}
              subtitle={`${metrics?.totalMinutes || 0} total minutes logged`}
              icon={Clock}
              color="botanical"
            />
            <StatsCard
              title="Learning Goals Tracked"
              value={metrics?.totalGoals || 0}
              subtitle={`${metrics?.completedGoals || 0} fully completed`}
              icon={Layers}
              color="sage"
            />
            <StatsCard
              title="Self-Assessment Index"
              value={`${metrics?.avgUnderstandingRating || 0} / 5`}
              subtitle="Average topic confidence"
              icon={Star}
              color="copper"
            />
            <StatsCard
              title="Needs Revision Queue"
              value={metrics?.revisionCount || 0}
              subtitle="Topics requiring active recall"
              icon={RotateCcw}
              color={metrics?.revisionCount > 0 ? 'copper' : 'sage'}
            />
          </div>

          {/* Category Distribution */}
          <div className="bg-white/95 rounded-3xl border border-[#DDD1B8] p-6 sm:p-8 shadow-sm">
            <h2 className="text-base font-bold text-[#132A2A] flex items-center gap-2 mb-2">
              <Layers className="w-4 h-4 text-[#245B52]" />
              <span>Goal Categories & Subject Distribution</span>
            </h2>
            <p className="text-xs text-[#132A2A]/60 mb-6">
              Aggregated across student learning goals via MongoDB <code className="font-mono text-[#245B52] font-bold">$group</code>
            </p>

            {categoryBreakdown && categoryBreakdown.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {categoryBreakdown.map((cat) => (
                  <div key={cat._id} className="p-4 rounded-2xl border border-[#DDD1B8]/60 bg-[#FAF7F0]">
                    <div className="flex justify-between items-center text-xs mb-1.5 font-bold text-[#132A2A]">
                      <span>{cat._id}</span>
                      <span className="text-[#245B52] bg-[#B7D6A5]/25 border border-[#B7D6A5] px-2.5 py-0.5 rounded-lg">
                        {cat.count} {cat.count === 1 ? 'goal' : 'goals'}
                      </span>
                    </div>
                    <div className="w-full bg-[#E5DCBE] rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-[#245B52] h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(
                            Math.round((cat.count / (metrics?.totalGoals || 1)) * 100),
                            100
                          )}%`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#132A2A]/50 py-4 text-center">No categories recorded yet.</p>
            )}
          </div>
        </>
      ) : (
        /* DBMS Architecture Tab */
        <div className="space-y-6">
          <div className="bg-white/95 rounded-3xl border border-[#DDD1B8] p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-2xl bg-[#245B52]/10 text-[#245B52]">
                <FolderTree className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#132A2A]">4-Collection Document Reference Design</h2>
                <p className="text-xs text-[#132A2A]/60">
                  Relational consistency enforced through MongoDB ObjectIds, foreign key references, and indexes
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              {/* Users */}
              <div className="p-4 rounded-2xl border border-[#DDD1B8] bg-[#FAF7F0]">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-[#132A2A]">users</span>
                  <span className="text-[10px] uppercase font-bold text-[#132A2A]/50">Student Account</span>
                </div>
                <ul className="text-xs space-y-1 text-[#132A2A]/80 font-mono">
                  <li>_id: ObjectId (PK)</li>
                  <li>name: String</li>
                  <li className="text-[#245B52] font-bold">email: String (Unique UK)</li>
                  <li>passwordHash: String</li>
                  <li>createdAt: Date</li>
                </ul>
              </div>

              {/* Learning Goals */}
              <div className="p-4 rounded-2xl border border-[#245B52]/40 bg-[#245B52]/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-[#245B52]">learningGoals</span>
                  <span className="text-[10px] uppercase font-bold text-[#245B52]">1:N Ref User</span>
                </div>
                <ul className="text-xs space-y-1 text-[#132A2A]/80 font-mono">
                  <li>_id: ObjectId (PK)</li>
                  <li className="text-[#245B52] font-bold">userId: ObjectId (Ref users)</li>
                  <li>title: String</li>
                  <li>category: String (Indexed)</li>
                  <li>targetDate: Date</li>
                  <li>status: Enum (Indexed)</li>
                </ul>
              </div>

              {/* Learning Activities */}
              <div className="p-4 rounded-2xl border border-[#B7D6A5] bg-[#B7D6A5]/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-[#245B52]">learningActivities</span>
                  <span className="text-[10px] uppercase font-bold text-[#245B52]">1:N Ref Goal</span>
                </div>
                <ul className="text-xs space-y-1 text-[#132A2A]/80 font-mono">
                  <li>_id: ObjectId (PK)</li>
                  <li className="text-[#245B52] font-bold">goalId: ObjectId (Ref goal)</li>
                  <li>userId: ObjectId</li>
                  <li>title: String</li>
                  <li>type: Enum (Lesson, etc)</li>
                  <li>resourceLink: String</li>
                  <li className="text-[#245B52] font-bold">completed: Boolean</li>
                </ul>
              </div>

              {/* Study Sessions */}
              <div className="p-4 rounded-2xl border border-[#E6A66A] bg-[#fdf4ec]">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-[#8b521c]">studySessions</span>
                  <span className="text-[10px] uppercase font-bold text-[#8b521c]">Study Log & Rating</span>
                </div>
                <ul className="text-xs space-y-1 text-[#132A2A]/80 font-mono">
                  <li>_id: ObjectId (PK)</li>
                  <li className="text-[#245B52] font-bold">userId: ObjectId (Ref users)</li>
                  <li>goalId: ObjectId (Opt Ref)</li>
                  <li>durationMinutes: Number</li>
                  <li>date: Date (Indexed)</li>
                  <li>understandingRating: 1..5</li>
                  <li className="text-[#8b521c] font-bold">needsRevision: Boolean</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Aggregation Code Showcase - Deep Forest (#132A2A) Dark Panel */}
          <div className="bg-[#132A2A] rounded-3xl p-6 sm:p-8 text-[#FAF7F0] shadow-xl overflow-hidden border border-[#245B52]/40">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#245B52]/40">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-[#B7D6A5]" />
                <h3 className="text-sm font-bold text-[#FAF7F0]">MongoDB Aggregation: Weekly Study Consistency</h3>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#245B52] text-[#B7D6A5] font-mono font-bold border border-[#B7D6A5]/40">
                StudySession.aggregate([ ... ])
              </span>
            </div>

            <pre className="text-xs font-mono text-[#B7D6A5] overflow-x-auto leading-relaxed">
{`// 7-Day Consistency & Daily Study Minutes Grouping Pipeline
StudySession.aggregate([
  {
    $match: {
      userId: ObjectId("..."),
      date: { $gte: ISODate("2026-10-19T00:00:00.000Z") }
    }
  },
  {
    $group: {
      _id: {
        $dateToString: { format: "%Y-%m-%d", date: "$date" }
      },
      minutes: { $sum: "$durationMinutes" },
      sessionCount: { $sum: 1 }
    }
  },
  { $sort: { _id: 1 } }
])`}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
