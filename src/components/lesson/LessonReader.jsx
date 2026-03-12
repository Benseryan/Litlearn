import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import DuoButton from '@/components/ui/DuoButton';

export default function LessonReader({ slides, onComplete }) {
  const [current, setCurrent]     = useState(0);
  const [direction, setDirection] = useState(1);

  const goNext = () => {
    if (current < slides.length - 1) { setDirection(1); setCurrent((c) => c + 1); }
    else onComplete();
  };
  const goPrev = () => {
    if (current > 0) { setDirection(-1); setCurrent((c) => c - 1); }
  };

  const slide  = slides[current];
  const isLast = current === slides.length - 1;

  return (
    <div className="space-y-5 pt-2">
      {/* Progress dots */}
      <div className="flex justify-center gap-1.5">
        {slides.map((_, i) => (
          <div key={i} onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer
              ${i === current ? 'w-6 bg-olive-dark' : i < current ? 'w-2 bg-olive-dark/50' : 'w-2 bg-neutral_tone/40'}`} />
        ))}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={current}
          initial={{ opacity: 0, x: direction * 36 }} animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -direction * 36 }} transition={{ duration: 0.2 }}
          className="bg-cream-dark rounded-2xl p-6 min-h-[300px] flex flex-col">
          <p className="text-[10px] text-olive/50 uppercase tracking-wider mb-1">{current + 1} of {slides.length}</p>
          <h3 className="text-base font-medium text-olive-dark mb-4">{slide.title}</h3>
          {slide.isPoem ? (
            <div className="flex-1 border-l-2 border-sage pl-4 mt-1">
              <p className="text-sm text-olive-dark leading-relaxed whitespace-pre-line italic font-mono">{slide.text}</p>
            </div>
          ) : (
            <p className="flex-1 text-sm text-olive-dark leading-relaxed whitespace-pre-line">{slide.text}</p>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex gap-3">
        <button onClick={goPrev} disabled={current === 0}
          className="w-12 h-12 rounded-full bg-cream-dark flex items-center justify-center disabled:opacity-25 transition-opacity">
          <ChevronLeft className="w-5 h-5 text-olive-dark" />
        </button>
        <DuoButton onClick={goNext} className="flex-1" pulse={isLast}>
          {isLast ? 'Start Quiz' : 'Next'}
          <ChevronRight className="w-4 h-4 ml-1" />
        </DuoButton>
      </div>
    </div>
  );
}
