
// Default session duration: 2 hours
export const DEFAULT_SESSION_EXPIRY_TIME = 2 * 60 * 60 * 1000;

// Extended session duration: 30 days
export const EXTENDED_SESSION_EXPIRY_TIME = 30 * 24 * 60 * 60 * 1000;

// Local storage keys
export const STORAGE_KEYS = {
  SESSION_ID: 'gator_prime_session_id',
  SESSION_EXPIRY: 'gator_prime_session_expiry',
  REMEMBER_ME: 'gator_prime_remember_me',
  AUTHENTICATED_PHONE: 'authenticatedPhone'
};
