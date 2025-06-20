import { API_URLS } from '../config/api';

export interface CreateHackathonRequest {
  email: string;
  authToken: string;
  hackathonName: string;
  startDate: string;
  endDate: string;
  registrationStartDate: string;
  registrationEndDate: string;
  tagline: string;
  venue: string;
  about?: string;
  minTeamSize?: number;
  maxTeamSize?: number;
  cashPrize?: {
    name: string;
    amount: number;
  };
  otherPrize?: {
    name: string;
    description: string;
  };
}

export interface UpdateHackathonRequest {
  email: string;
  authToken: string;
  hackathonId: string;
  hackathonName?: string;
  startDate?: string;
  endDate?: string;
  registrationStartDate?: string;
  registrationEndDate?: string;
  tagline?: string;
  venue?: string;
  about?: string;
  minTeamSize?: number;
  maxTeamSize?: number;
  cashPrize?: {
    name: string;
    amount: number;
  };
  otherPrize?: {
    name: string;
    description: string;
  };
}

export interface CreateHackathonResponse {
  message: string;
}

export interface UpdateHackathonResponse {
  message: string;
}

export interface FetchHackathonsRequest {
  email: string;
  authToken: string;
}

export interface FetchSingleHackathonRequest {
  email: string;
  authToken: string;
  hackathonId: string;
}

export interface Hackathon {
  hackathonId: string;
  hackathonName: string;
  startDate: string;
  endDate: string;
  registrationStartDate: string;
  registrationEndDate: string;
  tagline: string;
  venue: string;
  about: string;
  createdBy: string;
  coOrganizers: string[];
  createdAt: string;
  minTeamSize?: number;
  maxTeamSize?: number;
  cashPrize?: {
    name: string;
    amount: number;
  };
  otherPrize?: {
    name: string;
    description: string;
  };
}

export interface FetchHackathonsResponse {
  hackathons: Hackathon[];
}

export interface FetchSingleHackathonResponse {
  hackathon: Hackathon;
}

export interface HackathonError {
  message: string;
}

export class HackathonService {
  static async createHackathon(data: CreateHackathonRequest): Promise<CreateHackathonResponse> {
    try {
      const response = await fetch(API_URLS.CREATE_HACKATHON, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to create hackathon');
      }

      return responseData;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  static async updateHackathon(data: UpdateHackathonRequest): Promise<UpdateHackathonResponse> {
    try {
      const response = await fetch(API_URLS.UPDATE_HACKATHON, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to update hackathon');
      }

      return responseData;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  static async fetchMyHackathons(data: FetchHackathonsRequest): Promise<FetchHackathonsResponse> {
    try {
      const response = await fetch(`${API_URLS.FETCH_MY_HACKATHONS}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to fetch hackathons');
      }

      return responseData;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  static async fetchSingleHackathon(data: FetchSingleHackathonRequest): Promise<FetchSingleHackathonResponse> {
    try {
      // Since your backend doesn't have fetch-single yet, we'll fetch all and filter
      const allHackathons = await this.fetchMyHackathons({
        email: data.email,
        authToken: data.authToken,
      });

      const hackathon = allHackathons.hackathons.find(h => h.hackathonId === data.hackathonId);
      
      if (!hackathon) {
        throw new Error('Hackathon not found');
      }

      return { hackathon };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  static getHackathonStatus(startDate: string, endDate: string, registrationEndDate: string): 'upcoming' | 'ongoing' | 'completed' {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    const regEnd = new Date(registrationEndDate);

    if (now < start) {
      return 'upcoming';
    } else if (now >= start && now <= end) {
      return 'ongoing';
    } else {
      return 'completed';
    }
  }

  static formatDateForInput(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }
}