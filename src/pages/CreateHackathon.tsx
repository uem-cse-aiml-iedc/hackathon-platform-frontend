import React from 'react';
import { motion } from 'framer-motion';
import HackathonCreator from '../components/dashboard/HackathonCreator';

export default function CreateHackathon() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-brutal py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <HackathonCreator />
        </motion.div>
      </div>
    </div>
  );
}