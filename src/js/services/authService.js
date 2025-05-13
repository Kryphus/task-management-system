import { supabase } from './supabaseClient.js';

// Sign up function
export async function signUp(email, password, username) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username: username,
      }
    }
  });

  return { data, error };
}

// Sign in function
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  return { data, error };
}

// Sign out function
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

// Get current user
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
