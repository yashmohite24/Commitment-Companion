import { supabase } from './supabase';

export class ChallengeActionError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message);
  }
}

export async function invokeChallengeAction<T = unknown>(
  action: string,
  payload: Record<string, unknown> = {},
): Promise<T> {
  const { data, error } = await supabase.functions.invoke('challenge-actions', {
    body: { action, payload },
  });

  if (error) {
    throw new ChallengeActionError(error.message);
  }
  if (data?.error) {
    throw new ChallengeActionError(data.error);
  }
  return data as T;
}

export async function submitFeedback(header: string, message: string) {
  const { data, error } = await supabase.functions.invoke('submit-feedback', {
    body: { header, message },
  });
  if (error) throw new ChallengeActionError(error.message);
  if (data?.error) throw new ChallengeActionError(data.error);
  return data;
}
