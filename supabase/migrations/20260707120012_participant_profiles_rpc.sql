-- Bug 11: companions can read challenger names (and vice versa) via scoped RPC.

CREATE OR REPLACE FUNCTION public.get_challenge_participant_profiles(p_user_ids UUID[])
RETURNS TABLE (
  id UUID,
  first_name TEXT,
  last_name TEXT,
  display_name TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.first_name, p.last_name, p.display_name
  FROM public.profiles p
  WHERE auth.uid() IS NOT NULL
    AND p.id = ANY(p_user_ids)
    AND (
      p.id = auth.uid()
      OR EXISTS (
        SELECT 1
        FROM public.challenges c
        INNER JOIN public.challenge_participations cp ON cp.challenge_id = c.id
        WHERE c.challenger_id = p.id
          AND cp.companion_user_id = auth.uid()
      )
      OR EXISTS (
        SELECT 1
        FROM public.challenges c
        INNER JOIN public.challenge_participations cp ON cp.challenge_id = c.id
        WHERE c.challenger_id = auth.uid()
          AND cp.companion_user_id = p.id
      )
      OR EXISTS (
        SELECT 1
        FROM public.companion_requests cr
        INNER JOIN public.challenges c ON c.id = cr.challenge_id
        WHERE cr.companion_user_id = auth.uid()
          AND c.challenger_id = p.id
      )
      OR EXISTS (
        SELECT 1
        FROM public.companion_requests cr
        INNER JOIN public.challenges c ON c.id = cr.challenge_id
        WHERE c.challenger_id = auth.uid()
          AND cr.companion_user_id = p.id
      )
    );
$$;

GRANT EXECUTE ON FUNCTION public.get_challenge_participant_profiles TO authenticated;
