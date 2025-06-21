import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Shield, 
  QrCode, 
  Mail, 
  ArrowLeft, 
  Scan, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  UserCheck,
  Package,
  Eye,
  EyeOff,
  Copy,
  Check
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import { VolunteerService } from '../services/volunteerService';
import QRScanner from '../components/volunteer/QRScanner';

const dutyCodeSchema = z.object({
  dutyCode: z.string().min(1, 'Duty code is required'),
});

const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type DutyCodeFormData = z.infer<typeof dutyCodeSchema>;
type EmailFormData = z.infer<typeof emailSchema>;

export default function Volunteer() {
  const [step, setStep] = useState<'duty-code' | 'scanner'>('duty-code');
  const [dutyCode, setDutyCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scanMode, setScanMode] = useState<'qr' | 'manual'>('qr');
  const [showDutyCode, setShowDutyCode] = useState(false);
  const [copiedDutyCode, setCopiedDutyCode] = useState(false);
  const { showSuccess, showError } = useToast();

  const dutyCodeForm = useForm<DutyCodeFormData>({
    resolver: zodResolver(dutyCodeSchema),
  });

  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
  });

  const handleDutyCodeSubmit = (data: DutyCodeFormData) => {
    setDutyCode(data.dutyCode);
    setStep('scanner');
    showSuccess('Duty Code Bound!', 'You can now scan QR codes or enter emails manually');
  };

  const handleQRScanSuccess = async (email: string) => {
    await assignLogistics(email);
  };

  const handleQRScanError = (error: string) => {
    showError('QR Scan Error', error);
  };

  const handleEmailSubmit = async (data: EmailFormData) => {
    await assignLogistics(data.email);
  };

  const assignLogistics = async (email: string) => {
    if (!dutyCode) {
      showError('Error', 'Duty code is required');
      return;
    }

    try {
      setIsSubmitting(true);

      await VolunteerService.assignLogistics({
        secretCode: dutyCode,
        email: email,
      });

      showSuccess(
        'Logistics Assigned Successfully! 🎉',
        `Logistics has been given to ${email}`
      );

      // Reset email form for next participant
      emailForm.reset();

    } catch (error: any) {
      showError(
        'Assignment Failed',
        error.message || 'Failed to assign logistics to participant'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyDutyCode = async () => {
    try {
      await navigator.clipboard.writeText(dutyCode);
      setCopiedDutyCode(true);
      showSuccess('Copied!', 'Duty code copied to clipboard');
      setTimeout(() => setCopiedDutyCode(false), 2000);
    } catch (error) {
      showError('Copy Failed', 'Unable to copy duty code');
    }
  };

  const resetDutyCode = () => {
    setStep('duty-code');
    setDutyCode('');
    dutyCodeForm.reset();
    emailForm.reset();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-brutal py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <motion.div
              whileHover={{ scale: 1.05, x: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/"
                className="inline-flex items-center bg-background text-primary px-6 py-3 border-2 border-primary shadow-brutal hover:shadow-brutal-hover transition-all duration-200 font-inter font-semibold relative overflow-hidden group"
              >
                <motion.div
                  className="absolute inset-0 bg-accent opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                />
                <ArrowLeft className="mr-3 h-5 w-5 relative z-10" />
                <span className="relative z-10">BACK TO HOME</span>
              </Link>
            </motion.div>
          </motion.div>

          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-r from-secondary via-accent to-secondary border-4 border-primary shadow-brutal p-6 mb-6 relative overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                animate={{ x: [-100, 400] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
              
              <div className="relative z-10">
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  >
                    <Shield className="h-8 w-8 text-background" />
                  </motion.div>
                  <h1 className="font-space font-bold text-3xl text-background">
                    VOLUNTEER PORTAL
                  </h1>
                </div>
                <p className="font-inter text-background/90">
                  Manage logistics distribution for hackathon participants
                </p>
              </div>
            </motion.div>
          </div>

          {step === 'duty-code' ? (
            /* Duty Code Input */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-background border-4 border-primary shadow-brutal p-8"
            >
              <div className="text-center mb-8">
                <h2 className="font-space font-bold text-2xl text-primary mb-4">
                  DEPLOY YOUR DUTY CODE
                </h2>
                <p className="font-inter text-primary/70">
                  Enter the secret duty code provided by the organizers to start distributing logistics
                </p>
              </div>

              <form onSubmit={dutyCodeForm.handleSubmit(handleDutyCodeSubmit)} className="space-y-6">
                <div>
                  <label htmlFor="dutyCode" className="block font-inter font-semibold text-primary mb-2">
                    DUTY CODE *
                  </label>
                  <div className="relative">
                    <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary/50" />
                    <input
                      {...dutyCodeForm.register('dutyCode')}
                      type="text"
                      id="dutyCode"
                      className={`w-full pl-10 pr-4 py-3 border-2 focus:outline-none font-inter bg-background text-center font-mono text-lg ${
                        dutyCodeForm.formState.errors.dutyCode 
                          ? 'border-secondary focus:border-secondary' 
                          : 'border-primary focus:border-secondary'
                      }`}
                      placeholder="Enter your duty code"
                      disabled={isSubmitting}
                    />
                    {dutyCodeForm.formState.errors.dutyCode && (
                      <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary" />
                    )}
                  </div>
                  {dutyCodeForm.formState.errors.dutyCode && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-1 text-sm text-secondary font-inter flex items-center space-x-1"
                    >
                      <AlertCircle className="h-4 w-4" />
                      <span>{dutyCodeForm.formState.errors.dutyCode.message}</span>
                    </motion.p>
                  )}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-secondary text-background py-4 px-6 border-2 border-primary shadow-brutal hover:shadow-brutal-hover transition-all duration-200 font-inter font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                      BINDING...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <UserCheck className="mr-3 h-6 w-6" />
                      BIND DUTY CODE
                    </div>
                  )}
                </motion.button>
              </form>

              <div className="mt-8 p-4 bg-accent/10 border-2 border-primary">
                <h3 className="font-inter font-bold text-primary mb-2">VOLUNTEER INSTRUCTIONS:</h3>
                <ul className="font-inter text-primary/70 text-sm space-y-1">
                  <li>• Get your duty code from the hackathon organizers</li>
                  <li>• Each duty code corresponds to specific logistics items</li>
                  <li>• Once bound, you can scan participant QR codes or enter emails manually</li>
                  <li>• Each participant can only receive logistics once per item</li>
                </ul>
              </div>
            </motion.div>
          ) : (
            /* Scanner Interface */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-8"
            >
              {/* Duty Code Display */}
              <div className="bg-accent/20 border-2 border-primary shadow-brutal p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-space font-bold text-xl text-primary mb-2">
                      ACTIVE DUTY CODE
                    </h3>
                    <div className="flex items-center space-x-4">
                      <div className="bg-background border-2 border-primary px-4 py-2">
                        <span className="font-mono font-bold text-lg text-primary">
                          {showDutyCode ? dutyCode : '••••••••••••••••'}
                        </span>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setShowDutyCode(!showDutyCode)}
                        className="bg-background text-primary p-2 border-2 border-primary shadow-brutal-sm hover:shadow-brutal transition-all duration-200"
                        title={showDutyCode ? "Hide Duty Code" : "Show Duty Code"}
                      >
                        {showDutyCode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={copyDutyCode}
                        className="bg-accent text-primary p-2 border-2 border-primary shadow-brutal-sm hover:shadow-brutal transition-all duration-200"
                        title="Copy Duty Code"
                      >
                        {copiedDutyCode ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </motion.button>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={resetDutyCode}
                    className="bg-secondary text-background px-4 py-2 border-2 border-primary shadow-brutal-sm hover:shadow-brutal transition-all duration-200 font-inter font-semibold"
                  >
                    CHANGE CODE
                  </motion.button>
                </div>
              </div>

              {/* Mode Toggle */}
              <div className="bg-background border-4 border-primary shadow-brutal">
                <div className="border-b-2 border-primary">
                  <div className="flex">
                    <button
                      onClick={() => setScanMode('qr')}
                      className={`flex-1 px-6 py-4 font-inter font-semibold border-r-2 border-primary transition-colors duration-200 ${
                        scanMode === 'qr'
                          ? 'bg-accent text-primary'
                          : 'bg-background text-primary/70 hover:bg-accent/20'
                      }`}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <QrCode className="h-5 w-5" />
                        <span>QR SCANNER</span>
                      </div>
                    </button>
                    <button
                      onClick={() => setScanMode('manual')}
                      className={`flex-1 px-6 py-4 font-inter font-semibold transition-colors duration-200 ${
                        scanMode === 'manual'
                          ? 'bg-accent text-primary'
                          : 'bg-background text-primary/70 hover:bg-accent/20'
                      }`}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <Mail className="h-5 w-5" />
                        <span>MANUAL INPUT</span>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="p-8">
                  {scanMode === 'qr' ? (
                    <QRScanner
                      onScanSuccess={handleQRScanSuccess}
                      onScanError={handleQRScanError}
                      isActive={true}
                    />
                  ) : (
                    <div className="bg-background border-4 border-primary shadow-brutal p-6">
                      <h3 className="font-space font-bold text-xl text-primary mb-4 flex items-center">
                        <Mail className="h-6 w-6 mr-2" />
                        MANUAL EMAIL INPUT
                      </h3>

                      <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)} className="space-y-6">
                        <div>
                          <label htmlFor="email" className="block font-inter font-semibold text-primary mb-2">
                            PARTICIPANT EMAIL *
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary/50" />
                            <input
                              {...emailForm.register('email')}
                              type="email"
                              id="email"
                              className={`w-full pl-10 pr-4 py-3 border-2 focus:outline-none font-inter bg-background ${
                                emailForm.formState.errors.email 
                                  ? 'border-secondary focus:border-secondary' 
                                  : 'border-primary focus:border-secondary'
                              }`}
                              placeholder="participant@example.com"
                              disabled={isSubmitting}
                            />
                            {emailForm.formState.errors.email && (
                              <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary" />
                            )}
                          </div>
                          {emailForm.formState.errors.email && (
                            <motion.p 
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-1 text-sm text-secondary font-inter flex items-center space-x-1"
                            >
                              <AlertCircle className="h-4 w-4" />
                              <span>{emailForm.formState.errors.email.message}</span>
                            </motion.p>
                          )}
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full bg-secondary text-background py-4 px-6 border-2 border-primary shadow-brutal hover:shadow-brutal-hover transition-all duration-200 font-inter font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                          {isSubmitting ? (
                            <div className="flex items-center">
                              <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                              ASSIGNING...
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <CheckCircle className="mr-3 h-6 w-6" />
                              ASSIGN LOGISTICS
                            </div>
                          )}
                        </motion.button>
                      </form>

                      <div className="mt-6 p-4 bg-accent/10 border-2 border-primary">
                        <h4 className="font-inter font-bold text-primary mb-2">MANUAL INPUT GUIDE:</h4>
                        <ul className="font-inter text-primary/70 text-sm space-y-1">
                          <li>• Use this when QR scanning is not possible</li>
                          <li>• Ask participant for their registered email address</li>
                          <li>• Double-check the email before submitting</li>
                          <li>• System will validate if participant is registered</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}