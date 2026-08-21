/**
 * Progressive-enhancement handler for the Netlify Forms CTA. Without JS the
 * form still works via a normal POST + full page reload (Netlify's standard
 * static-form handling). With JS we intercept submit to show inline
 * submitting/success/error states instead of navigating away.
 */

function encode(data: Record<string, string>): string {
  return Object.keys(data)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
    .join('&');
}

function initCtaForm() {
  const form = document.querySelector<HTMLFormElement>('[data-cta-form]');
  if (!form) return;

  const status = form.querySelector<HTMLElement>('[data-cta-status]');
  const submitButton = form.querySelector<HTMLButtonElement>('[data-cta-submit]');

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
    if (status) {
      status.removeAttribute('data-state');
      status.textContent = '';
    }

    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: encode(payload),
    })
      .then((response) => {
        if (!response.ok) throw new Error(`Request failed with ${response.status}`);
        form.reset();
        if (status) {
          status.setAttribute('data-state', 'success');
          status.textContent = 'Дякуємо! Ми зв\u2019яжемося з вами найближчим часом.';
        }
      })
      .catch(() => {
        if (status) {
          status.setAttribute('data-state', 'error');
          status.textContent = 'Щось пішло не так. Спробуйте ще раз або напишіть нам напряму.';
        }
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
