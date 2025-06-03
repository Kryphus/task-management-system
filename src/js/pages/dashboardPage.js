import { getCurrentUser } from '../services/authService.js';
import { supabase } from '../services/supabaseClient.js';
import { showLoading } from '../domUtils/loading.js';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function getFormattedDate() {
  const options = { weekday: 'long', month: 'long', day: 'numeric' };
  return new Date().toLocaleDateString(undefined, options);
}

export async function renderDashboardPage() {

  const main = document.querySelector('main');
  showLoading(main);
  const user = await getCurrentUser();
  const userId = user?.id;
  const username = user?.user_metadata?.username || 'User';

  const { count: completedTasksCount, error: tasksError } = await supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .eq('assigned_to', userId)
    .eq('status', 'Done');

  const { count: totalProjectsCount, error: projectsError } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('created_by', userId);

  if (tasksError || projectsError) {
    console.error('Error fetching dashboard data:', tasksError || projectsError);
  }

  const greeting = getGreeting();
  const dateStr = getFormattedDate();

  
  main.innerHTML = `
    <div class="dashboard-container">
      <p class="dashboard-date">${dateStr}</p>
      <h1 class="dashboard-greeting">${greeting}, ${username}</h1>
      <div class="dashboard-stats">
        <div class="stat">
          <div class="stat-number">${completedTasksCount ?? 0}</div>
          <div class="stat-label">tasks completed</div>
        </div>
        <div class="stat">
          <div class="stat-number">${totalProjectsCount ?? 0}</div>
          <div class="stat-label">projects</div>
        </div>
      </div>
    </div>
  `;
}

