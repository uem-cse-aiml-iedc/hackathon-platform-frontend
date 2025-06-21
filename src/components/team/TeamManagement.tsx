import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Users, 
  Plus, 
  Copy, 
  Check, 
  ArrowLeft, 
  Trophy, 
  Calendar, 
  MapPin, 
  Clock, 
  UserPlus, 
  Crown, 
  Mail, 
  Send,
  AlertCircle,
  CheckCircle,
  Loader2,
  Target,
  Shield,
  Zap
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { PublicHackathon, HackathonService } from '../../services/hackathonService';
import { TeamService, TeamMember } from '../../services/teamService';

const createTeamSchema = z.object({
  teamName: z.string().min(3, 'Team name must be at least 3 characters').max(50, 'Team name must not exceed 50 characters'),
});

const joinTeamSchema = z.object({
  teamCode: z.string().length(6, 'Team code must be exactly 6 characters').regex(/^[a-zA-Z0-9]+$/, 'Team code must be alphanumeric'),
});

type CreateTeamFormData = z.infer<typeof createTeamSchema>;
type JoinTeamFormData = z.infer<typeof joinTeamSchema>;

interface TeamManagementProps {
  hackathonId?: string;
}

export default function TeamManagement({ hackathonId: propHackathonId }: TeamManagementProps) {
  const { hackathonId: paramHackathonId } = useParams<{ hackathonId: string }>();
  const hackathonId = propHackathonId || paramHackathonId;
  
  const [hackathon, setHackathon] = useState<PublicHackathon | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [teamData, setTeamData] = useState<{
    teamId: string;
    teamName: string;
    teamMembers: TeamMember[];
    isLeader: boolean;
    submitted?: boolean;
  } | null>(null);
  const [copiedTeamCode, setCopiedTeamCode] = useState(false);
  
  const { currentUser, logout } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const createTeamForm = useForm<CreateTeamFormData>({
    resolver: zodResolver(createTeamSchema),
  });

  const joinTeamForm = useForm<JoinTeamFormData>({
    resolver: zodResolver(joinTeamSchema),
  });

  // Load hackathon data and check team presence
  useEffect(() => {
    if (!hackathonId) {
      showError('Invalid Request', 'Hackathon ID is missing');
      navigate('/hackathons');
      return;
    }

    if (!currentUser) {
      showError('Authentication Required', 'Please log in to manage teams');
      navigate('/auth');
      return;
    }

    loadInitialData();
  }, [hackathonId, currentUser]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      
      // Load hackathon data first
      await loadHackathonData();
      
      // Then check team presence
      await checkTeamPresence();

    } catch (error: any) {
      console.error('Error loading initial data:', error);
      showError('Failed to Load Data', error.message || 'Unable to load hackathon and team data');
      navigate('/hackathons');
    } finally {
      setIsLoading(false);
    }
  };

  const loadHackathonData = async () => {
    // Fetch all hackathons and find the specific one
    const response = await HackathonService.fetchAllHackathons(currentUser?.email);
    const targetHackathon = response.hackathons.find(h => h.hackathonId === hackathonId);
    
    if (!targetHackathon) {
      throw new Error('Hackathon not found');
    }

    setHackathon(targetHackathon);

    // Check if user is registered
    if (!targetHackathon.isRegistered) {
      throw new Error('You must be registered for this hackathon to manage teams');
    }

    return targetHackathon;
  };

  const checkTeamPresence = async () => {
    if (!currentUser) return;

    try {
      console.log('Checking team presence for user:', currentUser.email);
      
      const response = await TeamService.checkTeamPresence({
        email: currentUser.email,
        authToken: currentUser.authToken,
      });

      console.log('Team presence response:', response);

      if (response.team) {
        // User has a team - check if they are the leader
        const isLeader = response.team.leader.email === currentUser.email;
        
        // Combine leader and members for display
        const allMembers = [response.team.leader, ...response.team.members];
        
        console.log('Team found, setting team data:', {
          teamId: response.team.teamId,
          teamName: response.team.teamName,
          isLeader,
          submitted: response.team.submitted,
          memberCount: allMembers.length
        });
        
        setTeamData({
          teamId: response.team.teamId,
          teamName: response.team.teamName,
          teamMembers: allMembers,
          isLeader,
          submitted: response.team.submitted,
        });
      } else {
        console.log('No team found for user');
        setTeamData(null);
      }
    } catch (error: any) {
      console.error('Team presence check error:', error);
      
      // Check for authentication error
      if (error.message === 'Invalid email or auth token.') {
        showError('Session Expired', 'Your session has expired. Please log in again.');
        logout();
        navigate('/auth');
        return;
      }
      
      // For any other error, assume no team exists
      console.log('No team found - user can create or join a team');
      setTeamData(null);
    }
  };

  const handleCreateTeam = async (data: CreateTeamFormData) => {
    if (!currentUser || !hackathon) {
      showError('Authentication Error', 'Please log in to create a team');
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await TeamService.createTeam({
        email: currentUser.email,
        authToken: currentUser.authToken,
        teamName: data.teamName,
        hackathonId: hackathon.hackathonId,
      });

      setTeamData({
        teamId: response.teamId,
        teamName: data.teamName,
        teamMembers: response.availableMembers,
        isLeader: true,
        submitted: false,
      });

      showSuccess(
        'Team Created Successfully! 🎉',
        `Your team "${data.teamName}" has been created. Share the team code with your teammates!`
      );

      createTeamForm.reset();

    } catch (error: any) {
      // Check for authentication error
      if (error.message === 'Invalid email or auth token.') {
        showError('Session Expired', 'Your session has expired. Please log in again.');
        logout();
        navigate('/auth');
        return;
      }
      
      showError(
        'Failed to Create Team',
        error.message || 'An unexpected error occurred. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoinTeam = async (data: JoinTeamFormData) => {
    if (!currentUser || !hackathon) {
      showError('Authentication Error', 'Please log in to join a team');
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await TeamService.joinTeam({
        email: currentUser.email,
        authToken: currentUser.authToken,
        teamCode: data.teamCode,
        hackathonId: hackathon.hackathonId,
      });

      setTeamData({
        teamId: data.teamCode,
        teamName: 'Team', // We don't get team name from join response
        teamMembers: response.teamMembers,
        isLeader: false,
        submitted: false,
      });

      showSuccess(
        'Joined Team Successfully! 🎉',
        'You have successfully joined the team. Good luck with the hackathon!'
      );

      joinTeamForm.reset();

    } catch (error: any) {
      // Check for authentication error
      if (error.message === 'Invalid email or auth token.') {
        showError('Session Expired', 'Your session has expired. Please log in again.');
        logout();
        navigate('/auth');
        return;
      }
      
      showError(
        'Failed to Join Team',
        error.message || 'An unexpected error occurred. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitTeam = async () => {
    if (!currentUser || !teamData || !hackathon) {
      showError('Error', 'Unable to submit team');
      return;
    }

    if (!teamData.isLeader) {
      showError('Permission Denied', 'Only the team leader can submit the team');
      return;
    }

    try {
      setIsSubmitting(true);

      await TeamService.submitTeam({
        email: currentUser.email,
        authToken: currentUser.authToken,
        teamCode: teamData.teamId,
        hackathonId: hackathon.hackathonId,
      });

      setTeamData(prev => prev ? { ...prev, submitted: true } : null);

      showSuccess(
        'Team Submitted Successfully! 🏆',
        'Your team has been submitted for the hackathon. No further changes can be made.'
      );

      // Navigate back to hackathons page
      setTimeout(() => {
        navigate('/hackathons');
      }, 2000);

    } catch (error: any) {
      // Check for authentication error
      if (error.message === 'Invalid email or auth token.') {
        showError('Session Expired', 'Your session has expired. Please log in again.');
        logout();
        navigate('/auth');
        return;
      }
      
      showError(
        'Failed to Submit Team',
        error.message || 'An unexpected error occurred. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyTeamCode = async () => {
    if (teamData?.teamId) {
      try {
        await navigator.clipboard.writeText(teamData.teamId);
        setCopiedTeamCode(true);
        showSuccess('Copied!', 'Team code copied to clipboard');
        setTimeout(() => setCopiedTeamCode(false), 2000);
      } catch (error) {
        showError('Copy Failed', 'Unable to copy team code');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-16 w-16 text-secondary mx-auto mb-4 animate-spin" />
          <h2 className="font-space font-bold text-2xl text-primary mb-2">
            LOADING TEAM MANAGEMENT
          </h2>
          <p className="font-inter text-primary/70">
            Please wait while we fetch the hackathon details and check your team status...
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
            The hackathon you're trying to manage teams for could not be found.
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
                    <Users className="h-8 w-8 text-background" />
                  </motion.div>
                  <h1 className="font-space font-bold text-3xl text-background">
                    TEAM MANAGEMENT
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
            <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-4 gap-4">
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
          </motion.div>

          {/* Team Management Interface */}
          {teamData ? (
            /* Team Dashboard */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-background border-4 border-primary shadow-brutal p-8"
            >
              <div className="text-center mb-8">
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <Trophy className="h-8 w-8 text-secondary" />
                  <h2 className="font-space font-bold text-3xl text-primary">
                    YOUR TEAM
                  </h2>
                  {teamData.submitted && (
                    <div className="bg-accent text-primary px-3 py-1 border-2 border-primary text-sm font-bold">
                      SUBMITTED
                    </div>
                  )}
                </div>
                
                {/* Team Code Display */}
                <div className="bg-accent/20 border-2 border-primary p-6 mb-6">
                  <h3 className="font-inter font-bold text-primary mb-3">TEAM CODE</h3>
                  <div className="flex items-center justify-center space-x-4">
                    <div className="bg-background border-2 border-primary px-6 py-3">
                      <span className="font-space font-bold text-2xl text-primary tracking-wider">
                        {teamData.teamId}
                      </span>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={copyTeamCode}
                      className="bg-secondary text-background p-3 border-2 border-primary shadow-brutal-sm hover:shadow-brutal transition-all duration-200"
                    >
                      {copiedTeamCode ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                    </motion.button>
                  </div>
                  <p className="font-inter text-primary/70 text-sm mt-3">
                    Share this code with your teammates to join your team
                  </p>
                </div>
              </div>

              {/* Team Members */}
              <div className="mb-8">
                <h3 className="font-space font-bold text-xl text-primary mb-4 flex items-center">
                  <Users className="h-6 w-6 mr-2" />
                  TEAM MEMBERS ({teamData.teamMembers.length})
                </h3>
                
                {teamData.teamMembers.length > 0 ? (
                  <div className="grid grid-cols-1 tablet:grid-cols-2 gap-4">
                    {teamData.teamMembers.map((member, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-accent/10 border-2 border-primary p-4 flex items-center space-x-3"
                      >
                        <div className="bg-secondary text-background p-2 border-2 border-primary">
                          {index === 0 && teamData.isLeader ? (
                            <Crown className="h-5 w-5" />
                          ) : (
                            <Users className="h-5 w-5" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-inter font-semibold text-primary flex items-center space-x-2">
                            <span>{member.name}</span>
                            {index === 0 && teamData.isLeader && (
                              <span className="bg-secondary text-background px-2 py-1 text-xs font-bold border border-primary">
                                LEADER
                              </span>
                            )}
                          </div>
                          <div className="font-inter text-primary/70 text-sm flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {member.email}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-primary/5 border-2 border-primary">
                    <UserPlus className="h-12 w-12 text-primary/30 mx-auto mb-4" />
                    <h4 className="font-space font-bold text-lg text-primary mb-2">
                      NO TEAM MEMBERS YET
                    </h4>
                    <p className="font-inter text-primary/70">
                      Share your team code with others to build your team
                    </p>
                  </div>
                )}
              </div>

              {/* Team Actions */}
              {teamData.isLeader && !teamData.submitted && (
                <div className="border-t-2 border-primary pt-6">
                  <h3 className="font-space font-bold text-xl text-primary mb-4 flex items-center">
                    <Shield className="h-6 w-6 mr-2" />
                    LEADER ACTIONS
                  </h3>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubmitTeam}
                    disabled={isSubmitting || teamData.teamMembers.length < 2}
                    className="w-full bg-accent text-primary py-4 px-6 border-2 border-primary shadow-brutal hover:shadow-brutal-hover transition-all duration-200 font-inter font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center relative overflow-hidden group"
                  >
                    <motion.div
                      className="absolute inset-0 bg-secondary opacity-0 group-hover:opacity-30 transition-opacity duration-300"
                    />
                    {isSubmitting ? (
                      <div className="flex items-center relative z-10">
                        <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                        SUBMITTING TEAM...
                      </div>
                    ) : (
                      <div className="flex items-center relative z-10">
                        <Send className="mr-3 h-6 w-6" />
                        SUBMIT TEAM FOR HACKATHON
                      </div>
                    )}
                  </motion.button>
                  
                  {teamData.teamMembers.length < 2 && (
                    <p className="font-inter text-secondary text-sm mt-2 text-center">
                      ⚠️ Minimum 2 team members required to submit
                    </p>
                  )}
                </div>
              )}

              {teamData.submitted && (
                <div className="border-t-2 border-primary pt-6">
                  <div className="bg-accent/20 border-2 border-accent p-6 text-center">
                    <CheckCircle className="h-12 w-12 text-accent mx-auto mb-4" />
                    <h3 className="font-space font-bold text-xl text-primary mb-2">
                      TEAM SUBMITTED SUCCESSFULLY!
                    </h3>
                    <p className="font-inter text-primary/70">
                      Your team has been submitted for the hackathon. No further changes can be made.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            /* Team Creation/Join Interface */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-background border-4 border-primary shadow-brutal"
            >
              {/* Tab Headers */}
              <div className="border-b-2 border-primary">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab('create')}
                    className={`flex-1 px-6 py-4 font-inter font-semibold border-r-2 border-primary transition-colors duration-200 ${
                      activeTab === 'create'
                        ? 'bg-accent text-primary'
                        : 'bg-background text-primary/70 hover:bg-accent/20'
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <Plus className="h-5 w-5" />
                      <span>CREATE TEAM</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('join')}
                    className={`flex-1 px-6 py-4 font-inter font-semibold transition-colors duration-200 ${
                      activeTab === 'join'
                        ? 'bg-accent text-primary'
                        : 'bg-background text-primary/70 hover:bg-accent/20'
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <UserPlus className="h-5 w-5" />
                      <span>JOIN TEAM</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-8">
                {activeTab === 'create' ? (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <div className="text-center mb-6">
                      <h3 className="font-space font-bold text-2xl text-primary mb-2">
                        CREATE YOUR TEAM
                      </h3>
                      <p className="font-inter text-primary/70">
                        Start your own team and invite others to join your hackathon journey
                      </p>
                    </div>

                    <form onSubmit={createTeamForm.handleSubmit(handleCreateTeam)} className="space-y-6">
                      <div>
                        <label htmlFor="teamName" className="block font-inter font-semibold text-primary mb-2">
                          TEAM NAME *
                        </label>
                        <div className="relative">
                          <Trophy className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary/50" />
                          <input
                            {...createTeamForm.register('teamName')}
                            type="text"
                            id="teamName"
                            className={`w-full pl-10 pr-4 py-3 border-2 focus:outline-none font-inter bg-background ${
                              createTeamForm.formState.errors.teamName 
                                ? 'border-secondary focus:border-secondary' 
                                : 'border-primary focus:border-secondary'
                            }`}
                            placeholder="Enter your team name"
                            disabled={isSubmitting}
                          />
                          {createTeamForm.formState.errors.teamName && (
                            <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary" />
                          )}
                        </div>
                        {createTeamForm.formState.errors.teamName && (
                          <motion.p 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-1 text-sm text-secondary font-inter flex items-center space-x-1"
                          >
                            <AlertCircle className="h-4 w-4" />
                            <span>{createTeamForm.formState.errors.teamName.message}</span>
                          </motion.p>
                        )}
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-secondary text-background py-4 px-6 border-2 border-primary shadow-brutal hover:shadow-brutal-hover transition-all duration-200 font-inter font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        {isSubmitting ? (
                          <div className="flex items-center">
                            <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                            CREATING TEAM...
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <Plus className="mr-3 h-6 w-6" />
                            CREATE TEAM
                          </div>
                        )}
                      </motion.button>
                    </form>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <div className="text-center mb-6">
                      <h3 className="font-space font-bold text-2xl text-primary mb-2">
                        JOIN A TEAM
                      </h3>
                      <p className="font-inter text-primary/70">
                        Enter the team code shared by your team leader to join their team
                      </p>
                    </div>

                    <form onSubmit={joinTeamForm.handleSubmit(handleJoinTeam)} className="space-y-6">
                      <div>
                        <label htmlFor="teamCode" className="block font-inter font-semibold text-primary mb-2">
                          TEAM CODE *
                        </label>
                        <div className="relative">
                          <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary/50" />
                          <input
                            {...joinTeamForm.register('teamCode')}
                            type="text"
                            id="teamCode"
                            className={`w-full pl-10 pr-4 py-3 border-2 focus:outline-none font-inter bg-background text-center text-2xl font-bold tracking-wider uppercase ${
                              joinTeamForm.formState.errors.teamCode 
                                ? 'border-secondary focus:border-secondary' 
                                : 'border-primary focus:border-secondary'
                            }`}
                            placeholder="ABC123"
                            maxLength={6}
                            disabled={isSubmitting}
                            onChange={(e) => {
                              e.target.value = e.target.value.toUpperCase();
                              joinTeamForm.setValue('teamCode', e.target.value);
                            }}
                          />
                          {joinTeamForm.formState.errors.teamCode && (
                            <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary" />
                          )}
                        </div>
                        {joinTeamForm.formState.errors.teamCode && (
                          <motion.p 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-1 text-sm text-secondary font-inter flex items-center space-x-1"
                          >
                            <AlertCircle className="h-4 w-4" />
                            <span>{joinTeamForm.formState.errors.teamCode.message}</span>
                          </motion.p>
                        )}
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-accent text-primary py-4 px-6 border-2 border-primary shadow-brutal hover:shadow-brutal-hover transition-all duration-200 font-inter font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        {isSubmitting ? (
                          <div className="flex items-center">
                            <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                            JOINING TEAM...
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <UserPlus className="mr-3 h-6 w-6" />
                            JOIN TEAM
                          </div>
                        )}
                      </motion.button>
                    </form>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}