export interface WhyUsItem {
  number: string;
  icon: string;
  title: string;
  description: string;
  folderShape: string;
  folderShapeActive: string;
  /** @deprecated Mobile SVG shells — use WhyUsMobileFolder.astro (CSS) instead. */
  folderMobile: string;
  /** @deprecated Mobile SVG shells — use WhyUsMobileFolder.astro (CSS) instead. */
  folderMobileActive: string;
  tabLabelLeft: number;
  /** @deprecated Fixed px positions for 342px SVG tabs — CSS folder uses flex. */
  tabMobileLeft: number;
}

/** "ЧОМУ САМЕ МИ?" folder stack — shapes from Figma 2264:418 / 2274:5546. */
export const whyUsItems: WhyUsItem[] = [
  {
    number: '01',
    icon: '💻',
    title: 'Єдина навчальна платформа з постійним доступом',
    description:
      'Усе необхідне в одному місці — уроки, відео, вправи та відстеження прогресу. Повертайтесь у будь-який час, щоб закріпити знання.',
    folderShape: '/images/ui/why-us/folder-active.svg',
    folderShapeActive: '/images/ui/why-us/folder-active-orange.svg',
    folderMobile: '/images/ui/why-us/folder-mobile-1.svg',
    folderMobileActive: '/images/ui/why-us/folder-mobile-1-orange.svg',
    tabLabelLeft: 58,
    tabMobileLeft: 0,
  },
  {
    number: '02',
    icon: '🎓',
    title: 'Чітка структура навчання, яка реально працює',
    description:
      'Покрокова програма, що веде до впевненого спілкування без хаосу та допомагає тримати стабільний прогрес у навчанні з чітким розумінням кожного наступного кроку.',
    folderShape: '/images/ui/why-us/folder-inactive-2.svg',
    folderShapeActive: '/images/ui/why-us/folder-inactive-2-orange.svg',
    folderMobile: '/images/ui/why-us/folder-mobile-2.svg',
    folderMobileActive: '/images/ui/why-us/folder-mobile-2-orange.svg',
    tabLabelLeft: 203,
    tabMobileLeft: 70,
  },
  {
    number: '03',
    icon: '✍️',
    title: 'Фокус на практиці для реального результату',
    description:
      'Не лише теорія — кожен урок містить практичні завдання, щоб ви могли говорити та розуміти іспанську в житті та впевнено застосовувати знання у реальних ситуаціях.',
    folderShape: '/images/ui/why-us/folder-inactive-3.svg',
    folderShapeActive: '/images/ui/why-us/folder-inactive-3-orange.svg',
    folderMobile: '/images/ui/why-us/folder-mobile-3.svg',
    folderMobileActive: '/images/ui/why-us/folder-mobile-3-orange.svg',
    tabLabelLeft: 351,
    tabMobileLeft: 139,
  },
  {
    number: '04',
    icon: '📁',
    title: 'Навчання у власному темпі без тиску',
    description:
      'Вчіться коли зручно. Без дедлайнів і стресу — навчання у вашому темпі з максимальною гнучкістю щодня та повним контролем власного графіка занять.',
    folderShape: '/images/ui/why-us/folder-inactive-4.svg',
    folderShapeActive: '/images/ui/why-us/folder-inactive-4-orange.svg',
    folderMobile: '/images/ui/why-us/folder-mobile-4.svg',
    folderMobileActive: '/images/ui/why-us/folder-mobile-4-orange.svg',
    tabLabelLeft: 496,
    tabMobileLeft: 208,
  },
  {
    number: '05',
    icon: '👨‍💻',
    title: 'Інтерактивний контент, який захоплює',
    description:
      'Кожен наш урок містить багато практичних завдань, для того щоб ви могли говорити та розуміти іспанську впевнено вже з перших занять.',
    folderShape: '/images/ui/why-us/folder-inactive-5.svg',
    folderShapeActive: '/images/ui/why-us/folder-inactive-5-orange.svg',
    folderMobile: '/images/ui/why-us/folder-mobile-5.svg',
    folderMobileActive: '/images/ui/why-us/folder-mobile-5-orange.svg',
    tabLabelLeft: 645,
    tabMobileLeft: 279,
  },
];
