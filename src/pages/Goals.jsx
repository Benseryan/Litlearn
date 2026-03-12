import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Loader2, Settings } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { UserGoal } from '@/api/supabase';
import { StreakCard, DailyProgress, StatsGrid } from '@/components/goals/index';
import BottomNav from '@/components/navigation/BottomNav';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import DuoButton from '@/components/ui/DuoButton';

export default function Goals() {
  const { user }   = useAuth();
  const queryClient = useQueryClient();
  const [showSettings, setShowSettings] = useState(false);
  const [target, setTarget]             = useState('');

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['userGoal', user?.email],
    queryFn: () => UserGoal.filter({ user_email: user.email }),
    enabled: !!user?.email,
  });

  const goal = goals[0];

  const saveMut = useMutation({
    mutationFn: async () => {
      if (goal) {
        await UserGoal.update(goal.id, { daily_target: parseInt(target, 10) });
      } else {
        await UserGoal.create({
          user_email: user.email, daily_target: parseInt(target, 10),
          current_streak: 0, longest_streak: 0, lessons_today: 0, total_lessons: 0,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userGoal'] });
      setShowSettings(false);
    },
  });

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-lg mx-auto px-5 pt-12 pb-28">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-olive-dark">My Goals</h1>
            <p className="text-sm text-olive/60 mt-0.5">
              {user?.full_name ? `Keep going, ${user.full_name.split(' ')[0]}!` : 'Keep going!'}
            </p>
          </div>
          <button onClick={() => { setTarget(String(goal?.daily_target || 1)); setShowSettings(true); }}
            className="w-10 h-10 bg-cream-dark rounded-full flex items-center justify-center hover:bg-neutral_tone/50 transition-colors">
            <Settings className="w-4 h-4 text-olive-dark" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 text-olive animate-spin" /></div>
        ) : (
          <div className="space-y-4">
            <StreakCard streak={goal?.current_streak || 0} longestStreak={goal?.longest_streak || 0} />
            <DailyProgress lessonsToday={goal?.lessons_today || 0} dailyTarget={goal?.daily_target || 1} />
            <StatsGrid totalLessons={goal?.total_lessons || 0} streak={goal?.current_streak || 0} />

            {!goal && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-cream-dark rounded-2xl p-5 text-center">
                <p className="text-sm text-olive/70 mb-3">Complete your first lesson to start your streak!</p>
              </motion.div>
            )}
          </div>
        )}
      </div>

      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-olive-dark">Daily Goal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <p className="text-sm text-olive/70">How many lessons do you want to complete each day?</p>
            <div className="flex gap-2">
              {[1, 2, 3, 5].map((n) => (
                <button key={n} onClick={() => setTarget(String(n))}
                  className={`flex-1 h-12 rounded-2xl font-semibold text-sm transition-all
                    ${target === String(n) ? 'bg-olive-dark text-text_light' : 'bg-cream text-olive-dark'}`}
                  style={{ boxShadow: target === String(n) ? '0 3px 0 #252611' : 'none' }}>
                  {n}
                </button>
              ))}
            </div>
            <DuoButton onClick={() => saveMut.mutate()} disabled={!target || saveMut.isPending}>
              {saveMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Goal'}
            </DuoButton>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav currentPage="Goals" />
    </div>
  );
}
