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
  } | Record<string, number>; // Support both formats
  otherPrize?: {
    name: string;
    description: string;
  } | Record<string, string>; // Support both formats
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
  } | Record<string, number>;
  otherPrize?: {
    name: string;
    description: string;
  } | Record<string, string>;
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

export interface FetchAllHackathonsRequest {
  email?: string; // Optional for non-authenticated users
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
  } | Record<string, number>;
  otherPrize?: {
    name: string;
    description: string;
  } | Record<string, string>;
}

export interface PublicHackathon {
  _id: string;
  hackathonId: string;
  hackathonName: string;
  startDate: string;
  endDate: string;
  registrationStartDate: string;
  registrationEndDate: string;
  tagline: string;
  venue: string;
  about: string;
  createdAt: string;
  participantCount: number;
  isRegistered: boolean; // New field from backend
  minTeamSize?: number;
  maxTeamSize?: number;
  cashPrize?: {
    name: string;
    amount: number;
  } | Record<string, number>; // Support both formats from backend
  otherPrize?: {
    name: string;
    description: string;
  } | Record<string, string>; // Support both formats from backend
}

export interface FetchHackathonsResponse {
  hackathons: Hackathon[];
}

export interface FetchAllHackathonsResponse {
  hackathons: PublicHackathon[];
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

  static async fetchAllHackathons(userEmail?: string): Promise<FetchAllHackathonsResponse> {
    try {
      // Now requires email in request body to check registration status
      const requestBody = userEmail ? { email: userEmail } : {};
      
      console.log('Fetching all hackathons with request body:', requestBody);
      
      const response = await fetch(API_URLS.FETCH_ALL_HACKATHONS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const responseData = await response.json();
      console.log('Fetch all hackathons response:', responseData);

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to fetch hackathons');
      }

      return responseData;
    } catch (error) {
      console.error('Error in fetchAllHackathons:', error);
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

  static getRegistrationStatus(registrationStartDate: string, registrationEndDate: string): 'not-started' | 'open' | 'closed' {
    const now = new Date();
    const regStart = new Date(registrationStartDate);
    const regEnd = new Date(registrationEndDate);

    if (now < regStart) {
      return 'not-started';
    } else if (now >= regStart && now <= regEnd) {
      return 'open';
    } else {
      return 'closed';
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

  static formatDisplayDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  static calculateTotalCashPrize(hackathon: PublicHackathon): number {
    if (!hackathon.cashPrize) return 0;
    
    // Handle both formats from backend
    if (typeof hackathon.cashPrize === 'object') {
      // If it's the new format with name/amount
      if ('amount' in hackathon.cashPrize) {
        return hackathon.cashPrize.amount;
      }
      
      // If it's the old format with multiple prizes (like "1st Prize": 1000)
      return Object.values(hackathon.cashPrize).reduce((total, amount) => {
        return total + (typeof amount === 'number' ? amount : 0);
      }, 0);
    }
    
    return 0;
  }

  static formatPrizeDisplay(hackathon: PublicHackathon): { cashPrizes: Array<{name: string, amount: number}>, otherPrizes: Array<{name: string, description: string}> } {
    const cashPrizes: Array<{name: string, amount: number}> = [];
    const otherPrizes: Array<{name: string, description: string}> = [];

    // Handle cash prizes
    if (hackathon.cashPrize) {
      if ('amount' in hackathon.cashPrize && 'name' in hackathon.cashPrize) {
        // New format
        cashPrizes.push({
          name: hackathon.cashPrize.name,
          amount: hackathon.cashPrize.amount
        });
      } else {
        // Old format - multiple prizes
        Object.entries(hackathon.cashPrize).forEach(([name, amount]) => {
          if (typeof amount === 'number') {
            cashPrizes.push({ name, amount });
          }
        });
      }
    }

    // Handle other prizes
    if (hackathon.otherPrize) {
      if ('description' in hackathon.otherPrize && 'name' in hackathon.otherPrize) {
        // New format
        otherPrizes.push({
          name: hackathon.otherPrize.name,
          description: hackathon.otherPrize.description
        });
      } else {
        // Old format - multiple prizes
        Object.entries(hackathon.otherPrize).forEach(([name, description]) => {
          if (typeof description === 'string') {
            otherPrizes.push({ name, description });
          }
        });
      }
    }

    return { cashPrizes, otherPrizes };
  }
}