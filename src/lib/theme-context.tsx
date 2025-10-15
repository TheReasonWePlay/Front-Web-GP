/**
 * ============================================================================
 * THEME CONTEXT
 * ============================================================================
 * 
 * Manages application theme (light/dark mode) with automatic persistence.
 * 
 * Features:
 * - Light and dark mode support
 * - Persistent theme preference (localStorage)
 * - System preference detection
 * - Smooth theme transitions
 * - Toggle and direct set functions
 * 
 * @module ThemeContext
 */

// --- Dependencies ---
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// --- Type Definitions ---

/**
 * Available theme options
 */
type Theme = 'light' | 'dark';

/**
 * Theme context type definition
 * 
 * @interface ThemeContextType
 * @property {Theme} theme - Current active theme
 * @property {Function} toggleTheme - Switches between light and dark mode
 * @property {Function} setTheme - Directly sets a specific theme
 */
interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

// Create the theme context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// --- Theme Provider Component ---

/**
 * ThemeProvider Component
 * 
 * Wraps the application to provide theme context to all components.
 * Handles theme initialization, persistence, and updates.
 * 
 * Theme Priority (in order):
 * 1. User's saved preference (localStorage)
 * 2. System preference (prefers-color-scheme)
 * 3. Default to light mode
 * 
 * @param {Object} props
 * @param {ReactNode} props.children - Child components to wrap
 * @returns {JSX.Element} Provider component with theme context
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  // --- Initialize Theme State ---
  
  /**
   * State: Current theme
   * Initialized with saved preference, system preference, or default
   */
  const [theme, setThemeState] = useState<Theme>(() => {
    // Priority 1: Check localStorage for saved theme preference
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      return savedTheme;
    }
    
    // Priority 2: Check system preference (user's OS settings)
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    // Priority 3: Default to light mode
    return 'light';
  });

  // --- Apply Theme Changes ---
  
  /**
   * Effect: Apply theme to DOM and persist to localStorage
   * Runs whenever theme changes
   */
  useEffect(() => {
    const root = document.documentElement;
    
    // Remove existing theme classes to prevent conflicts
    root.classList.remove('light', 'dark');
    
    // Add the current theme class to <html> element
    // This triggers Tailwind's dark mode variant (see globals.css)
    root.classList.add(theme);
    
    // Save preference to localStorage for persistence
    localStorage.setItem('theme', theme);
  }, [theme]);

  // --- Theme Control Functions ---
  
  /**
   * Toggle Theme Function
   * Switches between light and dark mode
   * 
   * @example
   * <button onClick={toggleTheme}>Toggle Theme</button>
   */
  const toggleTheme = () => {
    setThemeState(prev => prev === 'light' ? 'dark' : 'light');
  };

  /**
   * Set Theme Function
   * Directly sets a specific theme (light or dark)
   * 
   * @param {Theme} newTheme - The theme to set ('light' or 'dark')
   * 
   * @example
   * <button onClick={() => setTheme('dark')}>Dark Mode</button>
   */
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  // --- Provide Theme Context ---
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// --- Custom Hook for Using Theme Context ---

/**
 * useTheme Hook
 * 
 * Custom React hook to access theme context in any component.
 * Must be used within a ThemeProvider.
 * 
 * @throws {Error} If used outside of ThemeProvider
 * @returns {ThemeContextType} Theme context with current theme and control functions
 * 
 * @example
 * function MyComponent() {
 *   const { theme, toggleTheme } = useTheme();
 *   
 *   return (
 *     <div>
 *       Current theme: {theme}
 *       <button onClick={toggleTheme}>Toggle</button>
 *     </div>
 *   );
 * }
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
