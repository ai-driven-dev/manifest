import type { Feedback, Signature, Store, TargetId, TargetType } from './types';

function makeId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function targetKey(t: TargetType, id: TargetId): string {
  return `${t}:${id}`;
}

export class MemoryStore implements Store {
  private signatures: Signature[] = [];
  private scores = new Map<string, number>();
  private feedback: Feedback[] = [];

  addSignature(input: { name: string; linkedin?: string }) {
    const name = input.name.trim();
    if (!name) throw new Error('name is required');
    if (name.length > 60) throw new Error('name too long');
    const sig: Signature = {
      id: makeId(),
      name,
      linkedin: input.linkedin?.trim() || undefined,
      createdAt: Date.now(),
    };
    this.signatures.push(sig);
    return { signature: sig, count: this.signatures.length };
  }

  signatureCount(): number {
    return this.signatures.length;
  }

  listSignatures(): Signature[] {
    return this.signatures.slice();
  }

  castVote(input: { targetType: TargetType; targetId: TargetId; value: 1 | -1 }) {
    if (input.value !== 1 && input.value !== -1) throw new Error('value must be 1 or -1');
    if (!input.targetId) throw new Error('targetId is required');
    if (input.targetType !== 'principle' && input.targetType !== 'value') throw new Error('invalid targetType');
    const key = targetKey(input.targetType, input.targetId);
    const next = (this.scores.get(key) ?? 0) + input.value;
    this.scores.set(key, next);
    return { score: next };
  }

  scoreFor(targetType: TargetType, targetId: TargetId): number {
    return this.scores.get(targetKey(targetType, targetId)) ?? 0;
  }

  addFeedback(input: { targetType: TargetType; targetId: TargetId; reason: string; alternative: string }) {
    const reason = input.reason.trim();
    const alternative = input.alternative.trim();
    if (!reason) throw new Error('reason is required');
    if (!alternative) throw new Error('alternative is required');
    if (input.targetType !== 'principle' && input.targetType !== 'value') throw new Error('invalid targetType');
    const fb: Feedback = {
      id: makeId(),
      targetType: input.targetType,
      targetId: input.targetId,
      reason,
      alternative,
      createdAt: Date.now(),
    };
    this.feedback.push(fb);
    return { feedback: fb };
  }

  listFeedback(): Feedback[] {
    return this.feedback.slice();
  }

  reset(): void {
    this.signatures = [];
    this.scores.clear();
    this.feedback = [];
  }
}
