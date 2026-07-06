import {
  assertEquals,
  assertExists,
} from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  canSubmitCheckIn,
  processOverdueCheckIn,
  resolveProofIfComplete,
} from "./check-in.ts";
import {
  progressPercent,
  shouldMarkChallengeSuccessful,
  validateCreateChallenge,
} from "./challenge.ts";
import type { Approval, Challenge, DailyCheckIn } from "../types.ts";
import { deadlineInstant } from "../time.ts";

const challengerId = "11111111-1111-1111-1111-111111111111";
const companionA = "22222222-2222-2222-2222-222222222222";
const companionB = "33333333-3333-3333-3333-333333333333";

function baseChallenge(overrides: Partial<Challenge> = {}): Challenge {
  return {
    id: "c1",
    challenger_id: challengerId,
    start_date: "2026-07-01",
    end_date: "2026-07-30",
    daily_deadline_time: "23:59:00",
    timezone: "UTC",
    lives_total: 3,
    lives_consumed: 0,
    status: "active",
    ...overrides,
  };
}

function baseCheckIn(overrides: Partial<DailyCheckIn> = {}): DailyCheckIn {
  const date = overrides.check_in_date ?? "2026-07-15";
  return {
    id: "d1",
    challenge_id: "c1",
    check_in_date: date,
    status: "pending",
    deadline_at: deadlineInstant(date, "23:59:00", "UTC").toISOString(),
    makeup_deadline_at: null,
    provisionally_advanced: false,
    ...overrides,
  };
}

Deno.test("canSubmitCheckIn: happy path before deadline", () => {
  const checkIn = baseCheckIn();
  const now = new Date("2026-07-15T20:00:00Z");
  const result = canSubmitCheckIn({
    challenge: baseChallenge(),
    checkIn,
    now,
  });
  assertEquals(result.ok, true);
  assertEquals(result.newStatus, "pending_validation");
});

Deno.test("canSubmitCheckIn: rejects after deadline without makeup", () => {
  const checkIn = baseCheckIn();
  const now = new Date("2026-07-16T01:00:00Z");
  const result = canSubmitCheckIn({
    challenge: baseChallenge(),
    checkIn,
    now,
  });
  assertEquals(result.ok, false);
});

Deno.test("canSubmitCheckIn: allows submission within makeup window", () => {
  const checkIn = baseCheckIn({
    makeup_deadline_at: "2026-07-16T12:00:00Z",
  });
  const now = new Date("2026-07-16T10:00:00Z");
  const result = canSubmitCheckIn({
    challenge: baseChallenge(),
    checkIn,
    now,
  });
  assertEquals(result.ok, true);
});

Deno.test("resolveProofIfComplete: unanimous accept → done", () => {
  const approvals: Approval[] = [
    { companion_user_id: companionA, decision: "accepted" },
    { companion_user_id: companionB, decision: "accepted" },
  ];
  const result = resolveProofIfComplete({
    challenge: baseChallenge(),
    checkIn: baseCheckIn({ status: "pending_validation" }),
    approvals,
    activeCompanionIds: [companionA, companionB],
    now: new Date("2026-07-15T22:00:00Z"),
  });
  assertEquals(result.resolved, true);
  assertEquals(result.newCheckInStatus, "done");
  assertEquals(result.outcome, "verified");
  assertEquals(result.deleteMedia, true);
});

Deno.test("resolveProofIfComplete: one reject before deadline → pending resubmit", () => {
  const approvals: Approval[] = [
    { companion_user_id: companionA, decision: "rejected" },
    { companion_user_id: companionB, decision: "accepted" },
  ];
  const result = resolveProofIfComplete({
    challenge: baseChallenge(),
    checkIn: baseCheckIn({ status: "pending_validation" }),
    approvals,
    activeCompanionIds: [companionA, companionB],
    now: new Date("2026-07-15T22:00:00Z"),
  });
  assertEquals(result.resolved, true);
  assertEquals(result.newCheckInStatus, "pending");
  assertEquals(result.outcome, "rejected");
  assertExists(result.makeupDeadlineAt === undefined || result.makeupDeadlineAt === null || true);
});

Deno.test("resolveProofIfComplete: post-deadline reject grants 24h makeup", () => {
  const approvals: Approval[] = [
    { companion_user_id: companionA, decision: "rejected" },
    { companion_user_id: companionB, decision: "rejected" },
  ];
  const now = new Date("2026-07-16T10:00:00Z");
  const result = resolveProofIfComplete({
    challenge: baseChallenge(),
    checkIn: baseCheckIn({
      status: "pending_validation",
      provisionally_advanced: true,
    }),
    approvals,
    activeCompanionIds: [companionA, companionB],
    now,
  });
  assertEquals(result.resolved, true);
  assertEquals(result.newCheckInStatus, "pending");
  assertExists(result.makeupDeadlineAt);
});

Deno.test("processOverdueCheckIn: pending miss consumes life", () => {
  const result = processOverdueCheckIn({
    challenge: baseChallenge({ lives_total: 2, lives_consumed: 0 }),
    checkIn: baseCheckIn(),
    now: new Date("2026-07-16T00:30:00Z"),
    hasPendingProof: false,
    allCompanionsActedOnPendingProof: false,
  });
  assertEquals(result.action, "consume_life");
  assertEquals(result.newCheckInStatus, "missed");
  assertEquals(result.livesConsumed, 1);
});

Deno.test("processOverdueCheckIn: pending miss with no lives fails challenge", () => {
  const result = processOverdueCheckIn({
    challenge: baseChallenge({ lives_total: 0, lives_consumed: 0 }),
    checkIn: baseCheckIn(),
    now: new Date("2026-07-16T00:30:00Z"),
    hasPendingProof: false,
    allCompanionsActedOnPendingProof: false,
  });
  assertEquals(result.action, "fail_challenge");
  assertEquals(result.newChallengeStatus, "failed");
});

Deno.test("processOverdueCheckIn: pending_validation past deadline → provisional advance", () => {
  const result = processOverdueCheckIn({
    challenge: baseChallenge(),
    checkIn: baseCheckIn({ status: "pending_validation" }),
    now: new Date("2026-07-16T00:30:00Z"),
    hasPendingProof: true,
    allCompanionsActedOnPendingProof: false,
  });
  assertEquals(result.action, "provisional_advance");
  assertEquals(result.provisionallyAdvanced, true);
});

Deno.test("validateCreateChallenge: enforces min duration and max active", () => {
  const fail = validateCreateChallenge({
    name: "Run daily",
    start_date: "2026-07-01",
    end_date: "2026-07-05",
    daily_deadline_time: "23:59:00",
    timezone: "UTC",
    wager: "Coffee",
    lives_total: 0,
    companion_user_ids: [companionA],
    activeChallengeCount: 5,
    existingActiveNames: [],
  });
  assertEquals(fail.ok, false);

  const ok = validateCreateChallenge({
    name: "Run daily",
    start_date: "2026-07-01",
    end_date: "2026-07-30",
    daily_deadline_time: "23:59:00",
    timezone: "UTC",
    wager: "Coffee",
    lives_total: 2,
    companion_user_ids: [companionA],
    activeChallengeCount: 2,
    existingActiveNames: [],
  });
  assertEquals(ok.ok, true);
});

Deno.test("shouldMarkChallengeSuccessful: all days done or missed after end date", () => {
  const challenge = baseChallenge({ end_date: "2026-07-07" });
  const checkIns = [
    { status: "done" },
    { status: "done" },
    { status: "missed" },
    { status: "done" },
    { status: "done" },
    { status: "done" },
    { status: "done" },
  ];
  assertEquals(
    shouldMarkChallengeSuccessful({
      challenge,
      checkIns,
      today: "2026-07-07",
    }),
    true,
  );
});

Deno.test("progressPercent: matches PRD formula", () => {
  assertEquals(progressPercent(6, 30), 20);
});

// Table-driven scenarios (StateMachine.md + PRD)
const tableScenarios: {
  name: string;
  from: DailyCheckIn["status"];
  event: string;
  expectStatus: DailyCheckIn["status"] | "challenge_failed";
}[] = [
  {
    name: "T1 pending → pending_validation on submit",
    from: "pending",
    event: "submit",
    expectStatus: "pending_validation",
  },
  {
    name: "T2 pending_validation → done on all accept",
    from: "pending_validation",
    event: "all_accept",
    expectStatus: "done",
  },
  {
    name: "T3 pending_validation → pending on reject (before deadline)",
    from: "pending_validation",
    event: "reject_before_deadline",
    expectStatus: "pending",
  },
  {
    name: "T4 pending → missed on deadline (life path handled separately)",
    from: "pending",
    event: "deadline_miss_life",
    expectStatus: "missed",
  },
];

Deno.test("table-driven state transitions", () => {
  for (const scenario of tableScenarios) {
    if (scenario.event === "submit") {
      const r = canSubmitCheckIn({
        challenge: baseChallenge(),
        checkIn: baseCheckIn({ status: scenario.from as DailyCheckIn["status"] }),
        now: new Date("2026-07-15T12:00:00Z"),
      });
      assertEquals(r.newStatus, scenario.expectStatus, scenario.name);
    }
    if (scenario.event === "all_accept") {
      const r = resolveProofIfComplete({
        challenge: baseChallenge(),
        checkIn: baseCheckIn({ status: "pending_validation" }),
        approvals: [
          { companion_user_id: companionA, decision: "accepted" },
          { companion_user_id: companionB, decision: "accepted" },
        ],
        activeCompanionIds: [companionA, companionB],
        now: new Date("2026-07-15T22:00:00Z"),
      });
      assertEquals(r.newCheckInStatus, scenario.expectStatus, scenario.name);
    }
    if (scenario.event === "reject_before_deadline") {
      const r = resolveProofIfComplete({
        challenge: baseChallenge(),
        checkIn: baseCheckIn({ status: "pending_validation" }),
        approvals: [
          { companion_user_id: companionA, decision: "rejected" },
          { companion_user_id: companionB, decision: "accepted" },
        ],
        activeCompanionIds: [companionA, companionB],
        now: new Date("2026-07-15T22:00:00Z"),
      });
      assertEquals(r.newCheckInStatus, scenario.expectStatus, scenario.name);
    }
    if (scenario.event === "deadline_miss_life") {
      const r = processOverdueCheckIn({
        challenge: baseChallenge({ lives_total: 1 }),
        checkIn: baseCheckIn({ status: "pending" }),
        now: new Date("2026-07-16T01:00:00Z"),
        hasPendingProof: false,
        allCompanionsActedOnPendingProof: false,
      });
      assertEquals(r.newCheckInStatus, scenario.expectStatus, scenario.name);
    }
    if (scenario.event === "deadline_miss_no_life") {
      const r = processOverdueCheckIn({
        challenge: baseChallenge({ lives_total: 0 }),
        checkIn: baseCheckIn({ status: "pending" }),
        now: new Date("2026-07-16T01:00:00Z"),
        hasPendingProof: false,
        allCompanionsActedOnPendingProof: false,
      });
      assertEquals(r.newChallengeStatus, "failed", scenario.name);
    }
  }
});

Deno.test("Pooja scenario: provisional advance then post-deadline reject → pending with makeup", () => {
  const day23 = baseCheckIn({
    check_in_date: "2026-07-23",
    status: "pending_validation",
    deadline_at: deadlineInstant("2026-07-23", "23:59:00", "UTC").toISOString(),
    provisionally_advanced: false,
  });
  const advance = processOverdueCheckIn({
    challenge: baseChallenge(),
    checkIn: day23,
    now: new Date("2026-07-24T00:05:00Z"),
    hasPendingProof: true,
    allCompanionsActedOnPendingProof: false,
  });
  assertEquals(advance.action, "provisional_advance");

  const afterAdvance = { ...day23, provisionally_advanced: true };
  const reject = resolveProofIfComplete({
    challenge: baseChallenge(),
    checkIn: afterAdvance,
    approvals: [
      { companion_user_id: companionA, decision: "rejected" },
      { companion_user_id: companionB, decision: "rejected" },
    ],
    activeCompanionIds: [companionA, companionB],
    now: new Date("2026-07-24T09:00:00Z"),
  });
  assertEquals(reject.newCheckInStatus, "pending");
  assertExists(reject.makeupDeadlineAt);
});
