-- Storage RLS: participants can read media for their challenges; no direct client writes.

CREATE POLICY proof_of_work_storage_select ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'proof-of-work'
    AND (
      EXISTS (
        SELECT 1 FROM public.challenges c
        WHERE c.id::text = (storage.foldername(name))[1]
          AND public.is_challenge_participant(c.id)
      )
    )
  );

CREATE POLICY wager_settlement_storage_select ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'wager-settlement'
    AND (
      EXISTS (
        SELECT 1 FROM public.challenges c
        WHERE c.id::text = (storage.foldername(name))[1]
          AND public.is_challenge_participant(c.id)
      )
    )
  );

-- Service role (Edge Functions) bypasses RLS for upload/delete via signed URLs.
