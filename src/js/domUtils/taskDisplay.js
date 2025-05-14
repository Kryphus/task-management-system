// domUtils/taskDisplay.js
import { getCurrentUser } from '../services/authService.js'; // Import getCurrentUser if needed
import { supabase } from '../services/supabaseClient.js'

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
        .single(); // Fetch the project name using the project_id

      // Get the assigned user's username from auth.user_metadata (not from user_profiles)
      const assignedUserName = currentUser?.user_metadata?.username || 'Unknown'; // Use the username from the metadata

      if (projectError) {
        console.error('Error fetching project:', projectError);
        return;
      }

      const taskDiv = document.createElement('div');
      taskDiv.className = 'task-card';
      taskDiv.style.backgroundColor = getStatusColor(task.status); // Color-coded tasks based on status
      taskDiv.innerHTML = `
        <h3>${task.title}</h3>
        <p>${task.description || 'No description'}</p>
        <p>Status: ${task.status}</p>
        <p>Project: ${projectData ? projectData.name : 'Unknown'}</p>  <!-- Display project name -->
        <p>Assigned to: ${assignedUserName}</p>  <!-- Display assigned user name from auth.user_metadata -->
      `;
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