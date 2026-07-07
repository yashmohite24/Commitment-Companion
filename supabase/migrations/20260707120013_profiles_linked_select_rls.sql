-- Bug 11 (follow-up): allow reading linked participant profile names via RLS.

CREATE OR REPLACE FUNCTION public.user_can_view_profile(p_profile_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p_profile_id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM public.challenges c
      INNER JOIN public.challenge_participations cp ON cp.challenge_id = c.id
      WHERE c.challenger_id = p_profile_id
        AND cp.companion_user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1
      FROM public.challenges c
      INNER JOIN public.challenge_participations cp ON cp.challenge_id = c.id
      WHERE c.challenger_id = auth.uid()
        AND cp.companion_user_id = p_profile_id
    )
    OR EXISTS (
      SELECT 1
      FROM public.companion_requests cr
      INNER JOIN public.challenges c ON c.id = cr.challenge_id
      WHERE cr.companion_user_id = auth.uid()
        AND c.challenger_id = p_profile_id
    )
    OR EXISTS (
      SELECT 1
      FROM public.companion_requests cr
      INNER JOIN public.challenges c ON c.id = cr.challenge_id
      WHERE c.challenger_id = auth.uid()
        AND cr.companion_user_id = p_profile_id
    );
$$;

CREATE POLICY profiles_select_challenge_linked ON public.profiles
  FOR SELECT USING (public.user_can_view_profile(id));

GRANT EXECUTE ON FUNCTION public.user_can_view_profile TO authenticated;
