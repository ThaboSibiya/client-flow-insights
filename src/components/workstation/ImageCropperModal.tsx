import React, { useState, useRef, useCallback } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface ImageCropperModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  onCropComplete: (croppedBlob: Blob) => void;
  aspectRatio?: number;
  circularCrop?: boolean;
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number
): Crop {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

const ImageCropperModal: React.FC<ImageCropperModalProps> = ({
  isOpen,
  onClose,
  imageSrc,
  onCropComplete,
  aspectRatio = 1,
  circularCrop = false,
}) => {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [isProcessing, setIsProcessing] = useState(false);
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);

  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { width, height } = e.currentTarget;
      setCrop(centerAspectCrop(width, height, aspectRatio));
    },
    [aspectRatio]
  );

  const getCroppedImg = useCallback(async (): Promise<Blob | null> => {
    if (!imgRef.current || !completedCrop) return null;

    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return null;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const pixelRatio = window.devicePixelRatio || 1;

    canvas.width = Math.floor(completedCrop.width * scaleX * pixelRatio);
    canvas.height = Math.floor(completedCrop.height * scaleY * pixelRatio);

    ctx.scale(pixelRatio, pixelRatio);
    ctx.imageSmoothingQuality = 'high';

    const cropX = completedCrop.x * scaleX;
    const cropY = completedCrop.y * scaleY;

    const rotateRads = (rotate * Math.PI) / 180;
    const centerX = image.naturalWidth / 2;
    const centerY = image.naturalHeight / 2;

    ctx.save();

    ctx.translate(-cropX, -cropY);
    ctx.translate(centerX, centerY);
    ctx.rotate(rotateRads);
    ctx.scale(scale, scale);
    ctx.translate(-centerX, -centerY);
    ctx.drawImage(image, 0, 0);

    ctx.restore();

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          resolve(blob);
        },
        'image/jpeg',
        0.95
      );
    });
  }, [completedCrop, rotate, scale]);

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      const croppedBlob = await getCroppedImg();
      if (croppedBlob) {
        onCropComplete(croppedBlob);
      }
    } catch (error) {
      console.error('Crop error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setScale(1);
    setRotate(0);
    if (imgRef.current) {
      const { width, height } = imgRef.current;
      setCrop(centerAspectCrop(width, height, aspectRatio));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-sm font-medium">Crop Image</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto py-4">
          <div className="flex justify-center bg-quikle-crystal/50 rounded-lg p-2">
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspectRatio}
              circularCrop={circularCrop}
              className="max-h-[300px]"
            >
              <img
                ref={imgRef}
                src={imageSrc}
                alt="Crop preview"
                onLoad={onImageLoad}
                style={{
                  transform: `scale(${scale}) rotate(${rotate}deg)`,
                  maxHeight: '300px',
                  objectFit: 'contain',
                }}
              />
            </ReactCrop>
          </div>

          {/* Controls */}
          <div className="mt-4 space-y-3">
            {/* Zoom */}
            <div className="flex items-center gap-3">
              <ZoomOut className="h-4 w-4 text-quikle-slate" />
              <Slider
                value={[scale]}
                onValueChange={(values) => setScale(values[0])}
                min={0.5}
                max={2}
                step={0.1}
                className="flex-1"
              />
              <ZoomIn className="h-4 w-4 text-quikle-slate" />
            </div>

            {/* Rotate */}
            <div className="flex items-center gap-3">
              <RotateCcw className="h-4 w-4 text-quikle-slate" />
              <Slider
                value={[rotate]}
                onValueChange={(values) => setRotate(values[0])}
                min={-180}
                max={180}
                step={1}
                className="flex-1"
              />
              <span className="text-xs text-quikle-slate w-10 text-right">
                {rotate}°
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-xs"
          >
            Reset
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleConfirm}
            disabled={isProcessing}
            className="text-xs bg-quikle-primary hover:bg-quikle-primary/90"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                Processing...
              </>
            ) : (
              'Apply Crop'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImageCropperModal;
