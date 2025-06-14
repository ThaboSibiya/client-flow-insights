
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  X, 
  FileText, 
  Image, 
  Video, 
  Music, 
  File,
  Eye
} from 'lucide-react';
import { AttachmentFile, downloadAttachment } from '@/services/attachmentService';

interface AttachmentPreviewProps {
  attachment: AttachmentFile;
  showDelete?: boolean;
  onDelete?: (filePath: string) => void;
  compact?: boolean;
}

const AttachmentPreview = ({ 
  attachment, 
  showDelete = false, 
  onDelete,
  compact = false 
}: AttachmentPreviewProps) => {
  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return Image;
    if (type.startsWith('video/')) return Video;
    if (type.startsWith('audio/')) return Music;
    if (type.includes('pdf') || type.includes('document')) return FileText;
    return File;
  };

  const getFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = () => {
    downloadAttachment(attachment.url, attachment.name);
  };

  const handlePreview = () => {
    window.open(attachment.url, '_blank');
  };

  const IconComponent = getFileIcon(attachment.type);
  const isImage = attachment.type.startsWith('image/');

  if (compact) {
    return (
      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
        <IconComponent className="h-4 w-4 text-gray-500" />
        <span className="text-sm truncate flex-1">{attachment.name}</span>
        <Badge variant="outline" className="text-xs">
          {getFileSize(attachment.size)}
        </Badge>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePreview}
            className="h-6 w-6 p-0"
          >
            <Eye className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            className="h-6 w-6 p-0"
          >
            <Download className="h-3 w-3" />
          </Button>
          {showDelete && onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(attachment.path)}
              className="h-6 w-6 p-0 text-red-500"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-sm">
      <CardContent className="p-3">
        {isImage ? (
          <div className="mb-2">
            <img 
              src={attachment.url} 
              alt={attachment.name}
              className="w-full h-32 object-cover rounded cursor-pointer"
              onClick={handlePreview}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-32 bg-gray-100 rounded mb-2">
            <IconComponent className="h-12 w-12 text-gray-400" />
          </div>
        )}
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium truncate">
              {attachment.name}
            </span>
            {showDelete && onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(attachment.path)}
                className="h-6 w-6 p-0 text-red-500"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-xs">
              {getFileSize(attachment.size)}
            </Badge>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreview}
                className="h-7 px-2"
              >
                <Eye className="h-3 w-3 mr-1" />
                Preview
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="h-7 px-2"
              >
                <Download className="h-3 w-3 mr-1" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AttachmentPreview;
