import { Link, Redirect } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useAuth } from '@/src/context/AuthContext';
import { devAccounts, devSignIn, devSkipAuth } from '@/src/lib/dev-auth';
import { colors, spacing } from '@/src/theme';
import { AppText, Button } from '@/src/ui';

export default function WelcomeScreen() {
  const { session, loading } = useAuth();

  if (loading) return null;
  if (session) return <Redirect href="/challenges" />;

  const devLogin = async (role: 'challenger' | 'companion') => {
    await devSignIn(role);
  };

  return (
    <View style={styles.container}>
      <AppText style={styles.mark}>🌱</AppText>
      <AppText variant="displayMedium" style={styles.title}>
        HeroArc
      </AppText>
      <AppText variant="heading" color={colors.textSecondary} style={styles.headline}>
        Show up every day.{'\n'}Everything else follows.
      </AppText>
      <AppText variant="body" color={colors.textMuted} style={styles.sub}>
        Big goals. Small steps. Every day.
      </AppText>

      <Link href="/signup" asChild>
        <Button title="Get started" fullWidth style={styles.primary} />
      </Link>

      <Link href="/login" asChild>
        <Button title="I already have an account" variant="ghost" fullWidth />
      </Link>

      {devSkipAuth && (
        <View style={styles.devBlock}>
          <AppText variant="caption" color={colors.textMuted} style={styles.devLabel}>
            Dev shortcuts
          </AppText>
          <Button
            title={devAccounts.challenger.label}
            onPress={() => devLogin('challenger')}
            variant="secondary"
            fullWidth
            style={styles.devBtn}
          />
          <Button
            title={devAccounts.companion.label}
            onPress={() => devLogin('companion')}
            variant="secondary"
            fullWidth
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing[6],
    backgroundColor: colors.background,
  },
  mark: { fontSize: 64, textAlign: 'center', marginBottom: spacing[4] },
  title: { textAlign: 'center', marginBottom: spacing[2] },
  headline: { textAlign: 'center', marginBottom: spacing[3] },
  sub: { textAlign: 'center', marginBottom: spacing[8] },
  primary: { marginBottom: spacing[3] },
  devBlock: {
    marginTop: spacing[8],
    paddingTop: spacing[6],
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing[2],
  },
  devLabel: { textAlign: 'center', marginBottom: spacing[2] },
  devBtn: { marginBottom: spacing[2] },
});
