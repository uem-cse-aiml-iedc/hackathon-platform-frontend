import React from 'react';
import { motion } from 'framer-motion';
import HackathonRegistration from '../components/registration/HackathonRegistration';

export default function HackathonRegistrationPage() {
  return (
    <div className="min-h-screen bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <HackathonRegistration />
      </motion.div>
    </div>
  );
}