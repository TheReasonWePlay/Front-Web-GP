/**
 * ============================================================================
 * API TYPESCRIPT TYPES
 * ============================================================================
 * 
 * Complete type definitions for all API requests, responses, and data models.
 * These types ensure type safety throughout the application and provide
 * IntelliSense support in IDEs.
 * 
 * Type Categories:
 * - Common: Generic response types used across all endpoints
 * - Agent: Employee and attendance data
 * - Schedule: Work schedule configurations
 * - Calendar: Holidays and events
 * - Statistics: Analytics and reporting data
 * - User: System users and audit logs
 * 
 * @module api/types
 */

// ============================================================================
// COMMON TYPES - Generic Response Wrappers
// ============================================================================

/**
 * Standard API Response Wrapper
 * 
 * All API endpoints return responses in this format for consistency.
 * The generic type parameter T represents the actual data being returned.
 * 
 * @template T - The type of data being returned
 * 
 * @property {boolean} success - Whether the request was successful
 * @property {T} data - The actual response data (only present if successful)
 * @property {string} error - Error message (only present if failed)
 * @property {string} message - Optional additional message
 * 
 * @example
 * ApiResponse<Agent> = {
 *   success: true,
 *   data: { id: '1', name: 'John Doe', ... }
 * }
 * 
 * @example
 * ApiResponse<void> = {
 *   success: false,
 *   error: 'Agent not found'
 * }
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Paginated Response Wrapper
 * 
 * Used for endpoints that return lists of items with pagination support.
 * Includes metadata about the current page and total available items.
 * 
 * @template T - The type of items in the array
 * 
 * @property {T[]} data - Array of items for the current page
 * @property {number} total - Total number of items across all pages
 * @property {number} page - Current page number (1-indexed)
 * @property {number} pageSize - Number of items per page
 * @property {number} totalPages - Total number of pages available
 * 
 * @example
 * PaginatedResponse<Agent> = {
 *   data: [{ id: '1', name: 'John' }, { id: '2', name: 'Jane' }],
 *   total: 25,
 *   page: 1,
 *   pageSize: 10,
 *   totalPages: 3
 * }
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================================================
// AGENT TYPES - Employee and Attendance Data
// ============================================================================

/**
 * Agent (Employee) Data Model
 * 
 * Represents a staff member in the attendance management system.
 * This is the core data structure for employee information.
 * 
 * Database Mapping: See DATABASE_MAPPING.md for field mappings
 * - matricule → AGENT.employee_id (PK, unique identifier)
 * - name → CONCAT(AGENT.first_name, ' ', AGENT.last_name)
 * - department → AGENT.division
 * 
 * @property {string} matricule - Official employee ID/matricule (e.g., 'EMP001')
 * @property {string} name - Full name of the employee
 * @property {string} department - Department/division (e.g., 'IT', 'HR')
 * @property {string} position - Job title (e.g., 'Software Engineer')
 * @property {string} status - Employment status
 */
export interface Agent {
  matricule: string;
  nom: string;
  division: string;
  poste: string;
  status: 'Active' | 'Inactive' | 'On Leave';
}

/**
 * Agent Details (Extended Information)
 * 
 * Extends the base Agent type with attendance statistics and history.
 * Used in agent profile pages and detailed views.
 * 
 * @extends Agent
 * 
 * @property {AgentAttendance[]} recentAttendance - Recent attendance records (last 30 days)
 * @property {number} totalWorkHours - Total hours worked (current month)
 * @property {number} attendanceRate - Percentage of days present (e.g., 95.5)
 * @property {number} lateCount - Number of late arrivals (current month)
 */
export interface AgentDetails extends Agent {
  recentAttendance: AgentAttendance[];
  totalWorkHours: number;
  attendanceRate: number;
  lateCount: number;
}

/**
 * Agent Attendance Record
 * 
 * Represents a single day's attendance record for an employee.
 * Tracks check-in/check-out times and calculates work hours.
 * 
 * Database Mapping:
 * - attendanceId → DAILY_ATTENDANCE.attendance_id
 * - matricule → DAILY_ATTENDANCE.employee_id
 * - date → DAILY_ATTENDANCE.date
 * - checkIn → DAILY_ATTENDANCE.morning_check_in
 * - checkOut → DAILY_ATTENDANCE.afternoon_check_out
 * - status → Calculated based on times and schedule
 * - workHours → Calculated from check-in/out times
 * 
 * @property {string} attendanceId - Unique attendance record ID
 * @property {string} matricule - Reference to the agent (matricule)
 * @property {string} date - Date of attendance (YYYY-MM-DD format)
 * @property {string} checkIn - Check-in time (HH:mm format, e.g., '09:00')
 * @property {string} checkOut - Check-out time (HH:mm format, e.g., '17:00')
 * @property {string} status - Attendance status for the day
 * @property {number} workHours - Calculated work hours (e.g., 8.5)
 * @property {string} notes - Optional notes (e.g., 'Early leave for appointment')
 */
export interface AgentAttendance {
  attendanceId: string;
  matricule: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: 'Present' | 'Absent' | 'Late' | 'Leave' | 'Half-day';
  workHours?: number;
  notes?: string;
}

/**
 * Daily Attendance Details
 * 
 * Detailed attendance record for a single day including separate morning and afternoon times.
 * Used for detailed attendance views showing all check-in/out times.
 * 
 * Database Mapping:
 * - attendanceId → DAILY_ATTENDANCE.attendance_id
 * - matricule → DAILY_ATTENDANCE.employee_id
 * - date → DAILY_ATTENDANCE.date
 * - morningCheckIn → DAILY_ATTENDANCE.morning_check_in
 * - morningCheckOut → DAILY_ATTENDANCE.morning_check_out
 * - afternoonCheckIn → DAILY_ATTENDANCE.afternoon_check_in
 * - afternoonCheckOut → DAILY_ATTENDANCE.afternoon_check_out
 * 
 * @property {string} attendanceId - Unique attendance record ID
 * @property {string} matricule - Reference to the agent (matricule)
 * @property {string} date - Date of attendance (YYYY-MM-DD format)
 * @property {string} morningCheckIn - Morning arrival time (HH:mm format)
 * @property {string} morningCheckOut - Morning departure time (HH:mm format)
 * @property {string} afternoonCheckIn - Afternoon arrival time (HH:mm format)
 * @property {string} afternoonCheckOut - Afternoon departure time (HH:mm format)
 * @property {string} status - Attendance status for the day
 * @property {number} workHours - Calculated work hours (e.g., 8.5)
 * @property {string} notes - Optional notes
 */
export interface DailyAttendanceDetails {
  attendanceId: string;
  matricule: string;
  date: string;
  morningCheckIn?: string;
  morningCheckOut?: string;
  afternoonCheckIn?: string;
  afternoonCheckOut?: string;
  status: 'Present' | 'Absent' | 'Late' | 'Leave' | 'Half-day';
  workHours?: string;
  entree_matin?: string;
  sortie_matin?: string;
  entree_aprem?: string;
  sortie_aprem?: string;
  tolerance?: string;
  conge?: boolean;
  type_abs?: string;
}

/**
 * Temporary Exit/Absence Record
 * 
 * Represents a temporary exit during work hours (e.g., doctor appointment, personal errand).
 * Tracks when an employee left and returned during the workday.
 * 
 * Database Mapping:
 * - id → TEMPORARY_ABSENCE.temp_absence_id
 * - attendanceId → TEMPORARY_ABSENCE.attendance_id (FK to DAILY_ATTENDANCE)
 * - exitTime → TEMPORARY_ABSENCE.temp_exit_time
 * - returnTime → TEMPORARY_ABSENCE.temp_return_time
 * - description → TEMPORARY_ABSENCE.description
 * 
 * @property {string} id - Unique temporary exit ID
 * @property {string} attendanceId - Links to daily attendance record
 * @property {string} matricule - Reference to the agent (for easy queries)
 * @property {string} date - Date of the exit (YYYY-MM-DD format)
 * @property {string} exitTime - Departure time (HH:mm format)
 * @property {string} returnTime - Return time (HH:mm format, null if not returned)
 * @property {string} description - Reason for temporary absence
 * @property {number} duration - Duration in minutes (calculated)
 */
export interface TemporaryExit {
  id: string;
  attendanceId: string;
  matricule: string;
  date: string;
  exitTime: string;
  returnTime?: string;
  description: string;
  duration?: number;
}

/**
 * Long Absence Record
 * 
 * Represents extended absences like vacation, sick leave, maternity leave, etc.
 * Used for leave management and HR tracking.
 * 
 * Database Mapping:
 * - id → LONG_ABSENCE.long_absence_id
 * - matricule → LONG_ABSENCE.employee_id (FK to AGENT)
 * - startDate → LONG_ABSENCE.start_date
 * - endDate → LONG_ABSENCE.end_date
 * - type → LONG_ABSENCE.type
 * - reason → LONG_ABSENCE.reason
 * 
 * @property {string} id - Unique absence ID
 * @property {string} matricule - Employee matricule
 * @property {string} startDate - Absence start date (YYYY-MM-DD format)
 * @property {string} endDate - Absence end date (YYYY-MM-DD format)
 * @property {string} type - Type of absence
 * @property {string} reason - Detailed reason/notes
 * @property {string} status - Approval status
 * @property {number} duration - Duration in days (calculated)
 * @property {string} createdAt - When the absence was created
 */
export interface LongAbsence {
  id: string;
  matricule: string;
  startDate: string;
  endDate: string;
  type: string;
  reason: string;
  status?: 'Passed' | 'Active';
  duration?: number;
  createdAt?: string;
}

// ============================================================================
// SCHEDULE TYPES - Work Schedule Configuration
// ============================================================================

/**
 * Work Schedule Data Model
 * 
 * Defines a work schedule template that can be assigned to employees.
 * Includes work hours, days, and break duration.
 * 
 * Database Mapping:
 * - id → WORK_SCHEDULE.schedule_id
 * - name → WORK_SCHEDULE.name
 * - startTime → WORK_SCHEDULE.morning_check_in_time
 * - endTime → WORK_SCHEDULE.afternoon_check_out_time
 * - isActive → WORK_SCHEDULE.is_active
 * 
 * @property {string} id - Unique schedule identifier
 * @property {string} name - Schedule name (e.g., 'Standard 9-5', 'Shift A')
 * @property {string} description - Optional description of the schedule
 * @property {string} startTime - Work start time (HH:mm format, e.g., '09:00')
 * @property {string} endTime - Work end time (HH:mm format, e.g., '17:00')
 * @property {number[]} workDays - Array of work days (0=Sunday, 1=Monday, ..., 6=Saturday)
 * @property {number} breakDuration - Break duration in minutes (e.g., 60 for 1 hour)
 * @property {boolean} isActive - Whether this is the currently active schedule
 * @property {string} createdAt - Creation timestamp (ISO 8601)
 * @property {string} updatedAt - Last update timestamp (ISO 8601)
 * 
 * @example
 * {
 *   id: 'sched-001',
 *   name: 'Standard Office Hours',
 *   description: 'Regular 9-5 schedule',
 *   startTime: '09:00',
 *   endTime: '17:00',
 *   workDays: [1, 2, 3, 4, 5], // Monday to Friday
 *   breakDuration: 60,
 *   isActive: true,
 *   createdAt: '2025-01-01T00:00:00Z',
 *   updatedAt: '2025-01-01T00:00:00Z'
 * }
 */
export interface WorkSchedule {
  id: string;
  name: string;
  morningStart: string;
  morningEnd: string;
  afternoonStart: string;
  afternoonEnd: string;
  tolerance: string;
  isActive: boolean;
  deletable: boolean;
}

// ============================================================================
// CALENDAR TYPES - Holidays and Events
// ============================================================================

/**
 * Holiday Data Model
 * 
 * Represents a holiday or non-working day.
 * Can be public holidays, company holidays, or floating holidays.
 * 
 * Database Mapping:
 * - id → HOLIDAY.holiday_id
 * - name → HOLIDAY.name
 * - date → HOLIDAY.date
 * - type → HOLIDAY.type
 * - recurring → HOLIDAY.is_recurring
 * 
 * @property {string} id - Unique holiday identifier
 * @property {string} name - Holiday name (e.g., 'New Year', 'Christmas')
 * @property {string} date - Holiday date (YYYY-MM-DD format)
 * @property {string} type - Type of holiday
 *   - 'Public': National/government holidays
 *   - 'Company': Company-specific holidays
 *   - 'Floating': Optional holidays
 * @property {boolean} recurring - Whether holiday repeats annually
 * @property {string} description - Optional description
 * @property {string} createdAt - Creation timestamp (ISO 8601)
 * 
 * @example
 * {
 *   id: 'hol-001',
 *   name: 'Christmas Day',
 *   date: '2025-12-25',
 *   type: 'Public',
 *   recurring: true,
 *   description: 'Christmas celebration',
 *   createdAt: '2025-01-01T00:00:00Z'
 * }
 */
export interface Holiday {
  id: string;
  name: string;
  date: string;
  recurring: boolean;
}

/**
 * Calendar Event Data Model
 * 
 * Represents any event that appears on the calendar.
 * Includes holidays, meetings, and special company events.
 * 
 * @property {string} id - Unique event identifier
 * @property {string} title - Event title
 * @property {string} date - Event date (YYYY-MM-DD format)
 * @property {string} type - Type of event
 *   - 'Holiday': Holiday/non-working day
 *   - 'Event': Company event
 *   - 'Meeting': Scheduled meeting
 * @property {string} description - Optional event description
 * @property {boolean} allDay - Whether event spans entire day
 * @property {string} startTime - Start time if not all-day (HH:mm format)
 * @property {string} endTime - End time if not all-day (HH:mm format)
 * 
 * @example
 * {
 *   id: 'evt-001',
 *   title: 'Team Building Event',
 *   date: '2025-06-15',
 *   type: 'Event',
 *   description: 'Annual team outing',
 *   allDay: true
 * }
 */
export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'Holiday' | 'Event' | 'Meeting';
  description?: string;
  allDay: boolean;
  startTime?: string;
  endTime?: string;
}

// ============================================================================
// STATISTICS TYPES - Analytics and Reporting Data
// ============================================================================

/**
 * Dashboard Statistics Data Model
 * 
 * Key performance indicators (KPIs) displayed on the dashboard.
 * Provides real-time snapshot of attendance status.
 * 
 * @property {number} totalAgents - Total number of active employees
 * @property {number} presentToday - Number of employees present today
 * @property {number} absentToday - Number of employees absent today
 * @property {number} lateArrivals - Number of late arrivals today
 * @property {number} onLeaveToday - Number of employees on leave today
 * @property {number} attendanceRate - Overall attendance rate percentage (e.g., 95.5)
 * @property {number} avgWorkHours - Average work hours per employee (today)
 * 
 * @example
 * {
 *   totalAgents: 50,
 *   presentToday: 45,
 *   absentToday: 3,
 *   lateArrivals: 2,
 *   onLeaveToday: 5,
 *   attendanceRate: 90.0,
 *   avgWorkHours: 8.2
 * }
 */
export interface DashboardStats {
  totalAgents: number;
  presentToday: number;
  absentToday: number;
  lateArrivals: number;
  onLeaveToday: number;
  attendanceRate: number;
  avgWorkHours: number;
}

/**
 * Attendance Statistics Data Model
 * 
 * Comprehensive attendance data for charts and analytics.
 * Provides data in daily, weekly, and monthly views.
 * 
 * @property {DailyAttendance[]} daily - Daily attendance breakdown
 * @property {WeeklyAttendance[]} weekly - Weekly attendance summary
 * @property {MonthlyAttendance[]} monthly - Monthly attendance trends
 */
export interface AttendanceStats {
  daily: DailyAttendance[];
  weekly: WeeklyAttendance[];
  monthly: MonthlyAttendance[];
}

/**
 * Daily Attendance Statistics
 * 
 * Attendance breakdown for a single day.
 * Used for daily trend charts.
 * 
 * @property {string} date - Date (YYYY-MM-DD format)
 * @property {number} present - Number of employees present
 * @property {number} absent - Number of employees absent
 * @property {number} late - Number of late arrivals
 * @property {number} leave - Number of employees on leave
 */
export interface DailyAttendance {
  date: string;
  present: number;
  absent: number;
  late: number;
  leave: number;
}

/**
 * Weekly Attendance Statistics
 * 
 * Attendance summary for a week.
 * Used for weekly trend charts.
 * 
 * @property {string} week - Week identifier (e.g., 'Week 1', '2025-W01')
 * @property {number} present - Total present count for the week
 * @property {number} absent - Total absent count for the week
 * @property {number} late - Total late arrivals for the week
 */
export interface WeeklyAttendance {
  week: string;
  present: number;
  absent: number;
  late: number;
}

/**
 * Monthly Attendance Statistics
 * 
 * Attendance summary for a month.
 * Used for monthly trend charts and reports.
 * 
 * @property {string} month - Month identifier (e.g., 'January', '2025-01')
 * @property {number} present - Total present count for the month
 * @property {number} absent - Total absent count for the month
 * @property {number} late - Total late arrivals for the month
 */
export interface MonthlyAttendance {
  month: string;
  present: number;
  absent: number;
  late: number;
}

/**
 * Recent Activity Data Model
 * 
 * Represents a recent system activity or event.
 * Displayed in the dashboard activity feed.
 * 
 * @property {string} activityId - Unique activity identifier
 * @property {string} matricule - Employee matricule associated with the activity
 * @property {string} agentName - Employee name for display
 * @property {string} type - Type of activity
 *   - 'check-in': Employee checked in
 *   - 'check-out': Employee checked out
 *   - 'leave-request': Leave request submitted
 *   - 'schedule-change': Work schedule changed
 * @property {string} description - Human-readable activity description
 * @property {string} timestamp - Activity timestamp (ISO 8601 format)
 * @property {string} status - Optional status indicator
 *   - 'success': Normal/successful action
 *   - 'pending': Awaiting approval
 *   - 'warning': Requires attention
 * 
 * @example
 * {
 *   activityId: 'act-001',
 *   matricule: 'EMP001',
 *   agentName: 'John Doe',
 *   type: 'check-in',
 *   description: 'John Doe checked in',
 *   timestamp: '2025-10-10T09:00:00Z',
 *   status: 'success'
 * }
 */
export interface RecentActivity {
  agentName: string;
  type: string;
  description: string;
  timestamp: string;
}

/**
 * Report Generation Parameters
 * 
 * Parameters for generating and exporting attendance reports.
 * Used with the export report API endpoint.
 * 
 * @property {string} type - Type of report to generate
 *   - 'attendance': Attendance records report
 *   - 'agent-summary': Individual agent summary
 *   - 'monthly-report': Monthly overview report
 * @property {string} format - Export format
 *   - 'pdf': PDF document
 *   - 'excel': Excel spreadsheet (.xlsx)
 *   - 'csv': Comma-separated values
 * @property {string} from - Start date (YYYY-MM-DD format)
 * @property {string} to - End date (YYYY-MM-DD format)
 * @property {string[]} matricules - Optional: Filter by specific employee matricules
 * @property {string[]} departments - Optional: Filter by departments
 * 
 * @example
 * {
 *   type: 'attendance',
 *   format: 'pdf',
 *   from: '2025-10-01',
 *   to: '2025-10-31',
 *   departments: ['IT', 'HR']
 * }
 */
export interface ReportParams {
  type: 'attendance' | 'agent-summary' | 'monthly-report';
  format: 'pdf' | 'excel' | 'csv';
  from: string;
  to: string;
  matricules?: string[];
  departments?: string[];
}

// ============================================================================
// USER TYPES - System Users and Audit Logging
// ============================================================================

/**
 * System User Data Model
 * 
 * Represents a user account with system access.
 * Different from Agent (employee) - users are for system login and access control.
 * 
 * Database Mapping:
 * - id → LOGIN.login_id
 * - username → LOGIN.username
 * - email → LOGIN.email
 * - role → LOGIN.role
 * - status → LOGIN.is_active
 * 
 * @property {string} id - Unique user identifier
 * @property {string} username - Login username (unique)
 * @property {string} email - Email address (unique)
 * @property {string} fullName - Full name of the user
 * @property {string} role - System role determining access level
 *   - 'Admin': Full system access, can manage all data
 *   - 'Manager': Limited management access, view-only for some features
 *   - 'Agent': Personal data access only
 * @property {string} status - Account status
 *   - 'Active': Can login and use system
 *   - 'Inactive': Account disabled, cannot login
 * @property {string} lastLogin - Last login timestamp (ISO 8601), optional
 * @property {string} createdAt - Account creation timestamp (ISO 8601)
 * @property {string} updatedAt - Last update timestamp (ISO 8601)
 * 
 * @example
 * {
 *   id: 'usr-001',
 *   username: 'admin',
 *   email: 'admin@company.com',
 *   fullName: 'System Administrator',
 *   role: 'Admin',
 *   status: 'Active',
 *   lastLogin: '2025-10-10T08:00:00Z',
 *   createdAt: '2025-01-01T00:00:00Z',
 *   updatedAt: '2025-10-10T08:00:00Z'
 * }
 */
export interface SystemUser {
  id: string;
  username: string;
  email: string;
  role: 'Admin' | 'Manager';
}

export interface PassUpdt{
  oldPassword: string;
  newPassword: string;
}

/**
 * Audit Log Entry Data Model
 * 
 * Records all significant user actions for security and compliance.
 * Provides audit trail for debugging and accountability.
 * 
 * @property {string} id - Unique log entry identifier
 * @property {string} userId - User who performed the action
 * @property {string} username - Username for display (denormalized)
 * @property {string} action - Type of action performed
 *   - 'Login': User logged in
 *   - 'Logout': User logged out
 *   - 'Create': Created a new record
 *   - 'Update': Modified an existing record
 *   - 'Delete': Deleted a record
 *   - 'View': Viewed sensitive data
 * @property {string} resource - Type of resource affected (e.g., 'Agent', 'Schedule')
 * @property {string} resourceId - Optional: ID of the affected resource
 * @property {string} details - Optional: Additional details about the action
 * @property {string} ipAddress - Optional: IP address of the user
 * @property {string} timestamp - Action timestamp (ISO 8601)
 * 
 * @example
 * {
 *   id: 'log-001',
 *   userId: 'usr-001',
 *   username: 'admin',
 *   action: 'Update',
 *   resource: 'Agent',
 *   resourceId: 'EMP001',
 *   details: 'Updated employee status to Active',
 *   ipAddress: '192.168.1.100',
 *   timestamp: '2025-10-10T10:30:00Z'
 * }
 */
export interface AuditLog {
  id: string;
  userId: string;
  username: string;
  action: 'Login' | 'Logout' | 'Create' | 'Update' | 'Delete' | 'View';
  resource: string;
  resourceId?: string;
  details?: string;
  ipAddress?: string;
  timestamp: string;
}

/**
 * Password Reset Request Data Model
 * 
 * Parameters for resetting a user's password.
 * Used by administrators to reset passwords for users.
 * 
 * @property {string} userId - ID of the user whose password needs reset
 * @property {boolean} sendEmail - Whether to send reset email to user
 * @property {string} temporaryPassword - Optional: Manually specified temporary password
 *                                        If not provided, system generates one
 * 
 * @example
 * {
 *   userId: 'usr-002',
 *   sendEmail: true
 * }
 * 
 * @example
 * {
 *   userId: 'usr-002',
 *   sendEmail: false,
 *   temporaryPassword: 'Temp123!'
 * }
 */
export interface PasswordResetRequest {
  userId: string;
  sendEmail: boolean;
  temporaryPassword?: string;
}
