import type { Assignment, Character, JobSkill } from '../types';
import { JOB_SKILLS_BY_ID } from '../data/jobSkills';

export interface ResolvedAssignment {
  // 직업 스킬 배정이면 해당 스킬, 자유 입력(customText)이면 null.
  skill: JobSkill | null;
  label: string;
  targetName: string | null;
}

export function resolveAssignment(a: Assignment, party: Character[]): ResolvedAssignment {
  const skill = JOB_SKILLS_BY_ID[a.jobSkillId] ?? null;
  if (!skill) {
    return { skill: null, label: a.customText ?? '', targetName: null };
  }
  const targetName =
    a.targetCharIndex !== a.casterCharIndex
      ? party.find((c) => c.index === a.targetCharIndex)?.name ?? '?'
      : null;
  return { skill, label: skill.nameKo ?? skill.name, targetName };
}

export function assignmentText(a: Assignment, party: Character[]): string {
  const r = resolveAssignment(a, party);
  return r.targetName ? `${r.label} → ${r.targetName}` : r.label;
}
