import React, { useState, useEffect } from 'react';
import api from '../api/client';
import {
  RotateCcw,
  Star,
  CheckCircle2,
  AlertTriangle,
  Clock,
  BookOpen,
  Calendar,
  Sparkles,
  RefreshCw
} from 'lucide-react';

const RevisionPage = ({ onOpenLogSessionForTopic }) => {
  const [revisionList, setRevisionList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState('All');
  const [error, setError] = useState('');

  const fetchRevisionList = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/sessions', {
        params: {
          needsRevision: 'true',
          rating: filterRating !== 'All' ? filterRating : undefined
        }
      });
      if (res.data.success) {
        setRevisionList(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load revision queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevisionList();
  }, [filterRating]);

  const handleResolveRevision = async (sessionId) => {
    try {
      await api.patch(`/sessions/${sessionId}/revision`);
      fetchRevisionList();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update revision status');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#132A2A] flex items-center gap-2">
            <RotateCcw className="w-6 h-6 text-[#8b521c]" />
            <span>Self-Assessment & Revision Center</span>
          </h1>
          <p className="text-sm text-[#132A2A]/70 mt-1">
            Identify difficult subjects, review low-confidence topics, and schedule targeted revision sessions.
          </p>
        </div>
      </div>

      {/* Attention & Active Recall Banner (Copper Amber & Sage Mint) */}
      <div className="bg-[#fdf4ec] border border-[#E6A66A] rounded-3xl p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-white text-[#8b521c] border border-[#E6A66A]/40 shrink-0 shadow-2xs">
            <Sparkles className="w-6 h-6 text-[#E6A66A]" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-[#132A2A]">
              Active Recall & Revision Tracking
            </h2>
            <p className="text-xs text-[#132A2A]/70 leading-relaxed max-w-2xl">
              Topics rated <strong>1 or 2 stars</strong> during study sessions are automatically flagged
              here with <strong>Copper Amber</strong> indicators. Once you revisit the material and master
              it through active recall, mark the topic as resolved or log a follow-up session.
            </p>
          </div>
        </div>
      </div>

      {/* Rating Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'All', label: `All Revision Topics (${revisionList.length})` },
          { id: '1', label: '⭐ Rating 1 (Confused)' },
          { id: '2', label: '⭐⭐ Rating 2 (Weak)' },
          { id: '3', label: '⭐⭐⭐ Rating 3 (Moderate)' }
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilterRating(f.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              filterRating === f.id
                ? 'bg-[#E6A66A] text-[#132A2A] shadow-xs border border-[#8b521c]/30 font-extrabold'
                : 'bg-white/95 text-[#132A2A]/70 border border-[#DDD1B8] hover:bg-[#FAF7F0]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Revision Items */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-8 h-8 text-[#245B52] animate-spin" />
        </div>
      ) : error ? (
        <div className="p-6 bg-[#fdf4ec] border border-[#E6A66A] text-[#8b521c] rounded-3xl text-center text-sm font-semibold">
          {error}
        </div>
      ) : revisionList.length === 0 ? (
        <div className="text-center py-16 bg-white/95 rounded-3xl border border-dashed border-[#DDD1B8] p-8">
          <CheckCircle2 className="w-14 h-14 text-[#245B52] mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#132A2A]">Your revision queue is clear!</h3>
          <p className="text-xs text-[#132A2A]/60 mt-1 max-w-sm mx-auto">
            You currently have no topics flagged for revision. Keep recording your study sessions and rating your understanding accurately.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {revisionList.map((item) => (
            <div
              key={item._id}
              className="bg-white/95 rounded-3xl border border-[#E6A66A]/50 shadow-2xs p-6 flex flex-col justify-between hover:shadow-md transition group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-[#fdf4ec] text-[#8b521c] border border-[#E6A66A] flex items-center gap-1">
                    <RotateCcw className="w-3 h-3 text-[#E6A66A]" /> Needs Revision
                  </span>

                  {item.goalId?.title && (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#245B52]/10 text-[#245B52] border border-[#245B52]/20 truncate max-w-[180px]">
                      {item.goalId.title}
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-[#132A2A] group-hover:text-[#8b521c] transition">
                  {item.topicStudied}
                </h3>

                {item.notes ? (
                  <p className="text-xs text-[#132A2A]/80 bg-[#FAF7F0] p-3 rounded-2xl border border-[#DDD1B8]/60 whitespace-pre-line leading-relaxed">
                    "{item.notes}"
                  </p>
                ) : (
                  <p className="text-xs text-[#132A2A]/40 italic">No study notes recorded.</p>
                )}

                <div className="flex items-center justify-between text-xs text-[#132A2A]/60 pt-2 border-t border-[#DDD1B8]/50">
                  <span className="flex items-center gap-1 text-[11px]">
                    <Calendar className="w-3.5 h-3.5 text-[#245B52]" />
                    Last studied: {new Date(item.date).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-1">
                    <span className="text-[11px] font-semibold text-[#132A2A]/50">Understanding:</span>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= item.understandingRating
                              ? 'text-[#E6A66A] fill-[#E6A66A]'
                              : 'text-[#DDD1B8]'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Botanical Green & Sage Mint */}
              <div className="mt-5 pt-4 border-t border-[#DDD1B8]/50 flex items-center justify-between gap-2">
                <button
                  onClick={() => onOpenLogSessionForTopic(item)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#245B52] hover:bg-[#1b4740] rounded-xl transition shadow-2xs"
                >
                  <Clock className="w-3.5 h-3.5 text-[#B7D6A5]" />
                  <span>Log Revision Study</span>
                </button>

                <button
                  onClick={() => handleResolveRevision(item._id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#245B52] bg-[#B7D6A5]/30 hover:bg-[#B7D6A5]/50 border border-[#B7D6A5] rounded-xl transition shadow-2xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#245B52]" />
                  <span>Mark Resolved</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RevisionPage;
