import { create } from "zustand";

interface WalletState {
  isOfflineMode: boolean;
  setOfflineMode: (isOffline: boolean) => void;
  isOnline: boolean;
  setIsOnline: (isOnline: boolean) => void;
}

export const useStore = create<WalletState>((set) => ({
  isOfflineMode: false,
  setOfflineMode: (isOffline) => set({ isOfflineMode: isOffline }),
  isOnline: true,
  setIsOnline: (isOnline) => set({ isOnline }),
}));
