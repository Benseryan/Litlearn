import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Target, Handshake, TreePine, BookOpen, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { Friendship } from '@/api/supabase';

export default function BottomNav({ currentPage }) {
  const { user } = useAuth();

  // Live badge: count incoming friend requests
  const { data: incoming = [] } = useQuery({
    queryKey: ['friendsIncoming', user?.email],
    queryFn: () => Friendship.incoming({ user_email: user.email }),
    enabled: !!user?.email,
    refetchInterval: 20000,
    staleTime: 10000,
  });
  const requestCount = incoming.length;

  const tabs = [
    { name: 'Goals',   icon: Target,    page: 'Goals' },
    { name: 'Friends', icon: Handshake, page: 'Friends', badge: requestCount },
    { name: 'Learn',   icon: TreePine,  page: 'LearningTree', center: true },
    { name: 'Achieve', icon: BookOpen,  page: 'Achievements' },
    { name: 'Profile', icon: User,      page: 'Profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center px-4"
      style={{ paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom))' }}>
      <nav className="flex items-center justify-around gap-1 bg-sage rounded-full px-3 py-2 w-full max-w-md"
        style={{ boxShadow: '0 4px 24px rgba(90,92,65,0.18)' }}>
        {tabs.map((tab) => {
          const isActive = currentPage === tab.page;
          const Icon = tab.icon;
          return (
            <Link key={tab.name} to={createPageUrl(tab.page)}
              className="relative flex flex-col items-center justify-center w-14 h-14">
              {isActive && (
                <motion.div layoutId="activeTab"
                  className="absolute inset-1 bg-olive-dark rounded-full"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
              )}
              <Icon className={`relative z-10 w-5 h-5 transition-colors ${isActive ? 'text-text_light' : 'text-olive-dark'}`}
                strokeWidth={isActive ? 2.2 : 1.8} />
              {!isActive && (
                <span className="relative z-10 text-[10px] mt-0.5 text-olive-dark font-medium">{tab.name}</span>
              )}
              {/* Notification badge */}
              {tab.badge > 0 && !isActive && (
                <span className="absolute top-1 right-1 z-20 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center"
                  style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.25)' }}>
                  {tab.badge > 9 ? '9+' : tab.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
