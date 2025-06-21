import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  User, 
  Mail, 
  Phone, 
  Github, 
  Linkedin, 
  FileText, 
  Utensils, 
  Code, 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle,
  Trophy,
  Calendar,
  MapPin,
  Users,
  Sparkles,
  Save,
  Plus,
  X,
  Clock,
  DollarSign,
  Loader2
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { PublicHackathon, HackathonService } from '../../services/hackathonService';
import { RegistrationService } from '../../services/registrationService';

const registrationSchema = z.object({
  foodPreference: z.string().min(1, 'Food preference is required'),
  githubLink: z.string().url('Please enter a valid GitHub URL').min(1, 'GitHub link is required'),
  linkedinLink: z.string().url('Please enter a valid LinkedIn URL').min(1, 'LinkedIn link is required'),
  bio: z.string().min(20, 'Bio must be at least 20 characters').max(500, 'Bio must not exceed 500 characters'),
  phoneNo: z.string().min(10, 'Phone number must be at least 10 digits').max(15, 'Phone number must not exceed 15 digits'),
  skills: z.array(z.string()).min(1, 'At least one skill is required'),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

interface HackathonRegistrationProps {
  hackathonId?: string;
}

export default function HackathonRegistration({ hackathonId: propHackathonId }: HackathonRegistrationProps) {
  const { hackathonId: paramHackathonId } = useParams<{ hackathonId: string }>();
  const hackathonId = propHackathonId || paramHackathonId;
  
  const [hackathon, setHackathon] = useState<PublicHackathon | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const { currentUser } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      skills: [],
    },
  });

  // Load hackathon data
  useEffect(() => {
    console.log('HackathonRegistration component mounted with hackathonId:', hackathonId);
    
    if (!hackathonId) {
      console.error('No hackathonId provided');
      showError('Invalid Request', 'Hackathon ID is missing');
      navigate('/hackathons');
      return;
    }

    if (!currentUser) {
      console.error('No current user');
      showError('Authentication Required', 'Please log in to register for hackathons');
      navigate('/auth');
      return;
    }

    loadHackathonData();
  }, [hackathonId, currentUser]);

  // Update form when skills change
  useEffect(() => {
    setValue('skills', skills);
  }, [skills, setValue]);

  const loadHackathonData = async () => {
    try {
      setIsLoading(true);
      console.log('Loading hackathon data for ID:', hackathonId);
      
      // Fetch all hackathons and find the specific one
      const response = await HackathonService.fetchAllHackathons(currentUser?.email);
      console.log('Fetched hackathons:', response.hackathons);
      
      const targetHackathon = response.hackathons.find(h => h.hackathonId === hackathonId);
      console.log('Target hackathon found:', targetHackathon);
      
      if (!targetHackathon) {
        throw new Error('Hackathon not found');
      }

      setHackathon(targetHackathon);

      // Check if user is already registered
      if (targetHackathon.isRegistered) {
        showError('Already Registered', 'You are already registered for this hackathon');
        navigate('/hackathons');
        return;
      }

      // Check if registration is open
      const registrationStatus = HackathonService.getRegistrationStatus(
        targetHackathon.registrationStartDate,
        targetHackathon.registrationEndDate
      );

      console.log('Registration status:', registrationStatus);

      if (registrationStatus !== 'open') {
        showError('Registration Not Available', 'Registration is not currently open for this hackathon');
        navigate('/hackathons');
        return;
      }

    } catch (error: any) {
      console.error('Error loading hackathon data:', error);
      showError('Failed to Load Hackathon', error.message || 'Unable to fetch hackathon details');
      navigate('/hackathons');
    } finally {
      setIsLoading(false);
    }
  };

  const addSkill = () => {
    const trimmedSkill = skillInput.trim();
    if (trimmedSkill && !skills.includes(trimmedSkill)) {
      setSkills(prev => [...prev, trimmedSkill]);
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(prev => prev.filter(skill => skill !== skillToRemove));
  };

  const handleSkillKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  const onSubmit = async (data: RegistrationFormData) => {
    if (!currentUser || !hackathon) {
      showError('Authentication Error', 'Please log in to register');
      return;
    }

    try {
      setIsSubmitting(true);
      console.log('Submitting registration with data:', data);

      const registrationData = {
        email: currentUser.email,
        authToken: currentUser.authToken,
        hackathonId: hackathon.hackathonId,
        foodPreference: data.foodPreference,
        githubLink: data.githubLink,
        linkedinLink: data.linkedinLink,
        bio: data.bio,
        phoneNo: data.phoneNo,
        skills: data.skills,
      };

      console.log('Final registration data:', registrationData);

      await RegistrationService.registerForHackathon(registrationData);

      showSuccess(
        'Registration Successful! 🎉',
        `You've been successfully registered for ${hackathon.hackathonName}. Check your email for confirmation.`
      );

      // Navigate back to hackathons page after a short delay
      setTimeout(() => {
        navigate('/hackathons');
      }, 2000);

    } catch (error: any) {
      console.error('Registration submission error:', error);
      showError(
        'Registration Failed',
        error.message || 'An unexpected error occurred. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-16 w-16 text-secondary mx-auto mb-4 animate-spin" />
          <h2 className="font-space font-bold text-2xl text-primary mb-2">
            LOADING HACKATHON
          </h2>
          <p className="font-inter text-primary/70">
            Please wait while we fetch the hackathon details...
          </p>
        </div>
      </div>
    );
  }

  if (!hackathon) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-secondary mx-auto mb-4" />
          <h2 className="font-space font-bold text-2xl text-primary mb-2">
            HACKATHON NOT FOUND
          </h2>
          <p className="font-inter text-primary/70 mb-6">
            The hackathon you're trying to register for could not be found.
          </p>
          <Link
            to="/hackathons"
            className="bg-secondary text-background px-6 py-3 border-2 border-primary shadow-brutal-sm hover:shadow-brutal transition-all duration-200 font-inter font-semibold inline-block"
          >
            BROWSE HACKATHONS
          </Link>
        </div>
      </div>
    );
  }

  const totalCashPrize = HackathonService.calculateTotalCashPrize(hackathon);
  const { cashPrizes, otherPrizes } = HackathonService.formatPrizeDisplay(hackathon);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-brutal py-12">
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
                to="/hackathons"
                className="inline-flex items-center bg-background text-primary px-6 py-3 border-2 border-primary shadow-brutal hover:shadow-brutal-hover transition-all duration-200 font-inter font-semibold relative overflow-hidden group"
              >
                <motion.div
                  className="absolute inset-0 bg-accent opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                />
                <ArrowLeft className="mr-3 h-5 w-5 relative z-10" />
                <span className="relative z-10">BACK TO HACKATHONS</span>
              </Link>
            </motion.div>
          </motion.div>

          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-r from-secondary via-accent to-secondary border-4 border-primary shadow-brutal p-6 mb-6 relative overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                animate={{ x: [-100, 400] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
              
              <div className="relative z-10">
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="h-8 w-8 text-background" />
                  </motion.div>
                  <h1 className="font-space font-bold text-3xl text-background">
                    REGISTER FOR HACKATHON
                  </h1>
                </div>
                <h2 className="font-space font-bold text-xl text-background mb-2">
                  {hackathon.hackathonName}
                </h2>
                <p className="font-inter text-background/90">
                  {hackathon.tagline}
                </p>
              </div>
            </motion.div>
          </div>

          {/* Hackathon Quick Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-accent/10 border-2 border-primary shadow-brutal p-6 mb-8"
          >
            <h3 className="font-space font-bold text-xl text-primary mb-4">
              HACKATHON OVERVIEW
            </h3>
            <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-4 gap-4 mb-6">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-secondary" />
                <div>
                  <div className="font-inter font-semibold text-primary text-sm">Start Date</div>
                  <div className="font-inter text-primary/70 text-xs">
                    {HackathonService.formatDisplayDate(hackathon.startDate)}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-secondary" />
                <div>
                  <div className="font-inter font-semibold text-primary text-sm">End Date</div>
                  <div className="font-inter text-primary/70 text-xs">
                    {HackathonService.formatDisplayDate(hackathon.endDate)}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-secondary" />
                <div>
                  <div className="font-inter font-semibold text-primary text-sm">Venue</div>
                  <div className="font-inter text-primary/70 text-xs">
                    {hackathon.venue}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-secondary" />
                <div>
                  <div className="font-inter font-semibold text-primary text-sm">Participants</div>
                  <div className="font-inter text-primary/70 text-xs">
                    {hackathon.participantCount} registered
                  </div>
                </div>
              </div>
            </div>

            {/* Prizes Section */}
            {(cashPrizes.length > 0 || otherPrizes.length > 0) && (
              <div className="border-t-2 border-primary pt-4">
                <h4 className="font-inter font-bold text-primary mb-3 flex items-center">
                  <Trophy className="h-5 w-5 mr-2 text-secondary" />
                  PRIZES & REWARDS
                </h4>
                <div className="grid grid-cols-1 tablet:grid-cols-2 gap-4">
                  {/* Cash Prizes */}
                  {cashPrizes.length > 0 && (
                    <div className="bg-background border-2 border-primary p-3">
                      <h5 className="font-inter font-semibold text-primary mb-2 text-sm">CASH PRIZES</h5>
                      <div className="space-y-2">
                        {cashPrizes.map((prize, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="font-inter text-primary text-sm">{prize.name}</span>
                            <span className="font-space font-bold text-secondary flex items-center">
                              <DollarSign className="h-4 w-4 mr-1" />
                              {prize.amount.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Other Prizes */}
                  {otherPrizes.length > 0 && (
                    <div className="bg-background border-2 border-primary p-3">
                      <h5 className="font-inter font-semibold text-primary mb-2 text-sm">OTHER PRIZES</h5>
                      <div className="space-y-2">
                        {otherPrizes.map((prize, index) => (
                          <div key={index}>
                            <div className="font-inter font-semibold text-primary text-sm">{prize.name}</div>
                            <div className="font-inter text-primary/70 text-xs">{prize.description}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Total Cash Prize Display */}
                  {totalCashPrize > 0 && (
                    <div className="tablet:col-span-2 bg-secondary/10 border-2 border-secondary p-4 text-center">
                      <div className="font-space font-bold text-2xl text-secondary flex items-center justify-center">
                        <DollarSign className="h-6 w-6 mr-2" />
                        {totalCashPrize.toLocaleString()}
                      </div>
                      <div className="font-inter text-primary/70 text-sm">TOTAL CASH PRIZE POOL</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>

          {/* Registration Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-background border-4 border-primary shadow-brutal p-8"
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Pre-populated User Info */}
              <div>
                <h3 className="font-space font-bold text-xl text-primary mb-4">
                  YOUR INFORMATION
                </h3>
                <div className="grid grid-cols-1 tablet:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-inter font-semibold text-primary mb-2">
                      FULL NAME
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary/50" />
                      <input
                        type="text"
                        value={currentUser?.name || ''}
                        className="w-full pl-10 pr-4 py-3 border-2 border-primary bg-accent/10 font-inter text-primary"
                        readOnly
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-inter font-semibold text-primary mb-2">
                      EMAIL ADDRESS
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary/50" />
                      <input
                        type="email"
                        value={currentUser?.email || ''}
                        className="w-full pl-10 pr-4 py-3 border-2 border-primary bg-accent/10 font-inter text-primary"
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Required Information */}
              <div className="border-t-2 border-primary pt-6">
                <h3 className="font-space font-bold text-xl text-primary mb-4">
                  ADDITIONAL INFORMATION
                </h3>
                
                <div className="grid grid-cols-1 tablet:grid-cols-2 gap-6 mb-6">
                  {/* Phone Number */}
                  <div>
                    <label htmlFor="phoneNo" className="block font-inter font-semibold text-primary mb-2">
                      PHONE NUMBER *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary/50" />
                      <input
                        {...register('phoneNo')}
                        type="tel"
                        id="phoneNo"
                        className={`w-full pl-10 pr-4 py-3 border-2 focus:outline-none font-inter bg-background ${
                          errors.phoneNo 
                            ? 'border-secondary focus:border-secondary' 
                            : 'border-primary focus:border-secondary'
                        }`}
                        placeholder="+91 9876543210"
                      />
                      {errors.phoneNo && (
                        <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary" />
                      )}
                    </div>
                    {errors.phoneNo && (
                      <motion.p 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-1 text-sm text-secondary font-inter flex items-center space-x-1"
                      >
                        <AlertCircle className="h-4 w-4" />
                        <span>{errors.phoneNo.message}</span>
                      </motion.p>
                    )}
                  </div>

                  {/* Food Preference */}
                  <div>
                    <label htmlFor="foodPreference" className="block font-inter font-semibold text-primary mb-2">
                      FOOD PREFERENCE *
                    </label>
                    <div className="relative">
                      <Utensils className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary/50" />
                      <select
                        {...register('foodPreference')}
                        id="foodPreference"
                        className={`w-full pl-10 pr-4 py-3 border-2 focus:outline-none font-inter bg-background appearance-none ${
                          errors.foodPreference 
                            ? 'border-secondary focus:border-secondary' 
                            : 'border-primary focus:border-secondary'
                        }`}
                      >
                        <option value="">Select food preference</option>
                        <option value="veg">Vegetarian</option>
                        <option value="nonveg">Non-Vegetarian</option>
                        <option value="vegan">Vegan</option>
                        <option value="jain">Jain</option>
                        <option value="other">Other</option>
                      </select>
                      {errors.foodPreference && (
                        <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary" />
                      )}
                    </div>
                    {errors.foodPreference && (
                      <motion.p 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-1 text-sm text-secondary font-inter flex items-center space-x-1"
                      >
                        <AlertCircle className="h-4 w-4" />
                        <span>{errors.foodPreference.message}</span>
                      </motion.p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 tablet:grid-cols-2 gap-6 mb-6">
                  {/* GitHub Link */}
                  <div>
                    <label htmlFor="githubLink" className="block font-inter font-semibold text-primary mb-2">
                      GITHUB PROFILE *
                    </label>
                    <div className="relative">
                      <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary/50" />
                      <input
                        {...register('githubLink')}
                        type="url"
                        id="githubLink"
                        className={`w-full pl-10 pr-4 py-3 border-2 focus:outline-none font-inter bg-background ${
                          errors.githubLink 
                            ? 'border-secondary focus:border-secondary' 
                            : 'border-primary focus:border-secondary'
                        }`}
                        placeholder="https://github.com/yourusername"
                      />
                      {errors.githubLink && (
                        <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary" />
                      )}
                    </div>
                    {errors.githubLink && (
                      <motion.p 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-1 text-sm text-secondary font-inter flex items-center space-x-1"
                      >
                        <AlertCircle className="h-4 w-4" />
                        <span>{errors.githubLink.message}</span>
                      </motion.p>
                    )}
                  </div>

                  {/* LinkedIn Link */}
                  <div>
                    <label htmlFor="linkedinLink" className="block font-inter font-semibold text-primary mb-2">
                      LINKEDIN PROFILE *
                    </label>
                    <div className="relative">
                      <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary/50" />
                      <input
                        {...register('linkedinLink')}
                        type="url"
                        id="linkedinLink"
                        className={`w-full pl-10 pr-4 py-3 border-2 focus:outline-none font-inter bg-background ${
                          errors.linkedinLink 
                            ? 'border-secondary focus:border-secondary' 
                            : 'border-primary focus:border-secondary'
                        }`}
                        placeholder="https://linkedin.com/in/yourusername"
                      />
                      {errors.linkedinLink && (
                        <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary" />
                      )}
                    </div>
                    {errors.linkedinLink && (
                      <motion.p 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-1 text-sm text-secondary font-inter flex items-center space-x-1"
                      >
                        <AlertCircle className="h-4 w-4" />
                        <span>{errors.linkedinLink.message}</span>
                      </motion.p>
                    )}
                  </div>
                </div>

                {/* Skills */}
                <div className="mb-6">
                  <label className="block font-inter font-semibold text-primary mb-2">
                    SKILLS & TECHNOLOGIES *
                  </label>
                  <div className="space-y-4">
                    <div className="flex space-x-2">
                      <div className="relative flex-1">
                        <Code className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary/50" />
                        <input
                          type="text"
                          value={skillInput}
                          onChange={(e) => setSkillInput(e.target.value)}
                          onKeyPress={handleSkillKeyPress}
                          className="w-full pl-10 pr-4 py-3 border-2 border-primary focus:border-secondary focus:outline-none font-inter bg-background"
                          placeholder="Enter a skill (e.g., React, Python, UI/UX)"
                        />
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={addSkill}
                        className="bg-accent text-primary px-4 py-3 border-2 border-primary shadow-brutal-sm hover:shadow-brutal transition-all duration-200 font-inter font-semibold"
                      >
                        <Plus className="h-5 w-5" />
                      </motion.button>
                    </div>
                    
                    {skills.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {skills.map((skill, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-secondary text-background px-3 py-1 border-2 border-primary shadow-brutal-sm flex items-center space-x-2"
                          >
                            <span className="font-inter font-semibold text-sm">{skill}</span>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              type="button"
                              onClick={() => removeSkill(skill)}
                              className="text-background hover:text-accent transition-colors duration-200"
                            >
                              <X className="h-3 w-3" />
                            </motion.button>
                          </motion.div>
                        ))}
                      </div>
                    )}
                    
                    {errors.skills && (
                      <motion.p 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-secondary font-inter flex items-center space-x-1"
                      >
                        <AlertCircle className="h-4 w-4" />
                        <span>{errors.skills.message}</span>
                      </motion.p>
                    )}
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label htmlFor="bio" className="block font-inter font-semibold text-primary mb-2">
                    BIO / ABOUT YOURSELF *
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 h-5 w-5 text-primary/50" />
                    <textarea
                      {...register('bio')}
                      id="bio"
                      rows={4}
                      className={`w-full pl-10 pr-4 py-3 border-2 focus:outline-none font-inter bg-background resize-none ${
                        errors.bio 
                          ? 'border-secondary focus:border-secondary' 
                          : 'border-primary focus:border-secondary'
                      }`}
                      placeholder="Tell us about yourself, your experience, what you hope to achieve in this hackathon..."
                    />
                    {errors.bio && (
                      <AlertCircle className="absolute right-3 top-3 h-5 w-5 text-secondary" />
                    )}
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    {errors.bio && (
                      <motion.p 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-secondary font-inter flex items-center space-x-1"
                      >
                        <AlertCircle className="h-4 w-4" />
                        <span>{errors.bio.message}</span>
                      </motion.p>
                    )}
                    <span className="text-xs text-primary/50 font-inter ml-auto">
                      {watch('bio')?.length || 0}/500 characters
                    </span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="border-t-2 border-primary pt-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-secondary text-background py-4 px-6 border-2 border-primary shadow-brutal hover:shadow-brutal-hover transition-all duration-200 font-inter font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center relative overflow-hidden group"
                >
                  <motion.div
                    className="absolute inset-0 bg-accent opacity-0 group-hover:opacity-30 transition-opacity duration-300"
                  />
                  {isSubmitting ? (
                    <div className="flex items-center relative z-10">
                      <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                      REGISTERING...
                    </div>
                  ) : (
                    <div className="flex items-center relative z-10">
                      <Trophy className="mr-3 h-6 w-6" />
                      REGISTER FOR HACKATHON
                    </div>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}