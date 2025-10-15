/**
 * ============================================================================
 * PROTECTED ROUTE COMPONENT
 * ============================================================================
 * 
 * Wrapper component that ensures only authenticated users can access routes.
 * Redirects unauthenticated users to the login page.
 * 
 * Features:
 * - Authentication check
 * - Loading state during auth initialization
 * - Role-based landing page redirection
 * - Automatic redirect to login if not authenticated
 * 
 * @module ProtectedRoute
 */

// --- Dependencies ---
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth-context';

// --- Type Definitions ---

/**
 * Props for ProtectedRoute component
 * 
 * @interface ProtectedRouteProps
 * @property {React.ReactNode} children - The route content to protect
 */
interface ProtectedRouteProps {
  children: React.ReactNode;
}

// --- Protected Route Component ---

/**
 * ProtectedRoute Component
 * 
 * Wrapper for routes that require authentication.
 * Automatically redirects to login if user is not authenticated.
 * Shows loading spinner while checking authentication state.
 * 
 * Usage:
 * <Route path="/" element={
 *   <ProtectedRoute>
 *     <Dashboard />
 *   </ProtectedRoute>
 * } />
 * 
 * @param {ProtectedRouteProps} props
 * @returns {JSX.Element} Protected content, loading screen, or redirect
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  // Get authentication state and user info
  const { isAuthenticated, isLoading, currentUser } = useAuth();
  const location = useLocation();

  // --- Loading State ---
  // Show spinner while checking if user has a saved session
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          {/* Spinning loader */}
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // --- Authentication Check ---
  // If not authenticated, redirect to login page
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // --- Role-Based Landing Page Redirect ---
  // When accessing root path (/), redirect based on user role
  if (location.pathname === '/' && currentUser) {
    // Agents should be redirected to their personal history page
    // (They don't have access to the dashboard)
    if (currentUser.role === 'Agent') {
      return <Navigate to="/personal-history" replace />;
    }
    // Admin and Manager users can access the dashboard (default route)
    // No redirect needed - let them proceed to dashboard
  }

  // --- Render Protected Content ---
  // User is authenticated and on a valid route - render the protected content
  return <>{children}</>;
}
