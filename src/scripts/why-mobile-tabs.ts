/**
 * Mobile "Чому саме ми?" folder — instant tab switching.
 * Works with CSS folder (WhyUsMobileFolder) and legacy image-based markup.
 * Desktop uses scroll-driven stack (why-stack-scroll.ts) instead.
 */

const WHY_MOBILE_MQ = '(max-width: 1023px)';

function initWhyMobileTabs() {
  const root = document.querySelector<HTMLElement>('[data-why-mobile]');
  if (!root || !window.matchMedia(WHY_MOBILE_MQ).matches) return;

  const tabs = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-why-tab]'));
  const backgrounds = Array.from(root.querySelectorAll<HTMLElement>('[data-why-mobile-bg]'));
  const tabShapes = Array.from(root.querySelectorAll<HTMLElement>('[data-why-tab-shape]'));
  const panels = Array.from(root.querySelectorAll<HTMLElement>('[data-why-panel]'));

  if (tabs.length === 0 || panels.length === 0) return;

  const mobileRoot = root;
  let activeIndex = Number(mobileRoot.dataset.activeIndex ?? 0);

  function activate(index: number) {
    if (index === activeIndex) return;

    activeIndex = index;
    mobileRoot.dataset.activeIndex = String(index);

    tabs.forEach((tab, i) => {
      const isActive = i === index;
      tab.setAttribute('aria-selected', String(isActive));
      tab.tabIndex = isActive ? 0 : -1;
    });

    if (backgrounds.length > 0) {
      backgrounds.forEach((bg, i) => {
        bg.classList.toggle('is-active', i === index);
      });
    }

    if (tabShapes.length > 0) {
      tabShapes.forEach((shape, i) => {
        shape.classList.toggle('is-hidden', i === index);
      });
    }

    panels.forEach((panel, i) => {
      const isActive = i === index;
      panel.classList.toggle('is-active', isActive);
      panel.hidden = !isActive;
    });
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activate(index));

    tab.addEventListener('keydown', (event) => {
      let next = index;

      if (event.key === 'ArrowRight') {
        next = (index + 1) % tabs.length;
      } else if (event.key === 'ArrowLeft') {
        next = (index - 1 + tabs.length) % tabs.length;
      } else {
        return;
      }

      event.preventDefault();
      activate(next);
      tabs[next]?.focus();
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initWhyMobileTabs);
} else {
  initWhyMobileTabs();
}
