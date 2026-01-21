import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Camera, X, RotateCcw, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WebcamCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
}

const WebcamCaptureModal: React.FC<WebcamCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  const startCamera = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    // Stop any existing stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      
      setIsLoading(false);
    } catch (err: any) {
      console.error('Camera error:', err);
      setIsLoading(false);
      
      if (err.name === 'NotAllowedError') {
        setError('Camera access denied. Please allow camera permissions.');
      } else if (err.name === 'NotFoundError') {
        setError('No camera found on this device.');
      } else {
        setError('Unable to access camera. Please try again.');
      }
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  useEffect(() => {
    if (isOpen && !capturedImage) {
      startCamera();
    }
    
    return () => {
      stopCamera();
    };
  }, [isOpen, startCamera, stopCamera, capturedImage]);

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the video frame to canvas (mirror for selfie camera)
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0);

    // Get the image data
    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(imageDataUrl);
    stopCamera();
  };

  const handleRetake = () => {
    setCapturedImage(null);
    startCamera();
  };

  const handleConfirm = () => {
    if (!capturedImage) return;

    // Convert data URL to File
    fetch(capturedImage)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], `webcam-photo-${Date.now()}.jpg`, {
          type: 'image/jpeg',
        });
        onCapture(file);
        handleClose();
      });
  };

  const handleClose = () => {
    stopCamera();
    setCapturedImage(null);
    setError(null);
    onClose();
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    setCapturedImage(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Camera className="h-4 w-4 text-quikle-primary" />
            Take Profile Photo
          </DialogTitle>
        </DialogHeader>

        <div className="relative bg-black aspect-video">
          {/* Hidden canvas for capturing */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Loading state */}
          {isLoading && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-quikle-charcoal">
              <div className="text-center">
                <Loader2 className="h-8 w-8 text-quikle-primary animate-spin mx-auto mb-2" />
                <p className="text-sm text-white/70">Starting camera...</p>
              </div>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-quikle-charcoal p-6">
              <div className="text-center">
                <Camera className="h-10 w-10 text-quikle-slate mx-auto mb-3" />
                <p className="text-sm text-white/70 mb-4">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={startCamera}
                  className="text-xs"
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}

          {/* Live video feed */}
          {!capturedImage && (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={cn(
                "w-full h-full object-cover",
                facingMode === 'user' && "scale-x-[-1]",
                isLoading && "opacity-0"
              )}
            />
          )}

          {/* Captured image preview */}
          {capturedImage && (
            <img
              src={capturedImage}
              alt="Captured"
              className="w-full h-full object-cover"
            />
          )}

          {/* Circular guide overlay for avatar */}
          {!capturedImage && !isLoading && !error && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-48 rounded-full border-2 border-white/50 border-dashed" />
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="p-4 flex items-center justify-center gap-3 bg-background">
          {!capturedImage ? (
            <>
              <Button
                variant="outline"
                size="icon"
                onClick={handleClose}
                className="h-10 w-10 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
              
              <Button
                size="icon"
                onClick={handleCapture}
                disabled={isLoading || !!error}
                className="h-14 w-14 rounded-full bg-quikle-primary hover:bg-quikle-primary/90"
              >
                <Camera className="h-6 w-6" />
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                onClick={toggleCamera}
                disabled={isLoading}
                className="h-10 w-10 rounded-full"
                title="Switch camera"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={handleRetake}
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Retake
              </Button>
              
              <Button
                onClick={handleConfirm}
                className="gap-2 bg-green-600 hover:bg-green-700"
              >
                <Check className="h-4 w-4" />
                Use Photo
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WebcamCaptureModal;
