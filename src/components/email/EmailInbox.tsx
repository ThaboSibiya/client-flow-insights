
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Mail, 
  Search, 
  RefreshCw, 
  Archive, 
  Trash2, 
  Reply,
  Forward,
  MoreVertical,
  Paperclip,
  ReplyAll
} from 'lucide-react';
import { toast } from 'sonner';
import { emailService, EmailThread, Email } from '@/services/emailService';
import { emailSyncService } from '@/services/emailSyncService';
import EmailCompose from './EmailCompose';
import EmailViewer from './EmailViewer';
import EmailReplyComposer from './EmailReplyComposer';

const EmailInbox = () => {
  const [threads, setThreads] = useState<EmailThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<EmailThread | null>(null);
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCompose, setShowCompose] = useState(false);
  const [replyingToEmail, setReplyingToEmail] = useState<Email | null>(null);
  const [replyType, setReplyType] = useState<'reply' | 'reply-all' | 'forward'>('reply');

  useEffect(() => {
    loadThreads();
  }, []);

  const loadThreads = async () => {
    try {
      setLoading(true);
      const threadsData = await emailService.getEmailThreads();
      setThreads(threadsData);
    } catch (error) {
      console.error('Failed to load email threads:', error);
      toast.error('Failed to load emails');
    } finally {
      setLoading(false);
    }
  };

  const loadThreadEmails = async (thread: EmailThread) => {
    try {
      const emailsData = await emailService.getEmailsByThread(thread.id);
      setEmails(emailsData);
      setSelectedThread(thread);
      
      // Mark thread as read
      await emailService.markThreadAsRead(thread.id);
      
      // Update local state to reflect read status
      setThreads(prev => prev.map(t => 
        t.id === thread.id ? { ...t, unread_count: 0 } : t
      ));
    } catch (error) {
      console.error('Failed to load thread emails:', error);
      toast.error('Failed to load thread emails');
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      await emailSyncService.syncAllProviders();
      await loadThreads();
      toast.success('Emails synced successfully');
    } catch (error) {
      console.error('Failed to sync emails:', error);
      toast.error('Failed to sync emails');
    } finally {
      setSyncing(false);
    }
  };

  const handleReply = (email: Email, type: 'reply' | 'reply-all' | 'forward' = 'reply') => {
    setReplyingToEmail(email);
    setReplyType(type);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadThreads();
      return;
    }

    try {
      const searchResults = await emailService.searchEmails(searchQuery);
      // Group search results by thread for display
      const threadIds = [...new Set(searchResults.map(email => email.thread_id))];
      const searchThreads = threads.filter(thread => threadIds.includes(thread.id));
      setThreads(searchThreads);
    } catch (error) {
      console.error('Failed to search emails:', error);
      toast.error('Failed to search emails');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays <= 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  if (loading) {
    return (
      <div className="h-[600px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex h-[700px] bg-white rounded-lg border">
      {/* Left Sidebar - Thread List */}
      <div className="w-1/3 border-r flex flex-col">
        <div className="p-4 border-b">
          <div className="flex gap-2 mb-3">
            <Button 
              onClick={() => setShowCompose(true)}
              className="flex-1"
            >
              <Mail className="h-4 w-4 mr-2" />
              Compose
            </Button>
            <Button 
              variant="outline" 
              onClick={handleSync}
              disabled={syncing}
            >
              <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search emails..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="space-y-1 p-2">
            {threads.map((thread) => (
              <div
                key={thread.id}
                onClick={() => loadThreadEmails(thread)}
                className={`p-3 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                  selectedThread?.id === thread.id ? 'bg-blue-50 border border-blue-200' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <div className="font-medium text-sm truncate flex-1">
                    {thread.participants.slice(0, 2).join(', ')}
                  </div>
                  <div className="text-xs text-gray-500 ml-2">
                    {formatDate(thread.last_message_at)}
                  </div>
                </div>
                
                <div className="text-sm text-gray-900 mb-1 truncate">
                  {thread.subject}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    {thread.message_count} message{thread.message_count !== 1 ? 's' : ''}
                  </div>
                  {thread.unread_count > 0 && (
                    <Badge variant="default" className="text-xs">
                      {thread.unread_count}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Right Panel - Email Content */}
      <div className="flex-1 flex flex-col">
        {selectedThread ? (
          <>
            <div className="p-4 border-b bg-gray-50">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-lg truncate">
                  {selectedThread.subject}
                </h2>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => emails.length > 0 && handleReply(emails[emails.length - 1], 'reply')}
                  >
                    <Reply className="h-4 w-4 mr-2" />
                    Reply
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => emails.length > 0 && handleReply(emails[emails.length - 1], 'reply-all')}
                  >
                    <ReplyAll className="h-4 w-4 mr-2" />
                    Reply All
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => emails.length > 0 && handleReply(emails[emails.length - 1], 'forward')}
                  >
                    <Forward className="h-4 w-4 mr-2" />
                    Forward
                  </Button>
                  <Button variant="outline" size="sm">
                    <Archive className="h-4 w-4 mr-2" />
                    Archive
                  </Button>
                  <Button variant="outline" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {emails.map((email, index) => (
                  <div key={email.id}>
                    <EmailViewer 
                      email={email} 
                      onReply={(type) => handleReply(email, type)}
                    />
                    {index < emails.length - 1 && <Separator className="my-4" />}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Select an email thread to view messages</p>
            </div>
          </div>
        )}
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <EmailCompose 
          onClose={() => setShowCompose(false)}
          onSent={() => {
            setShowCompose(false);
            loadThreads();
            toast.success('Email sent successfully');
          }}
        />
      )}

      {/* Reply Modal */}
      {replyingToEmail && (
        <EmailReplyComposer
          email={replyingToEmail}
          replyType={replyType}
          onClose={() => setReplyingToEmail(null)}
          onSent={() => {
            setReplyingToEmail(null);
            loadThreads();
            loadThreadEmails(selectedThread!);
          }}
        />
      )}
    </div>
  );
};

export default EmailInbox;
