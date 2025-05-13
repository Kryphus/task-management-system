import { signUp } from '../services/authService.js';
import { renderLoginPage } from './loginPage.js';

export function renderSignupPage() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <h2>Sign Up</h2>
    <form id="signup-form">
      <input type="text" id="signup-username" placeholder="Username" required><br>
      <div id="signup-username-error" class="error"></div>

      <input type="email" id="signup-email" placeholder="Email" required><br>
      <div id="signup-email-error" class="error"></div>

      <input type="password" id="signup-password" placeholder="Password" required><br>
      <div id="signup-password-error" class="error"></div>

      <button type="submit">Sign Up</button>
    </form>
    <p>Already have an account? <a href="#" id="go-to-login">Sign In</a></p>
    <div id="signup-success" class="success"></div>
  `;

  document.getElementById('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const username = document.getElementById('signup-username').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value.trim();

    if (password.length < 6) {
      document.getElementById('signup-password-error').textContent = 'Password must be at least 6 characters.';
      return;
    }

    const { data, error } = await signUp(email, password, username);

    if (error) {
      document.getElementById('signup-email-error').textContent = error.message;
      return;
    }

    document.getElementById('signup-success').textContent = "Account created, you can now sign in.";
  });

  document.getElementById('go-to-login').addEventListener('click', (e) => {
    e.preventDefault();
    renderLoginPage();
  });
}

function clearErrors() {
  document.getElementById('signup-username-error').textContent = '';
  document.getElementById('signup-email-error').textContent = '';
  document.getElementById('signup-password-error').textContent = '';
  document.getElementById('signup-success').textContent = '';
}
