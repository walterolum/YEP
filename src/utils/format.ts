const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

const dateTimeFormatter = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Africa/Kampala',
  timeZoneName: 'short',
});

const shortTimeFormatter = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Africa/Kampala',
  hour12: false,
});

export function formatDate(value?: string) {
  if (!value) return '—';
  return dateFormatter.format(new Date(value));
}

export function formatDateTime(value?: string) {
  if (!value) return '—';
  return dateTimeFormatter.format(new Date(value));
}

export function formatTime(value?: string) {
  if (!value) return '—';
  return `${shortTimeFormatter.format(new Date(value))} EAT`;
}

export function relativeTime(value: string) {
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.round(diff / 60000);
  if (Math.abs(minutes) < 1) return 'just now';
  if (Math.abs(minutes) < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (Math.abs(days) < 14) return `${days}d ago`;
  return formatDate(value);
}

export function daysUntil(value: string) {
  return Math.ceil((new Date(value).getTime() - Date.now()) / 86400000);
}

export function formatDueDate(value: string) {
  const days = daysUntil(value);
  if (days < 0) return `Overdue by ${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'}`;
  if (days === 0) return 'Due today';
  if (days === 1) return 'Due tomorrow';
  return `Due ${formatDate(value)}`;
}

export function initialsOf(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function titleCase(value: string) {
  return value
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function percent(value: number, total: number) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

export function pluralise(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}
