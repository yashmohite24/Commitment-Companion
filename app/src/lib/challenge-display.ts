export interface ProfileNameFields {
  first_name?: string | null;
  last_name?: string | null;
  display_name?: string | null;
}

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const DISPLAY_DATE = /^(\d{2})-(\d{2})-(\d{4})$/;

/** YYYY-MM-DD → DD-MM-YYYY for UI display. */
export function formatDisplayDate(isoDate: string): string {
  const match = isoDate.match(ISO_DATE);
  if (!match) return isoDate;
  return `${match[3]}-${match[2]}-${match[1]}`;
}

/** DD-MM-YYYY → YYYY-MM-DD for API/DB. Returns null when invalid. */
export function parseDisplayDate(displayDate: string): string | null {
  const trimmed = displayDate.trim();
  const match = trimmed.match(DISPLAY_DATE);
  if (!match) return null;
  const iso = `${match[3]}-${match[2]}-${match[1]}`;
  const d = new Date(`${iso}T12:00:00Z`);
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== iso) return null;
  return iso;
}

export function isValidDisplayDateString(value: string): boolean {
  return parseDisplayDate(value) !== null;
}

/** ISO timestamp → DD-MM-YYYY HH:MM (local). */
export function formatDisplayDateTime(isoTimestamp: string): string {
  const d = new Date(isoTimestamp);
  if (Number.isNaN(d.getTime())) return isoTimestamp;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function formatProfileName(profile: ProfileNameFields | null | undefined): string {
  if (!profile) return 'Unknown';
  const full = [profile.first_name, profile.last_name].filter(Boolean).join(' ').trim();
  return full || profile.display_name || 'Unknown';
}

export function challengeDurationDays(start: string, end: string): number {
  const cur = new Date(`${start}T12:00:00Z`);
  const last = new Date(`${end}T12:00:00Z`);
  let count = 0;
  while (cur <= last) {
    count += 1;
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return count;
}

/** Human-readable time remaining until an ISO deadline. */
export function formatTimeLeft(deadlineIso: string, now: Date = new Date()): string {
  const ms = new Date(deadlineIso).getTime() - now.getTime();
  if (ms <= 0) return 'Past deadline';
  const totalMins = Math.floor(ms / 60000);
  const hours = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  if (hours >= 48) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h left`;
  }
  if (hours > 0) return `${hours}h ${mins}m left`;
  return `${mins}m left`;
}
