import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const STORAGE_KEY = 'planimox-settings-v1';
const PARTY_SIZE = 8;

export interface OptionalColumns {
  attribute: boolean;
  damage: boolean;
  description: boolean;
}

// 모바일 뷰포트 설정
function isMobileViewport(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(max-width: 640px)').matches;
}

interface SettingsState {
  // 캐릭터 열 표시 여부. 인덱스 = Character.index.
  visibleColumns: boolean[];
  // 부가 정보 열(속성/피해량/비고) 표시 여부.
  optionalColumns: OptionalColumns;
  toggleColumn: (index: number) => void;
  toggleOptional: (key: keyof OptionalColumns) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      visibleColumns: Array(PARTY_SIZE).fill(true),
      optionalColumns: isMobileViewport()
        ? { attribute: false, damage: false, description: false }
        : { attribute: true, damage: true, description: true },
      toggleColumn: (index) =>
        set((s) => ({
          visibleColumns: s.visibleColumns.map((v, i) => (i === index ? !v : v)),
        })),
      toggleOptional: (key) =>
        set((s) => ({
          optionalColumns: { ...s.optionalColumns, [key]: !s.optionalColumns[key] },
        })),
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        visibleColumns: s.visibleColumns,
        optionalColumns: s.optionalColumns,
      }),
    },
  ),
);
