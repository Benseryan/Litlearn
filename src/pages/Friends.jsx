import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { UserPlus, Loader2, Trophy, Users } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { Friendship } from '@/api/supabase';
import { FriendCard } from '@/components/friends/FriendCard';
import { Leaderboard } from '@/components/friends/Leaderboard';
import BottomNav from '@/components/navigation/BottomNav';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import DuoButton from '@/components/ui/DuoButton';

export default function Friends() {
  const { user }    = useAuth();
  const queryClient  = useQueryClient();
  const [tab, setTab]           = useState('friends'); // 'friends' | 'leaderboard'
  const [showAdd, setShowAdd]   = useState(false);
  const [friendEmail, setFriendEmail] = useState('');
  const [friendName, setFriendName]   = useState('');

  const { data: friends = [], isLoading } = useQuery({
    queryKey: ['friends', user?.email],
    queryFn: () => Friendship.filter({ user_email: user.email }),
    enabled: !!user?.email,
  });

  const addMut = useMutation({
    mutationFn: () => Friendship.create({
      user_email:   user.email,
      friend_email: friendEmail.trim().toLowerCase(),
      friend_name:  friendName.trim() || null,
      status:       'accepted',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      setShowAdd(false);
      setFriendEmail(''); setFriendName('');
    },
  });

  const removeMut = useMutation({
    mutationFn: (id) => Friendship.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['friends'] }),
  });

  const inp = "w-full bg-cream rounded-xl px-4 py-3 text-sm text-olive-dark placeholder:text-olive/40 border border-neutral_tone/50 focus:outline-none focus:border-sage transition-colors";

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-lg mx-auto px-5 pt-12 pb-28">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-olive-dark">Friends</h1>
            <p className="text-sm text-olive/60 mt-0.5">{friends.length} connected</p>
          </div>
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 bg-olive-dark text-text_light text-sm font-medium px-4 h-9 rounded-full"
            style={{ boxShadow: '0 3px 0 #252611' }}>
            <UserPlus className="w-3.5 h-3.5" /> Add
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-cream-dark rounded-2xl mb-6">
          {[['friends', Users, 'Friends'], ['leaderboard', Trophy, 'Leaderboard']].map(([id, Icon, label]) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium transition-all
                ${tab === id ? 'bg-olive-dark text-text_light shadow-sm' : 'text-olive/70 hover:text-olive-dark'}`}>
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 text-olive animate-spin" /></div>
        ) : (
          <>
            {tab === 'friends' && (
              <div className="space-y-2">
                {friends.length === 0 ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="text-center py-16 text-olive/50">
                    <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No friends yet</p>
                    <p className="text-xs mt-1">Add friends to compare your progress</p>
                  </motion.div>
                ) : (
                  friends.map((f, i) => (
                    <div key={f.id} className="relative group">
                      <FriendCard friend={f} index={i} />
                      <button onClick={() => removeMut.mutate(f.id)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-600 font-medium">
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
            {tab === 'leaderboard' && (
              <Leaderboard user={user} friends={friends.filter((f) => f.status === 'accepted')} />
            )}
          </>
        )}
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-olive-dark">Add Friend</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <input type="email" placeholder="Friend's email" value={friendEmail}
              onChange={(e) => setFriendEmail(e.target.value)} className={inp} />
            <input type="text" placeholder="Their name (optional)" value={friendName}
              onChange={(e) => setFriendName(e.target.value)} className={inp} />
            {addMut.error && (
              <p className="text-xs text-red-500">{addMut.error.message}</p>
            )}
            <DuoButton onClick={() => addMut.mutate()} disabled={!friendEmail || addMut.isPending}>
              {addMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add Friend'}
            </DuoButton>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav currentPage="Friends" />
    </div>
  );
}
