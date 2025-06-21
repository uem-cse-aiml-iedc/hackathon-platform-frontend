import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Trophy, 
  DollarSign, 
  Award, 
  Info, 
  UserPlus,
  CheckCircle,
  AlertCircle,
  Timer,
  Target,
  Sparkles,
  Zap
} from 'lucide-react';
import { PublicHackathon, HackathonService } from '../../services/hackathonService';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';

interface HackathonDetailsModalProps {
  hackathon: PublicHackathon | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function HackathonDetailsModal({ hackathon, isOpen, onClose }: HackathonDetailsModalProps) {
  const { currentUser } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  if (!hackathon) return null;

  const hackathonStatus = HackathonService.getHackathonStatus(
    hackathon.startDate, 
    hackathon.endDate, 
    hackathon.registrationEndDate
  );
  
  const registrationStatus = HackathonService.getRegistrationStatus(
    hackathon.registrationStartDate,
    hackathon.registrationEndDate
  );

  const { cashPrizes, otherPrizes } = HackathonService.formatPrizeDisplay(hackathon);
  const totalCashPrize = HackathonService.calculateTotalCashPrize(hackathon);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-accent text-primary border-accent';
      case 'ongoing': return 'bg-secondary text-background border-secondary';
      case 'completed': return 'bg-primary text-background border-primary';
      default: return 'bg-primary text-background border-primary';
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

  const handleRegister = () => {
    if (!currentUser) {
      showError('Authentication Required', 'Please log in to register for this hackathon');
      return;
    }

    if (registrationStatus !== 'open') {
      showError('Registration Not Available', 'Registration is not currently open for this hackathon');
      return;
    }

    if (hackathon.isRegistered) {
      showError('Already Registered', 'You are already registered for this hackathon');
      return;
    }

    console.log('Navigating to registration page for hackathon:', hackathon.hackathonId);
    
    // Close modal first
    onClose();
    
    // Navigate to registration page
    navigate(`/register/${hackathon.hackathonId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'long',
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })
    };
  };

  const calculateDuration = () => {
    const start = new Date(hackathon.startDate);
    const end = new Date(hackathon.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    
    if (diffDays > 1) {
      return `${diffDays} days`;
    } else {
      return `${diffHours} hours`;
    }
  };

  const getRegistrationButtonText = () => {
    if (hackathon.isRegistered) {
      return 'ALREADY REGISTERED';
    }
    
    if (registrationStatus === 'open') {
      return 'REGISTER NOW';
    } else if (registrationStatus === 'not-started') {
      return 'REGISTRATION OPENS SOON';
    } else {
      return 'REGISTRATION CLOSED';
    }
  };

  const getRegistrationButtonStyle = () => {
    if (hackathon.isRegistered) {
      return 'bg-accent/30 text-primary border-accent/50 cursor-not-allowed';
    }
    
    if (registrationStatus === 'open') {
      return 'bg-secondary text-background hover:shadow-brutal-hover';
    } else if (registrationStatus === 'not-started') {
      return 'bg-accent text-primary cursor-not-allowed opacity-75';
    } else {
      return 'bg-primary/20 text-primary/70 border-primary/50 cursor-not-allowed';
    }
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
            className="bg-background border-4 border-primary shadow-brutal max-w-4xl w-full max-h-[90vh] overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with Gradient Background */}
            <div className="bg-gradient-to-r from-secondary via-accent to-secondary p-6 border-b-4 border-primary relative overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                animate={{ x: [-100, 400] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
              
              <div className="relative z-10 flex justify-between items-start">
                <div className="flex-1 pr-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="h-8 w-8 text-background" />
                    </motion.div>
                    <h1 className="font-space font-bold text-3xl text-background">
                      {hackathon.hackathonName}
                    </h1>
                  </div>
                  
                  <p className="font-inter text-background/90 text-lg mb-4">
                    {hackathon.tagline}
                  </p>
                  
                  <div className="flex flex-wrap gap-3">
                    <span className={`px-4 py-2 text-sm font-inter font-bold border-2 ${getStatusColor(hackathonStatus)}`}>
                      {hackathonStatus.toUpperCase()}
                    </span>
                    <span className={`px-4 py-2 text-sm font-inter font-bold border-2 ${getRegistrationStatusColor(registrationStatus)}`}>
                      {getRegistrationStatusText(registrationStatus)}
                    </span>
                    <div className="bg-background/20 border-2 border-background/30 px-4 py-2 backdrop-blur-sm">
                      <span className="font-inter font-bold text-background text-sm">
                        {hackathon.participantCount} REGISTERED
                      </span>
                    </div>
                    {hackathon.isRegistered && (
                      <div className="bg-accent/30 border-2 border-background/30 px-4 py-2 backdrop-blur-sm flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-background" />
                        <span className="font-inter font-bold text-background text-sm">
                          YOU'RE REGISTERED
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="bg-background/20 text-background p-3 border-2 border-background/30 shadow-brutal-sm hover:bg-background/30 transition-all duration-200 backdrop-blur-sm"
                >
                  <X className="h-6 w-6" />
                </motion.button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6 space-y-8">
              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 tablet:grid-cols-4 gap-4">
                {[
                  { 
                    icon: Timer, 
                    label: 'Duration', 
                    value: calculateDuration(),
                    color: 'bg-accent/10 border-accent'
                  },
                  { 
                    icon: Users, 
                    label: 'Participants', 
                    value: hackathon.participantCount.toString(),
                    color: 'bg-secondary/10 border-secondary'
                  },
                  { 
                    icon: DollarSign, 
                    label: 'Cash Prize', 
                    value: totalCashPrize > 0 ? `$${totalCashPrize.toLocaleString()}` : 'NADA',
                    color: 'bg-primary/10 border-primary'
                  },
                  { 
                    icon: Target, 
                    label: 'Team Size', 
                    value: (hackathon.minTeamSize || hackathon.maxTeamSize) 
                      ? `${hackathon.minTeamSize || 1}-${hackathon.maxTeamSize || '∞'}` 
                      : 'Flexible',
                    color: 'bg-accent/10 border-accent'
                  },
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    className={`${stat.color} border-2 shadow-brutal-sm p-4 text-center relative overflow-hidden group`}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    />
                    <stat.icon className="h-6 w-6 text-primary mx-auto mb-2 relative z-10" />
                    <div className="font-space font-bold text-xl text-primary mb-1 relative z-10">
                      {stat.value}
                    </div>
                    <div className="font-inter text-xs text-primary/70 relative z-10">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Timeline Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-accent/5 border-2 border-primary shadow-brutal p-6"
              >
                <h2 className="font-space font-bold text-2xl text-primary mb-6 flex items-center">
                  <Calendar className="h-6 w-6 mr-3" />
                  EVENT TIMELINE
                </h2>
                
                <div className="space-y-6">
                  {[
                    {
                      icon: UserPlus,
                      title: 'Registration Opens',
                      date: formatDate(hackathon.registrationStartDate),
                      status: new Date() >= new Date(hackathon.registrationStartDate) ? 'completed' : 'upcoming'
                    },
                    {
                      icon: Timer,
                      title: 'Registration Closes',
                      date: formatDate(hackathon.registrationEndDate),
                      status: new Date() >= new Date(hackathon.registrationEndDate) ? 'completed' : 
                             new Date() >= new Date(hackathon.registrationStartDate) ? 'current' : 'upcoming'
                    },
                    {
                      icon: Zap,
                      title: 'Hackathon Begins',
                      date: formatDate(hackathon.startDate),
                      status: new Date() >= new Date(hackathon.startDate) ? 'completed' : 'upcoming'
                    },
                    {
                      icon: Trophy,
                      title: 'Hackathon Ends',
                      date: formatDate(hackathon.endDate),
                      status: new Date() >= new Date(hackathon.endDate) ? 'completed' : 
                             new Date() >= new Date(hackathon.startDate) ? 'current' : 'upcoming'
                    }
                  ].map((event, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className={`p-3 border-2 border-primary ${
                        event.status === 'completed' ? 'bg-accent text-primary' :
                        event.status === 'current' ? 'bg-secondary text-background' :
                        'bg-background text-primary'
                      }`}>
                        <event.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-inter font-bold text-primary mb-1">
                          {event.title}
                          {event.status === 'completed' && <CheckCircle className="inline h-4 w-4 ml-2 text-accent" />}
                          {event.status === 'current' && <AlertCircle className="inline h-4 w-4 ml-2 text-secondary" />}
                        </h3>
                        <p className="font-inter text-primary/70 text-sm">
                          {event.date.date}
                        </p>
                        <p className="font-inter text-primary/60 text-xs">
                          {event.date.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* About Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-secondary/5 border-2 border-primary shadow-brutal p-6"
              >
                <h2 className="font-space font-bold text-2xl text-primary mb-4 flex items-center">
                  <Info className="h-6 w-6 mr-3" />
                  ABOUT THIS HACKATHON
                </h2>
                <div className="prose prose-lg max-w-none">
                  <p className="font-inter text-primary leading-relaxed">
                    {hackathon.about || 'No description provided for this hackathon.'}
                  </p>
                </div>
              </motion.div>

              {/* Venue & Team Info */}
              <div className="grid grid-cols-1 tablet:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-primary/5 border-2 border-primary shadow-brutal p-6"
                >
                  <h3 className="font-space font-bold text-xl text-primary mb-4 flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    VENUE
                  </h3>
                  <p className="font-inter text-primary text-lg">
                    {hackathon.venue || 'Venue not specified'}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-accent/5 border-2 border-primary shadow-brutal p-6"
                >
                  <h3 className="font-space font-bold text-xl text-primary mb-4 flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    TEAM REQUIREMENTS
                  </h3>
                  <div className="space-y-2">
                    <p className="font-inter text-primary">
                      <span className="font-semibold">Min Size:</span> {hackathon.minTeamSize || 1} member{(hackathon.minTeamSize || 1) > 1 ? 's' : ''}
                    </p>
                    <p className="font-inter text-primary">
                      <span className="font-semibold">Max Size:</span> {hackathon.maxTeamSize || 'Unlimited'} member{hackathon.maxTeamSize && hackathon.maxTeamSize > 1 ? 's' : ''}
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* Prizes Section */}
              {(cashPrizes.length > 0 || otherPrizes.length > 0) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-gradient-to-br from-accent/10 to-secondary/10 border-2 border-primary shadow-brutal p-6"
                >
                  <h2 className="font-space font-bold text-2xl text-primary mb-6 flex items-center">
                    <Trophy className="h-6 w-6 mr-3" />
                    PRIZES & REWARDS
                  </h2>
                  
                  <div className="grid grid-cols-1 tablet:grid-cols-2 gap-6">
                    {/* Cash Prizes */}
                    {cashPrizes.length > 0 && (
                      <div className="bg-background border-2 border-primary p-4">
                        <h3 className="font-inter font-bold text-primary mb-3 flex items-center">
                          <DollarSign className="h-5 w-5 mr-2 text-secondary" />
                          CASH PRIZES
                        </h3>
                        <div className="space-y-3">
                          {cashPrizes.map((prize, index) => (
                            <div key={index} className="flex justify-between items-center p-3 bg-secondary/10 border border-primary">
                              <span className="font-inter font-semibold text-primary">
                                {prize.name}
                              </span>
                              <span className="font-space font-bold text-xl text-secondary">
                                ${prize.amount.toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Other Prizes */}
                    {otherPrizes.length > 0 && (
                      <div className="bg-background border-2 border-primary p-4">
                        <h3 className="font-inter font-bold text-primary mb-3 flex items-center">
                          <Award className="h-5 w-5 mr-2 text-accent" />
                          OTHER PRIZES
                        </h3>
                        <div className="space-y-3">
                          {otherPrizes.map((prize, index) => (
                            <div key={index} className="p-3 bg-accent/10 border border-primary">
                              <div className="font-inter font-semibold text-primary mb-1">
                                {prize.name}
                              </div>
                              <div className="font-inter text-primary/70 text-sm">
                                {prize.description}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Footer with Registration Button */}
            <div className="border-t-4 border-primary p-6 bg-primary/5">
              <div className="flex flex-col tablet:flex-row justify-between items-center space-y-4 tablet:space-y-0">
                <div className="text-center tablet:text-left">
                  <p className="font-inter text-primary/70 text-sm">
                    Created on {new Date(hackathon.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                  <p className="font-inter text-primary/60 text-xs">
                    Hackathon ID: {hackathon.hackathonId}
                  </p>
                </div>
                
                <div className="flex space-x-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onClose}
                    className="bg-background text-primary px-6 py-3 border-2 border-primary shadow-brutal-sm hover:shadow-brutal transition-all duration-200 font-inter font-semibold"
                  >
                    CLOSE
                  </motion.button>
                  
                  <motion.button
                    whileHover={!hackathon.isRegistered && registrationStatus === 'open' ? { scale: 1.05, boxShadow: '8px 8px 0px rgba(0,0,0,0.8)' } : {}}
                    whileTap={!hackathon.isRegistered && registrationStatus === 'open' ? { scale: 0.95 } : {}}
                    onClick={handleRegister}
                    disabled={hackathon.isRegistered || registrationStatus !== 'open'}
                    className={`px-8 py-3 border-2 border-primary shadow-brutal transition-all duration-200 font-inter font-bold relative overflow-hidden group ${getRegistrationButtonStyle()}`}
                  >
                    <motion.div
                      className="absolute inset-0 bg-accent opacity-0 group-hover:opacity-30 transition-opacity duration-300"
                    />
                    <div className="flex items-center relative z-10 space-x-2">
                      {hackathon.isRegistered ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : registrationStatus === 'open' ? (
                        <UserPlus className="h-5 w-5" />
                      ) : registrationStatus === 'not-started' ? (
                        <Clock className="h-5 w-5" />
                      ) : (
                        <X className="h-5 w-5" />
                      )}
                      <span>{getRegistrationButtonText()}</span>
                    </div>
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}