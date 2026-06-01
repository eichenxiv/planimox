import type { SaveFile, BossTimeline } from '../types';

function download(filename: string, json: string): void {
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function saveXivtl(state: SaveFile, baseName?: string): void {
  const name = (baseName ?? state.bossTimeline.name ?? 'timeline').replace(/[\\/:*?"<>|]/g, '_');
  download(`${name}.xivtl`, JSON.stringify(state, null, 2));
}

function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => resolve(String(reader.result));
    reader.readAsText(file);
  });
}

export type LoadResult =
  | { kind: 'full'; data: SaveFile }
  | { kind: 'boss'; data: BossTimeline };

// .xivtl 포맷 파싱
export function parseXivtl(text: string): LoadResult {
  const data = JSON.parse(text);
  if (!data || typeof data !== 'object') throw new Error('파일을 해석할 수 없습니다');

  if (
    data.bossTimeline &&
    Array.isArray(data.bossTimeline.skills) &&
    Array.isArray(data.party) &&
    Array.isArray(data.assignments)
  ) {
    return { kind: 'full', data: data as SaveFile };
  }

  const tl = data.bossTimeline;
  if (tl && Array.isArray(tl.skills)) {
    return { kind: 'boss', data: { name: tl.name ?? '가져온 타임라인', skills: tl.skills } };
  }

  throw new Error('인식할 수 없는 .xivtl 형식입니다');
}

export async function loadXivtlAny(file: File): Promise<LoadResult> {
  return parseXivtl(await readFile(file));
}
