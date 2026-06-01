import { create } from 'zustand';

interface SimStore {
  highlightedSkillId: string | null;
  setHighlighted: (id: string | null) => void;
}

export const useSimStore = create<SimStore>((set) => ({
  highlightedSkillId: null,
  setHighlighted: (id) => set({ highlightedSkillId: id }),
}));
