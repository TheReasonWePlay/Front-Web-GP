/**
 * ============================================================================
 * LAYOUT COMPONENT
 * ============================================================================
 * 
 * Main application layout with sidebar navigation and header.
 * Provides the structural framework for all authenticated pages.
 * 
 * Features:
 * - Role-based navigation menu (dynamically filtered)
 * - User profile dropdown with role badge
 * - Logout functionality
 * - Responsive sidebar design
 * - Dark mode support
 * - Notification and help placeholders
 * 
 * @module Layout
 */

// --- Dependencies ---
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import React, { useState, useRef, useEffect } from 'react';

// --- Icons ---
import { 
  LayoutDashboard,   // Dashboard icon
  Users,             // Agents Management icon
  Calendar,          // Work Schedules icon
  CalendarDays,      // Calendar & Holidays icon
  BarChart3,         // Statistics icon
  Settings,          // Settings icon
  LogOut,            // Logout icon
  User,              // User profile icon
  Bell,              // Notifications icon
  HelpCircle,        // Help icon
  Shield,            // Role/security icon
  ChevronUp,         // Dropdown arrow
  History            // Personal History icon
} from 'lucide-react';

// --- Context Hooks ---
import { useAuth } from '../lib/auth-context';
import { useTheme } from '../lib/theme-context';

// --- UI Components ---
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from './ui/dropdown-menu';
import { Badge } from './ui/badge';
import { toast } from 'sonner';

// --- Type Definitions ---

/**
 * Navigation item type with role-based access control
 * 
 * @interface NavItem
 * @property {string} path - Route path
 * @property {string} label - Display label in navigation
 * @property {any} icon - Lucide icon component
 * @property {Array<'Admin' | 'Manager'>} roles - Roles allowed to see this nav item
 */
type NavItem = {
  path: string;
  label: string;
  icon: any;
  roles: Array<'Admin' | 'Manager'>;
};

// --- Navigation Configuration ---

/**
 * Application navigation items with role-based visibility
 * 
 * Each item specifies which user roles can see and access it.
 * The Layout component filters this array based on the current user's role.
 * 
 * Access Matrix:
 * - Dashboard: Admin, Manager
 * - Agents Management: Admin (full CRUD), Manager (view only)
 * - Work Schedules: Admin, Manager
 * - Calendar & Holidays: Admin, Manager
 * - Statistics & Reports: Admin, Manager
 * - Personal History: Agent only
 * - Settings & Users: All roles (but different tab access)
 */
const navItems: NavItem[] = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['Admin', 'Manager'] },
  { path: '/agents', label: 'Agents Management', icon: Users, roles: ['Admin', 'Manager'] },
  { path: '/schedules', label: 'Work Schedules', icon: Calendar, roles: ['Admin', 'Manager'] },
  { path: '/calendar', label: 'Calendar & Holidays', icon: CalendarDays, roles: ['Admin', 'Manager'] },
  { path: '/statistics', label: 'Statistics & Reports', icon: BarChart3, roles: ['Admin', 'Manager'] },
  { path: '/settings', label: 'Settings & Users', icon: Settings, roles: ['Admin', 'Manager'] },
];

// --- Layout Component ---

/**
 * Layout Component
 * 
 * Provides the main application structure with sidebar navigation.
 * All authenticated pages are rendered inside this layout.
 * 
 * Structure:
 * - Left Sidebar: Logo, navigation menu, user profile
 * - Main Content Area: Route-specific page content (via Outlet)
 * 
 * @returns {JSX.Element | null} The layout structure or null if no user
 */
export function Layout() {
  // --- Context and Hooks ---
  const { currentUser, isAdmin, logout } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  
  // --- State Management ---
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // --- Safety Check ---
  // This should not happen due to ProtectedRoute, but ensures type safety
  if (!currentUser) {
    return null;
  }

  // --- Role-Based Navigation Filtering ---
  /**
   * Filter navigation items to only show menu items the current user can access
   * Based on the user's role (Admin, Manager, or Agent)
   */
  const filteredNavItems = navItems.filter(item => 
    item.roles.includes(currentUser.role)
  );

  // --- Event Handlers ---
  
  /**
   * Handle user logout
   * Clears session, shows success message, and redirects to login
   */
  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully', {
      description: 'You have been securely logged out of the system.',
    });
    navigate('/login');
  };

  /**
   * Handle profile/settings access
   * Navigates to settings page with user profile options
   */
  const handleProfile = () => {
    toast.info('Profile feature', {
      description: 'Opening profile settings...',
    });
    navigate('/settings');
  };

  /**
   * Handle notifications button click
   * Placeholder for future notification system
   */
  const handleNotifications = () => {
    toast.info('Notifications', {
      description: 'No new notifications',
    });
  };

  /**
   * Handle help/documentation access
   * Placeholder for future help system
   */
  const handleHelp = () => {
    toast.info('Help Center', {
      description: 'Opening help documentation...',
    });
  };

  // --- Utility Functions ---
  
  /**
   * Get user initials from username
   * Splits username by underscore and takes first letter of each part
   * 
   * @param {string} username - User's username (e.g., "john_smith")
   * @returns {string} User initials (e.g., "JS")
   * 
   * @example
   * getUserInitials("john_smith") // Returns "JS"
   * getUserInitials("admin") // Returns "AD"
   */
  const getUserInitials = (username?: string) => {
    if (!username) return 'U';  // Default initial if username is undefined
    
    return username
      .split('_')                    // Split by underscore
      .map(part => part[0])          // Take first letter of each part
      .join('')                      // Join letters together
      .toUpperCase()                 // Convert to uppercase
      .substring(0, 2);              // Limit to 2 characters
  };

  // --- Render Layout Structure ---
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* ============================================ */}
      {/* SIDEBAR - Navigation and User Profile */}
      {/* ============================================ */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        
        {/* --- Application Logo/Header --- */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-blue-600 dark:text-blue-400">Staff Attendance</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Management System</p>
        </div>
        
        {/* --- Navigation Menu --- */}
        {/* Dynamically renders menu items based on user's role */}
        <nav className="flex-1 p-4 space-y-1">
          {filteredNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}  // Exact match for home route
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400'  // Active state
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'  // Default state
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Menu at Bottom */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <DropdownMenu open={isUserMenuOpen} onOpenChange={setIsUserMenuOpen}>
            <DropdownMenuTrigger asChild>
              <button 
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 group"
                aria-label="User menu"
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 ring-2 ring-transparent group-hover:ring-blue-200 dark:group-hover:ring-blue-800 transition-all">
                  {getUserInitials(currentUser?.username)}
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm dark:text-gray-200">{currentUser?.username || 'User'}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{currentUser?.email || 'No email'}</p>
                </div>
                <ChevronUp 
                  className={`w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform duration-200 ${
                    isUserMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              side="top" 
              align="end"
              sideOffset={8}
              className="w-64 dark:bg-gray-800 dark:border-gray-700 shadow-lg"
            >
              <DropdownMenuLabel className="dark:text-gray-200">
                <div className="flex items-center gap-3 py-2">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    {getUserInitials(currentUser?.username)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm dark:text-gray-100">{currentUser?.username || 'User'}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-normal">
                      {currentUser?.email || 'No email'}
                    </p>
                    <Badge 
                      variant="outline" 
                      className={`mt-1 text-xs ${
                        isAdmin 
                          ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-700'
                          : 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-700'
                      }`}
                    >
                      <Shield className="w-3 h-3 mr-1" />
                      {currentUser.role}
                    </Badge>
                  </div>
                </div>
              </DropdownMenuLabel>
              
              <DropdownMenuSeparator className="dark:bg-gray-700" />
              
              <DropdownMenuItem 
                onClick={handleProfile}
                className="cursor-pointer dark:hover:bg-gray-700 dark:text-gray-200 focus:bg-blue-50 dark:focus:bg-blue-950 focus:text-blue-600 dark:focus:text-blue-400"
              >
                <User className="w-4 h-4 mr-3" />
                My Profile
              </DropdownMenuItem>
              
              <DropdownMenuSeparator className="dark:bg-gray-700" />
              
              <DropdownMenuItem 
                onClick={handleLogout}
                className="cursor-pointer text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-950 focus:text-red-600 dark:focus:text-red-400"
              >
                <LogOut className="w-4 h-4 mr-3" />
                Log Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
        <Outlet />
      </main>
    </div>
  );
}
