export function parseTime(text: string): number | null {
  const t = text.trim();
  if (t === '') return null;
  const m = t.match(/^(\d+):([0-5]?\d)(?:\.(\d{1,3}))?$/);
  if (m) {
    const min = parseInt(m[1], 10);
    const sec = parseInt(m[2], 10);
    const frac = m[3] ? parseInt(m[3].padEnd(3, '0'), 10) / 1000 : 0;
    return min * 60 + sec + frac;
  }
  const n = Number(t);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

export function formatTime(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return '00:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec - m * 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function uuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return 'id-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}
