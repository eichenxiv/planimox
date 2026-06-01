import type { JobId, JobSkill } from '../types';

export function iconUrl(iconId: number): string {
  const folder = Math.floor(iconId / 1000) * 1000;
  const f = String(folder).padStart(6, '0');
  const i = String(iconId).padStart(6, '0');
  const path = `ui/icon/${f}/${i}.tex`;
  return `https://v2.xivapi.com/api/asset?path=${encodeURIComponent(path)}&format=png`;
}

interface SkillDef {
  id: string;
  name: string;
  nameKo?: string;
  iconId: number;
  durationSec: number;
  cooldownSec: number;
  targetable: boolean;
  maxCharges?: number;
}

// durationSec=0 인 항목은 "발동 즉시 효과"
const RAW: Record<JobId, SkillDef[]> = {
  // =========================================================================
  // Tank
  // =========================================================================
  PLD: [
    { id: 'PLD_Rampart',         name: 'Rampart',        nameKo: '철벽 방어',     iconId: 801,   durationSec: 20, cooldownSec: 90,  targetable: false },
    { id: 'PLD_Bulwark',         name: 'Bulwark',        nameKo: '방패 각성',     iconId: 167,   durationSec: 10, cooldownSec: 90,  targetable: false },
    { id: 'PLD_Sentinel',        name: 'Guardian',       nameKo: '극한 방어',     iconId: 2524,  durationSec: 15, cooldownSec: 120, targetable: false },
    { id: 'PLD_HolySheltron',    name: 'Holy Sheltron',  nameKo: '신성한 방벽',   iconId: 2950,  durationSec: 8,  cooldownSec: 5,   targetable: false },
    { id: 'PLD_Intervention',    name: 'Intervention',   nameKo: '중재',          iconId: 2512,  durationSec: 8,  cooldownSec: 10,  targetable: true },
    { id: 'PLD_HallowedGround',  name: 'Hallowed Ground',nameKo: '천하무적',      iconId: 2502,  durationSec: 10, cooldownSec: 420, targetable: false },
    { id: 'PLD_Reprisal',        name: 'Reprisal',       nameKo: '앙갚음',        iconId: 806,   durationSec: 15, cooldownSec: 60,  targetable: false },
    { id: 'PLD_DivineVeil',      name: 'Divine Veil',    nameKo: '신성한 보호막', iconId: 2508,  durationSec: 30, cooldownSec: 90,  targetable: false },
    { id: 'PLD_PassageOfArms',   name: 'Passage of Arms',nameKo: '결연한 수호자', iconId: 2515,  durationSec: 18, cooldownSec: 120, targetable: false },
    { id: 'PLD_Cover',           name: 'Cover',          nameKo: '감싸기',        iconId: 2501,  durationSec: 12, cooldownSec: 120, targetable: true },
    { id: 'PLD_ArmsLength',      name: 'Arm\'s Length',  nameKo: '거리 유지',     iconId: 822,    durationSec: 6,  cooldownSec: 120, targetable: false },
  ],
  WAR: [
    { id: 'WAR_Rampart',         name: 'Rampart',        nameKo: '철벽 방어',      iconId: 801,   durationSec: 20, cooldownSec: 90,  targetable: false },
    { id: 'WAR_Damnation',       name: 'Damnation',      nameKo: '지옥행',         iconId: 2573,  durationSec: 15, cooldownSec: 120, targetable: false },
    { id: 'WAR_ThrillOfBattle',  name: 'Thrill of Battle',nameKo:'전투의 짜릿함',  iconId: 263,   durationSec: 10, cooldownSec: 90,  targetable: false },
    { id: 'WAR_Equilibrium',     name: 'Equilibrium',    nameKo: '평정심',         iconId: 2560,  durationSec: 15, cooldownSec: 60,  targetable: false },
    { id: 'WAR_Bloodwhetting',   name: 'Bloodwhetting',  nameKo: '원초의 혈기',    iconId: 2569,  durationSec: 8,  cooldownSec: 25,  targetable: false },
    { id: 'WAR_NascentFlash',    name: 'Nascent Flash',  nameKo: '원초의 분노',    iconId: 2567,  durationSec: 8,  cooldownSec: 25,  targetable: true },
    { id: 'WAR_Holmgang',        name: 'Holmgang',       nameKo: '일대일전투',     iconId: 266,   durationSec: 10, cooldownSec: 240, targetable: false },
    { id: 'WAR_Reprisal',        name: 'Reprisal',       nameKo: '앙갚음',         iconId: 806,   durationSec: 15, cooldownSec: 60,  targetable: false },
    { id: 'WAR_ShakeItOff',      name: 'Shake It Off',   nameKo: '뿌리치기',       iconId: 2563,  durationSec: 30, cooldownSec: 90,  targetable: false },
    { id: 'WAR_ArmsLength',      name: 'Arm\'s Length',  nameKo: '거리 유지',      iconId: 822,    durationSec: 6,  cooldownSec: 120, targetable: false },

  ],
  DRK: [
    { id: 'DRK_Rampart',         name: 'Rampart',        nameKo: '철벽 방어',      iconId: 801,   durationSec: 20, cooldownSec: 90,  targetable: false },
    { id: 'DRK_Reprisal',        name: 'Reprisal',       nameKo: '앙갚음',         iconId: 806,   durationSec: 15, cooldownSec: 60,  targetable: false },
    { id: 'DRK_ShadowWall',      name: 'Shadowed Vigil', nameKo: '그림자 요새',    iconId: 3094,  durationSec: 15, cooldownSec: 120, targetable: false },
    { id: 'DRK_DarkMind',        name: 'Dark Mind',      nameKo: '어두운 감정',    iconId: 3076,  durationSec: 10, cooldownSec: 60,  targetable: false },
    { id: 'DRK_LivingDead',      name: 'Living Dead',    nameKo: '산송장',         iconId: 3077,  durationSec: 10, cooldownSec: 300, targetable: false },
    { id: 'DRK_TheBlackestNight',name: 'The Blackest Night',nameKo:'흑야',         iconId: 3081,  durationSec: 7,  cooldownSec: 15,  targetable: true },
    { id: 'DRK_Oblation',        name: 'Oblation',       nameKo: '헌신',           iconId: 3089,  durationSec: 10, cooldownSec: 60,  targetable: true,  maxCharges: 2 },
    { id: 'DRK_DarkMissionary',  name: 'Dark Missionary',nameKo: '어둠의 포교자',  iconId: 3087,  durationSec: 15, cooldownSec: 90,  targetable: false },
    { id: 'DRK_ArmsLength',      name: 'Arm\'s Length',  nameKo: '거리 유지',    iconId: 822,    durationSec: 6,  cooldownSec: 120, targetable: false },

  ],
  GNB: [
    { id: 'GNB_Rampart',         name: 'Rampart',        nameKo: '램파트',         iconId: 801,   durationSec: 20, cooldownSec: 90,  targetable: false },
    { id: 'GNB_Reprisal',        name: 'Reprisal',       nameKo: '앙갚음',         iconId: 806,   durationSec: 15, cooldownSec: 60,  targetable: false },
    { id: 'GNB_Camouflage',      name: 'Camouflage',     nameKo: '위장술',         iconId: 3404,  durationSec: 20, cooldownSec: 90,  targetable: false },
    { id: 'GNB_Nebula',          name: 'Great Nebula',   nameKo: '대성운',         iconId: 3435,  durationSec: 15, cooldownSec: 120, targetable: false },
    { id: 'GNB_Superbolide',     name: 'Superbolide',    nameKo: '폭발 유성',      iconId: 3416,  durationSec: 10, cooldownSec: 360, targetable: false },
    { id: 'GNB_HeartOfLight',    name: 'Heart of Light', nameKo: '빛의 심장',      iconId: 3424,  durationSec: 15, cooldownSec: 90,  targetable: false },
    { id: 'GNB_HeartOfCorundum', name: 'Heart of Corundum',nameKo:'돌의 심장',     iconId: 3425,  durationSec: 8,  cooldownSec: 25,  targetable: true },
    { id: 'GNB_Aurora',          name: 'Aurora',         nameKo: '오로라',         iconId: 3415,  durationSec: 18, cooldownSec: 60,  targetable: true,  maxCharges: 2 },
    { id: 'GNB_ArmsLength',      name: 'Arm\'s Length',  nameKo: '거리 유지',    iconId: 822,    durationSec: 6,  cooldownSec: 120, targetable: false },
  ],

  // =========================================================================
  // Healer
  // =========================================================================
  WHM: [
    { id: 'WHM_Temperance',      name: 'Temperance',     nameKo: '절제',           iconId: 2645,  durationSec: 22, cooldownSec: 120, targetable: false },
    { id: 'WHM_Aquaveil',        name: 'Aquaveil',       nameKo: '물의 장막',      iconId: 2648, durationSec: 8,  cooldownSec: 60,  targetable: false },
    { id: 'WHM_DivineBenison',   name: 'Divine Benison', nameKo: '신성한 축복',    iconId: 2638,  durationSec: 15, cooldownSec: 30,  targetable: false, maxCharges: 2 },
    { id: 'WHM_Asylum',          name: 'Asylum',         nameKo: '성소',           iconId: 2632,  durationSec: 24, cooldownSec: 90,  targetable: false },
    { id: 'WHM_Assize',          name: 'Assize',         nameKo: '심판',           iconId: 2634,  durationSec: 24, cooldownSec: 90,  targetable: false },
    { id: 'WHM_LiturgyOfTheBell',name: 'Liturgy of the Bell',nameKo:'예배종',      iconId: 2649, durationSec: 20, cooldownSec: 180, targetable: false },
    { id: 'WHM_PlenaryIndulgence',name:'Plenary Indulgence',nameKo:'대사면',       iconId: 2639,  durationSec: 10, cooldownSec: 60,  targetable: false },
    // { id: 'WHM_DivineCaress',    name: 'Divine Caress',  nameKo: '신성한 손길',    iconId: 2128, durationSec: 10, cooldownSec: 1,   targetable: false },
    { id: 'WHM_Surecast',        name: 'Surecast',       nameKo: '견고한 마법',    iconId: 869,  durationSec: 6,  cooldownSec: 120, targetable: false },
  ],
  SCH: [
    { id: 'SCH_SacredSoil',      name: 'Sacred Soil',    nameKo: '야전치유진',     iconId: 2804,  durationSec: 15,cooldownSec: 30,  targetable: false },
    { id: 'SCH_Expedient',       name: 'Expedient',      nameKo: '질풍노도계',     iconId: 2878, durationSec: 20, cooldownSec: 120, targetable: false },
    { id: 'SCH_Recitation',      name: 'Recitation',     nameKo: '비책',           iconId: 2822,  durationSec: 15,cooldownSec: 90,  targetable: false },
    { id: 'SCH_FeyIllumination', name: 'Fey Illumination',nameKo:'요정의 광휘',    iconId: 2853,  durationSec: 20,cooldownSec: 120, targetable: false },
    { id: 'SCH_WhisperingDawn',  name: 'Whispering Dawn',nameKo: '빛의 속삭임',    iconId: 2852,  durationSec: 21,cooldownSec: 60,  targetable: false },
    { id: 'SCH_Protraction',     name: 'Protraction',    nameKo: '생명회생술',     iconId: 2877, durationSec: 10, cooldownSec: 60,  targetable: false },
    { id: 'SCH_SummonSeraph',    name: 'Summon Seraph',      nameKo: '세라핌 소환',iconId: 2850, durationSec: 22, cooldownSec: 180, targetable: false },
    { id: 'SCH_Consolation',    name: 'Consolation',      nameKo: '위안',          iconId: 2851, durationSec: 30, cooldownSec: 30, targetable: false, maxCharges: 2 },
    { id: 'SCH_Seraphism',       name: 'Seraphism',      nameKo: '세라피즘',       iconId: 2881, durationSec: 20, cooldownSec: 180, targetable: false },
    { id: 'SCH_DeploymentTactics',name:'Deployment Tactics',nameKo:'전개전술',     iconId: 2808, durationSec: 0,  cooldownSec: 90,  targetable: false },
    { id: 'SCH_Surecast',        name: 'Surecast',       nameKo: '견고한 마법',    iconId: 869,  durationSec: 6,  cooldownSec: 120, targetable: false },

  ],
  AST: [
    { id: 'AST_CollectiveUnconscious',  name:'Collective Unconscious',nameKo:'운명의 수레바퀴', iconId: 3140, durationSec: 18, cooldownSec: 60, targetable: false },
    { id: 'AST_CelestialOpposition',    name:'Celestial Opposition',  nameKo:'천궁의 반목',     iconId: 3142, durationSec: 0,  cooldownSec: 60, targetable: false },
    { id: 'AST_CelestialIntersection',  name:'Celestial Intersection',nameKo:'천궁의 교차',     iconId: 3556, durationSec: 0,  cooldownSec: 30, targetable: false, maxCharges: 2 },
    { id: 'AST_Synastry',               name: 'Synastry',             nameKo:'궁합',            iconId: 3139, durationSec: 20, cooldownSec: 120, targetable: false },
    { id: 'AST_EarthlyStar',            name: 'Earthly Star',         nameKo: '지상의 별',      iconId: 3143, durationSec: 10, cooldownSec: 60,  targetable: false },
    { id: 'AST_Macrocosmos',            name: 'Macrocosmos',          nameKo: '대우주',         iconId: 3562, durationSec: 15, cooldownSec: 180, targetable: false },
    { id: 'AST_NeutralSect',            name: 'Neutral Sect',         nameKo: '하루별읽기',     iconId: 3552, durationSec: 20, cooldownSec: 120, targetable: false },
    { id: 'AST_Exaltation',             name: 'Exaltation',           nameKo: '성위 격상',      iconId: 3561, durationSec: 8,  cooldownSec: 60,  targetable: false },
    { id: 'AST_Divination',             name: 'Divination',           nameKo: '점복',           iconId: 3553, durationSec: 0,  cooldownSec: 120, targetable: false },
    { id: 'AST_Horoscope',              name: 'Horoscope',            nameKo: '별점운',         iconId: 3550, durationSec: 0,  cooldownSec: 60,  targetable: false },
    { id: 'AST_Surecast',               name: 'Surecast',             nameKo: '견고한 마법',    iconId: 869,  durationSec: 6,  cooldownSec: 120, targetable: false },
  ],
  SGE: [
    { id: 'SGE_Ixochole',        name: 'Ixochole',       nameKo: '익소콜레',       iconId: 3667, durationSec: 0, cooldownSec: 30,  targetable: false },
    { id: 'SGE_Kerachole',       name: 'Kerachole',      nameKo: '케이라콜레',       iconId: 3666, durationSec: 15, cooldownSec: 30,  targetable: false },
    { id: 'SGE_Taurochole',      name: 'Taurochole',     nameKo: '타우로콜레',       iconId: 3671, durationSec: 15, cooldownSec: 45,  targetable: false },
    { id: 'SGE_Zoe',             name: 'Zoe',            nameKo: '생명력',       iconId: 3668, durationSec: 30, cooldownSec: 90,  targetable: false },
    { id: 'SGE_Holos',           name: 'Holos',          nameKo: '전체론',         iconId: 3678, durationSec: 20, cooldownSec: 120, targetable: false },
    { id: 'SGE_Pepsis',          name: 'Pepsis',         nameKo: '소화 작용',       iconId: 3669, durationSec: 0, cooldownSec: 30,  targetable: false },
    { id: 'SGE_Panhaima',        name: 'Panhaima',       nameKo: '온혈액',       iconId: 3679, durationSec: 15, cooldownSec: 120, targetable: false },
    { id: 'SGE_PhysisII',        name: 'Physis II',      nameKo: '퓌시스 2',      iconId: 3670, durationSec: 15, cooldownSec: 60,  targetable: false },
    { id: 'SGE_Haima',           name: 'Haima',          nameKo: '혈액',         iconId: 3673, durationSec: 15, cooldownSec: 120, targetable: false },
    { id: 'SGE_Krasis',          name: 'Krasis',         nameKo: '체액 혼화',      iconId: 3685, durationSec: 10, cooldownSec: 60,  targetable: false },
    { id: 'SGE_PhlegmaIII',      name: 'Phlegma III',    nameKo: '플레그마 3',       iconId: 3681, durationSec: 0, cooldownSec: 40,  targetable: false, maxCharges: 2 },
    { id: 'SGE_Pneuma',          name: 'Pneuma',         nameKo: '프네우마',      iconId: 3686, durationSec: 0, cooldownSec: 120, targetable: false },
    { id: 'SGE_Philosophia',     name: 'Philosophia',    nameKo: '필로소피아',     iconId: 3690, durationSec: 20, cooldownSec: 180, targetable: false },
    { id: 'SGE_Soteria',         name: 'Soteria',        nameKo: '구조',       iconId: 3662, durationSec: 15, cooldownSec: 60,  targetable: false },
    { id: 'SGE_Surecast',        name: 'Surecast',       nameKo: '견고한 마법',    iconId: 869,  durationSec: 6,  cooldownSec: 120, targetable: false },

  ],

  // =========================================================================
  // Melee DPS
  // =========================================================================
  MNK: [
    { id: 'MNK_Mantra',          name: 'Mantra',         nameKo: '만트라',         iconId: 209,   durationSec: 15, cooldownSec: 90,  targetable: false },
    // { id: 'MNK_Brotherhood',     name: 'Brotherhood',    nameKo: '도원결의',       iconId: 2542,  durationSec: 20, cooldownSec: 120, targetable: false },
    // { id: 'MNK_RiddleOfFire',    name: 'Riddle of Fire', nameKo: '홍련의 극의',    iconId: 2541,  durationSec: 20, cooldownSec: 60,  targetable: false },
    { id: 'MNK_Feint',           name: 'Feint',          nameKo: '견제',           iconId: 828,   durationSec: 15, cooldownSec: 90,  targetable: false },
    { id: 'MNK_ArmsLength',      name: 'Arm\'s Length',  nameKo: '거리 유지',    iconId: 822,    durationSec: 6,  cooldownSec: 120, targetable: false },

  ],
  DRG: [
    // { id: 'DRG_BattleLitany',    name: 'Battle Litany',  nameKo: '전투 기도',      iconId: 2585,  durationSec: 15, cooldownSec: 120, targetable: false },
    { id: 'DRG_Feint',           name: 'Feint',          nameKo: '견제',           iconId: 828,   durationSec: 15, cooldownSec: 90,  targetable: false },
    { id: 'DRG_ArmsLength',      name: 'Arm\'s Length',  nameKo: '거리 유지',    iconId: 822,    durationSec: 6,  cooldownSec: 120, targetable: false },
  ],
  NIN: [
    // { id: 'NIN_Dokumori',        name: 'Dokumori',       nameKo: '강탈',           iconId: 619,   durationSec: 20, cooldownSec: 120, targetable: false },
    // { id: 'NIN_KunaisBane',      name: "Kunai's Bane",   nameKo: '백뢰총',         iconId: 620,   durationSec: 15, cooldownSec: 60,  targetable: false },
    { id: 'NIN_Feint',           name: 'Feint',          nameKo: '견제',           iconId: 828,   durationSec: 15, cooldownSec: 90,  targetable: false },
    { id: 'NIN_ArmsLength',      name: 'Arm\'s Length',  nameKo: '거리 유지',    iconId: 822,    durationSec: 6,  cooldownSec: 120, targetable: false },
  ],
  SAM: [
    { id: 'SAM_Feint',           name: 'Feint',          nameKo: '견제',           iconId: 828,   durationSec: 15, cooldownSec: 90,  targetable: false },
    { id: 'SAM_ArmsLength',      name: 'Arm\'s Length',  nameKo: '거리 유지',    iconId: 822,    durationSec: 6,  cooldownSec: 120, targetable: false },
  ],
  RPR: [
    // { id: 'RPR_ArcaneCircle',    name: 'Arcane Circle',  nameKo: '신비의 원',      iconId: 3633,  durationSec: 20, cooldownSec: 120, targetable: false },
    { id: 'RPR_ArcaneCrest',     name: 'Arcane Crest',   nameKo: '신비의 문장',    iconId: 3632,  durationSec: 5,  cooldownSec: 30,  targetable: false },
    { id: 'RPR_Feint',           name: 'Feint',          nameKo: '견제',           iconId: 828,   durationSec: 15, cooldownSec: 90,  targetable: false },
    { id: 'RPR_ArmsLength',      name: 'Arm\'s Length',  nameKo: '거리 유지',    iconId: 822,    durationSec: 6,  cooldownSec: 120, targetable: false },
  ],
  VPR: [
    { id: 'VPR_Feint',           name: 'Feint',          nameKo: '견제',           iconId: 828,   durationSec: 15, cooldownSec: 90,  targetable: false },
    { id: 'VPR_ArmsLength',      name: 'Arm\'s Length',  nameKo: '거리 유지',    iconId: 822,    durationSec: 6,  cooldownSec: 120, targetable: false },
  ],

  // =========================================================================
  // Physical Ranged DPS
  // =========================================================================
  BRD: [
    { id: 'BRD_Troubadour',      name: 'Troubadour',     nameKo: '방랑하는 음악가',iconId: 2612,   durationSec: 15, cooldownSec: 90,  targetable: false },
    { id: 'BRD_NaturesMinne',    name: "Nature's Minne", nameKo: '대지신의 연가',  iconId: 2615,   durationSec: 15, cooldownSec: 120, targetable: true },
    { id: 'BRD_ArmsLength',      name: 'Arm\'s Length',  nameKo: '거리 유지',      iconId: 822,    durationSec: 6,  cooldownSec: 120, targetable: false },
  ],
  MCH: [
    { id: 'MCH_Tactician',       name: 'Tactician',      nameKo: '책략가',         iconId: 3040, durationSec: 15, cooldownSec: 90,  targetable: false },
    { id: 'MCH_Dismantle',       name: 'Dismantle',      nameKo: '무기파괴',       iconId: 3011,  durationSec: 10, cooldownSec: 120, targetable: false },
    { id: 'MCH_ArmsLength',      name: 'Arm\'s Length',  nameKo: '거리 유지',      iconId: 822,    durationSec: 6,  cooldownSec: 120, targetable: false },
  ],
  DNC: [
    { id: 'DNC_ShieldSamba',     name: 'Shield Samba',   nameKo: '수세의 삼바',    iconId: 3469, durationSec: 15, cooldownSec: 120, targetable: false },
    { id: 'DNC_CuringWaltz',     name: 'Curing Waltz',   nameKo: '치유의 왈츠',    iconId: 3468, durationSec: 0,  cooldownSec: 60,  targetable: false },
    { id: 'DNC_Improvisation',   name: 'Improvisation',  nameKo: '즉흥연기',       iconId: 3477, durationSec: 15, cooldownSec: 120, targetable: false },
    { id: 'DNC_ArmsLength',      name: 'Arm\'s Length',  nameKo: '거리 유지',      iconId: 822,    durationSec: 6,  cooldownSec: 120, targetable: false },
  ],

  // =========================================================================
  // Magical Ranged DPS
  // =========================================================================
  BLM: [
    { id: 'BLM_Manaward',        name: 'Manaward',       nameKo: '마배리어',       iconId: 463,   durationSec: 20, cooldownSec: 120, targetable: false },
    { id: 'BLM_Addle',           name: 'Addle',          nameKo: '정신 교란',      iconId: 861,  durationSec: 15, cooldownSec: 90,  targetable: false },
    { id: 'BLM_Surecast',        name: 'Surecast',       nameKo: '견고한 마법',    iconId: 869,  durationSec: 6,  cooldownSec: 120, targetable: false },
  ],
  SMN: [
    // { id: 'SMN_SearingLight',    name: 'Searing Light',  nameKo: '타오르는 빛',    iconId: 2780,  durationSec: 20, cooldownSec: 120, targetable: false },
    { id: 'SMN_RadiantAegis',    name: 'Radiant Aegis',  nameKo: '수호의 빛',      iconId: 2775,  durationSec: 30, cooldownSec: 60,  targetable: false, maxCharges: 2 },
    { id: 'SMN_Addle',           name: 'Addle',          nameKo: '정신 교란',      iconId: 861,  durationSec: 15, cooldownSec: 90,  targetable: false },
    { id: 'SMN_Surecast',        name: 'Surecast',       nameKo: '견고한 마법',    iconId: 869,  durationSec: 6,  cooldownSec: 120, targetable: false },
  ],
  RDM: [
    // { id: 'RDM_Embolden',        name: 'Embolden',       nameKo: '성원',           iconId: 3218,  durationSec: 20, cooldownSec: 120, targetable: false },
    { id: 'RDM_MagickBarrier',   name: 'Magick Barrier', nameKo: '바매직',         iconId: 3237, durationSec: 10, cooldownSec: 120, targetable: false },
    { id: 'RDM_Addle',           name: 'Addle',          nameKo: '정신 교란',      iconId: 861,  durationSec: 15, cooldownSec: 90,  targetable: false },
    { id: 'RDM_Surecast',        name: 'Surecast',       nameKo: '견고한 마법',    iconId: 869,  durationSec: 6,  cooldownSec: 120, targetable: false },
  ],
  PCT: [
    { id: 'PCT_TemperaCoat',     name: 'Tempera Coat',   nameKo: '템페라 밑칠',    iconId: 3835, durationSec: 10, cooldownSec: 120, targetable: false },
    // { id: 'PCT_TemperaGrassa',   name: 'Tempera Grassa', nameKo: '템페라 덧칠',  iconId: 3836, durationSec: 10, cooldownSec: 0,  targetable: false },
    // { id: 'PCT_StarryMuse',      name: 'Starry Muse',    nameKo: '하늘 구현',    iconId: 3826, durationSec: 20, cooldownSec: 120, targetable: false },
    { id: 'PCT_Addle',           name: 'Addle',          nameKo: '정신 교란',      iconId: 861,  durationSec: 15, cooldownSec: 90,  targetable: false },
    { id: 'PCT_Surecast',        name: 'Surecast',       nameKo: '견고한 마법',    iconId: 869,  durationSec: 6,  cooldownSec: 120, targetable: false },
  ],
};

export const JOB_SKILLS: JobSkill[] = (Object.keys(RAW) as JobId[]).flatMap((jobId) =>
  RAW[jobId].map((s) => ({ ...s, jobId })),
);

export const JOB_SKILLS_BY_ID: Record<string, JobSkill> = Object.fromEntries(
  JOB_SKILLS.map((s) => [s.id, s]),
);

export function skillsForJob(jobId: JobId): JobSkill[] {
  return JOB_SKILLS.filter((s) => s.jobId === jobId);
}
