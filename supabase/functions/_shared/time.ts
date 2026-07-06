/**
 * Time utilities for challenge timezone deadlines.
 * Uses Intl for offset at a given instant (handles DST).
 */

/** Combine calendar date + local time in IANA timezone → UTC ISO string */
export function deadlineInstant(
  checkInDate: string,
  deadlineTime: string,
  timezone: string,
): Date {
  const [hours, minutes, seconds = "0"] = deadlineTime.split(":");
  const localIso = `${checkInDate}T${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}:${seconds.padStart(2, "0")}`;

  // Binary search offset: find UTC that formats to localIso in timezone
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  let guess = new Date(`${checkInDate}T${hours}:${minutes}:${seconds}Z`);
  for (let i = 0; i < 5; i++) {
    const parts = formatter.formatToParts(guess);
    const get = (type: string) =>
      parts.find((p) => p.type === type)?.value ?? "00";
    const formatted = `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}:${get("second")}`;
    const target = localIso.slice(0, 19);
    if (formatted === target) break;
    const diffMs = Date.parse(target.replace("T", " ") + " GMT") -
      Date.parse(formatted.replace("T", " ") + " GMT");
    guess = new Date(guess.getTime() + diffMs);
  }
  return guess;
}

/** Inclusive date range from start to end as YYYY-MM-DD strings */
export function dateRangeInclusive(start: string, end: string): string[] {
  const dates: string[] = [];
  const cur = new Date(`${start}T12:00:00Z`);
  const last = new Date(`${end}T12:00:00Z`);
  while (cur <= last) {
    dates.push(cur.toISOString().slice(0, 10));
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return dates;
}

export function addHours(iso: string, hours: number): string {
  return new Date(new Date(iso).getTime() + hours * 3600_000).toISOString();
}

export function isBeforeDeadline(now: Date, deadlineAt: string): boolean {
  return now.getTime() <= new Date(deadlineAt).getTime();
}

export function isAfterDeadline(now: Date, deadlineAt: string): boolean {
  return now.getTime() > new Date(deadlineAt).getTime();
}

/** Calendar date in challenge timezone */
export function todayInTimezone(now: Date, timezone: string): string {
  return now.toLocaleDateString("en-CA", { timeZone: timezone });
}

export function challengeDurationDays(start: string, end: string): number {
  return dateRangeInclusive(start, end).length;
}

export function maxLivesAllowed(durationDays: number): number {
  return Math.max(0, Math.floor(durationDays / 2) - 1);
}
