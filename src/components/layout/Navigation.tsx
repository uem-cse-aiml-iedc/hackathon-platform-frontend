import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Code2, LogOut, User, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import GlitchText from '../ui/GlitchText';

export default function Navigation() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <motion.nav 
      className="bg-background border-4 border-primary shadow-brutal backdrop-blur-sm bg-opacity-95 sticky top-0 z-50"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="max-w-7xl mx-auto px-brutal">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/" className="flex items-center space-x-2">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Code2 className="h-8 w-8 text-primary" />
              </motion.div>
              <GlitchText 
                text="HACKNEST"
                className="font-space font-bold text-xl text-primary"
              />
            </Link>
          </motion.div>

          {/* Navigation Links */}
          <div className="hidden tablet:flex items-center space-x-8">
            <motion.div whileHover={{ y: -2 }}>
              <Link 
                to="/hackathons" 
                className="font-inter font-medium text-primary hover:text-secondary transition-colors duration-200 relative group"
              >
                HACKATHONS
                <motion.div
                  className="absolute -bottom-1 left-0 w-0 h-0.5 bg-secondary group-hover:w-full transition-all duration-300"
                />
              </Link>
            </motion.div>
            <motion.div whileHover={{ y: -2 }}>
              <Link 
                to="/about" 
                className="font-inter font-medium text-primary hover:text-secondary transition-colors duration-200 relative group"
              >
                ABOUT
                <motion.div
                  className="absolute -bottom-1 left-0 w-0 h-0.5 bg-secondary group-hover:w-full transition-all duration-300"
                />
              </Link>
            </motion.div>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {currentUser ? (
              <>
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/organizer-dashboard"
                    className="bg-accent text-primary px-4 py-2 border-2 border-primary shadow-brutal hover:shadow-brutal-hover transition-all duration-200 font-inter font-semibold relative overflow-hidden group"
                  >
                    <motion.div
                      className="absolute inset-0 bg-secondary opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                    />
                    <Settings className="inline h-4 w-4 mr-2" />
                    ORGANIZER
                  </Link>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/profile"
                    className="bg-background text-primary px-4 py-2 border-2 border-primary shadow-brutal hover:shadow-brutal-hover transition-all duration-200 font-inter font-semibold relative overflow-hidden group"
                  >
                    <motion.div
                      className="absolute inset-0 bg-accent opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                    />
                    <User className="inline h-4 w-4 mr-2" />
                    PROFILE
                  </Link>
                </motion.div>

                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="bg-secondary text-background px-4 py-2 border-2 border-primary shadow-brutal hover:shadow-brutal-hover transition-all duration-200 font-inter font-semibold relative overflow-hidden group"
                >
                  <motion.div
                    className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                  />
                  <LogOut className="inline h-4 w-4 mr-2" />
                  LOGOUT
                </motion.button>
              </>
            ) : (
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/auth"
                  className="bg-secondary text-background px-6 py-2 border-2 border-primary shadow-brutal hover:shadow-brutal-hover transition-all duration-200 font-inter font-semibold relative overflow-hidden group"
                >
                  <motion.div
                    className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                  />
                  LOGIN / SIGNUP
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}