// myTasksPage.js
import { createTask } from '../services/taskService.js'; // we'll create this service later
import { getCurrentUser, getUserProjects } from '../services/authService.js'; // Make sure to import getUserProjects
import { renderTasks } from '../domUtils/taskDisplay.js'; // To display the tasks after creation
import { getProjectByNameAndUser, createProject, getProjectByName } from '../services/projectService.js';
import { getUserByUsername } from '../services/authService.js'; // Import the getUserByUsername function
import { showLoading } from '../domUtils/loading.js';
import { getAllUsers } from '../services/authService.js';


export async function renderMyTasksPage() {
  const main = document.querySelector('main');

  // Step 1: Show loading spinner
  showLoading(main);

  // Step 2: Allow spinner to render first before continuing
  requestAnimationFrame(async () => {
    const currentUser = await getCurrentUser();
    const taskContainer = await renderTasks(currentUser);

    // Step 3: Replace with actual task UI
    main.innerHTML = `
      <h2>My Tasks</h2>
      <button id="create-task-btn">Create New Task</button>
    `;
    main.appendChild(taskContainer);

    document.getElementById('create-task-btn').addEventListener('click', () => {
      openCreateTaskModal(currentUser);
    });
  });
}



function openCreateTaskModal(currentUser) {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <h2>Create New Task</h2>
      <form id="create-task-form">
        <label for="task-title">Title:</label>
        <input type="text" id="task-title" placeholder="Task Title" required><br>
        
        <label for="task-description">Description (optional):</label>
        <textarea id="task-description" placeholder="Task Description"></textarea><br>

        <label for="task-status">Status:</label>
        <select id="task-status">
          <option value="To-Do">To-Do</option>
          <option value="In Progress">In Progress</option>
          <option value="Done">Done</option>
        </select><br>

        <label for="task-project">Project:</label>
        <select id="task-project">
          <option value="#Home">#Home</option>
          <!-- Dynamically populated projects will go here -->
        </select><br>

        <label for="task-assigned-to">Assigned to:</label>
        <select id="task-assigned-to" required></select><br>

        <button type="submit">Create Task</button>
      </form>
      <button id="close-modal-btn">Close</button>
    </div>
  `;

  document.body.appendChild(modal);

  // Close the modal
  document.getElementById('close-modal-btn').addEventListener('click', () => {
    document.body.removeChild(modal);
  });

  // Populate projects in the dropdown (for now, only #Home is static)
  populateProjects(currentUser);
  populateUsers(currentUser);


  // Handle task creation form submission
  document.getElementById('create-task-form').addEventListener('submit', (e) => handleTaskCreation(e, currentUser));


}

// myTasksPage.js
async function handleTaskCreation(e, currentUser) {
  e.preventDefault();

  const title = document.getElementById('task-title').value.trim();
  const description = document.getElementById('task-description').value.trim();
  const status = document.getElementById('task-status').value;
  const project = document.getElementById('task-project').value;
  const assignedTo = document.getElementById('task-assigned-to').value.trim();

  let assignedUserUUID = currentUser?.id; // Default to current user

  if (assignedTo && assignedTo !== currentUser?.user_metadata?.username) {
    // Now we use getUserByUsername to fetch the assigned user's UUID based on their username
    const { data, error } = await getUserByUsername(assignedTo);
    if (error) {
      alert('User not found');
      return;
    }
    assignedUserUUID = data?.id; // Set the assigned user's UUID
  }

  let projectUUID = null;

  if (project === '#Home') {
    const { data: projectData, error } = await getProjectByNameAndUser('#Home', currentUser.id);
    if (!projectData) {
      console.log('Creating #Home project...');
      const { data: newProject, error: createError } = await createProject('#Home', 'Default project for all users', currentUser.id);
      console.log('Create project result:', newProject, createError);


      if (createError || !newProject) {
        alert('Error creating the #Home project');
        return;
      }
      projectUUID = newProject.id;
    } else {
      projectUUID = projectData.id;
    }

  } else {
    const { data: projectData, error } = await getProjectByName(project);
    if (error || !projectData) {
      alert('Project not found');
      return;
    }
    projectUUID = projectData.id;
  }

  const { data, error } = await createTask(title, description, status, projectUUID, assignedUserUUID, currentUser?.id);

  if (error) {
    alert(error.message);
  } else {
    alert('Task created successfully!');
    renderTasks(currentUser); // Pass currentUser to renderTasks
    document.body.removeChild(document.querySelector('.modal'));
  }

  // Refresh the task list
  const newContainer = await renderTasks(currentUser);  // returns the new DOM
  const main = document.querySelector('main');
  const oldContainer = document.getElementById('task-container');

  if (main && oldContainer) {
    main.replaceChild(newContainer, oldContainer);
  }
}



async function populateProjects(currentUser) {
  const projectDropdown = document.getElementById('task-project');
  projectDropdown.innerHTML = ''; // Clear existing options

  const projects = await getUserProjects(currentUser.id);

  let hasHome = false;

  if (projects && projects.length > 0) {
    projects.forEach(project => {
      if (project.name === '#Home') hasHome = true;

      const option = document.createElement('option');
      option.value = project.name;
      option.textContent = project.name;
      projectDropdown.appendChild(option);
    });
  }

  // Append #Home if not found in projects
  if (!hasHome) {
    const homeOption = document.createElement('option');
    homeOption.value = '#Home';
    homeOption.textContent = '#Home';
    projectDropdown.appendChild(homeOption);
  }
}



// open and edit task modal

import { updateTask, deleteTask } from '../services/taskService.js';

export function openEditTaskModal(task) {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <h2>Edit Task</h2>
      <form id="edit-task-form">
        <label for="edit-task-title">Title:</label>
        <input type="text" id="edit-task-title" value="${task.title}" required><br>
        
        <label for="edit-task-description">Description (optional):</label>
        <textarea id="edit-task-description">${task.description || ''}</textarea><br>
        
        <label for="edit-task-status">Status:</label>
        <select id="edit-task-status">
          <option value="To-Do" ${task.status === 'To-Do' ? 'selected' : ''}>To-Do</option>
          <option value="In Progress" ${task.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
          <option value="Done" ${task.status === 'Done' ? 'selected' : ''}>Done</option>
        </select><br>

        <button type="submit">Save</button>
        <button type="button" id="delete-task-btn">Delete Task</button>
        <button type="button" id="close-modal-btn">Close</button>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  // Close modal function
  function closeModal() {
    document.body.removeChild(modal);
  }

  // Close button handler
  modal.querySelector('#close-modal-btn').addEventListener('click', closeModal);

  // Delete button handler
  modal.querySelector('#delete-task-btn').addEventListener('click', async () => {
    const confirmed = confirm('Are you sure you want to delete this task?');
    if (!confirmed) return;

    const { error } = await deleteTask(task.id);
    if (error) {
      alert('Error deleting task: ' + error.message);
      return;
    }
    alert('Task deleted successfully.');
    closeModal();
    const currentUser = await getCurrentUser(); // make sure you have access or pass user
    renderTasks(currentUser);
  });

  // Save (update) handler
  modal.querySelector('#edit-task-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const updatedTask = {
      id: task.id,
      title: document.getElementById('edit-task-title').value.trim(),
      description: document.getElementById('edit-task-description').value.trim(),
      status: document.getElementById('edit-task-status').value,
    };

    if (!updatedTask.title) {
      alert('Title is required.');
      return;
    }

    const { error } = await updateTask(updatedTask);
    if (error) {
      alert('Error updating task: ' + error.message);
      return;
    }
    alert('Task updated successfully.');
    closeModal();
    const currentUser = await getCurrentUser(); // or pass user as param
    renderTasks(currentUser);
  });
}

async function populateUsers(currentUser) {
  const dropdown = document.getElementById('task-assigned-to');
  dropdown.innerHTML = '';

  const users = await getAllUsers();

  users.forEach(user => {
    const option = document.createElement('option');
    option.value = user.username;
    option.textContent = user.username;

    // Preselect current user
    if (user.id === currentUser.id) {
      option.selected = true;
    }

    dropdown.appendChild(option);
  });
}