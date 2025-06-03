import { supabase } from './supabaseClient.js';

// Fetch project by name and user ID
export async function getProjectByNameAndUser(projectName, userId) {
  const { data, error } = await supabase
    .from('projects')
    .select('id')
    .eq('name', projectName)
    .eq('created_by', userId)
    .single(); 

  if (error && error.code !== 'PGRST116') { 
    console.error('Error fetching project by name and user:', error);
    return { data: null, error };
  }

  return { data, error: null };
}


// Create a new project
export async function createProject(projectName, description, userId) {
  const { data, error } = await supabase
    .from('projects')
    .insert([{ name: projectName, description, created_by: userId }])
    .single();

  if (error) {
    console.error('Error creating project:', error);
    return { data: null, error };
  }

  // Insert log for creator
  insertLog({
    userId,
    actorId: userId,
    actionType: 'created_project',
    message: `You created a new project '${projectName}'`
  });

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
    .update({ name, description })  
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

// Helper to insert log
async function insertLog({ userId, actorId, actionType, message }) {
  const { error } = await supabase
    .from('activity_logs')
    .insert([{ user_id: userId, actor_id: actorId, action_type: actionType, message }]);

  if (error) {
    console.error('Error inserting log:', error);
  }
}