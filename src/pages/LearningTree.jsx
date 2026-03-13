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
import { getGenre } from '@/components/tree/genreConfig';
import BottomNav from '@/components/navigation/BottomNav';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import DuoButton from '@/components/ui/DuoButton';

const ICON_MAP = {
  'book-open': BookOpen, 'layers': Layers, 'feather': Feather, 'landmark': Landmark,
  'crown': Crown, 'sparkles': Sparkles, 'flower-2': Flower2, 'mic': Mic,
  'book-marked': BookMarked, 'globe': Globe,
};

// Nodes zigzag along the trunk — alternates left/right to sit on branches
const BRANCH_OFFSETS = [0, -88, 88, -72, 72, -80, 80, -68, 68, -76, 0, 76];

const NODE_VERTICAL_GAP = 160;
const TREE_TOP_PAD      = 140;

// ─── Individual lesson node ───────────────────────────────────
function LessonNode({ node, status, score, index, onClick, totalNodes }) {
  const Icon         = ICON_MAP[node.icon] || BookOpen;
  const genre        = getGenre(node.genre || 'classics');
  const isLocked     = status === 'locked';
  const isComplete   = status === 'completed';
  const isActive     = status === 'available' || status === 'in_progress';
  const reverseIndex = totalNodes - 1 - index;
  const xOffset      = BRANCH_OFFSETS[index % BRANCH_OFFSETS.length];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: reverseIndex * 0.04, type: 'spring', stiffness: 300, damping: 22 }}
      className="absolute flex flex-col items-center"
      style={{
        bottom: 80 + reverseIndex * NODE_VERTICAL_GAP,
        left:   '50%',
        transform: `translateX(calc(-50% + ${xOffset}px))`,
        zIndex: 10,
      }}>

      {/* Ambient pulse for active */}
      {isActive && (
        <motion.div className="absolute rounded-full pointer-events-none"
          style={{ inset: -12, backgroundColor: genre.glowColor }}
          animate={{ opacity: [0.45, 0, 0.45], scale: [0.85, 1.15, 0.85] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }} />
      )}

      <button onClick={() => !isLocked && onClick(node)} disabled={isLocked}
        className="relative flex items-center justify-center rounded-full select-none"
        style={{
          width: 66, height: 66, cursor: isLocked ? 'default' : 'pointer',
          backgroundColor: isComplete ? genre.nodeColor : isActive ? '#FAFAF6' : '#C8C4BC',
          boxShadow: isLocked ? 'none'
            : isComplete ? `0 5px 0 ${genre.nodeColor}BB, 0 8px 28px ${genre.glowColor}`
            : isActive   ? `0 5px 0 #B0ACA2, 0 6px 20px ${genre.glowColor}`
            : '0 3px 0 #B0ACA2',
          border: isActive ? `3px solid ${genre.nodeColor}` : '3px solid transparent',
          transition: 'transform 0.1s',
        }}
        onMouseDown={(e) => { if (!isLocked) e.currentTarget.style.transform = 'translateY(3px) scale(0.95)'; }}
        onMouseUp={(e)   => { e.currentTarget.style.transform = ''; }}
        onMouseLeave={(e)=> { e.currentTarget.style.transform = ''; }}>

        {isLocked
          ? <Lock style={{ width: 22, height: 22, color: '#A8A49A' }} />
          : <Icon style={{ width: 27, height: 27, color: isComplete ? '#fff' : genre.nodeColor }} />
        }

        {status === 'in_progress' && (
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-olive-dark border-2 border-cream flex items-center justify-center">
            <Play style={{ width: 8, height: 8, color: '#fff', fill: '#fff' }} />
          </div>
        )}
      </button>

      {/* Stars */}
      {isComplete && (
        <div className="flex gap-0.5 mt-1.5">
          {[1,2,3].map((s) => (
            <Star key={s} style={{ width: 11, height: 11, color: genre.nodeColor,
              fill: s <= score ? genre.nodeColor : 'none' }} strokeWidth={1.5} />
          ))}
        </div>
      )}

      {/* Label pill */}
      <div className="mt-2 px-2.5 py-1 rounded-xl max-w-[92px] text-center"
        style={{
          backgroundColor: isLocked ? 'rgba(200,196,188,0.88)' : 'rgba(255,255,251,0.93)',
          backdropFilter: 'blur(4px)',
          boxShadow: '0 1px 8px rgba(65,67,35,0.1)',
        }}>
        <p className="text-[10px] font-semibold leading-tight"
          style={{ color: isLocked ? '#A8A49A' : '#414323' }}>
          {node.title}
        </p>
      </div>
    </motion.div>
  );
}

// ─── Unit section banner ──────────────────────────────────────
function UnitBanner({ label, isLocked, bottomPx }) {
  return (
    <div className="absolute left-0 right-0 flex justify-center px-8 z-20" style={{ bottom: bottomPx }}>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2.5 px-5 py-2.5 rounded-2xl"
        style={{
          backgroundColor: isLocked ? 'rgba(200,196,188,0.88)' : 'rgba(65,67,35,0.92)',
          backdropFilter: 'blur(10px)',
          boxShadow: isLocked ? 'none' : '0 4px 0 rgba(37,38,17,0.55), 0 8px 28px rgba(65,67,35,0.2)',
        }}>
        {isLocked && <Lock style={{ width: 13, height: 13, color: '#A8A49A' }} />}
        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest"
            style={{ color: isLocked ? '#A8A49A' : 'rgba(243,242,234,0.55)' }}>
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
    const prevProg = progress.find((p) => p.node_id === nodes[index - 1]?.id);
    if (prevProg?.status === 'completed') return 'available';
    return 'locked';
  };

  const getNodeScore  = (node) => progress.find((p) => p.node_id === node.id)?.score || 0;

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
  const treeHeight = 80 + filteredNodes.length * NODE_VERTICAL_GAP + TREE_TOP_PAD;

  const firstLockedUnitStart = (() => {
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

      {/* Header */}
      <div className="flex-shrink-0 px-5 pt-12 pb-3 max-w-lg mx-auto w-full" style={{ zIndex: 30, position: 'relative' }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-semibold text-olive-dark">Learn</h1>
            <p className="text-xs text-olive/60 mt-0.5">{completedCount} of {nodes.length} complete</p>
          </div>
        </div>
        <div className="w-full h-1.5 bg-neutral_tone/30 rounded-full overflow-hidden mb-3">
          <motion.div animate={{ width: `${nodes.length ? (completedCount / nodes.length) * 100 : 0}%` }}
            transition={{ duration: 0.8 }}
            className="h-full rounded-full" style={{ backgroundColor: genreConfig.progressColor }} />
        </div>
        <GenreFilter selected={activeGenre} onSelect={setActiveGenre} />
      </div>

      {/* Scrollable tree canvas */}
      <div className="flex-1 overflow-y-auto relative max-w-lg mx-auto w-full pb-24"
        style={{ overscrollBehavior: 'contain' }}>
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-6 h-6 text-olive animate-spin" />
          </div>
        ) : (
          <div className="relative w-full" style={{ height: treeHeight }}>

            {/* Illustrated tree SVG background */}
            <TreeBackground totalHeight={treeHeight} />

            {/* Lesson nodes */}
            {filteredNodes.map((node, index) => {
              const gi     = nodes.indexOf(node);
              const status = getNodeStatus(node, gi);
              const score  = getNodeScore(node);
              return (
                <LessonNode key={node.id} node={node} status={status} score={score}
                  index={index} totalNodes={filteredNodes.length} onClick={setSelectedNode} />
              );
            })}

            {/* Unit banners */}
            {filteredNodes.map((node, index) => {
              if (index % UNIT_SIZE !== 0) return null;
              const reverseIndex = filteredNodes.length - 1 - index;
              const unitIndex    = Math.floor(index / UNIT_SIZE);
              const unitName     = UNIT_NAMES[unitIndex] || `Unit ${unitIndex + 1}`;
              const unitLocked   = index >= firstLockedUnitStart;
              const bannerBottom = 80 + reverseIndex * NODE_VERTICAL_GAP + 100;
              return (
                <UnitBanner key={`unit-${index}`} label={unitName}
                  isLocked={unitLocked} bottomPx={bannerBottom} />
              );
            })}

            {/* Top-of-tree label */}
            <div className="absolute left-0 right-0 flex justify-center" style={{ top: 28 }}>
              <p className="text-[11px] text-olive/40 font-medium px-3 py-1 rounded-full"
                style={{ backgroundColor: 'rgba(234,231,218,0.75)', backdropFilter: 'blur(4px)' }}>
                More lessons coming soon ✦
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Node dialog */}
      <Dialog open={!!selectedNode} onOpenChange={() => setSelectedNode(null)}>
        <DialogContent className="mx-4 border-neutral_tone/30"
          style={{ backgroundColor: '#FAFAF6', borderRadius: '1.5rem' }}>
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              {selectedNode && (() => {
                const Icon = ICON_MAP[selectedNode.icon] || BookOpen;
                const g    = getGenre(selectedNode.genre || 'classics');
                return (
                  <div className="flex-shrink-0 rounded-full flex items-center justify-center"
                    style={{ width: 52, height: 52, backgroundColor: g.nodeColor,
                      boxShadow: `0 4px 14px ${g.glowColor}` }}>
                    <Icon style={{ width: 22, height: 22, color: '#fff' }} />
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
                  <Star key={s} style={{ width: 18, height: 18, color: g.nodeColor,
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
            <ChevronRight style={{ width: 16, height: 16, marginLeft: 4 }} />
          </DuoButton>
        </DialogContent>
      </Dialog>

      <BottomNav currentPage="LearningTree" />
    </div>
  );
}
