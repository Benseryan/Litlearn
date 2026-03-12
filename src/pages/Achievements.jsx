import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Loader2, Star } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { Achievement, UserProgress, UserGoal, Friendship } from '@/api/supabase';
import AchievementCard from '@/components/achievements/AchievementCard';
import BottomNav from '@/components/navigation/BottomNav';

function isUnlocked(achievement, stats) {
  const { totalLessons, streak, friendCount } = stats;
  switch (achievement.category) {
    case 'lessons': return totalLessons >= achievement.requirement_count;
    case 'streak':  return streak >= achievement.requirement_count;
    case 'social':  return friendCount >= achievement.requirement_count;
    case 'mastery': {
      if (achievement.title === 'Perfect Score') return stats.hasPerfectScore;
      if (achievement.title === "Poet's Eye")    return stats.poetryCompleted >= achievement.requirement_count;
      return false;
    }
    default: return false;
  }
}

export default function Achievements() {
  const { user } = useAuth();

  const { data: achievements = [], isLoading: achLoading } = useQuery({
    queryKey: ['achievements'],
    queryFn: Achievement.list,
  });

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

  const { data: friends = [] } = useQuery({
    queryKey: ['friends', user?.email],
    queryFn: () => Friendship.filter({ user_email: user.email }),
    enabled: !!user?.email,
  });

  const goal           = goals[0];
  const completed      = progress.filter((p) => p.status === 'completed');
  const hasPerfectScore = completed.some((p) => p.score === 3);

  const stats = {
    totalLessons:    goal?.total_lessons    || 0,
    streak:          goal?.current_streak   || 0,
    friendCount:     friends.filter((f) => f.status === 'accepted').length,
    hasPerfectScore,
    poetryCompleted: 0, // TODO: filter by node category once nodes are loaded
  };

  const unlockedAchs = achievements.filter((a) => isUnlocked(a, stats));
  const lockedAchs   = achievements.filter((a) => !isUnlocked(a, stats));

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-lg mx-auto px-5 pt-12 pb-28">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-olive-dark">Achievements</h1>
          <p className="text-sm text-olive/60 mt-0.5">
            {unlockedAchs.length} of {achievements.length} unlocked
          </p>
        </div>

        {/* Progress ring */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-5 bg-cream-dark rounded-2xl p-5 mb-6">
          <div className="relative w-16 h-16 flex-shrink-0">
            <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90">
              <circle cx="32" cy="32" r="27" fill="none" stroke="#C0BCAF" strokeWidth="5" />
              <motion.circle cx="32" cy="32" r="27" fill="none" stroke="#414323" strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 27}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 27 }}
                animate={{ strokeDashoffset: achievements.length
                  ? 2 * Math.PI * 27 * (1 - unlockedAchs.length / achievements.length)
                  : 2 * Math.PI * 27 }}
                transition={{ duration: 1, ease: 'easeOut' }} />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-olive-dark">{unlockedAchs.length}/{achievements.length}</span>
            </div>
          </div>
          <div>
            <p className="text-base font-medium text-olive-dark">
              {unlockedAchs.length === 0 ? 'Start learning!' : unlockedAchs.length === achievements.length ? 'All unlocked! 🎉' : 'Keep going!'}
            </p>
            <p className="text-xs text-olive/60 mt-0.5">Complete lessons to unlock achievements</p>
          </div>
        </motion.div>

        {achLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 text-olive animate-spin" /></div>
        ) : (
          <div className="space-y-3">
            {unlockedAchs.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] font-medium text-olive/50 uppercase tracking-wider px-1">Unlocked</p>
                {unlockedAchs.map((ach, i) => (
                  <AchievementCard key={ach.id} achievement={ach} isUnlocked index={i} />
                ))}
              </div>
            )}
            {lockedAchs.length > 0 && (
              <div className="space-y-2 mt-4">
                <p className="text-[10px] font-medium text-olive/50 uppercase tracking-wider px-1">Locked</p>
                {lockedAchs.map((ach, i) => (
                  <AchievementCard key={ach.id} achievement={ach} isUnlocked={false} index={i} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <BottomNav currentPage="Achievements" />
    </div>
  );
}
