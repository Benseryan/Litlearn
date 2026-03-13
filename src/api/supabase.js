import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─── LearningNode ───────────────────────────────────────────────────────────
export const LearningNode = {
  list: async () => {
    const { data, error } = await supabase
      .from('learning_nodes').select('*').order('order', { ascending: true });
    if (error) throw error;
    return data ?? [];
  },
  create: async (payload) => {
    const { data, error } = await supabase
      .from('learning_nodes').insert(payload).select().single();
    if (error) throw error;
    return data;
  },
  update: async (id, payload) => {
    const { data, error } = await supabase
      .from('learning_nodes').update(payload).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },
  delete: async (id) => {
    const { error } = await supabase.from('learning_nodes').delete().eq('id', id);
    if (error) throw error;
  },
};

// ─── LessonContent ───────────────────────────────────────────────────────────
export const LessonContent = {
  list: async () => {
    const { data, error } = await supabase.from('lesson_content').select('*');
    if (error) throw error;
    return data ?? [];
  },
  create: async (payload) => {
    const { data, error } = await supabase
      .from('lesson_content').insert(payload).select().single();
    if (error) throw error;
    return data;
  },
  update: async (id, payload) => {
    const { data, error } = await supabase
      .from('lesson_content').update(payload).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },
};

// ─── UserProgress ─────────────────────────────────────────────────────────────
export const UserProgress = {
  filter: async ({ user_email }) => {
    const { data, error } = await supabase
      .from('user_progress').select('*').eq('user_email', user_email);
    if (error) throw error;
    return data ?? [];
  },
  create: async (payload) => {
    const { data, error } = await supabase
      .from('user_progress').insert(payload).select().single();
    if (error) throw error;
    return data;
  },
  update: async (id, payload) => {
    const { data, error } = await supabase
      .from('user_progress').update(payload).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },
  upsert: async (payload) => {
    const { data, error } = await supabase
      .from('user_progress')
      .upsert(payload, { onConflict: 'user_email,node_id' })
      .select().single();
    if (error) throw error;
    return data;
  },
};

// ─── UserGoal ─────────────────────────────────────────────────────────────────
export const UserGoal = {
  filter: async ({ user_email }) => {
    const { data, error } = await supabase
      .from('user_goals').select('*').eq('user_email', user_email);
    if (error) throw error;
    return data ?? [];
  },
  list: async () => {
    const { data, error } = await supabase.from('user_goals').select('*');
    if (error) throw error;
    return data ?? [];
  },
  create: async (payload) => {
    const { data, error } = await supabase
      .from('user_goals').insert(payload).select().single();
    if (error) throw error;
    return data;
  },
  update: async (id, payload) => {
    const { data, error } = await supabase
      .from('user_goals').update(payload).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },
};

// ─── Achievement ─────────────────────────────────────────────────────────────
export const Achievement = {
  list: async () => {
    const { data, error } = await supabase
      .from('achievements').select('*').order('created_at');
    if (error) throw error;
    return data ?? [];
  },
  create: async (payload) => {
    const { data, error } = await supabase
      .from('achievements').insert(payload).select().single();
    if (error) throw error;
    return data;
  },
};

// ─── Friendship ──────────────────────────────────────────────────────────────
export const Friendship = {
  filter: async ({ user_email }) => {
    const { data, error } = await supabase
      .from('friendships').select('*').eq('user_email', user_email);
    if (error) throw error;
    return data ?? [];
  },
  incoming: async ({ user_email }) => {
    const { data, error } = await supabase
      .from('friendships').select('*')
      .eq('friend_email', user_email)
      .eq('status', 'pending');
    if (error) throw error;
    return data ?? [];
  },
  sendRequest: async ({ user_email, friend_email }) => {
    const { data, error } = await supabase
      .from('friendships')
      .insert({ user_email, friend_email, status: 'pending' })
      .select().single();
    if (error) throw error;
    return data;
  },
  accept: async ({ id, user_email, friend_email }) => {
    const { error: e1 } = await supabase
      .from('friendships').update({ status: 'accepted' }).eq('id', id);
    if (e1) throw e1;
    const { error: e2 } = await supabase
      .from('friendships')
      .upsert({ user_email, friend_email: friend_email, status: 'accepted' },
               { onConflict: 'user_email,friend_email' });
    if (e2) throw e2;
  },
  decline: async (id) => {
    const { error } = await supabase.from('friendships').delete().eq('id', id);
    if (error) throw error;
  },
  cancel: async (id) => {
    const { error } = await supabase.from('friendships').delete().eq('id', id);
    if (error) throw error;
  },
  remove: async ({ user_email, friend_email }) => {
    await supabase.from('friendships').delete()
      .eq('user_email', user_email).eq('friend_email', friend_email);
    await supabase.from('friendships').delete()
      .eq('user_email', friend_email).eq('friend_email', user_email);
  },
  create: async (payload) => {
    const { data, error } = await supabase
      .from('friendships').insert(payload).select().single();
    if (error) throw error;
    return data;
  },
};

// ─── Profile ─────────────────────────────────────────────────────────────────
export const Profile = {
  get: async (userId) => {
    const { data, error } = await supabase
      .from('profiles').select('*').eq('id', userId).single();
    if (error) throw error;
    return data;
  },
  update: async (userId, payload) => {
    const { data, error } = await supabase
      .from('profiles').update(payload).eq('id', userId).select().single();
    if (error) throw error;
    return data;
  },
};
