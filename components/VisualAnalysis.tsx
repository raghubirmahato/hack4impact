
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, CameraOff, RotateCcw, Zap } from 'lucide-react';
import { analyzeImage } from '../services/geminiService';
import { cameraService } from '../services/cameraService';
import type { VisualAnalysisMode } from '../types';
import LoadingSpinner from './LoadingSpinner';

const PROMPTS: Record<VisualAnalysisMode, string> = {
  wound: `You are a medical analysis assistant. Describe the wound in this image in detail. Focus on objective visual characteristics like approximate size, shape, color, and any visible signs of inflammation, swelling, or discharge. Do not provide a diagnosis or medical advice. Start your response with 'Visual Analysis:'. CRITICALLY IMPORTANT: End your response with this disclaimer: 'This is an AI-generated analysis and not a medical diagnosis. Consult a healthcare professional.'`,
  emotion: `You are an expert in reading human emotions. Analyze the person's facial expression in this image. Describe the dominant emotion being conveyed (e.g., happiness, sadness, anger, surprise, pain, distress). Explain which facial cues support your analysis. Do not make assumptions about the person's situation. Start your response with 'Emotion Analysis:'. CRITICALLY IMPORTANT: End your response with this disclaimer: 'This is an AI-generated analysis and not a substitute for professional psychological assessment.'`,
};


const VisualAnalysis: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [mode, setMode] = useState<VisualAnalysisMode>('wound');
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

  useEffect(() => {
    // Check camera availability on mount
    const initCamera = async () => {
      const isAvailable = await cameraService.isCameraAvailable();
      if (!isAvailable) {
        setError('No camera device found');
        return;
      }
      
      // Request permission and start camera
      const hasPermission = await requestCameraPermission();
      if (hasPermission) {
        await startCamera();
      }
    };

    initCamera();

    return () => {
      // Cleanup on unmount
      cameraService.cleanup();
    };
  }, [requestCameraPermission, startCamera]);

  const handleCaptureAndAnalyze = async () => {
    if (!videoRef.current) return;
    setIsLoading(true);
    setAnalysisResult('');
    
    // Use camera service to capture with flash effect
    const capture = cameraService.captureWithFlash(videoRef.current);
    if (!capture) {
      setError('Failed to capture image');
      setIsLoading(false);
      return;
    }

    setCapturedImage(capture.imageData);

    const base64Image = capture.imageData.split(',')[1];
    const prompt = PROMPTS[mode];

    try {
      const result = await analyzeImage(base64Image, prompt);
      setAnalysisResult(result);
    } catch (err) {
      console.error("Analysis failed:", err);
      setAnalysisResult("An error occurred during analysis.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setAnalysisResult('');
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
      <h2 className="text-xl font-bold text-slate-800 mb-2">Live Visual Analysis</h2>
      <p className="text-sm text-slate-500 mb-4">
        Point your camera at the subject and capture an image for AI analysis. 
        <strong className="text-red-600"> For demonstration purposes only.</strong>
      </p>

      {error && (
        <div className="text-red-500 bg-red-100 p-3 rounded-md mb-4 flex items-center gap-2">
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
        <div className="bg-blue-100 p-4 rounded-md mb-4 text-center">
          <Camera className="h-8 w-8 mx-auto mb-2 text-blue-600" />
          <p className="text-blue-800 font-medium">Requesting camera permission...</p>
          <p className="text-blue-600 text-sm">Please allow camera access to continue</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-4">
          <div className="aspect-video bg-slate-900 rounded-lg overflow-hidden relative shadow-inner">
            {!capturedImage ? (
              <>
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                {isCameraActive && (
                  <div className="absolute top-2 right-2 flex gap-2">
                    <button
                      onClick={switchCamera}
                      className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                      title="Switch Camera"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </button>
                    <button
                      onClick={stopCamera}
                      className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                      title="Stop Camera"
                    >
                      <CameraOff className="h-4 w-4" />
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
              </>
            ) : (
              <img src={capturedImage} alt="Captured for analysis" className="w-full h-full object-cover" />
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as VisualAnalysisMode)}
              className="p-3 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-grow"
              disabled={isLoading || !!capturedImage}
            >
              <option value="wound">Analyze Wound</option>
              <option value="emotion">Analyze Facial Expression</option>
            </select>
            
            {!capturedImage ? (
              <button
                onClick={handleCaptureAndAnalyze}
                disabled={isLoading || !isCameraActive}
                className="px-6 py-3 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isLoading ? (
                  <LoadingSpinner />
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    Capture & Analyze
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleRetake}
                className="px-6 py-3 rounded-md bg-slate-600 text-white font-semibold hover:bg-slate-700 transition-colors flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Retake
              </button>
            )}
          </div>
        </div>
        
        <div className="bg-slate-50 rounded-lg p-4 h-full min-h-[250px] flex flex-col">
          <h3 className="font-bold text-slate-700 mb-2">Analysis Results</h3>
          {isLoading ? (
            <div className="flex-grow flex items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="text-sm text-slate-600 whitespace-pre-wrap flex-grow overflow-y-auto">
              {analysisResult || "Results will appear here..."}
            </div>
          )}
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden"></canvas>
    </div>
  );
};

export default VisualAnalysis;
