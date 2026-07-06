-- Row Level Security — participant-scoped reads; writes via service role (Edge Functions).

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companion_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_participations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proof_of_work ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.check_in_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wager_settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wager_settlement_approvals ENABLE ROW LEVEL SECURITY;

-- Helper: user is challenger or active companion on a challenge
CREATE OR REPLACE FUNCTION public.is_challenge_participant(p_challenge_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.challenges c
    WHERE c.id = p_challenge_id AND c.challenger_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.challenge_participations cp
    WHERE cp.challenge_id = p_challenge_id
      AND cp.companion_user_id = auth.uid()
      AND cp.status = 'active'
  );
$$;

-- Profiles
CREATE POLICY profiles_select_own ON public.profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE USING (id = auth.uid());

-- Challenges
CREATE POLICY challenges_select_participant ON public.challenges
  FOR SELECT USING (
    challenger_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.challenge_participations cp
      WHERE cp.challenge_id = challenges.id
        AND cp.companion_user_id = auth.uid()
        AND cp.status = 'active'
    )
    OR EXISTS (
      SELECT 1 FROM public.companion_requests cr
      WHERE cr.challenge_id = challenges.id
        AND cr.companion_user_id = auth.uid()
        AND cr.status = 'pending'
    )
  );

-- Companion requests
CREATE POLICY companion_requests_select ON public.companion_requests
  FOR SELECT USING (
    companion_user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.challenges c
      WHERE c.id = companion_requests.challenge_id AND c.challenger_id = auth.uid()
    )
  );

-- Participations
CREATE POLICY participations_select ON public.challenge_participations
  FOR SELECT USING (public.is_challenge_participant(challenge_id));

-- Daily check-ins
CREATE POLICY daily_check_ins_select ON public.daily_check_ins
  FOR SELECT USING (public.is_challenge_participant(challenge_id));

-- Proof of work
CREATE POLICY proof_of_work_select ON public.proof_of_work
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.daily_check_ins dci
      WHERE dci.id = proof_of_work.daily_check_in_id
        AND public.is_challenge_participant(dci.challenge_id)
    )
  );

-- Approvals
CREATE POLICY approvals_select ON public.approvals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.proof_of_work pow
      JOIN public.daily_check_ins dci ON dci.id = pow.daily_check_in_id
      WHERE pow.id = approvals.proof_of_work_id
        AND public.is_challenge_participant(dci.challenge_id)
    )
  );

-- Activity feed tables
CREATE POLICY check_in_logs_select ON public.check_in_logs
  FOR SELECT USING (public.is_challenge_participant(challenge_id));

CREATE POLICY system_messages_select ON public.system_messages
  FOR SELECT USING (public.is_challenge_participant(challenge_id));

-- Wager settlement
CREATE POLICY wager_settlements_select ON public.wager_settlements
  FOR SELECT USING (public.is_challenge_participant(challenge_id));

CREATE POLICY wager_settlement_approvals_select ON public.wager_settlement_approvals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.wager_settlements ws
      WHERE ws.id = wager_settlement_approvals.wager_settlement_id
        AND public.is_challenge_participant(ws.challenge_id)
    )
  );

-- Storage bucket (proof media) — policies in separate migration or dashboard
-- Edge Functions use service role for all INSERT/UPDATE/DELETE on domain tables.
