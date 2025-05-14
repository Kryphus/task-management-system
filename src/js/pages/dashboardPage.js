import { getCurrentUser } from '../services/authService.js';

export async function renderDashboardPage() {
    const user = await getCurrentUser();

    const username = user?.user_metadata?.username || 'User';

    const main = document.querySelector('main');
    main.innerHTML = `
    <h2>Hello, ${username}!</h2>
    `;

}
