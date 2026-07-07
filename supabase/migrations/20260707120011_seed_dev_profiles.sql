-- Bug 3: backfill dev test profiles with phones for companion search + create flow QA.

INSERT INTO public.profiles (
  id,
  phone,
  email,
  first_name,
  last_name,
  country,
  phone_country_code,
  display_name
)
SELECT
  u.id,
  CASE u.email
    WHEN 'challenger@test.local' THEN '+919000000001'
    WHEN 'companion@test.local' THEN '+919000000002'
  END,
  u.email,
  CASE u.email
    WHEN 'challenger@test.local' THEN 'Test'
    WHEN 'companion@test.local' THEN 'Test'
  END,
  CASE u.email
    WHEN 'challenger@test.local' THEN 'Challenger'
    WHEN 'companion@test.local' THEN 'Companion'
  END,
  'IN',
  '+91',
  CASE u.email
    WHEN 'challenger@test.local' THEN 'Test Challenger'
    WHEN 'companion@test.local' THEN 'Test Companion'
  END
FROM auth.users u
WHERE u.email IN ('challenger@test.local', 'companion@test.local')
ON CONFLICT (id) DO UPDATE SET
  phone = EXCLUDED.phone,
  email = EXCLUDED.email,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  country = EXCLUDED.country,
  phone_country_code = EXCLUDED.phone_country_code,
  display_name = EXCLUDED.display_name;
