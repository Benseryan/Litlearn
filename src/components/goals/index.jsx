import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Target, BookOpen, Zap } from 'lucide-react';

export function StreakCard({ streak, longestStreak }) {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const today = new Date().getDay();
  const adjustedToday = today === 0 ? 6 : today - 1;
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-cream-dark rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-olive-dark rounded-full flex items-center justify-center" style={{ boxShadow: '0 3px 0 #252611' }}>
            <Flame className="w-5 h-5 text-text_light" />
          </div>
          <div>
            <p className="text-2xl font-semibold text-olive-dark">{streak}</p>
            <p className="text-xs text-olive/70">day streak</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-olive-dark">{longestStreak}</p>
          <p className="text-xs text-olive/70">best</p>
        </div>
      </div>
      <div className="flex justify-between">
        {days.map((day, i) => {
          const isPast   = i < adjustedToday;
          const isToday  = i === adjustedToday;
          const isActive = isPast && i >= adjustedToday - (streak - 1);
          return (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all
                ${isActive  ? 'bg-olive-dark text-text_light' : ''}
                ${isToday   ? 'bg-sage text-olive-dark ring-2 ring-olive-dark' : ''}
                ${!isActive && !isToday ? 'bg-neutral_tone/30 text-olive/50' : ''}`}>
                {day}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

export function DailyProgress({ lessonsToday, dailyTarget }) {
  const progress   = Math.min((lessonsToday / Math.max(dailyTarget, 1)) * 100, 100);
  const isComplete = lessonsToday >= dailyTarget;
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }} className="bg-cream-dark rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-olive" />
          <span className="text-sm font-medium text-olive-dark">Today's Goal</span>
        </div>
        <span className="text-sm text-olive/70">{lessonsToday} / {dailyTarget}</span>
      </div>
      <div className="w-full h-3 bg-neutral_tone/30 rounded-full overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${isComplete ? 'bg-olive-dark' : 'bg-sage'}`} />
      </div>
      {isComplete && <p className="text-xs text-olive-dark font-medium mt-2 text-center">Goal complete! 🎉</p>}
    </motion.div>
  );
}

export function StatsGrid({ totalLessons, streak }) {
  const stats = [
    { label: 'Total Lessons', value: totalLessons, icon: BookOpen },
    { label: 'Current Streak', value: streak,       icon: Zap },
  ];
  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.05 }}
            className="bg-cream-dark rounded-2xl p-4 flex flex-col items-center gap-2">
            <div className="w-9 h-9 bg-sage/50 rounded-full flex items-center justify-center">
              <Icon className="w-4 h-4 text-olive-dark" />
            </div>
            <p className="text-xl font-semibold text-olive-dark">{stat.value}</p>
            <p className="text-[10px] text-olive/60 uppercase tracking-wider">{stat.label}</p>
          </motion.div>
        );
      })}
    </div>
  );
}
