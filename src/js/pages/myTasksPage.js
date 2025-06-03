import { createTask } from '../services/taskService.js';
import { getCurrentUser, getUserProjects } from '../services/authService.js';
import { renderTasks } from '../domUtils/taskDisplay.js'; 
import { getProjectByNameAndUser, createProject, getProjectByName } from '../services/projectService.js';
import { getUserByUsername } from '../services/authService.js'; 
import { showLoading } from '../domUtils/loading.js';
import { getAllUsers } from '../services/authService.js';
import { updateTask, deleteTask } from '../services/taskService.js';


export async function renderMyTasksPage() {
  const main = document.querySelector('main');

  showLoading(main);

  requestAnimationFrame(async () => {
    const currentUser = await getCurrentUser();
    const taskContainer = await renderTasks(currentUser);

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

  document.getElementById('close-modal-btn').addEventListener('click', () => {
    document.body.removeChild(modal);
  });

  populateProjects(currentUser);
  populateUsers(currentUser);

  document.getElementById('create-task-form').addEventListener('submit', (e) => handleTaskCreation(e, currentUser));


}

async function handleTaskCreation(e, currentUser) {
  e.preventDefault();

  const title = document.getElementById('task-title').value.trim();
  const description = document.getElementById('task-description').value.trim();
  const status = document.getElementById('task-status').value;
  const project = document.getElementById('task-project').value;
  const assignedTo = document.getElementById('task-assigned-to').value.trim();

  let assignedUserUUID = currentUser?.id;

  if (assignedTo && assignedTo !== currentUser?.user_metadata?.username) {
    const { data, error } = await getUserByUsername(assignedTo);
    if (error) {
      console.log('User not found');
      return;
    }
    assignedUserUUID = data?.id; 
  }

  let projectUUID = null;

  if (project === '#Home') {
    const { data: projectData, error } = await getProjectByNameAndUser('#Home', currentUser.id);
    if (!projectData) {
      console.log('Creating #Home project...');
      const { data: newProject, error: createError } = await createProject('#Home', 'Default project for all users', currentUser.id);
      console.log('Create project result:', newProject, createError);


      if (createError || !newProject) {
        console.log('Error creating the #Home project');
        return;
      }
      projectUUID = newProject.id;
    } else {
      projectUUID = projectData.id;
    }

  } else {
    const { data: projectData, error } = await getProjectByName(project);
    if (error || !projectData) {
      console.log('Project not found');
      return;
    }
    projectUUID = projectData.id;
  }

  const { data, error } = await createTask(title, description, status, projectUUID, assignedUserUUID, currentUser?.id);

  if (error) {
    console.log(error.message);
  } else {
    console.log('Task created successfully!');
    renderTasks(currentUser);
    document.body.removeChild(document.querySelector('.modal'));
  }

  // Refresh the task list
  const newContainer = await renderTasks(currentUser);  
  const main = document.querySelector('main');
  const oldContainer = document.getElementById('task-container');

  if (main && oldContainer) {
    main.replaceChild(newContainer, oldContainer);
  }
}



async function populateProjects(currentUser) {
  const projectDropdown = document.getElementById('task-project');
  projectDropdown.innerHTML = ''; 

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

  if (!hasHome) {
    const homeOption = document.createElement('option');
    homeOption.value = '#Home';
    homeOption.textContent = '#Home';
    projectDropdown.appendChild(homeOption);
  }
}


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

  function closeModal() {
    document.body.removeChild(modal);
  }

  modal.querySelector('#close-modal-btn').addEventListener('click', closeModal);

  modal.querySelector('#delete-task-btn').addEventListener('click', async () => {
    const confirmed = confirm('Are you sure you want to delete this task?');
    if (!confirmed) return;

    const { error } = await deleteTask(task.id);
    if (error) {
      console.log('Error deleting task: ' + error.message);
      return;
    }
    console.log('Task deleted successfully.');
    closeModal();
    const currentUser = await getCurrentUser();
    renderTasks(currentUser);
  });

  modal.querySelector('#edit-task-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const updatedTask = {
      id: task.id,
      title: document.getElementById('edit-task-title').value.trim(),
      description: document.getElementById('edit-task-description').value.trim(),
      status: document.getElementById('edit-task-status').value,
    };

    if (!updatedTask.title) {
      console.log('Title is required.');
      return;
    }

    const { error } = await updateTask(updatedTask);
    if (error) {
      console.logle.log('Error updating task: ' + error.message);
      return;
    }
    alert('Task updated successfully.');
    closeModal();
    const currentUser = await getCurrentUser(); 
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

    if (user.id === currentUser.id) {
      option.selected = true;
    }

    dropdown.appendChild(option);
  });
}