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

// Get all projects created by the current user
export async function getUserProjects(userId) {
  const { data, error } = await supabase
    .from('projects')
    .select('id, name, description')
    .eq('created_by', userId);  // Filter projects by the user who created them

  if (error) {
    console.error('Error fetching user projects:', error);
    return [];
  }

  return data;
}

// Fetch user details by username
// services/authService.js

// Function to get user by username from user_profiles table
export async function getUserByUsername(username) {
  const { data, error } = await supabase
    .from('user_profiles')  // Query the `user_profiles` table
    .select('id')  // Fetch the `id` (UUID) of the user
    .eq('username', username)  // Match the `username`
    .single();  // Expect a single result because usernames are unique

  if (error) {
    console.error('Error fetching user by username:', error);
    return { data: null, error };
  }

  return { data, error: null }; // Return the user data (UUID)
}
