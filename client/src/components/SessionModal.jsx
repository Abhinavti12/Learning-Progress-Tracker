import React, { useState, useEffect } from 'react';
import {
  X,
  Clock,
  Calendar,
  BookOpen,
  Star,
  AlertCircle,
  FileText,
  RotateCcw
} from 'lucide-react';
import api from '../api/client';

const DURATION_PRESETS = [25, 45, 60, 90, 120];

const RATING_DESCRIPTIONS = {
  1: 'Confused / Needs major help',
  2: 'Weak understanding / Flagged for revision',
  3: 'Moderate grasp / Some doubts',
  4: 'Good understanding / Confident',
  5: 'Mastered / Fully grasped'
};

const SessionModal = ({
  isOpen,
  onClose,
  onSave,
  session = null,
  preselectedGoalId = null
}) => {
  const [topicStudied, setTopicStudied] = useState('');
  const [goalId, setGoalId] = useState('');
  const [goalsList, setGoalsList] = useState([]);
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [understandingRating, setUnderstandingRating] = useState(3);
  const [needsRevision, setNeedsRevision] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Fetch user goals for dropdown
    const fetchGoals = async () => {
      try {
        const res = await api.get('/goals');
        if (res.data.success) {
          setGoalsList(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching goals for session modal:', err);
      }
    };

    if (isOpen) {
      fetchGoals();
    }
  }, [isOpen]);

  useEffect(() => {
    if (session) {
      setTopicStudied(session.topicStudied || '');
      setGoalId(session.goalId?._id || session.goalId || '');
      setDurationMinutes(session.durationMinutes || 45);
      setDate(session.date ? session.date.substring(0, 10) : '');
      setNotes(session.notes || '');
      setUnderstandingRating(session.understandingRating || 3);
      setNeedsRevision(Boolean(session.needsRevision));
    } else {
      setTopicStudied('');
      setGoalId(preselectedGoalId || '');
      setDurationMinutes(45);
      setDate(new Date().toISOString().substring(0, 10));
      setNotes('');
      setUnderstandingRating(3);
      setNeedsRevision(false);
    }
    setError('');
  }, [session, preselectedGoalId, isOpen]);

  if (!isOpen) return null;

  const handleRatingChange = (rating) => {
    setUnderstandingRating(rating);
    // Auto-flag for revision if rating is 1 or 2
    if (rating <= 2) {
      setNeedsRevision(true);
    } else {
      setNeedsRevision(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!topicStudied.trim()) {
      setError('Topic studied is required');
      return;
    }

    if (!durationMinutes || durationMinutes < 1) {
      setError('Duration must be at least 1 minute');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await onSave({
        topicStudied: topicStudied.trim(),
        goalId: goalId || null,
        durationMinutes: Number(durationMinutes),
        date: date || new Date().toISOString(),
        notes: notes.trim(),
        understandingRating: Number(understandingRating),
        needsRevision
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to record study session');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-parchment-border max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-parchment-border bg-parchment-light/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-botanical/10 text-botanical">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-forest">
                {session ? 'Edit Study Session' : 'Record Study Session'}
              </h2>
              <p className="text-xs text-forest/60">Log time, notes, and topic self-assessment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-forest/50 hover:text-forest hover:bg-parchment transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Topic Studied */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-forest/80 mb-1">
              Topic Studied *
            </label>
            <input
              type="text"
              required
              value={topicStudied}
              onChange={(e) => setTopicStudied(e.target.value)}
              placeholder="e.g. B-Tree Page Splits & Concurrency Control"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-parchment-border text-forest focus:outline-none focus:ring-2 focus:ring-botanical/20 focus:border-botanical transition"
            />
          </div>

          {/* Linked Goal Dropdown */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-forest/80 mb-1 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-forest/50" /> Linked Learning Goal (Optional)
            </label>
            <select
              value={goalId}
              onChange={(e) => setGoalId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-parchment-border text-forest focus:outline-none focus:ring-2 focus:ring-botanical/20 focus:border-botanical bg-white transition"
            >
              <option value="">-- No Specific Goal (Independent Study) --</option>
              {goalsList.map((g) => (
                <option key={g._id} value={g._id}>
                  {g.title} ({g.category})
                </option>
              ))}
            </select>
          </div>

          {/* Duration & Presets */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-forest/80 mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-forest/50" /> Duration (Minutes) *
            </label>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="number"
                min="1"
                max="1440"
                required
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                className="w-28 px-3 py-2 text-sm rounded-xl border border-parchment-border text-forest focus:outline-none focus:ring-2 focus:ring-botanical/20 focus:border-botanical font-semibold"
              />
              <span className="text-xs text-forest/60 font-medium">
                ({Math.round((durationMinutes / 60) * 10) / 10} hours)
              </span>
            </div>
            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {DURATION_PRESETS.map((m) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setDurationMinutes(m)}
                  className={`px-2.5 py-1 text-xs rounded-lg border transition ${
                    Number(durationMinutes) === m
                      ? 'bg-botanical text-white border-botanical font-bold shadow-sm'
                      : 'bg-parchment-light text-forest/70 border-parchment-border hover:bg-parchment'
                  }`}
                >
                  {m === 25 ? '25m (Pomodoro)' : `${m}m`}
                </button>
              ))}
            </div>
          </div>

          {/* Session Date */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-forest/80 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-forest/50" /> Study Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-parchment-border text-forest focus:outline-none focus:ring-2 focus:ring-botanical/20 focus:border-botanical transition"
            />
          </div>

          {/* Self-Assessment Understanding Rating (1-5 Stars) */}
          <div className="p-4 rounded-2xl border border-parchment-border bg-parchment-light/50 space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-forest flex items-center justify-between">
              <span>Self-Assessment Understanding</span>
              <span className="text-copper font-bold">{understandingRating} / 5</span>
            </label>

            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => handleRatingChange(star)}
                  className="p-1 text-parchment-dark hover:text-copper focus:outline-none transition active:scale-125"
                >
                  <Star
                    className={`w-7 h-7 transition-colors ${
                      star <= understandingRating
                        ? 'text-copper fill-copper'
                        : 'text-parchment-dark'
                    }`}
                  />
                </button>
              ))}
            </div>

            <p className="text-xs text-forest/70 font-medium">
              {RATING_DESCRIPTIONS[understandingRating]}
            </p>

            {/* Needs Revision Checkbox */}
            <div className="pt-2 border-t border-parchment-border flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-semibold text-forest cursor-pointer">
                <input
                  type="checkbox"
                  checked={needsRevision}
                  onChange={(e) => setNeedsRevision(e.target.checked)}
                  className="w-4 h-4 text-botanical rounded border-parchment-border focus:ring-botanical"
                />
                <span className="flex items-center gap-1 text-copper-dark font-semibold">
                  <RotateCcw className="w-3.5 h-3.5" /> Flag this topic for revision
                </span>
              </label>
              {needsRevision && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-copper/15 text-copper-dark border border-copper/30 font-semibold">
                  Revision Queued
                </span>
              )}
            </div>
          </div>

          {/* Personal Notes */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-forest/80 mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-forest/50" /> Personal Notes & Key Takeaways
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What formulas, syntax, or concepts did you learn? Any doubts to revisit?"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-parchment-border text-forest focus:outline-none focus:ring-2 focus:ring-botanical/20 focus:border-botanical transition resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-parchment-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-forest/70 hover:text-forest hover:bg-parchment-dark/30 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-sm font-medium text-white bg-botanical hover:bg-botanical-hover rounded-xl transition shadow-sm disabled:opacity-50"
            >
              {submitting ? 'Recording...' : session ? 'Update Session' : 'Save Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SessionModal;
