import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Layers, Feather, Landmark, Crown, Sparkles, Flower2, Mic, BookMarked, Globe, Lock } from 'lucide-react';
import { getGenre } from './genreConfig';

const iconMap = {
  'book-open': BookOpen, 'layers': Layers, 'feather': Feather, 'landmark': Landmark,
  'crown': Crown, 'sparkles': Sparkles, 'flower-2': Flower2, 'mic': Mic,
  'book-marked': BookMarked, 'globe': Globe,
};

export default function TreeNode({ node, status, score, index, onClick }) {
  const Icon = iconMap[node.icon] || BookOpen;
  const isLocked     = status === 'locked';
  const isCompleted  = status === 'completed';
  const isAvailable  = status === 'available';
  const isInProgress = status === 'in_progress';
  const stars        = score || 0;
  const genre        = getGenre(node.genre || 'classics');
  const nodeColor    = isLocked ? '#C0BCAF' : genre.nodeColor;
  const glowColor    = !isLocked ? genre.glowColor : 'transparent';
  const isActive     = isAvailable || isInProgress;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }} className="flex flex-col items-center">
      <div className="relative">
        {isActive && (
          <motion.div className="absolute -inset-2 rounded-full pointer-events-none"
            animate={{ opacity: [0.5, 0, 0.5], scale: [0.9, 1.15, 0.9] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            style={{ backgroundColor: glowColor }} />
        )}
        <button onClick={() => !isLocked && onClick?.(node)} disabled={isLocked}
          style={{
            backgroundColor: isCompleted ? nodeColor : isActive ? nodeColor + '55' : '#D4D0C4',
            boxShadow: !isLocked ? `0 4px 0 ${nodeColor}88, 0 0 14px ${glowColor}` : 'none',
            border: isActive ? `2.5px solid ${nodeColor}` : 'none',
          }}
          className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 ${isLocked ? 'cursor-not-allowed' : 'active:scale-95 active:translate-y-1'}`}>
          {isLocked
            ? <Lock className="w-5 h-5" style={{ color: '#A0A09A' }} />
            : <Icon className="w-6 h-6" style={{ color: isCompleted ? '#F3F2EA' : nodeColor }} />}
          {isInProgress && (
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: nodeColor }}>
              <div className="w-2 h-2 bg-white/80 rounded-full animate-pulse" />
            </div>
          )}
        </button>
      </div>
      {isCompleted && stars > 0 && (
        <div className="flex gap-0.5 mt-1.5">
          {[1, 2, 3].map((s) => (
            <div key={s} className="w-2 h-2 rounded-full" style={{ backgroundColor: s <= stars ? nodeColor : '#C0BCAF55' }} />
          ))}
        </div>
      )}
      <span className="text-xs mt-1.5 font-medium text-center max-w-[80px] leading-tight"
        style={{ color: isLocked ? '#A0A09A' : '#414323' }}>
        {node.title}
      </span>
    </motion.div>
  );
}
