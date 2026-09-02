/**
 * Progressive-enhancement handler for the Cloudflare Worker CTA. Without JS
 * the form makes a regular POST to the endpoint; with JS it shows inline
 * submitting, success, and error states instead of navigating away.
 */

function encode(data: Record<string, string>): string {
  return Object.keys(data)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
    .join('&');
}

function initCtaForm() {
  const form = document.querySelector<HTMLFormElement>('[data-cta-form]');
  if (!form) return;

  const endpoint = form.dataset.leadsEndpoint;
  const status = form.querySelector<HTMLElement>('[data-cta-status]');
  const submitButton = form.querySelector<HTMLButtonElement>('[data-cta-submit]');
  let toastTimeout: number | undefined;

  if (!endpoint) return;

  const clearStatus = () => {
    window.clearTimeout(toastTimeout);
    status?.removeAttribute('data-state');
    if (status) status.textContent = '';
  };

  const showToast = (state: 'success' | 'error', message: string) => {
    if (!status) return;

    clearStatus();
    status.setAttribute('data-state', state);
    status.textContent = message;
    toastTimeout = window.setTimeout(clearStatus, 3_000);
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const payload: Record<string, string> = {};
    formData.forEach((value, key) => {
      payload[key] = String(value);
    });

    if (payload['bot-field']) {
      return;
    }

    submitButton?.setAttribute('data-loading', 'true');
    if (submitButton) submitButton.disabled = true;
    clearStatus();

    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: encode(payload),
    })
      .then((response) => {
        if (!response.ok) throw new Error(`Request failed with ${response.status}`);
        form.reset();
        showToast('success', 'Дякуємо! Ми зв\u2019яжемося з вами найближчим часом.');
      })
      .catch(() => {
        showToast('error', 'Щось пішло не так. Спробуйте ще раз або напишіть нам напряму.');
      })
      .finally(() => {
        submitButton?.removeAttribute('data-loading');
        if (submitButton) submitButton.disabled = false;
      });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCtaForm);
} else {
  initCtaForm();
}
