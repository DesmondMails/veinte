/**
 * "Чому саме ми?" folder stack — sticky scene with phased scroll progress:
 * 1. List stays expanded while the user reads cards 1–5 in view.
 * 2. Cards magnetize slowly into the folder pile.
 * 3. Final stack holds briefly before the next section.
 */

import type { ScrollTrigger as ScrollTriggerInstance } from 'gsap/ScrollTrigger';

const DESKTOP_MQ = '(min-width: 1024px)';

/** Portion of raw scroll where the list stays untouched. */
const LIST_HOLD = 0.22;
/** Raw scroll progress where magnetize finishes. */
const MAGNET_END = 0.76;

function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
}

function mapStackProgress(raw: number): number {
  if (raw <= LIST_HOLD) return 0;
  if (raw >= MAGNET_END) return 1;
  const t = (raw - LIST_HOLD) / (MAGNET_END - LIST_HOLD);
  return easeInOutQuad(t);
}

let scrollTrigger: ScrollTriggerInstance | null = null;
let setupGeneration = 0;

function teardownWhyStackScroll() {
  scrollTrigger?.kill();
  scrollTrigger = null;

  const stack = document.querySelector<HTMLElement>('[data-why-stack]');
  stack?.style.setProperty('--stack-progress', '0');
}

async function mountWhyStackScroll() {
  const generation = ++setupGeneration;
  teardownWhyStackScroll();

  const stage = document.querySelector<HTMLElement>('[data-why-scroll-stage]');
  const stack = document.querySelector<HTMLElement>('[data-why-stack]');
  if (!stage || !stack) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    stack.style.setProperty('--stack-progress', '0');
    return;
  }

  const [{ gsap }, { ScrollTrigger }] = await Promise.all([import('gsap'), import('gsap/ScrollTrigger')]);
  if (generation !== setupGeneration) return;
  if (!window.matchMedia(DESKTOP_MQ).matches) return;

  gsap.registerPlugin(ScrollTrigger);

  gsap.set(stack, { '--stack-progress': 0 });

  scrollTrigger = ScrollTrigger.create({
    trigger: stage,
    start: 'top 35%',
    end: 'bottom 58%',
    scrub: 0.85,
    onUpdate: (self) => {
      stack.style.setProperty('--stack-progress', mapStackProgress(self.progress).toFixed(4));
    },
  });

  ScrollTrigger.refresh();
}

function syncWhyStackScroll() {
  if (window.matchMedia(DESKTOP_MQ).matches) {
    mountWhyStackScroll();
  } else {
    setupGeneration++;
    teardownWhyStackScroll();
  }
}

function initWhyStackScroll() {
  syncWhyStackScroll();
  window.matchMedia(DESKTOP_MQ).addEventListener('change', syncWhyStackScroll);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initWhyStackScroll);
} else {
  initWhyStackScroll();
}
