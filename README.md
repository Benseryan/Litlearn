# LitLearn — Supabase Migration

A Duolingo-style gamified literature learning app, fully migrated from Base44 to Supabase + Vite + React.

---

## Quick Start

### 1. Create a Supabase project
- Go to [supabase.com](https://supabase.com) → New Project
- Copy your **Project URL** and **anon public key**

### 2. Run the schema
- Open Supabase Dashboard → SQL Editor
- Paste and run the contents of `supabase_schema.sql`
- This creates all 6 tables, RLS policies, the profile trigger, and seeds achievements

### 3. Configure environment
```bash
cp .env.example .env.local
# Fill in:
# VITE_SUPABASE_URL=https://your-project.supabase.co
# VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Install & run
```bash
npm install
npm run dev
```

### 5. Deploy to Vercel
- Connect your GitHub repo to Vercel
- Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables
- Deploy!

---

## Seed Learning Nodes

After signing up, go to Supabase → SQL Editor and run:

```sql
insert into public.learning_nodes (title, description, "order", icon, category, genre) values
  ('What is Literature?',    'Introduction to literary forms and why they matter',         1,  'book-open',  'foundations', 'classics'),
  ('Story Elements',         'Character, plot, setting, conflict, and theme',              2,  'layers',     'foundations', 'classics'),
  ('Reading Poetry',         'Rhythm, meter, and the villanelle form',                    3,  'feather',    'foundations', 'poetry'),
  ('The Epic Tradition',     'Homer and the roots of the Western story',                  4,  'landmark',   'classical',   'classics'),
  ('Shakespeare & Sonnets',  'The sonnet form and Shakespeare''s argument against time',  5,  'crown',      'classical',   'classics'),
  ('Figurative Language',    'Metaphor, simile, personification, and symbolism',          6,  'sparkles',   'foundations', 'classics'),
  ('Romantic Poetry',        'Nature, sublime, and imagination in the Romantic movement', 7,  'flower-2',   'classical',   'classics'),
  ('Narration & Voice',      'Points of view and the unreliable narrator',                8,  'mic',        'modern',      'classics'),
  ('Modern Fiction',         'Kafka, alienation, and the absurd',                         9,  'book-marked','modern',      'classics'),
  ('World Literature',       'Magic realism and the danger of a single story',            10, 'globe',      'modern',      'classics');
```

---

## Architecture

```
src/
  api/supabase.js          — Supabase client + typed entity helpers
  lib/AuthContext.jsx      — Supabase auth (replaces base44.auth)
  components/
    lesson/                — LessonIntro, LessonReader, LessonQuiz, LessonComplete
    tree/                  — SkillTreeSVG, TreeNode, TreePath, GenreFilter
    navigation/            — BottomNav
    goals/                 — StreakCard, DailyProgress, StatsGrid
    friends/               — FriendCard, Leaderboard
    achievements/          — AchievementCard
    ui/                    — DuoButton, shadcn components
  pages/
    LearningTree.jsx       — Skill tree with overview + path views
    Lesson.jsx             — Full intro→reader→quiz→complete state machine
    Goals.jsx              — Streak tracking + daily goal
    Friends.jsx            — Add friends + leaderboard
    Achievements.jsx       — Achievement unlocking
    Profile.jsx            — User profile + stats
    Admin.jsx              — Content management (admin only)
```

## Content Strategy

Lesson content resolves in this order:
1. **Database** (`lesson_content` table) — editable via Admin panel
2. **Static fallback** (`lessonContent.js`) — 10 complete lessons built-in

This means the app works out of the box with zero DB content setup.
