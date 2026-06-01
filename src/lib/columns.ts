// 항상 표시 : 시전시작, 시전완료, 스킬명, (캐릭터 N명), 관리
// 선택 표시 : 속성, 피해량, 비고

import type { OptionalColumns } from '../store/useSettingsStore';

const LEADING_ALWAYS = 3; // 시전시작, 시전완료, 스킬명
const TRAILING = 1; // 관리

// 활성화 한 선택 표시 열
export function countOptional(o: OptionalColumns): number {
  return (o.attribute ? 1 : 0) + (o.damage ? 1 : 0) + (o.description ? 1 : 0);
}

export function timelineColSpan(partyLen: number, optionalCount: number): number {
  return LEADING_ALWAYS + optionalCount + partyLen + TRAILING;
}

// 고정 열 너비(px). table-layout:fixed 의 <colgroup> 에서 사용.
// 캐릭터 열은 width 를 지정하지 않아 남는 폭을 균등 분배.
export const COL_WIDTH = {
  castStart: 60,
  castEnd: 60,
  name: 120,
  attribute: 48,
  damage: 80,
  description: 160,
  actions: 60,
} as const;
