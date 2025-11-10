/**
 * ============================================================================
 * API CONFIGURATION
 * ============================================================================
 * 
 * Centralized configuration for all API endpoints and settings.
 * This file contains the base URL, endpoint definitions, and utility functions
 * for making HTTP requests to the backend server.
 * 
 * Key Features:
 * - Centralized endpoint definitions
 * - Environment-aware configuration
 * - URL building utilities
 * - Endpoint path generators
 * 
 * @module api/config
 */

/**
 * Main API Configuration Object
 * 
 * Controls all aspects of API communication including base URL,
 * mock mode settings, and endpoint paths.
 * 
 * Configuration Options:
 * - BASE_URL: The root URL for all API requests
 * - MOCK_DELAY: Artificial delay for mock API calls (milliseconds)
 * - USE_MOCK: Toggle between mock data and real API calls
 * - ENDPOINTS: All API endpoint paths organized by feature
 */
export const API_CONFIG = {
  /**
   * Base URL for API requests
   * 
   * In development: http://localhost:3000/api
   * In production: Update to your production API URL
   * 
   * Can be overridden with environment variable:
   * import.meta.env.VITE_API_URL
   */
  BASE_URL: 'http://localhost:5000/api',
  
  /**
   * Simulated network delay in milliseconds
   * 
   * Used only when USE_MOCK is true to simulate real network latency.
   * Set to 0 for instant responses in testing.
   * Typical values: 300-1000ms for realistic simulation
   */
  MOCK_DELAY: 0,
  
  /**
   * Mock Mode Toggle
   * 
   * When true: Uses mock data (no backend required)
   * When false: Makes real HTTP requests to BASE_URL
   * 
   * Note: Currently set to false as application uses real API calls
   */
  USE_MOCK: false,
  
  /**
   * API Endpoint Definitions
   * 
   * Organized by feature area. All endpoints are relative to BASE_URL.
   * Some endpoints use functions to generate dynamic paths with IDs.
   * 
   * Usage:
   * - Static: API_CONFIG.ENDPOINTS.AGENTS → '/agents'
   * - Dynamic: API_CONFIG.ENDPOINTS.AGENT_BY_ID('123') → '/agents/123'
   */
  ENDPOINTS: {
    // ========================================
    // Authentication Endpoints
    // ========================================
    
    /**
     * POST /auth/login
     * User authentication with email and password
     * Returns: JWT access token and user data
     */
    LOGIN: '/auth/login',
    
    /**
     * POST /auth/logout
     * Invalidate current user session
     * Requires: Valid JWT token
     */
    LOGOUT: '/auth/logout',
    
    /**
     * POST /auth/refresh
     * Refresh expired JWT token
     * Requires: Refresh token
     * Returns: New access token
     */
    REFRESH: '/auth/refresh',
    
    // ========================================
    // Agent Management Endpoints
    // ========================================
    
    /**
     * GET /agents - List all agents (with pagination/filtering)
     * POST /agents - Create new agent
     * 
     * Query params: page, pageSize, search, department, status
     */
    AGENTS: '/agents',
    
    /**
     * GET /agents/:matricule - Get agent details by matricule
     * PUT /agents/:matricule - Update agent information
     * DELETE /agents/:matricule - Delete agent
     * 
     * @param {string} matricule - Agent's unique identifier (matricule)
     * @returns {string} Formatted endpoint path
     */
    AGENT_BY_ID: (matricule: string) => `/agents/${matricule}`,
    
    /**
     * GET /agents/:matricule/attendance - Get agent's attendance history
     * Query params: startDate, endDate, status
     * 
     * @param {string} matricule - Agent's unique identifier (matricule)
     * @returns {string} Formatted endpoint path
     */
    AGENT_ATTENDANCE: (matricule: string) => `/agents/${matricule}/attendance`,
    
    // ========================================
    // Work Schedule Endpoints
    // ========================================
    
    /**
     * GET /schedules - List all work schedules
     * POST /schedules - Create new schedule
     */
    SCHEDULES: '/schedules',
    
    /**
     * GET /schedules/:id - Get schedule details
     * PUT /schedules/:id - Update schedule
     * DELETE /schedules/:id - Delete schedule
     * 
     * @param {string} id - Schedule unique identifier
     * @returns {string} Formatted endpoint path
     */
    SCHEDULE_BY_ID: (id: string) => `/schedules/${id}`,
    
    /**
     * GET /schedules/active - Get currently active work schedule
     * Returns: The schedule marked as active (isActive: true)
     */
    ACTIVE_SCHEDULE: '/schedules/active',
    
    // ========================================
    // Calendar & Holiday Endpoints
    // ========================================
    
    /**
     * GET /holidays - List holidays (filterable by year, type)
     * POST /holidays - Create new holiday
     * 
     * Query params: year, type (public/company)
     */
    HOLIDAYS: '/holidays',
    
    /**
     * GET /holidays/:id - Get holiday details
     * PUT /holidays/:id - Update holiday
     * DELETE /holidays/:id - Delete holiday
     * 
     * @param {string} id - Holiday unique identifier
     * @returns {string} Formatted endpoint path
     */
    HOLIDAY_BY_ID: (id: string) => `/holidays/${id}`,
    
    /**
     * GET /calendar/events - Get calendar events
     * Includes holidays, special events, and company events
     * 
     * Query params: startDate, endDate
     */
    CALENDAR_EVENTS: '/calendar/events',
    
    // ========================================
    // Statistics & Reporting Endpoints
    // ========================================
    
    /**
     * GET /statistics/dashboard - Get dashboard KPIs
     * Returns: totalAgents, presentToday, absentToday, lateToday, etc.
     */
    DASHBOARD_STATS: '/dashboard/stats',
    
    /**
     * GET /statistics/attendance - Get attendance statistics
     * Returns: Attendance data for charts (daily, weekly, monthly)
     * 
     * Query params: period (daily/weekly/monthly), startDate, endDate
     */
    ATTENDANCE_STATS: '/dashboard/attendance-stats',
    
    /**
     * GET /statistics/reports - Get recent activity reports
     * Returns: Recent check-ins, absences, and system activities
     * 
     * Query params: limit, offset
     */

    RECENT_ACTIVITY: '/dashboard/activities',


    REPORTS: '/statistics/reports',
    
    /**
     * POST /statistics/export - Export attendance reports
     * Generates downloadable reports in PDF, Excel, or CSV format
     * 
     * Body: { format, startDate, endDate, filters }
     */
    EXPORT_REPORT: '/statistics/export',
    
    // ========================================
    // User Management Endpoints
    // ========================================
    
    /**
     * GET /users - List all system users
     * POST /users - Create new user account
     * 
     * Query params: role (Admin/Manager/Agent)
     */
    USERS: '/users',
    
    /**
     * GET /users/:id - Get user details
     * PUT /users/:id - Update user information
     * DELETE /users/:id - Delete user account
     * 
     * @param {string} id - User unique identifier
     * @returns {string} Formatted endpoint path
     */
    USER_BY_ID: (id: string) => `/users/${id}`,
    
    /**
     * POST /users/:id/reset-password - Reset user password
     * Sends password reset email or generates temporary password
     * 
     * @param {string} id - User unique identifier
     * @returns {string} Formatted endpoint path
     */
    USER_PASSWORD_RESET: (id: string) => `/users/${id}/reset-password`,

    /**
     * POST /users/:id/update-password - Update user password
     * 
     * @param {string} id - User unique identifier
     * @returns {string} Formatted endpoint path
     */
    USER_PASSWORD_UPDATE: (id: string) => `/users/${id}/update-password`,
    
    // ========================================
    // Settings & Audit Endpoints
    // ========================================
    
    /**
     * GET /settings - Get system settings
     * PUT /settings - Update system settings
     */
    SETTINGS: '/settings',
    
    /**
     * GET /audit-logs - Get system audit logs
     * Returns: User actions, system events, security logs
     * 
     * Query params: userId, action, startDate, endDate, limit
     */
    AUDIT_LOGS: '/audit-logs',
  },
};

/**
 * Build Full URL
 * 
 * Constructs complete URL by combining base URL with endpoint path.
 * Automatically handles leading/trailing slashes.
 * 
 * @param {string} endpoint - Relative endpoint path (e.g., '/agents')
 * @returns {string} Complete URL (e.g., 'http://localhost:3000/api/agents')
 * 
 * @example
 * buildUrl('/agents')
 * // Returns: 'http://localhost:3000/api/agents'
 * 
 * @example
 * buildUrl(API_CONFIG.ENDPOINTS.AGENTS)
 * // Returns: 'http://localhost:3000/api/agents'
 */
export const buildUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

/**
 * Mock API Delay
 * 
 * Simulates network latency for mock API calls during development.
 * Creates more realistic user experience when testing loading states.
 * 
 * @param {number} ms - Delay duration in milliseconds (default: API_CONFIG.MOCK_DELAY)
 * @returns {Promise<void>} Promise that resolves after the specified delay
 * 
 * @example
 * await mockDelay(500);  // Wait 500ms
 * return mockData;
 * 
 * @example
 * await mockDelay();  // Wait for configured delay
 * return mockData;
 */
export const mockDelay = (ms: number = API_CONFIG.MOCK_DELAY): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};
