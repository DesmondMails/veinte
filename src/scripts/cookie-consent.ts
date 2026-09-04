type CookieConsent = 'accepted' | 'rejected';

const STORAGE_KEY = 'veinte-cookie-consent';

function readConsent(): CookieConsent | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === 'accepted' || value === 'rejected' ? value : null;
  } catch {
    return null;
  }
}

function initCookieConsent() {
  const dialog = document.querySelector<HTMLElement>('[data-cookie-consent]');
  if (!dialog) return;

  const acceptButton = dialog.querySelector<HTMLButtonElement>('[data-cookie-accept]');
  const rejectButton = dialog.querySelector<HTMLButtonElement>('[data-cookie-reject]');

  const applyConsent = (consent: CookieConsent) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, consent);
    } catch {
      // The preference remains active for this page view if storage is unavailable.
    }

    document.documentElement.dataset.cookieConsent = consent;
    dialog.hidden = true;
    window.dispatchEvent(new CustomEvent<CookieConsent>('veinte:cookie-consent', { detail: consent }));
  };

  const savedConsent = readConsent();
  if (savedConsent) {
    document.documentElement.dataset.cookieConsent = savedConsent;
    return;
  }

  dialog.hidden = false;
  acceptButton?.addEventListener('click', () => applyConsent('accepted'));
  rejectButton?.addEventListener('click', () => applyConsent('rejected'));
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCookieConsent);
} else {
  initCookieConsent();
}
