import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, User, MessageSquare } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { format, formatDistanceToNow } from 'date-fns';

interface ReconciliationNote {
  id: string;
  note_type: string;
  note_content: string;
  created_by: string;
  priority: string;
  is_system_generated: boolean;
  created_at: string;
}

const RecentReconciliationActivity: React.FC = () => {
  const { user } = useAuth();
  const [recentNotes, setRecentNotes] = useState<ReconciliationNote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRecentActivity();
    }
  }, [user]);

  const fetchRecentActivity = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('reconciliation_notes')
        .select('id, note_type, note_content, created_by, priority, is_system_generated, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setRecentNotes(data || []);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (noteType: string) => {
    const iconClass = "h-4 w-4";
    switch (noteType) {
      case 'match':
        return <span className="text-green-600">✅</span>;
      case 'partial':
        return <span className="text-yellow-600">⚠️</span>;
      case 'flag':
        return <span className="text-red-600">🚩</span>;
      default:
        return <MessageSquare className={`${iconClass} text-blue-600`} />;
    }
  };

  return (
    <Card className="border-quikle-silver/20 shadow-sm">
      <CardHeader>
        <CardTitle className="text-quikle-charcoal flex items-center gap-2">
          <Clock className="h-5 w-5 text-quikle-primary" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4">
            <p className="text-sm text-quikle-slate">Loading...</p>
          </div>
        ) : recentNotes.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-quikle-slate">No recent activity</p>
          </div>
        ) : (
          <ScrollArea className="h-80">
            <div className="space-y-3">
              {recentNotes.map((note) => (
                <div
                  key={note.id}
                  className="flex gap-3 p-3 rounded-lg border border-quikle-silver/10 bg-gradient-to-r from-white to-gray-50 hover:border-quikle-primary/20 transition-all"
                >
                  <div className="flex-shrink-0 pt-1">
                    {getActivityIcon(note.note_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-quikle-charcoal line-clamp-2">
                      {note.note_content}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-quikle-slate">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span className="truncate">{note.created_by}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span title={format(new Date(note.created_at), 'PPpp')}>
                          {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      {note.is_system_generated && (
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                          Auto
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentReconciliationActivity;