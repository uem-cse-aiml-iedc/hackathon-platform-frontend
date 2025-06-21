import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Copy, Check, QrCode, Mail, User, Sparkles } from 'lucide-react';
import QRCode from 'qrcode';
import { useToast } from '../../contexts/ToastContext';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  userName: string;
}

export default function QRCodeModal({ isOpen, onClose, email, userName }: QRCodeModalProps) {
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    if (isOpen && email) {
      generateQRCode();
    }
  }, [isOpen, email]);

  const generateQRCode = async () => {
    try {
      setIsGenerating(true);
      
      // Generate QR code with email
      const qrDataURL = await QRCode.toDataURL(email, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });
      
      setQrCodeDataURL(qrDataURL);
    } catch (error) {
      console.error('Error generating QR code:', error);
      showError('QR Code Error', 'Failed to generate QR code');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      showSuccess('Copied!', 'Email address copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      showError('Copy Failed', 'Unable to copy email address');
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeDataURL) return;

    const link = document.createElement('a');
    link.download = `hacknest-qr-${email.replace('@', '-at-')}.png`;
    link.href = qrCodeDataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showSuccess('Downloaded!', 'QR code saved to your device');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="bg-background border-4 border-primary shadow-brutal max-w-md w-full relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-secondary via-accent to-secondary p-6 border-b-4 border-primary relative overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                animate={{ x: [-100, 400] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
              
              <div className="relative z-10 flex justify-between items-start">
                <div className="flex-1 pr-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    >
                      <QrCode className="h-8 w-8 text-background" />
                    </motion.div>
                    <h1 className="font-space font-bold text-2xl text-background">
                      YOUR QR CODE
                    </h1>
                  </div>
                  
                  <p className="font-inter text-background/90 text-sm">
                    Share your contact information instantly
                  </p>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="bg-background/20 text-background p-2 border-2 border-background/30 shadow-brutal-sm hover:bg-background/30 transition-all duration-200 backdrop-blur-sm"
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 text-center">
              {/* User Info */}
              <div className="mb-6">
                <div className="bg-accent/10 border-2 border-primary p-4 mb-4">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <User className="h-5 w-5 text-primary" />
                    <span className="font-space font-bold text-lg text-primary">
                      {userName}
                    </span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <Mail className="h-4 w-4 text-primary/70" />
                    <span className="font-inter text-primary/70 text-sm">
                      {email}
                    </span>
                  </div>
                </div>
              </div>

              {/* QR Code */}
              <div className="mb-6">
                {isGenerating ? (
                  <div className="bg-primary/5 border-2 border-primary p-8 flex flex-col items-center justify-center h-80">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="mb-4"
                    >
                      <Sparkles className="h-12 w-12 text-secondary" />
                    </motion.div>
                    <h3 className="font-space font-bold text-xl text-primary mb-2">
                      GENERATING QR CODE
                    </h3>
                    <p className="font-inter text-primary/70 text-sm">
                      Please wait while we create your QR code...
                    </p>
                  </div>
                ) : qrCodeDataURL ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-background border-4 border-primary shadow-brutal p-6 inline-block"
                  >
                    <img 
                      src={qrCodeDataURL} 
                      alt="QR Code" 
                      className="w-64 h-64 mx-auto"
                    />
                    <div className="mt-4 pt-4 border-t-2 border-primary">
                      <p className="font-inter text-primary/70 text-xs">
                        Scan to get contact information
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <div className="bg-secondary/10 border-2 border-secondary p-8 h-80 flex items-center justify-center">
                    <div className="text-center">
                      <QrCode className="h-16 w-16 text-secondary/50 mx-auto mb-4" />
                      <h3 className="font-space font-bold text-xl text-secondary mb-2">
                        QR CODE ERROR
                      </h3>
                      <p className="font-inter text-primary/70 text-sm">
                        Failed to generate QR code
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {qrCodeDataURL && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-col space-y-3"
                >
                  <div className="flex space-x-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={copyEmail}
                      className="flex-1 bg-accent text-primary py-3 px-4 border-2 border-primary shadow-brutal-sm hover:shadow-brutal transition-all duration-200 font-inter font-bold flex items-center justify-center"
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          COPIED!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          COPY EMAIL
                        </>
                      )}
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={downloadQRCode}
                      className="flex-1 bg-secondary text-background py-3 px-4 border-2 border-primary shadow-brutal-sm hover:shadow-brutal transition-all duration-200 font-inter font-bold flex items-center justify-center"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      DOWNLOAD
                    </motion.button>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onClose}
                    className="w-full bg-background text-primary py-3 px-4 border-2 border-primary shadow-brutal-sm hover:shadow-brutal transition-all duration-200 font-inter font-semibold"
                  >
                    CLOSE
                  </motion.button>
                </motion.div>
              )}
            </div>

            {/* Info Footer */}
            <div className="border-t-2 border-primary p-4 bg-primary/5">
              <div className="flex items-center justify-center space-x-2">
                <QrCode className="h-4 w-4 text-primary/50" />
                <p className="font-inter text-primary/70 text-xs text-center">
                  QR code contains your email address for easy sharing
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}