import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Code2, LogOut, User, Settings, QrCode, Shield, Menu, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import GlitchText from '../ui/GlitchText';
import QRCodeModal from '../ui/QRCodeModal';

export default function Navigation() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const handleQRCodeClick = () => {
    setIsQRModalOpen(true);
    setIsMobileMenuOpen(false);
  };

  const closeQRModal = () => {
    setIsQRModalOpen(false);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <motion.nav 
        className="bg-background border-4 border-primary shadow-brutal backdrop-blur-sm bg-opacity-95 sticky top-0 z-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-brutal">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-shrink-0"
            >
              <Link to="/" className="flex items-center space-x-2">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <Code2 className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                </motion.div>
                <GlitchText 
                  text="HACKNEST"
                  className="font-space font-bold text-lg sm:text-xl text-primary"
                />
              </Link>
            </motion.div>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
              <motion.div whileHover={{ y: -2 }}>
                <Link 
                  to="/hackathons" 
                  className="font-inter font-medium text-primary hover:text-secondary transition-colors duration-200 relative group text-sm xl:text-base"
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
                  className="font-inter font-medium text-primary hover:text-secondary transition-colors duration-200 relative group text-sm xl:text-base"
                >
                  ABOUT
                  <motion.div
                    className="absolute -bottom-1 left-0 w-0 h-0.5 bg-secondary group-hover:w-full transition-all duration-300"
                  />
                </Link>
              </motion.div>
            </div>

            {/* Desktop User Actions */}
            <div className="hidden lg:flex items-center space-x-2 xl:space-x-4">
              {currentUser ? (
                <>
                  <motion.div
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      to="/organizer-dashboard"
                      className="bg-accent text-primary px-3 py-2 xl:px-4 xl:py-2 border-2 border-primary shadow-brutal hover:shadow-brutal-hover transition-all duration-200 font-inter font-semibold relative overflow-hidden group text-xs xl:text-sm"
                    >
                      <motion.div
                        className="absolute inset-0 bg-secondary opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                      />
                      <Settings className="inline h-3 w-3 xl:h-4 xl:w-4 mr-1 xl:mr-2" />
                      ORGANIZER
                    </Link>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <button
                      onClick={handleQRCodeClick}
                      className="bg-background text-primary px-3 py-2 xl:px-4 xl:py-2 border-2 border-primary shadow-brutal hover:shadow-brutal-hover transition-all duration-200 font-inter font-semibold relative overflow-hidden group text-xs xl:text-sm"
                      title="Show QR Code"
                    >
                      <motion.div
                        className="absolute inset-0 bg-accent opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                      />
                      <QrCode className="inline h-3 w-3 xl:h-4 xl:w-4 mr-1 xl:mr-2" />
                      QR CODE
                    </button>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      to="/profile"
                      className="bg-background text-primary px-3 py-2 xl:px-4 xl:py-2 border-2 border-primary shadow-brutal hover:shadow-brutal-hover transition-all duration-200 font-inter font-semibold relative overflow-hidden group text-xs xl:text-sm"
                    >
                      <motion.div
                        className="absolute inset-0 bg-accent opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                      />
                      <User className="inline h-3 w-3 xl:h-4 xl:w-4 mr-1 xl:mr-2" />
                      PROFILE
                    </Link>
                  </motion.div>

                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout}
                    className="bg-secondary text-background px-3 py-2 xl:px-4 xl:py-2 border-2 border-primary shadow-brutal hover:shadow-brutal-hover transition-all duration-200 font-inter font-semibold relative overflow-hidden group text-xs xl:text-sm"
                  >
                    <motion.div
                      className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                    />
                    <LogOut className="inline h-3 w-3 xl:h-4 xl:w-4 mr-1 xl:mr-2" />
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
                    className="bg-secondary text-background px-4 py-2 xl:px-6 xl:py-2 border-2 border-primary shadow-brutal hover:shadow-brutal-hover transition-all duration-200 font-inter font-semibold relative overflow-hidden group text-xs xl:text-sm"
                  >
                    <motion.div
                      className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                    />
                    LOGIN / SIGNUP
                  </Link>
                </motion.div>
              )}

              {/* Volunteer Button - Always visible */}
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/volunteer"
                  className="bg-accent text-primary px-3 py-2 xl:px-4 xl:py-2 border-2 border-primary shadow-brutal hover:shadow-brutal-hover transition-all duration-200 font-inter font-semibold relative overflow-hidden group text-xs xl:text-sm"
                >
                  <motion.div
                    className="absolute inset-0 bg-secondary opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                  />
                  <Shield className="inline h-3 w-3 xl:h-4 xl:w-4 mr-1 xl:mr-2" />
                  <span className="hidden xl:inline">I AM A </span>VOLUNTEER
                </Link>
              </motion.div>
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="bg-background text-primary p-2 border-2 border-primary shadow-brutal hover:shadow-brutal-hover transition-all duration-200"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden border-t-2 border-primary bg-background"
            >
              <div className="px-4 py-4 space-y-4">
                {/* Mobile Navigation Links */}
                <div className="space-y-3">
                  <Link 
                    to="/hackathons" 
                    onClick={closeMobileMenu}
                    className="block font-inter font-medium text-primary hover:text-secondary transition-colors duration-200 py-2 border-b border-primary/20"
                  >
                    HACKATHONS
                  </Link>
                  <Link 
                    to="/about" 
                    onClick={closeMobileMenu}
                    className="block font-inter font-medium text-primary hover:text-secondary transition-colors duration-200 py-2 border-b border-primary/20"
                  >
                    ABOUT
                  </Link>
                </div>

                {/* Mobile User Actions */}
                <div className="space-y-3 pt-4 border-t border-primary/20">
                  {currentUser ? (
                    <>
                      <Link
                        to="/organizer-dashboard"
                        onClick={closeMobileMenu}
                        className="flex items-center bg-accent text-primary px-4 py-3 border-2 border-primary shadow-brutal font-inter font-semibold w-full"
                      >
                        <Settings className="h-4 w-4 mr-3" />
                        ORGANIZER DASHBOARD
                      </Link>

                      <button
                        onClick={handleQRCodeClick}
                        className="flex items-center bg-background text-primary px-4 py-3 border-2 border-primary shadow-brutal font-inter font-semibold w-full"
                      >
                        <QrCode className="h-4 w-4 mr-3" />
                        SHOW QR CODE
                      </button>
                      
                      <Link
                        to="/profile"
                        onClick={closeMobileMenu}
                        className="flex items-center bg-background text-primary px-4 py-3 border-2 border-primary shadow-brutal font-inter font-semibold w-full"
                      >
                        <User className="h-4 w-4 mr-3" />
                        MY PROFILE
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="flex items-center bg-secondary text-background px-4 py-3 border-2 border-primary shadow-brutal font-inter font-semibold w-full"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        LOGOUT
                      </button>
                    </>
                  ) : (
                    <Link
                      to="/auth"
                      onClick={closeMobileMenu}
                      className="flex items-center justify-center bg-secondary text-background px-4 py-3 border-2 border-primary shadow-brutal font-inter font-semibold w-full"
                    >
                      LOGIN / SIGNUP
                    </Link>
                  )}

                  {/* Volunteer Button - Mobile */}
                  <Link
                    to="/volunteer"
                    onClick={closeMobileMenu}
                    className="flex items-center bg-accent text-primary px-4 py-3 border-2 border-primary shadow-brutal font-inter font-semibold w-full"
                  >
                    <Shield className="h-4 w-4 mr-3" />
                    I AM A VOLUNTEER
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* QR Code Modal */}
      {currentUser && (
        <QRCodeModal
          isOpen={isQRModalOpen}
          onClose={closeQRModal}
          email={currentUser.email}
          userName={currentUser.name}
        />
      )}

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={closeMobileMenu}
          />
        )}
      </AnimatePresence>
    </>
  );
}