import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Loader2, Trophy, Users, Bell, CheckCircle2, XCircle, Clock, UserMinus, Flame } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { Friendship, FriendStreak } from '@/api/supabase';
import { Leaderboard } from '@/components/friends/Leaderboard';
import FriendStreakCard from '@/components/friends/FriendStreakCard';
import BottomNav from '@/components/navigation/BottomNav';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import DuoButton from '@/components/ui/DuoButton';
import { toast } from 'sonner';

function getInitials(emailOrName) {
  return (emailOrName || '?').split(/[\s@]/).filter(Boolean).map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

// ─── Accepted friend card ─────────────────────────────────────
function FriendCard({ friendship, onRemove, onStartStreak, hasStreak, index }) {
  const display = friendship.friend_name || friendship.friend_email;
  return (
    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-cream-dark rounded-2xl p-4">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 bg-sage rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-semibold text-olive-dark">{getInitials(display)}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-olive-dark truncate">{display}</p>
          {friendship.friend_name && (
            <p className="text-xs text-olive/50 truncate">{friendship.friend_email}</p>
          )}
        </div>
        <button onClick={() => onRemove(friendship)}
          className="opacity-0 group-hover:opacity-100 text-xs text-red-400 hover:text-red-600 font-medium transition-all flex items-center gap-1">
          <UserMinus className="w-3.5 h-3.5" />
        </button>
      </div>
      <button onClick={() => onStartStreak(friendship)}
        className="mt-2.5 w-full flex items-center justify-center gap-1.5 text-xs font-medium py-1.5 rounded-xl transition-colors"
        style={{
          backgroundColor: hasStreak ? 'rgba(173,182,132,0.2)' : 'rgba(65,67,35,0.07)',
          color: hasStreak ? '#5A6E35' : '#6B6D4A',
        }}>
        <Flame style={{ width: 12, height: 12 }} />
        {hasStreak ? 'View streak →' : 'Start learning streak'}
      </button>
    </motion.div>
  );
}

// ─── Incoming request card ────────────────────────────────────
function IncomingCard({ request, onAccept, onDecline, index }) {
  return (
    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-cream-dark rounded-2xl p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-11 h-11 bg-olive-dark/20 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-semibold text-olive-dark">{getInitials(request.user_email)}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-olive-dark truncate">{request.user_email}</p>
          <p className="text-xs text-olive/50 flex items-center gap-1 mt-0.5">
            <Clock className="w-3 h-3" /> Wants to be your friend
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={() => onAccept(request)}
          className="flex-1 flex items-center justify-center gap-1.5 h-9 bg-olive-dark text-text_light rounded-xl text-xs font-semibold hover:bg-olive transition-all"
          style={{ boxShadow: '0 2px 0 #252611' }}>
          <CheckCircle2 className="w-3.5 h-3.5" /> Accept
        </button>
        <button onClick={() => onDecline(request.id)}
          className="flex-1 flex items-center justify-center gap-1.5 h-9 bg-cream text-red-500 rounded-xl text-xs font-semibold border border-red-200 hover:bg-red-50 transition-all">
          <XCircle className="w-3.5 h-3.5" /> Decline
        </button>
      </div>
    </motion.div>
  );
}

// ─── Outgoing request card ────────────────────────────────────
function OutgoingCard({ request, onCancel, index }) {
  return (
    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-center gap-3 bg-cream-dark rounded-2xl p-4">
      <div className="w-11 h-11 bg-neutral_tone/50 rounded-full flex items-center justify-center flex-shrink-0">
        <span className="text-sm font-semibold text-olive/60">{getInitials(request.friend_email)}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-olive-dark truncate">{request.friend_email}</p>
        <p className="text-xs text-olive/50 flex items-center gap-1 mt-0.5">
          <Clock className="w-3 h-3" /> Request pending
        </p>
      </div>
      <button onClick={() => onCancel(request.id)}
        className="text-xs text-olive/50 hover:text-red-500 font-medium transition-colors flex-shrink-0">
        Cancel
      </button>
    </motion.div>
  );
}

// ─── Main Friends Page ────────────────────────────────────────
export default function Friends() {
  const { user }    = useAuth();
  const queryClient  = useQueryClient();
  const [tab, setTab]                 = useState('friends');
  const [showAdd, setShowAdd]         = useState(false);
  const [friendEmail, setFriendEmail] = useState('');
  const [sendError, setSendError]     = useState('');

  // Outgoing rows (I am user_email)
  const { data: outgoing = [], isLoading: outLoading } = useQuery({
    queryKey: ['friends', user?.email],
    queryFn: () => Friendship.filter({ user_email: user.email }),
    enabled: !!user?.email,
    refetchInterval: 15000,
  });

  // Incoming pending requests
  const { data: incoming = [], isLoading: inLoading } = useQuery({
    queryKey: ['friendsIncoming', user?.email],
    queryFn: () => Friendship.incoming({ user_email: user.email }),
    enabled: !!user?.email,
    refetchInterval: 15000,
  });

  // My friend streaks
  const { data: myStreaks = [], isLoading: streaksLoading } = useQuery({
    queryKey: ['friendStreaks', user?.email],
    queryFn: () => FriendStreak.filter({ user_email: user.email }),
    enabled: !!user?.email,
    refetchInterval: 30000,
  });

  const accepted     = outgoing.filter((f) => f.status === 'accepted');
  const pending      = outgoing.filter((f) => f.status === 'pending');
  const requestCount = incoming.length;

  const sendMut = useMutation({
    mutationFn: () => {
      const email = friendEmail.trim().toLowerCase();
      if (email === user.email) throw new Error("You can't add yourself");
      if (outgoing.some((f) => f.friend_email === email)) throw new Error('Already sent a request');
      return Friendship.sendRequest({ user_email: user.email, friend_email: email });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      setShowAdd(false); setFriendEmail(''); setSendError('');
    },
    onError: (err) => setSendError(err.message),
  });

  const acceptMut = useMutation({
    mutationFn: (req) => Friendship.accept({ id: req.id, user_email: user.email, friend_email: req.user_email }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      queryClient.invalidateQueries({ queryKey: ['friendsIncoming'] });
    },
  });

  const declineMut = useMutation({
    mutationFn: (id) => Friendship.decline(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['friendsIncoming'] }),
  });

  const cancelMut = useMutation({
    mutationFn: (id) => Friendship.cancel(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['friends'] }),
  });

  const removeMut = useMutation({
    mutationFn: (f) => Friendship.remove({ user_email: user.email, friend_email: f.friend_email }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['friends'] }),
  });

  const startStreakMut = useMutation({
    mutationFn: (friend) => {
      const existing = myStreaks.find((s) => s.friend_email === friend.friend_email);
      if (existing) { setTab('streaks'); throw new Error('already'); }
      return FriendStreak.create({
        user_email:   user.email,
        friend_email: friend.friend_email,
        friend_name:  friend.friend_name || null,
        streak_count: 0,
        status:       'active',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendStreaks'] });
      setTab('streaks');
      toast.success('Streak started! Complete a lesson together every day.');
    },
    onError: (err) => { if (err.message !== 'already') toast.error('Could not start streak'); },
  });

  const isLoading = outLoading || inLoading;
  const inp = "w-full bg-cream rounded-xl px-4 py-3 text-sm text-olive-dark placeholder:text-olive/40 border border-neutral_tone/50 focus:outline-none focus:border-sage transition-colors";

  const tabs = [
    { id: 'friends',     icon: Users,   label: 'Friends',     badge: accepted.length },
    { id: 'streaks',     icon: Flame,   label: 'Streaks',     badge: myStreaks.length, highlight: false },
    { id: 'requests',    icon: Bell,    label: 'Requests',    badge: requestCount, highlight: requestCount > 0 },
    { id: 'leaderboard', icon: Trophy,  label: 'Ranks',       badge: null },
  ];

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-lg mx-auto px-5 pt-12 pb-28">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-olive-dark">Friends</h1>
            <p className="text-sm text-olive/60 mt-0.5">
              {accepted.length} {accepted.length === 1 ? 'friend' : 'friends'}
              {requestCount > 0 && <span className="text-olive-dark font-medium"> · {requestCount} new</span>}
            </p>
          </div>
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 bg-olive-dark text-text_light text-sm font-semibold px-4 h-9 rounded-full"
            style={{ boxShadow: '0 3px 0 #252611' }}>
            <UserPlus className="w-3.5 h-3.5" /> Add
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-cream-dark rounded-2xl mb-6">
          {tabs.map(({ id, icon: Icon, label, badge, highlight }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex-1 flex items-center justify-center gap-1 py-2.5 rounded-xl text-[11px] font-semibold transition-all relative
                ${tab === id ? 'bg-olive-dark text-text_light shadow-sm' : 'text-olive/60 hover:text-olive-dark'}`}>
              <Icon className="w-3 h-3" />
              <span className="hidden sm:inline">{label}</span>
              {badge > 0 && (
                <span className={`text-[9px] min-w-[14px] h-3.5 px-1 rounded-full font-bold flex items-center justify-center
                  ${tab === id ? 'bg-white/25 text-white' : highlight ? 'bg-red-500 text-white' : 'bg-neutral_tone/50 text-olive/70'}`}>
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 text-olive animate-spin" /></div>
        ) : (
          <AnimatePresence mode="wait">

            {/* ── Friends tab ── */}
            {tab === 'friends' && (
              <motion.div key="friends" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="space-y-2">
                {accepted.length === 0 ? (
                  <div className="text-center py-16 text-olive/50">
                    <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm font-medium">No friends yet</p>
                    <p className="text-xs mt-1">Send a request to get started</p>
                  </div>
                ) : (
                  accepted.map((f, i) => (
                    <FriendCard key={f.id} friendship={f} index={i}
                      hasStreak={myStreaks.some((s) => s.friend_email === f.friend_email)}
                      onRemove={removeMut.mutate}
                      onStartStreak={(friend) => startStreakMut.mutate(friend)} />
                  ))
                )}
              </motion.div>
            )}

            {/* ── Streaks tab ── */}
            {tab === 'streaks' && (
              <motion.div key="streaks" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="space-y-3">
                {streaksLoading ? (
                  <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 text-olive animate-spin" /></div>
                ) : myStreaks.length === 0 ? (
                  <div className="text-center py-16 text-olive/50">
                    <Flame className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm font-medium">No active streaks</p>
                    <p className="text-xs mt-1 max-w-[200px] mx-auto">Go to Friends and tap "Start learning streak" with a friend</p>
                  </div>
                ) : (<>
                  <p className="text-xs text-olive/50 uppercase tracking-wider px-1">
                    Both must complete a lesson each day to keep it alive
                  </p>
                  {myStreaks.map((streak, i) => (
                    <FriendStreakCard key={streak.id} myStreak={streak}
                      userEmail={user?.email} index={i} />
                  ))}
                </>)}
              </motion.div>
            )}

            {/* ── Requests tab ── */}
            {tab === 'requests' && (
              <motion.div key="requests" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="space-y-5">
                {incoming.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-semibold text-olive/50 uppercase tracking-wider px-1">
                      Incoming ({incoming.length})
                    </p>
                    {incoming.map((r, i) => (
                      <IncomingCard key={r.id} request={r} index={i}
                        onAccept={(req) => acceptMut.mutate(req)}
                        onDecline={(id) => declineMut.mutate(id)} />
                    ))}
                  </div>
                )}
                {pending.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-semibold text-olive/50 uppercase tracking-wider px-1">
                      Sent ({pending.length})
                    </p>
                    {pending.map((r, i) => (
                      <OutgoingCard key={r.id} request={r} index={i}
                        onCancel={(id) => cancelMut.mutate(id)} />
                    ))}
                  </div>
                )}
                {incoming.length === 0 && pending.length === 0 && (
                  <div className="text-center py-16 text-olive/50">
                    <Bell className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm font-medium">No pending requests</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* ── Leaderboard tab ── */}
            {tab === 'leaderboard' && (
              <motion.div key="leaderboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Leaderboard user={user} friends={accepted} />
              </motion.div>
            )}

          </AnimatePresence>
        )}
      </div>

      {/* Add friend dialog */}
      <Dialog open={showAdd} onOpenChange={(o) => { setShowAdd(o); setSendError(''); setFriendEmail(''); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-olive-dark">Send Friend Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <p className="text-xs text-olive/60">Enter their email. They'll get a request to accept or decline.</p>
            <input type="email" placeholder="friend@email.com" value={friendEmail}
              onChange={(e) => { setFriendEmail(e.target.value); setSendError(''); }}
              className={inp} />
            {sendError && <p className="text-xs text-red-500 bg-red-50 rounded-xl px-3 py-2">{sendError}</p>}
            <DuoButton onClick={() => sendMut.mutate()} disabled={!friendEmail.trim() || sendMut.isPending} pulse>
              {sendMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Request'}
            </DuoButton>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav currentPage="Friends" />
    </div>
  );
}
