import { API_URLS } from '../config/api';

export interface RegisterForHackathonRequest {
  email: string;
  authToken: string;
  hackathonId: string;
  foodPreference: string;
  githubLink: string;
  linkedinLink: string;
  bio: string;
  phoneNo: string;
  skills: string[];
}

export interface RegisterForHackathonResponse {
  message: string;
}

export interface RegistrationError {
  message: string;
}

export class RegistrationService {
  static async registerForHackathon(data: RegisterForHackathonRequest): Promise<RegisterForHackathonResponse> {
    try {
      console.log('Sending registration request:', data);
      
      const response = await fetch(API_URLS.REGISTER_FOR_HACKATHON, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();
      console.log('Registration response:', responseData);

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to register for hackathon');
      }

      return responseData;
    } catch (error) {
      console.error('Registration error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }
}