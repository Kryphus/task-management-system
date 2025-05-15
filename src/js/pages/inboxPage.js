import { supabase } from '../services/supabaseClient.js';
import { getCurrentUser } from '../services/authService.js';
import { deleteLog } from '../services/logService.js';

export async function renderInboxPage() {
  const main = document.querySelector('main');
  const user = await getCurrentUser();

  if (!user) {
    main.innerHTML = '<p>Please sign in to view your inbox.</p>';
    return;
  }

  const { data: logs, error } = await supabase
    .from('activity_logs')
    .select('id, message, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    main.innerHTML = '<p>Error loading logs.</p>';
    console.error('Error fetching logs:', error);
    return;
  }

  if (!logs || logs.length === 0) {
    main.innerHTML = '<h2>Inbox</h2><p>No new notifications.</p>';
    return;
  }

  main.innerHTML = `
    <h2>Inbox</h2>
    <div id="logs-container"></div>
  `;

  const logsContainer = document.getElementById('logs-container');

  logs.forEach(log => {
    const div = document.createElement('div');
    div.className = 'log-entry';
    div.innerHTML = `
      <p>${log.message}</p>
      <small>${new Date(log.created_at).toLocaleString()}</small>
    `;

    // Attach double-click listener to open delete modal
    div.addEventListener('dblclick', () => openDeleteLogModal(log.id));
    logsContainer.appendChild(div);
  });
}

function openDeleteLogModal(logId) {
  const modal = document.createElement('div');
  modal.className = 'modal inbox-modal';
  modal.innerHTML = `
    <div class="modal-content">
      <h2>Delete Log</h2>
      <p>Are you sure you want to delete this log?</p>
      <button id="confirm-delete-btn">Delete</button>
      <button id="cancel-btn">Cancel</button>
    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelector('#cancel-btn').addEventListener('click', () => {
    document.body.removeChild(modal);
  });

  modal.querySelector('#confirm-delete-btn').addEventListener('click', async () => {
    const { error } = await deleteLog(logId);
    if (error) {
      alert('Error deleting log: ' + error.message);
      return;
    }
    alert('Log deleted successfully.');
    document.body.removeChild(modal);
    // Refresh inbox logs
    renderInboxPage();
  });
}
