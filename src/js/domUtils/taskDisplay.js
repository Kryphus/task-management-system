import { getCurrentUser } from '../services/authService.js'; 
import { supabase } from '../services/supabaseClient.js'
import { openEditTaskModal } from '../pages/myTasksPage.js';
import { showLoading } from './loading.js';

export async function renderTasks(currentUser, sortByStatus = false) {
  const container = document.createElement('div');
  container.id = 'task-container';
  showLoading(container);

  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('id, title, description, status, project_id, assigned_to')
    .eq('assigned_to', currentUser.id);

  if (error) {
    console.error('Error fetching tasks:', error);
    container.innerHTML = '<p>Error loading tasks.</p>';
    return container;
  }

  container.innerHTML = '';

  if (sortByStatus) {
    const statusOrder = { 'To-Do': 0, 'In Progress': 1, 'Done': 2 };
    tasks.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
  }

  if (tasks.length === 0) {
    container.innerHTML = '<p>You have no tasks yet.</p>';
    return container;
  }

  for (const task of tasks) {
    const { data: projectData } = await supabase
      .from('projects')
      .select('name')
      .eq('id', task.project_id)
      .single();

    const taskDiv = document.createElement('div');
    taskDiv.className = 'task-card';
    taskDiv.innerHTML = `
      <div class="task-details">
        <h3>${task.title}</h3>
        <p class="description">${task.description || 'No description'}</p>
      </div>
      <div class="task-info">
        <span class="task-status status-${task.status.toLowerCase().replace(' ', '-')}">${task.status}</span>
        <span>Project: ${projectData?.name || 'Unknown'}</span>
        <span>Assigned to: ${currentUser?.user_metadata?.username || 'Unknown'}</span>
      </div>
    `;

    taskDiv.addEventListener('dblclick', () => {
      openEditTaskModal(task);
    });

    container.appendChild(taskDiv);
  }

  return container;
}



function getStatusColor(status) {
  switch (status) {
    case 'To-Do':
      return 'lightgray';
    case 'In Progress':
      return 'yellow';
    case 'Done':
      return 'green';
    default:
      return 'white';
  }
}