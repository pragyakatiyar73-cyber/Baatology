import React, { useState } from 'react';
import { X, UserPlus, User, GraduationCap, Check, Sparkles } from 'lucide-react';

const PRESET_AVATARS = [
  { id: 'av-1', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=faces', label: 'Sneha' },
  { id: 'av-2', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=faces', label: 'Aarav' },
  { id: 'av-3', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=faces', label: 'Riya' },
  { id: 'av-4', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=faces', label: 'Kabir' },
  { id: 'av-5', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=faces', label: 'Ananya' },
  { id: 'av-6', url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&h=150&fit=crop&crop=faces', label: 'Vikram' },
  { id: 'av-7', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=faces', label: 'Meera' },
  { id: 'av-8', url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=faces', label: 'Dev' },
];

const PRESET_ROLES = [
  'Peer Participant',
  'Peer Evaluator',
  "Devil's Advocate",
  'Technical Specialist',
  'Discussion Summarizer',
  'Supportive Contender',
];

export default function AddStudentModal({
  isOpen,
  onClose,
  onAddStudent,
  currentCount = 4,
}) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('Peer Participant');
  const [college, setCollege] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(PRESET_AVATARS[0].url);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    const finalName = name.trim() || `Student ${currentCount + 1}`;
    onAddStudent({
      id: `student-${Date.now()}`,
      name: finalName,
      role: role,
      college: college.trim() || 'Engineering College',
      avatar: selectedAvatar,
      isSpeaking: false,
      isLocalUser: false,
      speechSeconds: 15,
    });
    setName('');
    setCollege('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-md bg-[#131927] border border-white/15 backdrop-blur-2xl rounded-3xl p-6 sm:p-7 shadow-2xl text-white space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">
                Add Student to Roundtable
              </h2>
              <p className="text-[11px] text-slate-400">
                Connect a new peer to the 2D discussion circle
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Student Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-cyan-400" />
              <span>Student Name *</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rohan Sharma"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
            />
          </div>

          {/* Role & Discussion Stance */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Discussion Role</span>
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400 transition-colors"
            >
              {PRESET_ROLES.map((r) => (
                <option key={r} value={r} className="bg-slate-900 text-white">
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* College / Institution */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-teal-400" />
              <span>College / Branch (Optional)</span>
            </label>
            <input
              type="text"
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              placeholder="e.g. IIT Delhi - Computer Science"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
            />
          </div>

          {/* Avatar Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 block">
              Choose Avatar
            </label>
            <div className="grid grid-cols-4 gap-2.5">
              {PRESET_AVATARS.map((av) => {
                const isSelected = selectedAvatar === av.url;
                return (
                  <div
                    key={av.id}
                    onClick={() => setSelectedAvatar(av.url)}
                    className={`relative rounded-2xl overflow-hidden border-2 cursor-pointer transition-all aspect-square group ${
                      isSelected
                        ? 'border-cyan-400 ring-4 ring-cyan-500/40 scale-105 shadow-md shadow-cyan-500/30'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <img src={av.url} alt={av.label} className="w-full h-full object-cover" />
                    {isSelected && (
                      <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center text-[10px] font-black">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                    )}
                    <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[9px] text-center text-slate-200 py-0.5 font-medium">
                      {av.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-black tracking-wide shadow-lg shadow-cyan-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              Add to Roundtable
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
