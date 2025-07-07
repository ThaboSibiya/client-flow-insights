
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Upload, X, User } from "lucide-react";
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface EmployeePhotoUploadProps {
  employeeId?: string;
  currentPhotoUrl?: string;
  firstName?: string;
  lastName?: string;
  onPhotoUpdate?: (photoUrl: string) => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const EmployeePhotoUpload = ({
  employeeId,
  currentPhotoUrl,
  firstName = '',
  lastName = '',
  onPhotoUpdate,
  size = 'md'
}: EmployeePhotoUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(currentPhotoUrl);

  const sizeClasses = {
    sm: 'h-12 w-12',
    md: 'h-16 w-16',
    lg: 'h-24 w-24',
    xl: 'h-32 w-32'
  };

  const uploadPhoto = async (file: File) => {
    if (!employeeId) {
      toast({
        title: "Error",
        description: "Employee ID is required to upload photo",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${employeeId}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('employee-photos')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('employee-photos')
        .getPublicUrl(filePath);

      const newPhotoUrl = data.publicUrl;
      setPhotoUrl(newPhotoUrl);
      onPhotoUpdate?.(newPhotoUrl);

      toast({
        title: "Success",
        description: "Employee photo uploaded successfully"
      });
    } catch (error: any) {
      console.error('Error uploading photo:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload photo",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Please select a valid image file",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "File size must be less than 5MB",
        variant: "destructive"
      });
      return;
    }

    uploadPhoto(file);
  };

  const removePhoto = async () => {
    if (!employeeId || !photoUrl) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const filePath = photoUrl.split('/').slice(-2).join('/');
      
      const { error } = await supabase.storage
        .from('employee-photos')
        .remove([filePath]);

      if (error) throw error;

      setPhotoUrl(undefined);
      onPhotoUpdate?.('');

      toast({
        title: "Success",
        description: "Employee photo removed successfully"
      });
    } catch (error: any) {
      console.error('Error removing photo:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove photo",
        variant: "destructive"
      });
    }
  };

  const getInitials = () => {
    return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();
  };

  return (
    <Card className="w-fit">
      <CardContent className="p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <Avatar className={sizeClasses[size]}>
              <AvatarImage src={photoUrl} alt={`${firstName} ${lastName}`} />
              <AvatarFallback className="bg-quikle-primary text-white">
                {getInitials() || <User className="h-4 w-4" />}
              </AvatarFallback>
            </Avatar>
            {photoUrl && (
              <Button
                variant="destructive"
                size="sm"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                onClick={removePhoto}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={uploading || !employeeId}
              className="relative overflow-hidden"
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="absolute inset-0 opacity-0 cursor-pointer"
                disabled={uploading || !employeeId}
              />
              {uploading ? (
                <>
                  <Camera className="h-4 w-4 mr-1 animate-pulse" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-1" />
                  Upload
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmployeePhotoUpload;
