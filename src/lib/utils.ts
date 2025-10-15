/**
 * ============================================================================
 * UTILITY FUNCTIONS
 * ============================================================================
 * 
 * Common utility functions used throughout the application.
 * 
 * @module lib/utils
 */

/**
 * Get Initials from Name
 * 
 * Extracts 1-2 uppercase initials from a person's name for display in avatars.
 * 
 * Rules:
 * - Single word: First letter (e.g., "John" → "J")
 * - Two+ words: First letter of first two words (e.g., "John Doe" → "JD")
 * - Empty/whitespace: Returns "?" as fallback
 * 
 * @param {string} name - Full name of the person
 * @returns {string} Uppercase initials (1-2 characters)
 * 
 * @example
 * getInitials("John Doe")        // "JD"
 * getInitials("Alice")           // "A"
 * getInitials("Bob Smith Jr")    // "BS"
 * getInitials("Jean-Paul Martin") // "JM"
 * getInitials("")                // "?"
 * getInitials("   ")             // "?"
 */
export function getInitials(name: string): string {
  // Handle empty or whitespace-only names
  if (!name || !name.trim()) {
    return '?';
  }

  // Split name into words and filter out empty strings
  const words = name.trim().split(/\s+/).filter(word => word.length > 0);
  
  // No valid words found
  if (words.length === 0) {
    return '?';
  }
  
  // Single word: return first character
  if (words.length === 1) {
    return words[0][0].toUpperCase();
  }
  
  // Multiple words: return first character of first two words
  return (words[0][0] + words[1][0]).toUpperCase();
}

/**
 * Class Name Merge Utility
 * 
 * Merges multiple class names, filtering out falsy values.
 * Useful for conditional class application.
 * 
 * @param {...(string | undefined | null | false)} classes - Class names to merge
 * @returns {string} Combined class name string
 * 
 * @example
 * cn("base-class", isActive && "active", "another-class")
 * // If isActive=true: "base-class active another-class"
 * // If isActive=false: "base-class another-class"
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Format Date to Locale String
 * 
 * Formats an ISO date string to a readable format.
 * 
 * @param {string} dateString - ISO date string (e.g., "2025-10-10")
 * @param {string} locale - Locale for formatting (default: 'en-US')
 * @returns {string} Formatted date string
 * 
 * @example
 * formatDate("2025-10-10")  // "Oct 10, 2025"
 */
export function formatDate(dateString: string, locale: string = 'en-US'): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
}

/**
 * Format Time String
 * 
 * Formats a time string (HH:mm) to 12-hour format.
 * 
 * @param {string} timeString - Time in HH:mm format (e.g., "14:30")
 * @returns {string} Formatted time (e.g., "2:30 PM")
 * 
 * @example
 * formatTime("09:00")  // "9:00 AM"
 * formatTime("17:30")  // "5:30 PM"
 */
export function formatTime(timeString: string): string {
  try {
    const [hours, minutes] = timeString.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  } catch {
    return timeString;
  }
}
