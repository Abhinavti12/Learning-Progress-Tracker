import React, { useState, useEffect } from 'react';
import api from '../api/client';
import {
  Clock,
  Calendar,
  Search,
  Filter,
  Plus,
  Star,
  RotateCcw,
  BookOpen,
  Edit2,
  Trash2,
  RefreshCw
} from 'lucide-react';

const SessionsPage = ({ onOpenLogSessionModal, onEditSession }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRating, setSelectedRating] = useState('All');
  const [onlyRevision, setOnlyRevision] = useState(false);
  const [error, setError] = useState('');

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (selectedRating !== 'All') params.rating = selectedRating;
      if (onlyRevision) params.needsRevision = 'true';

      const res = await api.get('/sessions', { params });
      if (res.data.success) {
        setSessions(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load study sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSessions();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, selectedRating, onlyRevision]);

  const handleToggleRevision = async (sessionId) => {
    try {
      await api.patch(`/sessions/${sessionId}/revision`);
      fetchSessions();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle revision status');
    }
  };

  const handleDeleteSession = async (sessionId) => {
    if (window.confirm('Delete this study session record?')) {
      try {
        await api.delete(`/sessions/${sessionId}`);
        fetchSessions();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete session');
      }
    }
  };

  const totalMinutes = sessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
  const totalHours = Math.round((totalMinutes / 60) * 10) / 10;
  const avgRating = sessions.length > 0
    ? Math.round((sessions.reduce((acc, s) => acc + s.understandingRating, 0) / sessions.length) * 10) / 10
    : 0;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#132A2A]">
            Study Sessions Log
          </h1>
          <p className="text-sm text-[#132A2A]/70 mt-1">
            Log time spent studying, record takeaways, and rate your understanding.
          </p>
        </div>
        <button
          onClick={onOpenLogSessionModal}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 bg-[#245B52] hover:bg-[#1b4740] text-white text-xs font-bold rounded-xl shadow-sm transition active:scale-95"
        >
          <Plus className="w-4 h-4 text-[#B7D6A5]" />
          <span>Record Study Session</span>
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-3xl bg-white/95 border border-[#DDD1B8] shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs text-[#132A2A]/60 font-bold uppercase tracking-wider">Total Study Logged</p>
            <p className="text-2xl font-black text-[#132A2A] mt-0.5">{totalHours} hrs</p>
          </div>
          <div className="p-3 rounded-2xl bg-[#245B52]/10 text-[#245B52]">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white/95 border border-[#DDD1B8] shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs text-[#132A2A]/60 font-bold uppercase tracking-wider">Recorded Sessions</p>
            <p className="text-2xl font-black text-[#132A2A] mt-0.5">{sessions.length}</p>
          </div>
          <div className="p-3 rounded-2xl bg-[#B7D6A5]/30 text-[#245B52]">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white/95 border border-[#DDD1B8] shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs text-[#132A2A]/60 font-bold uppercase tracking-wider">Avg Understanding</p>
            <p className="text-2xl font-black text-[#132A2A] mt-0.5">{avgRating} / 5</p>
          </div>
          <div className="p-3 rounded-2xl bg-[#E6A66A]/20 text-[#8b521c]">
            <Star className="w-5 h-5 fill-[#E6A66A] text-[#E6A66A]" />
          </div>
        </div>
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
              placeholder="Search by topic studied or notes..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-[#DDD1B8] focus:outline-none focus:ring-2 focus:ring-[#245B52]/20 focus:border-[#245B52] transition bg-[#FAF7F0]/60"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedRating}
              onChange={(e) => setSelectedRating(e.target.value)}
              className="px-3 py-2 text-sm rounded-xl border border-[#DDD1B8] focus:outline-none focus:ring-2 focus:ring-[#245B52]/20 focus:border-[#245B52] bg-white transition text-[#132A2A] font-medium"
            >
              <option value="All">All Understanding Ratings</option>
              <option value="5">⭐⭐⭐⭐⭐ (5 - Mastered)</option>
              <option value="4">⭐⭐⭐⭐ (4 - Confident)</option>
              <option value="3">⭐⭐⭐ (3 - Moderate)</option>
              <option value="2">⭐⭐ (2 - Weak)</option>
              <option value="1">⭐ (1 - Confused)</option>
            </select>

            <button
              onClick={() => setOnlyRevision(!onlyRevision)}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border transition ${
                onlyRevision
                  ? 'bg-[#E6A66A] text-[#132A2A] border-[#8b521c]/40 shadow-2xs font-extrabold'
                  : 'bg-white text-[#132A2A]/70 border-[#DDD1B8] hover:bg-[#FAF7F0]'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#8b521c]" />
              <span>Needs Revision Only</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sessions Timeline Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-8 h-8 text-[#245B52] animate-spin" />
        </div>
      ) : error ? (
        <div className="p-6 bg-[#fdf4ec] border border-[#E6A66A] text-[#8b521c] rounded-3xl text-center text-sm font-semibold">
          {error}
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-16 bg-white/95 rounded-3xl border border-dashed border-[#DDD1B8] p-8">
          <Clock className="w-14 h-14 text-[#132A2A]/20 mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#132A2A]">No study sessions found</h3>
          <p className="text-xs text-[#132A2A]/60 mt-1 max-w-sm mx-auto">
            {search || selectedRating !== 'All' || onlyRevision
              ? 'Try adjusting your filters.'
              : 'Start logging your study hours, topics, and personal notes.'}
          </p>
          <button
            onClick={onOpenLogSessionModal}
            className="mt-5 px-5 py-2.5 bg-[#245B52] text-white rounded-xl text-xs font-bold hover:bg-[#1b4740] shadow-sm transition"
          >
            Record Study Session
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((s) => (
            <div
              key={s._id}
              className={`p-5 rounded-3xl border transition-all ${
                s.needsRevision
                  ? 'border-[#E6A66A] bg-[#fdf4ec] shadow-2xs'
                  : 'bg-white/95 border-[#DDD1B8] hover:border-[#245B52] shadow-2xs'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-[#245B52]/10 text-[#245B52] border border-[#245B52]/20 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {s.durationMinutes} min ({Math.round((s.durationMinutes / 60) * 10) / 10} hrs)
                    </span>

                    {s.goalId?.title && (
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#E5DCBE]/40 text-[#132A2A]">
                        {s.goalId.title} ({s.goalId.category})
                      </span>
                    )}

                    {s.needsRevision && (
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#E6A66A]/20 text-[#8b521c] border border-[#E6A66A] flex items-center gap-1">
                        <RotateCcw className="w-3 h-3 text-[#E6A66A]" /> Needs Revision
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-[#132A2A] mt-1">{s.topicStudied}</h3>

                  {s.notes && (
                    <p className="text-xs text-[#132A2A]/80 whitespace-pre-line leading-relaxed pt-1 bg-[#FAF7F0] p-3 rounded-2xl border border-[#DDD1B8]/40">
                      {s.notes}
                    </p>
                  )}

                  <p className="text-[11px] text-[#132A2A]/50 pt-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-[#245B52]" />
                    Studied on {new Date(s.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                {/* Rating & Actions */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-none border-[#DDD1B8]/40">
                  <div className="flex items-center gap-1">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= s.understandingRating
                              ? 'text-[#E6A66A] fill-[#E6A66A]'
                              : 'text-[#DDD1B8]'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-[#132A2A] ml-1">
                      {s.understandingRating}/5
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleRevision(s._id)}
                      title={s.needsRevision ? 'Mark as Revised' : 'Flag for Revision'}
                      className={`p-1.5 rounded-xl border text-xs transition flex items-center gap-1 font-bold ${
                        s.needsRevision
                          ? 'border-[#B7D6A5] text-[#245B52] bg-[#B7D6A5]/30 hover:bg-[#B7D6A5]/50'
                          : 'border-[#E6A66A] text-[#8b521c] bg-[#E6A66A]/15 hover:bg-[#E6A66A]/30'
                      }`}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span className="text-[11px]">
                        {s.needsRevision ? 'Resolved' : 'Revise'}
                      </span>
                    </button>
                    <button
                      onClick={() => onEditSession(s)}
                      className="p-1.5 rounded-lg text-[#132A2A]/40 hover:text-[#132A2A] hover:bg-[#FAF7F0] transition"
                      title="Edit Session"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteSession(s._id)}
                      className="p-1.5 rounded-lg text-[#132A2A]/40 hover:text-[#8b521c] hover:bg-[#E6A66A]/20 transition"
                      title="Delete Session"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SessionsPage;
