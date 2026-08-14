import React, { useState, useEffect } from 'react';
import { Megaphone, Plus, Send, X, Calendar, User, Tag, HelpCircle, ShieldAlert } from 'lucide-react';
import { getAnnouncements, createAnnouncement } from '../../api/api';

export const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // New Announcement form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Policy');
  const [sender, setSender] = useState('HR Operations');

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const data = await getAnnouncements();
      if (data.success) {
        setAnnouncements(data.data);
      }
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content) return;

    try {
      const data = await createAnnouncement({
        title,
        content,
        category,
        sender
      });
      if (data.success) {
        setAnnouncements(prev => [data.data, ...prev]);
        setShowForm(false);
        setTitle('');
        setContent('');
        setCategory('Policy');
        setSender('HR Operations');
      } else {
        alert(data.error || 'Failed to post announcement.');
      }
    } catch (err) {
      alert('Error posting announcement.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">Bulletin Board</h1>
          <p className="text-sm font-semibold text-slate-500">
            Broadcast official policy updates, holiday rosters, and system security alerts.
          </p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-500 shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="h-4.5 w-4.5" />
          Broadcast Notice
        </button>
      </div>

      {/* Grid listing */}
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <span className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></span>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {announcements.length === 0 ? (
            <div className="col-span-full py-16 text-center text-slate-400 border border-dashed border-slate-200 rounded-2xl bg-white flex flex-col items-center justify-center gap-3">
              <Megaphone className="h-8 w-8 text-slate-300" />
              <p className="font-semibold text-xs">No active notices broadcasted on bulletin board.</p>
            </div>
          ) : (
            announcements.map(item => (
              <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 hover:shadow-md transition">
                <div className="flex items-start justify-between">
                  <span className={`rounded-full px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wider ${
                    item.category === 'Urgent' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                    item.category === 'Holiday' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                    'bg-indigo-50 text-indigo-700 border border-indigo-100'
                  }`}>
                    {item.category} Notice
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold font-mono">{item.id}</span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-extrabold text-slate-900 text-base leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                    {item.content}
                  </p>
                </div>

                {/* Sender/Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-[10px] font-bold text-slate-400">
                  <span className="flex items-center gap-1">
                    <User className="h-3.5 w-3.5 text-slate-400" /> {item.sender}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" /> {item.date}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Broadcast Form Popup */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-950 flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-indigo-600" />
                Publish Bullet Notice
              </h3>
              <button 
                onClick={() => setShowForm(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Notice Title</label>
                <input 
                  type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Welcome to our New Smart EMS Portal"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid gap-4 grid-cols-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Category</label>
                  <select 
                    value={category} onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Policy">Policy</option>
                    <option value="Holiday">Holiday</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Publishing Desk</label>
                  <input 
                    type="text" required value={sender} onChange={(e) => setSender(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Broadcasting Content</label>
                <textarea 
                  required value={content} onChange={(e) => setContent(e.target.value)}
                  rows="4" placeholder="Write full bulletin content details here..."
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white hover:bg-indigo-500 shadow-md flex items-center gap-1.5"
                >
                  <Send className="h-4 w-4" /> Publish Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
