/**
 * ============================================================================
 * ROLE-BASED ROUTE COMPONENT
 * ============================================================================
 * 
 * Wrapper component that restricts route access based on user roles.
 * Extends ProtectedRoute by adding role-based authorization.
 * 
 * Features:
 * - Role-based access control (RBAC)
 * - Automatic redirect to appropriate page if unauthorized
 * - Support for multiple allowed roles per route
 * - Loading state during auth check
 * 
 * @module RoleBasedRoute
 */

// --- Dependencies ---
import { Navigate } from 'react-router-dom';
import { useAuth } from '../lib/auth-context';

// --- Type Definitions ---

/**
 * Props for RoleBasedRoute component
 * 
 * @interface RoleBasedRouteProps
 * @property {React.ReactNode} children - The route content to protect
 * @property {Array<'Admin' | 'Manager' | 'Agent'>} allowedRoles - Roles allowed to access this route
 */
interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles: Array<'Admin' | 'Manager' | 'Agent'>;
}

// --- Role-Based Route Component ---

/**
 * RoleBasedRoute Component
 * 
 * Wrapper for routes that require specific user roles.
 * Checks if the current user's role is in the allowedRoles array.
 * Redirects unauthorized users to their appropriate landing page.
 * 
 * Usage:
 * <Route path="/agents" element={
 *   <RoleBasedRoute allowedRoles={['Admin', 'Manager']}>
 *     <AgentsManagement />
 *   </RoleBasedRoute>
 * } />
 * 
 * Redirect Logic:
 * - Agent trying to access unauthorized route → /personal-history
 * - Manager trying to access unauthorized route → / (dashboard)
 * - Admin trying to access unauthorized route → / (dashboard)
 * 
 * @param {RoleBasedRouteProps} props
 * @returns {JSX.Element} Protected content, loading screen, or redirect
 */
export function RoleBasedRoute({ children, allowedRoles }: RoleBasedRouteProps) {
  // Get current user and loading state
  const { currentUser, isLoading } = useAuth();

  // --- Loading State ---
  // Show spinner while checking authentication and role
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
  // If no user is logged in, redirect to login page
  // This is a safety check (ProtectedRoute should catch this first)
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // --- Role Authorization Check ---
  // Check if user's role is in the list of allowed roles
  if (!allowedRoles.includes(currentUser.role)) {
    // User doesn't have permission to access this route
    // Redirect to their role-appropriate landing page
    
    if (currentUser.role === 'Agent') {
      // Agents should go to their personal history page
      return <Navigate to="/personal-history" replace />;
    } else if (currentUser.role === 'Manager') {
      // Managers should go to the dashboard
      return <Navigate to="/" replace />;
    } else {
      // Admins should go to the dashboard
      // (This shouldn't happen as Admins have access to all routes)
      return <Navigate to="/" replace />;
    }
  }

  // --- Render Authorized Content ---
  // User is authenticated and has the correct role - render the protected content
  return <>{children}</>;
}