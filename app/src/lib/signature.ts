/**
 * Public signature preflight. Signing starts a GitHub contribution; it does not
 * become public until the generated pull request is reviewed and merged.
 */
export function initSignDialog(): void {
  const dialog = document.getElementById('sign-dialog') as HTMLDialogElement | null;
  const continueLink = document.getElementById('sign-dialog-continue') as HTMLAnchorElement | null;
  if (!dialog || !continueLink) return;

  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    const trigger = target.closest<HTMLElement>('[data-github-url]');
    if (!trigger || dialog.contains(trigger)) return;

    event.preventDefault();
    const githubUrl = trigger.dataset.githubUrl;
    if (githubUrl) continueLink.href = githubUrl;
    dialog.showModal();
  });

  document.querySelectorAll<HTMLElement>('[data-sign-dialog-close]').forEach((button) => {
    button.addEventListener('click', () => dialog.close());
  });

  continueLink.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
}
