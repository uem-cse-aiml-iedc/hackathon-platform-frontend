import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calendar, Users, Trophy, Tag, FileText, Clock, ArrowLeft, MapPin, AlertCircle, DollarSign, Award } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { HackathonService } from '../../services/hackathonService';
import AIAssistant from '../ai/AIAssistant';

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
  cashPrizeName: z.string().optional(),
  cashPrizeAmount: z.number().min(0, 'Prize amount must be positive').optional(),
  otherPrizeName: z.string().optional(),
  otherPrizeDescription: z.string().optional(),
});

type HackathonFormData = z.infer<typeof hackathonSchema>;

export default function HackathonCreator() {
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
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
  } = useForm<HackathonFormData>({
    resolver: zodResolver(hackathonSchema),
  });

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

  const onSubmit = async (data: HackathonFormData) => {
    if (!currentUser) {
      showError('Authentication Error', 'Please log in to create a hackathon');
      return;
    }

    try {
      setIsLoading(true);
      
      const hackathonData: any = {
        email: currentUser.email,
        authToken: currentUser.authToken,
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
      if (data.minTeamSize) hackathonData.minTeamSize = data.minTeamSize;
      if (data.maxTeamSize) hackathonData.maxTeamSize = data.maxTeamSize;
      
      if (data.cashPrizeName && data.cashPrizeAmount) {
        hackathonData.cashPrize = {
          name: data.cashPrizeName,
          amount: data.cashPrizeAmount
        };
      }
      
      if (data.otherPrizeName && data.otherPrizeDescription) {
        hackathonData.otherPrize = {
          name: data.otherPrizeName,
          description: data.otherPrizeDescription
        };
      }

      await HackathonService.createHackathon(hackathonData);
      
      showSuccess(
        'Hackathon Created Successfully! 🎉',
        `${data.hackathonName} has been created and is now live on the platform.`
      );
      
      reset();
      setFieldErrors({});
      
      // Dispatch event for organizer dashboard to refresh
      window.dispatchEvent(new CustomEvent('hackathonCreated'));
      
      // Navigate to organizer dashboard after a short delay
      setTimeout(() => {
        navigate('/organizer-dashboard');
      }, 2000);
      
    } catch (error: any) {
      showError(
        'Failed to Create Hackathon',
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
              to="/"
              className="inline-flex items-center bg-background text-primary px-6 py-3 border-2 border-primary shadow-brutal hover:shadow-brutal-hover transition-all duration-200 font-inter font-semibold relative overflow-hidden group"
            >
              <motion.div
                className="absolute inset-0 bg-accent opacity-0 group-hover:opacity-20 transition-opacity duration-300"
              />
              <ArrowLeft className="mr-3 h-5 w-5 relative z-10" />
              <span className="relative z-10">BACK TO HOME</span>
            </Link>
          </motion.div>
        </motion.div>

        {/* Header with AI USP */}
        <div className="text-center mb-8">
          <h1 className="font-space font-bold text-4xl text-primary mb-4">
            CREATE HACKATHON
          </h1>
          <p className="font-inter text-primary/70 max-w-2xl mx-auto mb-4">
            Organize your own hackathon and bring together innovative minds to build amazing projects.
          </p>
          
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
                  🚀 NEW: AI-POWERED 1-CLICK FILL
                </h3>
                <p className="font-inter text-primary/80 text-sm">
                  Upload any document, image, or describe your event - our AI will auto-fill the form!
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

            {/* Prizes Section */}
            <div className="border-t-2 border-primary pt-6">
              <h3 className="font-space font-bold text-xl text-primary mb-4">
                PRIZES (OPTIONAL)
              </h3>
              
              {/* Cash Prize */}
              <div className="mb-6">
                <h4 className="font-inter font-semibold text-primary mb-3">CASH PRIZE</h4>
                <div className="grid grid-cols-1 tablet:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="cashPrizeName" className="block font-inter font-medium text-primary mb-2">
                      Prize Name
                    </label>
                    <div className="relative">
                      <Award className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary/50" />
                      <input
                        {...register('cashPrizeName')}
                        type="text"
                        id="cashPrizeName"
                        className="w-full pl-10 pr-4 py-3 border-2 border-primary focus:border-secondary focus:outline-none font-inter bg-background"
                        placeholder="e.g., First Place"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="cashPrizeAmount" className="block font-inter font-medium text-primary mb-2">
                      Amount ($)
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary/50" />
                      <input
                        {...register('cashPrizeAmount', { valueAsNumber: true })}
                        type="number"
                        id="cashPrizeAmount"
                        min="0"
                        className="w-full pl-10 pr-4 py-3 border-2 border-primary focus:border-secondary focus:outline-none font-inter bg-background"
                        placeholder="e.g., 1000"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Other Prize */}
              <div>
                <h4 className="font-inter font-semibold text-primary mb-3">OTHER PRIZE</h4>
                <div className="grid grid-cols-1 tablet:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="otherPrizeName" className="block font-inter font-medium text-primary mb-2">
                      Prize Name
                    </label>
                    <div className="relative">
                      <Trophy className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary/50" />
                      <input
                        {...register('otherPrizeName')}
                        type="text"
                        id="otherPrizeName"
                        className="w-full pl-10 pr-4 py-3 border-2 border-primary focus:border-secondary focus:outline-none font-inter bg-background"
                        placeholder="e.g., Best Innovation"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="otherPrizeDescription" className="block font-inter font-medium text-primary mb-2">
                      Description
                    </label>
                    <input
                      {...register('otherPrizeDescription')}
                      type="text"
                      id="otherPrizeDescription"
                      className="w-full px-4 py-3 border-2 border-primary focus:border-secondary focus:outline-none font-inter bg-background"
                      placeholder="e.g., Mentorship program"
                    />
                  </div>
                </div>
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

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full bg-accent text-primary py-4 px-6 border-2 border-primary shadow-brutal hover:shadow-brutal-hover transition-all duration-200 font-inter font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="spinner mr-3"></div>
                  CREATING HACKATHON...
                </div>
              ) : (
                'CREATE HACKATHON'
              )}
            </motion.button>
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