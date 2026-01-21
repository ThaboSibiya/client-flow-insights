import React, { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { 
  Upload, 
  Image as ImageIcon, 
  Camera, 
  Loader2, 
  X,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploadDropzoneProps {
  field: 'avatar_url' | 'company_logo_url';
  currentValue?: string;
  onUploadComplete: (url: string) => void;
  className?: string;
}

const BUCKET_MAP = {
  avatar_url: 'avatars',
  company_logo_url: 'company_logos',
};

const LABELS = {
  avatar_url: 'Profile Photo',
  company_logo_url: 'Company Logo',
};

const ImageUploadDropzone: React.FC<ImageUploadDropzoneProps> = ({
  field,
  currentValue,
  onUploadComplete,
  className,
}) => {
  const { user } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentValue || null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const bucket = BUCKET_MAP[field];
  const label = LABELS[field];

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const uploadFile = async (file: File) => {
    if (!user) {
      toast({
        title: 'Not authenticated',
        description: 'Please log in to upload files.',
        variant: 'destructive',
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image file (JPG, PNG, GIF, WebP).',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload an image smaller than 5MB.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 100);

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        });

      clearInterval(progressInterval);

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      setUploadProgress(100);

      // Call the callback with the URL
      onUploadComplete(urlData.publicUrl);

      toast({
        title: 'Upload successful!',
        description: `${label} has been updated.`,
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      setPreview(currentValue || null);
      toast({
        title: 'Upload failed',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        uploadFile(files[0]);
      }
    },
    [user, bucket]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      uploadFile(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const Icon = field === 'avatar_url' ? Camera : ImageIcon;

  return (
    <div className={cn("space-y-2", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={cn(
          "relative rounded-lg border-2 border-dashed transition-all duration-300 cursor-pointer",
          "hover:border-quikle-primary/50 hover:bg-quikle-primary/5",
          isDragging && "border-quikle-primary bg-quikle-primary/10 scale-[1.02]",
          isUploading && "pointer-events-none",
          preview ? "border-green-300 bg-green-50/50" : "border-quikle-silver/40"
        )}
      >
        {/* Upload Progress Overlay */}
        {isUploading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center z-10">
            <Loader2 className="h-6 w-6 text-quikle-primary animate-spin mb-2" />
            <div className="w-24 h-1.5 bg-quikle-silver/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-quikle-primary transition-all duration-300 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <span className="text-xs text-quikle-slate mt-1">Uploading...</span>
          </div>
        )}

        <div className="p-4 flex items-center gap-3">
          {/* Preview or Icon */}
          <div className={cn(
            "relative w-14 h-14 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0",
            preview 
              ? "bg-transparent ring-2 ring-green-400 ring-offset-2" 
              : "bg-quikle-crystal"
          )}>
            {preview ? (
              <>
                <img 
                  src={preview} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5">
                  <CheckCircle2 className="h-3 w-3 text-white" />
                </div>
              </>
            ) : (
              <Icon className={cn(
                "h-6 w-6 transition-colors",
                isDragging ? "text-quikle-primary" : "text-quikle-slate"
              )} />
            )}
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className={cn(
              "text-xs font-medium",
              preview ? "text-green-700" : "text-quikle-charcoal"
            )}>
              {preview ? `${label} uploaded!` : `Upload ${label}`}
            </p>
            <p className="text-[10px] text-quikle-slate">
              {preview 
                ? "Click to change or drop a new file" 
                : "Drag & drop or click to browse"
              }
            </p>
            <p className="text-[9px] text-quikle-slate/70 mt-0.5">
              JPG, PNG, GIF up to 5MB
            </p>
          </div>

          {/* Upload Icon */}
          <div className={cn(
            "flex-shrink-0 p-2 rounded-full transition-colors",
            isDragging 
              ? "bg-quikle-primary/20 text-quikle-primary" 
              : "bg-quikle-crystal text-quikle-slate"
          )}>
            <Upload className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Remove button */}
      {preview && !isUploading && (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleRemove();
          }}
          className="h-6 text-[10px] text-quikle-slate hover:text-red-600 px-2"
        >
          <X className="h-3 w-3 mr-1" />
          Remove image
        </Button>
      )}
    </div>
  );
};

export default ImageUploadDropzone;
