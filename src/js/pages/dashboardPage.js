import { getCurrentUser, signOut } from '../services/authService.js';
// import { renderLoginPage } from './loginPage.js';



export async function renderDashboardPage() {
    const user = await getCurrentUser();

    const username = user?.user_metadata?.username || 'User';

    const main = document.querySelector('main');
    main.innerHTML = `
    <h2>Hello, ${username}!</h2>
    
    `;

    // <button id="logout-btn">Logout</button>
    //   document.getElementById('logout-btn').addEventListener('click', async () => {
    //     await signOut();
    //     renderLoginPage();
    //   });
}
