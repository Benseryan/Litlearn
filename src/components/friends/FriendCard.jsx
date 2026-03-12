import React from 'react';
import { motion } from 'framer-motion';

export function FriendCard({ friend, index }) {
  const initials = (friend.friend_name || friend.friend_email || '?')
    .split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
  return (
    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-center gap-3 bg-cream-dark rounded-2xl p-4">
      <div className="w-11 h-11 bg-sage rounded-full flex items-center justify-center flex-shrink-0">
        <span className="text-sm font-semibold text-olive-dark">{initials}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-olive-dark truncate">
          {friend.friend_name || friend.friend_email}
        </p>
        {friend.friend_name && (
          <p className="text-xs text-olive/60 truncate">{friend.friend_email}</p>
        )}
      </div>
      {friend.status === 'pending' && (
        <span className="text-[10px] bg-sage/50 text-olive-dark px-2 py-1 rounded-full">pending</span>
      )}
    </motion.div>
  );
}
