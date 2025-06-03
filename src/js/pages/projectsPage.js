import { getCurrentUser } from '../services/authService.js';
import { createProject, getUserProjects, getProjectByNameAndUser, updateProject, deleteProject } from '../services/projectService.js';
import { supabase } from '../services/supabaseClient.js';
import { showLoading } from '../domUtils/loading.js';


export async function renderProjectsPage() {
  const main = document.querySelector('main');
  showLoading(main); 

  requestAnimationFrame(async () => {
    const currentUser = await getCurrentUser();
    const projects = await getUserProjects(currentUser.id);

    main.innerHTML = `
      <h2>Projects</h2>
      <button id="create-project-btn">Create New Project</button>
      <div id="projects-container" class="projects-container"></div>
    `;

    document.getElementById('create-project-btn').addEventListener('click', () => {
      openCreateProjectModal(currentUser);
    });

    renderProjectCards(projects);
  });
}


async function loadProjects() {
  const projectsContainer = document.getElementById('projects-container');
  projectsContainer.innerHTML = 'Loading projects...';

  const currentUser = await getCurrentUser();
  const projects = await getUserProjects(currentUser.id);

  projectsContainer.innerHTML = '';

  if (!projects || projects.length === 0) {
    projectsContainer.innerHTML = '<p>No projects found.</p>';
    return;
  }

  for (const project of projects) {
    const { data: creator, error: creatorError } = await supabase
      .from('user_profiles')
      .select('username')
      .eq('id', project.created_by)
      .single();

    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('id', { count: 'exact' })
      .eq('project_id', project.id);

    const creatorName = creatorError ? 'Unknown' : creator.username;
    const taskCount = tasksError ? 'N/A' : (tasks?.length || 0);

    const card = document.createElement('div');
    card.className = 'project-card';
    card.innerHTML = `
      <h3>${project.name}</h3>
      <p>${project.description || 'No description'}</p>
      <p><strong>Created by:</strong> ${creatorName}</p>
      <p><strong>Tasks:</strong> ${taskCount}</p>
    `;

    card.addEventListener('dblclick', () => {
      openEditProjectModal(project);
    });

    projectsContainer.appendChild(card);
  }
}

async function renderProjectCards(projects) {
  const container = document.getElementById('projects-container');
  container.innerHTML = '';

  if (!projects || projects.length === 0) {
    container.innerHTML = '<p>No projects found.</p>';
    return;
  }

  const projectDetails = await Promise.all(
    projects.map(async (project) => {
      const [creatorRes, tasksRes] = await Promise.all([
        supabase
          .from('user_profiles')
          .select('username')
          .eq('id', project.created_by)
          .single(),

        supabase
          .from('tasks')
          .select('id', { count: 'exact' })
          .eq('project_id', project.id)
      ]);

      return {
        ...project,
        creatorName: creatorRes?.data?.username || 'Unknown',
        taskCount: tasksRes?.data?.length || 0,
      };
    })
  );

  for (const project of projectDetails) {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.innerHTML = `
      <h3>${project.name}</h3>
      <p>${project.description || 'No description'}</p>
      <p><strong>Created by:</strong> ${project.creatorName}</p>
      <p><strong>Tasks:</strong> ${project.taskCount}</p>
    `;

    card.addEventListener('dblclick', () => openEditProjectModal(project));
    container.appendChild(card);
  }
}



function openCreateProjectModal(currentUser) {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <h2>Create New Project</h2>
      <form id="create-project-form">
        <label for="project-name">Project Name:</label>
        <input type="text" id="project-name" placeholder="Project Name" required><br>
        
        <label for="project-description">Description (optional):</label>
        <textarea id="project-description" placeholder="Project Description"></textarea><br>
        
        <button type="submit">Create Project</button>
      </form>
      <button id="close-modal-btn">Close</button>
    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelector('#close-modal-btn').addEventListener('click', () => {
    document.body.removeChild(modal);
  });

  modal.querySelector('#create-project-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    let name = document.getElementById('project-name').value.trim();
    const description = document.getElementById('project-description').value.trim();

    if (!name) {
      console.log('Project name is required');
      return;
    }

    if (!name.startsWith('#')) {
      name = '#' + name;
    }

    const { data, error } = await createProject(name, description, currentUser.id);
    if (error) {
      console.log(`Error creating project: ${error.message}`);
      return;
    }

    console.log('Project created successfully!');
    document.body.removeChild(modal);
    await loadProjects();
  });

}

function openEditProjectModal(project) {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <h2>Edit Project</h2>
      <form id="edit-project-form">
        <label for="edit-project-name">Project Name:</label>
        <input type="text" id="edit-project-name" value="${project.name}" required><br>

        <label for="edit-project-description">Description (optional):</label>
        <textarea id="edit-project-description">${project.description || ''}</textarea><br>

        <button type="submit">Save</button>
        <button type="button" id="delete-project-btn">Delete Project</button>
        <button type="button" id="close-modal-btn">Close</button>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  function closeModal() {
    document.body.removeChild(modal);
  }

  modal.querySelector('#close-modal-btn').addEventListener('click', closeModal);

  modal.querySelector('#delete-project-btn').addEventListener('click', async () => {
    const confirmed = confirm('Are you sure you want to delete this project? This will also delete all associated tasks.');
    if (!confirmed) return;

    const { error } = await deleteProject(project.id);
    if (error) {
      console.log('Error deleting project: ' + error.message);
      return;
    }
    console.log('Project deleted successfully.');
    closeModal();
    await loadProjects();
  });

  modal.querySelector('#edit-project-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    let name = document.getElementById('edit-project-name').value.trim();
    const description = document.getElementById('edit-project-description').value.trim();

    if (!name) {
      console.log('Project name is required.');
      return;
    }

    if (!name.startsWith('#')) {
      name = '#' + name;
    }

    const updatedProject = {
      id: project.id,
      name,
      description,
    };

    const { error } = await updateProject(updatedProject);
    if (error) {
      console.log('Error updating project: ' + error.message);
      return;
    }

    console.log('Project updated successfully.');
    closeModal();
    await loadProjects();
  });

}
