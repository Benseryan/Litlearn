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
  // All rows where I am the sender
  filter: async ({ user_email }) => {
    const { data, error } = await supabase
      .from('friendships').select('*').eq('user_email', user_email);
    if (error) throw error;
    return data ?? [];
  },
  // Incoming requests (someone sent to me)
  incoming: async ({ user_email }) => {
    const { data, error } = await supabase
      .from('friendships').select('*')
      .eq('friend_email', user_email)
      .eq('status', 'pending');
    if (error) throw error;
    return data ?? [];
  },
  // Send a friend request (pending)
  sendRequest: async ({ user_email, friend_email }) => {
    const { data, error } = await supabase
      .from('friendships')
      .insert({ user_email, friend_email, status: 'pending' })
      .select().single();
    if (error) throw error;
    return data;
  },
  // Accept: update both sides to accepted (create mirror row if needed)
  accept: async ({ id, user_email, friend_email }) => {
    // Update the incoming request to accepted
    const { error: e1 } = await supabase
      .from('friendships').update({ status: 'accepted' }).eq('id', id);
    if (e1) throw e1;
    // Create mirror row so both sides see each other
    const { error: e2 } = await supabase
      .from('friendships')
      .upsert({ user_email, friend_email: friend_email, status: 'accepted' },
               { onConflict: 'user_email,friend_email' });
    if (e2) throw e2;
  },
  // Decline: just delete the request
  decline: async (id) => {
    const { error } = await supabase.from('friendships').delete().eq('id', id);
    if (error) throw error;
  },
  // Cancel outgoing request
  cancel: async (id) => {
    const { error } = await supabase.from('friendships').delete().eq('id', id);
    if (error) throw error;
  },
  // Remove accepted friend (delete both sides)
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

// ─── FriendStreak ─────────────────────────────────────────────────────────────
export const FriendStreak = {
  filter: async ({ user_email, friend_email }) => {
    let q = supabase.from('friend_streaks').select('*').eq('user_email', user_email);
    if (friend_email) q = q.eq('friend_email', friend_email);
    const { data, error } = await q;
    if (error) throw error;
    return data ?? [];
  },
  create: async (payload) => {
    const { data, error } = await supabase
      .from('friend_streaks').insert(payload).select().single();
    if (error) throw error;
    return data;
  },
  update: async (id, payload) => {
    const { data, error } = await supabase
      .from('friend_streaks').update(payload).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },
};

// ─── Avatar upload (Supabase Storage) ────────────────────────────────────────
export const AvatarStorage = {
  upload: async (userId, file) => {
    const ext  = file.name.split('.').pop();
    const path = `avatars/${userId}.${ext}`;
    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    return data.publicUrl;
  },
};
