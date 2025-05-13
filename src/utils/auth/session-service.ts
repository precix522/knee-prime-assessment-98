
import { STORAGE_KEYS, DEFAULT_SESSION_EXPIRY_TIME, EXTENDED_SESSION_EXPIRY_TIME } from './constants';

export const getStoredSessionId = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.SESSION_ID);
};

export const getStoredSessionExpiry = (): string | null => {
  const expiry = localStorage.getItem(STORAGE_KEYS.SESSION_EXPIRY);
  return expiry;
};

export const getRememberMePreference = (): boolean => {
  return localStorage.getItem(STORAGE_KEYS.REMEMBER_ME) === 'true';
};

export const saveSession = (
  sessionId: string, 
  rememberMe: boolean,
  phone?: string
): { sessionId: string; sessionExpiry: string } => {
  // Use the extended session time if rememberMe is true
  const expiryTime = Date.now() + (rememberMe 
    ? EXTENDED_SESSION_EXPIRY_TIME 
    : DEFAULT_SESSION_EXPIRY_TIME);
  
  localStorage.setItem(STORAGE_KEYS.SESSION_ID, sessionId);
  localStorage.setItem(STORAGE_KEYS.SESSION_EXPIRY, expiryTime.toString());
  
  if (phone) {
    localStorage.setItem(STORAGE_KEYS.AUTHENTICATED_PHONE, phone);
  }
  
  return {
    sessionId,
    sessionExpiry: expiryTime.toString()
  };
};

export const clearSession = () => {
  localStorage.removeItem(STORAGE_KEYS.SESSION_ID);
  localStorage.removeItem(STORAGE_KEYS.SESSION_EXPIRY);
  localStorage.removeItem(STORAGE_KEYS.AUTHENTICATED_PHONE);
};

export const isSessionExpired = (sessionExpiry: string | null): boolean => {
  if (sessionExpiry === null) return true;
  return Date.now() > Number(sessionExpiry);
};

export const setRememberMePreference = (remember: boolean): void => {
  localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, remember.toString());
};
