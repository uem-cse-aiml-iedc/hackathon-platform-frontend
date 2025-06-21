import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  Upload, 
  Mic, 
  Image, 
  Video, 
  FileText, 
  MessageSquare, 
  Sparkles,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  Zap,
  MicOff,
  Pause,
  Play,
  Square,
  Clock
} from 'lucide-react';
import { GeminiService } from '../../services/geminiService';

interface AIAssistantProps {
  onDataExtracted: (data: any) => void;
  onFieldError: (field: string, message: string) => void;
  onClearFieldError: (field: string) => void;
  mode?: 'hackathon' | 'participant'; // New prop to determine which mode
}

interface ConversationMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  inputType?: 'text' | 'image' | 'audio' | 'video' | 'pdf' | 'live-audio';
}

interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  transcript: string;
  isProcessing: boolean;
}

export default function AIAssistant({ 
  onDataExtracted, 
  onFieldError, 
  onClearFieldError, 
  mode = 'hackathon' 
}: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [textInput, setTextInput] = useState('');
  const [dragActive, setDragActive] = useState(false);
  
  // Recording state
  const [recording, setRecording] = useState<RecordingState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    transcript: '',
    isProcessing: false
  });

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const addMessage = (type: 'user' | 'assistant', content: string, inputType?: string) => {
    const message: ConversationMessage = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
      inputType: inputType as any
    };
    setConversation(prev => [...prev, message]);
  };

  const processWithAI = async (content: string, contentType: 'text' | 'image' | 'audio' | 'video' | 'pdf' | 'live-audio', file?: File) => {
    setIsProcessing(true);
    
    try {
      let extractedData;
      
      if (contentType === 'image' && file) {
        if (mode === 'participant') {
          extractedData = await GeminiService.processParticipantImageContent(file);
        } else {
          extractedData = await GeminiService.processImageContent(file);
        }
        addMessage('user', `Uploaded image: ${file.name}`, 'image');
      } else if (contentType === 'text' || contentType === 'live-audio') {
        const context = conversation.map(msg => `${msg.type}: ${msg.content}`).join('\n');
        if (mode === 'participant') {
          extractedData = await GeminiService.extractParticipantData(content, 'text', context);
        } else {
          extractedData = await GeminiService.extractHackathonData(content, 'text', context);
        }
        addMessage('user', content, contentType);
      } else {
        // For audio, video, PDF
        if (contentType === 'audio') {
          if (mode === 'participant') {
            extractedData = await GeminiService.processParticipantAudioContent(file!);
          } else {
            extractedData = await GeminiService.processAudioContent(file!);
          }
        } else if (contentType === 'video') {
          if (mode === 'participant') {
            extractedData = await GeminiService.processParticipantVideoContent(file!);
          } else {
            extractedData = await GeminiService.processVideoContent(file!);
          }
        } else if (contentType === 'pdf') {
          if (mode === 'participant') {
            extractedData = await GeminiService.processParticipantPDFContent(file!);
          } else {
            extractedData = await GeminiService.processPDFContent(file!);
          }
        }
      }

      // Clear previous field errors based on mode
      if (mode === 'participant') {
        ['bio', 'phoneNo', 'githubLink', 'linkedinLink', 'foodPreference', 'skills'].forEach(field => {
          onClearFieldError(field);
        });
      } else {
        ['hackathonName', 'tagline', 'about', 'startDate', 'endDate', 'registrationStartDate', 'registrationEndDate', 'venue'].forEach(field => {
          onClearFieldError(field);
        });
      }

      // Apply extracted data to form
      onDataExtracted(extractedData);

      // Show missing fields as errors
      if (extractedData?.missingFields && extractedData.missingFields.length > 0) {
        extractedData.missingFields.forEach((field: string) => {
          onFieldError(field, `This field couldn't be extracted from your input. Please fill it manually.`);
        });
      }

      // Add assistant response
      const filledFields = Object.keys(extractedData || {}).filter(key => 
        extractedData?.[key] && key !== 'missingFields' && key !== 'confidence'
      );
      
      const responseMessage = `✨ I've extracted information and filled ${filledFields.length} fields! ${
        extractedData?.missingFields?.length ? 
        `Please manually fill: ${extractedData.missingFields.join(', ')}` : 
        'All available information has been extracted.'
      } (Confidence: ${Math.round((extractedData?.confidence || 0) * 100)}%)`;
      
      addMessage('assistant', responseMessage);

    } catch (error: any) {
      console.error('AI processing error:', error);
      addMessage('assistant', `❌ ${error.message || 'Failed to process your input. Please try again or fill the form manually.'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Speech Recognition Functions
  const initializeSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      throw new Error('Speech recognition not supported in this browser');
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log('Speech recognition started');
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      setRecording(prev => ({
        ...prev,
        transcript: prev.transcript + finalTranscript + interimTranscript
      }));
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      addMessage('assistant', `❌ Speech recognition error: ${event.error}`);
      stopRecording();
    };

    recognition.onend = () => {
      console.log('Speech recognition ended');
      if (recording.isRecording && !recording.isPaused) {
        // Restart if we're still supposed to be recording
        recognition.start();
      }
    };

    return recognition;
  };

  const startRecording = async () => {
    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const recognition = initializeSpeechRecognition();
      recognitionRef.current = recognition;
      
      recognition.start();
      
      setRecording({
        isRecording: true,
        isPaused: false,
        duration: 0,
        transcript: '',
        isProcessing: false
      });

      // Start timer
      timerRef.current = setInterval(() => {
        setRecording(prev => ({
          ...prev,
          duration: prev.duration + 1
        }));
      }, 1000);

      const modeText = mode === 'participant' ? 'your background and skills' : 'your hackathon';
      addMessage('assistant', `🎤 Started listening... Speak about ${modeText}!`);
    } catch (error: any) {
      console.error('Error starting recording:', error);
      addMessage('assistant', `❌ Failed to start recording: ${error.message}`);
    }
  };

  const pauseRecording = () => {
    if (recognitionRef.current && recording.isRecording) {
      recognitionRef.current.stop();
      setRecording(prev => ({ ...prev, isPaused: true }));
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      addMessage('assistant', '⏸️ Recording paused');
    }
  };

  const resumeRecording = () => {
    if (recognitionRef.current && recording.isRecording && recording.isPaused) {
      recognitionRef.current.start();
      setRecording(prev => ({ ...prev, isPaused: false }));
      
      // Resume timer
      timerRef.current = setInterval(() => {
        setRecording(prev => ({
          ...prev,
          duration: prev.duration + 1
        }));
      }, 1000);
      
      addMessage('assistant', '▶️ Recording resumed');
    }
  };

  const stopRecording = async () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const finalTranscript = recording.transcript.trim();
    
    setRecording({
      isRecording: false,
      isPaused: false,
      duration: 0,
      transcript: '',
      isProcessing: false
    });

    if (finalTranscript) {
      addMessage('assistant', `🛑 Recording stopped. Processing transcript...`);
      await processWithAI(finalTranscript, 'live-audio');
    } else {
      addMessage('assistant', '❌ No speech detected. Please try again.');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim() || isProcessing) return;
    
    processWithAI(textInput, 'text');
    setTextInput('');
  };

  const handleFileUpload = (file: File, type: 'image' | 'audio' | 'video' | 'pdf') => {
    if (isProcessing) return;
    processWithAI('', type, file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    const file = files[0];
    const fileType = file.type;

    if (fileType.startsWith('image/')) {
      handleFileUpload(file, 'image');
    } else if (fileType.startsWith('audio/')) {
      handleFileUpload(file, 'audio');
    } else if (fileType.startsWith('video/')) {
      handleFileUpload(file, 'video');
    } else if (fileType === 'application/pdf') {
      handleFileUpload(file, 'pdf');
    } else {
      addMessage('assistant', '❌ Unsupported file type. Please upload an image, audio, video, or PDF file.');
    }
  };

  const getWelcomeMessage = () => {
    if (mode === 'participant') {
      return {
        title: 'READY TO HELP!',
        description: 'Upload your resume, portfolio, or describe yourself, and I\'ll auto-fill your registration form!'
      };
    } else {
      return {
        title: 'READY TO HELP!',
        description: 'Upload any content, record live audio, or type details about your hackathon, and I\'ll auto-fill the form for you!'
      };
    }
  };

  const getHeaderText = () => {
    return mode === 'participant' ? 'AI REGISTRATION ASSISTANT' : 'AI ASSISTANT';
  };

  const getSubHeaderText = () => {
    return mode === 'participant' ? 'Upload resume/portfolio to auto-fill' : 'Upload any content to auto-fill';
  };

  const welcomeMessage = getWelcomeMessage();

  return (
    <>
      {/* AI Assistant Toggle Button - Prominent USP */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
      >
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="bg-gradient-to-r from-secondary to-accent text-background p-4 border-4 border-primary shadow-brutal hover:shadow-brutal-hover transition-all duration-200 relative overflow-hidden group"
        >
          <motion.div
            className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-20 transition-opacity duration-300"
          />
          
          <div className="flex items-center space-x-3 relative z-10">
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
            </motion.div>
            <div className="hidden tablet:block">
              <div className="font-space font-bold text-sm">{getHeaderText()}</div>
              <div className="font-inter text-xs opacity-90">1-Click Fill</div>
            </div>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="h-4 w-4" />
            </motion.div>
          </div>

          {/* USP Badge */}
          <motion.div
            className="absolute -top-2 -right-2 bg-accent text-primary px-2 py-1 text-xs font-inter font-bold border-2 border-primary shadow-brutal-sm"
            animate={{ y: [-2, 2, -2] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            USP
          </motion.div>
        </motion.button>
      </motion.div>

      {/* AI Assistant Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 400, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 400, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-6 right-6 w-96 max-w-[90vw] h-[600px] bg-background border-4 border-primary shadow-brutal z-40 flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-secondary to-accent text-background p-4 border-b-4 border-primary">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  >
                    <Bot className="h-6 w-6" />
                  </motion.div>
                  <div>
                    <h3 className="font-space font-bold text-lg">{getHeaderText()}</h3>
                    <p className="font-inter text-xs opacity-90">{getSubHeaderText()}</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsOpen(false)}
                  className="bg-background/20 text-background p-1 border-2 border-background/30 hover:bg-background/30 transition-colors duration-200"
                >
                  <X className="h-4 w-4" />
                </motion.button>
              </div>
            </div>

            {/* Input Methods */}
            <div className="p-4 border-b-2 border-primary bg-accent/10">
              <p className="font-inter text-sm text-primary mb-3 font-semibold">
                🚀 Choose your input method:
              </p>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => imageInputRef.current?.click()}
                  disabled={isProcessing || recording.isRecording}
                  className="flex items-center space-x-2 bg-background text-primary p-2 border-2 border-primary shadow-brutal-sm hover:shadow-brutal transition-all duration-200 font-inter font-semibold text-xs disabled:opacity-50"
                >
                  <Image className="h-4 w-4" />
                  <span>IMAGE</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => audioInputRef.current?.click()}
                  disabled={isProcessing || recording.isRecording}
                  className="flex items-center space-x-2 bg-background text-primary p-2 border-2 border-primary shadow-brutal-sm hover:shadow-brutal transition-all duration-200 font-inter font-semibold text-xs disabled:opacity-50"
                >
                  <Mic className="h-4 w-4" />
                  <span>AUDIO</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => videoInputRef.current?.click()}
                  disabled={isProcessing || recording.isRecording}
                  className="flex items-center space-x-2 bg-background text-primary p-2 border-2 border-primary shadow-brutal-sm hover:shadow-brutal transition-all duration-200 font-inter font-semibold text-xs disabled:opacity-50"
                >
                  <Video className="h-4 w-4" />
                  <span>VIDEO</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => pdfInputRef.current?.click()}
                  disabled={isProcessing || recording.isRecording}
                  className="flex items-center space-x-2 bg-background text-primary p-2 border-2 border-primary shadow-brutal-sm hover:shadow-brutal transition-all duration-200 font-inter font-semibold text-xs disabled:opacity-50"
                >
                  <FileText className="h-4 w-4" />
                  <span>PDF</span>
                </motion.button>
              </div>

              {/* Live Recording Controls */}
              <div className="border-t-2 border-primary pt-3">
                <p className="font-inter text-xs text-primary mb-2 font-semibold">
                  🎤 LIVE RECORDING:
                </p>
                
                {!recording.isRecording ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={startRecording}
                    disabled={isProcessing}
                    className="w-full flex items-center justify-center space-x-2 bg-secondary text-background p-3 border-2 border-primary shadow-brutal-sm hover:shadow-brutal transition-all duration-200 font-inter font-bold text-sm disabled:opacity-50"
                  >
                    <Mic className="h-5 w-5" />
                    <span>START RECORDING</span>
                  </motion.button>
                ) : (
                  <div className="space-y-2">
                    {/* Recording Status */}
                    <div className="bg-secondary/20 border-2 border-secondary p-2 text-center">
                      <div className="flex items-center justify-center space-x-2 mb-1">
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          {recording.isPaused ? <MicOff className="h-4 w-4 text-secondary" /> : <Mic className="h-4 w-4 text-secondary" />}
                        </motion.div>
                        <span className="font-inter font-bold text-primary text-sm">
                          {recording.isPaused ? 'PAUSED' : 'RECORDING'}
                        </span>
                      </div>
                      <div className="flex items-center justify-center space-x-2">
                        <Clock className="h-3 w-3 text-primary" />
                        <span className="font-inter text-primary text-xs">
                          {formatTime(recording.duration)}
                        </span>
                      </div>
                    </div>

                    {/* Live Transcript */}
                    {recording.transcript && (
                      <div className="bg-accent/10 border border-primary p-2 max-h-16 overflow-y-auto">
                        <p className="font-inter text-xs text-primary">
                          "{recording.transcript}"
                        </p>
                      </div>
                    )}

                    {/* Recording Controls */}
                    <div className="flex space-x-2">
                      {!recording.isPaused ? (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={pauseRecording}
                          className="flex-1 flex items-center justify-center space-x-1 bg-background text-primary p-2 border-2 border-primary shadow-brutal-sm hover:shadow-brutal transition-all duration-200 font-inter font-semibold text-xs"
                        >
                          <Pause className="h-4 w-4" />
                          <span>PAUSE</span>
                        </motion.button>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={resumeRecording}
                          className="flex-1 flex items-center justify-center space-x-1 bg-accent text-primary p-2 border-2 border-primary shadow-brutal-sm hover:shadow-brutal transition-all duration-200 font-inter font-semibold text-xs"
                        >
                          <Play className="h-4 w-4" />
                          <span>RESUME</span>
                        </motion.button>
                      )}
                      
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={stopRecording}
                        className="flex-1 flex items-center justify-center space-x-1 bg-secondary text-background p-2 border-2 border-primary shadow-brutal-sm hover:shadow-brutal transition-all duration-200 font-inter font-semibold text-xs"
                      >
                        <Square className="h-4 w-4" />
                        <span>STOP</span>
                      </motion.button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Conversation Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {conversation.length === 0 && (
                <div className="text-center py-8">
                  <motion.div
                    animate={{ y: [-5, 5, -5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Zap className="h-12 w-12 text-secondary mx-auto mb-4" />
                  </motion.div>
                  <h4 className="font-space font-bold text-primary mb-2">
                    {welcomeMessage.title}
                  </h4>
                  <p className="font-inter text-primary/70 text-sm">
                    {welcomeMessage.description}
                  </p>
                </div>
              )}

              {conversation.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] p-3 border-2 border-primary ${
                    message.type === 'user' 
                      ? 'bg-secondary text-background' 
                      : 'bg-accent/20 text-primary'
                  }`}>
                    <div className="font-inter text-sm">
                      {message.content}
                    </div>
                    <div className="font-inter text-xs opacity-70 mt-1 flex items-center space-x-1">
                      {message.inputType === 'live-audio' && <Mic className="h-3 w-3" />}
                      <span>{message.timestamp.toLocaleTimeString()}</span>
                    </div>
                  </div>
                </motion.div>
              ))}

              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-accent/20 text-primary p-3 border-2 border-primary">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="font-inter text-sm">Processing with AI...</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Text Input */}
            <div className="p-4 border-t-2 border-primary">
              <form onSubmit={handleTextSubmit} className="flex space-x-2">
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder={mode === 'participant' ? 'Describe yourself...' : 'Describe your hackathon...'}
                  disabled={isProcessing || recording.isRecording}
                  className="flex-1 px-3 py-2 border-2 border-primary focus:border-secondary focus:outline-none font-inter bg-background text-sm disabled:opacity-50"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={isProcessing || !textInput.trim() || recording.isRecording}
                  className="bg-secondary text-background px-4 py-2 border-2 border-primary shadow-brutal-sm hover:shadow-brutal transition-all duration-200 font-inter font-bold text-sm disabled:opacity-50"
                >
                  <MessageSquare className="h-4 w-4" />
                </motion.button>
              </form>
            </div>

            {/* Drag and Drop Overlay */}
            <div
              className={`absolute inset-0 bg-accent/90 border-4 border-dashed border-primary flex items-center justify-center transition-opacity duration-300 ${
                dragActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="text-center">
                <Upload className="h-16 w-16 text-primary mx-auto mb-4" />
                <h3 className="font-space font-bold text-xl text-primary mb-2">
                  DROP YOUR FILE HERE
                </h3>
                <p className="font-inter text-primary/80">
                  {mode === 'participant' ? 'Resume, Portfolio, Images, Audio, Video, or PDF files' : 'Images, Audio, Video, or PDF files'}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden File Inputs */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file, 'image');
        }}
        className="hidden"
      />
      <input
        ref={audioInputRef}
        type="file"
        accept="audio/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file, 'audio');
        }}
        className="hidden"
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file, 'video');
        }}
        className="hidden"
      />
      <input
        ref={pdfInputRef}
        type="file"
        accept=".pdf"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file, 'pdf');
        }}
        className="hidden"
      />
    </>
  );
}