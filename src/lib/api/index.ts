/**
 * ============================================================================
 * API SERVICES INDEX
 * ============================================================================
 * 
 * Central export point for all API-related functionality.
 * This barrel file simplifies imports throughout the application.
 * 
 * Usage:
 * Instead of importing from individual files:
 *   import { Agent } from '../lib/api/types';
 *   import { agentsService } from '../lib/api/agents.service';
 * 
 * Import everything from this index:
 *   import { Agent, agentsService } from '../lib/api';
 * 
 * Exports:
 * - All TypeScript types (Agent, WorkSchedule, Holiday, etc.)
 * - API configuration (API_CONFIG, buildUrl, mockDelay)
 * - All service instances (agentsService, schedulesService, etc.)
 * 
 * @module api/index
 */

// --- Type Exports ---
// Export all TypeScript interfaces and types for use throughout the app
export * from './types';

// --- Configuration Exports ---
// Export API configuration, URL builder, and mock delay utility
export * from './config';

// --- Service Exports ---
// Export singleton instances of all API services

/**
 * Agents Service
 * Handles employee management and attendance tracking
 * Methods: getAgents, getAgentById, createAgent, updateAgent, deleteAgent, getAgentAttendance
 */
export { agentsService } from './agents.service';

/**
 * Schedules Service
 * Handles work schedule management
 * Methods: getSchedules, getActiveSchedule, getScheduleById, createSchedule, updateSchedule, deleteSchedule
 */
export { schedulesService } from './schedules.service';

/**
 * Calendar Service
 * Handles holidays and calendar events
 * Methods: getHolidays, getCalendarEvents, createHoliday, updateHoliday, deleteHoliday
 */
export { calendarService } from './calendar.service';

/**
 * Statistics Service
 * Handles dashboard stats and reporting
 * Methods: getDashboardStats, getAttendanceStats, getRecentActivities, exportReport
 */
export { statisticsService } from './statistics.service';

/**
 * Users Service
 * Handles system user management and audit logs
 * Methods: getUsers, getUserById, createUser, updateUser, deleteUser, resetPassword, getAuditLogs
 */
export { usersService } from './users.service';
