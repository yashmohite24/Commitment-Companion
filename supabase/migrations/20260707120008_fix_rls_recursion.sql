-- Break RLS recursion between challenges ↔ companion_requests (Bug 1 & 4).

CREATE OR REPLACE FUNCTION public.is_challenge_challenger(p_challenge_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.challenges c
    WHERE c.id = p_challenge_id AND c.challenger_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.user_has_challenge_read_access(p_challenge_id UUID)
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
  )
  OR EXISTS (
    SELECT 1 FROM public.companion_requests cr
    WHERE cr.challenge_id = p_challenge_id
      AND cr.companion_user_id = auth.uid()
      AND cr.status IN ('pending', 'accepted')
  );
$$;

DROP POLICY IF EXISTS challenges_select_participant ON public.challenges;

CREATE POLICY challenges_select_participant ON public.challenges
  FOR SELECT USING (public.user_has_challenge_read_access(id));

DROP POLICY IF EXISTS companion_requests_select ON public.companion_requests;

CREATE POLICY companion_requests_select ON public.companion_requests
  FOR SELECT USING (
    companion_user_id = auth.uid()
    OR public.is_challenge_challenger(challenge_id)
  );
