import React from 'react';
import { motion } from 'framer-motion';
import EmailOTPForm from '../components/auth/EmailOTPForm';

export default function Auth() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-brutal py-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <EmailOTPForm />
      </motion.div>
    </div>
  );
}