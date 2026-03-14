import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FunnelData {
  eventSegment?: string;
  specificType?: string;
  guestCount?: number;
  dateRange?: { from?: string; to?: string };
  roomCounts?: Record<string, number>;
  wantsMeals?: boolean;
  activities?: Record<string, number>;
}

interface FunnelStore {
  data: FunnelData;
  setData: (stepData: Partial<FunnelData>) => void;
  reset: () => void;
}

export const useFunnelStore = create<FunnelStore>()(
  persist(
    (set) => ({
      data: {},
      setData: (stepData) => set((state) => ({ data: { ...state.data, ...stepData } })),
      reset: () => set({ data: {} }),
    }),
    { name: 'wilderness-edge-storage' }
  )
);