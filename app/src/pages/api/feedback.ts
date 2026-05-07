import type { APIRoute } from 'astro';
import { getStore } from '~/lib/store';

export const prerender = false;

const json = (data: unknown, status = 200): Response =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } });

export const POST: APIRoute = async ({ request }) => {
  const store = getStore();
  let body: unknown;
  try { body = await request.json(); } catch { return json({ ok: false, error: 'invalid_json' }, 400); }
  const b = body as { targetType?: unknown; targetId?: unknown; reason?: unknown; alternative?: unknown };
  if (b.targetType !== 'principle' && b.targetType !== 'value') return json({ ok: false, error: 'invalid_targetType' }, 400);
  if (typeof b.targetId !== 'string' || !b.targetId) return json({ ok: false, error: 'invalid_targetId' }, 400);
  if (typeof b.reason !== 'string' || !b.reason.trim()) return json({ ok: false, error: 'reason_required' }, 400);
  if (typeof b.alternative !== 'string' || !b.alternative.trim()) return json({ ok: false, error: 'alternative_required' }, 400);
  try {
    store.addFeedback({ targetType: b.targetType, targetId: b.targetId, reason: b.reason, alternative: b.alternative });
    return json({ ok: true });
  } catch (e) {
    return json({ ok: false, error: (e as Error).message }, 400);
  }
};
