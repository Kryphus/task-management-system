// domUtils/taskDisplay.js
import { getCurrentUser } from '../services/authService.js'; // Import getCurrentUser if needed
import { supabase } from '../services/supabaseClient.js'
import { openEditTaskModal } from '../pages/myTasksPage.js';

export async function renderTasks(currentUser) {
  const taskContainer = document.getElementById('task-container');
  taskContainer.innerHTML = ''; // Clear current tasks

  // Fetch tasks for the current user
  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('id, title, description, status, project_id, assigned_to') // Selecting necessary fields
    .eq('assigned_to', currentUser.id); // Fetch tasks assigned to the current user

  if (error) {
    console.error('Error fetching tasks:', error);
    return;
  }

  if (tasks.length === 0) {
    const noTasksMessage = document.createElement('p');
    noTasksMessage.textContent = 'You have no tasks yet.';
    taskContainer.appendChild(noTasksMessage); // Display message if no tasks exist
  } else {
    for (const task of tasks) {
      // Fetch project name using the project_id
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('name')
        .eq('id', task.project_id)
        .single();

      const assignedUserName = currentUser?.user_metadata?.username || 'Unknown';

      if (projectError) {
        console.error('Error fetching project:', projectError);
        return;
      }

      const taskDiv = document.createElement('div');
      taskDiv.className = 'task-card'; // Keep only this line for class

      taskDiv.innerHTML = `
    <div class="task-details">
      <h3>${task.title}</h3>
      <p class="description">${task.description || 'No description'}</p>
    </div>
    <div class="task-info">
      <span class="task-status status-${task.status.toLowerCase().replace(' ', '-')}">${task.status}</span>
      <span>Project: ${projectData ? projectData.name : 'Unknown'}</span>
      <span>Assigned to: ${assignedUserName}</span>
    </div>
  `;

      taskDiv.addEventListener('dblclick', () => {
        openEditTaskModal(task);
      });

      taskContainer.appendChild(taskDiv);
    }

  }


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