-- Commitment App — initial schema
-- Domain writes are intended via Edge Functions (service role).

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

CREATE TYPE challenge_status AS ENUM (
  'draft',
  'active',
  'successful',
  'failed',
  'closed'
);

CREATE TYPE companion_request_status AS ENUM (
  'pending',
  'accepted',
  'rejected',
  'expired'
);

CREATE TYPE participation_status AS ENUM (
  'active',
  'left'
);

CREATE TYPE daily_check_in_status AS ENUM (
  'pending',
  'pending_validation',
  'done',
  'missed'
);

CREATE TYPE approval_decision AS ENUM (
  'accepted',
  'rejected'
);

CREATE TYPE check_in_log_outcome AS ENUM (
  'verified',
  'rejected'
);

CREATE TYPE system_message_type AS ENUM (
  'companion_left',
  'challenge_failed',
  'challenge_successful',
  'challenge_activated',
  'companion_request_expired'
);

-- ---------------------------------------------------------------------------
-- Profiles (extends auth.users)
-- ---------------------------------------------------------------------------

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  display_name TEXT,
  phone TEXT,
  expo_push_token TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Challenges
-- ---------------------------------------------------------------------------

CREATE TABLE public.challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenger_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  daily_deadline_time TIME NOT NULL DEFAULT '23:59:00',
  timezone TEXT NOT NULL DEFAULT 'UTC',
  wager TEXT NOT NULL,
  lives_total INTEGER NOT NULL DEFAULT 0 CHECK (lives_total >= 0),
  lives_consumed INTEGER NOT NULL DEFAULT 0 CHECK (lives_consumed >= 0),
  status challenge_status NOT NULL DEFAULT 'draft',
  draft_message TEXT,
  activated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT challenges_dates_valid CHECK (end_date >= start_date),
  CONSTRAINT challenges_lives_valid CHECK (lives_consumed <= lives_total)
);

CREATE INDEX idx_challenges_challenger ON public.challenges (challenger_id);
CREATE INDEX idx_challenges_status ON public.challenges (status);
CREATE INDEX idx_challenges_active_dates ON public.challenges (status, start_date, end_date)
  WHERE status = 'active';

-- ---------------------------------------------------------------------------
-- Companion requests
-- ---------------------------------------------------------------------------

CREATE TABLE public.companion_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES public.challenges (id) ON DELETE CASCADE,
  companion_user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  status companion_request_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  UNIQUE (challenge_id, companion_user_id)
);

CREATE INDEX idx_companion_requests_user ON public.companion_requests (companion_user_id, status);

-- ---------------------------------------------------------------------------
-- Challenge participations (accepted companions)
-- ---------------------------------------------------------------------------

CREATE TABLE public.challenge_participations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES public.challenges (id) ON DELETE CASCADE,
  companion_user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  status participation_status NOT NULL DEFAULT 'active',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  left_at TIMESTAMPTZ,
  UNIQUE (challenge_id, companion_user_id)
);

CREATE INDEX idx_participations_challenge ON public.challenge_participations (challenge_id, status);

-- ---------------------------------------------------------------------------
-- Daily check-ins
-- ---------------------------------------------------------------------------

CREATE TABLE public.daily_check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES public.challenges (id) ON DELETE CASCADE,
  check_in_date DATE NOT NULL,
  status daily_check_in_status NOT NULL DEFAULT 'pending',
  deadline_at TIMESTAMPTZ NOT NULL,
  makeup_deadline_at TIMESTAMPTZ,
  provisionally_advanced BOOLEAN NOT NULL DEFAULT FALSE,
  deadline_reminder_sent BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (challenge_id, check_in_date)
);

CREATE INDEX idx_daily_check_ins_challenge ON public.daily_check_ins (challenge_id, check_in_date);
CREATE INDEX idx_daily_check_ins_deadline ON public.daily_check_ins (status, deadline_at)
  WHERE status IN ('pending', 'pending_validation');

-- ---------------------------------------------------------------------------
-- Proof of work
-- ---------------------------------------------------------------------------

CREATE TABLE public.proof_of_work (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_check_in_id UUID NOT NULL REFERENCES public.daily_check_ins (id) ON DELETE CASCADE,
  challenger_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  storage_paths TEXT[] NOT NULL DEFAULT '{}',
  media_size_bytes INTEGER NOT NULL CHECK (media_size_bytes > 0 AND media_size_bytes <= 20971520),
  sequence_number INTEGER NOT NULL DEFAULT 1 CHECK (sequence_number >= 1),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  media_deleted_at TIMESTAMPTZ,
  resolution_outcome check_in_log_outcome
);

CREATE INDEX idx_proof_of_work_check_in ON public.proof_of_work (daily_check_in_id, submitted_at DESC);
CREATE INDEX idx_proof_of_work_pending_media ON public.proof_of_work (daily_check_in_id)
  WHERE media_deleted_at IS NULL;

-- ---------------------------------------------------------------------------
-- Approvals
-- ---------------------------------------------------------------------------

CREATE TABLE public.approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proof_of_work_id UUID NOT NULL REFERENCES public.proof_of_work (id) ON DELETE CASCADE,
  companion_user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  decision approval_decision NOT NULL,
  decided_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (proof_of_work_id, companion_user_id)
);

CREATE INDEX idx_approvals_proof ON public.approvals (proof_of_work_id);

-- ---------------------------------------------------------------------------
-- Check-in logs (activity feed)
-- ---------------------------------------------------------------------------

CREATE TABLE public.check_in_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES public.challenges (id) ON DELETE CASCADE,
  daily_check_in_id UUID NOT NULL REFERENCES public.daily_check_ins (id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  outcome check_in_log_outcome NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_check_in_logs_challenge ON public.check_in_logs (challenge_id, created_at DESC);

-- ---------------------------------------------------------------------------
-- System messages (activity feed)
-- ---------------------------------------------------------------------------

CREATE TABLE public.system_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES public.challenges (id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  message_type system_message_type NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_system_messages_challenge ON public.system_messages (challenge_id, created_at DESC);

-- ---------------------------------------------------------------------------
-- Wager settlement
-- ---------------------------------------------------------------------------

CREATE TABLE public.wager_settlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL UNIQUE REFERENCES public.challenges (id) ON DELETE CASCADE,
  challenger_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  storage_paths TEXT[] NOT NULL DEFAULT '{}',
  media_size_bytes INTEGER NOT NULL CHECK (media_size_bytes > 0 AND media_size_bytes <= 20971520),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.wager_settlement_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wager_settlement_id UUID NOT NULL REFERENCES public.wager_settlements (id) ON DELETE CASCADE,
  companion_user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  decision approval_decision NOT NULL DEFAULT 'accepted',
  decided_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (wager_settlement_id, companion_user_id)
);

-- ---------------------------------------------------------------------------
-- Updated-at trigger
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER challenges_updated_at
  BEFORE UPDATE ON public.challenges
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER daily_check_ins_updated_at
  BEFORE UPDATE ON public.daily_check_ins
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.phone, NEW.raw_user_meta_data->>'phone')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
