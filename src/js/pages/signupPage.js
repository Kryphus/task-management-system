
import { signUp } from '../services/authService.js';
import { renderLoginPage } from './loginPage.js';
import illustration from '../../assets/digital-illustration.png';
import logo from '../../assets/logo.png';

export function renderSignupPage() {



  const app = document.getElementById('app');
  app.innerHTML = ''; // Clear content

  // Create a wrapper for centering
  const wrapper = document.createElement('div');
  wrapper.className = 'form-wrapper';
  app.appendChild(wrapper);

  wrapper.innerHTML = `
  <div class="auth-container">
    <div class="auth-left">
      <div class="form-card fade-in" id="signup-card">

        <div class="logo-group">
          <img src="${logo}" alt="Logo">
          <span class="logo-text">okidoki</span>
        </div>

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
      </div>
    </div>
    <div class="auth-right">
      <img src="${illustration}" alt="Illustration">
    </div>
  </div>
`;

  // Trigger the fade-in transition after the content is loaded
  const formCard = wrapper.querySelector('.form-card');
  formCard.classList.add('fade-in');
  setTimeout(() => {
    formCard.classList.add('show');
  }, 0);

  // Submit event for form
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

  // Navigate to login page
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
