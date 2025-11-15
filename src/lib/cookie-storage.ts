// lib/cookie-storage.ts
import Cookies from 'js-cookie';

/**
 * Cookie storage adapter for Jotai atoms
 * Provides synchronous storage using browser cookies
 */
export const cookieStorage = {
  getItem: (key: string): string | null => {
    try {
      const value = Cookies.get(key);
      console.log(`cookieStorage getItem: ${key} =`, value);
      return value || null;
    } catch (error) {
      console.error(`Error reading cookie ${key}:`, error);
      return null;
    }
  },
  
  setItem: (key: string, value: unknown): void => {
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      console.log(`cookieStorage setItem: ${key} =`, stringValue);
      
      // Set cookie with security options
      Cookies.set(key, stringValue, {
        expires: 365, // 1 year
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
      });
    } catch (error) {
      console.error(`Error setting cookie ${key}:`, error);
    }
  },
  
  removeItem: (key: string): void => {
    try {
      console.log(`cookieStorage removeItem: ${key}`);
      Cookies.remove(key, { path: '/' });
    } catch (error) {
      console.error(`Error removing cookie ${key}:`, error);
    }
  }
};