/**
 * ============================================================================
 * AUTHENTICATION CONTEXT
 * ============================================================================
 * 
 * Manages user authentication and authorization throughout the application.
 * Provides role-based access control (RBAC) with three user roles:
 * - Admin: Full system access
 * - Manager: Limited management access (view-only for agents)
 * - Agent: Personal data access only
 * 
 * Features:
 * - Persistent login state (localStorage)
 * - Role-based helper functions
 * - Mock authentication for development
 * - Ready for real API integration
 * 
 * @module AuthContext
 */

// --- Dependencies ---
import React from 'react';
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { API_CONFIG, mockDelay } from './api/config';

// --- Type Definitions ---

/**
 * User object representing the currently authenticated user
 * 
 * @interface CurrentUser
 * @property {string} id - Unique user identifier
 * @property {string} username - User's login username
 * @property {string} email - User's email address
 * @property {'Admin' | 'Manager' | 'Agent'} role - User's role for RBAC
 */
export interface CurrentUser {
  id: string;
  username: string;
  email: string;
  role: 'Admin' | 'Manager' | 'Agent';
}

/**
 * Authentication context type definition
 * Provides all authentication-related data and functions
 * 
 * @interface AuthContextType
 */
interface AuthContextType {
  currentUser: CurrentUser | null;           // Currently logged-in user (null if not authenticated)
  isAuthenticated: boolean;                  // True if user is logged in
  isAdmin: boolean;                          // True if current user is Admin
  isManager: boolean;                        // True if current user is Manager
  isAgent: boolean;                          // True if current user is Agent
  isManagerOrAdmin: boolean;                 // True if user is Manager or Admin (common check)
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;                        // Logs out current user
  isLoading: boolean;                        // True while checking stored auth state on app load
}

// Create the authentication context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- Mock Database (Development Only) ---

/**
 * Mock user database for development and testing
 * 
 * IMPORTANT: In production, user authentication should be handled by a secure backend API.
 * Passwords should NEVER be stored in frontend code.
 * 
 * Test Credentials:
 * - Admin: admin / admin123
 * - Manager: hr_manager / manager123
 * - Agent: john_smith / agent123
 */
const mockUsersDb = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@company.com',
    role: 'Admin' as const,
    password: 'admin123', // In production, this would be hashed on the server
  },
  {
    id: '2',
    username: 'hr_manager',
    email: 'hr.manager@company.com',
    role: 'Manager' as const,
    password: 'manager123',
  },
  {
    id: '3',
    username: 'it_manager',
    email: 'it.manager@company.com',
    role: 'Manager' as const,
    password: 'manager123',
  },
  {
    id: '4',
    username: 'john_smith',
    email: 'john.smith@company.com',
    role: 'Agent' as const,
    password: 'agent123',
  },
];

// --- Constants ---

/** 
 * LocalStorage key for persisting authentication state
 * Allows users to remain logged in after page refresh
 */
const AUTH_STORAGE_KEY = 'staff_attendance_auth';

// --- Authentication Provider Component ---

/**
 * AuthProvider Component
 * 
 * Wraps the application to provide authentication context to all components.
 * Manages user session state and provides login/logout functionality.
 * 
 * Features:
 * - Persistent login (survives page refresh)
 * - Role-based access helpers
 * - Loading state during initialization
 * 
 * @param {Object} props
 * @param {ReactNode} props.children - Child components to wrap
 * @returns {JSX.Element} Provider component with auth context
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  // --- State Management ---
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- Initialize Authentication State ---
  
  /**
   * Effect: Restore authentication state from localStorage on app load
   * This allows users to stay logged in even after refreshing the page
   */
  useEffect(() => {
    const savedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
    if (savedAuth) {
      try {
        const user = JSON.parse(savedAuth);
        setCurrentUser(user);
      } catch (error) {
        // If saved data is corrupted, clear it and start fresh
        console.error('Failed to parse saved auth:', error);
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  // --- Authentication Methods ---
  
  /**
   * Login Function
   * 
   * Authenticates a user with username and password.
   * In mock mode: Validates against mockUsersDb
   * In production mode: Calls real authentication API
   * 
   * @param {string} username - User's login username
   * @param {string} password - User's password (in production, sent securely to backend)
   * @returns {Promise<{success: boolean, error?: string}>} Login result
   * 
   * @example
   * const result = await login('admin', 'admin123');
   * if (result.success) {
   *   // User is now logged in
   * } else {
   *   console.error(result.error);
   * }
   */
  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Simulate network delay in mock mode for realistic UX
    if (API_CONFIG.USE_MOCK) {
      await mockDelay(800);
    }

    // --- Mock Authentication (Development) ---
    if (API_CONFIG.USE_MOCK) {
      // Search for user in mock database
      const user = mockUsersDb.find(
        u => u.username.toLowerCase() === username.toLowerCase() && u.password === password
      );

      // Invalid credentials
      if (!user) {
        return {
          success: false,
          error: 'Invalid username or password',
        };
      }

      // Create user session (exclude password from session data)
      const userSession: CurrentUser = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      };

      // Store session in state and localStorage
      setCurrentUser(userSession);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userSession));

      return { success: true };
    }

    // --- Real API Authentication (Production) ---
    try {
      // Make POST request to login endpoint
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      // Handle authentication failure
      if (!response.ok || !data.success) {
        return {
          success: false,
          error: data.error || 'Login failed',
        };
      }

      // Create user session from API response
      const userSession: CurrentUser = {
        id: data.data.user.id,
        username: data.data.user.username,
        email: data.data.user.email,
        role: data.data.user.role,
      };

      // Store session in state and localStorage
      setCurrentUser(userSession);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userSession));
      
      // In production, also store JWT tokens for authenticated API calls
      localStorage.setItem('access_token', data.data.accessToken);
      localStorage.setItem('refresh_token', data.data.refreshToken);

      return { success: true };
    } catch (error) {
      // Handle network errors
      return {
        success: false,
        error: 'Network error. Please try again.',
      };
    }
  };

  /**
   * Logout Function
   * 
   * Logs out the current user by clearing session data.
   * In production, this should also invalidate tokens on the backend.
   */
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    // In production, also clear tokens and notify backend
    // localStorage.removeItem('access_token');
    // localStorage.removeItem('refresh_token');
    // await fetch('/api/logout', { method: 'POST' });
  };

  // --- Role-Based Access Helpers ---
  // These computed values make it easy to check user permissions throughout the app
  
  const isAuthenticated = currentUser !== null;                                    // Any logged-in user
  const isAdmin = currentUser?.role === 'Admin';                                   // Admin users only
  const isManager = currentUser?.role === 'Manager';                               // Manager users only
  const isAgent = currentUser?.role === 'Agent';                                   // Agent users only
  const isManagerOrAdmin = currentUser?.role === 'Admin' || currentUser?.role === 'Manager';  // Manager or Admin

  // --- Provide Authentication Context ---
  // Makes all auth data and functions available to child components
  return (
    <AuthContext.Provider
      value={{
        currentUser,        // Current user object or null
        isAuthenticated,    // Boolean: is user logged in?
        isAdmin,           // Boolean: is user an Admin?
        isManager,         // Boolean: is user a Manager?
        isAgent,           // Boolean: is user an Agent?
        isManagerOrAdmin,  // Boolean: is user Manager or Admin?
        login,             // Function to log in
        logout,            // Function to log out
        isLoading,         // Boolean: is auth state being initialized?
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// --- Custom Hook for Using Auth Context ---

/**
 * useAuth Hook
 * 
 * Custom React hook to access authentication context in any component.
 * Must be used within an AuthProvider.
 * 
 * @throws {Error} If used outside of AuthProvider
 * @returns {AuthContextType} Authentication context with user data and functions
 * 
 * @example
 * function MyComponent() {
 *   const { currentUser, isAdmin, logout } = useAuth();
 *   
 *   if (!currentUser) return <div>Not logged in</div>;
 *   
 *   return (
 *     <div>
 *       Welcome, {currentUser.username}!
 *       {isAdmin && <button onClick={logout}>Logout</button>}
 *     </div>
 *   );
 * }
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
