import type { SaveFile } from '../types';
import { parseXivtl } from './fileIO';

// Netlify Blobs 활용 공유 API
const ENDPOINT = '/.netlify/functions/share';
const SHARE_PREFIX = '/s/';

// 현재 구성을 서버에 저장 후 공유 링크 반환. 실패 시 throw.
export async function createShare(state: SaveFile): Promise<string> {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(state),
  });
  if (!res.ok) {
    const msg = await res
      .json()
      .then((d) => d?.error)
      .catch(() => null);
    throw new Error(msg ?? `요청 실패 (${res.status})`);
  }
  const { id } = (await res.json()) as { id: string };
  return `${location.origin}${SHARE_PREFIX}${id}`;
}

// 현재 경로가 /s/:id 면 서버에서 SaveFile 을 받아 복원용으로 반환. 아니거나 실패 시 null.
export async function readSharePath(): Promise<SaveFile | null> {
  if (!location.pathname.startsWith(SHARE_PREFIX)) return null;
  const id = location.pathname.slice(SHARE_PREFIX.length).split('/')[0];
  if (!id) return null;

  try {
    const res = await fetch(`${ENDPOINT}?id=${encodeURIComponent(id)}`);
    if (!res.ok) return null;
    const text = await res.text();
    const parsed = parseXivtl(text);
    return parsed.kind === 'full' ? parsed.data : null;
  } catch {
    return null;
  }
}
