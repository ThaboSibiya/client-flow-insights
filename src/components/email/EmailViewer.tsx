
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Paperclip, Download, Eye, Reply, ReplyAll, Forward } from 'lucide-react';
import { Email } from '@/services/emailService';
import { sanitizeHtmlContent } from '@/utils/securityUtils';

interface EmailViewerProps {
  email: Email;
  onReply?: (type: 'reply' | 'reply-all' | 'forward') => void;
}

const EmailViewer = ({ email, onReply }: EmailViewerProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Safely render HTML content with sanitization
  const renderEmailContent = () => {
    if (email.body_html) {
      const sanitizedHtml = sanitizeHtmlContent(email.body_html);
      return (
        <div 
          dangerouslySetInnerHTML={{ __html: sanitizedHtml }} 
          className="email-content prose prose-sm max-w-none"
        />
      );
    } else {
      return (
        <div className="whitespace-pre-wrap">
          {email.body_text || 'No content available'}
        </div>
      );
    }
  };

  return (
    <Card className={`${!email.is_read ? 'border-blue-200 bg-blue-50/30' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium">
                {email.from_name || email.from_email}
              </span>
              {email.from_name && (
                <span className="text-sm text-gray-500">
                  &lt;{email.from_email}&gt;
                </span>
              )}
              {email.is_sent && (
                <Badge variant="outline" className="text-xs">
                  Sent
                </Badge>
              )}
              {!email.is_read && (
                <Badge variant="default" className="text-xs">
                  Unread
                </Badge>
              )}
            </div>
            
            <div className="text-sm text-gray-600">
              To: {email.to_emails.join(', ')}
              {email.cc_emails.length > 0 && (
                <span className="ml-2">
                  CC: {email.cc_emails.join(', ')}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="text-sm text-gray-500">
              {formatDate(email.message_date)}
            </div>
            
            {onReply && (
              <div className="flex gap-1">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onReply('reply')}
                  title="Reply"
                >
                  <Reply className="h-3 w-3" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onReply('reply-all')}
                  title="Reply All"
                >
                  <ReplyAll className="h-3 w-3" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onReply('forward')}
                  title="Forward"
                >
                  <Forward className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {email.attachments && email.attachments.length > 0 && (
          <div className="mb-3 p-2 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Paperclip className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium">
                {email.attachments.length} attachment{email.attachments.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="space-y-1">
              {email.attachments.map((attachment) => (
                <div key={attachment.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="truncate">{attachment.filename}</span>
                    <span className="text-gray-500">
                      ({formatFileSize(attachment.size_bytes)})
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="prose prose-sm max-w-none">
          {renderEmailContent()}
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailViewer;
