import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Alert } from 'react-native';
import { invokeChallengeAction } from './challenge-actions';
import { MAX_MEDIA_BYTES } from './types';

export async function pickAndUploadCheckIn(
  challengeId: string,
  checkInDate: string,
): Promise<void> {
  const result = await DocumentPicker.getDocumentAsync({
    multiple: true,
    copyToCacheDirectory: true,
  });
  if (result.canceled || !result.assets?.length) return;

  let totalSize = 0;
  for (const asset of result.assets) {
    const info = await FileSystem.getInfoAsync(asset.uri);
    if (info.exists && 'size' in info) totalSize += info.size ?? 0;
  }
  if (totalSize > MAX_MEDIA_BYTES) {
    Alert.alert('Too large', 'Total upload must be 20 MB or less.');
    return;
  }

  const storagePaths: string[] = [];

  for (const asset of result.assets) {
    const prep = await invokeChallengeAction<{
      storage_path: string;
      signed_upload_url: string;
    }>('prepare_check_in_upload', { challenge_id: challengeId, check_in_date: checkInDate });

    const blob = await fetch(asset.uri).then((r) => r.blob());
    const upload = await fetch(prep.signed_upload_url, {
      method: 'PUT',
      body: blob,
      headers: { 'Content-Type': asset.mimeType ?? 'application/octet-stream' },
    });
    if (!upload.ok) throw new Error('Upload failed');
    storagePaths.push(prep.storage_path);
  }

  await invokeChallengeAction('submit_check_in', {
    challenge_id: challengeId,
    check_in_date: checkInDate,
    storage_paths: storagePaths,
    media_size_bytes: totalSize,
  });
}

export async function pickAndUploadWager(challengeId: string): Promise<void> {
  const result = await ImagePicker.launchImageLibraryAsync({
    allowsMultipleSelection: true,
    quality: 0.8,
  });
  if (result.canceled || !result.assets?.length) return;

  let totalSize = 0;
  const storagePaths: string[] = [];

  for (const asset of result.assets) {
    const info = await FileSystem.getInfoAsync(asset.uri);
    if (info.exists && 'size' in info) totalSize += info.size ?? 0;
  }
  if (totalSize > MAX_MEDIA_BYTES) {
    Alert.alert('Too large', 'Total upload must be 20 MB or less.');
    return;
  }

  for (const asset of result.assets) {
    const prep = await invokeChallengeAction<{
      storage_path: string;
      signed_upload_url: string;
    }>('prepare_wager_upload', { challenge_id: challengeId });

    const blob = await fetch(asset.uri).then((r) => r.blob());
    await fetch(prep.signed_upload_url, {
      method: 'PUT',
      body: blob,
      headers: { 'Content-Type': 'image/jpeg' },
    });
    storagePaths.push(prep.storage_path);
  }

  await invokeChallengeAction('submit_wager_settlement', {
    challenge_id: challengeId,
    storage_paths: storagePaths,
    media_size_bytes: totalSize,
  });
}
