import React, { useState } from 'react';
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
function LessonNode({ node, status, score, slot, index, onClick }) {
  const Icon       = ICON_MAP[node.icon] || BookOpen;
  const genre      = getGenre(node.genre || 'classics');
  const isLocked   = status === 'locked';
  const isComplete = status === 'completed';
  const isActive   = status === 'available' || status === 'in_progress';

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
          style={{ inset: -10, backgroundColor: genre.glowColor }}
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
          backgroundColor: isComplete ? genre.nodeColor
            : isActive      ? 'rgba(245,243,235,0.96)'
            : 'rgba(190,186,178,0.85)',
          boxShadow: isLocked  ? 'none'
            : isComplete ? `0 4px 0 ${genre.nodeColor}BB, 0 6px 22px ${genre.glowColor}`
            : isActive   ? `0 4px 0 rgba(65,67,35,0.22), 0 4px 18px ${genre.glowColor}`
            : '0 2px 0 rgba(140,136,126,0.5)',
          border: isComplete ? 'none'
            : isActive ? `2.5px solid ${genre.nodeColor}`
            : '2.5px solid rgba(170,166,156,0.7)',
          backdropFilter: 'blur(3px)',
          transition: 'transform 0.1s, box-shadow 0.1s',
        }}
        onMouseDown={(e) => { if (!isLocked) e.currentTarget.style.transform = 'translateY(3px) scale(0.93)'; }}
        onMouseUp={(e)   => { e.currentTarget.style.transform = ''; }}
        onMouseLeave={(e)=> { e.currentTarget.style.transform = ''; }}>

        {isLocked
          ? <Lock style={{ width: 18, height: 18, color: '#A8A49A' }} />
          : <Icon style={{ width: 22, height: 22, color: isComplete ? '#fff' : genre.nodeColor }} />
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
              color: genre.nodeColor,
              fill: s <= score ? genre.nodeColor : 'none'
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
function UnitBanner({ label, isLocked, slotY }) {
  return (
    <div className="absolute left-0 right-0 flex justify-center px-8 z-30"
      style={{ bottom: `calc(100% - ${slotY - 72}px)` }}>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 px-4 py-2 rounded-xl"
        style={{
          backgroundColor: isLocked ? 'rgba(195,191,183,0.88)' : 'rgba(60,62,25,0.91)',
          backdropFilter: 'blur(10px)',
          boxShadow: isLocked ? 'none' : '0 3px 0 rgba(30,31,12,0.5), 0 6px 24px rgba(65,67,35,0.18)',
        }}>
        {isLocked && <Lock style={{ width: 11, height: 11, color: '#A8A49A' }} />}
        <div>
          <p className="text-[8px] font-bold uppercase tracking-widest"
            style={{ color: isLocked ? '#A8A49A' : 'rgba(243,242,234,0.5)' }}>
            {isLocked ? 'Locked' : 'Unit'}
          </p>
          <p className="text-xs font-semibold leading-tight"
            style={{ color: isLocked ? '#A8A49A' : '#F3F2EA' }}>
            {label}
          </p>
        </div>
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
        return Math.floor(i / UNIT_SIZE) * UNIT_SIZE;
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
      <div className="flex-shrink-0 px-5 pt-10 pb-3 max-w-lg mx-auto w-full" style={{ zIndex: 30, position: 'relative' }}>
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
      </div>

      {/* ── Scrollable tree canvas ── */}
      <div className="flex-1 overflow-y-auto relative max-w-lg mx-auto w-full pb-24"
        style={{ overscrollBehavior: 'contain' }}>

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
              const gi   = nodes.indexOf(node);
              const slot = layout.leafSlots[index];
              if (!slot) return null;
              return (
                <LessonNode key={node.id} node={node}
                  status={getNodeStatus(node, gi)}
                  score={getNodeScore(node)}
                  slot={slot} index={index}
                  onClick={setSelectedNode} />
              );
            })}

            {/* Unit banners — before each unit of 5 */}
            {filteredNodes.map((node, index) => {
              if (index % UNIT_SIZE !== 0) return null;
              const slot       = layout.leafSlots[index];
              if (!slot) return null;
              const unitIndex  = Math.floor(index / UNIT_SIZE);
              const unitName   = UNIT_NAMES[unitIndex] || `Unit ${unitIndex + 1}`;
              const unitLocked = index >= firstLockedUnit;
              return (
                <UnitBanner key={`unit-${index}`}
                  label={unitName} isLocked={unitLocked} slotY={slot.y} />
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
