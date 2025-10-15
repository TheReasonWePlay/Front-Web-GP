/**
 * Schedules API Service
 * Handles all work schedule API calls
 */

import { API_CONFIG } from './config';
import type { WorkSchedule, ApiResponse } from './types';

class SchedulesService {
  /**
   * Fetch all schedules
   */
  async getSchedules(): Promise<ApiResponse<WorkSchedule[]>> {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SCHEDULES}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`,
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch schedules: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching schedules:', error);
      throw error;
    }
  }
  
  /**
   * Get active schedule
   */
  async getActiveSchedule(): Promise<ApiResponse<WorkSchedule | null>> {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ACTIVE_SCHEDULE}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`,
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch active schedule: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching active schedule:', error);
      throw error;
    }
  }
  
  /**
   * Get schedule by ID
   */
  async getScheduleById(id: string): Promise<ApiResponse<WorkSchedule>> {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SCHEDULE_BY_ID(id)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`,
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch schedule: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching schedule by ID:', error);
      throw error;
    }
  }
  
  /**
   * Create a new schedule
   */
  async createSchedule(schedule: Omit<WorkSchedule, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<WorkSchedule>> {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SCHEDULES}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`,
          },
          body: JSON.stringify(schedule),
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to create schedule: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating schedule:', error);
      throw error;
    }
  }
  
  /**
   * Update an existing schedule
   */
  async updateSchedule(id: string, updates: Partial<WorkSchedule>): Promise<ApiResponse<WorkSchedule>> {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SCHEDULE_BY_ID(id)}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`,
          },
          body: JSON.stringify(updates),
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to update schedule: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating schedule:', error);
      throw error;
    }
  }
  
  /**
   * Delete a schedule
   */
  async deleteSchedule(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SCHEDULE_BY_ID(id)}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`,
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to delete schedule: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error deleting schedule:', error);
      throw error;
    }
  }
}

export const schedulesService = new SchedulesService();
