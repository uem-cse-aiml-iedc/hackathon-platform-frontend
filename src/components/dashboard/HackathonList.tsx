import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter } from 'lucide-react';
import HackathonCard from './HackathonCard';

// Mock data for demonstration
const mockHackathons = [
  {
    id: '1',
    title: 'AI Revolution Hackathon',
    description: 'Build the next generation of AI applications that will change the world.',
    startDate: '2024-02-15',
    endDate: '2024-02-17',
    participants: 156,
    maxParticipants: 200,
    prize: '$10,000',
    status: 'upcoming' as const,
    tags: ['AI', 'Machine Learning', 'Python']
  },
  {
    id: '2',
    title: 'Web3 Future Hack',
    description: 'Create decentralized applications that will shape the future of the internet.',
    startDate: '2024-01-20',
    endDate: '2024-01-22',
    participants: 89,
    maxParticipants: 150,
    prize: '$7,500',
    status: 'ongoing' as const,
    tags: ['Blockchain', 'Web3', 'Solidity']
  },
  {
    id: '3',
    title: 'Green Tech Challenge',
    description: 'Develop sustainable technology solutions for environmental challenges.',
    startDate: '2023-12-10',
    endDate: '2023-12-12',
    participants: 120,
    maxParticipants: 120,
    prize: '$5,000',
    status: 'completed' as const,
    tags: ['Sustainability', 'IoT', 'React']
  },
  {
    id: '4',
    title: 'Mobile Innovation Hack',
    description: 'Build innovative mobile applications that solve real-world problems.',
    startDate: '2024-03-01',
    endDate: '2024-03-03',
    participants: 67,
    maxParticipants: 180,
    prize: '$8,000',
    status: 'upcoming' as const,
    tags: ['Mobile', 'React Native', 'Flutter']
  }
];

export default function HackathonList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredHackathons = mockHackathons.filter(hackathon => {
    const matchesSearch = hackathon.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hackathon.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || hackathon.status === filterStatus;
    
    return matchesSearch && matchesFilter;
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
      </div>

      {/* Results Count */}
      <div className="flex justify-between items-center">
        <p className="font-inter text-primary/70">
          Showing {filteredHackathons.length} hackathon{filteredHackathons.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Hackathon Grid */}
      <motion.div 
        className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, staggerChildren: 0.1 }}
      >
        {filteredHackathons.map((hackathon) => (
          <HackathonCard key={hackathon.id} hackathon={hackathon} />
        ))}
      </motion.div>

      {/* No Results */}
      {filteredHackathons.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12"
        >
          <div className="bg-background border-4 border-primary shadow-brutal p-8 max-w-md mx-auto">
            <h3 className="font-space font-bold text-xl text-primary mb-2">
              NO HACKATHONS FOUND
            </h3>
            <p className="font-inter text-primary/70">
              Try adjusting your search or filter criteria
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}