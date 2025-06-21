import { API_URLS } from '../config/api';

export interface CreateTeamRequest {
  email: string;
  authToken: string;
  teamName: string;
  hackathonId: string;
}

export interface JoinTeamRequest {
  email: string;
  authToken: string;
  teamCode: string;
  hackathonId: string;
}

export interface SubmitTeamRequest {
  email: string;
  authToken: string;
  teamCode: string;
  hackathonId: string;
}

export interface CheckTeamPresenceRequest {
  email: string;
  authToken: string;
}

export interface TeamMember {
  name: string;
  email: string;
}

export interface CreateTeamResponse {
  message: string;
  teamId: string;
  availableMembers: TeamMember[];
}

export interface JoinTeamResponse {
  message: string;
  status: string;
  teamMembers: TeamMember[];
}

export interface SubmitTeamResponse {
  message: string;
}

export interface CheckTeamPresenceResponse {
  team?: {
    teamId: string;
    teamName: string;
    members: TeamMember[];
    leader: TeamMember;
    submitted: boolean;
  };
  message?: string;
}

export interface TeamError {
  message: string;
}

export class TeamService {
  static async createTeam(data: CreateTeamRequest): Promise<CreateTeamResponse> {
    try {
      console.log('Creating team with data:', data);
      
      const response = await fetch(API_URLS.CREATE_TEAM, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();
      console.log('Create team response:', responseData);

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to create team');
      }

      return responseData;
    } catch (error) {
      console.error('Create team error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  static async joinTeam(data: JoinTeamRequest): Promise<JoinTeamResponse> {
    try {
      console.log('Joining team with data:', data);
      
      const response = await fetch(API_URLS.JOIN_TEAM, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();
      console.log('Join team response:', responseData);

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to join team');
      }

      return responseData;
    } catch (error) {
      console.error('Join team error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  static async submitTeam(data: SubmitTeamRequest): Promise<SubmitTeamResponse> {
    try {
      console.log('Submitting team with data:', data);
      
      const response = await fetch(API_URLS.SUBMIT_TEAM, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();
      console.log('Submit team response:', responseData);

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to submit team');
      }

      return responseData;
    } catch (error) {
      console.error('Submit team error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  static async checkTeamPresence(data: CheckTeamPresenceRequest): Promise<CheckTeamPresenceResponse> {
    try {
      console.log('Checking team presence with data:', data);
      
      const response = await fetch(API_URLS.CHECK_TEAM_PRESENCE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();
      console.log('Check team presence response:', responseData);

      // Handle 404 as a valid "no team found" response
      if (response.status === 404 && responseData.message === 'No team found for this user.') {
        console.log('No team found for user - returning empty response');
        return { message: responseData.message };
      }

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to check team presence');
      }

      return responseData;
    } catch (error) {
      console.error('Check team presence error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }
}