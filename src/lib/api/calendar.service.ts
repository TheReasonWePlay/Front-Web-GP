/**
 * Calendar API Service
 * Handles all calendar and holiday API calls
 */

import { API_CONFIG } from './config';
import type { Holiday, CalendarEvent, ApiResponse } from './types';

class CalendarService {
  /**
   * Fetch holidays with optional filtering
   */
  async getHolidays(params?: {
    year?: number;
    month?: number;
    type?: string;
  }): Promise<ApiResponse<Holiday[]>> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.year) queryParams.append('year', params.year.toString());
      if (params?.month) queryParams.append('month', params.month.toString());
      if (params?.type) queryParams.append('type', params.type);
      
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.HOLIDAYS}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch holidays: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching holidays:', error);
      throw error;
    }
  }
  
  /**
   * Get calendar events
   */
  async getCalendarEvents(params?: {
    from?: string;
    to?: string;
  }): Promise<ApiResponse<CalendarEvent[]>> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.from) queryParams.append('from', params.from);
      if (params?.to) queryParams.append('to', params.to);
      
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CALENDAR_EVENTS}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch calendar events: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      throw error;
    }
  }
  
  /**
   * Create a new holiday
   */
  async createHoliday(holiday: Omit<Holiday, 'id' | 'createdAt'>): Promise<ApiResponse<Holiday>> {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.HOLIDAYS}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`,
          },
          body: JSON.stringify(holiday),
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to create holiday: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating holiday:', error);
      throw error;
    }
  }
  
  /**
   * Update an existing holiday
   */
  async updateHoliday(id: string, updates: Partial<Holiday>): Promise<ApiResponse<Holiday>> {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.HOLIDAY_BY_ID(id)}`,
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
        throw new Error(`Failed to update holiday: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating holiday:', error);
      throw error;
    }
  }
  
  /**
   * Delete a holiday
   */
  async deleteHoliday(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.HOLIDAY_BY_ID(id)}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`,
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to delete holiday: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error deleting holiday:', error);
      throw error;
    }
  }
}

export const calendarService = new CalendarService();
