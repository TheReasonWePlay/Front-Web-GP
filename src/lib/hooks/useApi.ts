/**
 * ============================================================================
 * USE API HOOK
 * ============================================================================
 * 
 * Custom React hook for managing API call state (data, loading, error).
 * Provides a consistent pattern for making API calls throughout the application.
 * 
 * Key Features:
 * - Automatic loading state management
 * - Error handling with descriptive messages
 * - Data state management
 * - Reset functionality to clear state
 * - Type-safe with TypeScript generics
 * 
 * @module hooks/useApi
 */

// --- Dependencies ---
import { useState, useCallback } from 'react';
import type { ApiResponse } from '../api/types';

/**
 * API State Interface
 * 
 * Represents the internal state of an API call.
 * 
 * @template T - The type of data being fetched
 * 
 * @property {T | null} data - The fetched data (null if not loaded or error)
 * @property {boolean} loading - Whether the API call is in progress
 * @property {string | null} error - Error message (null if no error)
 */
interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * API Hook Return Interface
 * 
 * The return value of the useApi hook.
 * Extends UseApiState with execute and reset functions.
 * 
 * @template T - The type of data being fetched
 * 
 * @property {T | null} data - The fetched data
 * @property {boolean} loading - Loading state
 * @property {string | null} error - Error message
 * @property {Function} execute - Function to trigger the API call
 * @property {Function} reset - Function to reset state to initial values
 */
interface UseApiReturn<T> extends UseApiState<T> {
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
}

/**
 * useApi Hook
 * 
 * Wraps an API service method with automatic state management.
 * Handles loading, error, and data states automatically.
 * 
 * @template T - The type of data expected from the API call
 * 
 * @param {Function} apiFunction - The API service method to call
 *                                 Should return Promise<ApiResponse<T>>
 * 
 * @returns {UseApiReturn<T>} Object with data, loading, error, execute, and reset
 * 
 * State Flow:
 * 1. Initial: { data: null, loading: false, error: null }
 * 2. Execute called: { data: null, loading: true, error: null }
 * 3a. Success: { data: T, loading: false, error: null }
 * 3b. Error: { data: null, loading: false, error: string }
 * 
 * @example
 * // Basic usage
 * function AgentsList() {
 *   const { data, loading, error, execute } = useApi(agentsService.getAgents);
 * 
 *   useEffect(() => {
 *     execute({ page: 1, pageSize: 10 });
 *   }, []);
 * 
 *   if (loading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error}</div>;
 *   if (!data) return null;
 * 
 *   return <div>{data.data.map(agent => ...)}</div>;
 * }
 * 
 * @example
 * // With manual refetch
 * function AgentsList() {
 *   const { data, loading, execute } = useApi(agentsService.getAgents);
 * 
 *   const handleRefresh = () => {
 *     execute({ page: 1, pageSize: 10 });
 *   };
 * 
 *   return (
 *     <div>
 *       <button onClick={handleRefresh}>Refresh</button>
 *       {loading ? <Skeleton /> : <AgentCards agents={data?.data} />}
 *     </div>
 *   );
 * }
 * 
 * @example
 * // With reset functionality
 * function SearchForm() {
 *   const { data, execute, reset } = useApi(agentsService.getAgents);
 * 
 *   const handleSearch = (query: string) => {
 *     if (query) {
 *       execute({ search: query });
 *     } else {
 *       reset(); // Clear results when search is cleared
 *     }
 *   };
 * 
 *   return <input onChange={(e) => handleSearch(e.target.value)} />;
 * }
 */
export function useApi<T = any>(
  apiFunction: (...args: any[]) => Promise<ApiResponse<T>>
): UseApiReturn<T> {
  // Initialize state with default values
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  /**
   * Execute Function
   * 
   * Calls the API service method with provided arguments.
   * Automatically manages loading, error, and data states.
   * 
   * @param {...any} args - Arguments to pass to the API function
   * @returns {Promise<T | null>} The data on success, null on error
   * 
   * Flow:
   * 1. Set loading to true, clear error and data
   * 2. Call API function with provided arguments
   * 3. On success: Extract data from response, set data, clear loading
   * 4. On error: Extract error message, set error, clear loading
   */
  const execute = useCallback(
    async (...args: any[]): Promise<T | null> => {
      // Set loading state, clear previous data/error
      setState({ data: null, loading: true, error: null });

      try {
        // Call the API function with provided arguments
        const response = await apiFunction(...args);

        // Check if API call was successful
        if (response.success && response.data) {
          // Success: Store data and clear loading
          setState({ data: response.data, loading: false, error: null });
          return response.data;
        } else {
          // API returned error: Store error message
          const errorMessage = response.error || 'An error occurred';
          setState({ data: null, loading: false, error: errorMessage });
          return null;
        }
      } catch (error) {
        // Network or parsing error: Extract message
        const errorMessage =
          error instanceof Error ? error.message : 'An unexpected error occurred';
        setState({ data: null, loading: false, error: errorMessage });
        return null;
      }
    },
    [apiFunction] // Recreate only if apiFunction reference changes
  );

  /**
   * Reset Function
   * 
   * Resets the hook state to initial values.
   * Useful for clearing results or resetting form state.
   * 
   * @example
   * const { data, reset } = useApi(agentsService.getAgents);
   * 
   * const handleClear = () => {
   *   reset(); // Clear all data and errors
   * };
   */
  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  // Return state and control functions
  return {
    ...state,
    execute,
    reset,
  };
}

/**
 * useApiQuery Hook (Auto-Execute Variant)
 * 
 * Extended version of useApi that automatically executes the API call
 * when the component mounts or when dependencies change.
 * 
 * Useful for data that should be loaded immediately.
 * 
 * @template T - The type of data expected from the API call
 * 
 * @param {Function} apiFunction - The API service method to call
 * @param {any[]} args - Arguments to pass to the API function
 * @param {any[]} dependencies - React dependencies array (like useEffect)
 * 
 * @returns {UseApiReturn<T>} Same as useApi
 * 
 * @example
 * // Automatically fetch on mount
 * function AgentProfile({ agentId }) {
 *   const { data, loading, error } = useApiQuery(
 *     agentsService.getAgentById,
 *     [agentId],
 *     [agentId] // Refetch when agentId changes
 *   );
 * 
 *   if (loading) return <Skeleton />;
 *   if (error) return <Alert>{error}</Alert>;
 * 
 *   return <AgentDetails agent={data} />;
 * }
 * 
 * @note This is a convenience wrapper around useApi with automatic execution.
 *       For more control, use useApi directly with useEffect.
 */
export function useApiQuery<T = any>(
  apiFunction: (...args: any[]) => Promise<ApiResponse<T>>,
  args: any[] = [],
  dependencies: any[] = []
) {
  // Use the base useApi hook
  const api = useApi<T>(apiFunction);

  // Execute the API call on mount (using useState instead of useEffect is intentional here)
  // This ensures the call happens synchronously during the render phase
  useState(() => {
    api.execute(...args);
  });

  return api;
}
