/**
 * Users API Service
 * Handles all user management and audit log API calls
 */

import { API_CONFIG } from './config';
import { fetchWithAuth } from './fetchWithAuth';
import type { SystemUser, PassUpdt, PasswordResetRequest, ApiResponse } from './types';

class UsersService {
  /**
   * Fetch all users
   */
  async getUsers(): Promise<ApiResponse<SystemUser[]>> {
    try {
      const response = await fetchWithAuth(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USERS}`,
        {
          method: 'GET'
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
      const response = await fetchWithAuth(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USER_BY_ID(id)}`,
        {
          method: 'GET'
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
  async createUser(user: SystemUser): Promise<ApiResponse<SystemUser>> {
    try {
      const response = await fetchWithAuth(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USERS}`,
        {
          method: 'POST',
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
   * Create a new user
   */
  async updatePwd(id: string, pwd: PassUpdt): Promise<ApiResponse<SystemUser>> {
    try {
      const response = await fetchWithAuth(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USER_PASSWORD_UPDATE(id)}`,
        {
          method: 'POST',
          body: JSON.stringify(pwd),
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to udpdate password: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  }
  //USER_PASSWORD_RESET
  async resetPwd(id: string): Promise<ApiResponse<SystemUser>> {
    try {
      const response = await fetchWithAuth(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USER_PASSWORD_RESET(id)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }, // ✅ Ajout important
          body: JSON.stringify({}), // ✅ Envoie un objet vide plutôt qu’une chaîne
        }
      );
  
      if (!response.ok) {
        const errorText = await response.text(); // ✅ pour diagnostiquer les erreurs du backend
        throw new Error(`Failed to reset password: ${errorText || response.statusText}`);
      }
  
      const data = await response.json();
  
      return data;
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  }
  /**
   * Update an existing user
   */
  async updateUser(id: string, updates: Partial<SystemUser>): Promise<ApiResponse<SystemUser>> {
    try {
      const response = await fetchWithAuth(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USER_BY_ID(id)}`,
        {
          method: 'PUT',
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
      const response = await fetchWithAuth(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USER_BY_ID(id)}`,
        {
          method: 'DELETE'
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
      const response = await fetchWithAuth(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USER_PASSWORD_RESET(userId)}`,
        {
          method: 'POST',
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
  
}

export const usersService = new UsersService();
