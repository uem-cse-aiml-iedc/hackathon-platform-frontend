import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, CameraOff, Loader2, CheckCircle, AlertCircle, Play, RotateCcw } from 'lucide-react';
import QrScanner from 'qr-scanner';

interface QRScannerProps {
  onScanSuccess: (data: string) => void;
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
  const [lastScannedData, setLastScannedData] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const processedDataRef = useRef<Set<string>>(new Set());

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
      setIsProcessing(false);

      const hasCamera = await QrScanner.hasCamera();
      setHasCamera(hasCamera);

      if (!hasCamera) {
        setCameraError('No camera found on this device');
        setIsScanning(false);
        return;
      }

      qrScannerRef.current = new QrScanner(
        videoRef.current,
        (result) => {
          if (isProcessing || scanComplete) {
            return;
          }

          // MODIFIED: Replaced email regex validation with a simple check for any non-empty string.
          if (result.data && result.data.trim().length > 0) {
            const scannedData = result.data.trim();
            
            if (processedDataRef.current.has(scannedData)) {
              onScanError('This QR code has already been scanned in this session');
              return;
            }

            setIsProcessing(true);
            processedDataRef.current.add(scannedData);
            stopScanner();
            setLastScannedData(scannedData);
            setScanComplete(true);
            onScanSuccess(scannedData);
          } else {
            onScanError('Scanned QR code is empty or invalid');
          }
        },
        {
          returnDetailedScanResult: true,
          highlightScanRegion: true,
          highlightCodeOutline: true,
          maxScansPerSecond: 1,
        }
      );

      await qrScannerRef.current.start();
      setIsScanning(true);
    } catch (error: any) {
      setCameraError(error.message || 'Failed to access camera');
      setIsScanning(false);
      setIsProcessing(false);
      onScanError('Failed to access camera. Please check permissions.');
    }
  };

  const stopScanner = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
    setIsScanning(false);
  };

  const restartScanner = () => {
    setScanComplete(false);
    setLastScannedData(null);
    setCameraError(null);
    setIsProcessing(false);
  };

  const resetSession = () => {
    setScanComplete(false);
    setLastScannedData(null);
    setCameraError(null);
    setIsProcessing(false);
    processedDataRef.current.clear();
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
            
            {processedDataRef.current.size > 0 && (
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

        {processedDataRef.current.size > 0 && (
          <div className="mb-4 p-3 bg-accent/10 border-2 border-primary">
            <p className="font-inter text-primary text-sm">
              📊 <span className="font-semibold">{processedDataRef.current.size}</span> participant(s) scanned in this session
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
          <div className="bg-accent/10 border-2 border-accent p-6 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <CheckCircle className="h-16 w-16 text-accent mx-auto mb-4" />
            </motion.div>
            <h4 className="font-space font-bold text-xl text-primary mb-2">
              QR CODE SCANNED!
            </h4>
            <p className="font-inter text-primary/70 text-sm mb-4">
              Data detected: <span className="font-semibold text-primary">{lastScannedData}</span>
            </p>
            <div className="bg-background border-2 border-primary p-4 mb-4">
              <p className="font-inter text-primary text-sm">
                📱 Camera has been stopped. Click "SCAN NEXT" to continue.
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
            <li>• Scanner will automatically detect and process the data</li>
            <li>• Camera stops immediately after a successful scan</li>
            <li>• Click "SCAN NEXT" to scan another participant</li>
            <li>• Each unique QR code can only be scanned once per session</li>
            <li>• Use "RESET SESSION" to clear all scanned data</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
