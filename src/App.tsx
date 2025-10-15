/**
 * ============================================================================
 * APP.TSX - MAIN APPLICATION COMPONENT
 * ============================================================================
 * 
 * This is the root component of the Staff Attendance Management System.
 * It sets up the application structure with routing, authentication, and theming.
 * 
 * Key Features:
 * - Role-based access control (Admin, Manager, Agent)
 * - Protected routes requiring authentication
 * - Theme management (light/dark mode)
 * - Centralized routing configuration
 * 
 * @module App
 * @requires react-router-dom - Client-side routing
 * @requires ./lib/theme-context - Theme management
 * @requires ./lib/auth-context - Authentication and authorization
 */

// --- Core Dependencies ---
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';

// --- Context Providers ---
import { ThemeProvider } from './lib/theme-context';
import { AuthProvider } from './lib/auth-context';

// --- Route Protection Components ---
import { ProtectedRoute } from './components/ProtectedRoute';
import { RoleBasedRoute } from './components/RoleBasedRoute';

// --- Layout & Navigation ---
import { Layout } from './components/Layout';

// --- Page Components ---
import { Login } from './components/pages/Login';
import { Dashboard } from './components/pages/Dashboard';
import { AgentsManagement } from './components/pages/AgentsManagement';
import { WorkSchedules } from './components/pages/WorkSchedules';
import { CalendarHolidays } from './components/pages/CalendarHolidays';
import { Statistics } from './components/pages/Statistics';
import { Settings } from './components/pages/Settings';
import { PersonalHistory } from './components/pages/PersonalHistory';

// --- UI Components ---
import { Toaster } from './components/ui/sonner';

/**
 * Main Application Component
 * 
 * Sets up the application with:
 * 1. ThemeProvider - Manages light/dark mode across the app
 * 2. AuthProvider - Manages user authentication and role-based access
 * 3. HashRouter - Handles client-side routing
 * 4. Routes - Defines all application routes with role-based protection
 * 5. Toaster - Global toast notification system
 * 
 * @returns {JSX.Element} The complete application with all providers and routes
 */
export default function App() {
  return (
    // --- Theme Management Layer ---
    // Wraps the entire app to provide theme context (light/dark mode)
    <ThemeProvider>
      {/* --- Authentication Layer --- */}
      {/* Wraps the app to provide authentication and user context */}
      <AuthProvider>
        {/* --- Routing Layer --- */}
        {/* Uses HashRouter for compatibility with static hosting */}
        <HashRouter>
          <Routes>
            {/* ============================================ */}
            {/* PUBLIC ROUTES - No authentication required */}
            {/* ============================================ */}
            
            {/* Login Page - Entry point for unauthenticated users */}
            <Route path="/login" element={<Login />} />
            
            {/* ================================================ */}
            {/* PROTECTED ROUTES - Require authentication */}
            {/* ================================================ */}
            
            {/* 
              Main layout route - All authenticated pages are nested here
              ProtectedRoute ensures user is logged in before accessing
            */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              {/* --- Admin & Manager Routes --- */}
              
              {/* 
                Dashboard (Home) - Analytics and KPIs
                Roles: Admin, Manager
                Landing page for Admin and Manager users
              */}
              <Route 
                index 
                element={
                  <RoleBasedRoute allowedRoles={['Admin', 'Manager']}>
                    <Dashboard />
                  </RoleBasedRoute>
                } 
              />
              
              {/* 
                Agents Management - Staff directory and management
                Roles: Admin (full CRUD), Manager (view-only)
                Managers can view but cannot add/edit/delete agents
              */}
              <Route 
                path="agents" 
                element={
                  <RoleBasedRoute allowedRoles={['Admin', 'Manager']}>
                    <AgentsManagement />
                  </RoleBasedRoute>
                } 
              />
              
              {/* 
                Work Schedules - Time configuration and schedule management
                Roles: Admin, Manager
                Configure work hours and assign schedules to staff
              */}
              <Route 
                path="schedules" 
                element={
                  <RoleBasedRoute allowedRoles={['Admin', 'Manager']}>
                    <WorkSchedules />
                  </RoleBasedRoute>
                } 
              />
              
              {/* 
                Calendar & Holidays - Holiday management and calendar view
                Roles: Admin, Manager
                View monthly calendar and manage public holidays
              */}
              <Route 
                path="calendar" 
                element={
                  <RoleBasedRoute allowedRoles={['Admin', 'Manager']}>
                    <CalendarHolidays />
                  </RoleBasedRoute>
                } 
              />
              
              {/* 
                Statistics & Reports - Attendance analytics and reports
                Roles: Admin, Manager
                View charts, generate reports, and export data
              */}
              <Route 
                path="statistics" 
                element={
                  <RoleBasedRoute allowedRoles={['Admin', 'Manager']}>
                    <Statistics />
                  </RoleBasedRoute>
                } 
              />
              
              {/* --- Agent-Only Routes --- */}
              
              {/* 
                Personal History - Agent's own attendance records
                Roles: Agent
                Agents can view their attendance, performance, and print QR code
                This is the landing page for Agent users
              */}
              <Route 
                path="personal-history" 
                element={
                  <RoleBasedRoute allowedRoles={['Agent']}>
                    <PersonalHistory />
                  </RoleBasedRoute>
                } 
              />
              
              {/* --- Common Routes (All Roles) --- */}
              
              {/* 
                Settings - System settings and preferences
                Roles: All (but with different tab access)
                - All users: General settings (theme, appearance)
                - Admin only: User Management, Security settings
              */}
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* ============================================ */}
            {/* FALLBACK ROUTE - Handle unknown URLs */}
            {/* ============================================ */}
            
            {/* 
              Redirect any unknown routes to login page
              Users will be redirected to their role-specific landing page after login
            */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
          
          {/* --- Global Toast Notifications --- */}
          {/* 
            Displays success, error, and info messages throughout the app
            Position: top-right, with colored icons
          */}
          <Toaster position="top-right" richColors />
        </HashRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
