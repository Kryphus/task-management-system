import { supabase } from './supabaseClient.js';

export async function createTask(title, description, status, project, assignedTo, createdBy) {
  const { data, error } = await supabase
    .from('tasks')
    .insert([{
      title, description, status, project_id: project, assigned_to: assignedTo, created_by: createdBy
    }]);

  if (error) {
    return { data: null, error };
  }

  // Log for creator
  insertLog({
    userId: createdBy,
    actorId: createdBy,
    actionType: 'created_task',
    message: `You created a new task '${title}'`
  });

  // If assignedTo is someone else, log for assigned user
  if (assignedTo && assignedTo !== createdBy) {
    insertLog({
      userId: assignedTo,
      actorId: createdBy,
      actionType: 'assigned_task',
      message: `User assigned you a new task '${title}' — go check it out now`
    });
  }

  return { data, error: null };
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

// Helper function to insert a log entry
async function insertLog({ userId, actorId, actionType, message }) {
  const { error } = await supabase
    .from('activity_logs')
    .insert([{ user_id: userId, actor_id: actorId, action_type: actionType, message }]);

  if (error) {
    console.error('Error inserting log:', error);
  }
}