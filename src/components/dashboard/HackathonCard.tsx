import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, Trophy, Clock } from 'lucide-react';

interface HackathonCardProps {
  hackathon: {
    id: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    participants: number;
    maxParticipants: number;
    prize: string;
    status: 'upcoming' | 'ongoing' | 'completed';
    tags: string[];
  };
}

export default function HackathonCard({ hackathon }: HackathonCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-accent text-primary';
      case 'ongoing': return 'bg-secondary text-background';
      case 'completed': return 'bg-primary text-background';
      default: return 'bg-primary text-background';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, boxShadow: '12px 12px 0px #000000' }}
      className="bg-background border-4 border-primary shadow-brutal p-6 cursor-pointer"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="font-space font-bold text-xl text-primary mb-2">
            {hackathon.title}
          </h3>
          <p className="font-inter text-primary/70 text-sm line-clamp-2">
            {hackathon.description}
          </p>
        </div>
        <span className={`px-3 py-1 text-xs font-inter font-bold border-2 border-primary ${getStatusColor(hackathon.status)}`}>
          {hackathon.status.toUpperCase()}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-secondary" />
          <span className="font-inter text-sm text-primary">
            {new Date(hackathon.startDate).toLocaleDateString()}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-secondary" />
          <span className="font-inter text-sm text-primary">
            {new Date(hackathon.endDate).toLocaleDateString()}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Users className="h-4 w-4 text-secondary" />
          <span className="font-inter text-sm text-primary">
            {hackathon.participants}/{hackathon.maxParticipants}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Trophy className="h-4 w-4 text-secondary" />
          <span className="font-inter text-sm text-primary">
            {hackathon.prize}
          </span>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {hackathon.tags.map((tag, index) => (
          <span
            key={index}
            className="bg-accent/20 text-primary px-2 py-1 text-xs font-inter font-medium border border-primary"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Action Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-full bg-secondary text-background py-2 px-4 border-2 border-primary shadow-brutal-sm hover:shadow-brutal transition-all duration-200 font-inter font-bold"
      >
        {hackathon.status === 'upcoming' ? 'REGISTER' : 'VIEW DETAILS'}
      </motion.button>
    </motion.div>
  );
}