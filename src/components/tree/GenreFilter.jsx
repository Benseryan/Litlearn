import React from 'react';
import { motion } from 'framer-motion';
import { GENRES } from './genreConfig';

// Exclude the 'all' catch-all — show only real genres
const REAL_GENRES = GENRES.filter((g) => g.id !== 'all');

export default function GenreFilter({ selected, onSelect }) {
  return (
    <div className="flex gap-2 overflow-x-auto py-1 no-scrollbar">
      {REAL_GENRES.map((genre) => {
        const isActive = selected === genre.id;
        return (
          <motion.button key={genre.id} onClick={() => onSelect(genre.id)} whileTap={{ scale: 0.92 }}
            className="flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200"
            style={{
              backgroundColor: isActive ? genre.nodeColor : 'rgba(0,0,0,0.07)',
              color: isActive ? '#fff' : '#5A5C41',
              boxShadow: isActive ? `0 2px 10px ${genre.glowColor}` : 'none',
              border: isActive ? 'none' : '1px solid rgba(0,0,0,0.06)',
            }}>
            {genre.label}
          </motion.button>
        );
      })}
    </div>
  );
}
