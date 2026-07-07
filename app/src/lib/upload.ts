import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import { invokeChallengeAction } from './challenge-actions';
import { MAX_MEDIA_BYTES } from './types';

export type UploadResult =
  | { ok: true }
  | { ok: false; reason: 'cancelled' | 'too_large' | 'error'; message?: string };

async function readAssetBlob(uri: string): Promise<Blob> {
  const res = await fetch(uri);
  if (!res.ok) throw new Error('Could not read selected file');
  return res.blob();
}

async function uploadBlob(blob: Blob, signedUrl: string, contentType: string): Promise<void> {
  const res = await fetch(signedUrl, {
    method: 'PUT',
    body: blob,
    headers: { 'Content-Type': contentType },
  });
  if (!res.ok) throw new Error(`Storage upload failed (${res.status})`);
}

async function pickImages(): Promise<ImagePicker.ImagePickerAsset[] | null> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permission needed', 'Allow photo library access to upload proof.');
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: true,
    quality: 0.85,
  });
  if (result.canceled || !result.assets?.length) return null;
  return result.assets;
}

export async function pickAndUploadCheckIn(
  challengeId: string,
  checkInDate: string,
): Promise<UploadResult> {
  const assets = await pickImages();
  if (!assets?.length) return { ok: false, reason: 'cancelled' };

  try {
    let totalSize = 0;
    const blobs: { blob: Blob; contentType: string }[] = [];

    for (const asset of assets) {
      const blob = await readAssetBlob(asset.uri);
      totalSize += blob.size;
      blobs.push({ blob, contentType: asset.mimeType ?? 'image/jpeg' });
    }

    if (totalSize > MAX_MEDIA_BYTES) {
      Alert.alert('Too large', 'Total upload must be 20 MB or less.');
      return { ok: false, reason: 'too_large' };
    }

    const storagePaths: string[] = [];

    for (const { blob, contentType } of blobs) {
      const prep = await invokeChallengeAction<{
        storage_path: string;
        signed_upload_url: string;
      }>('prepare_check_in_upload', { challenge_id: challengeId, check_in_date: checkInDate });

      await uploadBlob(blob, prep.signed_upload_url, contentType);
      storagePaths.push(prep.storage_path);
    }

    await invokeChallengeAction('submit_check_in', {
      challenge_id: challengeId,
      check_in_date: checkInDate,
      storage_paths: storagePaths,
      media_size_bytes: totalSize,
    });
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Upload failed';
    return { ok: false, reason: 'error', message };
  }
}

export async function pickAndUploadWager(challengeId: string): Promise<UploadResult> {
  const assets = await pickImages();
  if (!assets?.length) return { ok: false, reason: 'cancelled' };

  try {
    let totalSize = 0;
    const blobs: { blob: Blob; contentType: string }[] = [];

    for (const asset of assets) {
      const blob = await readAssetBlob(asset.uri);
      totalSize += blob.size;
      blobs.push({ blob, contentType: asset.mimeType ?? 'image/jpeg' });
    }

    if (totalSize > MAX_MEDIA_BYTES) {
      Alert.alert('Too large', 'Total upload must be 20 MB or less.');
      return { ok: false, reason: 'too_large' };
    }

    const storagePaths: string[] = [];

    for (const { blob, contentType } of blobs) {
      const prep = await invokeChallengeAction<{
        storage_path: string;
        signed_upload_url: string;
      }>('prepare_wager_upload', { challenge_id: challengeId });

      await uploadBlob(blob, prep.signed_upload_url, contentType);
      storagePaths.push(prep.storage_path);
    }

    await invokeChallengeAction('submit_wager_settlement', {
      challenge_id: challengeId,
      storage_paths: storagePaths,
      media_size_bytes: totalSize,
    });
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Upload failed';
    return { ok: false, reason: 'error', message };
  }
}
