import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2, Lock, Star, BookOpen, Layers, Feather, Landmark, Crown,
  Sparkles, Flower2, Mic, BookMarked, Globe, ChevronRight, Play
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { LearningNode, UserProgress } from '@/api/supabase';
import { createPageUrl } from '@/utils';
import GenreFilter from '@/components/tree/GenreFilter';
import TreeBackground from '@/components/tree/TreeBackground';
import { buildTreeLayout, NODE_GAP, W } from '@/components/tree/treeLayout';
import { getGenre } from '@/components/tree/genreConfig';
import BottomNav from '@/components/navigation/BottomNav';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import DuoButton from '@/components/ui/DuoButton';

const ICON_MAP = {
  'book-open': BookOpen, 'layers': Layers, 'feather': Feather, 'landmark': Landmark,
  'crown': Crown, 'sparkles': Sparkles, 'flower-2': Flower2, 'mic': Mic,
  'book-marked': BookMarked, 'globe': Globe,
};

const TREE_TOP_PAD = 160;

// ─── Lesson node — sits ON the leaf ──────────────────────────
function LessonNode({ node, status, score, slot, index, unitColor, onClick }) {
  const Icon       = ICON_MAP[node.icon] || BookOpen;
  const genre      = getGenre(node.genre || 'classics');
  const isLocked   = status === 'locked';
  const isComplete = status === 'completed';
  const isActive   = status === 'available' || status === 'in_progress';

  // Use unit colour for active/complete states, genre colour as fallback
  const activeColor = unitColor?.bg    || genre.nodeColor;
  const glowColor   = unitColor?.bg    ? `${unitColor.bg}55` : genre.glowColor;
  const iconColor   = isComplete ? (unitColor?.text || '#fff') : (unitColor?.bg || genre.nodeColor);
  // Convert SVG coordinates to CSS percent positions
  // slot.x / W gives us the fraction across the 400px viewBox
  const leftPct = (slot.x / W) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.4 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 280, damping: 20 }}
      className="absolute flex flex-col items-center"
      style={{
        // Position from bottom to match SVG coordinate system
        bottom: `calc(100% - ${slot.y}px)`,
        left:   `${leftPct}%`,
        transform: 'translateX(-50%)',
        zIndex: 20,
        // Gentle sway matching the leaf underneath
        animation: `nodeSway ${slot.swayDur}s ease-in-out ${slot.swayDelay}s infinite alternate`,
      }}>

      {/* Active glow ring */}
      {isActive && (
        <motion.div className="absolute rounded-full pointer-events-none"
          style={{ inset: -10, backgroundColor: glowColor }}
          animate={{ opacity: [0.5, 0, 0.5], scale: [0.82, 1.18, 0.82] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }} />
      )}

      {/* The button itself */}
      <button
        onClick={() => !isLocked && onClick(node)}
        disabled={isLocked}
        className="relative flex items-center justify-center rounded-full select-none"
        style={{
          width: 52, height: 52,
          cursor: isLocked ? 'default' : 'pointer',
          backgroundColor: isComplete ? activeColor
            : isActive      ? 'rgba(245,243,235,0.96)'
            : 'rgba(190,186,178,0.85)',
          boxShadow: isLocked  ? 'none'
            : isComplete ? `0 4px 0 ${unitColor?.shadow || activeColor}BB, 0 6px 22px ${glowColor}`
            : isActive   ? `0 4px 0 rgba(65,67,35,0.22), 0 4px 18px ${glowColor}`
            : '0 2px 0 rgba(140,136,126,0.5)',
          border: isComplete ? 'none'
            : isActive ? `2.5px solid ${activeColor}`
            : '2.5px solid rgba(170,166,156,0.7)',
          backdropFilter: 'blur(3px)',
          transition: 'transform 0.1s, box-shadow 0.1s',
        }}
        onMouseDown={(e) => { if (!isLocked) e.currentTarget.style.transform = 'translateY(3px) scale(0.93)'; }}
        onMouseUp={(e)   => { e.currentTarget.style.transform = ''; }}
        onMouseLeave={(e)=> { e.currentTarget.style.transform = ''; }}>

        {isLocked
          ? <Lock style={{ width: 18, height: 18, color: '#A8A49A' }} />
          : <Icon style={{ width: 22, height: 22, color: iconColor }} />
        }

        {status === 'in_progress' && (
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-cream flex items-center justify-center"
            style={{ backgroundColor: '#414323' }}>
            <Play style={{ width: 6, height: 6, color: '#F3F2EA', fill: '#F3F2EA' }} />
          </div>
        )}
      </button>

      {/* Stars */}
      {isComplete && (
        <div className="flex gap-0.5 mt-1">
          {[1,2,3].map((s) => (
            <Star key={s} style={{
              width: 9, height: 9,
              color: activeColor,
              fill: s <= score ? activeColor : 'none'
            }} strokeWidth={1.5} />
          ))}
        </div>
      )}

      {/* Parchment label tag */}
      <div className="mt-1.5 px-2 py-0.5 rounded-md max-w-[80px] text-center"
        style={{
          backgroundColor: isLocked
            ? 'rgba(185,181,173,0.82)'
            : 'rgba(240,237,224,0.93)',
          backdropFilter: 'blur(4px)',
          boxShadow: isLocked ? 'none' : '0 1px 5px rgba(65,67,35,0.13)',
          border: isLocked ? 'none' : '1px solid rgba(65,67,35,0.07)',
        }}>
        <p className="text-[9px] font-semibold leading-snug"
          style={{ color: isLocked ? '#A8A49A' : '#414323' }}>
          {node.title}
        </p>
      </div>
    </motion.div>
  );
}

// ─── Unit banner ──────────────────────────────────────────────
// Unit colours — each unit has its own identity like Duolingo sections
const UNIT_COLORS = [
  { bg: '#5A6E35', shadow: '#3A4820', text: '#F3F2EA', accent: '#ADB684' },
  { bg: '#7A5C30', shadow: '#4E3A1A', text: '#F3F2EA', accent: '#C8A86A' },
  { bg: '#3A6058', shadow: '#223830', text: '#F3F2EA', accent: '#7ABFB4' },
  { bg: '#5A3A6E', shadow: '#38225A', text: '#F3F2EA', accent: '#B07ACC' },
];

function UnitBanner({ label, unitIndex, isLocked, bottomPx }) {
  const colors = UNIT_COLORS[unitIndex % UNIT_COLORS.length];
  return (
    <div className="absolute left-0 right-0 z-30 px-5" style={{ bottom: bottomPx }}>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="w-full rounded-2xl overflow-hidden"
        style={{
          backgroundColor: isLocked ? 'rgba(190,186,178,0.9)' : colors.bg,
          boxShadow: isLocked ? 'none' : `0 4px 0 ${colors.shadow}, 0 8px 28px ${colors.shadow}88`,
        }}>
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            {isLocked
              ? <div className="w-8 h-8 rounded-full bg-neutral_tone/40 flex items-center justify-center">
                  <Lock style={{ width: 14, height: 14, color: '#A8A49A' }} />
                </div>
              : <div className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: colors.shadow }}>
                  <span className="text-sm font-bold" style={{ color: colors.accent }}>
                    {unitIndex + 1}
                  </span>
                </div>
            }
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest mb-0.5"
                style={{ color: isLocked ? '#A8A49A' : `${colors.text}88` }}>
                {isLocked ? 'Locked Section' : `Unit ${unitIndex + 1}`}
              </p>
              <p className="text-sm font-semibold leading-none"
                style={{ color: isLocked ? '#A8A49A' : colors.text }}>
                {label}
              </p>
            </div>
          </div>
          {!isLocked && (
            <div className="flex gap-1">
              {[0,1,2].map((d) => (
                <div key={d} className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: colors.accent, opacity: 0.4 + d * 0.25 }} />
              ))}
            </div>
          )}
        </div>
        {!isLocked && <div className="h-1 w-full" style={{ backgroundColor: colors.shadow }} />}
      </motion.div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────
export default function LearningTree() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedNode, setSelectedNode] = useState(null);
  const [activeGenre, setActiveGenre]   = useState('all');
  const scrollRef = useRef(null);
  const didScroll = useRef(false); // only auto-scroll once on load

  const { data: nodes = [], isLoading: nodesLoading } = useQuery({
    queryKey: ['learningNodes'],
    queryFn: LearningNode.list,
  });

  const { data: progress = [], isLoading: progressLoading } = useQuery({
    queryKey: ['userProgress', user?.email],
    queryFn: () => UserProgress.filter({ user_email: user.email }),
    enabled: !!user?.email,
  });

  const getNodeStatus = (node, index) => {
    const prog = progress.find((p) => p.node_id === node.id);
    if (prog) return prog.status;
    if (index === 0) return 'available';
    const prev = progress.find((p) => p.node_id === nodes[index - 1]?.id);
    if (prev?.status === 'completed') return 'available';
    return 'locked';
  };

  const getNodeScore = (node) => progress.find((p) => p.node_id === node.id)?.score || 0;

  // Auto-scroll to the active/current lesson on first load
  useEffect(() => {
    if (isLoading || didScroll.current || !scrollRef.current || filteredNodes.length === 0) return;
    didScroll.current = true;

    // Find the first non-completed node (current progress point)
    // or scroll to bottom if no progress at all
    let targetIndex = 0; // default: bottom (lesson 0)
    for (let i = 0; i < filteredNodes.length; i++) {
      const gi     = nodes.indexOf(filteredNodes[i]);
      const status = getNodeStatus(filteredNodes[i], gi);
      if (status === 'available' || status === 'in_progress') {
        targetIndex = i;
        break;
      }
      if (status === 'locked' && i === 0) {
        targetIndex = 0; // no progress, go to bottom
        break;
      }
    }

    const slot = layout.leafSlots[targetIndex];
    if (!slot) return;

    // slot.y is SVG y from top. Convert to scroll position:
    // scrollable content height = treeHeight, slot.y from top = slot.y
    // We want the node centred in the viewport, offset by ~200px for header
    const scrollTarget = slot.y - 300;
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: Math.max(0, scrollTarget), behavior: 'smooth' });
    }, 400); // slight delay so tree has rendered
  }, [isLoading, filteredNodes.length]);

  const handleStartLesson = (node) => {
    setSelectedNode(null);
    navigate(createPageUrl(`Lesson?node_id=${node.id}`));
  };

  const isLoading      = nodesLoading || progressLoading;
  const completedCount = progress.filter((p) => p.status === 'completed').length;
  const filteredNodes  = activeGenre === 'all' ? nodes : nodes.filter((n) => n.genre === activeGenre);
  const genreConfig    = getGenre(activeGenre);

  const UNIT_SIZE  = 5;
  const UNIT_NAMES = ['Foundations', 'Classical World', 'Modern Era', 'Advanced Study'];

  // Compute tree height and layout from actual node count
  const treeHeight = 100 + filteredNodes.length * NODE_GAP + TREE_TOP_PAD;
  const layout     = buildTreeLayout(filteredNodes.length, treeHeight);

  const firstLockedUnit = (() => {
    for (let i = 0; i < filteredNodes.length; i++) {
      const gi = nodes.indexOf(filteredNodes[i]);
      if (getNodeStatus(filteredNodes[i], gi) === 'locked') {
        // Unit is locked only if the very first node of that unit is locked
        const unitStart = Math.floor(i / UNIT_SIZE) * UNIT_SIZE;
        const firstNodeOfUnit = filteredNodes[unitStart];
        const firstGi = nodes.indexOf(firstNodeOfUnit);
        if (firstNodeOfUnit && getNodeStatus(firstNodeOfUnit, firstGi) === 'locked') {
          return unitStart;
        }
      }
    }
    return filteredNodes.length;
  })();

  const selectedStatus = selectedNode
    ? (progress.find((p) => p.node_id === selectedNode.id)?.status || 'available')
    : null;

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden" style={{ backgroundColor: '#EAE7DA' }}>

      {/* Inline keyframe for the node sway — mirrors the SVG leaf sway */}
      <style>{`
        @keyframes nodeSway {
          0%   { transform: translateX(-50%) rotate(-1.8deg); }
          100% { transform: translateX(-50%) rotate(1.8deg);  }
        }
      `}</style>

      {/* ── Header ── */}
      <div className="flex-shrink-0 w-full"
        style={{
          zIndex: 30, position: 'relative',
          backgroundColor: 'rgba(208,204,188,0.65)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(65,67,35,0.1)',
        }}>
        <div className="px-5 pt-10 pb-4 max-w-lg mx-auto">
        <div className="flex items-end justify-between mb-1">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-olive/40 mb-0.5">Your Reading Path</p>
            <h1 className="text-2xl font-semibold text-olive-dark leading-tight">Climb the Tree</h1>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-olive-dark leading-none">{completedCount}</p>
            <p className="text-[10px] text-olive/50 mt-0.5">of {nodes.length} done</p>
          </div>
        </div>
        <p className="text-xs text-olive/55 mb-3 leading-relaxed">
          Each leaf holds a lesson. Start at the roots — complete one to unlock the next.
        </p>

        {/* Progress bar */}
        <div className="w-full h-2 rounded-full overflow-hidden mb-3"
          style={{ backgroundColor: 'rgba(65,67,35,0.1)' }}>
          <motion.div animate={{ width: `${nodes.length ? (completedCount / nodes.length) * 100 : 0}%` }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ backgroundColor: genreConfig.progressColor,
              boxShadow: `0 0 8px ${genreConfig.glowColor}` }} />
        </div>

        <GenreFilter selected={activeGenre} onSelect={setActiveGenre} />
        </div> {/* end inner max-w-lg */}
      </div> {/* end header tinted band */}

      {/* ── Scrollable tree canvas ── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto relative max-w-lg mx-auto w-full"
        style={{ overscrollBehavior: 'contain', paddingBottom: 'calc(6rem + env(safe-area-inset-bottom))' }}>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-6 h-6 text-olive animate-spin" />
          </div>
        ) : (
          <div className="relative w-full" style={{ height: treeHeight }}>

            {/* SVG tree — leaves drawn at computed slot positions */}
            <TreeBackground totalHeight={treeHeight} nodeCount={filteredNodes.length} />

            {/* Lesson nodes — each positioned at its leaf's SVG centre */}
            {filteredNodes.map((node, index) => {
              const gi        = nodes.indexOf(node);
              const slot      = layout.leafSlots[index];
              if (!slot) return null;
              const unitIndex = Math.floor(index / UNIT_SIZE);
              const unitColor = UNIT_COLORS[unitIndex % UNIT_COLORS.length];
              return (
                <LessonNode key={node.id} node={node}
                  status={getNodeStatus(node, gi)}
                  score={getNodeScore(node)}
                  slot={slot} index={index}
                  unitColor={unitColor}
                  onClick={setSelectedNode} />
              );
            })}

            {/* Unit banners — divider sitting just below first node of each unit */}
            {filteredNodes.map((node, index) => {
              if (index % UNIT_SIZE !== 0) return null;
              const slot      = layout.leafSlots[index];
              if (!slot) return null;
              const unitIndex  = Math.floor(index / UNIT_SIZE);
              const unitName   = UNIT_NAMES[unitIndex] || `Unit ${unitIndex + 1}`;
              const unitLocked = index >= firstLockedUnit;
              // Convert SVG y to bottom-offset: SVG y=0 is top, bottom offset = treeHeight - svgY
              // Place banner 100px below the first node of this unit
              const bannerBottom = treeHeight - slot.y - 110;
              return (
                <UnitBanner key={`unit-${index}`}
                  label={unitName} unitIndex={unitIndex}
                  isLocked={unitLocked} bottomPx={bannerBottom} />
              );
            })}

            {/* Crown of tree */}
            <div className="absolute left-0 right-0 flex justify-center" style={{ top: 24 }}>
              <p className="text-[11px] text-olive/35 font-medium px-3 py-1 rounded-full"
                style={{ backgroundColor: 'rgba(234,231,218,0.7)', backdropFilter: 'blur(4px)' }}>
                More lessons coming soon ✦
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Tap dialog ── */}
      <Dialog open={!!selectedNode} onOpenChange={() => setSelectedNode(null)}>
        <DialogContent className="mx-4 border-neutral_tone/30"
          style={{ backgroundColor: '#F5F3EB', borderRadius: '1.5rem' }}>
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              {selectedNode && (() => {
                const Icon = ICON_MAP[selectedNode.icon] || BookOpen;
                const g    = getGenre(selectedNode.genre || 'classics');
                return (
                  <div className="flex-shrink-0 rounded-full flex items-center justify-center"
                    style={{ width: 50, height: 50, backgroundColor: g.nodeColor,
                      boxShadow: `0 4px 14px ${g.glowColor}` }}>
                    <Icon style={{ width: 20, height: 20, color: '#fff' }} />
                  </div>
                );
              })()}
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-olive-dark text-left leading-snug">
                  {selectedNode?.title}
                </DialogTitle>
                <p className="text-xs text-olive/50 capitalize mt-0.5">
                  {selectedNode?.genre} · {selectedNode?.category}
                </p>
              </div>
            </div>
            {selectedNode?.description && (
              <DialogDescription className="text-olive/70 text-sm leading-relaxed text-left">
                {selectedNode.description}
              </DialogDescription>
            )}
          </DialogHeader>

          {selectedStatus === 'completed' && (() => {
            const sc = getNodeScore(selectedNode);
            const g  = getGenre(selectedNode?.genre || 'classics');
            return (
              <div className="flex items-center gap-1.5 py-1">
                {[1,2,3].map((s) => (
                  <Star key={s} style={{ width: 17, height: 17, color: g.nodeColor,
                    fill: s <= sc ? g.nodeColor : 'none' }} strokeWidth={1.5} />
                ))}
                <span className="text-xs text-olive/50 ml-1">
                  {sc === 3 ? 'Perfect score!' : `${sc}/3 stars`}
                </span>
              </div>
            );
          })()}

          <DuoButton
            pulse={selectedStatus === 'available' || selectedStatus === 'in_progress'}
            onClick={() => handleStartLesson(selectedNode)}
            color={getGenre(selectedNode?.genre || 'classics').nodeColor}
            shadowColor={getGenre(selectedNode?.genre || 'classics').nodeColor + '99'}
            textColor="#fff">
            {selectedStatus === 'in_progress' ? 'Continue Lesson'
              : selectedStatus === 'completed' ? 'Review Lesson'
              : 'Start Lesson'}
            <ChevronRight style={{ width: 15, height: 15, marginLeft: 4 }} />
          </DuoButton>
        </DialogContent>
      </Dialog>

      <BottomNav currentPage="LearningTree" />
    </div>
  );
}
