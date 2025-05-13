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
