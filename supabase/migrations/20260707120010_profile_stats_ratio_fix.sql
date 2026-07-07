-- Bug 5: wager settlement ratio returns 0 when no challenges / no wagers to divide.

CREATE OR REPLACE FUNCTION public.get_profile_stats(p_user_id UUID DEFAULT auth.uid())
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_consistent_since INTEGER := 0;
  v_longest_streak INTEGER := 0;
  v_wagers_settled INTEGER := 0;
  v_wagers_total INTEGER := 0;
  v_challenges_created INTEGER := 0;
  v_challenges_completed INTEGER := 0;
  v_wagers_realized INTEGER := 0;
  v_streak INTEGER;
  v_challenge RECORD;
  v_check_in RECORD;
  v_ratio INTEGER := 0;
BEGIN
  IF p_user_id IS NULL OR p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT COUNT(*) INTO v_challenges_created
  FROM challenges WHERE challenger_id = p_user_id;

  SELECT COUNT(*) INTO v_challenges_completed
  FROM challenges WHERE challenger_id = p_user_id AND status = 'successful';

  SELECT COUNT(*) INTO v_wagers_total
  FROM challenges WHERE challenger_id = p_user_id AND status IN ('failed', 'closed');

  SELECT COUNT(*) INTO v_wagers_settled
  FROM challenges WHERE challenger_id = p_user_id AND status = 'closed';

  v_wagers_realized := v_wagers_settled;

  IF v_challenges_created = 0 OR v_wagers_total = 0 THEN
    v_ratio := 0;
  ELSE
    v_ratio := ROUND((v_wagers_settled::numeric / v_wagers_total) * 100);
  END IF;

  WITH done_days AS (
    SELECT DISTINCT dci.check_in_date AS d
    FROM daily_check_ins dci
    JOIN challenges c ON c.id = dci.challenge_id
    WHERE c.challenger_id = p_user_id AND dci.status = 'done'
    ORDER BY d DESC
  ),
  numbered AS (
    SELECT d, d - (ROW_NUMBER() OVER (ORDER BY d))::int AS grp FROM done_days
  )
  SELECT COALESCE(MAX(cnt), 0) INTO v_consistent_since
  FROM (SELECT COUNT(*) AS cnt FROM numbered GROUP BY grp) s;

  FOR v_challenge IN
    SELECT id FROM challenges WHERE challenger_id = p_user_id
  LOOP
    v_streak := 0;
    FOR v_check_in IN
      SELECT status, check_in_date FROM daily_check_ins
      WHERE challenge_id = v_challenge.id
      ORDER BY check_in_date
    LOOP
      IF v_check_in.status = 'done' THEN
        v_streak := v_streak + 1;
        IF v_streak > v_longest_streak THEN
          v_longest_streak := v_streak;
        END IF;
      ELSE
        v_streak := 0;
      END IF;
    END LOOP;
  END LOOP;

  RETURN jsonb_build_object(
    'consistent_since', v_consistent_since,
    'longest_streak', v_longest_streak,
    'wager_settlement_ratio', v_ratio,
    'challenges_created', v_challenges_created,
    'challenges_completed', v_challenges_completed,
    'wagers_realized', v_wagers_realized
  );
END;
$$;
