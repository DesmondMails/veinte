/**
 * Scroll-snap carousel: in scroll mode card width expands to fill the
 * viewport so the next slide never peeks in partially. In fit mode all
 * cards sit at the Figma 328px width with space-between.
 *
 * Results carousel card width is driven by CSS (calc/min) — JS only
 * measures it for scroll position math.
 */

const MAX_CARD_WIDTH = 328;
const MOBILE_MQ = '(max-width: 1023px)';

function getDesktopVisibleCount(carousel: HTMLElement): number | null {
  const visible = Number.parseInt(carousel.dataset.carouselVisible ?? '', 10);
  return Number.isFinite(visible) && visible > 0 ? visible : null;
}

/** Split track width evenly across visible cards — shrinks below MAX when needed. */
function distributedCardWidth(trackWidth: number, visibleCount: number, gap: number): number {
  if (visibleCount <= 0) return MAX_CARD_WIDTH;
  const totalGaps = gap * (visibleCount - 1);
  const raw = Math.floor((trackWidth - totalGaps) / visibleCount);
  const fitsAtMax = visibleCount * MAX_CARD_WIDTH + totalGaps <= trackWidth;
  if (fitsAtMax) return Math.min(MAX_CARD_WIDTH, Math.max(1, raw));
  return Math.max(1, raw);
}

function measureCardWidth(items: HTMLElement[], fallback: number): number {
  const measured = items[0]?.getBoundingClientRect().width ?? 0;
  return measured > 0 ? measured : fallback;
}

function getGap(track: HTMLElement): number {
  const gap = getComputedStyle(track).gap;
  if (!gap || gap === 'normal') return 0;
  const value = parseFloat(gap);
  return Number.isFinite(value) ? value : 0;
}

function isMobileLayout(): boolean {
  return window.matchMedia(MOBILE_MQ).matches;
}

/** Largest n where n cards at MAX_CARD_WIDTH fit inside the track. */
function maxCardsAtFixedWidth(trackWidth: number, gap: number): number {
  return Math.max(1, Math.floor((trackWidth + gap) / (MAX_CARD_WIDTH + gap)));
}

function totalWidth(count: number, cardWidth: number, gap: number): number {
  return count * cardWidth + Math.max(0, count - 1) * gap;
}

function getMaxIndex(itemCount: number, visibleCount: number): number {
  return Math.max(0, itemCount - visibleCount);
}

function getIndexFromScroll(track: HTMLElement, cardWidth: number, gap: number): number {
  if (cardWidth <= 0) return 0;
  return Math.round(track.scrollLeft / (cardWidth + gap));
}

function initCarousels() {
  const carousels = document.querySelectorAll<HTMLElement>('[data-carousel]');

  carousels.forEach((carousel) => {
    const track = carousel.querySelector<HTMLElement>('[data-carousel-track]');
    const dots = Array.from(carousel.querySelectorAll<HTMLButtonElement>('[data-carousel-dot]'));
    const items = Array.from(carousel.querySelectorAll<HTMLElement>('[data-carousel-item]'));
    const prevBtn = carousel.querySelector<HTMLButtonElement>('[data-carousel-prev]');
    const nextBtn = carousel.querySelector<HTMLButtonElement>('[data-carousel-next]');

    if (!track || items.length === 0) return;

    let activeIndex = 0;
    let visibleCount = 1;
    let maxIndex = 0;
    let cardWidth = MAX_CARD_WIDTH;
    let scrollTargetIndex: number | null = null;
    let scrollUnlockTimer: ReturnType<typeof setTimeout> | undefined;

    const releaseScrollLock = () => {
      scrollTargetIndex = null;
      if (scrollUnlockTimer) {
        clearTimeout(scrollUnlockTimer);
        scrollUnlockTimer = undefined;
      }
    };

    const lockScrollUntilSettled = (targetIndex: number) => {
      releaseScrollLock();
      scrollTargetIndex = targetIndex;
      // Fallback for browsers without scrollend.
      scrollUnlockTimer = setTimeout(releaseScrollLock, 600);
    };

    const syncLayout = () => {
      const trackWidth = track.clientWidth;
      const gap = getGap(track);
      const mobile = isMobileLayout();
      const desktopVisible = getDesktopVisibleCount(carousel);
      const cssDrivenWidth = desktopVisible !== null;

      if (mobile) {
        visibleCount = 1;
        cardWidth = trackWidth;
        if (!cssDrivenWidth) {
          carousel.style.setProperty('--carousel-card-width', `${cardWidth}px`);
        }
        track.dataset.carouselMode = 'scroll';
      } else if (cssDrivenWidth) {
        // Width comes from stylesheet — drop any inline override left from mobile.
        carousel.style.removeProperty('--carousel-card-width');
        visibleCount = Math.min(desktopVisible!, items.length);
        track.dataset.carouselMode = 'scroll';
        void carousel.offsetWidth; // recalc after removing inline custom property
        cardWidth = measureCardWidth(
          items,
          distributedCardWidth(trackWidth, visibleCount, gap),
        );
      } else {
        const fitAtMax = maxCardsAtFixedWidth(trackWidth, gap);
        const allVisible =
          items.length <= fitAtMax &&
          totalWidth(items.length, MAX_CARD_WIDTH, gap) <= trackWidth;

        if (allVisible) {
          visibleCount = items.length;
          cardWidth = MAX_CARD_WIDTH;
          track.dataset.carouselMode = 'fit';
        } else {
          visibleCount = Math.min(fitAtMax, items.length);
          cardWidth = distributedCardWidth(trackWidth, visibleCount, gap);
          track.dataset.carouselMode = 'scroll';
        }

        carousel.style.setProperty('--carousel-card-width', `${cardWidth}px`);
      }

      maxIndex = getMaxIndex(items.length, visibleCount);
      carousel.dataset.carouselVisible = String(visibleCount);

      if (track.dataset.carouselMode === 'fit') {
        track.scrollLeft = 0;
      } else {
        activeIndex = Math.min(activeIndex, maxIndex);
      }

      setActive(activeIndex);
    };

    const setActive = (index: number) => {
      const isFit = track.dataset.carouselMode === 'fit';
      const upper = isFit ? items.length - 1 : maxIndex;
      activeIndex = Math.max(0, Math.min(index, upper));
      dots.forEach((dot, i) => dot.setAttribute('aria-selected', String(i === activeIndex)));

      const atStart = activeIndex <= 0;
      const atEnd = isFit ? true : activeIndex >= maxIndex;

      if (prevBtn) {
        const canPrev = !isFit && !atStart;
        prevBtn.setAttribute('aria-disabled', String(!canPrev));
        prevBtn.tabIndex = canPrev ? 0 : -1;
      }
      if (nextBtn) {
        const canNext = !isFit && !atEnd;
        nextBtn.setAttribute('aria-disabled', String(!canNext));
        nextBtn.tabIndex = canNext ? 0 : -1;
      }
    };

    const scrollToIndex = (index: number) => {
      if (track.dataset.carouselMode === 'fit') {
        setActive(index);
        return;
      }

      const clamped = Math.max(0, Math.min(index, maxIndex));
      const gap = getGap(track);
      lockScrollUntilSettled(clamped);
      setActive(clamped);
      track.scrollTo({
        left: clamped * (cardWidth + gap),
        behavior: 'smooth',
      });
    };

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => scrollToIndex(index));
    });

    const isDisabled = (btn: HTMLButtonElement) => btn.getAttribute('aria-disabled') === 'true';

    prevBtn?.addEventListener('click', () => {
      if (isDisabled(prevBtn)) return;
      scrollToIndex(activeIndex - 1);
    });
    nextBtn?.addEventListener('click', () => {
      if (isDisabled(nextBtn)) return;
      scrollToIndex(activeIndex + 1);
    });

    track.addEventListener(
      'scroll',
      () => {
        if (track.dataset.carouselMode === 'fit') return;
        // Ignore intermediate scroll positions during arrow/dot navigation.
        if (scrollTargetIndex !== null) return;

        const gap = getGap(track);
        const index = getIndexFromScroll(track, cardWidth, gap);
        if (index !== activeIndex) setActive(index);
      },
      { passive: true }
    );

    track.addEventListener(
      'scrollend',
      () => {
        if (scrollTargetIndex === null) return;
        releaseScrollLock();
        const gap = getGap(track);
        setActive(getIndexFromScroll(track, cardWidth, gap));
      },
      { passive: true }
    );

    if ('ResizeObserver' in window) {
      const ro = new ResizeObserver(() => syncLayout());
      ro.observe(track);
    }

    window.addEventListener('resize', syncLayout, { passive: true });
    window.matchMedia(MOBILE_MQ).addEventListener('change', syncLayout);

    syncLayout();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCarousels);
} else {
  initCarousels();
}
