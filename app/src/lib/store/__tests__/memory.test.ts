import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryStore } from '../memory';

describe('MemoryStore', () => {
  let s: MemoryStore;
  beforeEach(() => { s = new MemoryStore(); });

  describe('signatures', () => {
    it('adds a signature and returns count', () => {
      const r = s.addSignature({ name: 'Alex' });
      expect(r.count).toBe(1);
      expect(r.signature.name).toBe('Alex');
      expect(r.signature.id).toBeTruthy();
    });

    it('trims and rejects empty names', () => {
      expect(() => s.addSignature({ name: '   ' })).toThrow();
    });

    it('rejects names over 60 chars', () => {
      expect(() => s.addSignature({ name: 'a'.repeat(61) })).toThrow();
    });

    it('keeps a running count', () => {
      s.addSignature({ name: 'A' });
      s.addSignature({ name: 'B' });
      expect(s.signatureCount()).toBe(2);
      expect(s.listSignatures()).toHaveLength(2);
    });
  });

  describe('votes', () => {
    it('increments score on +1', () => {
      const r = s.castVote({ targetType: 'principle', targetId: 'P-1', value: 1 });
      expect(r.score).toBe(1);
    });

    it('decrements on -1', () => {
      s.castVote({ targetType: 'principle', targetId: 'P-1', value: 1 });
      const r = s.castVote({ targetType: 'principle', targetId: 'P-1', value: -1 });
      expect(r.score).toBe(0);
    });

    it('separates targets', () => {
      s.castVote({ targetType: 'principle', targetId: 'P-1', value: 1 });
      s.castVote({ targetType: 'value', targetId: 'V-1', value: 1 });
      expect(s.scoreFor('principle', 'P-1')).toBe(1);
      expect(s.scoreFor('value', 'V-1')).toBe(1);
      expect(s.scoreFor('principle', 'P-2')).toBe(0);
    });

    it('rejects invalid value', () => {
      expect(() => s.castVote({ targetType: 'principle', targetId: 'P-1', value: 2 as 1 })).toThrow();
    });

    it('rejects invalid targetType', () => {
      expect(() => s.castVote({ targetType: 'foo' as 'principle', targetId: 'P-1', value: 1 })).toThrow();
    });
  });

  describe('feedback', () => {
    it('records feedback', () => {
      const r = s.addFeedback({ targetType: 'principle', targetId: 'P-1', reason: 'r', alternative: 'a' });
      expect(r.feedback.id).toBeTruthy();
      expect(s.listFeedback()).toHaveLength(1);
    });

    it('rejects empty reason or alternative', () => {
      expect(() => s.addFeedback({ targetType: 'principle', targetId: 'P-1', reason: '', alternative: 'a' })).toThrow();
      expect(() => s.addFeedback({ targetType: 'principle', targetId: 'P-1', reason: 'r', alternative: '' })).toThrow();
    });
  });

  describe('reset', () => {
    it('clears all state', () => {
      s.addSignature({ name: 'A' });
      s.castVote({ targetType: 'principle', targetId: 'P-1', value: 1 });
      s.addFeedback({ targetType: 'principle', targetId: 'P-1', reason: 'r', alternative: 'a' });
      s.reset();
      expect(s.signatureCount()).toBe(0);
      expect(s.scoreFor('principle', 'P-1')).toBe(0);
      expect(s.listFeedback()).toHaveLength(0);
    });
  });
});
