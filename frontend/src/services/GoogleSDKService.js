import { API_CONFIG } from './ApiService';

// Google SDK Service - Single Responsibility for Google SDK operations
export class GoogleSDKService {
  constructor() {
    this.isLoaded = false;
    this.callbacks = [];
  }

  async loadSDK() {
    if (this.isLoaded || window.google) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;

      script.onload = () => {
        this.isLoaded = true;
        this.initializeGoogleAuth();
        resolve();
      };

      script.onerror = () => {
        reject(new Error('Failed to load Google SDK'));
      };

      document.head.appendChild(script);
    });
  }

  initializeGoogleAuth() {
    if (window.google && window.google.accounts) {
      window.google.accounts.id.initialize({
        client_id: API_CONFIG.GOOGLE_CLIENT_ID,
        callback: (response) => {
          this.callbacks.forEach(callback => callback(response));
        },
      });
    }
  }

  onCredentialResponse(callback) {
    this.callbacks.push(callback);
  }

  prompt() {
    if (window.google && window.google.accounts) {
      window.google.accounts.id.prompt();
    } else {
      throw new Error('Google SDK not loaded');
    }
  }

  cleanup() {
    this.callbacks = [];
  }
}

export const googleSDKService = new GoogleSDKService();
