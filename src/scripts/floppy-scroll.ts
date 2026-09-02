/**
 * Floppy-disk deck — sticky scroll scene (Figma 2274:5610):
 * Disks rise from below (each at its final X) as you scroll down; scrolling
 * back up scrubs the same motion in reverse. Spacer height shrinks with
 * progress so scroll room is consumed as the scene plays out.
 */

import { courseResultRevealOrder } from '@/data/courseResults'

import type { ScrollTrigger as ScrollTriggerInstance } from 'gsap/ScrollTrigger'

const DESKTOP_MQ = '(min-width: 1024px)'

/** Equal contiguous segments — no dead zones where scroll moves but disks don't. */
const REVEAL_SEGMENT = 1 / courseResultRevealOrder.length

// Warm up GSAP before the first scroll so the scene doesn't hitch on entry.
const gsapReady = Promise.all([import('gsap'), import('gsap/ScrollTrigger')])

function getScrollDistance(stage: HTMLElement): number {
  const parsed = Number.parseInt(stage.dataset.floppyScrollDistance ?? '', 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 400
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value))
}

function getCardReveal(progress: number, phase: number): number {
  const start = phase * REVEAL_SEGMENT
  const end = start + REVEAL_SEGMENT
  if (progress <= start) return 0
  if (progress >= end) return 1
  return (progress - start) / (end - start)
}

let scrollTrigger: ScrollTriggerInstance | null = null
let setupGeneration = 0
let gsapRef: typeof import('gsap').gsap | null = null

function getFloppyElements() {
  const stage = document.querySelector<HTMLElement>(
    '[data-floppy-scroll-stage]',
  )
  const spacer = document.querySelector<HTMLElement>(
    '[data-floppy-scroll-spacer]',
  )
  const deck = document.querySelector<HTMLElement>('[data-floppy-deck]')
  if (!stage || !spacer || !deck) return null

  const cards = Array.from(
    deck.querySelectorAll<HTMLElement>('[data-floppy-card]'),
  )
  return { stage, spacer, deck, cards }
}

function applyFloppyMobileFallback() {
  const elements = getFloppyElements()
  if (!elements) return

  const { spacer, cards } = elements

  cards.forEach((card) => {
    card.style.setProperty('--card-reveal', '1')
  })
  spacer.style.height = '0px'
}

function teardownFloppyScroll() {
  scrollTrigger?.kill()
  scrollTrigger = null

  const elements = getFloppyElements()
  if (!elements) return

  const { spacer, cards, stage } = elements
  const scrollDistance = getScrollDistance(stage)

  gsapRef?.killTweensOf(cards)

  spacer.style.height = `${scrollDistance}px`

  cards.forEach((card) => {
    card.style.removeProperty('--card-reveal')
    card.style.removeProperty('opacity')
    card.style.removeProperty('visibility')
  })
}

async function mountFloppyScroll() {
  const generation = ++setupGeneration
  teardownFloppyScroll()

  const elements = getFloppyElements()
  if (!elements || elements.cards.length === 0) return

  const { stage, spacer, cards } = elements
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches

  if (prefersReducedMotion || !window.matchMedia(DESKTOP_MQ).matches) {
    applyFloppyMobileFallback()
    return
  }

  const [{ gsap }, { ScrollTrigger }] = await gsapReady
  if (generation !== setupGeneration) return
  if (!window.matchMedia(DESKTOP_MQ).matches) {
    applyFloppyMobileFallback()
    return
  }

  gsapRef = gsap
  gsap.registerPlugin(ScrollTrigger)

  const phaseByCardIndex = new Map<number, number>()
  courseResultRevealOrder.forEach((cardIndex, phase) => {
    phaseByCardIndex.set(cardIndex, phase)
  })

  const scrollDistance = getScrollDistance(stage)

  const syncFromProgress = (progress: number) => {
    cards.forEach((card, cardIndex) => {
      const phase = phaseByCardIndex.get(cardIndex) ?? 0
      const reveal = clamp01(getCardReveal(progress, phase))
      const visible = reveal > 0

      card.style.setProperty('--card-reveal', String(reveal))
      card.style.opacity = visible ? '1' : '0'
      card.style.visibility = visible ? 'visible' : 'hidden'
    })

    spacer.style.height = `${scrollDistance * (1 - progress)}px`
  }

  cards.forEach((card) => {
    card.style.setProperty('--card-reveal', '0')
  })

  scrollTrigger = ScrollTrigger.create({
    trigger: stage,
    start: 'top 42%',
    end: `+=${scrollDistance}`,
    onUpdate: (self) => {
      syncFromProgress(self.progress)
    },
  })

  ScrollTrigger.refresh()
  syncFromProgress(scrollTrigger.progress)
}

function syncFloppyScroll() {
  if (window.matchMedia(DESKTOP_MQ).matches) {
    mountFloppyScroll()
  } else {
    setupGeneration++
    teardownFloppyScroll()
    applyFloppyMobileFallback()
  }
}

function initFloppyScroll() {
  void gsapReady
  syncFloppyScroll()
  window.matchMedia(DESKTOP_MQ).addEventListener('change', syncFloppyScroll)
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFloppyScroll)
} else {
  initFloppyScroll()
}
