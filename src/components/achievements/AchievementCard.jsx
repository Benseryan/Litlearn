import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Book, GraduationCap, Flame, CalendarCheck, Users, Star, Feather, Lock } from 'lucide-react';

const iconMap = {
  'book-open': BookOpen, 'book': Book, 'graduation-cap': GraduationCap,
  'flame': Flame, 'calendar-check': CalendarCheck, 'users': Users,
  'star': Star, 'feather': Feather,
};

export default function AchievementCard({ achievement, isUnlocked, index }) {
  const Icon = iconMap[achievement.icon] || Star;
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      className={`rounded-2xl p-4 flex items-center gap-4 transition-all
        ${isUnlocked ? 'bg-olive-dark' : 'bg-cream-dark'}`}>
      <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0
        ${isUnlocked ? 'bg-sage/30' : 'bg-neutral_tone/30'}`}>
        {isUnlocked
          ? <Icon className="w-5 h-5 text-text_light" />
          : <Lock className="w-4 h-4 text-olive/40" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${isUnlocked ? 'text-text_light' : 'text-olive-dark'}`}>
          {achievement.title}
        </p>
        <p className={`text-xs mt-0.5 ${isUnlocked ? 'text-text_light/70' : 'text-olive/60'}`}>
          {achievement.description}
        </p>
      </div>
      {isUnlocked && (
        <div className="flex-shrink-0 w-6 h-6 bg-sage/40 rounded-full flex items-center justify-center">
          <Star className="w-3 h-3 text-text_light" fill="currentColor" />
        </div>
      )}
    </motion.div>
  );
}
