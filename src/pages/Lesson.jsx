import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Loader2, X } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { LearningNode, LessonContent, UserProgress, UserGoal, FriendStreak } from '@/api/supabase';
import { LESSON_CONTENT } from '@/components/lesson/lessonContent';
import LessonIntro from '@/components/lesson/LessonIntro';
import LessonReader from '@/components/lesson/LessonReader';
import LessonQuiz from '@/components/lesson/LessonQuiz';
import LessonComplete from '@/components/lesson/LessonComplete';
import StreakCelebration from '@/components/ui/StreakCelebration';
import { createPageUrl } from '@/utils';

// state machine
const PHASE = { INTRO: 'intro', READER: 'reader', QUIZ: 'quiz', COMPLETE: 'complete' };

function calcStars(answers) {
  if (!answers.length) return 0;
  const pct = answers.filter((a) => a.isCorrect).length / answers.length;
  if (pct >= 0.9) return 3;
  if (pct >= 0.7) return 2;
  if (pct >= 0.5) return 1;
  return 0;
}

async function updateStreakAndGoal(user, queryClient) {
  try {
    const goals = await UserGoal.filter({ user_email: user.email });
    const today = new Date().toISOString().split('T')[0];
    let goal = goals[0];

    if (!goal) {
      goal = await UserGoal.create({
        user_email: user.email,
        daily_target: 1,
        current_streak: 1,
        longest_streak: 1,
        lessons_today: 1,
        total_lessons: 1,
        last_activity_date: today,
      });
    } else {
      const last = goal.last_activity_date;
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      let newStreak     = goal.current_streak;
      let lessonsToday  = goal.lessons_today;

      if (last === today) {
        lessonsToday += 1;
      } else if (last === yesterday) {
        newStreak     += 1;
        lessonsToday  = 1;
      } else {
        newStreak    = 1;
        lessonsToday = 1;
      }

      await UserGoal.update(goal.id, {
        current_streak:     newStreak,
        longest_streak:     Math.max(goal.longest_streak, newStreak),
        lessons_today:      lessonsToday,
        total_lessons:      (goal.total_lessons || 0) + 1,
        last_activity_date: today,
      });
    }
    queryClient.invalidateQueries({ queryKey: ['userGoal'] });
  } catch (e) {
    console.error('Goal update failed:', e);
  }
}

export default function Lesson() {
  const [searchParams]  = useSearchParams();
  const navigate        = useNavigate();
  const { user }        = useAuth();
  const queryClient     = useQueryClient();
  const nodeId          = searchParams.get('node_id');

  const [phase, setPhase]     = useState(PHASE.INTRO);
  const [answers, setAnswers] = useState([]);
  const [stars, setStars]     = useState(0);
  const [showStreakCelebration, setShowStreakCelebration] = useState(false);
  const [celebrationStreak, setCelebrationStreak]         = useState(0);
  const [celebrationFriend, setCelebrationFriend]         = useState(null);

  // Fetch node
  const { data: nodes = [], isLoading: nodesLoading } = useQuery({
    queryKey: ['learningNodes'],
    queryFn: LearningNode.list,
  });
  const node = nodes.find((n) => n.id === nodeId);

  // Fetch DB lesson content
  const { data: dbContents = [], isLoading: contentLoading } = useQuery({
    queryKey: ['lessonContent'],
    queryFn: LessonContent.list,
  });

  // Resolve content: prefer DB, fall back to static
  const dbContent     = dbContents.find((c) => c.node_id === nodeId);
  const staticContent = node ? LESSON_CONTENT[node.order] : null;

  const resolvedContent = dbContent
    ? {
        intro: {
          guidance:    dbContent.intro_guidance   || staticContent?.intro?.guidance || '',
          source:      dbContent.intro_source     || staticContent?.intro?.source   || '',
          sourceUrl:   dbContent.intro_source_url || staticContent?.intro?.sourceUrl,
          readingTime: dbContent.reading_time     || staticContent?.intro?.readingTime,
        },
        slides:    dbContent.slides_json    ? JSON.parse(dbContent.slides_json)    : (staticContent?.slides    || []),
        questions: dbContent.questions_json ? JSON.parse(dbContent.questions_json) : (staticContent?.questions || []),
      }
    : staticContent;

  // Existing progress
  const { data: progressList = [] } = useQuery({
    queryKey: ['userProgress', user?.email],
    queryFn: () => UserProgress.filter({ user_email: user.email }),
    enabled: !!user?.email,
  });
  const existingProgress = progressList.find((p) => p.node_id === nodeId);

  // Mark in_progress on mount
  useEffect(() => {
    if (!user?.email || !nodeId) return;
    if (existingProgress?.status === 'completed') return;
    UserProgress.upsert({
      user_email: user.email,
      node_id:    nodeId,
      status:     'in_progress',
      score:      0,
    }).catch(() => {});
  }, [user?.email, nodeId]);

  const handleComplete = async (finalAnswers) => {
    const s = calcStars(finalAnswers);
    setAnswers(finalAnswers);
    setStars(s);
    setPhase(PHASE.COMPLETE);
    if (!user?.email || !nodeId) return;

    const today = new Date().toISOString().split('T')[0];
    let friendStreakTriggered = false;

    try {
      await UserProgress.upsert({
        user_email:     user.email,
        node_id:        nodeId,
        status:         'completed',
        score:          s,
        completed_date: today,
      });

      // ── Update friend streaks ────────────────────────────────
      try {
        const myFriendStreaks = await FriendStreak.filter({ user_email: user.email });
        for (const fs of myFriendStreaks) {
          if (fs.status === 'broken') continue;
          // Check if friend has been active today (their side)
          const friendRecords = await FriendStreak.filter({
            user_email:   fs.friend_email,
            friend_email: user.email,
          });
          const friendRecord      = friendRecords?.[0];
          const friendActiveToday = friendRecord?.last_active_date === today;
          const newCount          = friendActiveToday ? (fs.streak_count || 0) + 1 : fs.streak_count || 0;
          await FriendStreak.update(fs.id, {
            last_active_date: today,
            streak_count:     newCount,
            status:           'active',
          });
          // Celebrate if both sides active today and streak just incremented
          if (friendActiveToday && newCount > (fs.streak_count || 0) && !friendStreakTriggered) {
            setCelebrationStreak(newCount);
            setCelebrationFriend(fs.friend_name || fs.friend_email);
            setShowStreakCelebration(true);
            friendStreakTriggered = true;
          }
        }
      } catch (e) {
        console.error('Friend streak update failed:', e);
      }

      // ── Update personal goals / solo streak ──────────────────
      const goals = await UserGoal.filter({ user_email: user.email });
      const goal  = goals[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

      if (!goal) {
        await UserGoal.create({
          user_email: user.email, daily_target: 1,
          current_streak: 1, longest_streak: 1,
          lessons_today: 1, total_lessons: 1, last_activity_date: today,
        });
        if (!friendStreakTriggered) {
          setCelebrationStreak(1); setCelebrationFriend(null); setShowStreakCelebration(true);
        }
      } else {
        const isFirstToday = goal.last_activity_date !== today;
        let newStreak    = goal.current_streak;
        let lessonsToday = goal.lessons_today;

        if (goal.last_activity_date === today) {
          lessonsToday += 1;
        } else if (goal.last_activity_date === yesterday) {
          newStreak    += 1; lessonsToday = 1;
        } else {
          newStreak = 1; lessonsToday = 1;
        }
        await UserGoal.update(goal.id, {
          current_streak:     newStreak,
          longest_streak:     Math.max(goal.longest_streak, newStreak),
          lessons_today:      lessonsToday,
          total_lessons:      (goal.total_lessons || 0) + 1,
          last_activity_date: today,
        });
        // Solo celebration on first lesson of the day (if no friend streak already fired)
        if (isFirstToday && !friendStreakTriggered) {
          setCelebrationStreak(newStreak);
          setCelebrationFriend(null);
          setShowStreakCelebration(true);
        }
      }

      queryClient.invalidateQueries({ queryKey: ['userProgress'] });
      queryClient.invalidateQueries({ queryKey: ['userGoal'] });
      queryClient.invalidateQueries({ queryKey: ['friendStreaks'] });
    } catch (e) {
      console.error('Progress save failed:', e);
    }
  };

  const handleRetry = () => { setPhase(PHASE.QUIZ); setAnswers([]); };

  const isLoading = nodesLoading || contentLoading;

  const PHASE_LABELS = { intro: 'Overview', reader: 'Reading', quiz: 'Quiz', complete: 'Results' };
  const PHASES_ORDER = [PHASE.INTRO, PHASE.READER, PHASE.QUIZ, PHASE.COMPLETE];
  const phaseIndex   = PHASES_ORDER.indexOf(phase);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-olive animate-spin" />
      </div>
    );
  }

  if (!node || !resolvedContent) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center gap-4">
        <p className="text-olive/70 text-sm">Lesson not found</p>
        <button onClick={() => navigate(createPageUrl('LearningTree'))}
          className="text-olive-dark text-sm underline">
          Back to Learning Tree
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Streak celebration fullscreen overlay */}
      <AnimatePresence>
        {showStreakCelebration && (
          <StreakCelebration
            streak={celebrationStreak}
            friendName={celebrationFriend}
            onClose={() => setShowStreakCelebration(false)}
          />
        )}
      </AnimatePresence>
      {/* Header */}
      <div className="flex-shrink-0 px-5 pt-12 pb-4 max-w-lg mx-auto w-full">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(createPageUrl('LearningTree'))}
            className="w-9 h-9 rounded-full bg-cream-dark flex items-center justify-center hover:bg-neutral_tone/50 transition-colors">
            <ChevronLeft className="w-5 h-5 text-olive-dark" />
          </button>
          <div className="flex-1">
            <h1 className="text-sm font-medium text-olive-dark truncate">{node.title}</h1>
            <p className="text-xs text-olive/60 capitalize">{node.category || node.genre}</p>
          </div>
          {phase !== PHASE.COMPLETE && (
            <button onClick={() => navigate(createPageUrl('LearningTree'))}
              className="w-9 h-9 rounded-full bg-cream-dark flex items-center justify-center">
              <X className="w-4 h-4 text-olive/60" />
            </button>
          )}
        </div>

        {/* Phase progress bar */}
        <div className="flex gap-1.5">
          {PHASES_ORDER.slice(0, 3).map((p, i) => (
            <div key={p} className="flex-1 h-1.5 rounded-full overflow-hidden bg-neutral_tone/30">
              <motion.div animate={{ width: i <= phaseIndex - 1 ? '100%' : i === phaseIndex ? '60%' : '0%' }}
                transition={{ duration: 0.5 }} className="h-full bg-olive-dark rounded-full" />
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-1">
          {PHASES_ORDER.slice(0, 3).map((p, i) => (
            <span key={p} className={`text-[9px] uppercase tracking-wider font-medium ${i <= phaseIndex ? 'text-olive-dark' : 'text-olive/30'}`}>
              {PHASE_LABELS[p]}
            </span>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 max-w-lg mx-auto w-full pb-16">
        <AnimatePresence mode="wait">
          {phase === PHASE.INTRO && (
            <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <LessonIntro
                content={resolvedContent.intro}
                onBegin={() => setPhase(PHASE.READER)}
                onSkipToQuiz={() => setPhase(PHASE.QUIZ)}
              />
            </motion.div>
          )}
          {phase === PHASE.READER && (
            <motion.div key="reader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <LessonReader
                slides={resolvedContent.slides}
                onComplete={() => setPhase(PHASE.QUIZ)}
              />
            </motion.div>
          )}
          {phase === PHASE.QUIZ && (
            <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <LessonQuiz
                questions={resolvedContent.questions}
                onComplete={handleComplete}
              />
            </motion.div>
          )}
          {phase === PHASE.COMPLETE && (
            <motion.div key="complete" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <LessonComplete
                answers={answers}
                questions={resolvedContent.questions}
                stars={stars}
                onRetry={handleRetry}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
