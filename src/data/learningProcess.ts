export interface LearningStep {
  number: string;
  title: string;
  description: string;
}

/** "ЯК ПРОХОДИТЬ НАВЧАННЯ?" steps — text verbatim from the Figma file. */
export const learningSteps: LearningStep[] = [
  {
    number: '1',
    title: "Зв'язуєтесь з нами та обираєте курс",
    description:
      'Проявляєте інтерес, залишаєте заявку або пишете нам, і ми підбираємо оптимальний курс під ваші цілі та рівень.',
  },
  {
    number: '2',
    title: 'Проходите курс на платформі',
    description:
      'Отримуєте доступ до записів уроків, виконуєте завдання у зручному для себе темпі та з будь-якого пристрою.',
  },
  {
    number: '3',
    title: 'Отримуєте бажаний результат',
    description: 'Закінчивши курс, проходите фінальне тестування, закріплюєте знання і отримуєте сертифікат.',
  },
];
