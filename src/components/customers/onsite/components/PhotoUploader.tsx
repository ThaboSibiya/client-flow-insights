import React, { useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Camera, ImagePlus, X, Loader2 } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { JobPhoto } from '../types';

interface PhotoUploaderProps {
  photos: JobPhoto[];
  onPhotosChange: (photos: JobPhoto[]) => void;
  customerId: string;
}

export const PhotoUploader = ({ photos, onPhotosChange, customerId }: PhotoUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

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

      // Use signed URL since bucket is private
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
      await uploadFile(file, 'general');
    }

    // Reset input
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

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">Photos / Proof of Work</label>
      
      {/* Photo grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((photo) => (
            <div key={photo.id} className="relative group aspect-square rounded-md overflow-hidden border border-border bg-muted">
              <img
                src={photo.url}
                alt={photo.name}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removePhoto(photo)}
                className="absolute top-1 right-1 h-5 w-5 rounded-full bg-background/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3 text-destructive" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload buttons */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex-1 gap-1.5 text-xs"
          onClick={() => cameraInputRef.current?.click()}
          disabled={uploading || photos.length >= 6}
        >
          {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
          Take Photo
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex-1 gap-1.5 text-xs"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || photos.length >= 6}
        >
          {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />}
          Upload
        </Button>
      </div>

      {photos.length >= 6 && (
        <p className="text-[11px] text-muted-foreground">Maximum 6 photos reached</p>
      )}

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  );
};
