-- Allow accepted (pre-activation) companions to read draft challenges they joined.

DROP POLICY IF EXISTS challenges_select_participant ON public.challenges;

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
        AND cr.status IN ('pending', 'accepted')
    )
  );
