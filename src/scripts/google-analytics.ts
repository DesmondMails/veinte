type AnalyticsCookieConsent = 'accepted' | 'rejected';

export {};

declare global {
  interface Window {
    dataLayer?: IArguments[];
    gtag?: (...args: unknown[]) => void;
  }
}

let analyticsLoaded = false;

function loadAnalytics(measurementId: string) {
  if (analyticsLoaded || !measurementId) return;

  analyticsLoaded = true;
  window.dataLayer = window.dataLayer ?? [];
  // gtag.js expects each queued command as an Arguments object, not a regular array.
  window.gtag = function gtag() {
    window.dataLayer?.push(arguments);
  };

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  script.dataset.googleAnalytics = 'true';
  document.head.append(script);

  window.gtag('js', new Date());
  window.gtag('config', measurementId);
}

function initGoogleAnalytics() {
  const measurementId = document.documentElement.dataset.googleAnalyticsId;
  if (!measurementId) return;

  if (document.documentElement.dataset.cookieConsent === 'accepted') {
    loadAnalytics(measurementId);
  }

  window.addEventListener('veinte:cookie-consent', (event) => {
    const consent = (event as CustomEvent<AnalyticsCookieConsent>).detail;
    if (consent === 'accepted') loadAnalytics(measurementId);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGoogleAnalytics);
} else {
  initGoogleAnalytics();
}
