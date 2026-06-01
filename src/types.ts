export type AttackAttribute = 'magic' | 'physical' | 'dark';

export type JobId =
  // Tank
  | 'PLD' | 'WAR' | 'DRK' | 'GNB'
  // Healer
  | 'WHM' | 'SCH' | 'AST' | 'SGE'
  // Melee DPS
  | 'MNK' | 'DRG' | 'NIN' | 'SAM' | 'RPR' | 'VPR'
  // Physical Ranged DPS
  | 'BRD' | 'MCH' | 'DNC'
  // Magical Ranged DPS
  | 'BLM' | 'SMN' | 'RDM' | 'PCT';

export type Role = 'tank' | 'healer' | 'melee' | 'ranged' | 'caster';
export type SlotRole = 'tank' | 'healer' | 'dealer';

export interface Job {
  id: JobId;
  name: string;
  role: Role;
  color: string;
}

export interface BossSkill {
  id: string;
  cast?: number;
  time: number; // 스킬 발동 시간 (시뮬레이션 기준값)
  name: string; // 스킬 이름
  attribute: AttackAttribute | null;
  damage: string;
  description: string;
}

export interface BossTimeline {
  name: string;
  skills: BossSkill[];
}

export interface JobSkill {
  id: string;
  jobId: JobId;
  name: string;
  nameKo?: string;
  iconId: number;
  durationSec: number;
  cooldownSec: number;
  targetable: boolean;
  maxCharges?: number;
}

export interface Character {
  index: number;
  name: string;
  jobId: JobId | null;
}

export interface Assignment {
  id: string;
  bossSkillId: string;
  casterCharIndex: number;
  targetCharIndex: number;
  jobSkillId: string;
  // 이 값이 있으면 jobSkillId 는 빈 문자열, 자유 텍스트 출력.
  customText?: string;
}

// 페이즈 전환 구분선
export const PHASE_END = 'END';

export interface PhaseDivider {
  id: string;
  label: string;
  beforeSkillId: string;
}

export interface SaveFile {
  version: 1;
  bossTimeline: BossTimeline;
  party: Character[];
  assignments: Assignment[];
  phaseDividers: PhaseDivider[];
}
