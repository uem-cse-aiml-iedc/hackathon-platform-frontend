import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
  const { currentUser } = useAuth();

  // Mock data for the dashboard
  const userStats = {
    upcomingHackathons: 3,
    totalParticipated: 12,
    totalWon: 3,
  };

  const upcomingHackathons = [
    {
      id: '1',
      title: 'AI Revolution Hackathon',
      startDate: '2024-02-15',
      participants: 156,
      status: 'registered'
    },
    {
      id: '2',
      title: 'Web3 Future Hack',
      startDate: '2024-01-20',
      participants: 89,
      status: 'ongoing'
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-brutal py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Welcome Header */}
        <div className="mb-12">
          <h1 className="font-space font-bold text-4xl text-primary mb-4">
            WELCOME BACK, {currentUser?.name?.toUpperCase() || 'HACKER'}!
          </h1>
          <p className="font-inter text-primary/70 text-lg">
            Ready to build something amazing? Check out your dashboard below.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-6 mb-12">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              to="/hackathons"
              className="block bg-secondary text-background border-4 border-primary shadow-brutal hover:shadow-brutal-hover transition-all duration-200 p-6"
            >
              <Calendar className="h-8 w-8 mb-4" />
              <h3 className="font-space font-bold text-xl mb-2">
                BROWSE HACKATHONS
              </h3>
              <p className="font-inter">
                Discover new challenges and opportunities
              </p>
            </Link>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              to="/organizer-dashboard"
              className="block bg-accent text-primary border-4 border-primary shadow-brutal hover:shadow-brutal-hover transition-all duration-200 p-6"
            >
              <Trophy className="h-8 w-8 mb-4" />
              <h3 className="font-space font-bold text-xl mb-2">
                ORGANIZER DASHBOARD
              </h3>
              <p className="font-inter">
                Create and manage your hackathons
              </p>
            </Link>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              to="/profile"
              className="block bg-background text-primary border-4 border-primary shadow-brutal hover:shadow-brutal-hover transition-all duration-200 p-6"
            >
              <Users className="h-8 w-8 mb-4" />
              <h3 className="font-space font-bold text-xl mb-2">
                MY PROFILE
              </h3>
              <p className="font-inter">
                View your stats and achievements
              </p>
            </Link>
          </motion.div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 tablet:grid-cols-3 gap-6 mb-12">
          {[
            { 
              label: 'UPCOMING HACKATHONS', 
              value: userStats.upcomingHackathons, 
              icon: Calendar,
              color: 'bg-accent/20'
            },
            { 
              label: 'TOTAL PARTICIPATED', 
              value: userStats.totalParticipated, 
              icon: Users,
              color: 'bg-secondary/20'
            },
            { 
              label: 'HACKATHONS WON', 
              value: userStats.totalWon, 
              icon: Trophy,
              color: 'bg-primary/10'
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`${stat.color} border-4 border-primary shadow-brutal p-6 text-center`}
            >
              <stat.icon className="h-8 w-8 text-primary mx-auto mb-4" />
              <div className="font-space font-bold text-3xl text-primary mb-2">
                {stat.value}
              </div>
              <div className="font-inter font-semibold text-primary">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Upcoming Hackathons */}
        <div className="bg-background border-4 border-primary shadow-brutal">
          <div className="p-6 border-b-2 border-primary">
            <h2 className="font-space font-bold text-2xl text-primary">
              YOUR UPCOMING HACKATHONS
            </h2>
          </div>
          
          <div className="p-6">
            {upcomingHackathons.length > 0 ? (
              <div className="space-y-4">
                {upcomingHackathons.map((hackathon) => (
                  <motion.div
                    key={hackathon.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-4 border-2 border-primary bg-accent/10"
                  >
                    <div>
                      <h3 className="font-inter font-semibold text-primary mb-1">
                        {hackathon.title}
                      </h3>
                      <p className="font-inter text-primary/70 text-sm">
                        Starts: {new Date(hackathon.startDate).toLocaleDateString()} • 
                        {hackathon.participants} participants
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-1 text-xs font-inter font-bold border-2 border-primary ${
                        hackathon.status === 'registered' 
                          ? 'bg-accent text-primary' 
                          : 'bg-secondary text-background'
                      }`}>
                        {hackathon.status.toUpperCase()}
                      </span>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-primary text-background px-4 py-2 border-2 border-primary shadow-brutal-sm hover:shadow-brutal transition-all duration-200 font-inter font-semibold text-sm"
                      >
                        VIEW
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-primary/30 mx-auto mb-4" />
                <h3 className="font-space font-bold text-xl text-primary mb-2">
                  NO UPCOMING HACKATHONS
                </h3>
                <p className="font-inter text-primary/70 mb-6">
                  Join a hackathon to start building amazing projects
                </p>
                <Link
                  to="/hackathons"
                  className="bg-secondary text-background px-6 py-3 border-2 border-primary shadow-brutal-sm hover:shadow-brutal transition-all duration-200 font-inter font-semibold inline-block"
                >
                  BROWSE HACKATHONS
                </Link>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}