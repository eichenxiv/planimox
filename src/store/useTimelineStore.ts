import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  Assignment,
  BossSkill,
  BossTimeline,
  Character,
  JobId,
  PhaseDivider,
  SaveFile,
} from '../types';
import { PHASE_END } from '../types';
import { uuid } from '../lib/timeUtils';

// 파티 자리 라벨은 고정 (사용자 편집 불가).
// 슬롯 의도: T1/T2 = 탱커, H1/H2 = 힐러, D1~D4 = 딜러.
// (실제 직업은 자유롭게 배치 가능 — 라벨은 시각적 가이드)
const PARTY_LABELS = ['T1', 'T2', 'H1', 'H2', 'D1', 'D2', 'D3', 'D4'] as const;
const PARTY_SIZE = PARTY_LABELS.length;

function defaultParty(): Character[] {
  return Array.from({ length: PARTY_SIZE }, (_, i) => ({
    index: i,
    name: PARTY_LABELS[i],
    jobId: null as JobId | null,
  }));
}

// 저장 파일에서 불러올 때도 이름은 표준 라벨로 강제.
function normalizeParty(party: Character[]): Character[] {
  return Array.from({ length: PARTY_SIZE }, (_, i) => {
    const src = party.find((c) => c.index === i);
    return {
      index: i,
      name: PARTY_LABELS[i],
      jobId: src?.jobId ?? null,
    };
  });
}

function defaultTimeline(): BossTimeline {
  return { name: '새 타임라인', skills: [] };
}

const byTime = (a: BossSkill, b: BossSkill) => a.time - b.time;

// 한 행 삭제/구분선 삽입 시 기준 앵커: 주어진 행 바로 다음 행 id, 없으면 PHASE_END.
function nextAnchorAfter(skills: BossSkill[], id: string): string {
  const idx = skills.findIndex((sk) => sk.id === id);
  return idx >= 0 && idx + 1 < skills.length ? skills[idx + 1].id : PHASE_END;
}

interface Snapshot {
  bossTimeline: BossTimeline;
  assignments: Assignment[];
  phaseDividers: PhaseDivider[];
}

interface TabState extends Snapshot {
  past: Snapshot[];
  future: Snapshot[];
}

interface State {
  // party 는 탭 공유
  party: Character[];
  activeTabId: string;
  tabOrder: string[];
  // 모든 탭(활성 포함)을 id → 상태로 보관. 활성 탭 = tabs[activeTabId].
  tabs: Record<string, TabState>;
}

const HISTORY_LIMIT = 30;

interface Actions {
  setBossName: (name: string) => void;
  addBossSkill: (partial?: Partial<Omit<BossSkill, 'id'>>) => string;
  updateBossSkill: (id: string, patch: Partial<Omit<BossSkill, 'id'>>) => void;
  removeBossSkill: (id: string) => void;

  setJob: (charIndex: number, jobId: JobId | null) => void;

  assignSkill: (
    bossSkillId: string,
    casterCharIndex: number,
    jobSkillId: string,
    targetCharIndex: number,
  ) => void;
  assignCustomSkill: (
    bossSkillId: string,
    casterCharIndex: number,
    text: string,
  ) => void;
  unassignSkill: (assignmentId: string) => void;
  clearAssignments: () => void;
  resetAll: () => void;

  addPhaseDividerAfter: (skillId: string) => void;
  updatePhaseDivider: (id: string, label: string) => void;
  removePhaseDivider: (id: string) => void;
  movePhaseDivider: (id: string, dir: -1 | 1) => void;

  undo: () => void;
  redo: () => void;

  addTab: () => void;
  openTimelineTab: (timeline: BossTimeline) => void;
  switchTab: (id: string) => void;
  removeTab: (id: string) => void;

  loadState: (s: SaveFile) => void;
  loadSharedState: (s: SaveFile) => void;
  replaceBossTimeline: (timeline: BossTimeline) => void;

  snapshot: () => SaveFile;
}

export type Store = State & Actions;

// 활성 탭 상태. 컴포넌트 셀렉터에서도 사용: useTimelineStore((s) => activeTab(s).bossTimeline...).
export const activeTab = (s: State): TabState => s.tabs[s.activeTabId];

const snapOf = (t: Snapshot): Snapshot => ({
  bossTimeline: t.bossTimeline,
  assignments: t.assignments,
  phaseDividers: t.phaseDividers,
});

function freshTab(): TabState {
  return {
    bossTimeline: defaultTimeline(),
    assignments: [],
    phaseDividers: [],
    past: [],
    future: [],
  };
}

// 활성 탭에 patch 를 적용한 새 tabs 를 만든다(히스토리 변화 없음).
function patchActive(s: State, patch: Partial<TabState>): Pick<State, 'tabs'> {
  return {
    tabs: { ...s.tabs, [s.activeTabId]: { ...s.tabs[s.activeTabId], ...patch } },
  };
}

// undo 가능한 변경: 현재 스냅샷을 past 에 쌓고 future 를 비운 뒤 changes 적용.
function commit(s: State, changes: Partial<Snapshot>): Pick<State, 'tabs'> {
  const cur = s.tabs[s.activeTabId];
  return patchActive(s, {
    past: [...cur.past, snapOf(cur)].slice(-HISTORY_LIMIT),
    future: [],
    ...changes,
  });
}

export const useTimelineStore = create<Store>()(
  persist(
    (set, get) => {
      const initialTabId = uuid();
      return {
        party: defaultParty(),
        activeTabId: initialTabId,
        tabOrder: [initialTabId],
        tabs: { [initialTabId]: freshTab() },

        // 보스 이름은 타이핑마다 호출되므로 히스토리에 쌓지 않는다.
        setBossName: (name) =>
          set((s) =>
            patchActive(s, {
              bossTimeline: { ...activeTab(s).bossTimeline, name },
            }),
          ),

        addBossSkill: (partial) => {
          const id = uuid();
          const next: BossSkill = {
            id,
            cast: partial?.cast,
            time: partial?.time ?? 0,
            name: partial?.name ?? '',
            attribute: partial?.attribute ?? null,
            damage: partial?.damage ?? '',
            description: partial?.description ?? '',
          };
          set((s) => {
            const t = activeTab(s);
            return commit(s, {
              bossTimeline: {
                ...t.bossTimeline,
                skills: [...t.bossTimeline.skills, next].sort(byTime),
              },
            });
          });
          return id;
        },

        updateBossSkill: (id, patch) =>
          set((s) => {
            const t = activeTab(s);
            return commit(s, {
              bossTimeline: {
                ...t.bossTimeline,
                skills: t.bossTimeline.skills
                  .map((sk) => (sk.id === id ? { ...sk, ...patch } : sk))
                  .sort(byTime),
              },
            });
          }),

        removeBossSkill: (id) =>
          set((s) => {
            const t = activeTab(s);
            const nextAnchor = nextAnchorAfter(t.bossTimeline.skills, id);
            return commit(s, {
              bossTimeline: {
                ...t.bossTimeline,
                skills: t.bossTimeline.skills.filter((sk) => sk.id !== id),
              },
              assignments: t.assignments.filter((a) => a.bossSkillId !== id),
              phaseDividers: t.phaseDividers.map((d) =>
                d.beforeSkillId === id ? { ...d, beforeSkillId: nextAnchor } : d,
              ),
            });
          }),

        // 직업 변경은 모든 탭에서 관련 배정을 제거한다(히스토리 스냅샷 포함).
        // 히스토리까지 청소해야 undo 로 사라진 직업의 배정이 되살아나지 않는다.
        setJob: (charIndex, jobId) =>
          set((s) => {
            const sweep = (as: Assignment[]) =>
              as.filter(
                (a) => a.casterCharIndex !== charIndex && a.targetCharIndex !== charIndex,
              );
            const sweepSnap = (snap: Snapshot): Snapshot => ({
              ...snap,
              assignments: sweep(snap.assignments),
            });
            const tabs: Record<string, TabState> = {};
            for (const [id, t] of Object.entries(s.tabs)) {
              tabs[id] = {
                ...t,
                assignments: sweep(t.assignments),
                past: t.past.map(sweepSnap),
                future: t.future.map(sweepSnap),
              };
            }
            return {
              party: s.party.map((c) => (c.index === charIndex ? { ...c, jobId } : c)),
              tabs,
            };
          }),

        assignSkill: (bossSkillId, casterCharIndex, jobSkillId, targetCharIndex) =>
          set((s) =>
            commit(s, {
              assignments: [
                ...activeTab(s).assignments,
                { id: uuid(), bossSkillId, casterCharIndex, targetCharIndex, jobSkillId },
              ],
            }),
          ),

        assignCustomSkill: (bossSkillId, casterCharIndex, text) =>
          set((s) =>
            commit(s, {
              assignments: [
                ...activeTab(s).assignments,
                {
                  id: uuid(),
                  bossSkillId,
                  casterCharIndex,
                  targetCharIndex: casterCharIndex,
                  jobSkillId: '',
                  customText: text,
                },
              ],
            }),
          ),

        unassignSkill: (assignmentId) =>
          set((s) =>
            commit(s, {
              assignments: activeTab(s).assignments.filter((a) => a.id !== assignmentId),
            }),
          ),

        clearAssignments: () => set((s) => commit(s, { assignments: [] })),

        // 전체 초기화
        resetAll: () =>
          set(() => {
            const id = uuid();
            return {
              party: defaultParty(),
              activeTabId: id,
              tabOrder: [id],
              tabs: { [id]: freshTab() },
            };
          }),

        // 지정한 행 아래에 구분선 추가
        addPhaseDividerAfter: (skillId) =>
          set((s) => {
            const t = activeTab(s);
            const anchor = nextAnchorAfter(t.bossTimeline.skills, skillId);
            return commit(s, {
              phaseDividers: [
                ...t.phaseDividers,
                { id: uuid(), label: 'Phase', beforeSkillId: anchor },
              ],
            });
          }),

        // 구분선 라벨은 타이핑마다 호출되므로 setBossName 과 같이 히스토리에 쌓지 않는다.
        updatePhaseDivider: (id, label) =>
          set((s) =>
            patchActive(s, {
              phaseDividers: activeTab(s).phaseDividers.map((d) =>
                d.id === id ? { ...d, label } : d,
              ),
            }),
          ),

        removePhaseDivider: (id) =>
          set((s) =>
            commit(s, {
              phaseDividers: activeTab(s).phaseDividers.filter((d) => d.id !== id),
            }),
          ),

        movePhaseDivider: (id, dir) =>
          set((s) => {
            const t = activeTab(s);
            const divider = t.phaseDividers.find((d) => d.id === id);
            if (!divider) return {};
            const slots = [...t.bossTimeline.skills.map((sk) => sk.id), PHASE_END];
            const cur = slots.indexOf(divider.beforeSkillId);
            if (cur === -1) return {};
            const target = Math.min(slots.length - 1, Math.max(0, cur + dir));
            if (target === cur) return {};
            return commit(s, {
              phaseDividers: t.phaseDividers.map((d) =>
                d.id === id ? { ...d, beforeSkillId: slots[target] } : d,
              ),
            });
          }),

        undo: () =>
          set((s) => {
            const t = activeTab(s);
            if (t.past.length === 0) return {};
            const previous = t.past[t.past.length - 1];
            return patchActive(s, {
              ...previous,
              past: t.past.slice(0, -1),
              future: [snapOf(t), ...t.future].slice(0, HISTORY_LIMIT),
            });
          }),

        redo: () =>
          set((s) => {
            const t = activeTab(s);
            if (t.future.length === 0) return {};
            const next = t.future[0];
            return patchActive(s, {
              ...next,
              past: [...t.past, snapOf(t)].slice(-HISTORY_LIMIT),
              future: t.future.slice(1),
            });
          }),

        addTab: () =>
          set((s) => {
            const id = uuid();
            return {
              tabs: { ...s.tabs, [id]: freshTab() },
              activeTabId: id,
              tabOrder: [...s.tabOrder, id],
            };
          }),

        // 주어진 보스 타임라인을 새 탭으로 연다 (현재 탭은 보존). 프리셋 열기에 사용.
        openTimelineTab: (timeline) =>
          set((s) => {
            const id = uuid();
            return {
              tabs: { ...s.tabs, [id]: { ...freshTab(), bossTimeline: timeline } },
              activeTabId: id,
              tabOrder: [...s.tabOrder, id],
            };
          }),

        switchTab: (id) =>
          set((s) => (id !== s.activeTabId && s.tabs[id] ? { activeTabId: id } : {})),

        removeTab: (id) =>
          set((s) => {
            if (s.tabOrder.length <= 1) return {};
            const order = s.tabOrder.filter((t) => t !== id);
            const tabs = { ...s.tabs };
            delete tabs[id];
            if (id !== s.activeTabId) return { tabOrder: order, tabs };
            const idx = s.tabOrder.indexOf(id);
            const nextId = order[Math.min(idx, order.length - 1)];
            return { tabOrder: order, tabs, activeTabId: nextId };
          }),

        loadState: (data) =>
          set((s) => ({
            party: normalizeParty(data.party),
            ...commit(s, {
              bossTimeline: data.bossTimeline,
              assignments: data.assignments,
              phaseDividers: data.phaseDividers ?? [],
            }),
          })),

        // 공유 링크(/s/:id)로 진입 시: 받은 구성만 단일 탭으로 보여준다.
        // 기존 탭·히스토리를 모두 비워, 받는 사람의 다른 탭과 섞이지 않게 한다.
        loadSharedState: (data) =>
          set(() => {
            const id = uuid();
            return {
              party: normalizeParty(data.party),
              activeTabId: id,
              tabOrder: [id],
              tabs: {
                [id]: {
                  bossTimeline: data.bossTimeline,
                  assignments: data.assignments,
                  phaseDividers: data.phaseDividers ?? [],
                  past: [],
                  future: [],
                },
              },
            };
          }),

        replaceBossTimeline: (timeline) =>
          set((s) =>
            commit(s, { bossTimeline: timeline, assignments: [], phaseDividers: [] }),
          ),

        snapshot: () => {
          const s = get();
          const t = activeTab(s);
          return {
            version: 1,
            bossTimeline: t.bossTimeline,
            party: s.party,
            assignments: t.assignments,
            phaseDividers: t.phaseDividers,
          };
        },
      };
    },
    {
      name: 'planimox-timeliner',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        party: s.party,
        activeTabId: s.activeTabId,
        tabOrder: s.tabOrder,
        tabs: Object.fromEntries(
          Object.entries(s.tabs).map(([k, t]) => [k, snapOf(t)]),
        ),
      }),
      merge: (persisted, current) => {
        const p = persisted as any;
        if (!p?.tabs) return current;

        const tabs: Record<string, TabState> = {};
        for (const [k, t] of Object.entries(p.tabs)) {
          const snap = t as any;
          tabs[k] = {
            bossTimeline: snap?.bossTimeline ?? defaultTimeline(),
            assignments: snap?.assignments ?? [],
            phaseDividers: snap?.phaseDividers ?? [],
            past: [],
            future: [],
          };
        }

        const tabOrder = (p.tabOrder as string[] | undefined)?.filter((id) => tabs[id]) ?? [];
        if (tabOrder.length === 0) return current;
        const activeTabId = tabs[p.activeTabId] ? p.activeTabId : tabOrder[0];

        return {
          ...current,
          party: p.party ? normalizeParty(p.party) : current.party,
          activeTabId,
          tabOrder,
          tabs,
        };
      },
    },
  ),
);
