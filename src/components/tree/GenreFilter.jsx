import React from 'react';
import { motion } from 'framer-motion';
import { GENRES } from './genreConfig';

export default function GenreFilter({ selected, onSelect }) {
  return (
    <div className="flex gap-2 overflow-x-auto py-1 no-scrollbar">
      {GENRES.map((genre) => {
        const isActive = selected === genre.id;
        return (
          <motion.button key={genre.id} onClick={() => onSelect(genre.id)} whileTap={{ scale: 0.92 }}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200"
            style={{
              backgroundColor: isActive ? genre.nodeColor : 'rgba(0,0,0,0.07)',
              color: isActive ? '#fff' : '#5A5C41',
              boxShadow: isActive ? `0 2px 10px ${genre.glowColor}` : 'none',
              border: isActive ? 'none' : '1px solid rgba(0,0,0,0.06)',
            }}>
            <span>{genre.emoji}</span>
            <span>{genre.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
