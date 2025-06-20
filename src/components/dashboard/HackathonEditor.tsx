import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calendar, Users, Trophy, Tag, FileText, Clock, ArrowLeft, MapPin, AlertCircle, Save, Loader2, DollarSign, Award, Plus, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { HackathonService, Hackathon } from '../../services/hackathonService';
import AIAssistant from '../ai/AIAssistant';

interface Prize {
  id: string;
  name: string;
  description: string;
  amount?: number;
  type: 'cash' | 'other';
}

const hackathonSchema = z.object({
  hackathonName: z.string().min(3, 'Title must be at least 3 characters'),
  tagline: z.string().min(10, 'Tagline must be at least 10 characters'),
  about: z.string().min(20, 'Description must be at least 20 characters'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  registrationStartDate: z.string().min(1, 'Registration start date is required'),
  registrationEndDate: z.string().min(1, 'Registration end date is required'),
  venue: z.string().min(1, 'Venue is required'),
  minTeamSize: z.number().min(1, 'Minimum team size must be at least 1').optional(),
  maxTeamSize: z.number().min(1, 'Maximum team size must be at least 1').optional(),
});

type HackathonFormData = z.infer<typeof hackathonSchema>;

interface HackathonEditorProps {
  hackathonId: string;
}

export default function HackathonEditor({ hackathonId }: HackathonEditorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [hackathonData, setHackathonData] = useState<Hackathon | null>(null);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const { currentUser } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    clearErrors,
    watch,
  } = useForm<HackathonFormData>({
    resolver: zodResolver(hackathonSchema),
  });

  // Watch all form values to detect changes
  const watchedValues = watch();

  // Load hackathon data on component mount
  useEffect(() => {
    loadHackathonData();
  }, [hackathonId]);

  const loadHackathonData = async () => {
    if (!currentUser) {
      showError('Authentication Error', 'Please log in to edit hackathon');
      navigate('/auth');
      return;
    }

    try {
      setIsLoadingData(true);
      
      const response = await HackathonService.fetchSingleHackathon({
        email: currentUser.email,
        authToken: currentUser.authToken,
        hackathonId: hackathonId,
      });

      const hackathon = response.hackathon;
      setHackathonData(hackathon);

      // Pre-fill the form with existing data
      reset({
        hackathonName: hackathon.hackathonName,
        tagline: hackathon.tagline,
        about: hackathon.about,
        startDate: HackathonService.formatDateForInput(hackathon.startDate),
        endDate: HackathonService.formatDateForInput(hackathon.endDate),
        registrationStartDate: HackathonService.formatDateForInput(hackathon.registrationStartDate),
        registrationEndDate: HackathonService.formatDateForInput(hackathon.registrationEndDate),
        venue: hackathon.venue,
        minTeamSize: hackathon.minTeamSize,
        maxTeamSize: hackathon.maxTeamSize,
      });

      // Initialize prizes array
      const initialPrizes: Prize[] = [];
      
      if (hackathon.cashPrize) {
        initialPrizes.push({
          id: 'cash-1',
          name: hackathon.cashPrize.name,
          description: '',
          amount: hackathon.cashPrize.amount,
          type: 'cash'
        });
      }
      
      if (hackathon.otherPrize) {
        initialPrizes.push({
          id: 'other-1',
          name: hackathon.otherPrize.name,
          description: hackathon.otherPrize.description,
          type: 'other'
        });
      }

      // Ensure at least one prize exists
      if (initialPrizes.length === 0) {
        initialPrizes.push({
          id: 'prize-1',
          name: '',
          description: '',
          type: 'other'
        });
      }

      setPrizes(initialPrizes);

    } catch (error: any) {
      showError('Failed to Load Hackathon', error.message || 'Unable to fetch hackathon data');
      navigate('/organizer-dashboard');
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleAIDataExtracted = (extractedData: any) => {
    // Fill form fields with extracted data
    if (extractedData.hackathonName) {
      setValue('hackathonName', extractedData.hackathonName);
      clearErrors('hackathonName');
    }
    if (extractedData.tagline) {
      setValue('tagline', extractedData.tagline);
      clearErrors('tagline');
    }
    if (extractedData.about) {
      setValue('about', extractedData.about);
      clearErrors('about');
    }
    if (extractedData.startDate) {
      setValue('startDate', extractedData.startDate);
      clearErrors('startDate');
    }
    if (extractedData.endDate) {
      setValue('endDate', extractedData.endDate);
      clearErrors('endDate');
    }
    if (extractedData.registrationStartDate) {
      setValue('registrationStartDate', extractedData.registrationStartDate);
      clearErrors('registrationStartDate');
    }
    if (extractedData.registrationEndDate) {
      setValue('registrationEndDate', extractedData.registrationEndDate);
      clearErrors('registrationEndDate');
    }
    if (extractedData.venue) {
      setValue('venue', extractedData.venue);
      clearErrors('venue');
    }
  };

  const handleFieldError = (field: string, message: string) => {
    setFieldErrors(prev => ({ ...prev, [field]: message }));
  };

  const handleClearFieldError = (field: string) => {
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const addPrize = () => {
    const newPrize: Prize = {
      id: `prize-${Date.now()}`,
      name: '',
      description: '',
      type: 'other'
    };
    setPrizes(prev => [...prev, newPrize]);
  };

  const removePrize = (prizeId: string) => {
    if (prizes.length <= 1) {
      showError('Cannot Remove Prize', 'At least one prize must be present');
      return;
    }
    setPrizes(prev => prev.filter(prize => prize.id !== prizeId));
  };

  const updatePrize = (prizeId: string, field: keyof Prize, value: string | number) => {
    setPrizes(prev => prev.map(prize => 
      prize.id === prizeId 
        ? { ...prize, [field]: value }
        : prize
    ));
  };

  const onSubmit = async (data: HackathonFormData) => {
    if (!currentUser || !hackathonData) {
      showError('Authentication Error', 'Please log in to update hackathon');
      return;
    }

    try {
      setIsLoading(true);
      
      const updateData: any = {
        email: currentUser.email,
        authToken: currentUser.authToken,
        hackathonId: hackathonId,
        hackathonName: data.hackathonName,
        startDate: data.startDate,
        endDate: data.endDate,
        registrationStartDate: data.registrationStartDate,
        registrationEndDate: data.registrationEndDate,
        tagline: data.tagline,
        venue: data.venue,
        about: data.about,
      };

      // Add optional fields if provided
      if (data.minTeamSize) updateData.minTeamSize = data.minTeamSize;
      if (data.maxTeamSize) updateData.maxTeamSize = data.maxTeamSize;
      
      // Process prizes
      const cashPrizes = prizes.filter(p => p.type === 'cash' && p.name && p.amount);
      const otherPrizes = prizes.filter(p => p.type === 'other' && p.name && p.description);
      
      if (cashPrizes.length > 0) {
        updateData.cashPrize = {
          name: cashPrizes[0].name,
          amount: cashPrizes[0].amount
        };
      }
      
      if (otherPrizes.length > 0) {
        updateData.otherPrize = {
          name: otherPrizes[0].name,
          description: otherPrizes[0].description
        };
      }

      await HackathonService.updateHackathon(updateData);
      
      showSuccess(
        'Hackathon Updated Successfully! 🎉',
        `${data.hackathonName} has been updated with your changes.`
      );
      
      setFieldErrors({});
      
      // Dispatch event for organizer dashboard to refresh
      window.dispatchEvent(new CustomEvent('hackathonUpdated'));
      
      // Navigate back to organizer dashboard after a short delay
      setTimeout(() => {
        navigate('/organizer-dashboard');
      }, 2000);
      
    } catch (error: any) {
      showError(
        'Failed to Update Hackathon',
        error.message || 'An unexpected error occurred. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getFieldError = (fieldName: string) => {
    return fieldErrors[fieldName] || errors[fieldName as keyof typeof errors]?.message;
  };

  const hasFieldError = (fieldName: string) => {
    return !!(fieldErrors[fieldName] || errors[fieldName as keyof typeof errors]);
  };

  // Check if form has been modified
  const hasChanges = hackathonData && (
    watchedValues.hackathonName !== hackathonData.hackathonName ||
    watchedValues.tagline !== hackathonData.tagline ||
    watchedValues.about !== hackathonData.about ||
    watchedValues.startDate !== HackathonService.formatDateForInput(hackathonData.startDate) ||
    watchedValues.endDate !== HackathonService.formatDateForInput(hackathonData.endDate) ||
    watchedValues.registrationStartDate !== HackathonService.formatDateForInput(hackathonData.registrationStartDate) ||
    watchedValues.registrationEndDate !== HackathonService.formatDateForInput(hackathonData.registrationEndDate) ||
    watchedValues.venue !== hackathonData.venue ||
    watchedValues.minTeamSize !== hackathonData.minTeamSize ||
    watchedValues.maxTeamSize !== hackathonData.maxTeamSize ||
    JSON.stringify(prizes) !== JSON.stringify([
      ...(hackathonData.cashPrize ? [{
        id: 'cash-1',
        name: hackathonData.cashPrize.name,
        description: '',
        amount: hackathonData.cashPrize.amount,
        type: 'cash' as const
      }] : []),
      ...(hackathonData.otherPrize ? [{
        id: 'other-1',
        name: hackathonData.otherPrize.name,
        description: hackathonData.otherPrize.description,
        type: 'other' as const
      }] : [])
    ])
  );

  if (isLoadingData) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-20">
          <Loader2 className="h-16 w-16 text-secondary mx-auto mb-4 animate-spin" />
          <h2 className="font-space font-bold text-2xl text-primary mb-2">
            LOADING HACKATHON DATA
          </h2>
          <p className="font-inter text-primary/70">
            Please wait while we fetch your hackathon details...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <motion.div
            whileHover={{ scale: 1.05, x: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              to="/organizer-dashboard"
              className="inline-flex items-center bg-background text-primary px-6 py-3 border-2 border-primary shadow-brutal hover:shadow-brutal-hover transition-all duration-200 font-inter font-semibold relative overflow-hidden group"
            >
              <motion.div
                className="absolute inset-0 bg-accent opacity-0 group-hover:opacity-20 transition-opacity duration-300"
              />
              <ArrowLeft className="mr-3 h-5 w-5 relative z-10" />
              <span className="relative z-10">BACK TO DASHBOARD</span>
            </Link>
          </motion.div>
        </motion.div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-space font-bold text-4xl text-primary mb-4">
            MANAGE HACKATHON
          </h1>
          <p className="font-inter text-primary/70 max-w-2xl mx-auto mb-4">
            Update your hackathon details and manage prizes. All changes will be saved and reflected immediately.
          </p>
          
          {/* Changes Indicator */}
          {hasChanges && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-secondary/20 border-2 border-secondary shadow-brutal p-3 max-w-md mx-auto mb-4"
            >
              <div className="flex items-center justify-center space-x-2">
                <AlertCircle className="h-5 w-5 text-secondary" />
                <span className="font-inter font-semibold text-primary">
                  You have unsaved changes
                </span>
              </div>
            </motion.div>
          )}
          
          {/* AI USP Banner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-secondary/20 to-accent/20 border-4 border-primary shadow-brutal p-4 max-w-2xl mx-auto mb-8"
          >
            <div className="flex items-center justify-center space-x-3">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Trophy className="h-6 w-6 text-secondary" />
              </motion.div>
              <div>
                <h3 className="font-space font-bold text-lg text-primary">
                  🚀 AI-POWERED EDITING
                </h3>
                <p className="font-inter text-primary/80 text-sm">
                  Use AI assistant to update fields with new content!
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Form */}
        <div className="bg-background border-4 border-primary shadow-brutal p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Information */}
            <div className="grid grid-cols-1 tablet:grid-cols-2 gap-6">
              {/* Hackathon Name */}
              <div className="tablet:col-span-2">
                <label htmlFor="hackathonName" className="block font-inter font-semibold text-primary mb-2">
                  HACKATHON NAME
                </label>
                <div className="relative">
                  <Trophy className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary/50" />
                  <input
                    {...register('hackathonName')}
                    type="text"
                    id="hackathonName"
                    className={`w-full pl-10 pr-4 py-3 border-2 focus:outline-none font-inter bg-background ${
                      hasFieldError('hackathonName') 
                        ? 'border-secondary focus:border-secondary' 
                        : 'border-primary focus:border-secondary'
                    }`}
                    placeholder="Enter hackathon name"
                  />
                  {hasFieldError('hackathonName') && (
                    <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary" />
                  )}
                </div>
                {hasFieldError('hackathonName') && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1 text-sm text-secondary font-inter flex items-center space-x-1"
                  >
                    <AlertCircle className="h-4 w-4" />
                    <span>{getFieldError('hackathonName')}</span>
                  </motion.p>
                )}
              </div>

              {/* Start Date */}
              <div>
                <label htmlFor="startDate" className="block font-inter font-semibold text-primary mb-2">
                  START DATE
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary/50" />
                  <input
                    {...register('startDate')}
                    type="datetime-local"
                    id="startDate"
                    className={`w-full pl-10 pr-4 py-3 border-2 focus:outline-none font-inter bg-background ${
                      hasFieldError('startDate') 
                        ? 'border-secondary focus:border-secondary' 
                        : 'border-primary focus:border-secondary'
                    }`}
                  />
                  {hasFieldError('startDate') && (
                    <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary" />
                  )}
                </div>
                {hasFieldError('startDate') && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1 text-sm text-secondary font-inter flex items-center space-x-1"
                  >
                    <AlertCircle className="h-4 w-4" />
                    <span>{getFieldError('startDate')}</span>
                  </motion.p>
                )}
              </div>

              {/* End Date */}
              <div>
                <label htmlFor="endDate" className="block font-inter font-semibold text-primary mb-2">
                  END DATE
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary/50" />
                  <input
                    {...register('endDate')}
                    type="datetime-local"
                    id="endDate"
                    className={`w-full pl-10 pr-4 py-3 border-2 focus:outline-none font-inter bg-background ${
                      hasFieldError('endDate') 
                        ? 'border-secondary focus:border-secondary' 
                        : 'border-primary focus:border-secondary'
                    }`}
                  />
                  {hasFieldError('endDate') && (
                    <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary" />
                  )}
                </div>
                {hasFieldError('endDate') && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1 text-sm text-secondary font-inter flex items-center space-x-1"
                  >
                    <AlertCircle className="h-4 w-4" />
                    <span>{getFieldError('endDate')}</span>
                  </motion.p>
                )}
              </div>

              {/* Registration Start Date */}
              <div>
                <label htmlFor="registrationStartDate" className="block font-inter font-semibold text-primary mb-2">
                  REGISTRATION START
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary/50" />
                  <input
                    {...register('registrationStartDate')}
                    type="datetime-local"
                    id="registrationStartDate"
                    className={`w-full pl-10 pr-4 py-3 border-2 focus:outline-none font-inter bg-background ${
                      hasFieldError('registrationStartDate') 
                        ? 'border-secondary focus:border-secondary' 
                        : 'border-primary focus:border-secondary'
                    }`}
                  />
                  {hasFieldError('registrationStartDate') && (
                    <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary" />
                  )}
                </div>
                {hasFieldError('registrationStartDate') && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1 text-sm text-secondary font-inter flex items-center space-x-1"
                  >
                    <AlertCircle className="h-4 w-4" />
                    <span>{getFieldError('registrationStartDate')}</span>
                  </motion.p>
                )}
              </div>

              {/* Registration End Date */}
              <div>
                <label htmlFor="registrationEndDate" className="block font-inter font-semibold text-primary mb-2">
                  REGISTRATION END
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary/50" />
                  <input
                    {...register('registrationEndDate')}
                    type="datetime-local"
                    id="registrationEndDate"
                    className={`w-full pl-10 pr-4 py-3 border-2 focus:outline-none font-inter bg-background ${
                      hasFieldError('registrationEndDate') 
                        ? 'border-secondary focus:border-secondary' 
                        : 'border-primary focus:border-secondary'
                    }`}
                  />
                  {hasFieldError('registrationEndDate') && (
                    <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary" />
                  )}
                </div>
                {hasFieldError('registrationEndDate') && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1 text-sm text-secondary font-inter flex items-center space-x-1"
                  >
                    <AlertCircle className="h-4 w-4" />
                    <span>{getFieldError('registrationEndDate')}</span>
                  </motion.p>
                )}
              </div>
            </div>

            {/* Tagline */}
            <div>
              <label htmlFor="tagline" className="block font-inter font-semibold text-primary mb-2">
                TAGLINE
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary/50" />
                <input
                  {...register('tagline')}
                  type="text"
                  id="tagline"
                  className={`w-full pl-10 pr-4 py-3 border-2 focus:outline-none font-inter bg-background ${
                    hasFieldError('tagline') 
                      ? 'border-secondary focus:border-secondary' 
                      : 'border-primary focus:border-secondary'
                  }`}
                  placeholder="A catchy tagline for your hackathon"
                />
                {hasFieldError('tagline') && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary" />
                )}
              </div>
              {hasFieldError('tagline') && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 text-sm text-secondary font-inter flex items-center space-x-1"
                >
                  <AlertCircle className="h-4 w-4" />
                  <span>{getFieldError('tagline')}</span>
                </motion.p>
              )}
            </div>

            {/* Venue */}
            <div>
              <label htmlFor="venue" className="block font-inter font-semibold text-primary mb-2">
                VENUE
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary/50" />
                <input
                  {...register('venue')}
                  type="text"
                  id="venue"
                  className={`w-full pl-10 pr-4 py-3 border-2 focus:outline-none font-inter bg-background ${
                    hasFieldError('venue') 
                      ? 'border-secondary focus:border-secondary' 
                      : 'border-primary focus:border-secondary'
                  }`}
                  placeholder="Online, City Name, or Specific Address"
                />
                {hasFieldError('venue') && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary" />
                )}
              </div>
              {hasFieldError('venue') && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 text-sm text-secondary font-inter flex items-center space-x-1"
                >
                  <AlertCircle className="h-4 w-4" />
                  <span>{getFieldError('venue')}</span>
                </motion.p>
              )}
            </div>

            {/* Team Size Section */}
            <div className="border-t-2 border-primary pt-6">
              <h3 className="font-space font-bold text-xl text-primary mb-4">
                TEAM CONFIGURATION (OPTIONAL)
              </h3>
              <div className="grid grid-cols-1 tablet:grid-cols-2 gap-6">
                {/* Min Team Size */}
                <div>
                  <label htmlFor="minTeamSize" className="block font-inter font-semibold text-primary mb-2">
                    MINIMUM TEAM SIZE
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary/50" />
                    <input
                      {...register('minTeamSize', { valueAsNumber: true })}
                      type="number"
                      id="minTeamSize"
                      min="1"
                      className="w-full pl-10 pr-4 py-3 border-2 border-primary focus:border-secondary focus:outline-none font-inter bg-background"
                      placeholder="e.g., 1"
                    />
                  </div>
                </div>

                {/* Max Team Size */}
                <div>
                  <label htmlFor="maxTeamSize" className="block font-inter font-semibold text-primary mb-2">
                    MAXIMUM TEAM SIZE
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary/50" />
                    <input
                      {...register('maxTeamSize', { valueAsNumber: true })}
                      type="number"
                      id="maxTeamSize"
                      min="1"
                      className="w-full pl-10 pr-4 py-3 border-2 border-primary focus:border-secondary focus:outline-none font-inter bg-background"
                      placeholder="e.g., 5"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamic Prizes Section */}
            <div className="border-t-2 border-primary pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-space font-bold text-xl text-primary">
                  PRIZES MANAGEMENT
                </h3>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={addPrize}
                  className="bg-accent text-primary px-4 py-2 border-2 border-primary shadow-brutal-sm hover:shadow-brutal transition-all duration-200 font-inter font-semibold text-sm inline-flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  ADD PRIZE
                </motion.button>
              </div>
              
              <div className="space-y-6">
                {prizes.map((prize, index) => (
                  <motion.div
                    key={prize.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-accent/10 border-2 border-primary p-4 relative"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-inter font-semibold text-primary">
                        PRIZE #{index + 1}
                      </h4>
                      {prizes.length > 1 && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          type="button"
                          onClick={() => removePrize(prize.id)}
                          className="bg-secondary text-background p-2 border-2 border-primary shadow-brutal-sm hover:shadow-brutal transition-all duration-200"
                          title="Remove Prize"
                        >
                          <Trash2 className="h-4 w-4" />
                        </motion.button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 tablet:grid-cols-3 gap-4 mb-4">
                      {/* Prize Type */}
                      <div>
                        <label className="block font-inter font-medium text-primary mb-2">
                          Prize Type
                        </label>
                        <select
                          value={prize.type}
                          onChange={(e) => updatePrize(prize.id, 'type', e.target.value as 'cash' | 'other')}
                          className="w-full px-4 py-3 border-2 border-primary focus:border-secondary focus:outline-none font-inter bg-background"
                        >
                          <option value="cash">Cash Prize</option>
                          <option value="other">Other Prize</option>
                        </select>
                      </div>

                      {/* Prize Name */}
                      <div>
                        <label className="block font-inter font-medium text-primary mb-2">
                          Prize Name
                        </label>
                        <div className="relative">
                          <Award className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary/50" />
                          <input
                            type="text"
                            value={prize.name}
                            onChange={(e) => updatePrize(prize.id, 'name', e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border-2 border-primary focus:border-secondary focus:outline-none font-inter bg-background"
                            placeholder="e.g., First Place"
                          />
                        </div>
                      </div>

                      {/* Amount or Description */}
                      <div>
                        <label className="block font-inter font-medium text-primary mb-2">
                          {prize.type === 'cash' ? 'Amount ($)' : 'Description'}
                        </label>
                        <div className="relative">
                          {prize.type === 'cash' ? (
                            <>
                              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary/50" />
                              <input
                                type="number"
                                value={prize.amount || ''}
                                onChange={(e) => updatePrize(prize.id, 'amount', parseFloat(e.target.value) || 0)}
                                min="0"
                                className="w-full pl-10 pr-4 py-3 border-2 border-primary focus:border-secondary focus:outline-none font-inter bg-background"
                                placeholder="e.g., 1000"
                              />
                            </>
                          ) : (
                            <input
                              type="text"
                              value={prize.description}
                              onChange={(e) => updatePrize(prize.id, 'description', e.target.value)}
                              className="w-full px-4 py-3 border-2 border-primary focus:border-secondary focus:outline-none font-inter bg-background"
                              placeholder="e.g., Mentorship program"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* About */}
            <div>
              <label htmlFor="about" className="block font-inter font-semibold text-primary mb-2">
                ABOUT THE HACKATHON
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-5 w-5 text-primary/50" />
                <textarea
                  {...register('about')}
                  id="about"
                  rows={4}
                  className={`w-full pl-10 pr-4 py-3 border-2 focus:outline-none font-inter bg-background resize-none ${
                    hasFieldError('about') 
                      ? 'border-secondary focus:border-secondary' 
                      : 'border-primary focus:border-secondary'
                  }`}
                  placeholder="Describe your hackathon, its goals, themes, and what participants can expect..."
                />
                {hasFieldError('about') && (
                  <AlertCircle className="absolute right-3 top-3 h-5 w-5 text-secondary" />
                )}
              </div>
              {hasFieldError('about') && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 text-sm text-secondary font-inter flex items-center space-x-1"
                >
                  <AlertCircle className="h-4 w-4" />
                  <span>{getFieldError('about')}</span>
                </motion.p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col tablet:flex-row space-y-4 tablet:space-y-0 tablet:space-x-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading || !hasChanges}
                className="flex-1 bg-accent text-primary py-4 px-6 border-2 border-primary shadow-brutal hover:shadow-brutal-hover transition-all duration-200 font-inter font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                    UPDATING HACKATHON...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Save className="mr-3 h-5 w-5" />
                    SAVE CHANGES
                  </div>
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => navigate('/organizer-dashboard')}
                disabled={isLoading}
                className="tablet:w-auto bg-background text-primary py-4 px-6 border-2 border-primary shadow-brutal hover:shadow-brutal-hover transition-all duration-200 font-inter font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                CANCEL
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>

      {/* AI Assistant Component */}
      <AIAssistant
        onDataExtracted={handleAIDataExtracted}
        onFieldError={handleFieldError}
        onClearFieldError={handleClearFieldError}
      />
    </div>
  );
}