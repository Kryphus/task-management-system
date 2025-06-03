export function showLoading(container) {
  container.innerHTML = '';
  const spinner = document.createElement('div');
  spinner.className = 'loading-spinner';
  container.appendChild(spinner);
}
