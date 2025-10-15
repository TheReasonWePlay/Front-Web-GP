/**
 * ============================================================================
 * USE DEBOUNCE HOOK
 * ============================================================================
 * 
 * Custom React hook for debouncing values (delaying updates).
 * Prevents excessive function calls or API requests when values change rapidly.
 * 
 * Common Use Cases:
 * - Search inputs (wait for user to stop typing before searching)
 * - Form validation (validate after user pauses typing)
 * - Window resize handlers
 * - Scroll event handlers
 * 
 * Key Benefits:
 * - Reduces API calls
 * - Improves performance
 * - Better user experience
 * - Prevents network congestion
 * 
 * @module hooks/useDebounce
 */

// --- Dependencies ---
import { useState, useEffect } from 'react';

/**
 * useDebounce Hook
 * 
 * Returns a debounced version of the provided value. The debounced value
 * will only update after the specified delay has passed without the value changing.
 * 
 * How it works:
 * 1. User types "hello" rapidly
 * 2. Each keystroke updates the value
 * 3. Hook waits for the delay period of inactivity
 * 4. Only after the delay (e.g., 500ms) does debouncedValue update
 * 5. If value changes before delay expires, timer resets
 * 
 * @template T - The type of value being debounced
 * 
 * @param {T} value - The value to debounce (e.g., search query, form input)
 * @param {number} delay - Delay in milliseconds (default: 500ms)
 * 
 * @returns {T} The debounced value (updates after delay)
 * 
 * @example
 * // Search with debouncing
 * function SearchComponent() {
 *   const [search, setSearch] = useState('');
 *   const debouncedSearch = useDebounce(search, 500);
 *   
 *   // This effect only runs when user stops typing for 500ms
 *   useEffect(() => {
 *     if (debouncedSearch) {
 *       searchAPI(debouncedSearch);
 *     }
 *   }, [debouncedSearch]);
 *   
 *   return (
 *     <Input 
 *       value={search}
 *       onChange={(e) => setSearch(e.target.value)}
 *       placeholder="Search agents..."
 *     />
 *   );
 * }
 * 
 * @example
 * // Form validation with debouncing
 * function EmailInput() {
 *   const [email, setEmail] = useState('');
 *   const debouncedEmail = useDebounce(email, 800);
 *   
 *   useEffect(() => {
 *     if (debouncedEmail) {
 *       validateEmail(debouncedEmail);
 *     }
 *   }, [debouncedEmail]);
 *   
 *   return <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />;
 * }
 * 
 * @example
 * // API search with useApi hook
 * function AgentsSearch() {
 *   const [query, setQuery] = useState('');
 *   const debouncedQuery = useDebounce(query, 500);
 *   const { data, loading } = useApi(agentsService.getAgents);
 *   
 *   useEffect(() => {
 *     if (debouncedQuery) {
 *       data.execute({ search: debouncedQuery });
 *     }
 *   }, [debouncedQuery]);
 *   
 *   return (
 *     <div>
 *       <Input value={query} onChange={(e) => setQuery(e.target.value)} />
 *       {loading ? <Spinner /> : <Results data={data} />}
 *     </div>
 *   );
 * }
 * 
 * Performance Impact:
 * - Without debounce: 5 characters = 5 API calls
 * - With 500ms debounce: 5 characters = 1 API call (after user stops typing)
 * - Network requests reduced by ~80-90%
 * 
 * Timing Considerations:
 * - 200-300ms: Feels instant, good for local validation
 * - 500ms: Standard for search (balances responsiveness and API load)
 * - 800-1000ms: Good for expensive operations (complex validation, large datasets)
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  // Store the debounced value in state
  // Initially set to the current value
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  // Set up the debounce effect
  useEffect(() => {
    /**
     * Timer Handler
     * 
     * Sets a timeout to update the debounced value after the delay.
     * If the value changes before the delay expires, the timeout is cleared
     * and a new one is set (via the cleanup function).
     */
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    /**
     * Cleanup Function
     * 
     * Cancels the pending timeout when:
     * - Component unmounts
     * - Value changes (before delay expires)
     * - Delay changes
     * 
     * This prevents memory leaks and ensures only the latest value
     * update timer is active.
     */
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Re-run effect when value or delay changes

  // Return the debounced value (not the immediate value)
  return debouncedValue;
}

/**
 * Usage Patterns & Best Practices
 * 
 * 1. Search Inputs:
 *    - Use 500ms delay for good balance
 *    - Clear results when query is empty
 *    - Show loading indicator during API call
 * 
 * 2. Form Validation:
 *    - Use 300-500ms delay
 *    - Don't validate while user is actively typing
 *    - Show validation errors after debounced value updates
 * 
 * 3. Auto-save:
 *    - Use 1000-2000ms delay
 *    - Show "Saving..." indicator
 *    - Handle save failures gracefully
 * 
 * 4. Filtering:
 *    - Use 300-500ms delay
 *    - Apply filters to local data immediately for instant feedback
 *    - Use debounced value for API calls
 * 
 * Common Mistakes to Avoid:
 * 
 * ❌ Don't use for buttons/clicks (use throttle instead)
 * ❌ Don't use very short delays (<200ms) - wastes resources
 * ❌ Don't use very long delays (>2000ms) - poor UX
 * ❌ Don't forget to handle empty/null values
 * 
 * ✅ Use for text inputs
 * ✅ Use for search queries
 * ✅ Use for form fields
 * ✅ Use appropriate delay for use case
 */
