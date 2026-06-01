import type { Assignment, BossSkill, JobSkill } from '../types';
import { JOB_SKILLS_BY_ID } from '../data/jobSkills';

export type PickerState = 'available' | 'cooldown' | 'already-picked';

export interface ActiveEffect {
  assignment: Assignment;
  jobSkill: JobSkill;
  startedAt: number;
}

export interface ComputeCtx {
  assignments: Assignment[];
  // bossSkillId → 완료 시각. rows.find 반복(O(rows))을 피하려 한 번만 인덱싱한다.
  timeById: Map<string, number>;
}

// 한 번만 만들어 모든 행/캐릭터 계산에 재사용한다(표 전체에서 1회).
export function makeCtx(rows: BossSkill[], assignments: Assignment[]): ComputeCtx {
  const timeById = new Map<string, number>();
  for (const r of rows) timeById.set(r.id, r.time);
  return { assignments, timeById };
}

function bossTimeOf(ctx: ComputeCtx, bossSkillId: string): number | null {
  return ctx.timeById.get(bossSkillId) ?? null;
}

/**
 * targetCharIndex === C, startedAt <= T < startedAt + duration
 */
export function activeEffectsAt(
  ctx: ComputeCtx,
  row: BossSkill,
  charIndex: number,
): ActiveEffect[] {
  const T = row.time;
  const out: ActiveEffect[] = [];
  for (const a of ctx.assignments) {
    if (a.targetCharIndex !== charIndex) continue;
    const startedAt = bossTimeOf(ctx, a.bossSkillId);
    if (startedAt == null) continue;
    if (startedAt > T) continue;
    const skill = JOB_SKILLS_BY_ID[a.jobSkillId];
    if (!skill) continue;
    if (startedAt + skill.durationSec >= T) {
      out.push({ assignment: a, jobSkill: skill, startedAt });
    }
  }
  return out;
}

/**
 * bossSkillId === R.id 이고 casterCharIndex === C
 */
export function assignmentsAtRow(
  ctx: ComputeCtx,
  rowId: string,
  charIndex: number,
): Assignment[] {
  return ctx.assignments.filter(
    (a) => a.bossSkillId === rowId && a.casterCharIndex === charIndex,
  );
}

/**
 * 행 R 에서 캐릭터 C 가 스킬 S 선택 가능 여부 확인
 * - 같은 행에 이미 같은 스킬이 배정되어 있으면 'already-picked'
 * - C 가 caster 였던 가장 최근 같은 스킬 사용시점 + cooldown > T 면 'cooldown'
 * - 그렇지 않으면 'available'
 */
export function pickerStateFor(
  ctx: ComputeCtx,
  row: BossSkill,
  charIndex: number,
  skill: JobSkill,
): PickerState {
  const T = row.time;

  for (const a of ctx.assignments) {
    if (a.bossSkillId === row.id && a.casterCharIndex === charIndex && a.jobSkillId === skill.id) {
      return 'already-picked';
    }
  }

  // Stack형 스킬 지원: cooldownSec 뒤 개별 충전
  // T 시점에 아직 충전되지 않은 스킬 수가 최대 스택 이상이면 사용 불가.
  const maxCharges = skill.maxCharges ?? 1;
  let onCooldown = 0;
  for (const a of ctx.assignments) {
    if (a.casterCharIndex !== charIndex) continue;
    if (a.jobSkillId !== skill.id) continue;
    const startedAt = bossTimeOf(ctx, a.bossSkillId);
    if (startedAt == null) continue;
    if (startedAt > T) continue;
    if (startedAt + skill.cooldownSec > T) onCooldown++;
  }
  if (onCooldown >= maxCharges) return 'cooldown';
  return 'available';
}
