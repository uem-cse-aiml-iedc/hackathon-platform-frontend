import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, CameraOff, Loader2, CheckCircle, AlertCircle, Play, RotateCcw } from 'lucide-react';
import QrScanner from 'qr-scanner';

interface QRScannerProps {
  onScanSuccess: (email: string) => void;
  onScanError: (error: string) => void;
  isActive: boolean;
}

export default function QRScanner({ onScanSuccess, onScanError, isActive }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasCamera, setHasCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanComplete, setScanComplete] = useState(false);
  const [lastScannedEmail, setLastScannedEmail] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false); // New state to prevent multiple scans
  const processedEmailsRef = useRef<Set<string>>(new Set()); // Track processed emails

  useEffect(() => {
    if (isActive && !scanComplete) {
      initializeScanner();
    } else {
      stopScanner();
    }

    return () => {
      stopScanner();
    };
  }, [isActive, scanComplete]);

  const initializeScanner = async () => {
    if (!videoRef.current) return;

    try {
      setIsScanning(true);
      setCameraError(null);
      setIsProcessing(false); // Reset processing state

      // Check if camera is available
      const hasCamera = await QrScanner.hasCamera();
      setHasCamera(hasCamera);

      if (!hasCamera) {
        setCameraError('No camera found on this device');
        setIsScanning(false);
        return;
      }

      // Initialize QR Scanner
      qrScannerRef.current = new QrScanner(
        videoRef.current,
        (result) => {
          console.log('QR Code detected:', result.data);
          
          // Prevent multiple processing of the same scan
          if (isProcessing || scanComplete) {
            console.log('Already processing or scan complete, ignoring...');
            return;
          }

          // Validate if the scanned data is an email
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (emailRegex.test(result.data)) {
            const email = result.data.trim().toLowerCase();
            
            // Check if this email was already processed in this session
            if (processedEmailsRef.current.has(email)) {
              console.log('Email already processed in this session:', email);
              onScanError('This participant has already been scanned in this session');
              return;
            }

            // Set processing state immediately to prevent duplicate scans
            setIsProcessing(true);
            console.log('Processing email:', email);
            
            // Add to processed emails
            processedEmailsRef.current.add(email);
            
            // Stop scanner immediately
            stopScanner();
            
            // Set scan complete state
            setLastScannedEmail(email);
            setScanComplete(true);
            
            // Call success callback
            onScanSuccess(email);
          } else {
            onScanError('Scanned QR code does not contain a valid email address');
          }
        },
        {
          returnDetailedScanResult: true,
          highlightScanRegion: true,
          highlightCodeOutline: true,
          maxScansPerSecond: 1, // Limit scan frequency
        }
      );

      await qrScannerRef.current.start();
      setIsScanning(true);
      console.log('QR Scanner started successfully');
    } catch (error: any) {
      console.error('Error initializing QR scanner:', error);
      setCameraError(error.message || 'Failed to access camera');
      setIsScanning(false);
      setIsProcessing(false);
      onScanError('Failed to access camera. Please check permissions.');
    }
  };

  const stopScanner = () => {
    if (qrScannerRef.current) {
      console.log('Stopping QR scanner...');
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
    setIsScanning(false);
  };

  const restartScanner = () => {
    console.log('Restarting scanner for next participant...');
    setScanComplete(false);
    setLastScannedEmail(null);
    setCameraError(null);
    setIsProcessing(false);
    // Note: We don't clear processedEmailsRef to prevent re-scanning same emails
  };

  const resetSession = () => {
    console.log('Resetting entire scanning session...');
    setScanComplete(false);
    setLastScannedEmail(null);
    setCameraError(null);
    setIsProcessing(false);
    processedEmailsRef.current.clear(); // Clear processed emails for new session
  };

  return (
    <div className="relative">
      <div className="bg-background border-4 border-primary shadow-brutal p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-space font-bold text-xl text-primary flex items-center">
            <Camera className="h-6 w-6 mr-2" />
            QR CODE SCANNER
          </h3>
          
          <div className="flex space-x-2">
            {scanComplete && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={restartScanner}
                className="bg-accent text-primary px-4 py-2 border-2 border-primary shadow-brutal-sm hover:shadow-brutal transition-all duration-200 font-inter font-semibold flex items-center"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                SCAN NEXT
              </motion.button>
            )}
            
            {processedEmailsRef.current.size > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={resetSession}
                className="bg-secondary text-background px-4 py-2 border-2 border-primary shadow-brutal-sm hover:shadow-brutal transition-all duration-200 font-inter font-semibold flex items-center text-sm"
              >
                RESET SESSION
              </motion.button>
            )}
          </div>
        </div>

        {/* Session Info */}
        {processedEmailsRef.current.size > 0 && (
          <div className="mb-4 p-3 bg-accent/10 border-2 border-primary">
            <p className="font-inter text-primary text-sm">
              📊 <span className="font-semibold">{processedEmailsRef.current.size}</span> participant(s) scanned in this session
            </p>
          </div>
        )}

        {cameraError ? (
          <div className="bg-secondary/10 border-2 border-secondary p-6 text-center">
            <CameraOff className="h-12 w-12 text-secondary mx-auto mb-4" />
            <h4 className="font-space font-bold text-lg text-secondary mb-2">
              CAMERA ERROR
            </h4>
            <p className="font-inter text-primary/70 text-sm mb-4">
              {cameraError}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={restartScanner}
              className="bg-secondary text-background px-4 py-2 border-2 border-primary shadow-brutal-sm hover:shadow-brutal transition-all duration-200 font-inter font-semibold"
            >
              TRY AGAIN
            </motion.button>
          </div>
        ) : scanComplete ? (
          /* Scan Complete State */
          <div className="bg-accent/10 border-2 border-accent p-6 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <CheckCircle className="h-16 w-16 text-accent mx-auto mb-4" />
            </motion.div>
            <h4 className="font-space font-bold text-xl text-primary mb-2">
              QR CODE SCANNED SUCCESSFULLY!
            </h4>
            <p className="font-inter text-primary/70 text-sm mb-4">
              Email detected: <span className="font-semibold text-primary">{lastScannedEmail}</span>
            </p>
            <div className="bg-background border-2 border-primary p-4 mb-4">
              <p className="font-inter text-primary text-sm">
                📱 Camera has been stopped. Click "SCAN NEXT" to scan another participant's QR code.
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={restartScanner}
              className="bg-accent text-primary px-6 py-3 border-2 border-primary shadow-brutal hover:shadow-brutal-hover transition-all duration-200 font-inter font-bold flex items-center mx-auto"
            >
              <Play className="h-5 w-5 mr-2" />
              SCAN NEXT PARTICIPANT
            </motion.button>
          </div>
        ) : (
          <div className="relative">
            <video
              ref={videoRef}
              className="w-full h-64 bg-primary/10 border-2 border-primary object-cover"
              playsInline
              muted
            />
            
            {/* Scanning Overlay */}
            {isScanning && !isProcessing && (
              <motion.div
                className="absolute inset-0 border-4 border-accent"
                animate={{
                  boxShadow: [
                    '0 0 0 0 rgba(0, 255, 0, 0.7)',
                    '0 0 0 10px rgba(0, 255, 0, 0)',
                    '0 0 0 0 rgba(0, 255, 0, 0.7)',
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-background/90 border-2 border-primary px-4 py-2">
                    <div className="flex items-center space-x-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <Loader2 className="h-5 w-5 text-accent" />
                      </motion.div>
                      <span className="font-inter font-semibold text-primary text-sm">
                        SCANNING FOR QR CODE...
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Processing Overlay */}
            {isProcessing && (
              <div className="absolute inset-0 bg-accent/20 flex items-center justify-center">
                <div className="bg-background border-2 border-primary p-4">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-5 w-5 text-accent animate-spin" />
                    <span className="font-inter font-semibold text-primary text-sm">
                      PROCESSING SCAN...
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Loading State */}
            {!isScanning && isActive && !cameraError && !scanComplete && !isProcessing && (
              <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                <div className="bg-background border-2 border-primary p-4">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-5 w-5 text-secondary animate-spin" />
                    <span className="font-inter font-semibold text-primary text-sm">
                      INITIALIZING CAMERA...
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-4 p-4 bg-accent/10 border-2 border-primary">
          <h4 className="font-inter font-bold text-primary mb-2">SCANNING WORKFLOW:</h4>
          <ul className="font-inter text-primary/70 text-sm space-y-1">
            <li>• Point the camera at the participant's QR code</li>
            <li>• Scanner will automatically detect and process the email (ONE TIME ONLY)</li>
            <li>• Camera stops immediately after successful scan</li>
            <li>• Click "SCAN NEXT" to scan another participant</li>
            <li>• Each email can only be scanned once per session</li>
            <li>• Use "RESET SESSION" to clear all scanned emails</li>
          </ul>
        </div>
      </div>
    </div>
  );
}