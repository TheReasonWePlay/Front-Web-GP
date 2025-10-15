/**
 * Users API Service
 * Handles all user management and audit log API calls
 */

import { API_CONFIG } from './config';
import type { SystemUser, AuditLog, PasswordResetRequest, ApiResponse } from './types';

class UsersService {
  /**
   * Fetch all users
   */
  async getUsers(): Promise<ApiResponse<SystemUser[]>> {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USERS}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`,
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }
  
  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<ApiResponse<SystemUser>> {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USER_BY_ID(id)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`,
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch user: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      throw error;
    }
  }
  
  /**
   * Create a new user
   */
  async createUser(user: Omit<SystemUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<SystemUser>> {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USERS}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`,
          },
          body: JSON.stringify(user),
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to create user: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }
  
  /**
   * Update an existing user
   */
  async updateUser(id: string, updates: Partial<SystemUser>): Promise<ApiResponse<SystemUser>> {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USER_BY_ID(id)}`,
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
        throw new Error(`Failed to update user: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }
  
  /**
   * Delete a user
   */
  async deleteUser(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USER_BY_ID(id)}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`,
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to delete user: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
  
  /**
   * Reset user password
   */
  async resetPassword(userId: string, request?: PasswordResetRequest): Promise<ApiResponse<{ temporaryPassword?: string }>> {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USER_PASSWORD_RESET(userId)}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`,
          },
          body: JSON.stringify(request || {}),
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to reset password: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  }
  
  /**
   * Get audit logs
   */
  async getAuditLogs(params?: {
    userId?: string;
    action?: string;
    from?: string;
    to?: string;
    limit?: number;
  }): Promise<ApiResponse<AuditLog[]>> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.userId) queryParams.append('userId', params.userId);
      if (params?.action) queryParams.append('action', params.action);
      if (params?.from) queryParams.append('from', params.from);
      if (params?.to) queryParams.append('to', params.to);
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUDIT_LOGS}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch audit logs: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      throw error;
    }
  }
}

export const usersService = new UsersService();
