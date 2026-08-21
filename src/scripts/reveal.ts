/**
 * Lightweight scroll-reveal helper shared by every section.
 * Mark any element with `data-reveal` (optionally `data-reveal-index="N"`
 * for staggered groups) and this observer fades/slides it in once it enters
 * the viewport. No-ops visually under `prefers-reduced-motion` (handled in
 * `src/styles/base/_reveal.scss`), and degrades to "always visible" if JS
 * never runs at all.
 */

function initReveal() {
  const elements = document.querySelectorAll<HTMLElement>('[data-reveal]');
  if (elements.length === 0) return;

  elements.forEach((el) => {
    el.classList.add('reveal', 'js-armed');
    const index = el.dataset.revealIndex;
    if (index !== undefined) {
      el.style.setProperty('--reveal-index', index);
    }
  });

  if (!('IntersectionObserver' in window)) {
    elements.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      }
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.1 }
  );

  elements.forEach((el) => observer.observe(el));
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initReveal);
} else {
  initReveal();
}
