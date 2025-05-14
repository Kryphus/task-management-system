// myTasksPage.js
import { createTask } from '../services/taskService.js'; // we'll create this service later
import { getCurrentUser, getUserProjects } from '../services/authService.js'; // Make sure to import getUserProjects
import { renderTasks } from '../domUtils/taskDisplay.js'; // To display the tasks after creation
import { getProjectByNameAndUser, createProject, getProjectByName } from '../services/projectService.js';
import { getUserByUsername } from '../services/authService.js'; // Import the getUserByUsername function

export async function renderMyTasksPage() {
  const currentUser = await getCurrentUser(); // Fetch current user here

  const main = document.querySelector('main');
  main.innerHTML = `
    <h2>My Tasks</h2>
    <button id="create-task-btn">Create New Task</button>
    <div id="task-container">
      <!-- Tasks will be displayed here -->
    </div>
  `;

  // Open modal for task creation when the button is clicked
  document.getElementById('create-task-btn').addEventListener('click', () => openCreateTaskModal(currentUser));

  renderTasks(currentUser); // Pass currentUser to renderTasks
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
        <input type="text" id="task-assigned-to" placeholder="Username" value="${currentUser?.user_metadata?.username}" required><br>

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
