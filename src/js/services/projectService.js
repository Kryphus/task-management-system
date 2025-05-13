import { supabase } from './supabaseClient.js';

// Fetch project by name (e.g., #Home)
export async function getProjectByName(projectName) {
  const { data, error } = await supabase
    .from('projects')
    .select('id')
    .eq('name', projectName)
    .single();  // Ensure only one project is returned

  if (error) {
    console.error('Error fetching project by name:', error);
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