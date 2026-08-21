/**
 * Generic accordion controller shared by the FAQ section and the "Детальніше"
 * course-details toggle. Works on any `[data-accordion-item]` that contains a
 * `[data-accordion-trigger]` button — no per-instance JS needed.
 */

function initAccordions() {
  if (document.documentElement.dataset.accordionBound === 'true') return;
  document.documentElement.dataset.accordionBound = 'true';

  document.addEventListener('click', (event) => {
    const trigger = (event.target as Element | null)?.closest<HTMLButtonElement>('[data-accordion-trigger]');
    if (!trigger) return;

    const item = trigger.closest<HTMLElement>('[data-accordion-item]');
    if (!item) return;

    const isOpen = item.getAttribute('data-open') === 'true';
    const group = item.getAttribute('data-accordion-group');
    const alwaysOne = item.hasAttribute('data-accordion-always-one');

    if (alwaysOne && isOpen) return;

    if (group && !isOpen) {
      document.querySelectorAll<HTMLElement>(`[data-accordion-group="${group}"]`).forEach((sibling) => {
        if (sibling !== item) {
          sibling.setAttribute('data-open', 'false');
          sibling.querySelector('[data-accordion-trigger]')?.setAttribute('aria-expanded', 'false');
          sibling.querySelector<HTMLElement>('[data-accordion-panel]')?.setAttribute('aria-hidden', 'true');
        }
      });
    }

    const nowOpen = !isOpen;
    item.setAttribute('data-open', String(nowOpen));
    trigger.setAttribute('aria-expanded', String(nowOpen));

    const panel = item.querySelector<HTMLElement>('[data-accordion-panel]');
    if (panel) panel.setAttribute('aria-hidden', String(!nowOpen));

    trigger.querySelector('.course-row__toggle-label--more')?.setAttribute('aria-hidden', String(nowOpen));
    trigger.querySelector('.course-row__toggle-label--less')?.setAttribute('aria-hidden', String(!nowOpen));
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAccordions);
} else {
  initAccordions();
}
