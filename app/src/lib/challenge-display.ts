export interface ProfileNameFields {
  first_name?: string | null;
  last_name?: string | null;
  display_name?: string | null;
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
