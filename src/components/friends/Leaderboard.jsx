import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Flame, BookOpen, Crown } from 'lucide-react';
import { UserGoal } from '@/api/supabase';

function getInitials(name) {
  return (name || '?').split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

const RANK_STYLES = [
  { podiumH: 'h-20', avatarSize: 'w-12 h-12', avatarBg: 'bg-neutral_tone',   textSize: 'text-sm'  },
  { podiumH: 'h-28', avatarSize: 'w-16 h-16', avatarBg: 'bg-olive-dark',     textSize: 'text-base' },
  { podiumH: 'h-14', avatarSize: 'w-11 h-11', avatarBg: 'bg-sage',           textSize: 'text-xs'  },
];
const PODIUM_BG   = ['bg-neutral_tone/60', 'bg-olive-dark/90', 'bg-sage/70'];
const MEDAL_LABEL = ['2nd', '1st', '3rd'];

export function Leaderboard({ user, friends }) {
  const { data: allGoals = [] } = useQuery({
    queryKey: ['allGoals'],
    queryFn: () => UserGoal.list(),
  });

  const entries = useMemo(() => {
    const relevantEmails = new Set([user?.email, ...friends.map((f) => f.friend_email)]);
    return [...relevantEmails].filter(Boolean).map((email) => {
      const goal       = allGoals.find((g) => g.user_email === email);
      const isSelf     = email === user?.email;
      const friendship = friends.find((f) => f.friend_email === email);
      return {
        email,
        displayName: isSelf
          ? user?.full_name || email.split('@')[0]
          : friendship?.friend_name || email.split('@')[0],
        isSelf,
        totalLessons: goal?.total_lessons  || 0,
        streak:       goal?.current_streak || 0,
        score:        (goal?.total_lessons || 0) * 10 + (goal?.current_streak || 0) * 3,
      };
    }).sort((a, b) => b.score - a.score);
  }, [user, friends, allGoals]);

  const top3       = entries.slice(0, 3);
  const rest       = entries.slice(3);
  const podiumOrder = top3.length >= 3 ? [top3[1], top3[0], top3[2]]
    : top3.length === 2 ? [top3[1], top3[0]] : top3;

  return (
    <div className="space-y-6">
      {podiumOrder.length > 0 && (
        <div className="flex items-end justify-center gap-3 px-2 pt-4">
          {podiumOrder.map((entry, podiumIndex) => {
            const realRank = top3.indexOf(entry);
            const style    = RANK_STYLES[podiumIndex];
            return (
              <motion.div key={entry.email} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: podiumIndex * 0.1 }} className="flex flex-col items-center gap-2 flex-1">
                {realRank === 0 && <Crown className="w-4 h-4 text-olive-dark mb-0.5" />}
                <div className={`${style.avatarSize} ${style.avatarBg} rounded-full flex items-center justify-center flex-shrink-0`}>
                  <span className={`font-semibold ${style.avatarBg === 'bg-olive-dark' ? 'text-text_light' : 'text-olive-dark'} ${style.textSize}`}>
                    {getInitials(entry.displayName)}
                  </span>
                </div>
                <p className={`${style.textSize} font-medium text-olive-dark text-center truncate max-w-[80px]`}>
                  {entry.isSelf ? 'You' : entry.displayName}
                </p>
                <div className="flex items-center gap-2 text-[10px] text-olive/70 mb-1">
                  <span className="flex items-center gap-0.5"><BookOpen className="w-2.5 h-2.5" />{entry.totalLessons}</span>
                  <span className="flex items-center gap-0.5"><Flame className="w-2.5 h-2.5" />{entry.streak}</span>
                </div>
                <div className={`w-full ${style.podiumH} ${PODIUM_BG[podiumIndex]} rounded-t-xl flex items-start justify-center pt-2`}>
                  <span className={`text-xs font-bold ${podiumIndex === 1 ? 'text-text_light/80' : 'text-olive-dark/60'}`}>
                    {MEDAL_LABEL[podiumIndex]}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {rest.length > 0 && (
        <div className="space-y-2">
          {rest.map((entry, i) => (
            <motion.div key={entry.email} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              className="flex items-center gap-3 bg-cream-dark rounded-2xl p-3">
              <span className="w-6 text-xs text-olive/50 font-medium text-center">{i + 4}</span>
              <div className="w-9 h-9 bg-neutral_tone/60 rounded-full flex items-center justify-center">
                <span className="text-xs font-semibold text-olive-dark">{getInitials(entry.displayName)}</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-olive-dark">{entry.isSelf ? 'You' : entry.displayName}</p>
              </div>
              <div className="flex items-center gap-3 text-xs text-olive/60">
                <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{entry.totalLessons}</span>
                <span className="flex items-center gap-1"><Flame className="w-3 h-3" />{entry.streak}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {entries.length === 0 && (
        <div className="text-center py-12 text-olive/50 text-sm">Add friends to see the leaderboard</div>
      )}
    </div>
  );
}
