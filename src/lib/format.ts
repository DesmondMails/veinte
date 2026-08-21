/** Ukrainian legal-page revision line, e.g. «Редакція від «7» вересня 2026 року». */
export function formatLegalRevisionDate(date: Date): string {
  const formatted = new Intl.DateTimeFormat('uk-UA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);

  // Intl gives "7 вересня 2026 р." — reuse the genitive month form from that string.
  const match = formatted.match(/^(\d+)\s+(\S+)\s+(\d+)/);
  if (!match) return formatted;

  const [, day, month, year] = match;
  return `Редакція від «${day}» ${month} ${year} року`;
}
