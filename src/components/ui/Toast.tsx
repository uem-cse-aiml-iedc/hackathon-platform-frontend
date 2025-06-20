import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning';
  title: string;
  message: string;
  duration?: number;
  onClose: (id: string) => void;
}

export default function Toast({ id, type, title, message, duration = 5000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-6 w-6 text-accent" />;
      case 'error':
        return <XCircle className="h-6 w-6 text-secondary" />;
      case 'warning':
        return <AlertCircle className="h-6 w-6 text-secondary" />;
      default:
        return <CheckCircle className="h-6 w-6 text-accent" />;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return 'border-accent';
      case 'error':
        return 'border-secondary';
      case 'warning':
        return 'border-secondary';
      default:
        return 'border-accent';
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-accent/90'; // Increased opacity for better readability
      case 'error':
        return 'bg-secondary/90'; // Increased opacity for better readability
      case 'warning':
        return 'bg-secondary/90'; // Increased opacity for better readability
      default:
        return 'bg-accent/90';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-primary'; // Dark text on light green background
      case 'error':
        return 'text-background'; // White text on red background
      case 'warning':
        return 'text-background'; // White text on red background
      default:
        return 'text-primary';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.8 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`${getBgColor()} ${getBorderColor()} border-4 shadow-brutal p-4 max-w-md relative overflow-hidden group`}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        animate={{ x: [-100, 400] }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      />
      
      <div className="flex items-start space-x-3 relative z-10">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className={`font-space font-bold text-sm mb-1 ${getTextColor()}`}>
            {title}
          </h4>
          <p className={`font-inter text-sm ${getTextColor()} opacity-90`}>
            {message}
          </p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onClose(id)}
          className={`flex-shrink-0 bg-background p-1 border-2 border-primary shadow-brutal-sm hover:shadow-brutal transition-all duration-200 ${
            type === 'success' ? 'text-primary' : 'text-primary'
          }`}
        >
          <X className="h-4 w-4" />
        </motion.button>
      </div>
      
      {/* Progress bar */}
      <motion.div
        className="absolute bottom-0 left-0 h-1 bg-primary/20"
        style={{ width: '100%' }}
      >
        <motion.div
          className={`h-full ${type === 'success' ? 'bg-primary' : 'bg-background'}`}
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: duration / 1000, ease: "linear" }}
        />
      </motion.div>
    </motion.div>
  );
}