export function isWithinDays(publishedAt, days) {
  const published = new Date(publishedAt);
  const now = new Date();
  const cutoff = new Date(now);
  cutoff.setDate(now.getDate() - days + 1);
  cutoff.setHours(0, 0, 0, 0);
  return published >= cutoff;
}

export function isSameDay(publishedAt, date) {
  const published = new Date(publishedAt);
  return (
    published.getFullYear() === date.getFullYear() &&
    published.getMonth() === date.getMonth() &&
    published.getDate() === date.getDate()
  );
}
