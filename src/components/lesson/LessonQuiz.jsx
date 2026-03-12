import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, ChevronRight } from 'lucide-react';
import DuoButton from '@/components/ui/DuoButton';

export default function LessonQuiz({ questions, onComplete }) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers]   = useState([]);

  const question   = questions[current];
  const isAnswered = selected !== null;
  const isLast     = current === questions.length - 1;

  const handleSelect = (index) => { if (isAnswered) return; setSelected(index); };

  const handleNext = () => {
    const newAnswers = [
      ...answers,
      { questionIndex: current, selectedIndex: selected, isCorrect: selected === question.correct_index },
    ];
    if (isLast) { onComplete(newAnswers); }
    else { setAnswers(newAnswers); setCurrent((c) => c + 1); setSelected(null); }
  };

  const getOptionStyle = (i) => {
    const isCorrect  = i === question.correct_index;
    const isSelected = i === selected;
    if (!isAnswered)                return 'bg-cream-dark border-2 border-transparent hover:border-sage/50';
    if (isSelected && isCorrect)    return 'bg-sage/30 border-2 border-olive-dark';
    if (isSelected && !isCorrect)   return 'bg-red-50 border-2 border-red-300';
    if (!isSelected && isCorrect)   return 'bg-sage/15 border-2 border-sage/50';
    return 'bg-cream-dark border-2 border-transparent opacity-40';
  };

  const getOptionIcon = (i) => {
    const isCorrect  = i === question.correct_index;
    const isSelected = i === selected;
    if (!isAnswered)                return <span className="text-xs font-medium text-olive/50">{String.fromCharCode(65 + i)}</span>;
    if (isSelected && isCorrect)    return <CheckCircle2 className="w-4 h-4 text-olive-dark" />;
    if (isSelected && !isCorrect)   return <XCircle className="w-4 h-4 text-red-500" />;
    if (!isSelected && isCorrect)   return <CheckCircle2 className="w-4 h-4 text-sage" />;
    return <span className="text-xs font-medium text-olive/30">{String.fromCharCode(65 + i)}</span>;
  };

  return (
    <div className="space-y-5 pt-2">
      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 bg-neutral_tone/30 rounded-full overflow-hidden">
          <motion.div animate={{ width: `${(current / questions.length) * 100}%` }}
            className="h-full bg-olive-dark rounded-full" transition={{ duration: 0.4 }} />
        </div>
        <span className="text-xs text-olive/50 flex-shrink-0">{current + 1}/{questions.length}</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={current} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.18 }} className="space-y-4">
          <span className={`inline-block text-[10px] font-medium px-2.5 py-1 rounded-full uppercase tracking-wider
            ${question.type === 'vocabulary' ? 'bg-sage/40 text-olive-dark' : 'bg-cream-dark text-olive/60'}`}>
            {question.type}
          </span>
          <p className="text-base font-medium text-olive-dark leading-snug">{question.text}</p>
          <div className="space-y-2">
            {question.options.map((option, i) => (
              <button key={i} onClick={() => handleSelect(i)} disabled={isAnswered}
                className={`w-full text-left px-4 py-3 rounded-2xl text-sm transition-all flex items-center gap-3 ${getOptionStyle(i)}`}>
                <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center">{getOptionIcon(i)}</span>
                <span className="flex-1 text-olive-dark">{option}</span>
              </button>
            ))}
          </div>
          <AnimatePresence>
            {isAnswered && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden">
                <div className={`rounded-2xl p-4 ${selected === question.correct_index ? 'bg-sage/20' : 'bg-red-50'}`}>
                  <p className={`text-sm font-medium mb-1 ${selected === question.correct_index ? 'text-olive-dark' : 'text-red-700'}`}>
                    {selected === question.correct_index ? 'Correct! ✓' : 'Not quite'}
                  </p>
                  <p className={`text-xs leading-relaxed ${selected === question.correct_index ? 'text-olive/70' : 'text-red-600/80'}`}>
                    {question.explanation}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {isAnswered && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <DuoButton onClick={handleNext} pulse={isLast}
              color={selected === question.correct_index ? '#414323' : '#DC2626'}
              shadowColor={selected === question.correct_index ? '#252611' : '#991B1B'}>
              {isLast ? 'See Results' : 'Next Question'}
              <ChevronRight className="w-4 h-4 ml-1" />
            </DuoButton>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
