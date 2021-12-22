const spinner = document.getElementById('spinner')!;

export function showSpinner() {
  spinner.classList.toggle('d-none', false);
}
export function hideSpinner() {
  spinner.classList.toggle('d-none', true);
}
