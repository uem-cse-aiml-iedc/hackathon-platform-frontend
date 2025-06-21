export interface Mentor {
  name: string;
  email: string;
  skills: string[];
}

export interface PPTData {
  teamId: string;
  keywords: string[];
  pdfData?: string; // Base64 encoded PDF data
}

export interface MentorAllocation {
  mentorName: string;
  mentorEmail: string;
  mentorSkills: string[];
  teamId: string;
  pptKeywords: string[];
  matchScore: number;
  matchedSkills?: string[];
  pdfDownloadLink?: string; // New field for PDF download link
}

export interface AllocationResult {
  allocations: MentorAllocation[];
  summary: {
    totalMentors: number;
    totalPPTs: number;
    allocatedPPTs: number;
    averageMatchScore: number;
  };
}

export interface AllocationRequest {
  hackathonId: string;
  mentors: Mentor[];
  ppts: PPTData[];
}

export interface MentorAllocationError {
  message: string;
}

export class MentorAllocationService {
  private static readonly MENTOR_API_URL = 'https://server.aimliedc.tech/h4b-backend/mentor?option=fetch-pdfs';
  private static readonly PDF_BASE_URL = 'https://server.aimliedc.tech/h4b-pdf-idea/get-pdf/';

  static async fetchPPTs(hackathonId: string): Promise<PPTData[]> {
    try {
      console.log('Fetching PPTs for hackathon:', hackathonId);
      
      const response = await fetch(this.MENTOR_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ hackathonId }),
      });

      const responseData = await response.json();
      console.log('PPT fetch response:', responseData);

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to fetch PPTs');
      }

      // Transform the response to extract keywords from PDFs using AI
      const pptData: PPTData[] = [];
      
      if (responseData.pdfResults && responseData.pdfResults.length > 0) {
        for (const pdfResult of responseData.pdfResults) {
          if (pdfResult.pdfData && !pdfResult.error) {
            try {
              // Use Gemini to extract keywords from PDF content
              const keywords = await this.extractKeywordsFromPDF(pdfResult.pdfData);
              pptData.push({
                teamId: pdfResult.teamId,
                keywords: keywords,
                pdfData: pdfResult.pdfData,
              });
            } catch (error) {
              console.error(`Error extracting keywords for team ${pdfResult.teamId}:`, error);
              // Add with empty keywords if extraction fails
              pptData.push({
                teamId: pdfResult.teamId,
                keywords: [],
                pdfData: pdfResult.pdfData,
              });
            }
          }
        }
      }

      return pptData;
    } catch (error) {
      console.error('Error fetching PPTs:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  private static async extractKeywordsFromPDF(base64PdfData: string): Promise<string[]> {
    try {
      // Convert base64 to blob for Gemini processing
      const binaryString = atob(base64PdfData);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const file = new File([blob], 'presentation.pdf', { type: 'application/pdf' });

      // Use Gemini to extract keywords
      const extractedData = await import('../services/geminiService').then(module => 
        module.GeminiService.extractPPTKeywords(file)
      );

      return extractedData.keywords || [];
    } catch (error) {
      console.error('Error extracting keywords from PDF:', error);
      return [];
    }
  }

  static async allocateMentorsToPPTs(request: AllocationRequest): Promise<AllocationResult> {
    try {
      console.log('Starting mentor allocation process...');
      
      // Implement the allocation algorithm
      const allocations = this.performAllocation(request.mentors, request.ppts);
      
      // Calculate summary statistics
      const summary = this.calculateSummary(request.mentors, request.ppts, allocations);

      return {
        allocations,
        summary,
      };
    } catch (error) {
      console.error('Error in mentor allocation:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to allocate mentors to PPTs');
    }
  }

  private static performAllocation(mentors: Mentor[], ppts: PPTData[]): MentorAllocation[] {
    const allocations: MentorAllocation[] = [];
    const mentorWorkload: Record<string, number> = {};
    
    // Initialize mentor workload
    mentors.forEach(mentor => {
      mentorWorkload[mentor.email] = 0;
    });

    // Sort PPTs by number of keywords (more keywords = higher priority)
    const sortedPPTs = [...ppts].sort((a, b) => b.keywords.length - a.keywords.length);

    for (const ppt of sortedPPTs) {
      let bestMentor: Mentor | null = null;
      let bestScore = 0;
      let bestMatchedSkills: string[] = [];

      // Find the best mentor for this PPT
      for (const mentor of mentors) {
        const { score, matchedSkills } = this.calculateMatchScore(mentor.skills, ppt.keywords);
        
        // Adjust score based on current workload (prefer mentors with less work)
        const workloadPenalty = mentorWorkload[mentor.email] * 0.1;
        const adjustedScore = score - workloadPenalty;

        if (adjustedScore > bestScore) {
          bestScore = adjustedScore;
          bestMentor = mentor;
          bestMatchedSkills = matchedSkills;
        }
      }

      if (bestMentor) {
        // Generate PDF download link
        const pdfDownloadLink = `${this.PDF_BASE_URL}${ppt.teamId}`;

        allocations.push({
          mentorName: bestMentor.name,
          mentorEmail: bestMentor.email,
          mentorSkills: bestMentor.skills,
          teamId: ppt.teamId,
          pptKeywords: ppt.keywords,
          matchScore: bestScore * 100, // Convert to percentage
          matchedSkills: bestMatchedSkills,
          pdfDownloadLink: pdfDownloadLink, // Add PDF download link
        });

        // Update mentor workload
        mentorWorkload[bestMentor.email]++;
      }
    }

    return allocations;
  }

  private static calculateMatchScore(mentorSkills: string[], pptKeywords: string[]): { score: number; matchedSkills: string[] } {
    if (mentorSkills.length === 0 || pptKeywords.length === 0) {
      return { score: 0, matchedSkills: [] };
    }

    const normalizedMentorSkills = mentorSkills.map(skill => skill.toLowerCase().trim());
    const normalizedPPTKeywords = pptKeywords.map(keyword => keyword.toLowerCase().trim());

    const matchedSkills: string[] = [];
    let exactMatches = 0;
    let partialMatches = 0;

    // Check for exact matches
    for (const skill of normalizedMentorSkills) {
      if (normalizedPPTKeywords.includes(skill)) {
        exactMatches++;
        matchedSkills.push(mentorSkills[normalizedMentorSkills.indexOf(skill)]);
      }
    }

    // Check for partial matches (substring matching)
    for (const skill of normalizedMentorSkills) {
      for (const keyword of normalizedPPTKeywords) {
        if (skill.includes(keyword) || keyword.includes(skill)) {
          if (!matchedSkills.includes(mentorSkills[normalizedMentorSkills.indexOf(skill)])) {
            partialMatches++;
            matchedSkills.push(mentorSkills[normalizedMentorSkills.indexOf(skill)]);
          }
        }
      }
    }

    // Calculate score (exact matches weighted more heavily)
    const exactWeight = 1.0;
    const partialWeight = 0.5;
    const totalScore = (exactMatches * exactWeight + partialMatches * partialWeight);
    const maxPossibleScore = Math.max(normalizedMentorSkills.length, normalizedPPTKeywords.length);
    
    const score = maxPossibleScore > 0 ? totalScore / maxPossibleScore : 0;

    return { score: Math.min(score, 1), matchedSkills };
  }

  private static calculateSummary(mentors: Mentor[], ppts: PPTData[], allocations: MentorAllocation[]) {
    const totalMatchScore = allocations.reduce((sum, allocation) => sum + allocation.matchScore, 0);
    const averageMatchScore = allocations.length > 0 ? totalMatchScore / allocations.length : 0;

    return {
      totalMentors: mentors.length,
      totalPPTs: ppts.length,
      allocatedPPTs: allocations.length,
      averageMatchScore,
    };
  }

  static validateMentorData(mentors: Mentor[]): string[] {
    const errors: string[] = [];
    
    if (mentors.length === 0) {
      errors.push('At least one mentor is required');
    }

    const emails = new Set<string>();
    mentors.forEach((mentor, index) => {
      if (!mentor.name.trim()) {
        errors.push(`Mentor ${index + 1}: Name is required`);
      }

      if (!mentor.email.trim()) {
        errors.push(`Mentor ${index + 1}: Email is required`);
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mentor.email)) {
        errors.push(`Mentor ${index + 1}: Invalid email format`);
      } else if (emails.has(mentor.email)) {
        errors.push(`Mentor ${index + 1}: Duplicate email "${mentor.email}"`);
      } else {
        emails.add(mentor.email);
      }

      if (mentor.skills.length === 0) {
        errors.push(`Mentor ${index + 1}: At least one skill is required`);
      }
    });

    return errors;
  }

  static exportToCSV(allocations: MentorAllocation[]): string {
    const headers = [
      'Mentor Name', 
      'Mentor Email', 
      'Mentor Skills', 
      'Team ID', 
      'PPT Keywords', 
      'Match Score (%)',
      'PDF Download Link'
    ];
    
    const rows = allocations.map(allocation => [
      allocation.mentorName,
      allocation.mentorEmail,
      allocation.mentorSkills.join('; '),
      allocation.teamId,
      allocation.pptKeywords.join('; '),
      allocation.matchScore.toFixed(2),
      allocation.pdfDownloadLink || `${this.PDF_BASE_URL}${allocation.teamId}`
    ]);

    return [headers, ...rows].map(row => 
      row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(',')
    ).join('\n');
  }

  static exportToJSON(allocations: MentorAllocation[]): string {
    return JSON.stringify(allocations, null, 2);
  }

  static exportToTSV(allocations: MentorAllocation[]): string {
    const headers = [
      'Mentor Name', 
      'Mentor Email', 
      'Mentor Skills', 
      'Team ID', 
      'PPT Keywords', 
      'Match Score (%)',
      'PDF Download Link'
    ];
    
    const rows = allocations.map(allocation => [
      allocation.mentorName,
      allocation.mentorEmail,
      allocation.mentorSkills.join('; '),
      allocation.teamId,
      allocation.pptKeywords.join('; '),
      allocation.matchScore.toFixed(2),
      allocation.pdfDownloadLink || `${this.PDF_BASE_URL}${allocation.teamId}`
    ]);

    return [headers, ...rows].map(row => row.join('\t')).join('\n');
  }
}