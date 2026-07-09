import { invokeChallengeAction } from './challenge-actions';
import { supabase } from './supabase';

export const PROOF_BUCKET = 'proof-of-work';
export const WAGER_BUCKET = 'wager-settlement';

export type ProofUrlResult = {
  urlsByProofId: Record<string, string[]>;
  error?: string;
};

async function clientSignedUrls(paths: string[]): Promise<{ urls: string[]; error?: string }> {
  const urls: string[] = [];
  let lastError: string | undefined;

  for (const path of paths) {
    const { data, error } = await supabase.storage
      .from(PROOF_BUCKET)
      .createSignedUrl(path, 3600, { download: 'proof.jpg' });

    if (error) {
      lastError = error.message;
      continue;
    }
    if (data?.signedUrl) urls.push(data.signedUrl);
  }

  return { urls, error: lastError };
}

/** Signed download URLs: Edge Function first, then client Storage fallback. */
export async function signedProofUrlsByProofId(
  proofIds: string[],
  storagePathsByProofId: Record<string, string[]> = {},
): Promise<ProofUrlResult> {
  if (!proofIds.length) return { urlsByProofId: {} };

  const urlsByProofId: Record<string, string[]> = {};
  let lastError: string | undefined;

  try {
    const data = await invokeChallengeAction<{
      urls: Record<string, { signed_url: string }[]>;
    }>('get_proof_download_urls', { proof_ids: proofIds });

    for (const [proofId, entries] of Object.entries(data.urls ?? {})) {
      const urls = entries.map((e) => e.signed_url).filter(Boolean);
      if (urls.length > 0) urlsByProofId[proofId] = urls;
    }
  } catch (e) {
    lastError = e instanceof Error ? e.message : 'Could not fetch proof URLs';
  }

  for (const proofId of proofIds) {
    if (urlsByProofId[proofId]?.length) continue;
    const paths = storagePathsByProofId[proofId] ?? [];
    if (!paths.length) continue;

    const client = await clientSignedUrls(paths);
    if (client.urls.length > 0) {
      urlsByProofId[proofId] = client.urls;
    } else if (client.error) {
      lastError = client.error;
    }
  }

  if (Object.keys(urlsByProofId).length === 0 && lastError) {
    return { urlsByProofId, error: lastError };
  }

  return { urlsByProofId, error: lastError };
}

export function isLikelyImagePath(path: string): boolean {
  return /\.(jpe?g|png|gif|webp|heic)$/i.test(path);
}

/** V1 uploads are images only (ImagePicker); paths are UUIDs without extensions. */
export function shouldRenderAsImage(_path: string): boolean {
  return true;
}
