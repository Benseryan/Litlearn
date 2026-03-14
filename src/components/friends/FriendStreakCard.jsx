import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, CheckCircle2, Clock } from 'lucide-react';
import { FriendStreak } from '@/api/supabase';

const today = () => new Date().toISOString().split('T')[0];

function getInitials(nameOrEmail) {
  return (nameOrEmail || '?').split(/[\s@]/).filter(Boolean).map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function FriendStreakCard({ myStreak, userEmail, index }) {
  const [friendRecord, setFriendRecord] = useState(null);

  // Load the friend's side of the streak
  useEffect(() => {
    if (!myStreak?.friend_email) return;
    FriendStreak.filter({
      user_email:   myStreak.friend_email,
      friend_email: userEmail,
    }).then((recs) => setFriendRecord(recs?.[0] || null));
  }, [myStreak?.friend_email, userEmail]);

  const myActiveToday     = myStreak?.last_active_date === today();
  const friendActiveToday = friendRecord?.last_active_date === today();
  const sharedStreak      = myStreak?.streak_count || 0;
  const isBroken          = myStreak?.status === 'broken';
  const display           = myStreak?.friend_name || myStreak?.friend_email || '?';
  const initials          = getInitials(display);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className={`rounded-2xl p-4 space-y-3 ${isBroken ? 'border border-red-200' : 'bg-cream-dark'}`}
      style={{ backgroundColor: isBroken ? '#FFF5F5' : undefined }}>

      {/* Header row */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 bg-sage rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-semibold text-olive-dark">{initials}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-olive-dark truncate">{display}</p>
          {myStreak?.friend_name && (
            <p className="text-xs text-olive/50 truncate">{myStreak.friend_email}</p>
          )}
        </div>
        {/* Flame counter */}
        <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full ${isBroken ? 'bg-red-100' : 'bg-olive-dark'}`}
          style={{ boxShadow: isBroken ? 'none' : '0 2px 0 #252611' }}>
          <Flame style={{ width: 14, height: 14, color: isBroken ? '#F87171' : '#ADB684' }} />
          <span className={`text-sm font-bold ${isBroken ? 'text-red-500' : 'text-text_light'}`}>
            {sharedStreak}
          </span>
        </div>
      </div>

      {/* Today's activity — both sides */}
      <div className="flex gap-2">
        <div className={`flex-1 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium
          ${myActiveToday ? 'bg-sage/30 text-olive-dark' : 'bg-neutral_tone/20 text-olive/50'}`}>
          {myActiveToday
            ? <CheckCircle2 style={{ width: 14, height: 14, color: '#414323' }} />
            : <Clock style={{ width: 14, height: 14, color: 'rgba(65,67,35,0.4)' }} />}
          You {myActiveToday ? '✓ done' : '— pending'}
        </div>
        <div className={`flex-1 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium
          ${friendActiveToday ? 'bg-sage/30 text-olive-dark' : 'bg-neutral_tone/20 text-olive/50'}`}>
          {friendActiveToday
            ? <CheckCircle2 style={{ width: 14, height: 14, color: '#414323' }} />
            : <Clock style={{ width: 14, height: 14, color: 'rgba(65,67,35,0.4)' }} />}
          {(myStreak?.friend_name?.split(' ')[0]) || 'Friend'} {friendActiveToday ? '✓ done' : '— pending'}
        </div>
      </div>

      {isBroken && (
        <p className="text-xs text-red-400 text-center">Streak broken — complete a lesson to restart</p>
      )}
    </motion.div>
  );
}
