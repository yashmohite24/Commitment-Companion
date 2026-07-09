import { StyleSheet, View } from 'react-native';
import { spacing } from '@/src/theme';
import { AppText } from './AppText';
import { BottomSheet } from './BottomSheet';
import { Button } from './Button';

interface Props {
  visible: boolean;
  onClose: () => void;
  onUpload: () => void;
  loading?: boolean;
}

export function MediaUploadSheet({ visible, onClose, onUpload, loading }: Props) {
  return (
    <BottomSheet visible={visible} onClose={onClose} title="Show today's proof">
      <AppText variant="body" style={styles.body}>
        A photo, clip, or note helps your companions see you showed up today.
      </AppText>
      <View style={styles.actions}>
        <Button
          title={loading ? 'Uploading…' : 'Choose proof'}
          onPress={onUpload}
          disabled={loading}
          fullWidth
        />
        <Button title="Not now" variant="ghost" onPress={onClose} fullWidth />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  body: { marginBottom: spacing[5], lineHeight: 22 },
  actions: { gap: spacing[2] },
});
