import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { formatProfileName } from '@/src/lib/challenge-display';
import { supabase } from '@/src/lib/supabase';
import { colors, spacing } from '@/src/theme';

interface ProfileRow {
  id: string;
  display_name: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
}

async function fetchInvitableProfiles(
  searchQuery: string,
): Promise<{ rows: ProfileRow[]; error?: string }> {
  const trimmed = searchQuery.trim();
  const { data, error } = await supabase.rpc('search_profiles_for_companion', {
    p_query: trimmed,
  });
  if (!error) {
    return { rows: (data ?? []) as ProfileRow[] };
  }

  // Fallback until migration is deployed: phone-only search.
  if (trimmed) {
    const digits = trimmed.replace(/\D/g, '');
    if (digits.length >= 10) {
      const legacy = await supabase.rpc('search_profiles_by_phone', { p_digits: digits });
      if (!legacy.error && legacy.data?.length) {
        return { rows: legacy.data as ProfileRow[] };
      }
    }
  }

  return { rows: [], error: formatRpcError(error.message) };
}

function formatRpcError(message: string): string {
  if (
    message.includes('search_profiles_for_companion') ||
    message.includes('Could not find the function') ||
    message.includes('PGRST202')
  ) {
    return 'Companion search is unavailable. Deploy backend migrations (search_profiles_for_companion).';
  }
  return message;
}

export interface SelectedCompanion {
  id: string;
  name: string;
  phone?: string | null;
}

interface Props {
  selected: SelectedCompanion[];
  onChange: (companions: SelectedCompanion[]) => void;
  error?: string;
  maxCompanions?: number;
}

function rowToCompanion(row: ProfileRow): SelectedCompanion {
  return {
    id: row.id,
    name: formatProfileName(row),
    phone: row.phone,
  };
}

export function CompanionPicker({
  selected,
  onChange,
  error,
  maxCompanions = 10,
}: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SelectedCompanion[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<'error' | 'success' | 'info'>('info');
  const selectedRef = useRef(selected);
  selectedRef.current = selected;

  const search = useCallback(async (searchQuery: string) => {
    setLoading(true);
    setMessage(null);
    try {
      const { rows, error: rpcError } = await fetchInvitableProfiles(searchQuery);

      if (rpcError && rows.length === 0) {
        setResults([]);
        setMessage(rpcError);
        setMessageTone('error');
        return;
      }

      const mapped = rows.map(rowToCompanion);
      const selectedIds = new Set(selectedRef.current.map((c) => c.id));
      setResults(mapped.filter((c) => !selectedIds.has(c.id)));

      if (mapped.length === 0) {
        setMessage('No users found. Try a different name or phone, or invite via SMS after saving.');
        setMessageTone('info');
      }
    } catch (e) {
      setResults([]);
      setMessage(e instanceof Error ? e.message : 'Search failed');
      setMessageTone('error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => search(query), query.trim() ? 300 : 0);
    return () => clearTimeout(timer);
  }, [query, search]);

  useEffect(() => {
    const selectedIds = new Set(selected.map((c) => c.id));
    setResults((prev) => prev.filter((c) => !selectedIds.has(c.id)));
  }, [selected]);

  const addCompanion = (companion: SelectedCompanion) => {
    if (selected.some((c) => c.id === companion.id)) {
      setMessage(`${companion.name} is already added.`);
      setMessageTone('info');
      return;
    }
    if (selected.length >= maxCompanions) {
      setMessage(`Maximum ${maxCompanions} companions allowed.`);
      setMessageTone('error');
      return;
    }
    onChange([...selected, companion]);
    setQuery('');
    setMessage(`${companion.name} added.`);
    setMessageTone('success');
    setResults((prev) => prev.filter((c) => c.id !== companion.id));
  };

  const removeCompanion = (id: string) => {
    onChange(selected.filter((c) => c.id !== id));
    setMessage(null);
  };

  return (
    <View>
      <Text style={styles.label}>Search companions</Text>
      <TextInput
        style={[styles.input, error ? styles.inputError : null]}
        placeholder="Name or phone number"
        value={query}
        onChangeText={setQuery}
        autoCapitalize="words"
        autoCorrect={false}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {message ? (
        <Text
          style={[
            styles.message,
            messageTone === 'error' && styles.messageError,
            messageTone === 'success' && styles.messageSuccess,
          ]}>
          {message}
        </Text>
      ) : null}

      {selected.length > 0 && (
        <View style={styles.chips}>
          {selected.map((c) => (
            <View key={c.id} style={styles.chip}>
              <Text style={styles.chipText}>{c.name}</Text>
              <Pressable
                onPress={() => removeCompanion(c.id)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={`Remove ${c.name}`}>
                <Text style={styles.chipRemove}>×</Text>
              </Pressable>
            </View>
          ))}
        </View>
      )}

      <Text style={styles.resultsLabel}>
        {query.trim() ? 'Search results' : 'Available users'}
      </Text>
      {loading ? (
        <ActivityIndicator style={styles.loader} />
      ) : results.length > 0 ? (
        <View style={styles.results}>
          {results.map((c) => (
            <Pressable key={c.id} style={styles.resultRow} onPress={() => addCompanion(c)}>
              <View style={styles.resultText}>
                <Text style={styles.resultName}>{c.name}</Text>
                {c.phone ? <Text style={styles.resultPhone}>{c.phone}</Text> : null}
              </View>
              <Text style={styles.addLabel}>Add</Text>
            </Pressable>
          ))}
        </View>
      ) : !loading && !message ? (
        <Text style={styles.empty}>No users to show.</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 14, color: colors.textMuted, marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 4,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
  },
  inputError: { borderColor: colors.gentleAlert },
  errorText: { color: colors.gentleAlert, fontSize: 12, marginBottom: 8 },
  message: { fontSize: 13, color: colors.textMuted, marginBottom: 8 },
  messageError: { color: colors.gentleAlert },
  messageSuccess: { color: colors.primary },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2], marginBottom: spacing[3], marginTop: 4 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.companionMuted,
    borderRadius: 16,
    paddingVertical: 6,
    paddingLeft: 12,
    paddingRight: 8,
  },
  chipText: { fontSize: 13, color: colors.companion, fontWeight: '500' },
  chipRemove: { fontSize: 18, color: colors.textMuted, lineHeight: 20 },
  resultsLabel: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 6 },
  loader: { marginVertical: 12 },
  results: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceTint,
    backgroundColor: colors.surface,
  },
  resultText: { flex: 1, marginRight: 8 },
  resultName: { fontSize: 15, fontWeight: '500', color: colors.textPrimary },
  resultPhone: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  addLabel: { fontSize: 14, color: colors.primary, fontWeight: '600' },
  empty: { fontSize: 13, color: colors.textMuted, marginBottom: 8 },
});
