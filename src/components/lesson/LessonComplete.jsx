import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { TreePine, CheckCircle2, XCircle, Star, RefreshCw } from 'lucide-react';
import DuoButton from '@/components/ui/DuoButton';

export default function LessonComplete({ answers, questions, stars, onRetry }) {
  const correct    = answers.filter((a) => a.isCorrect).length;
  const total      = questions.length;
  const percentage = Math.round((correct / total) * 100);
  const messages   = ['Keep going!', 'Good effort', 'Well done!', 'Excellent! 🎉'];
  const message    = messages[stars] || messages[0];

  return (
    <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
      className="space-y-6 pt-4 pb-8">
      <div className="flex flex-col items-center py-8 gap-4">
        <div className="flex items-center gap-3">
          {[1, 2, 3].map((s) => (
            <motion.div key={s}
              initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2 + s * 0.15, type: 'spring', stiffness: 280 }}
              className={`w-16 h-16 rounded-full flex items-center justify-center ${s <= stars ? 'bg-olive-dark' : 'bg-neutral_tone/30'}`}
              style={{ boxShadow: s <= stars ? '0 4px 0 #252611' : 'none' }}>
              <Star className={`w-7 h-7 ${s <= stars ? 'text-text_light' : 'text-neutral_tone/50'}`}
                fill={s <= stars ? 'currentColor' : 'none'} />
            </motion.div>
          ))}
        </div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }} className="text-center">
          <h2 className="text-2xl font-semibold text-olive-dark">{message}</h2>
          <p className="text-sm text-olive/60 mt-1">{correct} of {total} correct · {percentage}%</p>
        </motion.div>
      </div>

      <div className="bg-cream-dark rounded-2xl p-4 space-y-3">
        <p className="text-[10px] font-medium text-olive/50 uppercase tracking-wider">Question Review</p>
        {answers.map((answer, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              {answer.isCorrect
                ? <CheckCircle2 className="w-4 h-4 text-olive-dark" />
                : <XCircle className="w-4 h-4 text-red-400" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-olive-dark leading-tight line-clamp-2">{questions[i]?.text}</p>
              {!answer.isCorrect && (
                <p className="text-[11px] text-olive/50 mt-0.5 italic">
                  Correct: {questions[i]?.options[questions[i]?.correct_index]}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <Link to={createPageUrl('LearningTree')}>
          <DuoButton pulse><TreePine className="w-4 h-4" /> Back to Learning Tree</DuoButton>
        </Link>
        <button onClick={onRetry}
          className="w-full flex items-center justify-center gap-1.5 text-sm text-olive/50 hover:text-olive-dark py-2 transition-colors">
          <RefreshCw className="w-3.5 h-3.5" /> Retake quiz
        </button>
      </div>
    </motion.div>
  );
}
