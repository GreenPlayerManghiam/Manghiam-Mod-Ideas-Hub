import { supabase } from "./supabase";

// ✅ FIX: re-export the raw client so App.jsx (and any other file that imports
//        `supabase` from supabaseApi instead of supabase.js directly) works
//        without a separate import. This resolves:
//        "supabaseApi.js does not provide an export named 'supabase'"
export { supabase } from "./supabase";

/**
 * ============================================================
 * Authentication
 * ============================================================
 */

export async function signUp(email, password, username) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
      },
    },
  });

  return { data, error };
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return { data, error };
}

export async function signOut() {
  return await supabase.auth.signOut();
}

export async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

// Listen to real-time auth state updates (login, logout, token refresh)
export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange(callback);
}

/**
 * ============================================================
 * Profiles
 * ============================================================
 */

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  return { data, error };
}

export async function updateProfile(userId, updates) {
  // Update the profiles table
  const { data, error } = await supabase
    .from("profiles")
    .upsert({ id: userId, ...updates, updated_at: new Date().toISOString() })
    .select()
    .single();

  // Also sync avatar_url/username with Supabase Auth metadata so user_metadata
  // stays consistent with the profiles table
  if (!error) {
    await supabase.auth.updateUser({
      data: updates,
    });
  }

  return { data, error };
}

/**
 * ============================================================
 * Games
 * ============================================================
 */

export async function getGames() {
  const { data, error } = await supabase
    .from("games")
    .select("*")
    .order("name");

  return { data, error };
}

export async function createGame(game) {
  const { data, error } = await supabase
    .from("games")
    .insert(game)
    .select()
    .single();

  return { data, error };
}

/**
 * ============================================================
 * Mods
 * ============================================================
 */

export async function getMods() {
  const { data, error } = await supabase
    .from("mods")
    .select(`
      *,
      profiles(username, avatar_url),
      games(name, icon)
    `)
    .order("created_at", { ascending: false });

  return { data, error };
}

export async function getMod(modId) {
  const { data, error } = await supabase
    .from("mods")
    .select(`
      *,
      profiles(username, avatar_url),
      games(name, icon)
    `)
    .eq("id", modId)
    .single();

  return { data, error };
}

export async function createMod(mod) {
  const { data, error } = await supabase
    .from("mods")
    .insert(mod)
    .select()
    .single();

  return { data, error };
}

export async function updateMod(modId, updates) {
  const { data, error } = await supabase
    .from("mods")
    .update(updates)
    .eq("id", modId)
    .select()
    .single();

  return { data, error };
}

export async function deleteMod(modId) {
  const { error } = await supabase
    .from("mods")
    .delete()
    .eq("id", modId);

  return { error };
}

/**
 * ============================================================
 * Storage (Mod Images)
 * ============================================================
 */

export async function uploadModImage(path, file) {
  const { data, error } = await supabase.storage
    .from("mod-images")
    .upload(path, file, {
      cacheControl: "3600",
      upsert: true,
    });

  return { data, error };
}

export function getModImageUrl(path) {
  const { data } = supabase.storage
    .from("mod-images")
    .getPublicUrl(path);

  return data.publicUrl;
}

export async function deleteModImage(path) {
  const { data, error } = await supabase.storage
    .from("mod-images")
    .remove([path]);

  return { data, error };
}

/**
 * ============================================================
 * Storage (Avatars)
 * ============================================================
 */

export async function uploadAvatarImage(path, file) {
  const { data, error } = await supabase.storage
    .from("avatars")
    .upload(path, file, {
      cacheControl: "3600",
      upsert: true,
    });

  return { data, error };
}

export function getAvatarUrl(path) {
  const { data } = supabase.storage
    .from("avatars")
    .getPublicUrl(path);

  return data.publicUrl;
}

/**
 * ============================================================
 * Forums (World-Class Community Hub)
 * ============================================================
 */

export async function getForumTopics() {
  const { data, error } = await supabase
    .from('forum_topics')
    .select('*')
    .order('name', { ascending: true });
  if (error) return [];
  return data || [];
}

export async function createForumTopic(topicData) {
  const { data, error } = await supabase
    .from('forum_topics')
    .insert([topicData])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getForumThreads() {
  const { data, error } = await supabase
    .from('forum_threads')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return [];
  return data || [];
}

export async function createForumThread(threadData) {
  const { data, error } = await supabase
    .from('forum_threads')
    .insert([threadData])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteForumThread(threadId) {
  const { error } = await supabase
    .from('forum_threads')
    .delete()
    .eq('id', threadId);
  if (error) throw error;
}

export async function getForumComments(threadId) {
  const { data, error } = await supabase
    .from('forum_comments')
    .select('*')
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true });
  if (error) return [];
  return data || [];
}

export async function createForumComment(commentData) {
  const { data, error } = await supabase
    .from('forum_comments')
    .insert([commentData])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteForumComment(commentId) {
  const { error } = await supabase
    .from('forum_comments')
    .delete()
    .eq('id', commentId);
  if (error) throw error;
}

export async function toggleThreadUpvote(threadId, userId, currentUpvotes, hasUpvoted) {
  if (hasUpvoted) {
    await supabase
      .from('forum_upvotes')
      .delete()
      .eq('thread_id', threadId)
      .eq('user_id', userId);
    const newCount = Math.max(0, currentUpvotes - 1);
    await supabase
      .from('forum_threads')
      .update({ upvotes: newCount })
      .eq('id', threadId);
    return newCount;
  } else {
    await supabase
      .from('forum_upvotes')
      .insert([{ thread_id: threadId, user_id: userId }]);
    const newCount = currentUpvotes + 1;
    await supabase
      .from('forum_threads')
      .update({ upvotes: newCount })
      .eq('id', threadId);
    return newCount;
  }
}

export async function getUserUpvotes(userId) {
  if (!userId) return [];
  const { data } = await supabase
    .from('forum_upvotes')
    .select('thread_id')
    .eq('user_id', userId);
  return data?.map((u) => u.thread_id) || [];
}

/**
 * ============================================================
 * Utilities
 * ============================================================
 */

// ✅ FIX: added formatDownloads here so ModDetail.jsx can import it from
//        supabaseApi instead of the non-existent '../data/mods' module.
export function formatDownloads(n) {
  if (!n) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}