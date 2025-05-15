import { signOut } from '../services/authService.js';
import { renderLoginPage } from './loginPage.js';

export function logout() {
  // Create confirmation modal
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content logout-confirmation">
      <h2>Confirm Logout</h2>
      <p>Are you sure you want to logout?</p>
      <div class="buttons">
        <button id="confirm-logout-btn">Logout</button>
        <button id="cancel-logout-btn">Cancel</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Close modal function
  function closeModal() {
    document.body.removeChild(modal);
  }

  // Cancel button
  modal.querySelector('#cancel-logout-btn').addEventListener('click', () => {
    closeModal();
  });

  // Confirm logout button
  modal.querySelector('#confirm-logout-btn').addEventListener('click', async () => {
    await signOut();
    closeModal();
    renderLoginPage();
  });
}
