import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Calendar, Users, Trophy, Edit, Eye, Trash2, Settings, Zap, Target, MapPin, Clock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { HackathonService, Hackathon } from '../../services/hackathonService';

export default function OrganizerDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [createdHackathons, setCreatedHackathons] = useState<Hackathon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();
  const { showError, showSuccess } = useToast();
  const navigate = useNavigate();

  // Fetch hackathons on component mount
  useEffect(() => {
    fetchHackathons();
  }, []);

  const fetchHackathons = async () => {
    if (!currentUser) {
      setError('User not authenticated');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await HackathonService.fetchMyHackathons({
        email: currentUser.email,
        authToken: currentUser.authToken,
      });

      setCreatedHackathons(response.hackathons);
    } catch (error: any) {
      if (error.message === 'No hackathons found for this email.') {
        setCreatedHackathons([]);
      } else {
        setError(error.message || 'Failed to fetch hackathons');
        showError('Failed to Load Hackathons', error.message || 'Unable to fetch your hackathons');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Listen for hackathon creation/update events
  useEffect(() => {
    const handleHackathonChange = () => {
      // Refresh the hackathons list when a hackathon is created or updated
      fetchHackathons();
    };

    window.addEventListener('hackathonCreated', handleHackathonChange);
    window.addEventListener('hackathonUpdated', handleHackathonChange);
    
    return () => {
      window.removeEventListener('hackathonCreated', handleHackathonChange);
      window.removeEventListener('hackathonUpdated', handleHackathonChange);
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-accent text-primary';
      case 'ongoing': return 'bg-secondary text-background';
      case 'completed': return 'bg-primary text-background';
      default: return 'bg-primary text-background';
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })
    };
  };

  const handleManageHackathon = (hackathonId: string) => {
    navigate(`/edit-hackathon/${hackathonId}`);
  };

  const handleViewHackathon = (hackathonId: string) => {
    // TODO: Implement view hackathon details page
    showSuccess('View Details', 'Hackathon details page will be available soon');
  };

  const handleDeleteHackathon = async (hackathonId: string) => {
    if (window.confirm('Are you sure you want to delete this hackathon? This action cannot be undone.')) {
      // TODO: Implement delete functionality when backend supports it
      showError('Delete Not Available', 'Delete functionality will be available soon');
    }
  };

  // Calculate stats from fetched hackathons
  const totalParticipants = 0; // This would come from backend when participant data is available
  const totalPrizePool = 0; // This would come from backend when prize data is available
  const activeHackathons = createdHackathons.filter(h => 
    HackathonService.getHackathonStatus(h.startDate, h.endDate, h.registrationEndDate) === 'ongoing'
  ).length;

  // Sort hackathons by status and date
  const sortedHackathons = [...createdHackathons].sort((a, b) => {
    const statusA = HackathonService.getHackathonStatus(a.startDate, a.endDate, a.registrationEndDate);
    const statusB = HackathonService.getHackathonStatus(b.startDate, b.endDate, b.registrationEndDate);
    
    // Priority: ongoing > upcoming > completed
    const statusPriority = { ongoing: 3, upcoming: 2, completed: 1 };
    
    if (statusPriority[statusA] !== statusPriority[statusB]) {
      return statusPriority[statusB] - statusPriority[statusA];
    }
    
    // If same status, sort by start date
    return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
  });

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1 
            className="font-space font-bold text-5xl text-primary mb-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            ORGANIZER DASHBOARD
          </motion.h1>
          <motion.p 
            className="font-inter text-primary/70 text-lg max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Manage your hackathons, track participants, and create amazing coding competitions
          </motion.p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 tablet:grid-cols-4 gap-6 mb-12">
          {[
            { 
              label: 'TOTAL HACKATHONS', 
              value: createdHackathons.length, 
              icon: Calendar,
              color: 'bg-accent/20 border-accent'
            },
            { 
              label: 'TOTAL PARTICIPANTS', 
              value: totalParticipants, 
              icon: Users,
              color: 'bg-secondary/20 border-secondary'
            },
            { 
              label: 'TOTAL PRIZE POOL', 
              value: totalPrizePool > 0 ? `$${totalPrizePool.toLocaleString()}` : 'TBD', 
              icon: Trophy,
              color: 'bg-primary/10 border-primary'
            },
            { 
              label: 'ACTIVE HACKATHONS', 
              value: activeHackathons, 
              icon: Zap,
              color: 'bg-accent/30 border-accent'
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 + 0.6 }}
              whileHover={{ scale: 1.02, y: -2 }}
              className={`${stat.color} border-4 shadow-brutal p-6 text-center relative overflow-hidden group`}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />
              <stat.icon className="h-8 w-8 text-primary mx-auto mb-4 relative z-10" />
              <div className="font-space font-bold text-3xl text-primary mb-2 relative z-10">
                {stat.value}
              </div>
              <div className="font-inter font-semibold text-primary text-sm relative z-10">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Create Hackathon Card - Super Cool Design - Now Fully Clickable */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mb-12"
        >
          <Link to="/create-hackathon" className="block">
            <motion.div
              whileHover={{ 
                scale: 1.02,
                boxShadow: '20px 20px 0px rgba(0,0,0,0.8)',
              }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-br from-accent via-secondary to-primary border-4 border-primary shadow-brutal p-8 relative overflow-hidden group cursor-pointer transition-all duration-300"
            >
              {/* Animated Background Elements */}
              <motion.div
                className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              <motion.div
                className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-xl"
                animate={{ 
                  scale: [1.2, 1, 1.2],
                  opacity: [0.6, 0.3, 0.6]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />

              <div className="relative z-10 flex flex-col tablet:flex-row items-center justify-between">
                <div className="flex-1 text-center tablet:text-left mb-6 tablet:mb-0">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="inline-block mb-4"
                  >
                    <div className="bg-background border-4 border-primary p-4 inline-block shadow-brutal">
                      <Plus className="h-12 w-12 text-primary" />
                    </div>
                  </motion.div>
                  
                  <h2 className="font-space font-bold text-3xl tablet:text-4xl text-background mb-4">
                    CREATE NEW HACKATHON
                  </h2>
                  <p className="font-inter text-background/90 text-lg max-w-md">
                    Launch your next coding competition and bring together innovative minds from around the world
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mt-4">
                    {['Global Reach', 'Easy Setup', 'Real-time Analytics'].map((feature, index) => (
                      <motion.span
                        key={feature}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1 + index * 0.1 }}
                        className="bg-background/20 text-background px-3 py-1 text-sm font-inter font-medium border border-background/30 backdrop-blur-sm"
                      >
                        {feature}
                      </motion.span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col space-y-4">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="bg-background text-primary px-8 py-4 border-4 border-primary shadow-brutal transition-all duration-200 font-inter font-bold text-lg inline-flex items-center relative overflow-hidden group"
                  >
                    <motion.div
                      className="absolute inset-0 bg-accent opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                    />
                    <Target className="mr-3 h-6 w-6 relative z-10" />
                    <span className="relative z-10">START CREATING</span>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="bg-transparent text-background px-8 py-3 border-2 border-background hover:bg-background/10 transition-all duration-200 font-inter font-semibold inline-flex items-center"
                  >
                    <Eye className="mr-2 h-5 w-5" />
                    VIEW TEMPLATES
                  </motion.div>
                </div>
              </div>

              {/* Click indicator */}
              <motion.div
                className="absolute top-4 right-4 bg-background/20 text-background px-3 py-1 text-xs font-inter font-bold border border-background/30 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                initial={{ scale: 0.8 }}
                whileHover={{ scale: 1 }}
              >
                CLICK TO CREATE
              </motion.div>
            </motion.div>
          </Link>
        </motion.div>

        {/* My Created Hackathons */}
        <div className="bg-background border-4 border-primary shadow-brutal">
          {/* Tab Headers */}
          <div className="border-b-2 border-primary">
            <div className="flex">
              {[
                { id: 'overview', label: 'MY HACKATHONS' },
                { id: 'analytics', label: 'ANALYTICS' },
                { id: 'settings', label: 'SETTINGS' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 font-inter font-semibold border-r-2 border-primary transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'bg-accent text-primary'
                      : 'bg-background text-primary/70 hover:bg-accent/20'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-space font-bold text-2xl text-primary">
                    YOUR CREATED HACKATHONS ({createdHackathons.length})
                  </h3>
                  <div className="flex space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={fetchHackathons}
                      disabled={isLoading}
                      className="bg-accent text-primary px-4 py-2 border-2 border-primary shadow-brutal-sm hover:shadow-brutal transition-all duration-200 font-inter font-semibold disabled:opacity-50"
                    >
                      {isLoading ? 'REFRESHING...' : 'REFRESH'}
                    </motion.button>
                  </div>
                </div>

                {isLoading ? (
                  <div className="text-center py-12">
                    <div className="spinner mx-auto mb-4"></div>
                    <p className="font-inter text-primary/70">Loading your hackathons...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-12">
                    <div className="bg-secondary/10 border-4 border-secondary shadow-brutal p-8 max-w-md mx-auto">
                      <h3 className="font-space font-bold text-xl text-secondary mb-2">
                        ERROR LOADING HACKATHONS
                      </h3>
                      <p className="font-inter text-primary/70 mb-4">
                        {error}
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={fetchHackathons}
                        className="bg-secondary text-background px-6 py-2 border-2 border-primary shadow-brutal-sm hover:shadow-brutal transition-all duration-200 font-inter font-semibold"
                      >
                        TRY AGAIN
                      </motion.button>
                    </div>
                  </div>
                ) : sortedHackathons.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="bg-accent/10 border-4 border-primary shadow-brutal p-8 max-w-md mx-auto">
                      <Calendar className="h-16 w-16 text-primary/30 mx-auto mb-4" />
                      <h3 className="font-space font-bold text-xl text-primary mb-2">
                        NO HACKATHONS YET
                      </h3>
                      <p className="font-inter text-primary/70 mb-6">
                        Create your first hackathon to get started
                      </p>
                      <Link
                        to="/create-hackathon"
                        className="bg-secondary text-background px-6 py-3 border-2 border-primary shadow-brutal-sm hover:shadow-brutal transition-all duration-200 font-inter font-semibold inline-block"
                      >
                        CREATE HACKATHON
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-6">
                    {sortedHackathons.map((hackathon, index) => {
                      const status = HackathonService.getHackathonStatus(
                        hackathon.startDate, 
                        hackathon.endDate, 
                        hackathon.registrationEndDate
                      );
                      const startDateTime = formatDateTime(hackathon.startDate);
                      const endDateTime = formatDateTime(hackathon.endDate);
                      const regStartDateTime = formatDateTime(hackathon.registrationStartDate);
                      const regEndDateTime = formatDateTime(hackathon.registrationEndDate);

                      return (
                        <motion.div
                          key={hackathon.hackathonId}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.02, boxShadow: '12px 12px 0px #000000' }}
                          className="bg-background border-4 border-primary shadow-brutal p-6 relative group"
                        >
                          {/* Status Badge */}
                          <div className="flex justify-between items-start mb-4">
                            <span className={`px-3 py-1 text-xs font-inter font-bold border-2 border-primary ${getStatusColor(status)}`}>
                              {status.toUpperCase()}
                            </span>
                            <div className="flex space-x-2">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleManageHackathon(hackathon.hackathonId)}
                                className="bg-accent text-primary p-2 border-2 border-primary shadow-brutal-sm hover:shadow-brutal transition-all duration-200"
                                title="Manage Hackathon"
                              >
                                <Settings className="h-4 w-4" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleViewHackathon(hackathon.hackathonId)}
                                className="bg-secondary text-background p-2 border-2 border-primary shadow-brutal-sm hover:shadow-brutal transition-all duration-200"
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </motion.button>
                            </div>
                          </div>

                          {/* Hackathon Info */}
                          <h4 className="font-space font-bold text-xl text-primary mb-2">
                            {hackathon.hackathonName}
                          </h4>
                          <p className="font-inter text-primary/70 text-sm mb-4 line-clamp-2">
                            {hackathon.tagline}
                          </p>

                          {/* Date/Time Details */}
                          <div className="space-y-3 mb-4">
                            <div className="grid grid-cols-1 gap-2">
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4 text-secondary flex-shrink-0" />
                                <div className="text-xs">
                                  <span className="font-inter font-semibold text-primary">Start:</span>
                                  <span className="font-inter text-primary/70 ml-1">
                                    {startDateTime.date} at {startDateTime.time}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4 text-secondary flex-shrink-0" />
                                <div className="text-xs">
                                  <span className="font-inter font-semibold text-primary">End:</span>
                                  <span className="font-inter text-primary/70 ml-1">
                                    {endDateTime.date} at {endDateTime.time}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Users className="h-4 w-4 text-secondary flex-shrink-0" />
                                <div className="text-xs">
                                  <span className="font-inter font-semibold text-primary">Reg Start:</span>
                                  <span className="font-inter text-primary/70 ml-1">
                                    {regStartDateTime.date} at {regStartDateTime.time}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Users className="h-4 w-4 text-secondary flex-shrink-0" />
                                <div className="text-xs">
                                  <span className="font-inter font-semibold text-primary">Reg End:</span>
                                  <span className="font-inter text-primary/70 ml-1">
                                    {regEndDateTime.date} at {regEndDateTime.time}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <MapPin className="h-4 w-4 text-secondary flex-shrink-0" />
                                <div className="text-xs">
                                  <span className="font-inter font-semibold text-primary">Venue:</span>
                                  <span className="font-inter text-primary/70 ml-1">
                                    {hackathon.venue}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex space-x-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleManageHackathon(hackathon.hackathonId)}
                              className="flex-1 bg-secondary text-background py-2 px-4 border-2 border-primary shadow-brutal-sm hover:shadow-brutal transition-all duration-200 font-inter font-bold text-sm"
                            >
                              MANAGE
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleDeleteHackathon(hackathon.hackathonId)}
                              className="bg-primary text-background p-2 border-2 border-primary shadow-brutal-sm hover:shadow-brutal transition-all duration-200"
                              title="Delete Hackathon"
                            >
                              <Trash2 className="h-4 w-4" />
                            </motion.button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'analytics' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-center py-12"
              >
                <div className="bg-accent/10 border-4 border-primary shadow-brutal p-8 max-w-md mx-auto">
                  <Trophy className="h-16 w-16 text-primary mx-auto mb-4" />
                  <h3 className="font-space font-bold text-xl text-primary mb-2">
                    ANALYTICS COMING SOON
                  </h3>
                  <p className="font-inter text-primary/70">
                    Detailed analytics and insights for your hackathons will be available soon
                  </p>
                </div>
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-center py-12"
              >
                <div className="bg-secondary/10 border-4 border-primary shadow-brutal p-8 max-w-md mx-auto">
                  <Settings className="h-16 w-16 text-primary mx-auto mb-4" />
                  <h3 className="font-space font-bold text-xl text-primary mb-2">
                    ORGANIZER SETTINGS
                  </h3>
                  <p className="font-inter text-primary/70">
                    Customize your organizer preferences and notification settings
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}