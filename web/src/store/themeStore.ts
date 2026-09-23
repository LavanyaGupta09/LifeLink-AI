import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'dark' | 'light';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const applyThemeClass = (theme: Theme) => {
  const root = document.documentElement;
  if (theme === 'light') {
    root.classList.add('light-mode');
  } else {
    root.classList.remove('light-mode');
  }
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'dark',

      setTheme: (theme: Theme) => {
        applyThemeClass(theme);
        set({ theme });
      },

      toggleTheme: () => {
        // Add the transition class to the html element before changing the theme
        document.documentElement.classList.add('theme-transition');
        
        const next = get().theme === 'dark' ? 'light' : 'dark';
        applyThemeClass(next);
        set({ theme: next });

        // Remove the transition class after a short delay
        setTimeout(() => document.documentElement.classList.remove('theme-transition'), 400);
      },
    }),
    {
      name: 'lifelink-theme',
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyThemeClass(state.theme);
        }
      },
    }
  )
);
