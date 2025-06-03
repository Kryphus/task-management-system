
import { renderDashboardPage } from '../pages/dashboardPage.js';
import { renderMyTasksPage } from '../pages/myTasksPage.js';
import { renderInboxPage } from '../pages/inboxPage.js';
import { renderProjectsPage } from '../pages/projectsPage.js';
import { logout } from '../pages/logout.js';



export function handleNavigation() {
    const navLinks = document.querySelectorAll('#sidebar a');
    const mainTag = document.querySelector('main');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            navLinks.forEach(link => link.parentElement.classList.remove('active'));
            link.parentElement.classList.add('active');

            const page = link.textContent.trim().toUpperCase();
            mainTag.innerHTML = ''; 
            mainTag.className = '';

            switch (page) {
                case 'HOME':
                    renderDashboardPage(mainTag);
                    break;
                case 'MY TASKS':
                    renderMyTasksPage(mainTag);
                    break;
                case 'INBOX':
                    renderInboxPage(mainTag);
                    break;
                case 'PROJECTS':
                    renderProjectsPage(mainTag);
                    break;
                case 'LOGOUT':
                    logout(mainTag);
                    break;
                default:
                    renderDashboardPage(mainTag);
            }
        });
    });

    const toggleButton = document.getElementById('toggle-btn');
    const sidebar = document.getElementById('sidebar');

    if (toggleButton && sidebar) {
        toggleButton.addEventListener('click', () => {
            sidebar.classList.toggle('close');
            toggleButton.classList.toggle('rotate');
        });
    }
}