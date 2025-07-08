// Utility functions for handling Firebase timestamps

/**
 * Convert Firebase timestamp to readable time string
 * @param {Object|Date|string|number} timestamp - Firebase timestamp object or regular timestamp
 * @returns {string} - Formatted time string
 */
export const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'Unknown';
  
  let date;
  
  // Handle Firebase timestamp
  if (timestamp?._seconds) {
    date = new Date(timestamp._seconds * 1000);
  } 
  // Handle regular Date object or timestamp
  else if (timestamp instanceof Date) {
    date = timestamp;
  } 
  // Handle string or number timestamp
  else {
    date = new Date(timestamp);
  }

  // Check if date is valid
  if (isNaN(date.getTime())) {
    return 'Unknown';
  }

  const now = new Date();
  const diffInMs = now - date;
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInDays > 0) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  } else if (diffInHours > 0) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  } else if (diffInMinutes > 0) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
};

/**
 * Convert Firebase timestamp to Date object
 * @param {Object|Date|string|number} timestamp - Firebase timestamp object or regular timestamp
 * @returns {Date} - Date object
 */
export const timestampToDate = (timestamp) => {
  if (!timestamp) return new Date();
  
  // Handle Firebase timestamp
  if (timestamp?._seconds) {
    return new Date(timestamp._seconds * 1000);
  } 
  // Handle regular Date object or timestamp
  else if (timestamp instanceof Date) {
    return timestamp;
  } 
  // Handle string or number timestamp
  else {
    return new Date(timestamp);
  }
};

/**
 * Convert Firebase timestamp to ISO string
 * @param {Object|Date|string|number} timestamp - Firebase timestamp object or regular timestamp
 * @returns {string} - ISO string
 */
export const timestampToISO = (timestamp) => {
  const date = timestampToDate(timestamp);
  return date.toISOString();
};

/**
 * Convert Firebase timestamp to locale string
 * @param {Object|Date|string|number} timestamp - Firebase timestamp object or regular timestamp
 * @param {string} locale - Locale string (default: 'en-US')
 * @returns {string} - Locale string
 */
export const timestampToLocale = (timestamp, locale = 'en-US') => {
  const date = timestampToDate(timestamp);
  return date.toLocaleString(locale);
};

/**
 * Check if a value is a Firebase timestamp
 * @param {any} value - Value to check
 * @returns {boolean} - True if it's a Firebase timestamp
 */
export const isFirebaseTimestamp = (value) => {
  return value && typeof value === 'object' && '_seconds' in value && '_nanoseconds' in value;
}; 