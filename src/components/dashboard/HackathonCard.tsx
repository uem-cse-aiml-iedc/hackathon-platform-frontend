import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, Trophy, Clock, MapPin, DollarSign, Eye, CheckCircle, UserPlus, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PublicHackathon, HackathonService } from '../../services/hackathonService';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

interface HackathonCardProps {
  hackathon: PublicHackathon;
  onViewDetails: (hackathon: PublicHackathon) => void;
}

export default function HackathonCard({ hackathon, onViewDetails }: HackathonCardProps) {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { showError } = useToast();

  const hackathonStatus = HackathonService.getHackathonStatus(
    hackathon.startDate, 
    hackathon.endDate, 
    hackathon.registrationEndDate
  );
  
  const registrationStatus = HackathonService.getRegistrationStatus(
    hackathon.registrationStartDate,
    hackathon.registrationEndDate
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-accent text-primary';
      case 'ongoing': return 'bg-secondary text-background';
      case 'completed': return 'bg-primary text-background';
      default: return 'bg-primary text-background';
    }
  };

  const getRegistrationStatusColor = (status: string) => {
    switch (status) {
      case 'not-started': return 'bg-primary/20 text-primary border-primary';
      case 'open': return 'bg-accent/20 text-primary border-accent';
      case 'closed': return 'bg-secondary/20 text-secondary border-secondary';
      default: return 'bg-primary/20 text-primary border-primary';
    }
  };

  const getRegistrationStatusText = (status: string) => {
    switch (status) {
      case 'not-started': return 'REGISTRATION NOT STARTED';
      case 'open': return 'REGISTRATION OPEN';
      case 'closed': return 'REGISTRATION CLOSED';
      default: return 'REGISTRATION STATUS';
    }
  };

  const handleActionButtonClick = () => {
    console.log('Action button clicked for hackathon:', hackathon.hackathonId);
    console.log('Is registered:', hackathon.isRegistered);
    console.log('Registration status:', registrationStatus);
    
    if (!currentUser) {
      showError('Authentication Required', 'Please log in to register for this hackathon');
      return;
    }

    if (hackathon.isRegistered) {
      // Navigate to team management
      console.log('Navigating to team management for hackathon:', hackathon.hackathonId);
      navigate(`/team/${hackathon.hackathonId}`);
    } else {
      // Navigate to registration
      if (registrationStatus !== 'open') {
        showError('Registration Not Available', 'Registration is not currently open for this hackathon');
        return;
      }

      console.log('Navigating to registration page for hackathon:', hackathon.hackathonId);
      navigate(`/register/${hackathon.hackathonId}`);
    }
  };

  const getActionButtonText = () => {
    if (hackathon.isRegistered) {
      return 'TEAM MANAGEMENT';
    }
    
    if (registrationStatus === 'open') {
      return 'REGISTER';
    } else if (registrationStatus === 'not-started') {
      return 'REGISTRATION OPENS SOON';
    } else {
      return 'REGISTRATION CLOSED';
    }
  };

  const getActionButtonStyle = () => {
    if (hackathon.isRegistered) {
      return 'bg-accent text-primary hover:shadow-brutal-hover';
    }
    
    if (registrationStatus === 'open') {
      return 'bg-secondary text-background hover:shadow-brutal-hover';
    } else if (registrationStatus === 'not-started') {
      return 'bg-primary/20 text-primary/70 cursor-not-allowed opacity-75';
    } else {
      return 'bg-primary/20 text-primary/70 border-primary/50 cursor-not-allowed';
    }
  };

  const getActionButtonIcon = () => {
    if (hackathon.isRegistered) {
      return <Settings className="h-4 w-4" />;
    }
    
    if (registrationStatus === 'open') {
      return <UserPlus className="h-4 w-4" />;
    } else {
      return <Clock className="h-4 w-4" />;
    }
  };

  const totalCashPrize = HackathonService.calculateTotalCashPrize(hackathon);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, boxShadow: '12px 12px 0px #000000' }}
      className="bg-background border-4 border-primary shadow-brutal p-6 relative overflow-hidden group h-full flex flex-col"
    >
      {/* Status Badges */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col space-y-2">
          <span className={`px-3 py-1 text-xs font-inter font-bold border-2 border-primary ${getStatusColor(hackathonStatus)} inline-block w-fit`}>
            {hackathonStatus.toUpperCase()}
          </span>
          <span className={`px-3 py-1 text-xs font-inter font-bold border-2 ${getRegistrationStatusColor(registrationStatus)} inline-block w-fit`}>
            {getRegistrationStatusText(registrationStatus)}
          </span>
          {hackathon.isRegistered && (
            <span className="px-3 py-1 text-xs font-inter font-bold border-2 border-accent bg-accent/20 text-primary inline-block w-fit flex items-center space-x-1">
              <CheckCircle className="h-3 w-3" />
              <span>REGISTERED</span>
            </span>
          )}
        </div>
        
        {/* Participant Count */}
        <div className="bg-accent/10 border-2 border-primary p-2 text-center min-w-[80px]">
          <div className="font-space font-bold text-lg text-primary">
            {hackathon.participantCount}
          </div>
          <div className="font-inter text-xs text-primary/70">
            REGISTERED
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="mb-4">
        <h3 className="font-space font-bold text-xl text-primary mb-2 line-clamp-2 min-h-[3.5rem]">
          {hackathon.hackathonName}
        </h3>
        <p className="font-inter text-primary/70 text-sm line-clamp-2 mb-3 min-h-[2.5rem]">
          {hackathon.tagline}
        </p>
      </div>

      {/* Key Details Grid - Flex grow to fill space */}
      <div className="grid grid-cols-1 gap-3 mb-4 flex-grow">
        {/* Registration Period */}
        <div className="bg-accent/5 border border-primary p-3">
          <h4 className="font-inter font-bold text-primary text-xs mb-2 flex items-center">
            <Users className="h-3 w-3 mr-1" />
            REGISTRATION PERIOD
          </h4>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-inter text-primary/70">Start:</span>
              <span className="font-inter font-semibold text-primary">
                {HackathonService.formatDisplayDate(hackathon.registrationStartDate)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-inter text-primary/70">End:</span>
              <span className="font-inter font-semibold text-primary">
                {HackathonService.formatDisplayDate(hackathon.registrationEndDate)}
              </span>
            </div>
          </div>
        </div>

        {/* Hackathon Period */}
        <div className="bg-secondary/5 border border-primary p-3">
          <h4 className="font-inter font-bold text-primary text-xs mb-2 flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            HACKATHON PERIOD
          </h4>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-inter text-primary/70">Start:</span>
              <span className="font-inter font-semibold text-primary">
                {HackathonService.formatDisplayDate(hackathon.startDate)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-inter text-primary/70">End:</span>
              <span className="font-inter font-semibold text-primary">
                {HackathonService.formatDisplayDate(hackathon.endDate)}
              </span>
            </div>
          </div>
        </div>

        {/* Venue - Always show for consistent layout */}
        <div className="bg-primary/5 border border-primary p-3">
          <h4 className="font-inter font-bold text-primary text-xs mb-2 flex items-center">
            <MapPin className="h-3 w-3 mr-1" />
            VENUE
          </h4>
          <div className="flex items-center justify-center min-h-[1.5rem]">
            <span className="font-inter text-sm text-primary text-center line-clamp-2">
              {hackathon.venue || 'Not Specified'}
            </span>
          </div>
        </div>

        {/* Team Size Info - Always show for consistent layout */}
        <div className="bg-accent/5 border border-primary p-3">
          <h4 className="font-inter font-bold text-primary text-xs mb-2 flex items-center">
            <Users className="h-3 w-3 mr-1" />
            TEAM SIZE
          </h4>
          <div className="flex items-center justify-center min-h-[1.5rem]">
            {(hackathon.minTeamSize || hackathon.maxTeamSize) ? (
              <span className="font-inter text-sm text-primary text-center">
                {hackathon.minTeamSize || 1} - {hackathon.maxTeamSize || 'Unlimited'} members
              </span>
            ) : (
              <span className="font-inter text-sm text-primary/50 text-center">
                Not Specified
              </span>
            )}
          </div>
        </div>

        {/* Total Cash Prize - Always show for consistent layout */}
        <div className="bg-primary/5 border border-primary p-3">
          <h4 className="font-inter font-bold text-primary text-xs mb-2 flex items-center">
            <Trophy className="h-3 w-3 mr-1" />
            TOTAL CASH PRIZE
          </h4>
          <div className="flex items-center justify-center min-h-[2rem]">
            {totalCashPrize > 0 ? (
              <>
                <DollarSign className="h-5 w-5 text-secondary mr-1" />
                <span className="font-space font-bold text-2xl text-secondary">
                  {totalCashPrize.toLocaleString()}
                </span>
              </>
            ) : (
              <span className="font-space font-bold text-2xl text-primary/50">
                NADA
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons - Always at bottom */}
      <div className="flex space-x-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onViewDetails(hackathon)}
          className="flex-1 bg-accent text-primary py-3 px-4 border-2 border-primary shadow-brutal-sm hover:shadow-brutal transition-all duration-200 font-inter font-bold flex items-center justify-center"
        >
          <Eye className="h-4 w-4 mr-2" />
          VIEW DETAILS
        </motion.button>
        
        <motion.button
          whileHover={
            (hackathon.isRegistered || registrationStatus === 'open') ? { scale: 1.05 } : {}
          }
          whileTap={
            (hackathon.isRegistered || registrationStatus === 'open') ? { scale: 0.95 } : {}
          }
          onClick={handleActionButtonClick}
          className={`flex-1 py-3 px-4 border-2 border-primary shadow-brutal-sm transition-all duration-200 font-inter font-bold ${getActionButtonStyle()} ${
            (hackathon.isRegistered || registrationStatus === 'open') ? 'hover:shadow-brutal' : ''
          }`}
          disabled={!hackathon.isRegistered && registrationStatus !== 'open'}
        >
          <div className="flex items-center justify-center space-x-1">
            {getActionButtonIcon()}
            <span>{getActionButtonText()}</span>
          </div>
        </motion.button>
      </div>

      {/* Hover Effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-accent/10 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
      />
    </motion.div>
  );
}