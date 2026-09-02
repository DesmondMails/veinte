export interface CourseResultCard {
  icon: string;
  /** Card label — split into lines for the white sticker area (Figma 2274:4401). */
  titleLines: [string, string] | [string];
  description: string;
  rotation: number;
  /** Final horizontal offset (rem, desktop-only). */
  offsetX: number;
  /** Final vertical offset (rem, desktop-only). */
  offsetY: number;
}

/**
 * "Це твій результат після нашого курсу" — Figma 2274:5610 (desktop),
 * 2274:4401 (mobile label layout). Cards 1 & 4 share centre; 2 & 3 fan ±5°.
 *
 * Desktop offsets are from the top-back disk anchor (y=229 in Figma):
 * side disks at y=319.87, front disk at y=445.
 */
export const courseResults: CourseResultCard[] = [
  {
    icon: '🚀',
    titleLines: ['Знання', 'на практиці'],
    description: 'Використовуєте нові слова та вирази в реальних ситуаціях і відчуваєте прогрес після кожного уроку',
    rotation: 0,
    offsetX: 0,
    offsetY: 0,
  },
  {
    icon: '🤝',
    titleLines: ['Впевнено', 'спілкуєтеся'],
    description: 'Ведете як короткі, так і тривалі розмови, знайомитеся з новими людьми та легко знаходите спільну мову',
    rotation: 5,
    offsetX: 15,
    offsetY: 5.6875,
  },
  {
    icon: '✈️',
    titleLines: ['Іспанська', "без бар'єрів"],
    description: 'Спілкуєтеся з носіями мови, легко орієнтуєтеся в нових ситуаціях та використовуєте іспанську в подорожах',
    rotation: -5,
    offsetX: -15,
    offsetY: 5.6875,
  },
  {
    icon: '💡',
    titleLines: ['Формулюєте', 'думки'],
    description: 'Чітко висловлюєте власні ідеї, аргументуєте свою позицію та впевнено спілкуєтеся усно й письмово',
    rotation: 0,
    offsetX: 0,
    offsetY: 13.5,
  },
];

/** Scroll-reveal order: top → left → right → front (Figma 2274:5610). */
export const courseResultRevealOrder = [0, 2, 1, 3] as const;
