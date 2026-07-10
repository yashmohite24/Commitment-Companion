import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { colors, radius, spacing } from '@/src/theme';
import { AppText, Button } from '@/src/ui';

type Variant = 'active' | 'past';

interface Props {
  variant: Variant;
  onCreateGoal?: () => void;
}

function ActiveIllustration() {
  return (
    <Svg width={160} height={120} viewBox="0 0 160 120" fill="none">
      <Rect x="8" y="8" width="144" height="104" rx="20" fill={colors.primaryMuted} />
      <Path
        d="M32 88 C32 88 48 88 68 62 C88 36 108 28 128 20"
        stroke={colors.primary}
        strokeWidth={4}
        strokeLinecap="round"
      />
      <Circle cx="32" cy="88" r="6" fill={colors.accent} opacity={0.8} />
      <Circle cx="128" cy="20" r="10" fill={colors.celebration} />
      <Circle cx="128" cy="20" r="5" fill={colors.surface} />
      <Rect x="52" y="72" width="14" height="14" rx="4" fill={colors.companion} opacity={0.85} />
      <Rect x="72" y="54" width="14" height="14" rx="4" fill={colors.wager} opacity={0.9} />
      <Rect x="92" y="38" width="14" height="14" rx="4" fill={colors.accent} opacity={0.75} />
    </Svg>
  );
}

function PastIllustration() {
  return (
    <Svg width={160} height={120} viewBox="0 0 160 120" fill="none">
      <Rect x="8" y="8" width="144" height="104" rx="20" fill={colors.celebrationMuted} />
      <Path
        d="M28 92 C28 92 52 92 76 68 C100 44 116 32 132 24"
        stroke={colors.primary}
        strokeWidth={3}
        strokeLinecap="round"
        opacity={0.45}
      />
      <Circle cx="132" cy="24" r="12" fill={colors.celebration} />
      <Path
        d="M128 24 L131 27 L136 20"
        stroke={colors.surface}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

const STEPS = [
  { emoji: '✏️', label: 'Name your goal' },
  { emoji: '👥', label: 'Invite your people' },
  { emoji: '🌱', label: 'Show up daily' },
] as const;

export function ChallengerEmptyState({ variant, onCreateGoal }: Props) {
  const isActive = variant === 'active';

  return (
    <View style={styles.wrap}>
      <View style={styles.card}>
        <View style={styles.art}>
          {isActive ? <ActiveIllustration /> : <PastIllustration />}
        </View>

        <AppText variant="title" style={styles.title}>
          {isActive ? 'Your next big goal starts here' : 'No past goals yet'}
        </AppText>
        <AppText variant="body" color={colors.textSecondary} style={styles.message}>
          {isActive
            ? 'Pick something that matters. Small steps every day — with people who believe in you.'
            : "When you finish a goal, it'll live here. Proof you showed up."}
        </AppText>

        {isActive ? (
          <>
            <View style={styles.steps}>
              {STEPS.map((step) => (
                <View key={step.label} style={styles.step}>
                  <AppText style={styles.stepEmoji}>{step.emoji}</AppText>
                  <AppText variant="caption" color={colors.textSecondary}>
                    {step.label}
                  </AppText>
                </View>
              ))}
            </View>
            {onCreateGoal ? (
              <Button title="Start a goal" onPress={onCreateGoal} fullWidth style={styles.cta} />
            ) : null}
          </>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[6],
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing[5],
    alignItems: 'center',
    shadowColor: '#2C2820',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
  },
  art: { marginBottom: spacing[4] },
  title: { textAlign: 'center', marginBottom: spacing[2] },
  message: { textAlign: 'center', lineHeight: 22, marginBottom: spacing[4] },
  steps: {
    width: '100%',
    gap: spacing[2],
    marginBottom: spacing[5],
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    backgroundColor: colors.surfaceTint,
    borderRadius: radius.md,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
  },
  stepEmoji: { fontSize: 18, lineHeight: 22 },
  cta: { alignSelf: 'stretch' },
});
