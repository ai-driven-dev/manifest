import type { APIRoute } from 'astro';
import { getStore } from '~/lib/store';

export const prerender = false;

const json = (data: unknown, status = 200): Response =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } });

export const GET: APIRoute = async () => {
  const store = getStore();
  return json({ ok: true, count: store.signatureCount() });
};

export const POST: APIRoute = async ({ request }) => {
  const store = getStore();
  let body: unknown;
  try { body = await request.json(); } catch { return json({ ok: false, error: 'invalid_json' }, 400); }
  const b = body as { name?: unknown; linkedin?: unknown };
  if (typeof b.name !== 'string') return json({ ok: false, error: 'name_required' }, 400);
  const linkedin = typeof b.linkedin === 'string' ? b.linkedin : undefined;
  try {
    const r = store.addSignature({ name: b.name, linkedin });
    return json({ ok: true, count: r.count, id: r.signature.id });
  } catch (e) {
    return json({ ok: false, error: (e as Error).message }, 400);
  }
};
