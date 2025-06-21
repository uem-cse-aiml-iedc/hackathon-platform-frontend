import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Loader2, Calendar, RefreshCw } from 'lucide-react';
import HackathonCard from './HackathonCard';
import HackathonDetailsModal from './HackathonDetailsModal';
import { HackathonService, PublicHackathon } from '../../services/hackathonService';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';

export default function HackathonList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [hackathons, setHackathons] = useState<PublicHackathon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedHackathon, setSelectedHackathon] = useState<PublicHackathon | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showError } = useToast();
  const { currentUser } = useAuth();

  // Fetch hackathons on component mount
  useEffect(() => {
    fetchHackathons();
  }, [currentUser]);

  const fetchHackathons = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Pass user email to get registration status
      const response = await HackathonService.fetchAllHackathons(currentUser?.email);
      setHackathons(response.hackathons);
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch hackathons';
      setError(errorMessage);
      
      if (errorMessage !== 'No hackathons available.') {
        showError('Failed to Load Hackathons', errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (hackathon: PublicHackathon) => {
    setSelectedHackathon(hackathon);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedHackathon(null);
  };

  const filteredHackathons = hackathons.filter(hackathon => {
    const matchesSearch = hackathon.hackathonName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hackathon.tagline.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hackathon.venue.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') {
      return matchesSearch;
    }
    
    const status = HackathonService.getHackathonStatus(
      hackathon.startDate, 
      hackathon.endDate, 
      hackathon.registrationEndDate
    );
    
    const matchesFilter = status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  // Sort hackathons by status and date
  const sortedHackathons = [...filteredHackathons].sort((a, b) => {
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
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="font-space font-bold text-4xl text-primary mb-4">
          DISCOVER HACKATHONS
        </h1>
        <p className="font-inter text-primary/70 max-w-2xl mx-auto">
          Join innovative hackathons from around the world. Build, compete, and win with the developer community.
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col tablet:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary/50" />
          <input
            type="text"
            placeholder="Search hackathons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border-2 border-primary focus:border-secondary focus:outline-none font-inter bg-background"
          />
        </div>

        {/* Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary/50" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="pl-10 pr-8 py-3 border-2 border-primary focus:border-secondary focus:outline-none font-inter bg-background appearance-none"
          >
            <option value="all">ALL STATUS</option>
            <option value="upcoming">UPCOMING</option>
            <option value="ongoing">ONGOING</option>
            <option value="completed">COMPLETED</option>
          </select>
        </div>

        {/* Refresh Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={fetchHackathons}
          disabled={isLoading}
          className="bg-accent text-primary px-6 py-3 border-2 border-primary shadow-brutal-sm hover:shadow-brutal transition-all duration-200 font-inter font-semibold disabled:opacity-50 flex items-center"
        >
          <RefreshCw className={`h-5 w-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          REFRESH
        </motion.button>
      </div>

      {/* Results Count */}
      {!isLoading && !error && (
        <div className="flex justify-between items-center">
          <p className="font-inter text-primary/70">
            Showing {sortedHackathons.length} hackathon{sortedHackathons.length !== 1 ? 's' : ''}
            {hackathons.length > 0 && ` of ${hackathons.length} total`}
          </p>
          {hackathons.length > 0 && (
            <p className="font-inter text-primary/70 text-sm">
              Total participants across all hackathons: {hackathons.reduce((sum, h) => sum + h.participantCount, 0)}
            </p>
          )}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-20">
          <Loader2 className="h-16 w-16 text-secondary mx-auto mb-4 animate-spin" />
          <h2 className="font-space font-bold text-2xl text-primary mb-2">
            LOADING HACKATHONS
          </h2>
          <p className="font-inter text-primary/70">
            Fetching the latest hackathons for you...
          </p>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12"
        >
          <div className="bg-secondary/10 border-4 border-secondary shadow-brutal p-8 max-w-md mx-auto">
            <h3 className="font-space font-bold text-xl text-secondary mb-2">
              FAILED TO LOAD HACKATHONS
            </h3>
            <p className="font-inter text-primary/70 mb-4">
              {error === 'No hackathons available.' ? 
                'No hackathons are currently available. Check back later!' : 
                error
              }
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchHackathons}
              className="bg-secondary text-background px-6 py-3 border-2 border-primary shadow-brutal-sm hover:shadow-brutal transition-all duration-200 font-inter font-semibold"
            >
              TRY AGAIN
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Hackathon Grid */}
      {!isLoading && !error && sortedHackathons.length > 0 && (
        <motion.div 
          className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, staggerChildren: 0.1 }}
        >
          {sortedHackathons.map((hackathon, index) => (
            <motion.div
              key={hackathon.hackathonId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <HackathonCard 
                hackathon={hackathon} 
                onViewDetails={handleViewDetails}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* No Results */}
      {!isLoading && !error && sortedHackathons.length === 0 && hackathons.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12"
        >
          <div className="bg-background border-4 border-primary shadow-brutal p-8 max-w-md mx-auto">
            <Calendar className="h-16 w-16 text-primary/30 mx-auto mb-4" />
            <h3 className="font-space font-bold text-xl text-primary mb-2">
              NO HACKATHONS FOUND
            </h3>
            <p className="font-inter text-primary/70">
              Try adjusting your search or filter criteria
            </p>
          </div>
        </motion.div>
      )}

      {/* Hackathon Details Modal */}
      <HackathonDetailsModal
        hackathon={selectedHackathon}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}