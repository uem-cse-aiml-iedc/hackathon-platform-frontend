import { API_URLS } from '../config/api';

export interface AddLogisticsRequest {
  email: string;
  authToken: string;
  hackathonId: string;
  logisticsName: string;
  totalQuantity: number;
}

export interface FetchLogisticsRequest {
  email: string;
  authToken: string;
  hackathonId: string;
}

export interface LogisticsItem {
  _id: string;
  logisticsId: string;
  hackathonId: string;
  logisticsName: string;
  totalQuantity: number;
  givenAway: number;
  secretCode: string;
  participants: any[];
  createdAt: string;
}

export interface AddLogisticsResponse {
  message: string;
  logisticsId: string;
  secretCode: string;
}

export interface FetchLogisticsResponse {
  message: string;
  logistics: LogisticsItem[];
}

export interface LogisticsError {
  message: string;
}

export class LogisticsService {
  static async addLogistics(data: AddLogisticsRequest): Promise<AddLogisticsResponse> {
    try {
      console.log('Adding logistics with data:', data);
      
      const response = await fetch(API_URLS.ADD_LOGISTICS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();
      console.log('Add logistics response:', responseData);

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to add logistics');
      }

      return responseData;
    } catch (error) {
      console.error('Add logistics error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  static async fetchLogistics(data: FetchLogisticsRequest): Promise<FetchLogisticsResponse> {
    try {
      console.log('Fetching logistics with data:', data);
      
      const response = await fetch(API_URLS.FETCH_LOGISTICS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();
      console.log('Fetch logistics response:', responseData);

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to fetch logistics');
      }

      return responseData;
    } catch (error) {
      console.error('Fetch logistics error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  static calculateRemaining(totalQuantity: number, givenAway: number): number {
    return Math.max(0, totalQuantity - givenAway);
  }

  static formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}