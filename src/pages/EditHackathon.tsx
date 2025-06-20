import React from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import HackathonEditor from '../components/dashboard/HackathonEditor';

export default function EditHackathon() {
  const { hackathonId } = useParams<{ hackathonId: string }>();

  if (!hackathonId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-space font-bold text-2xl text-primary mb-4">
            HACKATHON NOT FOUND
          </h1>
          <p className="font-inter text-primary/70">
            The hackathon ID is missing or invalid.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-brutal py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <HackathonEditor hackathonId={hackathonId} />
        </motion.div>
      </div>
    </div>
  );
}