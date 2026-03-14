import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, LogOut, BookOpen, Flame, Star, Sun, Moon, Camera, Check } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useTheme, THEMES } from '@/lib/ThemeContext';
import { UserProgress, UserGoal, Profile, AvatarStorage } from '@/api/supabase';
import { AvatarDisplay, PRESET_AVATARS } from '@/components/ui/Avatars';
import BottomNav from '@/components/navigation/BottomNav';
import DuoButton from '@/components/ui/DuoButton';

export default function ProfilePage() {
  const { user, signOut }  = useAuth();
  const { theme, setTheme } = useTheme();
  const T                   = THEMES[theme];
  const queryClient         = useQueryClient();
  const fileRef             = useRef(null);

  const [editing, setEditing]         = useState(false);
  const [nameInput, setNameInput]     = useState('');
  const [showAvatars, setShowAvatars] = useState(false);
  const [uploading, setUploading]     = useState(false);

  // Local avatar state (from profile or localStorage fallback)
  const [localAvatar, setLocalAvatar] = useState(() => ({
    id:  localStorage.getItem('avatar_id')  || '',
    url: localStorage.getItem('avatar_url') || '',
  }));

  const { data: progress = [] } = useQuery({
    queryKey: ['userProgress', user?.email],
    queryFn:  () => UserProgress.filter({ user_email: user.email }),
    enabled:  !!user?.email,
  });

  const { data: goals = [] } = useQuery({
    queryKey: ['userGoal', user?.email],
    queryFn:  () => UserGoal.filter({ user_email: user.email }),
    enabled:  !!user?.email,
  });

  const goal      = goals[0];
  const completed = progress.filter((p) => p.status === 'completed');
  const totalStars = completed.reduce((s, p) => s + (p.score || 0), 0);
  const initials   = (user?.full_name || user?.email || 'U')
    .split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

  const updateMut = useMutation({
    mutationFn: () => Profile.update(user.id, { full_name: nameInput.trim() }),
    onSuccess:  () => { queryClient.invalidateQueries(); setEditing(false); },
  });

  const selectPreset = (avatarId) => {
    setLocalAvatar({ id: avatarId, url: '' });
    localStorage.setItem('avatar_id',  avatarId);
    localStorage.setItem('avatar_url', '');
    setShowAvatars(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;
    setUploading(true);
    try {
      const url = await AvatarStorage.upload(user.id, file);
      setLocalAvatar({ id: '', url });
      localStorage.setItem('avatar_url', url);
      localStorage.setItem('avatar_id',  '');
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
      setShowAvatars(false);
    }
  };

  const stats = [
    { icon: BookOpen, label: 'Lessons',    value: goal?.total_lessons  || 0 },
    { icon: Flame,    label: 'Streak',      value: goal?.current_streak || 0 },
    { icon: Star,     label: 'Stars',       value: totalStars },
  ];

  const isNight = theme === 'night';

  return (
    <div className="min-h-screen transition-colors duration-500" style={{ backgroundColor: T.bg }}>
      <div className="max-w-lg mx-auto px-5 pt-12 pb-28">

        {/* ── Avatar + name ── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center py-8 gap-4">

          {/* Avatar */}
          <div className="relative">
            <div className="rounded-full overflow-hidden cursor-pointer"
              style={{ boxShadow: `0 6px 0 ${isNight ? '#060D18' : '#252611'}` }}
              onClick={() => setShowAvatars(true)}>
              <AvatarDisplay
                avatarId={localAvatar.id}
                avatarUrl={localAvatar.url}
                size={88}
                initials={initials}
              />
            </div>
            {/* Edit badge */}
            <button onClick={() => setShowAvatars(true)}
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: T.textPrimary, boxShadow: `0 2px 0 ${isNight ? '#000' : '#252611'}` }}>
              <Camera style={{ width: 14, height: 14, color: isNight ? '#0F1A2E' : '#F3F2EA' }} />
            </button>
          </div>

          {/* Name */}
          {editing ? (
            <div className="flex gap-2 w-full max-w-xs">
              <input value={nameInput} onChange={(e) => setNameInput(e.target.value)}
                className="flex-1 rounded-xl px-4 py-2 text-sm border focus:outline-none"
                style={{ backgroundColor: T.cardBg, color: T.textPrimary, borderColor: `${T.textPrimary}20` }}
                placeholder="Your name" />
              <button onClick={() => updateMut.mutate()} disabled={updateMut.isPending}
                className="px-4 rounded-xl text-sm font-medium"
                style={{ backgroundColor: T.textPrimary, color: isNight ? '#0F1A2E' : '#F3F2EA' }}>
                {updateMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
              </button>
              <button onClick={() => setEditing(false)} className="text-sm px-2" style={{ color: T.textMuted }}>
                ✕
              </button>
            </div>
          ) : (
            <div className="text-center">
              <button onClick={() => { setNameInput(user?.full_name || ''); setEditing(true); }}
                className="text-xl font-semibold hover:opacity-70 transition-opacity"
                style={{ color: T.textPrimary }}>
                {user?.full_name || 'Add your name'}
              </button>
              <p className="text-xs mt-1" style={{ color: T.textMuted }}>{user?.email}</p>
              {user?.role === 'admin' && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium mt-2 inline-block"
                  style={{ backgroundColor: T.textPrimary, color: isNight ? '#0F1A2E' : '#F3F2EA' }}>
                  Admin
                </span>
              )}
            </div>
          )}
        </motion.div>

        {/* ── Avatar picker panel ── */}
        <AnimatePresence>
          {showAvatars && (
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="rounded-2xl p-5 mb-6"
              style={{ backgroundColor: T.cardBg }}>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold" style={{ color: T.textPrimary }}>Choose Avatar</p>
                <button onClick={() => setShowAvatars(false)} style={{ color: T.textMuted }}>✕</button>
              </div>

              {/* Preset grid */}
              <div className="grid grid-cols-4 gap-3 mb-4">
                {PRESET_AVATARS.map((av) => (
                  <button key={av.id} onClick={() => selectPreset(av.id)}
                    className="flex flex-col items-center gap-1 p-2 rounded-xl transition-all"
                    style={{
                      backgroundColor: localAvatar.id === av.id
                        ? `${T.textPrimary}20` : 'transparent',
                      outline: localAvatar.id === av.id ? `2px solid ${T.textPrimary}` : 'none',
                    }}>
                    <AvatarDisplay avatarId={av.id} size={44} />
                    <span className="text-[9px] font-medium" style={{ color: T.textMuted }}>
                      {av.label}
                    </span>
                  </button>
                ))}
              </div>

              {/* Upload own photo */}
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={handleFileUpload} />
              <button onClick={() => fileRef.current?.click()} disabled={uploading}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border-2 border-dashed transition-all"
                style={{ borderColor: `${T.textPrimary}30`, color: T.textMuted }}>
                {uploading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>
                  : <><Camera className="w-4 h-4" /> Upload your photo</>
                }
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Stats ── */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {stats.map(({ icon: Icon, label, value }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="rounded-2xl p-4 flex flex-col items-center gap-2"
              style={{ backgroundColor: T.cardBg }}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${T.textPrimary}18` }}>
                <Icon style={{ width: 16, height: 16, color: T.textPrimary }} />
              </div>
              <p className="text-xl font-semibold" style={{ color: T.textPrimary }}>{value}</p>
              <p className="text-[10px] uppercase tracking-wider text-center" style={{ color: T.textMuted }}>{label}</p>
            </motion.div>
          ))}
        </div>

        {/* ── Day / Night theme toggle ── */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="rounded-2xl p-5 mb-6"
          style={{ backgroundColor: T.cardBg }}>
          <p className="text-[10px] font-semibold uppercase tracking-wider mb-4"
            style={{ color: T.textMuted }}>
            Theme
          </p>
          <div className="flex gap-3">
            {/* Day option */}
            <button onClick={() => setTheme('day')}
              className="flex-1 flex flex-col items-center gap-3 p-4 rounded-2xl transition-all"
              style={{
                backgroundColor: theme === 'day' ? 'rgba(65,67,35,0.12)' : 'transparent',
                border: theme === 'day' ? '2px solid #414323' : '2px solid transparent',
              }}>
              {/* Mini day scene */}
              <svg viewBox="0 0 80 50" className="w-20 h-12 rounded-xl overflow-hidden">
                <rect x="0" y="0" width="80" height="50" fill="#87CEEB"/>
                <rect x="0" y="30" width="80" height="20" fill="#ADB684"/>
                <circle cx="60" cy="12" r="10" fill="#FFE060"/>
                <ellipse cx="20" cy="22" rx="12" ry="7" fill="#fff" opacity="0.8"/>
                <ellipse cx="40" cy="18" rx="10" ry="6" fill="#fff" opacity="0.7"/>
                {/* Tree silhouette */}
                <rect x="35" y="25" width="4" height="15" fill="#414323"/>
                <ellipse cx="37" cy="22" rx="10" ry="8" fill="#5A6E35"/>
                <ellipse cx="30" cy="26" rx="7" ry="5" fill="#7A9148"/>
                <ellipse cx="44" cy="26" rx="7" ry="5" fill="#7A9148"/>
              </svg>
              <div className="flex items-center gap-1.5">
                <Sun style={{ width: 14, height: 14, color: '#7A5C20' }} />
                <span className="text-sm font-semibold" style={{ color: '#414323' }}>Day</span>
                {theme === 'day' && <Check style={{ width: 12, height: 12, color: '#414323' }} />}
              </div>
            </button>

            {/* Night option */}
            <button onClick={() => setTheme('night')}
              className="flex-1 flex flex-col items-center gap-3 p-4 rounded-2xl transition-all"
              style={{
                backgroundColor: theme === 'night' ? 'rgba(180,200,230,0.12)' : 'transparent',
                border: theme === 'night' ? '2px solid #4A7ABF' : '2px solid transparent',
              }}>
              {/* Mini night scene */}
              <svg viewBox="0 0 80 50" className="w-20 h-12 rounded-xl overflow-hidden">
                <rect x="0" y="0" width="80" height="50" fill="#0A1428"/>
                <rect x="0" y="32" width="80" height="18" fill="#060D18"/>
                {/* Stars */}
                {[[8,6],[25,10],[45,4],[62,8],[72,14],[15,18],[55,16]].map(([x,y],i) => (
                  <circle key={i} cx={x} cy={y} r={1} fill="#E8F0FF" opacity={0.8}/>
                ))}
                {/* Moon */}
                <circle cx="58" cy="14" r="9" fill="#E8F0FF"/>
                <circle cx="62" cy="11" r="7.5" fill="#0A1428"/>
                {/* Tree silhouette */}
                <rect x="35" y="25" width="4" height="16" fill="#060D18"/>
                <ellipse cx="37" cy="23" rx="10" ry="8" fill="#060D18"/>
                <ellipse cx="30" cy="27" rx="6" ry="4" fill="#0A1020"/>
                <ellipse cx="44" cy="27" rx="6" ry="4" fill="#0A1020"/>
                {/* Firefly */}
                <circle cx="20" cy="28" r="1.5" fill="#AEFF80" opacity="0.8"/>
                <circle cx="60" cy="35" r="1.5" fill="#AEFF80" opacity="0.6"/>
              </svg>
              <div className="flex items-center gap-1.5">
                <Moon style={{ width: 14, height: 14, color: '#4A7ABF' }} />
                <span className="text-sm font-semibold" style={{ color: T.textPrimary }}>Night</span>
                {theme === 'night' && <Check style={{ width: 12, height: 12, color: '#4A7ABF' }} />}
              </div>
            </button>
          </div>
        </motion.div>

        {/* ── Member since + achievements ── */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="space-y-4 mb-6">

          {/* Member since card */}
          <div className="rounded-2xl px-5 py-4 flex items-center gap-4"
            style={{ backgroundColor: T.cardBg }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${T.textPrimary}15` }}>
              {/* Sprout icon */}
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                <path d="M12 22V12" stroke={T.textPrimary} strokeWidth="2" strokeLinecap="round"/>
                <path d="M12 12C12 12 8 10 6 6C10 4 14 6 12 12Z" fill={T.textPrimary} opacity="0.8"/>
                <path d="M12 12C12 12 16 10 18 6C14 4 10 6 12 12Z" fill={T.textPrimary} opacity="0.5"/>
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-0.5"
                style={{ color: T.textMuted }}>Member since</p>
              <p className="text-sm font-semibold" style={{ color: T.textPrimary }}>
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                  : 'Early Explorer'}
              </p>
            </div>
          </div>

          {/* Achievements placeholder — badges coming soon */}
          <div className="rounded-2xl p-5" style={{ backgroundColor: T.cardBg }}>
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-4"
              style={{ color: T.textMuted }}>Achievements</p>

            {/* Earned badges based on progress */}
            <div className="flex flex-wrap gap-3">
              {/* First lesson badge */}
              {completed.length >= 1 && (
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: '#5A6E3520', border: '2px solid #5A6E3540' }}>
                    <svg viewBox="0 0 32 32" width="28" height="28">
                      <circle cx="16" cy="16" r="14" fill="#5A6E35" opacity="0.9"/>
                      <path d="M16 6 C16 6 10 10 10 16 C10 20 13 23 16 24 C19 23 22 20 22 16 C22 10 16 6 16 6Z"
                        fill="#ADB684"/>
                      <circle cx="16" cy="16" r="3" fill="#F3F2EA"/>
                    </svg>
                  </div>
                  <p className="text-[9px] font-semibold text-center" style={{ color: T.textMuted }}>First Leaf</p>
                </div>
              )}

              {/* 5 lessons badge */}
              {completed.length >= 5 && (
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: '#7A5C3020', border: '2px solid #7A5C3040' }}>
                    <svg viewBox="0 0 32 32" width="28" height="28">
                      <circle cx="16" cy="16" r="14" fill="#7A5C30" opacity="0.9"/>
                      {[0,72,144,216,288].map((a,i) => {
                        const r2 = (a-90)*Math.PI/180;
                        return <circle key={i} cx={16+Math.cos(r2)*8} cy={16+Math.sin(r2)*8} r="3" fill="#C8A06A"/>;
                      })}
                      <circle cx="16" cy="16" r="4" fill="#F3F2EA"/>
                    </svg>
                  </div>
                  <p className="text-[9px] font-semibold text-center" style={{ color: T.textMuted }}>Bookworm</p>
                </div>
              )}

              {/* 3-day streak badge */}
              {(goal?.current_streak || 0) >= 3 && (
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: '#B4530920', border: '2px solid #B4530940' }}>
                    <svg viewBox="0 0 32 32" width="28" height="28">
                      <circle cx="16" cy="16" r="14" fill="#B45309" opacity="0.9"/>
                      <path d="M16 6 C18 10 22 12 20 18 C18 22 14 23 12 20 C14 20 15 18 14 16 C13 14 11 14 11 14 C11 10 14 7 16 6Z"
                        fill="#FFD080"/>
                      <path d="M16 14 C17 16 16 19 15 20 C14 19 13.5 17 14 16 C14 14 16 14 16 14Z"
                        fill="#FF8040"/>
                    </svg>
                  </div>
                  <p className="text-[9px] font-semibold text-center" style={{ color: T.textMuted }}>On Fire</p>
                </div>
              )}

              {/* Perfect score badge */}
              {progress.some((p) => p.score === 3) && (
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: '#3A605820', border: '2px solid #3A605840' }}>
                    <svg viewBox="0 0 32 32" width="28" height="28">
                      <circle cx="16" cy="16" r="14" fill="#3A6058" opacity="0.9"/>
                      {[0,1,2].map((i) => (
                        <polygon key={i}
                          points={`${16+Math.cos((-90+i*120)*Math.PI/180)*9},${16+Math.sin((-90+i*120)*Math.PI/180)*9} ${16+Math.cos((-30+i*120)*Math.PI/180)*5},${16+Math.sin((-30+i*120)*Math.PI/180)*5} ${16+Math.cos((30+i*120)*Math.PI/180)*9},${16+Math.sin((30+i*120)*Math.PI/180)*9}`}
                          fill="#7ABFB4" opacity="0.9"/>
                      ))}
                      <circle cx="16" cy="16" r="3.5" fill="#F3F2EA"/>
                    </svg>
                  </div>
                  <p className="text-[9px] font-semibold text-center" style={{ color: T.textMuted }}>Scholar</p>
                </div>
              )}

              {/* Locked placeholder slots */}
              {Array.from({ length: Math.max(0, 4 - [
                completed.length >= 1,
                completed.length >= 5,
                (goal?.current_streak || 0) >= 3,
                progress.some((p) => p.score === 3),
              ].filter(Boolean).length) }, (_, i) => (
                <div key={`lock-${i}`} className="flex flex-col items-center gap-1.5">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: `${T.textPrimary}08`, border: `2px dashed ${T.textPrimary}18` }}>
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
                      <rect x="5" y="11" width="14" height="10" rx="2" stroke={T.textPrimary} strokeWidth="1.5" opacity="0.3"/>
                      <path d="M8 11V7a4 4 0 018 0v4" stroke={T.textPrimary} strokeWidth="1.5" opacity="0.3"/>
                    </svg>
                  </div>
                  <p className="text-[9px] font-semibold text-center" style={{ color: `${T.textMuted}70` }}>Locked</p>
                </div>
              ))}
            </div>

            <p className="text-[10px] mt-4" style={{ color: `${T.textMuted}80` }}>
              More badges coming soon ✦
            </p>
          </div>
        </motion.div>

        {/* ── Sign out ── */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <DuoButton variant="outline" onClick={signOut}>
            <LogOut className="w-4 h-4" /> Sign Out
          </DuoButton>
        </motion.div>
      </div>

      <BottomNav currentPage="Profile" />
    </div>
  );
}
