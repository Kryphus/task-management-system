// services/logService.js
import { supabase } from './supabaseClient.js';

export async function deleteLog(id) {
  const { data, error } = await supabase
    .from('activity_logs')
    .delete()
    .eq('id', id);

  return { data, error };
}
