export interface UploadPDFRequest {
  teamCode: string;
  file: File;
}

export interface UploadPDFResponse {
  message: string;
  team_code: string;
  filename: string;
}

export interface ListTeamsResponse {
  teams: string[];
}

export interface PDFError {
  message: string;
}

export class PDFService {
  private static readonly PDF_UPLOAD_URL = 'https://server.aimliedc.tech/h4b-pdf-idea/upload-pdf/';
  private static readonly LIST_TEAMS_URL = 'https://server.aimliedc.tech/h4b-pdf-idea/list-teams';

  static async uploadPDF(data: UploadPDFRequest): Promise<UploadPDFResponse> {
    try {
      console.log('Uploading PDF for team:', data.teamCode);
      
      const formData = new FormData();
      formData.append('team_code', data.teamCode);
      formData.append('file', data.file);

      const response = await fetch(this.PDF_UPLOAD_URL, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
        },
        body: formData,
      });

      const responseData = await response.json();
      console.log('PDF upload response:', responseData);

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to upload PDF');
      }

      return responseData;
    } catch (error) {
      console.error('PDF upload error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  static async listTeams(): Promise<ListTeamsResponse> {
    try {
      console.log('Fetching list of teams with uploaded PDFs');
      
      const response = await fetch(this.LIST_TEAMS_URL, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
        },
      });

      const responseData = await response.json();
      console.log('List teams response:', responseData);

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to fetch teams list');
      }

      return responseData;
    } catch (error) {
      console.error('List teams error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  static async checkPDFUploaded(teamCode: string): Promise<boolean> {
    try {
      const teamsResponse = await this.listTeams();
      return teamsResponse.teams.includes(teamCode);
    } catch (error) {
      console.error('Error checking PDF upload status:', error);
      return false; // Assume not uploaded if we can't check
    }
  }
}