

import { signIn } from '../services/authService.js';
import { renderNav } from './main-page.js';
import { renderSignupPage } from './signupPage.js';
import { handleNavigation } from '../domUtils/handleNavigation.js';

import logo from '../../assets/logo.png';
import illustration from '../../assets/digital-illustration.png';

export function renderLoginPage() {
  const body = document.querySelector('body');
  body.innerHTML = ''; // Clear body content

  const app = document.createElement('div');
  app.id = 'app';
  body.appendChild(app);

  // Create a wrapper for centering
  const wrapper = document.createElement('div');
  wrapper.className = 'form-wrapper';
  app.appendChild(wrapper);

  wrapper.innerHTML = `
  <div class="auth-container">
    <div class="auth-left">
      <div class="form-card fade-in" id="login-card">

        <div class="logo-group">
          <img src="${logo}" alt="Logo">
          <span class="logo-text">okidoki</span>
        </div>      

        <h2>Sign In</h2>
        <form id="login-form">
          <input type="email" id="login-email" placeholder="Email" required><br>
          <div id="login-email-error" class="error"></div>

          <input type="password" id="login-password" placeholder="Password" required><br>
          <div id="login-password-error" class="error"></div>

          <button type="submit">Sign In</button>
        </form>
        <p>Don't have an account? <a href="#" id="go-to-signup">Sign up</a></p>
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
  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();

    const { data, error } = await signIn(email, password);

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        document.getElementById('login-email-error').textContent = 'Invalid email or password.';
      } else {
        console.log(error.message);
      }
      return;
    }

    renderNav();
    handleNavigation();
  });

  // Navigate to signup page
  document.getElementById('go-to-signup').addEventListener('click', (e) => {
    e.preventDefault();
    renderSignupPage();
  });
}

function clearErrors() {
  document.getElementById('login-email-error').textContent = '';
  document.getElementById('login-password-error').textContent = '';
}