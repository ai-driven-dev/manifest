import { test, expect } from '@playwright/test';

test.describe('API', () => {
  test('signatures GET + POST', async ({ request }) => {
    const before = await request.get('/api/signatures');
    const beforeBody = await before.json();
    const beforeCount = beforeBody.count as number;

    const post = await request.post('/api/signatures', {
      data: { name: 'E2E User' },
      headers: { 'content-type': 'application/json' },
    });
    expect(post.ok()).toBeTruthy();
    const postBody = await post.json();
    expect(postBody.ok).toBe(true);
    expect(postBody.count).toBeGreaterThan(beforeCount);
  });

  test('vote endpoint', async ({ request }) => {
    const r = await request.post('/api/votes', {
      data: { targetType: 'principle', targetId: 'P-1', value: 1 },
      headers: { 'content-type': 'application/json' },
    });
    expect(r.ok()).toBeTruthy();
    const body = await r.json();
    expect(body.ok).toBe(true);
    expect(typeof body.score).toBe('number');
  });

  test('feedback endpoint', async ({ request }) => {
    const r = await request.post('/api/feedback', {
      data: { targetType: 'principle', targetId: 'P-1', reason: 'r', alternative: 'a' },
      headers: { 'content-type': 'application/json' },
    });
    expect(r.ok()).toBeTruthy();
    const body = await r.json();
    expect(body.ok).toBe(true);
  });

  test('rejects invalid vote value', async ({ request }) => {
    const r = await request.post('/api/votes', {
      data: { targetType: 'principle', targetId: 'P-1', value: 5 },
      headers: { 'content-type': 'application/json' },
    });
    expect(r.status()).toBe(400);
  });

  test('rejects empty signature name', async ({ request }) => {
    const r = await request.post('/api/signatures', {
      data: { name: '   ' },
      headers: { 'content-type': 'application/json' },
    });
    expect(r.status()).toBe(400);
  });
});
