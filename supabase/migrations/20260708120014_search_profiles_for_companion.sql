-- Companion picker: search by name or phone; list invitable users when query is empty.

CREATE OR REPLACE FUNCTION public.search_profiles_for_companion(p_query TEXT DEFAULT '')
RETURNS TABLE (
  id UUID,
  display_name TEXT,
  first_name TEXT,
  last_name TEXT,
  phone TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id,
    p.display_name,
    p.first_name,
    p.last_name,
    p.phone
  FROM public.profiles p
  WHERE auth.uid() IS NOT NULL
    AND p.id != auth.uid()
    AND (
      trim(coalesce(p_query, '')) = ''
      OR coalesce(p.display_name, '') ILIKE ('%' || trim(p_query) || '%')
      OR coalesce(p.first_name, '') ILIKE ('%' || trim(p_query) || '%')
      OR coalesce(p.last_name, '') ILIKE ('%' || trim(p_query) || '%')
      OR (
        regexp_replace(p_query, '\D', '', 'g') <> ''
        AND regexp_replace(coalesce(p.phone, ''), '\D', '', 'g')
          LIKE ('%' || regexp_replace(p_query, '\D', '', 'g') || '%')
      )
    )
  ORDER BY
    coalesce(p.first_name, p.display_name, ''),
    coalesce(p.last_name, '')
  LIMIT 20;
$$;

GRANT EXECUTE ON FUNCTION public.search_profiles_for_companion TO authenticated;
