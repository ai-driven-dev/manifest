export type TargetType = 'principle' | 'value';
export type TargetId = string;

export interface Signature {
  id: string;
  name: string;
  linkedin?: string;
  createdAt: number;
}

export interface Vote {
  targetType: TargetType;
  targetId: TargetId;
  value: 1 | -1;
  createdAt: number;
}

export interface Feedback {
  id: string;
  targetType: TargetType;
  targetId: TargetId;
  reason: string;
  alternative: string;
  createdAt: number;
}

export interface Store {
  /** Sign the manifesto. Returns the resulting count. */
  addSignature(input: { name: string; linkedin?: string }): { signature: Signature; count: number };
  /** Total number of signatures. */
  signatureCount(): number;
  /** List signatures (most recent last). */
  listSignatures(): Signature[];

  /** Cast a vote. Returns aggregated score for that target. */
  castVote(input: { targetType: TargetType; targetId: TargetId; value: 1 | -1 }): { score: number };
  /** Aggregated score for a target. */
  scoreFor(targetType: TargetType, targetId: TargetId): number;

  /** Record feedback associated with a downvote. */
  addFeedback(input: { targetType: TargetType; targetId: TargetId; reason: string; alternative: string }): { feedback: Feedback };
  /** List feedback (testing/diag only). */
  listFeedback(): Feedback[];

  /** Reset all state — used in tests. */
  reset(): void;
}
