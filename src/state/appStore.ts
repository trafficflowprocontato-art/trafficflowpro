import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type ThemeMode = "light" | "dark";

interface AppState {
  theme: ThemeMode;
  hideValues: boolean;
  
  // Actions
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
  toggleHideValues: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      theme: "light",
      hideValues: false,
      
      toggleTheme: () => {
        const newTheme = get().theme === "light" ? "dark" : "light";
        set({ theme: newTheme });
      },
      
      setTheme: (theme: ThemeMode) => {
        set({ theme });
      },
      
      toggleHideValues: () => {
        set({ hideValues: !get().hideValues });
      },
    }),
    {
      name: "app-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
