import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Loader2, Plus, Pencil, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { LearningNode, LessonContent } from '@/api/supabase';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import DuoButton from '@/components/ui/DuoButton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const CATEGORIES = ['foundations','classical','modern','analysis','poetry'];
const GENRES = ['classics','fantasy','sci-fi','philosophy','nonfiction','mystery'];
const ICONS  = ['book-open','layers','feather','landmark','crown','sparkles','flower-2','mic','book-marked','globe'];

const EMPTY_NODE = { title: '', description: '', order: 1, icon: 'book-open', category: 'foundations', genre: 'classics' };

export default function Admin() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const queryClient = useQueryClient();
  const [showNodeForm, setShowNodeForm] = useState(false);
  const [editingNode, setEditingNode]   = useState(null);
  const [form, setForm]                 = useState(EMPTY_NODE);
  const [expandedId, setExpandedId]     = useState(null);

  // Guard
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center gap-4">
        <p className="text-olive/70 text-sm">This area is for admins only.</p>
        <button onClick={() => navigate(createPageUrl('LearningTree'))} className="text-olive-dark text-sm underline">
          Go back
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
    mutationFn: () => editingNode
      ? LearningNode.update(editingNode.id, form)
      : LearningNode.create(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learningNodes'] });
      setShowNodeForm(false); setEditingNode(null); setForm(EMPTY_NODE);
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id) => LearningNode.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['learningNodes'] }),
  });

  const openEdit = (node) => {
    setEditingNode(node);
    setForm({ title: node.title, description: node.description || '', order: node.order,
              icon: node.icon || 'book-open', category: node.category || 'foundations', genre: node.genre || 'classics' });
    setShowNodeForm(true);
  };

  const sel = "w-full bg-cream rounded-xl px-4 py-3 text-sm text-olive-dark border border-neutral_tone/50 focus:outline-none focus:border-sage transition-colors";
  const inp = sel;

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-lg mx-auto px-5 pt-12 pb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-olive-dark">Admin</h1>
            <p className="text-sm text-olive/60 mt-0.5">Manage learning content</p>
          </div>
          <button onClick={() => { setEditingNode(null); setForm(EMPTY_NODE); setShowNodeForm(true); }}
            className="flex items-center gap-1.5 bg-olive-dark text-text_light text-sm font-medium px-4 h-9 rounded-full"
            style={{ boxShadow: '0 3px 0 #252611' }}>
            <Plus className="w-3.5 h-3.5" /> Add Node
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 text-olive animate-spin" /></div>
        ) : (
          <div className="space-y-2">
            {nodes.map((node) => {
              const content  = contents.find((c) => c.node_id === node.id);
              const expanded = expandedId === node.id;
              return (
                <motion.div key={node.id} layout className="bg-cream-dark rounded-2xl overflow-hidden">
                  <div className="flex items-center gap-3 p-4">
                    <span className="text-xs font-bold text-olive/40 w-6 text-center">{node.order}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-olive-dark truncate">{node.title}</p>
                      <p className="text-xs text-olive/60 capitalize">{node.genre} · {node.category}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {content && <span className="text-[10px] bg-sage/50 text-olive-dark px-2 py-0.5 rounded-full">content</span>}
                      <button onClick={() => openEdit(node)}
                        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-neutral_tone/50 transition-colors">
                        <Pencil className="w-3.5 h-3.5 text-olive/60" />
                      </button>
                      <button onClick={() => deleteMut.mutate(node.id)}
                        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-50 transition-colors">
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      </button>
                      <button onClick={() => setExpandedId(expanded ? null : node.id)}
                        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-neutral_tone/50 transition-colors">
                        {expanded ? <ChevronUp className="w-4 h-4 text-olive/60" /> : <ChevronDown className="w-4 h-4 text-olive/60" />}
                      </button>
                    </div>
                  </div>
                  {expanded && (
                    <div className="px-4 pb-4 border-t border-neutral_tone/30 pt-3">
                      <p className="text-xs text-olive/70 mb-2">{node.description || 'No description'}</p>
                      {content ? (
                        <div className="space-y-1 text-xs text-olive/60">
                          <p>📖 {JSON.parse(content.slides_json || '[]').length} slides</p>
                          <p>❓ {JSON.parse(content.questions_json || '[]').length} questions</p>
                        </div>
                      ) : (
                        <p className="text-xs text-olive/50 italic">No DB content — using static fallback</p>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={showNodeForm} onOpenChange={setShowNodeForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-olive-dark">{editingNode ? 'Edit Node' : 'New Node'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inp} />
            <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inp} />
            <div className="grid grid-cols-2 gap-2">
              <input type="number" placeholder="Order" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) })} className={inp} />
              <select value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className={sel}>
                {ICONS.map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={sel}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })} className={sel}>
                {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <DuoButton onClick={() => saveMut.mutate()} disabled={!form.title || saveMut.isPending}>
              {saveMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : editingNode ? 'Save Changes' : 'Create Node'}
            </DuoButton>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
