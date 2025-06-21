import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  X, 
  Plus, 
  GraduationCap, 
  Users, 
  Trash2, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  Hash,
  Mail,
  Sparkles,
  Zap,
  Target,
  BarChart3,
  FileText,
  Download,
  Upload,
  Image,
  Bot,
  Send,
  User,
  Award,
  TrendingUp,
  Eye,
  EyeOff,
  Copy,
  Check,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { MentorAllocationService, Mentor, AllocationResult } from '../../services/mentorAllocationService';
import { GeminiService } from '../../services/geminiService';

const mentorSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  skills: z.array(z.string()).min(1, 'At least one skill is required'),
});

const allocationSchema = z.object({
  mentors: z.array(mentorSchema).min(1, 'At least one mentor is required'),
});

type AllocationFormData = z.infer<typeof allocationSchema>;

interface MentorAllocationModalProps {
  hackathonId: string;
  hackathonName: string;
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  inputType?: 'text' | 'image' | 'pdf';
}

export default function MentorAllocationModal({ hackathonId, hackathonName, isOpen, onClose }: MentorAllocationModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allocationResult, setAllocationResult] = useState<AllocationResult | null>(null);
  const [showVisualization, setShowVisualization] = useState(false);
  const [activeTab, setActiveTab] = useState<'input' | 'chat'>('input');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isProcessingChat, setIsProcessingChat] = useState(false);
  const [copiedData, setCopiedData] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const { currentUser } = useAuth();
  const { showSuccess, showError } = useToast();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<AllocationFormData>({
    resolver: zodResolver(allocationSchema),
    defaultValues: {
      mentors: [
        { name: '', email: '', skills: [] }
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'mentors',
  });

  const watchedMentors = watch('mentors');

  const addMentor = () => {
    append({ name: '', email: '', skills: [] });
  };

  const removeMentor = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    } else {
      showError('Cannot Remove Mentor', 'At least one mentor must be present');
    }
  };

  const addSkillToMentor = (mentorIndex: number, skill: string) => {
    if (!skill.trim()) return;
    
    const currentSkills = watchedMentors[mentorIndex]?.skills || [];
    if (!currentSkills.includes(skill.trim())) {
      const newSkills = [...currentSkills, skill.trim()];
      setValue(`mentors.${mentorIndex}.skills`, newSkills);
    }
  };

  const removeSkillFromMentor = (mentorIndex: number, skillIndex: number) => {
    const currentSkills = watchedMentors[mentorIndex]?.skills || [];
    const newSkills = currentSkills.filter((_, index) => index !== skillIndex);
    setValue(`mentors.${mentorIndex}.skills`, newSkills);
  };

  const addChatMessage = (type: 'user' | 'assistant', content: string, inputType?: string) => {
    const message: ChatMessage = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
      inputType: inputType as any
    };
    setChatMessages(prev => [...prev, message]);
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isProcessingChat) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    addChatMessage('user', userMessage, 'text');

    try {
      setIsProcessingChat(true);
      
      // Use Gemini to extract mentor data from natural language
      const extractedData = await GeminiService.extractMentorData(userMessage, 'text');
      
      if (extractedData.mentors && extractedData.mentors.length > 0) {
        // Add extracted mentors to the form
        extractedData.mentors.forEach((mentor: any) => {
          append({
            name: mentor.name || '',
            email: mentor.email || '',
            skills: mentor.skills || []
          });
        });

        addChatMessage('assistant', `✨ Extracted ${extractedData.mentors.length} mentor(s) from your input! I've added them to the mentor list. You can review and edit the details before running the allocation.`);
      } else {
        addChatMessage('assistant', 'I couldn\'t extract mentor information from your input. Please provide details like mentor names, emails, and their skills/expertise areas.');
      }
    } catch (error: any) {
      addChatMessage('assistant', `❌ ${error.message || 'Failed to process your input. Please try again.'}`);
    } finally {
      setIsProcessingChat(false);
    }
  };

  const handleFileUpload = (type: 'pdf' | 'image') => {
    if (type === 'pdf') {
      fileInputRef.current?.click();
    } else {
      imageInputRef.current?.click();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>, type: 'pdf' | 'image') => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessingChat(true);
      addChatMessage('user', `Uploaded ${type.toUpperCase()}: ${file.name}`, type);

      let extractedData;
      if (type === 'pdf') {
        extractedData = await GeminiService.processMentorPDFContent(file);
      } else {
        extractedData = await GeminiService.processMentorImageContent(file);
      }

      if (extractedData.mentors && extractedData.mentors.length > 0) {
        // Add extracted mentors to the form
        extractedData.mentors.forEach((mentor: any) => {
          append({
            name: mentor.name || '',
            email: mentor.email || '',
            skills: mentor.skills || []
          });
        });

        addChatMessage('assistant', `🎉 Successfully extracted ${extractedData.mentors.length} mentor(s) from your ${type.toUpperCase()}! I've added them to the mentor list with their skills and contact information.`);
      } else {
        addChatMessage('assistant', `I couldn't extract mentor information from the ${type.toUpperCase()}. Please ensure the file contains mentor details like names, emails, and skills.`);
      }
    } catch (error: any) {
      addChatMessage('assistant', `❌ Failed to process ${type.toUpperCase()}: ${error.message}`);
    } finally {
      setIsProcessingChat(false);
      // Reset file input
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const onSubmit = async (data: AllocationFormData) => {
    if (!currentUser) {
      showError('Authentication Error', 'Please log in to allocate mentors');
      return;
    }

    try {
      setIsSubmitting(true);

      // Validate mentor data
      const validationErrors = MentorAllocationService.validateMentorData(data.mentors);
      if (validationErrors.length > 0) {
        showError('Validation Error', validationErrors.join(', '));
        return;
      }

      // Fetch PPTs and perform allocation
      const ppts = await MentorAllocationService.fetchPPTs(hackathonId);
      
      if (ppts.length === 0) {
        showError('No PPTs Found', 'No submitted project presentations found for this hackathon');
        return;
      }

      const result = await MentorAllocationService.allocateMentorsToPPTs({
        hackathonId,
        mentors: data.mentors,
        ppts,
      });

      setAllocationResult(result);
      setShowVisualization(true);

      showSuccess(
        'Mentor Allocation Complete! 🎓',
        `Successfully allocated ${result.allocations.length} PPTs to mentors with ${result.summary.averageMatchScore.toFixed(1)}% average match score`
      );

    } catch (error: any) {
      showError(
        'Allocation Failed',
        error.message || 'Failed to allocate mentors to PPTs'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setAllocationResult(null);
    setShowVisualization(false);
    setChatMessages([]);
    reset({
      mentors: [{ name: '', email: '', skills: [] }],
    });
  };

  const exportToCSV = () => {
    if (!allocationResult) return;
    
    const csv = MentorAllocationService.exportToCSV(allocationResult.allocations);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mentor-allocation-${hackathonName.replace(/\s+/g, '-')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showSuccess('Export Complete!', 'Mentor allocation data exported to CSV');
  };

  const copyAllocationData = async () => {
    if (!allocationResult) return;

    try {
      const data = JSON.stringify(allocationResult, null, 2);
      await navigator.clipboard.writeText(data);
      setCopiedData(true);
      showSuccess('Copied!', 'Allocation data copied to clipboard');
      setTimeout(() => setCopiedData(false), 2000);
    } catch (error) {
      showError('Copy Failed', 'Unable to copy allocation data');
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    if (score >= 40) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="bg-background border-4 border-primary shadow-brutal max-w-7xl w-full max-h-[90vh] overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 p-4 sm:p-6 border-b-4 border-primary relative overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                animate={{ x: [-100, 400] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
              
              <div className="relative z-10 flex flex-col sm:flex-row justify-between sm:items-start space-y-4 sm:space-y-0">
                <div className="flex-1 pr-0 sm:pr-4">
                  <div className="flex items-center space-x-3 mb-2 sm:mb-3">
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    >
                      <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                    </motion.div>
                    <h1 className="font-space font-bold text-xl sm:text-3xl text-white">
                      MENTOR-PPT ALLOCATION
                    </h1>
                  </div>
                  
                  <p className="font-inter text-white/90 text-sm sm:text-lg mb-3 sm:mb-4">
                    {hackathonName}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    <div className="bg-white/20 border-2 border-white/30 px-3 py-1 sm:px-4 sm:py-2 backdrop-blur-sm">
                      <span className="font-inter font-bold text-white text-xs sm:text-sm">
                        {fields.length} MENTORS CONFIGURED
                      </span>
                    </div>
                    {allocationResult && (
                      <div className="bg-white/20 border-2 border-white/30 px-3 py-1 sm:px-4 sm:py-2 backdrop-blur-sm">
                        <span className="font-inter font-bold text-white text-xs sm:text-sm">
                          {allocationResult.summary.allocatedPPTs} PPTs ALLOCATED
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="bg-white/20 text-white p-2 sm:p-3 border-2 border-white/30 shadow-brutal-sm hover:bg-white/30 transition-all duration-200 backdrop-blur-sm self-end sm:self-start"
                >
                  <X className="h-5 w-5 sm:h-6 sm:w-6" />
                </motion.button>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-4 sm:p-6">
              {!showVisualization ? (
                /* Input Interface */
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {/* Tab Headers */}
                  <div className="border-b-2 border-primary mb-4 sm:mb-6">
                    <div className="flex">
                      <button
                        onClick={() => setActiveTab('input')}
                        className={`px-4 py-3 sm:px-6 sm:py-4 font-inter font-semibold border-r-2 border-primary transition-colors duration-200 text-xs sm:text-sm ${
                          activeTab === 'input'
                            ? 'bg-accent text-primary'
                            : 'bg-background text-primary/70 hover:bg-accent/20'
                        }`}
                      >
                        <div className="flex items-center space-x-1 sm:space-x-2">
                          <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                          <span>MANUAL INPUT</span>
                        </div>
                      </button>
                      <button
                        onClick={() => setActiveTab('chat')}
                        className={`px-4 py-3 sm:px-6 sm:py-4 font-inter font-semibold transition-colors duration-200 text-xs sm:text-sm ${
                          activeTab === 'chat'
                            ? 'bg-accent text-primary'
                            : 'bg-background text-primary/70 hover:bg-accent/20'
                        }`}
                      >
                        <div className="flex items-center space-x-1 sm:space-x-2">
                          <Bot className="h-4 w-4 sm:h-5 sm:w-5" />
                          <span>AI ASSISTANT</span>
                        </div>
                      </button>
                    </div>
                  </div>

                  {activeTab === 'input' ? (
                    /* Manual Input Form */
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8">
                      {/* Mentor Configuration */}
                      <div>
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 space-y-3 sm:space-y-0">
                          <h3 className="font-space font-bold text-xl sm:text-2xl text-primary">
                            CONFIGURE MENTORS
                          </h3>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="button"
                            onClick={addMentor}
                            className="bg-accent text-primary px-3 py-2 sm:px-4 sm:py-2 border-2 border-primary shadow-brutal hover:shadow-brutal-hover transition-all duration-200 font-inter font-bold flex items-center justify-center text-xs sm:text-sm"
                          >
                            <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                            ADD MENTOR
                          </motion.button>
                        </div>

                        <div className="space-y-4 sm:space-y-6">
                          {fields.map((field, index) => (
                            <motion.div
                              key={field.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="bg-accent/10 border-4 border-primary shadow-brutal p-4 sm:p-6 relative"
                            >
                              <div className="flex justify-between items-start mb-4">
                                <h4 className="font-space font-bold text-lg sm:text-xl text-primary">
                                  MENTOR #{index + 1}
                                </h4>
                                {fields.length > 1 && (
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    type="button"
                                    onClick={() => removeMentor(index)}
                                    className="bg-secondary text-background p-2 border-2 border-primary shadow-brutal-sm hover:shadow-brutal transition-all duration-200"
                                    title="Remove Mentor"
                                  >
                                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                  </motion.button>
                                )}
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                {/* Mentor Name */}
                                <div>
                                  <label className="block font-inter font-semibold text-primary mb-2 text-xs sm:text-sm">
                                    MENTOR NAME *
                                  </label>
                                  <div className="relative">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-primary/50" />
                                    <input
                                      {...register(`mentors.${index}.name`)}
                                      type="text"
                                      className={`w-full pl-10 pr-4 py-2 sm:py-3 border-2 focus:outline-none font-inter bg-background text-xs sm:text-sm ${
                                        errors.mentors?.[index]?.name 
                                          ? 'border-secondary focus:border-secondary' 
                                          : 'border-primary focus:border-secondary'
                                      }`}
                                      placeholder="e.g., Dr. John Smith"
                                    />
                                    {errors.mentors?.[index]?.name && (
                                      <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-secondary" />
                                    )}
                                  </div>
                                  {errors.mentors?.[index]?.name && (
                                    <motion.p 
                                      initial={{ opacity: 0, y: -10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      className="mt-1 text-xs sm:text-sm text-secondary font-inter flex items-center space-x-1"
                                    >
                                      <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                                      <span>{errors.mentors[index]?.name?.message}</span>
                                    </motion.p>
                                  )}
                                </div>

                                {/* Mentor Email */}
                                <div>
                                  <label className="block font-inter font-semibold text-primary mb-2 text-xs sm:text-sm">
                                    EMAIL ADDRESS *
                                  </label>
                                  <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-primary/50" />
                                    <input
                                      {...register(`mentors.${index}.email`)}
                                      type="email"
                                      className={`w-full pl-10 pr-4 py-2 sm:py-3 border-2 focus:outline-none font-inter bg-background text-xs sm:text-sm ${
                                        errors.mentors?.[index]?.email 
                                          ? 'border-secondary focus:border-secondary' 
                                          : 'border-primary focus:border-secondary'
                                      }`}
                                      placeholder="mentor@example.com"
                                    />
                                    {errors.mentors?.[index]?.email && (
                                      <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-secondary" />
                                    )}
                                  </div>
                                  {errors.mentors?.[index]?.email && (
                                    <motion.p 
                                      initial={{ opacity: 0, y: -10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      className="mt-1 text-xs sm:text-sm text-secondary font-inter flex items-center space-x-1"
                                    >
                                      <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                                      <span>{errors.mentors[index]?.email?.message}</span>
                                    </motion.p>
                                  )}
                                </div>
                              </div>

                              {/* Skills Section */}
                              <div>
                                <label className="block font-inter font-semibold text-primary mb-2 text-xs sm:text-sm">
                                  SKILLS & EXPERTISE *
                                </label>
                                <div className="space-y-3">
                                  <div className="flex space-x-2">
                                    <input
                                      type="text"
                                      placeholder="Enter a skill (e.g., Machine Learning, React, Python)"
                                      className="flex-1 px-3 py-2 sm:px-4 sm:py-3 border-2 border-primary focus:border-secondary focus:outline-none font-inter bg-background text-xs sm:text-sm"
                                      onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                          e.preventDefault();
                                          const input = e.target as HTMLInputElement;
                                          addSkillToMentor(index, input.value);
                                          input.value = '';
                                        }
                                      }}
                                    />
                                    <motion.button
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      type="button"
                                      onClick={(e) => {
                                        const input = (e.target as HTMLElement).parentElement?.querySelector('input') as HTMLInputElement;
                                        if (input) {
                                          addSkillToMentor(index, input.value);
                                          input.value = '';
                                        }
                                      }}
                                      className="bg-accent text-primary px-3 py-2 sm:px-4 sm:py-3 border-2 border-primary shadow-brutal-sm hover:shadow-brutal transition-all duration-200 font-inter font-semibold text-xs sm:text-sm"
                                    >
                                      <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                                    </motion.button>
                                  </div>
                                  
                                  {watchedMentors[index]?.skills && watchedMentors[index].skills.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                      {watchedMentors[index].skills.map((skill, skillIndex) => (
                                        <motion.div
                                          key={skillIndex}
                                          initial={{ opacity: 0, scale: 0.8 }}
                                          animate={{ opacity: 1, scale: 1 }}
                                          className="bg-secondary text-background px-2 py-1 sm:px-3 sm:py-1 border-2 border-primary shadow-brutal-sm flex items-center space-x-1 sm:space-x-2"
                                        >
                                          <span className="font-inter font-semibold text-xs sm:text-sm">{skill}</span>
                                          <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            type="button"
                                            onClick={() => removeSkillFromMentor(index, skillIndex)}
                                            className="text-background hover:text-accent transition-colors duration-200"
                                          >
                                            <X className="h-3 w-3" />
                                          </motion.button>
                                        </motion.div>
                                      ))}
                                    </div>
                                  )}
                                  
                                  {errors.mentors?.[index]?.skills && (
                                    <motion.p 
                                      initial={{ opacity: 0, y: -10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      className="text-xs sm:text-sm text-secondary font-inter flex items-center space-x-1"
                                    >
                                      <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                                      <span>{errors.mentors[index]?.skills?.message}</span>
                                    </motion.p>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      {/* Submit Button */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-secondary text-background py-3 sm:py-4 px-4 sm:px-6 border-2 border-primary shadow-brutal hover:shadow-brutal-hover transition-all duration-200 font-inter font-bold text-sm sm:text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center relative overflow-hidden group"
                      >
                        <motion.div
                          className="absolute inset-0 bg-accent opacity-0 group-hover:opacity-30 transition-opacity duration-300"
                        />
                        {isSubmitting ? (
                          <div className="flex items-center relative z-10">
                            <Loader2 className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6 animate-spin" />
                            ALLOCATING MENTORS...
                          </div>
                        ) : (
                          <div className="flex items-center relative z-10">
                            <GraduationCap className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6" />
                            ALLOCATE MENTORS TO PPTS
                          </div>
                        )}
                      </motion.button>
                    </form>
                  ) : (
                    /* AI Assistant Chat */
                    <div className="bg-background border-4 border-primary shadow-brutal">
                      <div className="border-b-2 border-primary p-3 sm:p-4">
                        <h3 className="font-space font-bold text-lg sm:text-xl text-primary flex items-center">
                          <Bot className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
                          AI MENTOR ASSISTANT
                        </h3>
                        <p className="font-inter text-primary/70 text-xs sm:text-sm">
                          Upload mentor documents or describe mentors in natural language
                        </p>
                      </div>

                      {/* File Upload Section */}
                      <div className="p-3 sm:p-4 border-b-2 border-primary bg-accent/10">
                        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleFileUpload('pdf')}
                            disabled={isProcessingChat}
                            className="flex-1 bg-secondary text-background py-2 sm:py-3 px-3 sm:px-4 border-2 border-primary shadow-brutal-sm hover:shadow-brutal transition-all duration-200 font-inter font-semibold flex items-center justify-center disabled:opacity-50 text-xs sm:text-sm"
                          >
                            <FileText className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                            UPLOAD PDF
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleFileUpload('image')}
                            disabled={isProcessingChat}
                            className="flex-1 bg-accent text-primary py-2 sm:py-3 px-3 sm:px-4 border-2 border-primary shadow-brutal-sm hover:shadow-brutal transition-all duration-200 font-inter font-semibold flex items-center justify-center disabled:opacity-50 text-xs sm:text-sm"
                          >
                            <Image className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                            UPLOAD IMAGE
                          </motion.button>
                        </div>
                      </div>

                      {/* Chat Messages */}
                      <div className="h-48 sm:h-64 overflow-y-auto p-3 sm:p-4 space-y-3">
                        {chatMessages.length === 0 && (
                          <div className="text-center py-6 sm:py-8">
                            <motion.div
                              animate={{ y: [-5, 5, -5] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              <Sparkles className="h-10 w-10 sm:h-12 sm:w-12 text-secondary mx-auto mb-4" />
                            </motion.div>
                            <h4 className="font-space font-bold text-primary mb-2 text-base sm:text-lg">
                              AI MENTOR EXTRACTION
                            </h4>
                            <p className="font-inter text-primary/70 text-xs sm:text-sm">
                              Describe your mentors or upload documents containing mentor information
                            </p>
                          </div>
                        )}

                        {chatMessages.map((message) => (
                          <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-[80%] p-2 sm:p-3 border-2 border-primary ${
                              message.type === 'user' 
                                ? 'bg-secondary text-background' 
                                : 'bg-accent/20 text-primary'
                            }`}>
                              <div className="font-inter text-xs sm:text-sm">
                                {message.content}
                              </div>
                              <div className="font-inter text-xs opacity-70 mt-1 flex items-center space-x-1">
                                {message.inputType === 'pdf' && <FileText className="h-3 w-3" />}
                                {message.inputType === 'image' && <Image className="h-3 w-3" />}
                                <span>{message.timestamp.toLocaleTimeString()}</span>
                              </div>
                            </div>
                          </motion.div>
                        ))}

                        {isProcessingChat && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex justify-start"
                          >
                            <div className="bg-accent/20 text-primary p-2 sm:p-3 border-2 border-primary">
                              <div className="flex items-center space-x-2">
                                <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                                <span className="font-inter text-xs sm:text-sm">Processing with AI...</span>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </div>

                      {/* Chat Input */}
                      <div className="p-3 sm:p-4 border-t-2 border-primary">
                        <form onSubmit={handleChatSubmit} className="flex space-x-2">
                          <input
                            type="text"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            placeholder="Describe your mentors (names, skills, expertise areas)..."
                            disabled={isProcessingChat}
                            className="flex-1 px-3 py-2 border-2 border-primary focus:border-secondary focus:outline-none font-inter bg-background text-xs sm:text-sm disabled:opacity-50"
                          />
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="submit"
                            disabled={isProcessingChat || !chatInput.trim()}
                            className="bg-secondary text-background px-3 py-2 sm:px-4 sm:py-2 border-2 border-primary shadow-brutal-sm hover:shadow-brutal transition-all duration-200 font-inter font-bold text-xs sm:text-sm disabled:opacity-50"
                          >
                            <Send className="h-3 w-3 sm:h-4 sm:w-4" />
                          </motion.button>
                        </form>
                      </div>

                      {/* Hidden file inputs */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf"
                        onChange={(e) => handleFileChange(e, 'pdf')}
                        className="hidden"
                      />
                      <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'image')}
                        className="hidden"
                      />
                    </div>
                  )}
                </motion.div>
              ) : (
                /* Allocation Results Visualization */
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6 sm:space-y-8"
                >
                  {/* Summary Statistics */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    {[
                      { 
                        label: 'TOTAL MENTORS', 
                        value: allocationResult!.summary.totalMentors, 
                        icon: Users,
                        color: 'bg-accent/20 border-accent'
                      },
                      { 
                        label: 'TOTAL PPTS', 
                        value: allocationResult!.summary.totalPPTs, 
                        icon: FileText,
                        color: 'bg-secondary/20 border-secondary'
                      },
                      { 
                        label: 'ALLOCATED PPTS', 
                        value: allocationResult!.summary.allocatedPPTs, 
                        icon: CheckCircle,
                        color: 'bg-primary/10 border-primary'
                      },
                      { 
                        label: 'AVG MATCH SCORE', 
                        value: `${allocationResult!.summary.averageMatchScore.toFixed(1)}%`, 
                        icon: TrendingUp,
                        color: 'bg-accent/30 border-accent'
                      },
                    ].map((stat, index) => (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02, y: -2 }}
                        className={`${stat.color} border-4 shadow-brutal p-4 sm:p-6 text-center relative overflow-hidden group`}
                      >
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        />
                        <stat.icon className="h-6 w-6 sm:h-8 sm:w-8 text-primary mx-auto mb-2 sm:mb-4 relative z-10" />
                        <div className="font-space font-bold text-xl sm:text-3xl text-primary mb-1 sm:mb-2 relative z-10">
                          {stat.value}
                        </div>
                        <div className="font-inter font-semibold text-primary text-xs sm:text-sm relative z-10">
                          {stat.label}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Export Actions */}
                  <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={exportToCSV}
                      className="bg-accent text-primary px-4 py-2 sm:px-6 sm:py-3 border-2 border-primary shadow-brutal hover:shadow-brutal-hover transition-all duration-200 font-inter font-bold flex items-center justify-center text-xs sm:text-sm"
                    >
                      <Download className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                      EXPORT CSV
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={copyAllocationData}
                      className="bg-secondary text-background px-4 py-2 sm:px-6 sm:py-3 border-2 border-primary shadow-brutal hover:shadow-brutal-hover transition-all duration-200 font-inter font-bold flex items-center justify-center text-xs sm:text-sm"
                    >
                      {copiedData ? <Check className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" /> : <Copy className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />}
                      {copiedData ? 'COPIED!' : 'COPY DATA'}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={resetForm}
                      className="bg-primary text-background px-4 py-2 sm:px-6 sm:py-3 border-2 border-primary shadow-brutal hover:shadow-brutal-hover transition-all duration-200 font-inter font-bold text-xs sm:text-sm"
                    >
                      NEW ALLOCATION
                    </motion.button>
                  </div>

                  {/* Allocation Results */}
                  <div className="bg-background border-4 border-primary shadow-brutal">
                    <div className="border-b-2 border-primary p-3 sm:p-4">
                      <h3 className="font-space font-bold text-lg sm:text-xl text-primary flex items-center">
                        <Award className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
                        MENTOR-PPT ALLOCATION RESULTS
                      </h3>
                    </div>

                    <div className="p-4 sm:p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                        {allocationResult!.allocations.map((allocation, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.02, boxShadow: '12px 12px 0px #000000' }}
                            className="bg-background border-4 border-primary shadow-brutal p-4 sm:p-6 relative group"
                          >
                            {/* Match Score Badge */}
                            <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
                              <div className={`px-2 py-1 sm:px-3 sm:py-1 border-2 border-primary text-xs sm:text-sm font-bold ${getMatchScoreColor(allocation.matchScore)}`}>
                                {allocation.matchScore.toFixed(1)}% MATCH
                              </div>
                            </div>

                            {/* Mentor Info */}
                            <div className="mb-4">
                              <h4 className="font-space font-bold text-base sm:text-lg text-primary mb-2">
                                {allocation.mentorName}
                              </h4>
                              <div className="flex items-center space-x-2 mb-3">
                                <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-primary/50" />
                                <span className="font-inter text-primary/70 text-xs sm:text-sm">
                                  {allocation.mentorEmail}
                                </span>
                              </div>
                              
                              {/* Mentor Skills */}
                              <div className="mb-3">
                                <h5 className="font-inter font-semibold text-primary text-xs sm:text-sm mb-2">MENTOR SKILLS:</h5>
                                <div className="flex flex-wrap gap-1">
                                  {allocation.mentorSkills.map((skill, skillIndex) => (
                                    <span
                                      key={skillIndex}
                                      className={`px-2 py-1 text-xs font-inter font-semibold border border-primary ${
                                        allocation.matchedSkills?.includes(skill)
                                          ? 'bg-accent text-primary'
                                          : 'bg-primary/10 text-primary/70'
                                      }`}
                                    >
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* PPT Info */}
                            <div className="border-t-2 border-primary pt-4">
                              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 space-y-2 sm:space-y-0">
                                <h5 className="font-inter font-semibold text-primary text-xs sm:text-sm">
                                  ASSIGNED PPT: {allocation.teamId}
                                </h5>
                                
                                {/* PDF Download Link */}
                                <a 
                                  href={allocation.pdfDownloadLink || `https://server.aimliedc.tech/h4b-pdf-idea/get-pdf/${allocation.teamId}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="bg-secondary text-background px-2 py-1 border-2 border-primary shadow-brutal-sm hover:shadow-brutal transition-all duration-200 text-xs font-inter font-bold flex items-center self-start"
                                >
                                  <Download className="h-3 w-3 mr-1" />
                                  PDF
                                  <ExternalLink className="h-3 w-3 ml-1" />
                                </a>
                              </div>
                              
                              {/* PPT Keywords */}
                              <div>
                                <h6 className="font-inter font-semibold text-primary text-xs sm:text-sm mb-2">PPT KEYWORDS:</h6>
                                <div className="flex flex-wrap gap-1">
                                  {allocation.pptKeywords.map((keyword, keywordIndex) => (
                                    <span
                                      key={keywordIndex}
                                      className={`px-2 py-1 text-xs font-inter font-semibold border border-primary ${
                                        allocation.matchedSkills?.some(skill => 
                                          skill.toLowerCase().includes(keyword.toLowerCase()) ||
                                          keyword.toLowerCase().includes(skill.toLowerCase())
                                        )
                                          ? 'bg-secondary text-background'
                                          : 'bg-secondary/20 text-primary'
                                      }`}
                                    >
                                      {keyword}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Hover Effect */}
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-br from-accent/10 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                            />
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t-4 border-primary p-4 sm:p-6 bg-primary/5">
              <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
                <div className="text-center sm:text-left">
                  <p className="font-inter text-primary/70 text-xs sm:text-sm">
                    Hackathon ID: {hackathonId}
                  </p>
                  <p className="font-inter text-primary/60 text-xs">
                    AI-powered mentor allocation with skill matching
                  </p>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="bg-background text-primary px-4 py-2 sm:px-6 sm:py-3 border-2 border-primary shadow-brutal-sm hover:shadow-brutal transition-all duration-200 font-inter font-semibold text-xs sm:text-sm"
                >
                  CLOSE
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}