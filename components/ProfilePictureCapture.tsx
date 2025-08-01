import React, { useState, useRef, useCallback } from 'react';
import { Camera, CameraOff, RotateCcw, Upload, User, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cameraService } from '../services/cameraService';

interface ProfilePictureCaptureProps {
  onImageCapture: (imageData: string) => void;
  currentImage?: string;
  className?: string;
}

const ProfilePictureCapture: React.FC<ProfilePictureCaptureProps> = ({
  onImageCapture,
  currentImage,
  className = ''
}) => {
  const [showCamera, setShowCamera] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const requestCameraPermission = useCallback(async () => {
    const permission = await cameraService.requestCameraPermission();
    setCameraPermission(permission.granted);
    if (!permission.granted) {
      setError(permission.error || 'Camera permission denied');
    }
    return permission.granted;
  }, []);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const cameraStream = await cameraService.startCameraStream(facingMode);
      if (cameraStream && videoRef.current) {
        videoRef.current.srcObject = cameraStream.stream;
        setIsCameraActive(true);
      } else {
        setError('Failed to start camera stream');
      }
    } catch (err) {
      console.error("Error starting camera:", err);
      setError("Could not start the camera. Please check your permissions.");
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    cameraService.stopCameraStream();
    setIsCameraActive(false);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const switchCamera = useCallback(async () => {
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacingMode);
    
    if (isCameraActive) {
      const cameraStream = await cameraService.switchCamera();
      if (cameraStream && videoRef.current) {
        videoRef.current.srcObject = cameraStream.stream;
      }
    }
  }, [facingMode, isCameraActive]);

  const handleOpenCamera = async () => {
    setShowCamera(true);
    const isAvailable = await cameraService.isCameraAvailable();
    if (!isAvailable) {
      setError('No camera device found');
      return;
    }
    
    const hasPermission = await requestCameraPermission();
    if (hasPermission) {
      await startCamera();
    }
  };

  const handleCloseCamera = () => {
    stopCamera();
    setShowCamera(false);
    setCameraPermission(null);
    setError(null);
  };

  const handleCapture = () => {
    if (!videoRef.current) return;
    
    const capture = cameraService.captureWithFlash(videoRef.current);
    if (capture) {
      onImageCapture(capture.imageData);
      handleCloseCamera();
    } else {
      setError('Failed to capture image');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onImageCapture(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    onImageCapture('');
  };

  return (
    <div className={`relative ${className}`}>
      {/* Profile Picture Display */}
      <div className="relative w-32 h-32 mx-auto mb-4">
        <div className="w-full h-full rounded-full border-4 border-gray-700 bg-gray-800 overflow-hidden flex items-center justify-center">
          {currentImage ? (
            <img
              src={currentImage}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-12 h-12 text-gray-500" />
          )}
        </div>
        
        {currentImage && (
          <motion.button
            onClick={handleRemoveImage}
            className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X className="w-4 h-4" />
          </motion.button>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 justify-center">
        <motion.button
          type="button"
          onClick={handleOpenCamera}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Camera className="w-4 h-4" />
          Camera
        </motion.button>
        
        <motion.button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Upload className="w-4 h-4" />
          Upload
        </motion.button>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Camera Modal */}
      <AnimatePresence>
        {showCamera && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-2xl p-6 max-w-md w-full"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">Take Profile Picture</h3>
                <button
                  onClick={handleCloseCamera}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {error && (
                <div className="text-red-400 bg-red-900/20 p-3 rounded-lg mb-4 flex items-center gap-2">
                  <CameraOff className="h-4 w-4" />
                  {error}
                  {cameraPermission === false && (
                    <button
                      onClick={requestCameraPermission}
                      className="ml-2 px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                    >
                      Retry
                    </button>
                  )}
                </div>
              )}

              {cameraPermission === null && (
                <div className="bg-blue-900/20 p-4 rounded-lg mb-4 text-center">
                  <Camera className="h-8 w-8 mx-auto mb-2 text-blue-400" />
                  <p className="text-blue-300 font-medium">Requesting camera permission...</p>
                  <p className="text-blue-400 text-sm">Please allow camera access to continue</p>
                </div>
              )}

              {/* Camera View */}
              <div className="aspect-square bg-gray-800 rounded-lg overflow-hidden relative mb-4">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                
                {isCameraActive && (
                  <div className="absolute top-2 right-2 flex gap-2">
                    <button
                      onClick={switchCamera}
                      className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                      title="Switch Camera"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {!isCameraActive && cameraPermission && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button
                      onClick={startCamera}
                      className="p-4 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                      title="Start Camera"
                    >
                      <Camera className="h-6 w-6" />
                    </button>
                  </div>
                )}
              </div>

              {/* Camera Controls */}
              <div className="flex gap-3 justify-center">
                <motion.button
                  onClick={handleCloseCamera}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancel
                </motion.button>
                
                <motion.button
                  onClick={handleCapture}
                  disabled={!isCameraActive}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Capture
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfilePictureCapture;