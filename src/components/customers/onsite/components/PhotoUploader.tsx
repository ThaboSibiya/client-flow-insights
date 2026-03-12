import React, { useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, ImagePlus, X, Loader2 } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { JobPhoto } from '../types';
import { cn } from '@/lib/utils';

interface PhotoUploaderProps {
  photos: JobPhoto[];
  onPhotosChange: (photos: JobPhoto[]) => void;
  customerId: string;
}

const PHOTO_TYPES: { value: JobPhoto['type']; label: string }[] = [
  { value: 'before', label: 'Before' },
  { value: 'after', label: 'After' },
  { value: 'general', label: 'General' },
];

export const PhotoUploader = ({ photos, onPhotosChange, customerId }: PhotoUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [pendingType, setPendingType] = useState<JobPhoto['type']>('general');

  const uploadFile = async (file: File, type: JobPhoto['type']) => {
    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const ext = file.name.split('.').pop();
      const fileName = `${customerId}/${Date.now()}-${type}.${ext}`;
      const filePath = `job-photos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('ticket-attachments')
        .upload(filePath, file, { contentType: file.type });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('ticket-attachments')
        .getPublicUrl(filePath);

      const { data: signedData } = await supabase.storage
        .from('ticket-attachments')
        .createSignedUrl(filePath, 3600);

      const newPhoto: JobPhoto = {
        id: crypto.randomUUID(),
        name: file.name,
        url: signedData?.signedUrl || urlData.publicUrl,
        path: filePath,
        type,
      };

      onPhotosChange([...photos, newPhoto]);
    } catch (error: any) {
      console.error('Photo upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Could not upload photo",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) {
        toast({ title: "Invalid file", description: "Only images are allowed", variant: "destructive" });
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast({ title: "File too large", description: "Max 10MB per photo", variant: "destructive" });
        continue;
      }
      await uploadFile(file, pendingType);
    }
    e.target.value = '';
  };

  const removePhoto = async (photo: JobPhoto) => {
    try {
      await supabase.storage.from('ticket-attachments').remove([photo.path]);
    } catch (error) {
      console.warn('Failed to delete photo from storage:', error);
    }
    onPhotosChange(photos.filter(p => p.id !== photo.id));
  };

  const beforePhotos = photos.filter(p => p.type === 'before');
  const afterPhotos = photos.filter(p => p.type === 'after');
  const generalPhotos = photos.filter(p => p.type === 'general');

  const renderPhotoGroup = (groupPhotos: JobPhoto[], label: string) => {
    if (groupPhotos.length === 0) return null;
    return (
      <div className="space-y-1.5">
        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
        <div className="grid grid-cols-3 gap-2">
          {groupPhotos.map((photo) => (
            <div key={photo.id} className="relative group aspect-square rounded-md overflow-hidden border border-border bg-muted">
              <img src={photo.url} alt={photo.name} className="w-full h-full object-cover" />
              <Badge
                variant="secondary"
                className="absolute bottom-1 left-1 text-[9px] px-1 py-0 h-4 bg-background/80 backdrop-blur-sm"
              >
                {photo.type}
              </Badge>
              <button
                type="button"
                onClick={() => removePhoto(photo)}
                className="absolute top-1 right-1 h-7 w-7 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity touch-target"
              >
                <X className="h-3.5 w-3.5 text-destructive" />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-foreground">Photos / Proof of Work</label>

      {/* Photo type selector */}
      <div className="flex gap-1.5">
        {PHOTO_TYPES.map((pt) => (
          <Button
            key={pt.value}
            type="button"
            variant={pendingType === pt.value ? 'default' : 'outline'}
            className="flex-1 text-sm h-10 touch-target"
            onClick={() => setPendingType(pt.value)}
          >
            {pt.label}
          </Button>
        ))}
      </div>

      {/* Photo grid grouped by type */}
      {photos.length > 0 && (
        <div className="space-y-3">
          {renderPhotoGroup(beforePhotos, 'Before')}
          {renderPhotoGroup(afterPhotos, 'After')}
          {renderPhotoGroup(generalPhotos, 'General')}
        </div>
      )}

      {/* Upload buttons */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1 gap-1.5 h-11 text-sm touch-target"
          onClick={() => cameraInputRef.current?.click()}
          disabled={uploading || photos.length >= 6}
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
          Take Photo
        </Button>
        <Button
          type="button"
          variant="outline"
          className="flex-1 gap-1.5 h-11 text-sm touch-target"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || photos.length >= 6}
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
          Upload
        </Button>
      </div>

      {photos.length >= 6 && (
        <p className="text-[11px] text-muted-foreground">Maximum 6 photos reached</p>
      )}
      {photos.length === 0 && (
        <p className="text-[11px] text-muted-foreground">Select a photo type above, then take or upload a photo</p>
      )}

      <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileSelect} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileSelect} />
    </div>
  );
};
