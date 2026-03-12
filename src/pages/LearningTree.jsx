import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { LearningNode, UserProgress } from '@/api/supabase';
import { createPageUrl } from '@/utils';
import TreeNode from '@/components/tree/TreeNode';
import TreePath from '@/components/tree/TreePath';
import SkillTreeSVG from '@/components/tree/SkillTreeSVG';
import GenreFilter from '@/components/tree/GenreFilter';
import { getGenre } from '@/components/tree/genreConfig';
import DuoButton from '@/components/ui/DuoButton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const VIEWS = [{ id: 'overview', label: 'Overview' }, { id: 'path', label: 'Path' }];

const getOffset = (index) => {
  const pattern = [0, 1, 2, 1, 0, -1, -2, -1];
  return pattern[index % pattern.length] * 28;
};

export default function LearningTree() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [view, setView]               = useState('overview');
  const [selectedNode, setSelectedNode] = useState(null);
  const [activeGenre, setActiveGenre] = useState('all');

  const { data: nodes = [], isLoading: nodesLoading } = useQuery({
    queryKey: ['learningNodes'],
    queryFn: LearningNode.list,
  });

  const { data: progress = [], isLoading: progressLoading, refetch } = useQuery({
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

  const getNodeScore = (node) => progress.find((p) => p.node_id === node.id)?.score || 0;

  const handleStartLesson = (node) => {
    setSelectedNode(null);
    navigate(createPageUrl(`Lesson?node_id=${node.id}`));
  };

  const isLoading      = nodesLoading || progressLoading;
  const completedCount = progress.filter((p) => p.status === 'completed').length;
  const filteredNodes  = activeGenre === 'all' ? nodes : nodes.filter((n) => n.genre === activeGenre);
  const genreConfig    = getGenre(activeGenre);

  const selectedStatus = selectedNode
    ? progress.find((p) => p.node_id === selectedNode.id)?.status
    : null;

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden transition-colors duration-500"
      style={{ backgroundColor: genreConfig.bg }}>
      {/* Header */}
      <div className="flex-shrink-0 px-5 pt-12 pb-3 max-w-lg mx-auto w-full">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-medium text-olive-dark">Skill Tree</h1>
            <p className="text-xs text-olive/60 mt-0.5">{completedCount} of {nodes.length} lessons complete</p>
          </div>
          <div className="flex gap-1 p-1 bg-cream-dark rounded-2xl">
            {VIEWS.map(({ id, label }) => (
              <button key={id} onClick={() => setView(id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all
                  ${view === id ? 'bg-olive-dark text-text_light' : 'text-olive/70 hover:text-olive-dark'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Genre filter */}
      <div className="flex-shrink-0 px-5 max-w-lg mx-auto w-full mb-2">
        <GenreFilter selected={activeGenre} onSelect={setActiveGenre} />
      </div>

      {/* Progress bar */}
      <div className="flex-shrink-0 px-5 max-w-lg mx-auto w-full mb-3">
        <div className="w-full h-1.5 bg-neutral_tone/30 rounded-full overflow-hidden">
          <motion.div animate={{ width: `${nodes.length ? (completedCount / nodes.length) * 100 : 0}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full rounded-full" style={{ backgroundColor: genreConfig.progressColor }} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 max-w-lg mx-auto w-full">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-6 h-6 text-olive animate-spin" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {view === 'overview' ? (
              <motion.div key="overview" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.25 }} className="pb-8">
                <div className="flex items-center gap-4 mb-4 justify-center">
                  {[{ color: 'bg-olive-dark', label: 'Done' }, { color: 'bg-sage', label: 'Active' },
                    { color: 'bg-cream border border-neutral_tone/60', label: 'Next' }, { color: 'bg-neutral_tone/40', label: 'Locked' }
                  ].map(({ color, label }) => (
                    <div key={label} className="flex items-center gap-1.5">
                      <div className={`w-3 h-3 rounded-full ${color}`} />
                      <span className="text-[10px] text-olive/60">{label}</span>
                    </div>
                  ))}
                </div>
                <SkillTreeSVG nodes={filteredNodes} progress={progress} onNodeClick={setSelectedNode} />
                <p className="text-center text-xs text-olive/50 mt-2">Tap a node to open its lesson</p>
              </motion.div>
            ) : (
              <motion.div key="path" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.25 }}
                className="pb-8 flex flex-col items-center pt-2">
                {filteredNodes.map((node, index) => {
                  const globalIndex = nodes.indexOf(node);
                  const status = getNodeStatus(node, globalIndex);
                  const score  = getNodeScore(node);
                  const offset = getOffset(index);
                  return (
                    <React.Fragment key={node.id}>
                      {index > 0 && <TreePath isActive={status !== 'locked'} />}
                      <motion.div style={{ transform: `translateX(${offset}px)` }} className="transition-transform duration-300">
                        <TreeNode node={node} status={status} score={score} index={index} onClick={setSelectedNode} />
                      </motion.div>
                    </React.Fragment>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Dialog */}
      <Dialog open={!!selectedNode} onOpenChange={() => setSelectedNode(null)}>
        <DialogContent className="border-neutral_tone/50 rounded-2xl" style={{ backgroundColor: genreConfig.bg }}>
          <DialogHeader>
            <DialogTitle className="text-olive-dark">{selectedNode?.title}</DialogTitle>
            <DialogDescription className="text-olive/70">{selectedNode?.description}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 mt-2">
            <span className="text-xs text-olive/50 uppercase tracking-wider capitalize">
              {selectedNode?.genre || selectedNode?.category}
            </span>
            <DuoButton
              pulse={!selectedStatus || selectedStatus === 'available'}
              onClick={() => handleStartLesson(selectedNode)}
              color={getGenre(selectedNode?.genre || 'all').nodeColor}
              shadowColor={getGenre(selectedNode?.genre || 'all').nodeColor + '99'}
              textColor="#F3F2EA">
              {selectedStatus === 'in_progress' ? 'Continue' : selectedStatus === 'completed' ? 'Review' : 'Start Lesson'}
            </DuoButton>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
