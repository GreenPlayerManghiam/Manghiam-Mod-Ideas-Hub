import { supabase } from "./supabase";

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
    .upsert({ id: userId, ...updates })
    .select()
    .single();

  // Also sync avatar_url/username with Supabase Auth metadata
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