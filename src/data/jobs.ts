import type { Job, JobId, Role, SlotRole } from '../types';

export const JOBS: Record<JobId, Job> = {
  // Tank
  PLD: { id: 'PLD', name: '나이트',     role: 'tank',   color: '#a8d2e6' },
  WAR: { id: 'WAR', name: '전사',       role: 'tank',   color: '#cf2621' },
  DRK: { id: 'DRK', name: '암흑기사',   role: 'tank',   color: '#d126cc' },
  GNB: { id: 'GNB', name: '건브레이커', role: 'tank',   color: '#796d30' },

  // Healer
  WHM: { id: 'WHM', name: '백마도사',   role: 'healer', color: '#fff0dc' },
  SCH: { id: 'SCH', name: '학자',       role: 'healer', color: '#8657ff' },
  AST: { id: 'AST', name: '점성술사',   role: 'healer', color: '#ffe74a' },
  SGE: { id: 'SGE', name: '현자',       role: 'healer', color: '#80a0f0' },

  // Melee DPS
  MNK: { id: 'MNK', name: '몽크',       role: 'melee',  color: '#d69c00' },
  DRG: { id: 'DRG', name: '용기사',     role: 'melee',  color: '#4164cd' },
  NIN: { id: 'NIN', name: '닌자',       role: 'melee',  color: '#af1964' },
  SAM: { id: 'SAM', name: '사무라이',   role: 'melee',  color: '#e46d04' },
  RPR: { id: 'RPR', name: '리퍼',       role: 'melee',  color: '#965a90' },
  VPR: { id: 'VPR', name: '바이퍼',     role: 'melee',  color: '#66b417' },

  // Physical Ranged DPS
  BRD: { id: 'BRD', name: '음유시인',   role: 'ranged', color: '#91ba5e' },
  MCH: { id: 'MCH', name: '기공사',     role: 'ranged', color: '#6ee1c6' },
  DNC: { id: 'DNC', name: '무도가',     role: 'ranged', color: '#e2b0af' },

  // Magical Ranged DPS
  BLM: { id: 'BLM', name: '흑마도사',   role: 'caster', color: '#a579d6' },
  SMN: { id: 'SMN', name: '소환사',     role: 'caster', color: '#2d9b78' },
  RDM: { id: 'RDM', name: '적마도사',   role: 'caster', color: '#e87b7b' },
  PCT: { id: 'PCT', name: '픽토맨서',   role: 'caster', color: '#fc92e1' },
};

const SLOT_OF_ROLE: Record<Role, SlotRole> = {
  tank: 'tank',
  healer: 'healer',
  melee: 'dealer',
  ranged: 'dealer',
  caster: 'dealer',
};

export const JOBS_BY_SLOT: Record<SlotRole, JobId[]> = (() => {
  const out: Record<SlotRole, JobId[]> = { tank: [], healer: [], dealer: [] };
  for (const job of Object.values(JOBS)) out[SLOT_OF_ROLE[job.role]].push(job.id);
  return out;
})();
