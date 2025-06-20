import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { AuthService } from '../../services/authService';

const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

const otpSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d+$/, 'OTP must contain only numbers'),
});

type EmailFormData = z.infer<typeof emailSchema>;
type OTPFormData = z.infer<typeof otpSchema>;

export default function EmailOTPForm() {
  const [step, setStep] = useState<'email' | 'otp' | 'success'>('email');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [successData, setSuccessData] = useState<{ name: string; email: string } | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
  });

  const otpForm = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
  });

  const onEmailSubmit = async (data: EmailFormData) => {
    try {
      setIsLoading(true);
      setEmail(data.email);
      
      await AuthService.requestOTP(data.email);
      
      setStep('otp');
      emailForm.clearErrors();
      
      // Auto-focus first OTP input after a short delay
      setTimeout(() => {
        const firstInput = document.getElementById('otp-0');
        firstInput?.focus();
      }, 100);
    } catch (error: any) {
      emailForm.setError('root', {
        message: error.message || 'Failed to send OTP. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;

    const newOtpValues = [...otpValues];
    newOtpValues[index] = value;
    setOtpValues(newOtpValues);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }

    // Auto-submit when all fields are filled
    if (newOtpValues.every(val => val !== '') && newOtpValues.join('').length === 6) {
      handleOtpSubmit(newOtpValues.join(''));
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleOtpSubmit = async (otpValue: string) => {
    try {
      setIsLoading(true);
      
      const response = await AuthService.verifyOTP(email, otpValue);
      
      // Store user data in context
      login({
        email: response.email,
        name: response.name,
        authToken: response.authToken,
      });

      // Set success data for display
      setSuccessData({
        name: response.name,
        email: response.email,
      });

      setStep('success');
      otpForm.clearErrors();

      // Navigate to dashboard after showing success message
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      
    } catch (error: any) {
      otpForm.setError('root', {
        message: error.message || 'Invalid OTP. Please try again.',
      });
      setOtpValues(['', '', '', '', '', '']);
      const firstInput = document.getElementById('otp-0');
      firstInput?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setStep('email');
    setOtpValues(['', '', '', '', '', '']);
    otpForm.clearErrors();
  };

  const handleResendOTP = async () => {
    try {
      setIsLoading(true);
      await AuthService.requestOTP(email);
      setOtpValues(['', '', '', '', '', '']);
      otpForm.clearErrors();
      
      // Focus first input after resend
      setTimeout(() => {
        const firstInput = document.getElementById('otp-0');
        firstInput?.focus();
      }, 100);
    } catch (error: any) {
      otpForm.setError('root', {
        message: error.message || 'Failed to resend OTP. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-accent border-4 border-primary shadow-brutal p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <CheckCircle className="h-16 w-16 text-primary mx-auto mb-6" />
          </motion.div>
          
          <motion.h1 
            className="font-space font-bold text-3xl text-primary mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            WELCOME TO HACKNEST!
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <p className="font-inter text-primary/80 mb-2">
              Hello, <span className="font-semibold">{successData?.name}</span>!
            </p>
            <p className="font-inter text-primary/70 text-sm mb-6">
              You've successfully logged in with {successData?.email}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-primary/10 border-2 border-primary p-4 mb-6"
          >
            <p className="font-inter text-primary font-medium">
              🚀 Redirecting to your dashboard...
            </p>
          </motion.div>

          <motion.div
            className="w-full bg-primary/20 h-2 border border-primary overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <motion.div
              className="h-full bg-secondary"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ delay: 0.8, duration: 2, ease: "easeInOut" }}
            />
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md"
    >
      <div className="bg-background border-4 border-primary shadow-brutal p-8">
        <div className="text-center mb-8">
          <h1 className="font-space font-bold text-3xl text-primary mb-2">
            {step === 'email' ? 'JOIN HACKNEST' : 'VERIFY OTP'}
          </h1>
          <p className="font-inter text-primary/70">
            {step === 'email' 
              ? 'Enter your email to get started' 
              : `We've sent a 6-digit code to ${email}`
            }
          </p>
        </div>

        {step === 'email' ? (
          <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-6">
            <div>
              <label htmlFor="email" className="block font-inter font-semibold text-primary mb-2">
                EMAIL ADDRESS
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary/50" />
                <input
                  {...emailForm.register('email')}
                  type="email"
                  id="email"
                  className="w-full pl-10 pr-4 py-3 border-2 border-primary focus:border-secondary focus:outline-none font-inter bg-background"
                  placeholder="your@email.com"
                  disabled={isLoading}
                />
              </div>
              {emailForm.formState.errors.email && (
                <p className="mt-1 text-sm text-secondary font-inter">
                  {emailForm.formState.errors.email.message}
                </p>
              )}
            </div>

            {emailForm.formState.errors.root && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-secondary/10 border-2 border-secondary p-3"
              >
                <p className="text-secondary font-inter font-medium">
                  {emailForm.formState.errors.root.message}
                </p>
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full bg-secondary text-background py-3 px-4 border-2 border-primary shadow-brutal hover:shadow-brutal-hover transition-all duration-200 font-inter font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="spinner mr-2"></div>
                  SENDING OTP...
                </div>
              ) : (
                <>
                  SEND OTP
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </motion.button>
          </form>
        ) : (
          <div className="space-y-6">
            <div>
              <label className="block font-inter font-semibold text-primary mb-4">
                ENTER 6-DIGIT OTP
              </label>
              <div className="flex justify-center space-x-3 mb-4">
                {otpValues.map((value, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength={1}
                    value={value}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-12 h-12 text-center text-xl font-bold border-2 border-primary focus:border-secondary focus:outline-none bg-background transition-colors duration-200"
                    disabled={isLoading}
                  />
                ))}
              </div>
            </div>

            {otpForm.formState.errors.root && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-secondary/10 border-2 border-secondary p-3"
              >
                <p className="text-secondary font-inter font-medium">
                  {otpForm.formState.errors.root.message}
                </p>
              </motion.div>
            )}

            <div className="flex space-x-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleBackToEmail}
                disabled={isLoading}
                className="flex-1 bg-background text-primary py-3 px-4 border-2 border-primary shadow-brutal hover:shadow-brutal-hover transition-all duration-200 font-inter font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                BACK
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => handleOtpSubmit(otpValues.join(''))}
                disabled={isLoading || otpValues.some(val => val === '')}
                className="flex-1 bg-secondary text-background py-3 px-4 border-2 border-primary shadow-brutal hover:shadow-brutal-hover transition-all duration-200 font-inter font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="spinner mr-2"></div>
                    VERIFYING...
                  </div>
                ) : (
                  'VERIFY'
                )}
              </motion.button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={isLoading}
                className="font-inter text-secondary hover:underline disabled:opacity-50 transition-colors duration-200"
              >
                Didn't receive OTP? Resend
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}