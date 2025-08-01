export interface CameraPermission {
  granted: boolean;
  error?: string;
}

export interface CameraStream {
  stream: MediaStream;
  stop: () => void;
}

export interface CameraCapture {
  imageData: string; // base64 encoded image
  timestamp: Date;
}

class CameraService {
  private currentStream: MediaStream | null = null;

  // Request camera permission
  async requestCameraPermission(): Promise<CameraPermission> {
    try {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        return {
          granted: false,
          error: 'Camera access is not supported in this browser'
        };
      }

      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user' // Front camera by default
        }
      });

      // Stop the stream immediately after permission check
      stream.getTracks().forEach(track => track.stop());

      return { granted: true };
    } catch (error: any) {
      let errorMessage = 'Camera access denied';
      
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Camera permission denied by user';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No camera device found';
      } else if (error.name === 'NotReadableError') {
        errorMessage = 'Camera is already in use by another application';
      } else if (error.name === 'OverconstrainedError') {
        errorMessage = 'Camera constraints cannot be satisfied';
      }

      return {
        granted: false,
        error: errorMessage
      };
    }
  }

  // Start camera stream
  async startCameraStream(facingMode: 'user' | 'environment' = 'user'): Promise<CameraStream | null> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: facingMode
        }
      });

      this.currentStream = stream;

      return {
        stream,
        stop: () => this.stopCameraStream()
      };
    } catch (error) {
      console.error('Failed to start camera stream:', error);
      return null;
    }
  }

  // Stop camera stream
  stopCameraStream(): void {
    if (this.currentStream) {
      this.currentStream.getTracks().forEach(track => track.stop());
      this.currentStream = null;
    }
  }

  // Capture image from video element
  captureImage(videoElement: HTMLVideoElement): CameraCapture | null {
    try {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (!context) {
        throw new Error('Canvas context not available');
      }

      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      
      context.drawImage(videoElement, 0, 0);
      
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      
      return {
        imageData,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Failed to capture image:', error);
      return null;
    }
  }

  // Check if camera is available
  async isCameraAvailable(): Promise<boolean> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.some(device => device.kind === 'videoinput');
    } catch (error) {
      console.error('Failed to check camera availability:', error);
      return false;
    }
  }

  // Get available cameras
  async getAvailableCameras(): Promise<MediaDeviceInfo[]> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.filter(device => device.kind === 'videoinput');
    } catch (error) {
      console.error('Failed to get available cameras:', error);
      return [];
    }
  }

  // Switch camera (front/back)
  async switchCamera(): Promise<CameraStream | null> {
    const currentFacingMode = this.getCurrentFacingMode();
    const newFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
    
    this.stopCameraStream();
    return this.startCameraStream(newFacingMode);
  }

  // Get current facing mode
  private getCurrentFacingMode(): 'user' | 'environment' {
    if (!this.currentStream) return 'user';
    
    const videoTrack = this.currentStream.getVideoTracks()[0];
    const settings = videoTrack.getSettings();
    return settings.facingMode as 'user' | 'environment' || 'user';
  }

  // Take photo with flash effect
  captureWithFlash(videoElement: HTMLVideoElement): CameraCapture | null {
    // Create flash effect
    const flashDiv = document.createElement('div');
    flashDiv.style.position = 'fixed';
    flashDiv.style.top = '0';
    flashDiv.style.left = '0';
    flashDiv.style.width = '100%';
    flashDiv.style.height = '100%';
    flashDiv.style.backgroundColor = 'white';
    flashDiv.style.zIndex = '9999';
    flashDiv.style.opacity = '0.8';
    flashDiv.style.pointerEvents = 'none';
    
    document.body.appendChild(flashDiv);
    
    // Remove flash after 150ms
    setTimeout(() => {
      document.body.removeChild(flashDiv);
    }, 150);
    
    return this.captureImage(videoElement);
  }

  // Cleanup resources
  cleanup(): void {
    this.stopCameraStream();
  }
}

// Export singleton instance
export const cameraService = new CameraService();
export default cameraService;