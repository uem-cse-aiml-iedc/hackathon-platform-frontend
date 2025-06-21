import { API_URLS } from '../config/api';

export interface VolunteerAssignRequest {
  secretCode: string;
  email: string;
}

export interface VolunteerAssignResponse {
  message: string;
}

export interface VolunteerError {
  message: string;
}

export class VolunteerService {
  static async assignLogistics(data: VolunteerAssignRequest): Promise<VolunteerAssignResponse> {
    try {
      console.log('Assigning logistics with data:', data);
      
      const response = await fetch(`${API_URLS.VOLUNTEER_ASSIGN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();
      console.log('Volunteer assign response:', responseData);

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to assign logistics');
      }

      return responseData;
    } catch (error) {
      console.error('Volunteer assign error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }
}