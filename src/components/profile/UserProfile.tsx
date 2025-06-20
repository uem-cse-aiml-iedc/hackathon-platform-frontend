import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, Trophy, Code, Settings, Save, X, Edit } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { AuthService } from '../../services/authService';

export default function UserProfile() {
  const { currentUser, updateUserName } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(currentUser?.name || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState('');

  // Mock user data - in a real app, this would come from your database
  const userStats = {
    hackathonsJoined: 12,
    hackathonsWon: 3,
    hackathonsCreated: 2,
    totalPoints: 2450
  };

  const recentHackathons = [
    { name: 'AI Revolution Hackathon', status: 'Won 1st Place', date: '2024-01-15' },
    { name: 'Web3 Future Hack', status: 'Participant', date: '2024-01-10' },
    { name: 'Green Tech Challenge', status: 'Won 2nd Place', date: '2023-12-20' },
  ];

  const handleEditName = () => {
    setIsEditingName(true);
    setNewName(currentUser?.name || '');
    setUpdateError('');
    setUpdateSuccess('');
  };

  const handleCancelEdit = () => {
    setIsEditingName(false);
    setNewName(currentUser?.name || '');
    setUpdateError('');
    setUpdateSuccess('');
  };

  const handleSaveName = async () => {
    if (!currentUser || !newName.trim()) {
      setUpdateError('Name cannot be empty');
      return;
    }

    if (newName.trim() === currentUser.name) {
      setIsEditingName(false);
      return;
    }

    try {
      setIsUpdating(true);
      setUpdateError('');
      
      await AuthService.updateName(
        currentUser.email,
        currentUser.authToken,
        newName.trim()
      );

      // Update the user data in context and localStorage
      updateUserName(newName.trim());
      
      setIsEditingName(false);
      setUpdateSuccess('Name updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setUpdateSuccess('');
      }, 3000);
      
    } catch (error: any) {
      setUpdateError(error.message || 'Failed to update name');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-space font-bold text-4xl text-primary mb-4">
            USER PROFILE
          </h1>
          <p className="font-inter text-primary/70">
            Manage your profile and track your hackathon journey
          </p>
        </div>

        {/* Success/Error Messages */}
        {updateSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-accent/20 border-2 border-accent p-4 mb-6 text-center"
          >
            <p className="font-inter font-semibold text-primary">
              ✅ {updateSuccess}
            </p>
          </motion.div>
        )}

        {updateError && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-secondary/20 border-2 border-secondary p-4 mb-6 text-center"
          >
            <p className="font-inter font-semibold text-secondary">
              ❌ {updateError}
            </p>
          </motion.div>
        )}

        {/* Profile Card */}
        <div className="bg-background border-4 border-primary shadow-brutal mb-8">
          <div className="p-8">
            <div className="flex flex-col tablet:flex-row items-center tablet:items-start space-y-4 tablet:space-y-0 tablet:space-x-6">
              {/* Avatar */}
              <div className="bg-accent border-4 border-primary w-24 h-24 flex items-center justify-center">
                <User className="h-12 w-12 text-primary" />
              </div>

              {/* User Info */}
              <div className="flex-1 text-center tablet:text-left">
                <div className="flex items-center justify-center tablet:justify-start space-x-3 mb-2">
                  {isEditingName ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="font-space font-bold text-2xl text-primary bg-background border-2 border-primary px-3 py-1 focus:border-secondary focus:outline-none"
                        placeholder="Enter your name"
                        disabled={isUpdating}
                      />
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleSaveName}
                        disabled={isUpdating}
                        className="bg-accent text-primary p-2 border-2 border-primary shadow-brutal-sm hover:shadow-brutal transition-all duration-200 disabled:opacity-50"
                      >
                        {isUpdating ? (
                          <div className="spinner w-4 h-4"></div>
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleCancelEdit}
                        disabled={isUpdating}
                        className="bg-secondary text-background p-2 border-2 border-primary shadow-brutal-sm hover:shadow-brutal transition-all duration-200 disabled:opacity-50"
                      >
                        <X className="h-4 w-4" />
                      </motion.button>
                    </div>
                  ) : (
                    <>
                      <h2 className="font-space font-bold text-2xl text-primary">
                        {currentUser?.name || 'User Name'}
                      </h2>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleEditName}
                        className="bg-background text-primary p-1 border-2 border-primary shadow-brutal-sm hover:shadow-brutal transition-all duration-200"
                      >
                        <Edit className="h-4 w-4" />
                      </motion.button>
                    </>
                  )}
                </div>
                <div className="flex flex-col tablet:flex-row tablet:items-center space-y-2 tablet:space-y-0 tablet:space-x-6">
                  <div className="flex items-center justify-center tablet:justify-start space-x-2">
                    <Mail className="h-4 w-4 text-secondary" />
                    <span className="font-inter text-primary/70">
                      {currentUser?.email}
                    </span>
                  </div>
                  <div className="flex items-center justify-center tablet:justify-start space-x-2">
                    <Calendar className="h-4 w-4 text-secondary" />
                    <span className="font-inter text-primary/70">
                      Joined Recently
                    </span>
                  </div>
                </div>
              </div>

              {/* Edit Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-secondary text-background px-6 py-2 border-2 border-primary shadow-brutal-sm hover:shadow-brutal transition-all duration-200 font-inter font-semibold"
              >
                <Settings className="inline h-4 w-4 mr-2" />
                EDIT PROFILE
              </motion.button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 tablet:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Hackathons Joined', value: userStats.hackathonsJoined, icon: Code },
            { label: 'Hackathons Won', value: userStats.hackathonsWon, icon: Trophy },
            { label: 'Hackathons Created', value: userStats.hackathonsCreated, icon: User },
            { label: 'Total Points', value: userStats.totalPoints, icon: Trophy },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-background border-4 border-primary shadow-brutal p-4 text-center"
            >
              <stat.icon className="h-8 w-8 text-secondary mx-auto mb-2" />
              <div className="font-space font-bold text-2xl text-primary mb-1">
                {stat.value}
              </div>
              <div className="font-inter text-sm text-primary/70">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-background border-4 border-primary shadow-brutal">
          {/* Tab Headers */}
          <div className="border-b-2 border-primary">
            <div className="flex">
              {[
                { id: 'profile', label: 'PROFILE INFO' },
                { id: 'hackathons', label: 'MY HACKATHONS' },
                { id: 'achievements', label: 'ACHIEVEMENTS' },
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
            {activeTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h3 className="font-space font-bold text-xl text-primary mb-4">
                  PROFILE INFORMATION
                </h3>
                <div className="grid grid-cols-1 tablet:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-inter font-semibold text-primary mb-2">
                      DISPLAY NAME
                    </label>
                    <input
                      type="text"
                      value={currentUser?.name || ''}
                      className="w-full px-4 py-3 border-2 border-primary focus:border-secondary focus:outline-none font-inter bg-background"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block font-inter font-semibold text-primary mb-2">
                      EMAIL ADDRESS
                    </label>
                    <input
                      type="email"
                      value={currentUser?.email || ''}
                      className="w-full px-4 py-3 border-2 border-primary focus:border-secondary focus:outline-none font-inter bg-background"
                      readOnly
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'hackathons' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h3 className="font-space font-bold text-xl text-primary mb-4">
                  RECENT HACKATHONS
                </h3>
                <div className="space-y-4">
                  {recentHackathons.map((hackathon, index) => (
                    <div
                      key={index}
                      className="bg-accent/10 border-2 border-primary p-4 flex justify-between items-center"
                    >
                      <div>
                        <div className="font-inter font-semibold text-primary">
                          {hackathon.name}
                        </div>
                        <div className="font-inter text-sm text-primary/70">
                          {hackathon.status}
                        </div>
                      </div>
                      <div className="font-inter text-sm text-primary/70">
                        {new Date(hackathon.date).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'achievements' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h3 className="font-space font-bold text-xl text-primary mb-4">
                  ACHIEVEMENTS & BADGES
                </h3>
                <div className="grid grid-cols-1 tablet:grid-cols-3 gap-4">
                  {[
                    { name: 'First Win', description: 'Won your first hackathon', earned: true },
                    { name: 'Team Player', description: 'Participated in 10+ hackathons', earned: true },
                    { name: 'Innovator', description: 'Created 5+ hackathons', earned: false },
                  ].map((achievement, index) => (
                    <div
                      key={index}
                      className={`p-4 border-2 border-primary text-center ${
                        achievement.earned
                          ? 'bg-accent/20 text-primary'
                          : 'bg-background text-primary/50'
                      }`}
                    >
                      <Trophy className={`h-8 w-8 mx-auto mb-2 ${
                        achievement.earned ? 'text-secondary' : 'text-primary/50'
                      }`} />
                      <div className="font-inter font-semibold">
                        {achievement.name}
                      </div>
                      <div className="font-inter text-sm">
                        {achievement.description}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}