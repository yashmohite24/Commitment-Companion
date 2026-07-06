INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES
  ('proof-of-work', 'proof-of-work', false, 20971520),
  ('wager-settlement', 'wager-settlement', false, 20971520)
ON CONFLICT (id) DO NOTHING;
