/**
 * Statistics API Service
 * Handles all statistics and reporting API calls
 */

import { API_CONFIG } from './config';
import { fetchWithAuth } from './fetchWithAuth';
import type { 
  DashboardStats, 
  AttendanceStats, 
  RecentActivity,
  ReportParams,
  ApiResponse 
} from './types';

class StatisticsService {
  /**
   * Fetch dashboard statistics
   */
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    try {
      const response = await fetchWithAuth(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DASHBOARD_STATS}`,
        {
          method: 'GET'
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard stats: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }
  
  /**
   * Fetch attendance statistics
   */
  async getAttendanceStats(params?: {
    period?: 'daily' | 'weekly' | 'monthly';
    from?: string;
    to?: string;
  }): Promise<ApiResponse<AttendanceStats>> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.period) queryParams.append('period', params.period);
      if (params?.from) queryParams.append('from', params.from);
      if (params?.to) queryParams.append('to', params.to);
      
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ATTENDANCE_STATS}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      const response = await fetchWithAuth(url, {
        method: 'GET'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch attendance stats: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching attendance stats:', error);
      throw error;
    }
  }
  
  /**
   * Fetch recent activities
   */
  async getRecentActivities(limit: number = 10): Promise<ApiResponse<RecentActivity[]>> {
    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.RECENT_ACTIVITY}?limit=${limit}`;
      
      const response = await fetchWithAuth(url, {
        method: 'GET'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch recent activities: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      throw error;
    }
  }
  
  /**
   * Export report
   */
  async exportReport(params: ReportParams): Promise<ApiResponse<{ downloadUrl: string }>> {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EXPORT_REPORT}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`,
          },
          body: JSON.stringify(params),
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to export report: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error exporting report:', error);
      throw error;
    }
  }
}

export const statisticsService = new StatisticsService();
