/**
 * Floppy-disk deck — sticky scroll scene (Figma 2274:5610):
 * Each scroll step triggers a one-shot entrance animation (not scrubbed).
 * Reveals are one-way: scrolling back up does not reset disks.
 *
 * Scroll spacer height shrinks with scroll progress (one-way latch) so the
 * room is "eaten" during scroll — no discrete collapse, no end-of-zone jerk.
 * Hover scale is enabled only after all reveal tweens finish.
 */

import { courseResultRevealOrder } from '@/data/courseResults';

const DESKTOP_MQ = '(min-width: 1024px)';

/** Reveal pacing: early first disk, wider gap before the last two. */
const REVEAL_THRESHOLDS = [0.05, 0.32, 0.62, 0.88];

const REVEAL_DURATION = 0.65;

function getScrollDistance(stage: HTMLElement): number {
  const parsed = Number.parseInt(stage.dataset.floppyScrollDistance ?? '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 400;
}

async function initFloppyScroll() {
  const stage = document.querySelector<HTMLElement>('[data-floppy-scroll-stage]');
  const spacer = document.querySelector<HTMLElement>('[data-floppy-scroll-spacer]');
  const deck = document.querySelector<HTMLElement>('[data-floppy-deck]');
  if (!stage || !spacer || !deck) return;

  const cards = Array.from(deck.querySelectorAll<HTMLElement>('[data-floppy-card]'));
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isDesktop = window.matchMedia(DESKTOP_MQ).matches;

  if (prefersReducedMotion || !isDesktop || cards.length === 0) {
    cards.forEach((card) => {
      card.style.setProperty('--card-reveal', '1');
      card.style.opacity = '1';
    });
    spacer.style.height = '0px';
    deck.classList.add('is-interactive');
    return;
  }

  const [{ gsap }, { ScrollTrigger }] = await Promise.all([import('gsap'), import('gsap/ScrollTrigger')]);
  gsap.registerPlugin(ScrollTrigger);

  cards.forEach((card) => {
    card.style.setProperty('--card-reveal', '0');
    card.style.opacity = '0';
  });

  const revealedPhases = new Set<number>();
  const scrollDistance = getScrollDistance(stage);
  let maxProgress = 0;
  let activeRevealTweens = 0;
  let isInteractive = false;

  const enableInteractive = () => {
    if (isInteractive) return;
    if (revealedPhases.size < REVEAL_THRESHOLDS.length) return;
    if (activeRevealTweens > 0) return;

    isInteractive = true;
    deck.classList.add('is-interactive');
  };

  const syncSpacerHeight = (progress: number) => {
    maxProgress = Math.max(maxProgress, progress);
    const heightPx = scrollDistance * (1 - maxProgress);
    spacer.style.height = `${heightPx}px`;
  };

  const revealCard = (phase: number, animate: boolean) => {
    if (revealedPhases.has(phase)) return;
    revealedPhases.add(phase);

    const cardIndex = courseResultRevealOrder[phase];
    const card = cards[cardIndex];
    if (!card) return;

    card.style.opacity = '1';

    if (animate) {
      activeRevealTweens++;
      gsap.fromTo(
        card,
        { '--card-reveal': 0 },
        {
          '--card-reveal': 1,
          duration: REVEAL_DURATION,
          ease: 'power2.out',
          onComplete: () => {
            activeRevealTweens--;
            enableInteractive();
          },
        },
      );
    } else {
      card.style.setProperty('--card-reveal', '1');
    }
  };

  const syncFromProgress = (raw: number, animate: boolean) => {
    for (let phase = 0; phase < REVEAL_THRESHOLDS.length; phase++) {
      if (raw >= (REVEAL_THRESHOLDS[phase] ?? 1)) {
        revealCard(phase, animate);
      }
    }

    if (!animate) {
      enableInteractive();
    }
  };

  const trigger = ScrollTrigger.create({
    trigger: stage,
    start: 'top 42%',
    end: `+=${scrollDistance}`,
    onUpdate: (self) => {
      syncFromProgress(self.progress, true);
      syncSpacerHeight(self.progress);
    },
  });

  ScrollTrigger.refresh();
  syncFromProgress(trigger.progress, false);
  syncSpacerHeight(trigger.progress);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFloppyScroll);
} else {
  initFloppyScroll();
}
