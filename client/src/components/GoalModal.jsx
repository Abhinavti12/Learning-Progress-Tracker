import React, { useState, useEffect } from 'react';
import { X, Calendar, Tag, FileText, Target } from 'lucide-react';

const GOAL_CATEGORIES = [
  'C Programming',
  'DBMS & SQL',
  'Machine Learning',
  'Data Structures & Algorithms',
  'Web Development',
  'System Design',
  'Operating Systems',
  'Computer Networks',
  'General Learning'
];

const GoalModal = ({ isOpen, onClose, onSave, goal = null }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('C Programming');
  const [customCategory, setCustomCategory] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [status, setStatus] = useState('Not Started');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (goal) {
      setTitle(goal.title || '');
      setDescription(goal.description || '');
      if (GOAL_CATEGORIES.includes(goal.category)) {
        setCategory(goal.category);
        setCustomCategory('');
      } else {
        setCategory('Custom');
        setCustomCategory(goal.category || '');
      }
      setTargetDate(goal.targetDate ? goal.targetDate.substring(0, 10) : '');
      setStatus(goal.status || 'Not Started');
    } else {
      setTitle('');
      setDescription('');
      setCategory('C Programming');
      setCustomCategory('');
      setTargetDate('');
      setStatus('Not Started');
    }
    setError('');
  }, [goal, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Goal title is required');
      return;
    }

    const finalCategory = category === 'Custom' ? (customCategory.trim() || 'General') : category;

    try {
      setSubmitting(true);
      setError('');
      await onSave({
        title: title.trim(),
        description: description.trim(),
        category: finalCategory,
        targetDate: targetDate || null,
        status
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save goal');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-parchment-border">
        <div className="flex items-center justify-between px-6 py-4 border-b border-parchment-border bg-parchment-light/60">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-botanical/10 text-botanical">
              <Target className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-forest">
              {goal ? 'Edit Learning Goal' : 'Set New Learning Goal'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-forest/50 hover:text-forest hover:bg-parchment transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-forest/80 mb-1">
              Goal Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Master C Programming & Dynamic Memory"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-parchment-border text-forest focus:outline-none focus:ring-2 focus:ring-botanical/20 focus:border-botanical transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-forest/80 mb-1 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-forest/50" /> Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-parchment-border text-forest focus:outline-none focus:ring-2 focus:ring-botanical/20 focus:border-botanical bg-white transition"
              >
                {GOAL_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="Custom">+ Custom Category</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-forest/80 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-forest/50" /> Target Date
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-parchment-border text-forest focus:outline-none focus:ring-2 focus:ring-botanical/20 focus:border-botanical transition"
              />
            </div>
          </div>

          {category === 'Custom' && (
            <div>
              <label className="block text-xs font-semibold text-forest/80 mb-1">Custom Category Name</label>
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="Enter subject / category"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-parchment-border text-forest focus:outline-none focus:ring-2 focus:ring-botanical/20 focus:border-botanical transition"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-forest/80 mb-1">
              Current Status
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['Not Started', 'In Progress', 'Completed'].map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`py-2 text-xs font-medium rounded-xl border transition ${
                    status === s
                      ? 'border-botanical bg-botanical text-white font-bold shadow-sm'
                      : 'border-parchment-border text-forest/70 hover:bg-parchment-light'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-forest/80 mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-forest/50" /> Learning Objectives & Scope
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What specific skills, concepts, or projects will you master in this goal?"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-parchment-border text-forest focus:outline-none focus:ring-2 focus:ring-botanical/20 focus:border-botanical transition resize-none"
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
              {submitting ? 'Saving...' : goal ? 'Update Goal' : 'Set Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GoalModal;
