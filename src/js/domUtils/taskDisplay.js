import { getCurrentUser } from '../services/authService.js'; 
import { supabase } from '../services/supabaseClient.js'
import { openEditTaskModal } from '../pages/myTasksPage.js';

export async function renderTasks(currentUser) {
  const container = document.createElement('div');
  container.id = 'task-container';

  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('id, title, description, status, project_id, assigned_to')
    .eq('assigned_to', currentUser.id);

  if (error) {
    container.innerHTML = '<p>Error loading tasks.</p>';
    console.error('Error fetching tasks:', error);
    return container;
  }

  if (!tasks.length) {
    const noTasksMessage = document.createElement('p');
    noTasksMessage.textContent = 'You have no tasks yet.';
    container.appendChild(noTasksMessage);
    return container;
  }

  for (const task of tasks) {
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .select('name')
      .eq('id', task.project_id)
      .single();

    const assignedUserName = currentUser?.user_metadata?.username || 'Unknown';

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
        <span>Assigned to: ${assignedUserName}</span>
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