import { supabase } from './supabase';

export const PROOF_BUCKET = 'proof-of-work';
export const WAGER_BUCKET = 'wager-settlement';

/** Resolve signed download URLs for proof-of-work storage paths. */
export async function signedStorageUrls(
  bucket: string,
  storagePaths: string[],
): Promise<string[]> {
  const urls: string[] = [];
  for (const path of storagePaths) {
    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 3600);
    if (error || !data?.signedUrl) continue;
    urls.push(data.signedUrl);
  }
  return urls;
}

export function isLikelyImagePath(path: string): boolean {
  return /\.(jpe?g|png|gif|webp|heic)$/i.test(path);
}
