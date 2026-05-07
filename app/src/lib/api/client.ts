export interface SignSignatureInput { name: string; linkedin?: string }
export interface CastVoteInput { targetType: 'principle' | 'value'; targetId: string; value: 1 | -1 }
export interface SubmitFeedbackInput { targetType: 'principle' | 'value'; targetId: string; reason: string; alternative: string }

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  return (await res.json()) as T;
}

export async function signSignature(input: SignSignatureInput): Promise<{ ok: boolean; count?: number; error?: string }> {
  return postJson('/api/signatures', input);
}

export async function castVote(input: CastVoteInput): Promise<{ ok: boolean; score?: number; error?: string }> {
  return postJson('/api/votes', input);
}

export async function submitFeedback(input: SubmitFeedbackInput): Promise<{ ok: boolean; error?: string }> {
  return postJson('/api/feedback', input);
}

export async function getSignatureCount(): Promise<number> {
  const res = await fetch('/api/signatures');
  const data = (await res.json()) as { count?: number };
  return data.count ?? 0;
}
