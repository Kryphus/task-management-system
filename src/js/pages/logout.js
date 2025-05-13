import { getCurrentUser, signOut } from '../services/authService.js';
import { renderLoginPage } from './loginPage.js';

export async function logout() {
    await signOut();
    renderLoginPage();
}