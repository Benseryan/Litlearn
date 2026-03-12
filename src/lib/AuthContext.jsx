import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { supabase, Profile } from '@/api/supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser]           = useState(null);   // merged {id, email, full_name, role}
  const [isLoading, setIsLoading] = useState(true);

  const buildUser = useCallback(async (session) => {
    if (!session?.user) { setUser(null); setIsLoading(false); return; }
    try {
      const profile = await Profile.get(session.user.id);
      setUser({
        id:        session.user.id,
        email:     session.user.email,
        full_name: profile?.full_name ?? session.user.user_metadata?.full_name ?? '',
        role:      profile?.role ?? 'user',
      });
    } catch {
      // Profile might not exist yet right after signup
      setUser({
        id:        session.user.id,
        email:     session.user.email,
        full_name: session.user.user_metadata?.full_name ?? '',
        role:      'user',
      });
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => buildUser(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      buildUser(session);
    });
    return () => subscription.unsubscribe();
  }, [buildUser]);

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const signUp = async (email, password, fullName) => {
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName } },
    });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
