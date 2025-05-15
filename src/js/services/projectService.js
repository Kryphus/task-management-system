import { supabase } from './supabaseClient.js';

// Fetch project by name and user ID
export async function getProjectByNameAndUser(projectName, userId) {
  const { data, error } = await supabase
    .from('projects')
    .select('id')
    .eq('name', projectName)
    .eq('created_by', userId)
    .single();  // Get single result

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found, ignore that error
    console.error('Error fetching project by name and user:', error);
    return { data: null, error };
  }

  return { data, error: null };
}


// Create a new project
export async function createProject(projectName, description, userId) {
  const { data, error } = await supabase
    .from('projects')
    .insert([
      {
        name: projectName,
        description: description,
        created_by: userId,  // Set the current user's ID as the creator of the project
      }
    ])
    .single();

  if (error) {
    console.error('Error creating project:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

// Fetch all projects created by a user
export async function getUserProjects(userId) {
  const { data, error } = await supabase
    .from('projects')
    .select('id, name, description, created_by, created_at')
    .eq('created_by', userId);

  if (error) {
    console.error('Error fetching user projects:', error);
    return [];
  }

  return data;
}

// Fetch project by name (without filtering by user)
export async function getProjectByName(projectName) {
  const { data, error } = await supabase
    .from('projects')
    .select('id')
    .eq('name', projectName)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching project by name:', error);
    return { data: null, error };
  }

  return { data, error: null };
}


// Update project by ID
export async function updateProject({ id, name, description }) {
  const { data, error } = await supabase
    .from('projects')
    .update({ name, description })  // removed updated_at here
    .eq('id', id)
    .single();

  return { data, error };
}


// Delete project by ID
export async function deleteProject(id) {
  const { data, error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id);

  return { data, error };
}
