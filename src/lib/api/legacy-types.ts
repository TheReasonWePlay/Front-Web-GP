/**
 * Legacy Types for Backward Compatibility
 * These types are kept for components that haven't been fully migrated yet
 * They map to the new API types where possible
 */

import { API_CONFIG } from './config';

// Re-export common types from the new API types
export type { 
  Agent, 
  WorkSchedule, 
  Holiday,
  SystemUser as User,
  AgentAttendance as AttendanceRecord,
} from './types';

// Legacy-specific types that don't have direct API equivalents yet
export interface PerformanceMetric {
  month: string;
  attendanceRate: number;
  punctualityRate: number;
  overtimeHours: number;
}

export interface AgentDetails {
  agentId: string;
  currentSchedule: string;
  attendanceHistory: AttendanceRecord[];
  performanceMetrics: PerformanceMetric[];
  totalDaysPresent: number;
  totalDaysAbsent: number;
  totalLateDays: number;
  averageAttendanceRate: number;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: 'present' | 'late' | 'absent' | 'leave';
  notes?: string;
}

export interface TemporaryExitInfo {
  id: string;
  exitTime: string;
  returnTime: string;
  description: string;
}

export interface PointageRecord {
  id: string;
  agentId: string;
  agentName: string;
  division: string;
  checkInAM: string;
  checkOutAM: string;
  checkInPM: string;
  checkOutPM: string;
  status: 'present' | 'late' | 'early-departure' | 'overtime' | 'absent';
  totalMissedTime: string; // Format: "2h 30m"
  temporaryExits: TemporaryExitInfo[];
}

export interface DayStatistics {
  date: string;
  totalAgents: number;
  present: number;
  absent: number;
  late: number;
  attendanceRate: number;
  punctualityRate: number;
  pointageRecords: PointageRecord[];
}

export interface PasswordResetToken {
  token: string;
  userId: string;
  expiresAt: string;
  createdBy: string;
}

export interface Activity {
  id: string;
  type: 'check-in' | 'absence' | 'schedule-change';
  agent: string;
  timestamp: string;
  details: string;
}

// Helper functions that components might use
// These would typically be replaced with API calls

/**
 * Get detailed agent information
 * NOTE: This should be replaced with agentsService.getAgentById()
 */
export const getAgentDetails = async (agentId: string): Promise<AgentDetails> => {
  // Placeholder - in real implementation, this would call the API
  // For now, return mock structure so TypeScript doesn't complain
  return {
    agentId,
    currentSchedule: 'Standard Schedule',
    attendanceHistory: [],
    performanceMetrics: [],
    totalDaysPresent: 0,
    totalDaysAbsent: 0,
    totalLateDays: 0,
    averageAttendanceRate: 0,
  };
};

/**
 * Get daily statistics for a specific date
 * NOTE: This should be replaced with statisticsService API call
 */
export const getDayStatistics = async (date: Date): Promise<DayStatistics> => {
  const dateStr = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0')
  ].join('-');

  const response = await fetch(`${API_CONFIG.BASE_URL}/attendance?date=${dateStr}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`,
    },
  });

  if (!response.ok) {
    console.log("ok reponse");
    throw new Error(`Failed to fetch day statistics: ${response.statusText}`);
  }

  const result = await response.json();
  return result.data;
};


/**
 * Generate password reset token
 * NOTE: This should be replaced with usersService.resetPassword()
 */
export const generatePasswordResetToken = async (
  userId: string,
  performedBy: string,
  performedByRole: string
): Promise<PasswordResetToken> => {
  // Placeholder - in real implementation, this would call the API
  const token = `prt_${Math.random().toString(36).substring(2)}`;
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  
  return {
    token,
    userId,
    expiresAt,
    createdBy: performedBy,
  };
};

/**
 * Reveal user password
 * NOTE: In production, passwords should NEVER be retrievable
 * This should be replaced with usersService.resetPassword()
 */
export const revealUserPassword = async (
  userId: string,
  performedBy: string,
  performedByRole: string
): Promise<string> => {
  // Placeholder - This function shouldn't exist in production
  return 'PlaceholderPassword123!';
};
