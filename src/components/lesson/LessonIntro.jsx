import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Clock, ExternalLink, ChevronRight } from 'lucide-react';
import DuoButton from '@/components/ui/DuoButton';

export default function LessonIntro({ content, onBegin, onSkipToQuiz }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 pt-2">
      <div className="flex justify-center py-6">
        <div className="w-20 h-20 bg-olive-dark rounded-full flex items-center justify-center"
          style={{ boxShadow: '0 6px 0 #252611' }}>
          <BookOpen className="w-9 h-9 text-text_light" />
        </div>
      </div>

      <div className="bg-cream-dark rounded-2xl p-5 space-y-2">
        <p className="text-[10px] font-medium text-olive/50 uppercase tracking-wider">Before you begin</p>
        <p className="text-sm text-olive-dark leading-relaxed">{content.guidance}</p>
      </div>

      <div className="bg-cream-dark rounded-2xl p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-olive/50 uppercase tracking-wider mb-1.5">Reading</p>
            <p className="text-sm font-medium text-olive-dark leading-snug">{content.source}</p>
            {content.readingTime && (
              <div className="flex items-center gap-1.5 mt-2">
                <Clock className="w-3 h-3 text-olive/50" />
                <span className="text-xs text-olive/60">{content.readingTime}</span>
              </div>
            )}
          </div>
          {content.sourceUrl && (
            <a href={content.sourceUrl} target="_blank" rel="noopener noreferrer"
              className="w-10 h-10 bg-olive-dark/10 rounded-full flex items-center justify-center flex-shrink-0 hover:bg-olive-dark/20 transition-colors">
              <ExternalLink className="w-4 h-4 text-olive-dark" />
            </a>
          )}
        </div>
      </div>

      <div className="space-y-2 pt-2">
        <DuoButton pulse onClick={onBegin}>
          I've read it — begin lesson
          <ChevronRight className="w-4 h-4 ml-1" />
        </DuoButton>
        <button onClick={onSkipToQuiz}
          className="w-full text-sm text-olive/50 hover:text-olive-dark py-2 transition-colors">
          Skip to quiz
        </button>
      </div>
    </motion.div>
  );
}
