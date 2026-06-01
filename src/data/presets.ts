import type { BossTimeline } from '../types';
import { uuid } from '../lib/timeUtils';
import { parseXivtl } from '../lib/fileIO';

//   - 목록:  public/presets/manifest.json ([{ id, label, file, category }, ...])
//   - 데이터: public/presets/<file>.xivtl
export interface PresetMeta {
  id: string;
  label: string;
  file: string;
  // 대분류 → 중분류 → 소분류 순의 분류 경로. 비우면 최상위에 표시.
  category?: string[];
}

export interface PresetGroup {
  name: string;
  groups: PresetGroup[];
  items: PresetMeta[];
}

const PRESETS_BASE = '/presets/';

export async function fetchPresetList(): Promise<PresetMeta[]> {
  const res = await fetch(`${PRESETS_BASE}manifest.json`);
  if (!res.ok) throw new Error(`프리셋 목록을 불러오지 못했습니다 (${res.status})`);
  return res.json();
}

export async function fetchPresetTimeline(meta: PresetMeta): Promise<BossTimeline> {
  const res = await fetch(`${PRESETS_BASE}${meta.file}`);
  if (!res.ok) throw new Error(`프리셋을 불러오지 못했습니다 (${res.status})`);
  const parsed = parseXivtl(await res.text());
  const tl = parsed.kind === 'full' ? parsed.data.bossTimeline : parsed.data;
  return {
    name: tl.name || meta.label,
    skills: tl.skills.map((sk) => ({ ...sk, id: uuid() })),
  };
}

export function groupPresets(list: PresetMeta[]): PresetGroup {
  const root: PresetGroup = { name: '', groups: [], items: [] };
  for (const meta of list) {
    let node = root;
    for (const level of meta.category ?? []) {
      let child = node.groups.find((g) => g.name === level);
      if (!child) {
        child = { name: level, groups: [], items: [] };
        node.groups.push(child);
      }
      node = child;
    }
    node.items.push(meta);
  }
  return root;
}
