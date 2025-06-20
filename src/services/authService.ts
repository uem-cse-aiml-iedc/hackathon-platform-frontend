import { API_URLS } from '../config/api';

export interface OTPRequestResponse {
  message: string;
}

export interface OTPVerifyResponse {
  email: string;
  authToken: string;
  name: string;
}

export interface UpdateNameResponse {
  message: string;
  name: string;
}

export interface AuthError {
  message: string;
}

export class AuthService {
  static async requestOTP(email: string): Promise<OTPRequestResponse> {
    try {
      const response = await fetch(API_URLS.REQUEST_OTP, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send OTP');
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  static async verifyOTP(email: string, otp: string): Promise<OTPVerifyResponse> {
    try {
      const response = await fetch(API_URLS.VERIFY_OTP, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to verify OTP');
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  static async updateName(email: string, authToken: string, name: string): Promise<UpdateNameResponse> {
    try {
      const response = await fetch(API_URLS.UPDATE_NAME, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          authToken, 
          name 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update name');
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }
}