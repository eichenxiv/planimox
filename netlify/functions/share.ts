import { getStore } from '@netlify/blobs';
import { parseXivtl } from '../../src/lib/fileIO';
import { saveFileToCsv } from '../../src/lib/shareCsv';
import type { SaveFile } from '../../src/types';

// Netlify Blobs
//   POST /.netlify/functions/share        body = SaveFile JSON   -> { id }
//   GET  /.netlify/functions/share?id=xxx                        -> SaveFile JSON

const MAX_BYTES = 1024 * 1024; // 1MB
const ID_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function genId(len = 10): string {
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  let out = '';
  for (let i = 0; i < len; i++) out += ID_CHARS[bytes[i] % ID_CHARS.length];
  return out;
}

const json = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });

export default async (req: Request): Promise<Response> => {
  const store = getStore('shares');

  if (req.method === 'POST') {
    const text = await req.text();
    if (text.length > MAX_BYTES) {
      return json({ error: '데이터가 너무 큽니다.' }, 413);
    }
    // parseXivtl 로 형식 검증 (클라이언트 저장 형식과 동일하게 재사용).
    let parsed;
    try {
      parsed = parseXivtl(text);
    } catch {
      return json({ error: '잘못 된 형식입니다.' }, 400);
    }
    if (parsed.kind !== 'full') {
      return json({ error: '잘못 된 형식입니다.' }, 400);
    }

    const id = genId();
    await store.setJSON(id, { v: 1, savefile: parsed.data, createdAt: Date.now() });
    return json({ id }, 201);
  }

  if (req.method === 'GET') {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    if (!id) return json({ error: 'id 가 필요합니다.' }, 400);

    const rec = (await store.get(id, { type: 'json' })) as
      | { savefile: SaveFile }
      | null;
    if (!rec) return json({ error: '공유 링크를 찾을 수 없습니다.' }, 404);

    if (url.searchParams.get('format') === 'csv') {
      return new Response(saveFileToCsv(rec.savefile), {
        status: 200,
        headers: { 'content-type': 'text/csv; charset=utf-8' },
      });
    }

    return json(rec.savefile);
  }

  return new Response('Method Not Allowed', { status: 405 });
};
