import React, { useState } from 'react';
import {
  X,
  UserPlus,
  User,
  GraduationCap,
  Check,
  Sparkles,
  Link,
  Copy,
  Bot,
  Users,
} from 'lucide-react';

const PRESET_AVATARS = [
  { id: 'av-1', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces', label: 'Sneha' },
  { id: 'av-2', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces', label: 'Aarav' },
  { id: 'av-3', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop&crop=faces', label: 'Riya' },
  { id: 'av-4', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces', label: 'Kabir' },
  { id: 'av-5', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop&crop=faces', label: 'Rohan' },
  { id: 'av-6', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=faces', label: 'Pooja' },
];

export default function AddStudentModal({
  isOpen,
  onClose,
  onAddStudent,
  onResetSeatsToAI,
  inviteCode = 'GD-741-KLP',
}) {
  const [activeTab, setActiveTab] = useState('invite'); // 'invite' | 'manual'
  const [name, setName] = useState('');
  const [college, setCollege] = useState('');
  const [selectedSeat, setSelectedSeat] = useState('rohan'); // 'rohan' | 'ananya' | 'vikram'
  const [selectedAvatar, setSelectedAvatar] = useState(PRESET_AVATARS[0].url);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const roomLink = typeof window !== 'undefined' ? `${window.location.origin}/?room=${inviteCode}` : `http://localhost:3000/?room=${inviteCode}`;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText?.(roomLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleAddFriend = (e) => {
    e?.preventDefault?.();
    const finalName = name.trim() || 'College Friend';
    onAddStudent?.({
      targetSeatId: selectedSeat,
      name: finalName,
      college: college.trim() || 'Campus Student',
      avatar: selectedAvatar,
      isRealFriend: true,
    });
    setName('');
    setCollege('');
    onClose?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-lg bg-[#111726] border border-white/15 backdrop-blur-2xl rounded-3xl p-6 sm:p-7 shadow-2xl text-white space-y-5 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">
                Add Friend or Use AI Avatars
              </h2>
              <p className="text-[11px] text-slate-400">
                Apne college friend ko invite karein ya AI avatars ke sath practice karein!
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

        {/* Tab Selector: Invite Link vs Add Profile */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-950 border border-white/10">
          <button
            onClick={() => setActiveTab('invite')}
            className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'invite'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Link className="w-3.5 h-3.5" />
            <span>Invite Friend via Link</span>
          </button>

          <button
            onClick={() => setActiveTab('manual')}
            className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'manual'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Friend Profile</span>
          </button>
        </div>

        {/* ── TAB 1: INVITE VIA LINK ── */}
        {activeTab === 'invite' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-blue-950/25 border border-blue-500/30 space-y-2">
              <span className="text-xs font-bold text-cyan-300 block">
                Direct Room Invite Link:
              </span>
              <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-900 border border-white/15">
                <span className="text-xs font-mono text-slate-300 truncate max-w-[280px]">
                  {roomLink}
                </span>
                <button
                  onClick={handleCopyLink}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                    copiedLink
                      ? 'bg-emerald-600 text-white'
                      : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm'
                  }`}
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Ye link apne friend ke sath share karein. Jab wo join karenge, wo direct aapke round table me connect ho jayenge!
              </p>
            </div>

            {/* AI Avatar Fallback Notice */}
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 flex items-start gap-3">
              <Bot className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-300 space-y-0.5">
                <strong className="text-white block font-bold">Koi Friend Available Nahi Hai?</strong>
                <span>
                  Koi baat nahi! AI Avatars (Rohan, Ananya, Vikram) 24/7 ready hain. Wo naturally aapke points par counter-arguments aur support karenge.
                </span>
              </div>
            </div>

            {onResetSeatsToAI && (
              <button
                onClick={() => {
                  onResetSeatsToAI?.();
                  onClose?.();
                }}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Bot className="w-4 h-4 text-cyan-400" />
                <span>Reset All Seats to AI Avatars (Sabhi Seats AI Karen)</span>
              </button>
            )}
          </div>
        )}

        {/* ── TAB 2: MANUAL FRIEND PROFILE ── */}
        {activeTab === 'manual' && (
          <form onSubmit={handleAddFriend} className="space-y-3.5">
            {/* Friend Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Friend&apos;s Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Priya Sharma / Aarav"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* College */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">College / Institute</label>
              <input
                type="text"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                placeholder="e.g. Delhi University / VIT"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* Which Seat to Replace */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Choose Seat to Take</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'rohan', label: 'Seat 2 (Rohan)' },
                  { id: 'ananya', label: 'Seat 3 (Ananya)' },
                  { id: 'vikram', label: 'Seat 4 (Vikram)' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedSeat(s.id)}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      selectedSeat === s.id
                        ? 'bg-purple-600/30 border-purple-400 text-purple-300 shadow-sm'
                        : 'bg-slate-900 border-white/10 text-slate-400'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Avatar Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Choose Photo</label>
              <div className="flex items-center gap-2 overflow-x-auto py-1">
                {PRESET_AVATARS.map((av) => (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => setSelectedAvatar(av.url)}
                    className={`w-10 h-10 rounded-full overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                      selectedAvatar === av.url
                        ? 'border-cyan-400 scale-110 shadow-md shadow-cyan-500/30'
                        : 'border-white/20 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={av.url} alt={av.label} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/25 transition-all cursor-pointer"
              >
                + Connect Friend to Seat
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
