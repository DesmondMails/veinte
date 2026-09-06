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

function trackLead() {
  const analytics = window as Window & {
    gtag?: (...args: unknown[]) => void;
  };

  analytics.gtag?.('event', 'generate_lead', {
    form_name: 'course_consultation',
    form_location: 'cta_section',
  });
}

function initCtaForm() {
  const form = document.querySelector<HTMLFormElement>('[data-cta-form]');
  if (!form) return;

  const endpoint = form.dataset.leadsEndpoint;
  const status = document.querySelector<HTMLElement>('[data-cta-status]');
  const statusMessage = status?.querySelector<HTMLElement>('[data-cta-status-message]');
  const submitButton = form.querySelector<HTMLButtonElement>('[data-cta-submit]');
  let toastTimeout: number | undefined;

  if (!endpoint) return;

  // Keep the fixed toast outside section-level stacking contexts and clipping.
  if (status) document.body.append(status);

  const toasts: Record<'success' | 'error', { emoji: string; lines: string[] }> = {
    success: {
      emoji: '🧡',
      lines: ['Дякуємо! Ми зв\u2019яжемося з вами найближчим часом.'],
    },
    error: {
      emoji: '😥',
      lines: ['Упс, щось пішло не так!', 'Спробуйте ще раз або зв\u2019яжіться з нами'],
    },
  };

  const clearStatus = () => {
    window.clearTimeout(toastTimeout);
    status?.removeAttribute('data-state');
    if (statusMessage) statusMessage.replaceChildren();
  };

  const showToast = (state: 'success' | 'error') => {
    if (!status || !statusMessage) return;

    const { emoji, lines } = toasts[state];
    clearStatus();
    status.setAttribute('data-state', state);

    const firstLine = document.createElement('span');
    firstLine.className = 'form-toast__line';

    const emojiEl = document.createElement('span');
    emojiEl.className = 'form-toast__emoji';
    emojiEl.setAttribute('aria-hidden', 'true');
    emojiEl.textContent = `${emoji} `;
    firstLine.append(emojiEl, document.createTextNode(lines[0]));
    statusMessage.append(firstLine);

    lines.slice(1).forEach((line) => {
      const nextLine = document.createElement('span');
      nextLine.className = 'form-toast__line';
      nextLine.textContent = line;
      statusMessage.append(nextLine);
    });

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
        trackLead();
        form.reset();
        showToast('success');
      })
      .catch(() => {
        showToast('error');
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
