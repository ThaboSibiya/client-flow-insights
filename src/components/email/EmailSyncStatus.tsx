
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { emailSyncService, SyncProgress } from '@/services/emailSyncService';
import { toast } from 'sonner';

interface EmailSyncStatusProps {
  providerId: string;
  providerName: string;
  onSyncComplete?: () => void;
}

const EmailSyncStatus = ({ providerId, providerName, onSyncComplete }: EmailSyncStatusProps) => {
  const [syncStatus, setSyncStatus] = useState<SyncProgress | null>(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadSyncStatus();
    
    // Subscribe to real-time updates
    const unsubscribe = emailSyncService.subscribeToSyncUpdates(
      providerId,
      (progress) => {
        setSyncStatus(progress);
        setSyncing(progress.status === 'syncing');
        
        if (progress.status === 'completed') {
          toast.success(`${providerName} sync completed`);
          onSyncComplete?.();
        } else if (progress.status === 'error') {
          toast.error(`${providerName} sync failed: ${progress.errorMessage}`);
        }
      }
    );

    return unsubscribe;
  }, [providerId, providerName, onSyncComplete]);

  const loadSyncStatus = async () => {
    try {
      const status = await emailSyncService.getSyncStatus(providerId);
      setSyncStatus(status);
    } catch (error) {
      console.error('Failed to load sync status:', error);
    }
  };

  const handleSync = async () => {
    if (syncing) return;
    
    try {
      setSyncing(true);
      await emailSyncService.syncEmailsForProvider(providerId);
    } catch (error) {
      console.error('Sync failed:', error);
      toast.error(`Failed to sync ${providerName}`);
      setSyncing(false);
    }
  };

  const getStatusIcon = () => {
    if (syncing) return <RefreshCw className="h-4 w-4 animate-spin" />;
    if (syncStatus?.status === 'completed') return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (syncStatus?.status === 'error') return <AlertCircle className="h-4 w-4 text-red-600" />;
    return <Clock className="h-4 w-4 text-gray-400" />;
  };

  const getStatusBadge = () => {
    if (syncing) return <Badge variant="secondary">Syncing...</Badge>;
    if (syncStatus?.status === 'completed') return <Badge variant="default">Up to date</Badge>;
    if (syncStatus?.status === 'error') return <Badge variant="destructive">Error</Badge>;
    return <Badge variant="outline">Not synced</Badge>;
  };

  const formatLastSync = (lastSync: string | null) => {
    if (!lastSync) return 'Never';
    const date = new Date(lastSync);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">{providerName}</CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="text-muted-foreground">
              Last sync: {formatLastSync(syncStatus?.lastSyncAt || null)}
            </span>
          </div>
        </div>

        {syncing && syncStatus && (
          <div className="space-y-2">
            <Progress 
              value={syncStatus.totalEmails > 0 
                ? (syncStatus.processedEmails / syncStatus.totalEmails) * 100 
                : 0
              } 
            />
            <div className="text-xs text-muted-foreground text-center">
              {syncStatus.processedEmails} / {syncStatus.totalEmails} emails processed
            </div>
          </div>
        )}

        {syncStatus?.status === 'error' && syncStatus.errorMessage && (
          <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
            {syncStatus.errorMessage}
          </div>
        )}

        <Button 
          onClick={handleSync} 
          disabled={syncing} 
          variant="outline" 
          size="sm" 
          className="w-full"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Syncing...' : 'Sync Now'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default EmailSyncStatus;
