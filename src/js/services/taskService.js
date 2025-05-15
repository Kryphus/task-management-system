// services/taskService.js
import { supabase } from './supabaseClient.js';

export async function createTask(title, description, status, project, assignedTo, createdBy) {
  const { data, error } = await supabase
    .from('tasks')
    .insert([
      {
        title,
        description,
        status,
        project_id: project,  // Ensure project is correctly linked to the project ID
        assigned_to: assignedTo,
        created_by: createdBy,
      }
    ]);

  return { data, error };
}

// Update task by ID
export async function updateTask({ id, title, description, status }) {
  const { data, error } = await supabase
    .from('tasks')
    .update({ title, description, status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .single();

  return { data, error };
}

// Delete task by ID
export async function deleteTask(id) {
  const { data, error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id);

  return { data, error };
}

