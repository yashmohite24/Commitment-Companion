import { invokeChallengeAction } from './challenge-actions';

export const PROOF_BUCKET = 'proof-of-work';
export const WAGER_BUCKET = 'wager-settlement';

/** Signed download URLs via Edge Function (service role); reliable for extensionless paths. */
export async function signedProofUrlsByProofId(
  proofIds: string[],
): Promise<Record<string, string[]>> {
  if (!proofIds.length) return {};
  try {
    const data = await invokeChallengeAction<{
      urls: Record<string, { signed_url: string }[]>;
    }>('get_proof_download_urls', { proof_ids: proofIds });

    const map: Record<string, string[]> = {};
    for (const [proofId, entries] of Object.entries(data.urls ?? {})) {
      map[proofId] = entries.map((e) => e.signed_url);
    }
    return map;
  } catch {
    return {};
  }
}

/** @deprecated Client-side signed URLs fail on private bucket RLS; use signedProofUrlsByProofId. */
export async function signedStorageUrls(
  bucket: string,
  storagePaths: string[],
): Promise<string[]> {
  void bucket;
  void storagePaths;
  return [];
}

export function isLikelyImagePath(path: string): boolean {
  return /\.(jpe?g|png|gif|webp|heic)$/i.test(path);
}

/** V1 uploads are images only (ImagePicker); paths are UUIDs without extensions. */
export function shouldRenderAsImage(_path: string): boolean {
  return true;
}
