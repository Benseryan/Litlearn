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

        {/* ── Completed lessons ── */}
        {completed.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="rounded-2xl p-5 mb-6"
            style={{ backgroundColor: T.cardBg }}>
            <p className="text-[10px] font-medium uppercase tracking-wider mb-3"
              style={{ color: T.textMuted }}>Completed Lessons</p>
            <div className="space-y-2">
              {completed.slice(-5).reverse().map((p) => (
                <div key={p.id} className="flex items-center justify-between">
                  <p className="text-xs" style={{ color: T.textPrimary }}>{p.completed_date || 'Completed'}</p>
                  <div className="flex gap-0.5">
                    {[1,2,3].map((s) => (
                      <div key={s} className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: s <= (p.score || 0) ? T.textPrimary : `${T.textPrimary}25` }} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

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
