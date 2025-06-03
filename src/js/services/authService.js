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
    .eq('created_by', userId);  

  if (error) {
    console.error('Error fetching user projects:', error);
    return [];
  }

  return data;
}

// Function to get user by username from user_profiles table
export async function getUserByUsername(username) {
  const { data, error } = await supabase
    .from('user_profiles')  
    .select('id') 
    .eq('username', username) 
    .single();  

  if (error) {
    console.error('Error fetching user by username:', error);
    return { data: null, error };
  }

  return { data, error: null }; 
}


export async function getAllUsers() {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('id, username');

  if (error) {
    console.error('Error fetching users:', error);
    return [];
  }

  return data;
}
