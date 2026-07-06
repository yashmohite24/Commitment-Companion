import type { Challenge, ChallengeStatus } from "../types.ts";
import {
  COMPANION_ACCEPTANCE_HOURS,
  MAX_ACTIVE_CHALLENGES,
  MAX_COMPANIONS,
  MIN_CHALLENGE_DAYS,
} from "../types.ts";
import { challengeDurationDays, maxLivesAllowed } from "../time.ts";

export interface CreateChallengeInput {
  name: string;
  start_date: string;
  end_date: string;
  daily_deadline_time: string;
  timezone: string;
  wager: string;
  lives_total: number;
  companion_user_ids: string[];
  activeChallengeCount: number;
  existingActiveNames: string[];
}

export function validateCreateChallenge(input: CreateChallengeInput): {
  ok: boolean;
  error?: string;
} {
  if (input.name.length === 0 || input.name.length > 200) {
    return { ok: false, error: "Challenge name must be 1–200 characters" };
  }
  if (input.wager.length === 0 || input.wager.length > 300) {
    return { ok: false, error: "Wager must be 1–300 characters" };
  }
  if (input.activeChallengeCount >= MAX_ACTIVE_CHALLENGES) {
    return {
      ok: false,
      error: "You have reached the maximum number of active challenges (5)",
    };
  }
  if (
    input.existingActiveNames.some(
      (n) => n.toLowerCase() === input.name.toLowerCase(),
    )
  ) {
    return { ok: false, error: "Active challenge name must be unique" };
  }
  const duration = challengeDurationDays(input.start_date, input.end_date);
  if (duration < MIN_CHALLENGE_DAYS) {
    return {
      ok: false,
      error: `Challenge must be at least ${MIN_CHALLENGE_DAYS} days`,
    };
  }
  if (input.lives_total > maxLivesAllowed(duration)) {
    return { ok: false, error: "Lives exceed maximum allowed for duration" };
  }
  if (input.companion_user_ids.length === 0) {
    return { ok: false, error: "At least one companion required" };
  }
  if (input.companion_user_ids.length > MAX_COMPANIONS) {
    return { ok: false, error: `Maximum ${MAX_COMPANIONS} companions` };
  }
  return { ok: true };
}

/** Validate draft challenge update (same rules as create, excluding self from name check). */
export function validateUpdateDraft(
  input: CreateChallengeInput & { currentName?: string },
): { ok: boolean; error?: string } {
  const names = input.existingActiveNames.filter(
    (n) => n.toLowerCase() !== (input.currentName ?? "").toLowerCase(),
  );
  return validateCreateChallenge({ ...input, existingActiveNames: names });
}

/** 24 hours after challenge start_date (companion acceptance window end) */
export function companionAcceptanceDeadline(
  startDate: string,
  timezone: string,
): Date {
  const start = new Date(`${startDate}T00:00:00`);
  return new Date(start.getTime() + COMPANION_ACCEPTANCE_HOURS * 3600_000);
}

export function shouldActivateChallenge(
  acceptedCount: number,
  now: Date,
  startDate: string,
): boolean {
  return acceptedCount >= 1 && now.toISOString().slice(0, 10) >= startDate;
}

export function shouldFailDraft(
  acceptedCount: number,
  now: Date,
  startDate: string,
  timezone: string,
): boolean {
  if (acceptedCount >= 1) return false;
  const windowEnd = companionAcceptanceDeadline(startDate, timezone);
  return now >= windowEnd;
}

export interface SuccessCheckInput {
  challenge: Challenge;
  checkIns: { status: string }[];
  today: string;
}

/** All days done or missed (life-save); end date reached */
export function shouldMarkChallengeSuccessful(
  input: SuccessCheckInput,
): boolean {
  const { challenge, checkIns, today } = input;
  if (challenge.status !== "active") return false;
  if (today < challenge.end_date) return false;

  const allResolved = checkIns.every((c) =>
    c.status === "done" || c.status === "missed"
  );
  const allRequiredDone = checkIns.every((c) =>
    c.status === "done" || c.status === "missed"
  );
  return allResolved && allRequiredDone && checkIns.length > 0;
}

export function countSuccessfulCheckIns(
  checkIns: { status: string }[],
): number {
  return checkIns.filter((c) => c.status === "done").length;
}

export function progressPercent(
  successful: number,
  totalDays: number,
): number {
  if (totalDays <= 0) return 0;
  return Math.round((successful / totalDays) * 100);
}

export function isActiveChallengeStatus(status: ChallengeStatus): boolean {
  return status === "draft" || status === "active" || status === "failed";
}
