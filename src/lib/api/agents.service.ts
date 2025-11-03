/**
 * ============================================================================
 * AGENTS API SERVICE
 * ============================================================================
 * 
 * Handles all agent (employee) related API requests including CRUD operations
 * and attendance history retrieval.
 * 
 * Key Features:
 * - List agents with pagination and filtering
 * - Get detailed agent information
 * - Create, update, and delete agents
 * - Retrieve agent attendance history
 * - Automatic JWT authentication
 * 
 * All methods return standardized ApiResponse wrappers and throw errors
 * that can be caught by calling components.
 * 
 * @module api/agents.service
 */

// --- Dependencies ---
import { API_CONFIG } from './config';
import { fetchWithAuth } from './fetchWithAuth';
import type { Agent, AgentDetails, AgentAttendance, DailyAttendanceDetails, TemporaryExit, LongAbsence, ApiResponse, PaginatedResponse } from './types';

/**
 * Agents Service Class
 * 
 * Provides methods for interacting with agent-related API endpoints.
 * All methods are async and make HTTP requests to the backend server.
 */
class AgentsService {
  /**
   * Get All Agents
   * 
   * Fetches a paginated list of agents with optional filtering.
   * Supports search by name/email, filtering by department/status, and pagination.
   * 
   * API Endpoint: GET /agents
   * Authentication: Required (JWT Bearer token)
   * 
   * @param {Object} params - Optional query parameters
   * @param {number} params.page - Page number (1-indexed)
   * @param {number} params.pageSize - Number of items per page
   * @param {string} params.search - Search term (searches name, email, employeeId)
   * @param {string} params.department - Filter by department (e.g., 'IT', 'HR')
   * @param {string} params.status - Filter by status ('Active', 'Inactive', 'On Leave')
   * 
   * @returns {Promise<ApiResponse<PaginatedResponse<Agent>>>} Paginated agent list
   * 
   * @throws {Error} If the API request fails or returns non-OK status
   * 
   * @example
   * // Get first page of agents
   * const response = await agentsService.getAgents({ page: 1, pageSize: 10 });
   * if (response.success && response.data) {
   *   console.log(`Total agents: ${response.data.total}`);
   *   response.data.data.forEach(agent => console.log(agent.name));
   * }
   * 
   * @example
   * // Search for agents in IT department
   * const response = await agentsService.getAgents({ 
   *   search: 'john',
   *   department: 'IT'
   * });
   */
  async getAgents(params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    department?: string;
    status?: string;
  }): Promise<ApiResponse<PaginatedResponse<Agent>>> {
    try {
      // Build query string from parameters
      const queryParams = new URLSearchParams();
      
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.department) queryParams.append('department', params.department);
      if (params?.status) queryParams.append('status', params.status);
      
      // Construct full URL with query string
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AGENTS}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      const response = await fetchWithAuth(url, { method: 'GET' });
      
      // Check for HTTP errors
      if (!response.ok) {
        throw new Error(`Failed to fetch agents: ${response.statusText}`);
      }
      
      // Parse and return JSON response
      return await response.json();
    } catch (error) {
      console.error('Error fetching agents:', error);
      throw error;
    }
  }
  
  /**
   * Get Agent By Matricule
   * 
   * Fetches detailed information for a single agent including recent attendance,
   * work hours, attendance rate, and late count.
   * 
   * API Endpoint: GET /agents/:matricule
   * Authentication: Required (JWT Bearer token)
   * 
   * @param {string} matricule - Agent's unique identifier (matricule, e.g., 'EMP001')
   * 
   * @returns {Promise<ApiResponse<AgentDetails>>} Detailed agent information
   * 
   * @throws {Error} If the API request fails or agent is not found
   * 
   * @example
   * const response = await agentsService.getAgentById('EMP001');
   * if (response.success && response.data) {
   *   console.log(`Name: ${response.data.name}`);
   *   console.log(`Attendance Rate: ${response.data.attendanceRate}%`);
   *   console.log(`Recent Attendance:`, response.data.recentAttendance);
   * }
   */
  async getAgentById(matricule: string): Promise<ApiResponse<AgentDetails>> {
    try {
      // Make HTTP request with dynamic matricule in path
      const response = await fetchWithAuth(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AGENT_BY_ID(matricule)}`,
        {
          method: 'GET'
        }
      );
      
      // Check for HTTP errors (e.g., 404 if agent not found)
      if (!response.ok) {
        throw new Error(`Failed to fetch agent: ${response.statusText}`);
      }
      
      // Parse and return JSON response
      return await response.json();
    } catch (error) {
      console.error('Error fetching agent by matricule:', error);
      throw error;
    }
  }
  
  /**
   * Create Agent
   * 
   * Creates a new agent (employee) in the system.
   * Requires Admin role permission.
   * 
   * API Endpoint: POST /agents
   * Authentication: Required (JWT Bearer token)
   * Authorization: Admin only
   * 
   * @param {Agent} agent - Agent data including matricule
   * 
   * @returns {Promise<ApiResponse<Agent>>} Created agent
   * 
   * @throws {Error} If the API request fails or validation fails
   * 
   * @example
   * const newAgent = {
   *   matricule: 'EMP001',
   *   name: 'John Doe',
   *   department: 'IT',
   *   position: 'Software Engineer',
   *   status: 'Active' as const
   * };
   * 
   * const response = await agentsService.createAgent(newAgent);
   * if (response.success && response.data) {
   *   console.log(`Created agent: ${response.data.name}`);
   * }
   */
  async createAgent(agent: Agent): Promise<ApiResponse<Agent>> {
    try {
      // Send POST request with agent data in body
      const response = await fetchWithAuth(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AGENTS}`,
        {
          method: 'POST',
          body: JSON.stringify(agent)
        }
      );
      
      // Check for HTTP errors (e.g., 400 for validation errors, 403 for permission denied)
      if (!response.ok) {
        throw new Error(`Failed to create agent: ${response.statusText}`);
      }
      
      // Parse and return JSON response with created agent
      return await response.json();
    } catch (error) {
      console.error('Error creating agent:', error);
      throw error;
    }
  }
  
  /**
   * Update Agent
   * 
   * Updates an existing agent's information.
   * Supports partial updates (only send fields that changed).
   * Requires Admin role permission.
   * 
   * API Endpoint: PUT /agents/:matricule
   * Authentication: Required (JWT Bearer token)
   * Authorization: Admin only
   * 
   * @param {string} matricule - Agent's unique identifier (matricule)
   * @param {Partial<Agent>} updates - Fields to update (only changed fields)
   * 
   * @returns {Promise<ApiResponse<Agent>>} Updated agent data
   * 
   * @throws {Error} If the API request fails or agent is not found
   * 
   * @example
   * // Update only the status
   * const response = await agentsService.updateAgent('EMP001', {
   *   status: 'On Leave'
   * });
   * 
   * @example
   * // Update multiple fields
   * const response = await agentsService.updateAgent('EMP001', {
   *   department: 'Marketing',
   *   position: 'Marketing Manager'
   * });
   */
  async updateAgent(matricule: string, updates: Partial<Agent>): Promise<ApiResponse<Agent>> {
    try {
      // Send PUT request with partial updates
      console.log(updates);
      const response = await fetchWithAuth(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AGENT_BY_ID(matricule)}`,
        {
          method: 'PUT',
          body: JSON.stringify(updates)
        }
      );
      
      // Check for HTTP errors
      if (!response.ok) {
        throw new Error(`Failed to update agent: ${response.statusText}`);
      }
      
      // Parse and return JSON response with updated agent
      return await response.json();
    } catch (error) {
      console.error('Error updating agent:', error);
      throw error;
    }
  }
  
  /**
   * Delete Agent
   * 
   * Permanently deletes an agent from the system.
   * This action cannot be undone. Use with caution.
   * Requires Admin role permission.
   * 
   * API Endpoint: DELETE /agents/:matricule
   * Authentication: Required (JWT Bearer token)
   * Authorization: Admin only
   * 
   * @param {string} matricule - Agent's unique identifier (matricule)
   * 
   * @returns {Promise<ApiResponse<void>>} Success response (no data)
   * 
   * @throws {Error} If the API request fails or agent is not found
   * 
   * @example
   * try {
   *   const response = await agentsService.deleteAgent('EMP001');
   *   if (response.success) {
   *     console.log('Agent deleted successfully');
   *   }
   * } catch (error) {
   *   console.error('Failed to delete agent:', error);
   * }
   * 
   * @note Consider implementing soft delete (setting status to 'Inactive')
   *       instead of hard delete for data integrity and audit trail.
   */
  async deleteAgent(matricule: string): Promise<ApiResponse<void>> {
    try {
      // Send DELETE request
      const response = await fetchWithAuth(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AGENT_BY_ID(matricule)}`,
        {
          method: 'DELETE'
        }
      );
      
      // Check for HTTP errors
      if (!response.ok) {
        throw new Error(`Failed to delete agent: ${response.statusText}`);
      }
      
      // Parse and return JSON response (typically just success message)
      return await response.json();
    } catch (error) {
      console.error('Error deleting agent:', error);
      throw error;
    }
  }
  
  /**
   * Get Agent Attendance History
   * 
   * Retrieves attendance records for a specific agent within a date range.
   * Used for personal history page and agent detail views.
   * 
   * API Endpoint: GET /agents/:matricule/attendance
   * Authentication: Required (JWT Bearer token)
   * Authorization: Admin/Manager (all agents), Agent (own data only)
   * 
   * @param {string} matricule - Agent's unique identifier (matricule)
   * @param {Object} params - Optional date range parameters
   * @param {string} params.from - Start date (YYYY-MM-DD format)
   * @param {string} params.to - End date (YYYY-MM-DD format)
   * 
   * @returns {Promise<ApiResponse<AgentAttendance[]>>} Array of attendance records
   * 
   * @throws {Error} If the API request fails or agent is not found
   * 
   * @example
   * // Get attendance for the current month
   * const response = await agentsService.getAgentAttendance('EMP001', {
   *   from: '2025-10-01',
   *   to: '2025-10-31'
   * });
   * 
   * if (response.success && response.data) {
   *   response.data.forEach(record => {
   *     console.log(`${record.date}: ${record.status} (${record.workHours}h)`);
   *   });
   * }
   * 
   * @example
   * // Get all attendance records (no date filter)
   * const response = await agentsService.getAgentAttendance('EMP001');
   */
  async getAgentAttendance(
    matricule: string,
    params?: { from?: string; to?: string }
  ): Promise<ApiResponse<AgentAttendance[]>> {
    try {
      // Build query string for date range filtering
      const queryParams = new URLSearchParams();
      
      if (params?.from) queryParams.append('from', params.from);
      if (params?.to) queryParams.append('to', params.to);
      
      // Construct full URL with agent matricule and optional query parameters
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AGENT_ATTENDANCE(matricule)}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      // Make HTTP request
      const response = await fetchWithAuth(url, {
        method: 'GET'
      });
      
      // Check for HTTP errors
      if (!response.ok) {
        throw new Error(`Failed to fetch agent attendance: ${response.statusText}`);
      }
      
      // Parse and return JSON response with attendance records
      return await response.json();
    } catch (error) {
      console.error('Error fetching agent attendance:', error);
      throw error;
    }
  }
  
  /**
   * Get Daily Attendance Details
   * 
   * Retrieves detailed attendance information for a specific date,
   * including separate morning and afternoon check-in/out times.
   * 
   * API Endpoint: GET /agents/:matricule/attendance/:date
   * Authentication: Required (JWT Bearer token)
   * 
   * @param {string} matricule - Agent's unique identifier (matricule)
   * @param {string} date - Date to retrieve (YYYY-MM-DD format)
   * 
   * @returns {Promise<ApiResponse<DailyAttendanceDetails>>} Detailed attendance for the date
   * 
   * @example
   * const response = await agentsService.getDailyAttendance('EMP001', '2025-10-13');
   * if (response.success && response.data) {
   *   console.log(`Morning: ${response.data.morningCheckIn} - ${response.data.morningCheckOut}`);
   *   console.log(`Afternoon: ${response.data.afternoonCheckIn} - ${response.data.afternoonCheckOut}`);
   * }
   */
  async getDailyAttendance(
    matricule: string,
    date: string
  ): Promise<ApiResponse<DailyAttendanceDetails>> {
    try {
      const response = await fetchWithAuth(
        `${API_CONFIG.BASE_URL}/agents/${matricule}/attendance/${date}`,
        {
          method: 'GET'
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch daily attendance: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching daily attendance:', error);
      throw error;
    }
  }
  
  /**
   * Get Temporary Exits
   * 
   * Retrieves temporary exits/absences for a specific date.
   * 
   * API Endpoint: GET /agents/:matricule/temporary-exits/:date
   * Authentication: Required (JWT Bearer token)
   * 
   * @param {string} matricule - Agent's unique identifier (matricule)
   * @param {string} date - Date to retrieve exits for (YYYY-MM-DD format)
   * 
   * @returns {Promise<ApiResponse<TemporaryExit[]>>} List of temporary exits for the date
   */
  async getTemporaryExits(
    matricule: string,
    date: string
  ): Promise<ApiResponse<TemporaryExit[]>> {
    try {
      const response = await fetchWithAuth(
        `${API_CONFIG.BASE_URL}/agents/${matricule}/temporary-exits/${date}`,
        {
          method: 'GET'
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch temporary exits: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching temporary exits:', error);
      throw error;
    }
  }
  
  /**
   * Get Long Absences
   * 
   * Retrieves all long absences (vacation, sick leave, etc.) for an agent.
   * 
   * API Endpoint: GET /agents/:matricule/absences
   * Authentication: Required (JWT Bearer token)
   * 
   * @param {string} matricule - Agent's unique identifier (matricule)
   * 
   * @returns {Promise<ApiResponse<LongAbsence[]>>} List of long absences
   */
  async getLongAbsences(matricule: string): Promise<ApiResponse<LongAbsence[]>> {
    try {
      const response = await fetchWithAuth(
        `${API_CONFIG.BASE_URL}/agents/${matricule}/absences`,
        {
          method: 'GET'
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch long absences: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching long absences:', error);
      throw error;
    }
  }
  
  /**
   * Create Long Absence
   * 
   * Creates a new long absence record.
   * 
   * API Endpoint: POST /agents/:matricule/absences
   * Authentication: Required (JWT Bearer token)
   * 
   * @param {string} matricule - Agent's unique identifier (matricule)
   * @param {Omit<LongAbsence, 'id' | 'matricule'>} absence - Absence data
   * 
   * @returns {Promise<ApiResponse<LongAbsence>>} Created absence record
   */
  async createLongAbsence(
    matricule: string,
    absence: Omit<LongAbsence, 'id' | 'matricule'>
  ): Promise<ApiResponse<LongAbsence>> {
    try {
      const response = await fetchWithAuth(
        `${API_CONFIG.BASE_URL}/agents/${matricule}/absences`,
        {
          method: 'POST',
          body: JSON.stringify(absence),
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to create absence: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating absence:', error);
      throw error;
    }
  }
  
  /**
   * Update Long Absence
   * 
   * Updates an existing long absence record.
   * 
   * API Endpoint: PUT /agents/:matricule/absences/:absenceId
   * Authentication: Required (JWT Bearer token)
   * 
   * @param {string} matricule - Agent's unique identifier (matricule)
   * @param {string} absenceId - Absence ID to update
   * @param {Partial<LongAbsence>} updates - Fields to update
   * 
   * @returns {Promise<ApiResponse<LongAbsence>>} Updated absence record
   */
  async updateLongAbsence(
    matricule: string,
    absenceId: string,
    updates: Partial<LongAbsence>
  ): Promise<ApiResponse<LongAbsence>> {
    try {
      const response = await fetchWithAuth(
        `${API_CONFIG.BASE_URL}/agents/${matricule}/absences/${absenceId}`,
        {
          method: 'PUT',
          body: JSON.stringify(updates),
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to update absence: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating absence:', error);
      throw error;
    }
  }
  
  /**
   * Delete Long Absence
   * 
   * Deletes a long absence record.
   * 
   * API Endpoint: DELETE /agents/:matricule/absences/:absenceId
   * Authentication: Required (JWT Bearer token)
   * 
   * @param {string} matricule - Agent's unique identifier (matricule)
   * @param {string} absenceId - Absence ID to delete
   * 
   * @returns {Promise<ApiResponse<void>>} Success response
   */
  async deleteLongAbsence(
    matricule: string,
    absenceId: string
  ): Promise<ApiResponse<void>> {
    try {
      const response = await fetchWithAuth(
        `${API_CONFIG.BASE_URL}/agents/${matricule}/absences/${absenceId}`,
        {
          method: 'DELETE'
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to delete absence: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error deleting absence:', error);
      throw error;
    }
  }
}

/**
 * Singleton Instance Export
 * 
 * Export a single instance of the service to be imported and used throughout the application.
 * This ensures consistent state and avoids multiple instantiations.
 * 
 * @example
 * import { agentsService } from '../lib/api';
 * const response = await agentsService.getAgents();
 */
export const agentsService = new AgentsService();
