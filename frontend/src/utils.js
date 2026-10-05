export function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function mediaUrl(path) {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('blob:')) return path;
  return path;
}

export function yesNo(value) {
  return Number(value) ? 'Yes' : 'No';
}

export function clip(value, n = 80) {
  const s = String(value || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  if (!s) return '—';
  return s.length > n ? `${s.slice(0, n)}…` : s;
}

export function dateInput(value) {
  if (!value) return '';
  return String(value).slice(0, 10);
}
