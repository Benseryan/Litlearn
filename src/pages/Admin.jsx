import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2, Plus, Pencil, Trash2, ChevronLeft, ChevronRight,
  BookOpen, Layers, LayoutList, Save, ArrowUp, ArrowDown,
  GripVertical, CheckCircle2, AlertCircle, Eye, X
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { LearningNode, LessonContent } from '@/api/supabase';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import DuoButton from '@/components/ui/DuoButton';

// ─── Constants ───────────────────────────────────────────────
const CATEGORIES = ['foundations','classical','modern','analysis','poetry'];
const GENRES     = ['classics','fantasy','sci-fi','philosophy','nonfiction','mystery'];
const ICONS      = ['book-open','layers','feather','landmark','crown','sparkles','flower-2','mic','book-marked','globe'];

const EMPTY_NODE = { title: '', description: '', order: 1, icon: 'book-open', category: 'foundations', genre: 'classics', unit: 1 };

const UNIT_NAMES = ['Foundations', 'Classical World', 'Modern Era', 'Advanced Study'];
const EMPTY_SLIDE    = { title: '', text: '', isPoem: false };
const EMPTY_QUESTION = { type: 'comprehension', text: '', options: ['','','',''], correct_index: 0, explanation: '' };

// ─── Shared input styles ─────────────────────────────────────
const inp  = "w-full bg-cream rounded-xl px-4 py-3 text-sm text-olive-dark placeholder:text-olive/40 border border-neutral_tone/50 focus:outline-none focus:border-sage transition-colors";
const ta   = inp + " resize-none leading-relaxed";
const sel  = inp;
const label = "block text-[10px] font-semibold text-olive/50 uppercase tracking-wider mb-1.5";

// ─── Section card wrapper ─────────────────────────────────────
function Section({ title, subtitle, children, action }) {
  return (
    <div className="bg-cream-dark rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-neutral_tone/20">
        <div>
          <p className="text-sm font-semibold text-olive-dark">{title}</p>
          {subtitle && <p className="text-xs text-olive/50 mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ─── Slide editor ─────────────────────────────────────────────
function SlideEditor({ slides, onChange }) {
  const add    = () => onChange([...slides, { ...EMPTY_SLIDE }]);
  const remove = (i) => onChange(slides.filter((_, idx) => idx !== i));
  const update = (i, field, val) => onChange(slides.map((s, idx) => idx === i ? { ...s, [field]: val } : s));
  const move   = (i, dir) => {
    const next = [...slides];
    const swapIdx = i + dir;
    if (swapIdx < 0 || swapIdx >= next.length) return;
    [next[i], next[swapIdx]] = [next[swapIdx], next[i]];
    onChange(next);
  };

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {slides.map((slide, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }} layout
            className="bg-cream rounded-2xl p-4 space-y-3 border border-neutral_tone/30">
            {/* Slide header */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-olive/40 bg-neutral_tone/30 px-2.5 py-1 rounded-full">
                Slide {i + 1}
              </span>
              <div className="flex items-center gap-1">
                <button onClick={() => move(i, -1)} disabled={i === 0}
                  className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-neutral_tone/40 disabled:opacity-25 transition-colors">
                  <ArrowUp className="w-3.5 h-3.5 text-olive/60" />
                </button>
                <button onClick={() => move(i, 1)} disabled={i === slides.length - 1}
                  className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-neutral_tone/40 disabled:opacity-25 transition-colors">
                  <ArrowDown className="w-3.5 h-3.5 text-olive/60" />
                </button>
                <button onClick={() => remove(i)}
                  className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-red-50 transition-colors ml-1">
                  <X className="w-3.5 h-3.5 text-red-400" />
                </button>
              </div>
            </div>

            {/* Title */}
            <div>
              <p className={label}>Slide Title</p>
              <input value={slide.title} onChange={(e) => update(i, 'title', e.target.value)}
                placeholder="e.g. What is Literature?" className={inp} />
            </div>

            {/* Body */}
            <div>
              <p className={label}>Body Text</p>
              <textarea value={slide.text} onChange={(e) => update(i, 'text', e.target.value)}
                placeholder="Write the slide content here..." className={ta} rows={5} />
            </div>

            {/* Poem toggle */}
            <div className="flex items-center gap-3">
              <button onClick={() => update(i, 'isPoem', !slide.isPoem)}
                className={`w-10 h-5 rounded-full transition-all duration-200 flex items-center px-0.5
                  ${slide.isPoem ? 'bg-olive-dark justify-end' : 'bg-neutral_tone/50 justify-start'}`}>
                <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
              </button>
              <span className="text-xs text-olive/70">Format as poem / verse (monospace, indented)</span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {slides.length < 5 && (
        <button onClick={add}
          className="w-full h-11 border-2 border-dashed border-neutral_tone/50 rounded-2xl flex items-center justify-center gap-2 text-sm text-olive/50 hover:border-sage hover:text-olive-dark transition-all">
          <Plus className="w-4 h-4" /> Add Slide
        </button>
      )}
      {slides.length >= 5 && (
        <p className="text-center text-xs text-olive/40">Maximum 5 slides reached</p>
      )}
    </div>
  );
}

// ─── Question editor ──────────────────────────────────────────
function QuestionEditor({ questions, onChange }) {
  const add    = () => onChange([...questions, { ...EMPTY_QUESTION, options: ['','','',''] }]);
  const remove = (i) => onChange(questions.filter((_, idx) => idx !== i));
  const update = (i, field, val) => onChange(questions.map((q, idx) => idx === i ? { ...q, [field]: val } : q));
  const updateOption = (qi, oi, val) => onChange(questions.map((q, idx) =>
    idx === qi ? { ...q, options: q.options.map((o, oidx) => oidx === oi ? val : o) } : q
  ));

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {questions.map((q, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }} layout
            className="bg-cream rounded-2xl p-4 space-y-3 border border-neutral_tone/30">
            {/* Question header */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-olive/40 bg-neutral_tone/30 px-2.5 py-1 rounded-full">
                Question {i + 1}
              </span>
              <button onClick={() => remove(i)}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-red-50 transition-colors">
                <X className="w-3.5 h-3.5 text-red-400" />
              </button>
            </div>

            {/* Type */}
            <div>
              <p className={label}>Type</p>
              <div className="flex gap-2">
                {['comprehension', 'vocabulary'].map((t) => (
                  <button key={t} onClick={() => update(i, 'type', t)}
                    className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all
                      ${q.type === t ? 'bg-olive-dark text-text_light' : 'bg-neutral_tone/30 text-olive/70 hover:bg-neutral_tone/50'}`}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Question text */}
            <div>
              <p className={label}>Question</p>
              <textarea value={q.text} onChange={(e) => update(i, 'text', e.target.value)}
                placeholder="What does this passage suggest about..." className={ta} rows={2} />
            </div>

            {/* Options */}
            <div>
              <p className={label}>Answer Options — click the letter to mark correct</p>
              <div className="space-y-2">
                {q.options.map((opt, oi) => (
                  <div key={oi} className="flex items-center gap-2">
                    <button onClick={() => update(i, 'correct_index', oi)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold transition-all
                        ${q.correct_index === oi ? 'bg-olive-dark text-text_light' : 'bg-neutral_tone/40 text-olive/60 hover:bg-neutral_tone/60'}`}>
                      {String.fromCharCode(65 + oi)}
                    </button>
                    <input value={opt} onChange={(e) => updateOption(i, oi, e.target.value)}
                      placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                      className={`flex-1 bg-cream rounded-xl px-3 py-2 text-sm text-olive-dark placeholder:text-olive/30 border transition-colors
                        ${q.correct_index === oi ? 'border-olive-dark/40' : 'border-neutral_tone/40'} focus:outline-none focus:border-sage`} />
                    {q.correct_index === oi && (
                      <CheckCircle2 className="w-4 h-4 text-olive-dark flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Explanation */}
            <div>
              <p className={label}>Explanation (shown after answering)</p>
              <textarea value={q.explanation} onChange={(e) => update(i, 'explanation', e.target.value)}
                placeholder="Explain why the correct answer is right..." className={ta} rows={2} />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {questions.length < 6 && (
        <button onClick={add}
          className="w-full h-11 border-2 border-dashed border-neutral_tone/50 rounded-2xl flex items-center justify-center gap-2 text-sm text-olive/50 hover:border-sage hover:text-olive-dark transition-all">
          <Plus className="w-4 h-4" /> Add Question
        </button>
      )}
      {questions.length >= 6 && (
        <p className="text-center text-xs text-olive/40">Maximum 6 questions reached</p>
      )}
    </div>
  );
}

// ─── Content Editor View ──────────────────────────────────────
function ContentEditor({ node, existingContent, onBack, onSaved }) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('intro');
  const [saved, setSaved]         = useState(false);

  const [intro, setIntro] = useState({
    guidance:    existingContent?.intro_guidance   || '',
    source:      existingContent?.intro_source     || '',
    sourceUrl:   existingContent?.intro_source_url || '',
    readingTime: existingContent?.reading_time     || '',
  });

  const [slides, setSlides]       = useState(
    existingContent?.slides_json ? JSON.parse(existingContent.slides_json) : [{ ...EMPTY_SLIDE }]
  );
  const [questions, setQuestions] = useState(
    existingContent?.questions_json ? JSON.parse(existingContent.questions_json) : [{ ...EMPTY_QUESTION, options: ['','','',''] }]
  );

  const saveMut = useMutation({
    mutationFn: async () => {
      const payload = {
        node_id:          node.id,
        intro_guidance:   intro.guidance,
        intro_source:     intro.source,
        intro_source_url: intro.sourceUrl,
        reading_time:     intro.readingTime,
        slides_json:      JSON.stringify(slides),
        questions_json:   JSON.stringify(questions),
      };
      if (existingContent?.id) {
        await LessonContent.update(existingContent.id, payload);
      } else {
        await LessonContent.create(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessonContent'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      onSaved?.();
    },
  });

  const tabs = [
    { id: 'intro',     label: 'Intro',     icon: BookOpen },
    { id: 'slides',    label: 'Slides',    icon: Layers,     count: slides.length },
    { id: 'quiz',      label: 'Quiz',      icon: LayoutList, count: questions.length },
  ];

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-lg mx-auto px-5 pt-10 pb-32">
        {/* Header */}
        <div className="flex items-start gap-3 mb-6">
          <button onClick={onBack}
            className="w-9 h-9 rounded-full bg-cream-dark flex items-center justify-center hover:bg-neutral_tone/50 transition-colors flex-shrink-0 mt-0.5">
            <ChevronLeft className="w-5 h-5 text-olive-dark" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-olive/50 uppercase tracking-wider mb-0.5">Editing content for</p>
            <h1 className="text-lg font-semibold text-olive-dark leading-tight">{node.title}</h1>
            <p className="text-xs text-olive/60 capitalize mt-0.5">{node.category} · {node.genre}</p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-1 p-1 bg-cream-dark rounded-2xl mb-6">
          {tabs.map(({ id, label, icon: Icon, count }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all
                ${activeTab === id ? 'bg-olive-dark text-text_light shadow-sm' : 'text-olive/60 hover:text-olive-dark'}`}>
              <Icon className="w-3.5 h-3.5" />
              {label}
              {count !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold
                  ${activeTab === id ? 'bg-white/20 text-white' : 'bg-neutral_tone/40 text-olive/60'}`}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>

            {activeTab === 'intro' && (
              <Section title="Lesson Introduction" subtitle="What students see before starting">
                <div className="space-y-4">
                  <div>
                    <p className={label}>Guidance Text</p>
                    <textarea value={intro.guidance} onChange={(e) => setIntro({ ...intro, guidance: e.target.value })}
                      placeholder="Tell students what to read and why it matters for this lesson..."
                      className={ta} rows={4} />
                  </div>
                  <div>
                    <p className={label}>Source Name</p>
                    <input value={intro.source} onChange={(e) => setIntro({ ...intro, source: e.target.value })}
                      placeholder="e.g. Homer — The Odyssey, Book 9 (c. 800 BCE)" className={inp} />
                  </div>
                  <div>
                    <p className={label}>Source URL</p>
                    <input type="url" value={intro.sourceUrl} onChange={(e) => setIntro({ ...intro, sourceUrl: e.target.value })}
                      placeholder="https://..." className={inp} />
                  </div>
                  <div>
                    <p className={label}>Estimated Reading Time</p>
                    <input value={intro.readingTime} onChange={(e) => setIntro({ ...intro, readingTime: e.target.value })}
                      placeholder="e.g. ~30 minutes" className={inp} />
                  </div>
                </div>
              </Section>
            )}

            {activeTab === 'slides' && (
              <Section title="Lesson Slides" subtitle="Up to 5 slides shown after the intro">
                <SlideEditor slides={slides} onChange={setSlides} />
              </Section>
            )}

            {activeTab === 'quiz' && (
              <Section title="Quiz Questions" subtitle="Up to 6 questions at the end of the lesson">
                <QuestionEditor questions={questions} onChange={setQuestions} />
              </Section>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Sticky save bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-cream/90 backdrop-blur-sm border-t border-neutral_tone/30 px-5 py-4"
        style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}>
        <div className="max-w-lg mx-auto">
          <AnimatePresence mode="wait">
            {saved ? (
              <motion.div key="saved" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="h-12 bg-sage/40 rounded-2xl flex items-center justify-center gap-2 text-sm font-semibold text-olive-dark">
                <CheckCircle2 className="w-4 h-4" /> Saved successfully
              </motion.div>
            ) : (
              <motion.div key="save" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <DuoButton onClick={() => saveMut.mutate()} disabled={saveMut.isPending} pulse>
                  {saveMut.isPending
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                    : <><Save className="w-4 h-4" /> Save All Changes</>}
                </DuoButton>
                {saveMut.isError && (
                  <p className="text-xs text-red-500 text-center mt-2 flex items-center justify-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {saveMut.error?.message || 'Save failed'}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ─── Node list item ───────────────────────────────────────────
function NodeRow({ node, content, onEdit, onEditContent, onDelete, index }) {
  const hasContent = !!content;
  const slideCount = hasContent ? JSON.parse(content.slides_json || '[]').length : 0;
  const quizCount  = hasContent ? JSON.parse(content.questions_json || '[]').length : 0;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }} layout
      className="bg-cream-dark rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 p-4">
        {/* Order badge */}
        <div className="w-8 h-8 bg-olive-dark/10 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-bold text-olive-dark">{node.order}</span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-olive-dark truncate">{node.title}</p>
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
              style={{ backgroundColor: 'rgba(65,67,35,0.1)', color: '#414323' }}>
              Unit {node.unit || 1}
            </span>
            <span className="text-[10px] text-olive/50 capitalize">{node.genre}</span>
            {hasContent && (
              <span className="text-[10px] text-olive-dark bg-sage/40 px-1.5 py-0.5 rounded-full font-medium">
                {slideCount}s · {quizCount}q
              </span>
            )}
            {!hasContent && (
              <span className="text-[10px] text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded-full font-medium">
                static
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={() => onEditContent(node)}
            className="flex items-center gap-1 px-2.5 h-8 bg-olive-dark text-text_light rounded-full text-[11px] font-semibold hover:bg-olive transition-colors"
            style={{ boxShadow: '0 2px 0 #252611' }}>
            <Layers className="w-3 h-3" /> Content
          </button>
          <button onClick={() => onEdit(node)}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-neutral_tone/50 transition-colors">
            <Pencil className="w-3.5 h-3.5 text-olive/60" />
          </button>
          <button onClick={() => onDelete(node.id)}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-50 transition-colors">
            <Trash2 className="w-3.5 h-3.5 text-red-400" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Node form (modal-style inline panel) ────────────────────
function NodeForm({ node, onSave, onCancel, isSaving, existingNodes }) {
  const [form, setForm] = useState(
    node
      ? { title: node.title, description: node.description || '', order: node.order,
          icon: node.icon || 'book-open', category: node.category || 'foundations',
          genre: node.genre || 'classics', unit: node.unit || 1 }
      : { ...EMPTY_NODE }
  );

  // Derive how many units exist from existing nodes
  const maxUnit = Math.max(1, ...existingNodes.map((n) => n.unit || 1));
  const unitOptions = Array.from({ length: maxUnit + 1 }, (_, i) => i + 1);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="bg-cream-dark rounded-2xl p-5 space-y-4 border-2 border-olive-dark/20">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-olive-dark">{node ? 'Edit Node' : 'New Node'}</p>
        <button onClick={onCancel}
          className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-neutral_tone/50 transition-colors">
          <X className="w-4 h-4 text-olive/60" />
        </button>
      </div>

      <div>
        <p className={label}>Title</p>
        <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="e.g. What is Literature?" className={inp} />
      </div>
      <div>
        <p className={label}>Description</p>
        <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Brief description shown on hover" className={inp} />
      </div>

      {/* Unit / Section picker */}
      <div>
        <p className={label}>Section / Unit</p>
        <div className="flex flex-wrap gap-2">
          {unitOptions.map((u) => (
            <button key={u} onClick={() => setForm({ ...form, unit: u })}
              className="flex flex-col items-center px-3 py-2 rounded-xl text-xs font-semibold transition-all"
              style={{
                backgroundColor: form.unit === u ? '#414323' : 'rgba(65,67,35,0.07)',
                color: form.unit === u ? '#F3F2EA' : '#414323',
                boxShadow: form.unit === u ? '0 2px 0 #252611' : 'none',
              }}>
              <span className="font-bold">Unit {u}</span>
              <span className="text-[9px] mt-0.5 opacity-70">
                {UNIT_NAMES[u - 1] || `Section ${u}`}
              </span>
            </button>
          ))}
          {/* New unit button */}
          <button onClick={() => setForm({ ...form, unit: maxUnit + 1 })}
            className="flex flex-col items-center px-3 py-2 rounded-xl text-xs font-semibold border-2 border-dashed transition-all"
            style={{
              borderColor: form.unit === maxUnit + 1 ? '#414323' : 'rgba(65,67,35,0.2)',
              color: 'rgba(65,67,35,0.5)',
            }}>
            <span>+ New</span>
            <span className="text-[9px] mt-0.5">Unit {maxUnit + 1}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className={label}>Order # within unit</p>
          <input type="number" min="1" value={form.order}
            onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 1 })} className={inp} />
        </div>
        <div>
          <p className={label}>Icon</p>
          <select value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className={sel}>
            {ICONS.map((i) => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>
        <div>
          <p className={label}>Category</p>
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={sel}>
            {CATEGORIES.map((c) => <option key={c} value={c} className="capitalize">{c}</option>)}
          </select>
        </div>
        <div>
          <p className={label}>Genre</p>
          <select value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })} className={sel}>
            {GENRES.map((g) => <option key={g} value={g} className="capitalize">{g}</option>)}
          </select>
        </div>
      </div>
      <DuoButton onClick={() => onSave(form)} disabled={!form.title || isSaving}>
        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : node ? 'Save Changes' : 'Create Node'}
      </DuoButton>
    </motion.div>
  );
}

// ─── Main Admin Page ──────────────────────────────────────────
export default function Admin() {
  const { user }    = useAuth();
  const navigate    = useNavigate();
  const queryClient = useQueryClient();

  const [view, setView]               = useState('list'); // 'list' | 'content'
  const [editingNode, setEditingNode] = useState(null);   // node being edited in form
  const [showForm, setShowForm]       = useState(false);
  const [contentNode, setContentNode] = useState(null);   // node whose content we're editing

  // Auth guard
  if (user && user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center gap-4 px-5">
        <div className="w-14 h-14 bg-cream-dark rounded-2xl flex items-center justify-center">
          <AlertCircle className="w-6 h-6 text-olive/40" />
        </div>
        <p className="text-sm text-olive/70 text-center">This area is for admins only.</p>
        <button onClick={() => navigate(createPageUrl('LearningTree'))}
          className="text-olive-dark text-sm font-medium underline underline-offset-2">
          Back to app
        </button>
      </div>
    );
  }

  const { data: nodes = [], isLoading } = useQuery({
    queryKey: ['learningNodes'],
    queryFn: LearningNode.list,
  });

  const { data: contents = [] } = useQuery({
    queryKey: ['lessonContent'],
    queryFn: LessonContent.list,
  });

  const saveMut = useMutation({
    mutationFn: (form) => editingNode
      ? LearningNode.update(editingNode.id, form)
      : LearningNode.create(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learningNodes'] });
      setShowForm(false); setEditingNode(null);
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id) => LearningNode.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['learningNodes'] }),
  });

  const openEdit = (node) => { setEditingNode(node); setShowForm(true); };
  const openContent = (node) => { setContentNode(node); setView('content'); };

  const contentComplete = contents.filter((c) => {
    const slides = JSON.parse(c.slides_json || '[]');
    const qs     = JSON.parse(c.questions_json || '[]');
    return slides.length > 0 && qs.length > 0;
  }).length;

  // Content editor view
  if (view === 'content' && contentNode) {
    const existing = contents.find((c) => c.node_id === contentNode.id);
    return (
      <ContentEditor
        node={contentNode}
        existingContent={existing}
        onBack={() => setView('list')}
        onSaved={() => {}}
      />
    );
  }

  // Main list view
  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-lg mx-auto px-5 pt-10 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-semibold text-olive-dark">Content Admin</h1>
            <p className="text-sm text-olive/60 mt-0.5">
              {contentComplete} of {nodes.length} lessons have full content
            </p>
          </div>
          <button onClick={() => { setEditingNode(null); setShowForm(true); }}
            className="flex items-center gap-1.5 bg-olive-dark text-text_light text-sm font-semibold px-4 h-9 rounded-full"
            style={{ boxShadow: '0 3px 0 #252611' }}>
            <Plus className="w-3.5 h-3.5" /> New Node
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-neutral_tone/30 rounded-full overflow-hidden mb-8">
          <motion.div animate={{ width: nodes.length ? `${(contentComplete / nodes.length) * 100}%` : '0%' }}
            transition={{ duration: 0.8 }} className="h-full bg-olive-dark rounded-full" />
        </div>

        {/* Inline node form */}
        <AnimatePresence>
          {showForm && (
            <motion.div className="mb-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <NodeForm
                node={editingNode}
                onSave={(form) => saveMut.mutate(form)}
                onCancel={() => { setShowForm(false); setEditingNode(null); }}
                isSaving={saveMut.isPending}
                existingNodes={nodes}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Node list */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 text-olive animate-spin" />
          </div>
        ) : (
          <div className="space-y-2">
            {nodes.map((node, i) => (
              <NodeRow
                key={node.id}
                node={node}
                content={contents.find((c) => c.node_id === node.id)}
                index={i}
                onEdit={openEdit}
                onEditContent={openContent}
                onDelete={(id) => deleteMut.mutate(id)}
              />
            ))}
            {nodes.length === 0 && !isLoading && (
              <div className="text-center py-16 text-olive/50">
                <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No nodes yet — create your first one</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
