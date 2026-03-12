import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Loader2, LogOut, User, BookOpen, Flame, Star } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { UserProgress, UserGoal, supabase, Profile } from '@/api/supabase';
import BottomNav from '@/components/navigation/BottomNav';
import DuoButton from '@/components/ui/DuoButton';

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const queryClient = useQueryClient();
  const [editing, setEditing]   = useState(false);
  const [nameInput, setNameInput] = useState('');

  const { data: progress = [] } = useQuery({
    queryKey: ['userProgress', user?.email],
    queryFn: () => UserProgress.filter({ user_email: user.email }),
    enabled: !!user?.email,
  });

  const { data: goals = [] } = useQuery({
    queryKey: ['userGoal', user?.email],
    queryFn: () => UserGoal.filter({ user_email: user.email }),
    enabled: !!user?.email,
  });

  const goal = goals[0];

  const updateMut = useMutation({
    mutationFn: () => Profile.update(user.id, { full_name: nameInput.trim() }),
    onSuccess: () => {
      queryClient.invalidateQueries();
      setEditing(false);
    },
  });

  const completed    = progress.filter((p) => p.status === 'completed');
  const totalStars   = completed.reduce((s, p) => s + (p.score || 0), 0);
  const initials     = (user?.full_name || user?.email || 'U')
    .split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

  const stats = [
    { icon: BookOpen, label: 'Lessons',     value: goal?.total_lessons    || 0 },
    { icon: Flame,    label: 'Streak',       value: goal?.current_streak   || 0 },
    { icon: Star,     label: 'Total Stars',  value: totalStars },
  ];

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-lg mx-auto px-5 pt-12 pb-28">
        {/* Avatar + name */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center py-8 gap-4">
          <div className="w-20 h-20 bg-olive-dark rounded-full flex items-center justify-center text-2xl font-semibold text-text_light"
            style={{ boxShadow: '0 6px 0 #252611' }}>
            {initials}
          </div>
          {editing ? (
            <div className="flex gap-2 w-full max-w-xs">
              <input value={nameInput} onChange={(e) => setNameInput(e.target.value)}
                className="flex-1 bg-cream-dark rounded-xl px-4 py-2 text-sm text-olive-dark border border-neutral_tone/50 focus:outline-none focus:border-sage"
                placeholder="Your name" />
              <button onClick={() => updateMut.mutate()} disabled={updateMut.isPending}
                className="bg-olive-dark text-text_light px-4 rounded-xl text-sm font-medium">
                {updateMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
              </button>
              <button onClick={() => setEditing(false)} className="text-olive/60 text-sm px-2">Cancel</button>
            </div>
          ) : (
            <div className="text-center">
              <button onClick={() => { setNameInput(user?.full_name || ''); setEditing(true); }}
                className="text-xl font-semibold text-olive-dark hover:opacity-80 transition-opacity">
                {user?.full_name || 'Add your name'}
              </button>
              <p className="text-xs text-olive/60 mt-1">{user?.email}</p>
              {user?.role === 'admin' && (
                <span className="text-[10px] bg-olive-dark text-text_light px-2 py-0.5 rounded-full font-medium mt-2 inline-block">Admin</span>
              )}
            </div>
          )}
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {stats.map(({ icon: Icon, label, value }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-cream-dark rounded-2xl p-4 flex flex-col items-center gap-2">
              <div className="w-9 h-9 bg-sage/50 rounded-full flex items-center justify-center">
                <Icon className="w-4 h-4 text-olive-dark" />
              </div>
              <p className="text-xl font-semibold text-olive-dark">{value}</p>
              <p className="text-[10px] text-olive/60 uppercase tracking-wider text-center">{label}</p>
            </motion.div>
          ))}
        </div>

        {/* Recent lessons */}
        {completed.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="bg-cream-dark rounded-2xl p-5 mb-6">
            <p className="text-[10px] font-medium text-olive/50 uppercase tracking-wider mb-3">Completed Lessons</p>
            <div className="space-y-2">
              {completed.slice(-5).reverse().map((p) => (
                <div key={p.id} className="flex items-center justify-between">
                  <p className="text-xs text-olive-dark">{p.completed_date || 'Completed'}</p>
                  <div className="flex gap-0.5">
                    {[1, 2, 3].map((s) => (
                      <div key={s} className={`w-2 h-2 rounded-full ${s <= (p.score || 0) ? 'bg-olive-dark' : 'bg-neutral_tone/40'}`} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Sign out */}
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
