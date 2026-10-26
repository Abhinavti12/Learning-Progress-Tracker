import React, { useState, useEffect } from 'react';
import { X, Calendar, Link, BookOpen, Layers } from 'lucide-react';

const ACTIVITY_TYPES = ['Lesson', 'Reading', 'Video', 'Practice', 'Project', 'Quiz'];

const ActivityModal = ({ isOpen, onClose, onSave, activity = null, goalTitle = '' }) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Lesson');
  const [resourceLink, setResourceLink] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (activity) {
      setTitle(activity.title || '');
      setType(activity.type || 'Lesson');
      setResourceLink(activity.resourceLink || '');
      setDueDate(activity.dueDate ? activity.dueDate.substring(0, 10) : '');
    } else {
      setTitle('');
      setType('Lesson');
      setResourceLink('');
      setDueDate('');
    }
    setError('');
  }, [activity, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Activity title is required');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await onSave({
        title: title.trim(),
        type,
        resourceLink: resourceLink.trim(),
        dueDate: dueDate || null
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save activity');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-parchment-border">
        <div className="flex items-center justify-between px-6 py-4 border-b border-parchment-border bg-parchment-light/60">
          <div>
            <h2 className="text-lg font-bold text-forest">
              {activity ? 'Edit Learning Activity' : 'Add Learning Activity'}
            </h2>
            {goalTitle && (
              <p className="text-xs text-forest/70 truncate max-w-xs">
                Under Goal: <strong className="text-forest">{goalTitle}</strong>
              </p>
            )}
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
              Activity Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Implement B-Tree Node Insertion algorithm"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-parchment-border text-forest focus:outline-none focus:ring-2 focus:ring-botanical/20 focus:border-botanical transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-forest/80 mb-1 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-forest/50" /> Activity Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {ACTIVITY_TYPES.map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setType(t)}
                  className={`py-2 text-xs font-medium rounded-xl border transition ${
                    type === t
                      ? 'border-botanical bg-botanical text-white font-bold shadow-sm'
                      : 'border-parchment-border text-forest/70 hover:bg-parchment-light'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-forest/80 mb-1 flex items-center gap-1.5">
              <Link className="w-3.5 h-3.5 text-forest/50" /> Resource URL / Material Reference
            </label>
            <input
              type="url"
              value={resourceLink}
              onChange={(e) => setResourceLink(e.target.value)}
              placeholder="https://example.com/docs or chapter reference"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-parchment-border text-forest focus:outline-none focus:ring-2 focus:ring-botanical/20 focus:border-botanical transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-forest/80 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-forest/50" /> Planned Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-parchment-border text-forest focus:outline-none focus:ring-2 focus:ring-botanical/20 focus:border-botanical transition"
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
              {submitting ? 'Saving...' : activity ? 'Save Activity' : 'Add Activity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ActivityModal;
