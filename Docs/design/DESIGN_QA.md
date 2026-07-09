# Phase 9 — Design QA Checklist

Review all artifacts in `Docs/design/` before and after implementation.

**Artifacts:** 01-brand through 08-motion, tokens.json, component-showcase.html, 07-screens/

---

## PRD completeness

- [x] User Stories 1–3, 5–11 represented in 06-user-flows and 07-screens
- [x] User Story 4 (chat) correctly omitted — activity feed only
- [x] 8 challenge card states with correct CTAs per PRD table (04-components)
- [x] Create flow: name, dates, deadline, wager, lives, companions (max 10, max 5 active)
- [x] Profile metrics: all 6 PRD fields with narrative labels
- [x] Wager settlement flow through companion approval to closed
- [x] Leave challenge blocked when last companion

## Brand compliance

- [x] No guilt-inducing copy per 01-brand-strategy microcopy guide
- [x] No harsh red for failure — coral/salmon palette only
- [x] Warm voice on errors and edge states
- [x] Progress trail metaphor with percentage as secondary label

## System consistency

- [x] All specs reference tokens.json / 03-tokens
- [x] Manrope headings + Inter body documented
- [x] 16px horizontal margin, 8px gutter on mobile
- [x] Radius: sm 8 / md 16 / lg 24 / full pills
- [x] Component variants in 04-components — no one-off patterns in screen specs

## Accessibility

- [x] Status chips pair icon + label (not color alone)
- [x] Primary buttons ≥ 48px touch height
- [x] Body text 16px minimum
- [x] AA contrast pairs documented in tokens.json
- [x] Reduce motion variant in 08-motion-prototype.md

## Implementation QA (post-code)

- [ ] Theme tokens loaded in app — no hardcoded `#2563eb`
- [ ] All tab screens use HeroArc palette
- [ ] card-status.ts uses warm microcopy
- [ ] Challenge cards show 8 visual states
- [ ] Device smoke test Android + iOS

## Success criteria

When someone opens HeroArc in the morning they should feel **"I'm becoming someone better"** — not **"I have another task."**

---

## Approval sign-off

| Field | Value |
|-------|-------|
| Reviewer | Design + Engineering |
| Date | 2026-07-10 |
| Artifacts approved | **Yes** — proceed to implementation |
| Implementation branch | `Iteration-(with-FE)` only |
| Notes | Stage 1 artifacts complete; Stage 2 Expo implementation in progress |
