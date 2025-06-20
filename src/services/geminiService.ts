import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

interface ExtractedHackathonData {
  hackathonName?: string;
  tagline?: string;
  about?: string;
  startDate?: string;
  endDate?: string;
  registrationStartDate?: string;
  registrationEndDate?: string;
  venue?: string;
  missingFields?: string[];
  confidence?: number;
}

export class GeminiService {
  private static readonly API_KEY = 'AIzaSyDZfKAmY0KB3U_FdC7U5g2W6bkavWq-8XQ';
  private static readonly BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

  static async extractHackathonData(
    content: string,
    contentType: 'text' | 'image' | 'audio' | 'video' | 'pdf',
    context?: string
  ): Promise<ExtractedHackathonData> {
    try {
      const prompt = this.buildExtractionPrompt(content, contentType, context);
      
      const response = await fetch(`${this.BASE_URL}?key=${this.API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.1,
            topK: 1,
            topP: 1,
            maxOutputTokens: 2048,
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Gemini API error response:', errorData);
        throw new Error(`Gemini API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data: GeminiResponse = await response.json();
      const responseText = data.candidates[0]?.content?.parts[0]?.text;

      if (!responseText) {
        throw new Error('No response from Gemini API');
      }

      return this.parseGeminiResponse(responseText);
    } catch (error) {
      console.error('Error extracting hackathon data:', error);
      throw new Error(`Failed to process content with AI assistant: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async processImageContent(imageFile: File): Promise<ExtractedHackathonData> {
    try {
      const base64Image = await this.fileToBase64(imageFile);
      
      const response = await fetch(`${this.BASE_URL}?key=${this.API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: this.buildImageExtractionPrompt()
              },
              {
                inline_data: {
                  mime_type: imageFile.type,
                  data: base64Image.split(',')[1]
                }
              }
            ]
          }],
          generationConfig: {
            temperature: 0.1,
            topK: 1,
            topP: 1,
            maxOutputTokens: 2048,
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Gemini API error response:', errorData);
        throw new Error(`Gemini API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data: GeminiResponse = await response.json();
      const responseText = data.candidates[0]?.content?.parts[0]?.text;

      if (!responseText) {
        throw new Error('No response from Gemini API');
      }

      return this.parseGeminiResponse(responseText);
    } catch (error) {
      console.error('Error processing image:', error);
      throw new Error(`Failed to process image with AI assistant: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async processPDFContent(pdfFile: File): Promise<ExtractedHackathonData> {
    try {
      console.log('Starting PDF processing for file:', pdfFile.name);
      
      // Extract text from PDF
      const pdfText = await this.extractTextFromPDF(pdfFile);
      console.log('Extracted PDF text length:', pdfText.length);
      
      if (!pdfText.trim()) {
        throw new Error('No text content found in PDF file');
      }

      // Process the extracted text with Gemini
      return await this.extractHackathonData(pdfText, 'pdf');
    } catch (error) {
      console.error('Error processing PDF:', error);
      throw new Error(`Failed to process PDF with AI assistant: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async processAudioContent(audioFile: File): Promise<ExtractedHackathonData> {
    try {
      console.log('Starting audio processing for file:', audioFile.name, 'Type:', audioFile.type);
      
      // Convert audio file to base64
      const base64Audio = await this.fileToBase64(audioFile);
      
      const response = await fetch(`${this.BASE_URL}?key=${this.API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: this.buildAudioExtractionPrompt()
              },
              {
                inline_data: {
                  mime_type: audioFile.type,
                  data: base64Audio.split(',')[1]
                }
              }
            ]
          }],
          generationConfig: {
            temperature: 0.1,
            topK: 1,
            topP: 1,
            maxOutputTokens: 2048,
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Gemini API error response:', errorData);
        throw new Error(`Gemini API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data: GeminiResponse = await response.json();
      const responseText = data.candidates[0]?.content?.parts[0]?.text;

      if (!responseText) {
        throw new Error('No response from Gemini API');
      }

      return this.parseGeminiResponse(responseText);
    } catch (error) {
      console.error('Error processing audio:', error);
      throw new Error(`Failed to process audio with AI assistant: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async processVideoContent(videoFile: File): Promise<ExtractedHackathonData> {
    try {
      console.log('Starting video processing for file:', videoFile.name, 'Type:', videoFile.type);
      
      // Convert video file to base64
      const base64Video = await this.fileToBase64(videoFile);
      
      const response = await fetch(`${this.BASE_URL}?key=${this.API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: this.buildVideoExtractionPrompt()
              },
              {
                inline_data: {
                  mime_type: videoFile.type,
                  data: base64Video.split(',')[1]
                }
              }
            ]
          }],
          generationConfig: {
            temperature: 0.1,
            topK: 1,
            topP: 1,
            maxOutputTokens: 2048,
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Gemini API error response:', errorData);
        throw new Error(`Gemini API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data: GeminiResponse = await response.json();
      const responseText = data.candidates[0]?.content?.parts[0]?.text;

      if (!responseText) {
        throw new Error('No response from Gemini API');
      }

      return this.parseGeminiResponse(responseText);
    } catch (error) {
      console.error('Error processing video:', error);
      throw new Error(`Failed to process video with AI assistant: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private static async extractTextFromPDF(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = '';
      
      // Extract text from all pages
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        
        fullText += pageText + '\n';
      }
      
      return fullText.trim();
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      throw new Error('Failed to extract text from PDF file');
    }
  }

  private static buildExtractionPrompt(content: string, contentType: string, context?: string): string {
    return `
You are an AI assistant helping to extract hackathon information from ${contentType} content. 
${context ? `Previous context: ${context}` : ''}

Content to analyze:
${content}

Extract the following hackathon information and return ONLY a valid JSON object with these exact fields:
{
  "hackathonName": "string or null",
  "tagline": "string or null", 
  "about": "string or null",
  "startDate": "YYYY-MM-DDTHH:MM format or null",
  "endDate": "YYYY-MM-DDTHH:MM format or null",
  "registrationStartDate": "YYYY-MM-DDTHH:MM format or null",
  "registrationEndDate": "YYYY-MM-DDTHH:MM format or null",
  "venue": "string or null",
  "missingFields": ["array of missing field names"],
  "confidence": number between 0-1
}

Rules:
- Only extract information that is explicitly mentioned
- For dates, convert to YYYY-MM-DDTHH:MM format (use reasonable time if not specified)
- If information is unclear or missing, set to null
- List missing critical fields in missingFields array
- Set confidence based on how complete and clear the information is
- Return ONLY the JSON object, no other text
`;
  }

  private static buildImageExtractionPrompt(): string {
    return `
Analyze this image for hackathon-related information. Look for:
- Event names, titles, or hackathon names
- Dates and times
- Venue or location information
- Event descriptions or taglines
- Registration information
- Any text, posters, flyers, or announcements

Extract the information and return ONLY a valid JSON object with these exact fields:
{
  "hackathonName": "string or null",
  "tagline": "string or null", 
  "about": "string or null",
  "startDate": "YYYY-MM-DDTHH:MM format or null",
  "endDate": "YYYY-MM-DDTHH:MM format or null",
  "registrationStartDate": "YYYY-MM-DDTHH:MM format or null",
  "registrationEndDate": "YYYY-MM-DDTHH:MM format or null",
  "venue": "string or null",
  "missingFields": ["array of missing field names"],
  "confidence": number between 0-1
}

Return ONLY the JSON object, no other text.
`;
  }

  private static buildAudioExtractionPrompt(): string {
    return `
Analyze this audio file for hackathon-related information. Listen for:
- Event names, titles, or hackathon names mentioned
- Dates and times announced
- Venue or location information
- Event descriptions or taglines
- Registration information
- Any announcements or presentations about the hackathon

Extract the information and return ONLY a valid JSON object with these exact fields:
{
  "hackathonName": "string or null",
  "tagline": "string or null", 
  "about": "string or null",
  "startDate": "YYYY-MM-DDTHH:MM format or null",
  "endDate": "YYYY-MM-DDTHH:MM format or null",
  "registrationStartDate": "YYYY-MM-DDTHH:MM format or null",
  "registrationEndDate": "YYYY-MM-DDTHH:MM format or null",
  "venue": "string or null",
  "missingFields": ["array of missing field names"],
  "confidence": number between 0-1
}

Return ONLY the JSON object, no other text.
`;
  }

  private static buildVideoExtractionPrompt(): string {
    return `
Analyze this video file for hackathon-related information. Look and listen for:
- Event names, titles, or hackathon names (visual or audio)
- Dates and times (shown on screen or mentioned)
- Venue or location information
- Event descriptions or taglines
- Registration information
- Any presentations, announcements, or promotional content about the hackathon
- Text overlays, slides, or visual information

Extract the information and return ONLY a valid JSON object with these exact fields:
{
  "hackathonName": "string or null",
  "tagline": "string or null", 
  "about": "string or null",
  "startDate": "YYYY-MM-DDTHH:MM format or null",
  "endDate": "YYYY-MM-DDTHH:MM format or null",
  "registrationStartDate": "YYYY-MM-DDTHH:MM format or null",
  "registrationEndDate": "YYYY-MM-DDTHH:MM format or null",
  "venue": "string or null",
  "missingFields": ["array of missing field names"],
  "confidence": number between 0-1
}

Return ONLY the JSON object, no other text.
`;
  }

  private static parseGeminiResponse(responseText: string): ExtractedHackathonData {
    try {
      console.log('Raw Gemini response:', responseText);
      
      // Clean the response text to extract JSON
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('No JSON found in response:', responseText);
        throw new Error('No JSON found in response');
      }

      const jsonStr = jsonMatch[0];
      console.log('Extracted JSON string:', jsonStr);
      
      const parsed = JSON.parse(jsonStr);
      console.log('Parsed JSON:', parsed);

      return {
        hackathonName: parsed.hackathonName || undefined,
        tagline: parsed.tagline || undefined,
        about: parsed.about || undefined,
        startDate: parsed.startDate || undefined,
        endDate: parsed.endDate || undefined,
        registrationStartDate: parsed.registrationStartDate || undefined,
        registrationEndDate: parsed.registrationEndDate || undefined,
        venue: parsed.venue || undefined,
        missingFields: parsed.missingFields || [],
        confidence: parsed.confidence || 0
      };
    } catch (error) {
      console.error('Error parsing Gemini response:', error);
      console.error('Response text was:', responseText);
      throw new Error('Failed to parse AI response');
    }
  }

  private static fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }
}