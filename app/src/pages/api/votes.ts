import type { APIRoute } from 'astro';
import { getStore } from '~/lib/store';

export const prerender = false;

const json = (data: unknown, status = 200): Response =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } });

export const POST: APIRoute = async ({ request }) => {
  const store = getStore();
  let body: unknown;
  try { body = await request.json(); } catch { return json({ ok: false, error: 'invalid_json' }, 400); }
  const b = body as { targetType?: unknown; targetId?: unknown; value?: unknown };
  if (b.targetType !== 'principle' && b.targetType !== 'value') return json({ ok: false, error: 'invalid_targetType' }, 400);
  if (typeof b.targetId !== 'string' || !b.targetId) return json({ ok: false, error: 'invalid_targetId' }, 400);
  if (b.value !== 1 && b.value !== -1) return json({ ok: false, error: 'invalid_value' }, 400);
  try {
    const r = store.castVote({ targetType: b.targetType, targetId: b.targetId, value: b.value });
    return json({ ok: true, score: r.score });
  } catch (e) {
    return json({ ok: false, error: (e as Error).message }, 400);
  }
};
