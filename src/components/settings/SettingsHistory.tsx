
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { History, RotateCcw, User, Calendar, Filter } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface SettingsChange {
  id: string;
  timestamp: Date;
  user: string;
  category: string;
  setting: string;
  oldValue: string;
  newValue: string;
  reason?: string;
}

const SettingsHistory = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Mock data - in real app this would come from an API
  const settingsChanges: SettingsChange[] = [
    {
      id: '1',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      user: 'John Doe',
      category: 'Security',
      setting: 'Two-Factor Authentication',
      oldValue: 'Disabled',
      newValue: 'Enabled',
      reason: 'Enhanced security compliance'
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      user: 'Jane Smith',
      category: 'Notifications',
      setting: 'Email Notifications',
      oldValue: 'Enabled',
      newValue: 'Disabled',
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      user: 'Admin User',
      category: 'Company',
      setting: 'Company Name',
      oldValue: 'Old Company Ltd',
      newValue: 'New Company Ltd',
      reason: 'Rebranding initiative'
    }
  ];

  const filteredChanges = settingsChanges.filter(change => {
    const matchesSearch = !searchQuery || 
      change.setting.toLowerCase().includes(searchQuery.toLowerCase()) ||
      change.user.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || 
      change.category.toLowerCase() === categoryFilter.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  const handleRollback = (changeId: string) => {
    console.log('Rolling back change:', changeId);
    // In a real app, this would trigger a rollback operation
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search changes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="company">Company</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="notifications">Notifications</SelectItem>
                  <SelectItem value="appearance">Appearance</SelectItem>
                  <SelectItem value="integrations">Integrations</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Changes List */}
      <div className="space-y-3">
        {filteredChanges.map((change) => (
          <Card key={change.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">{change.category}</Badge>
                    <span className="text-sm text-quikle-slate">
                      {formatDistanceToNow(change.timestamp, { addSuffix: true })}
                    </span>
                  </div>
                  
                  <h4 className="font-medium text-quikle-charcoal mb-1">
                    {change.setting}
                  </h4>
                  
                  <div className="text-sm text-quikle-slate mb-2">
                    <span className="line-through text-red-600">{change.oldValue}</span>
                    {' → '}
                    <span className="text-green-600">{change.newValue}</span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-quikle-slate">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {change.user}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {change.timestamp.toLocaleDateString()}
                    </div>
                  </div>
                  
                  {change.reason && (
                    <p className="text-sm text-quikle-slate mt-2 italic">
                      Reason: {change.reason}
                    </p>
                  )}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRollback(change.id)}
                  className="ml-4"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Rollback
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredChanges.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <History className="h-12 w-12 text-quikle-slate mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-quikle-charcoal mb-2">No Changes Found</h3>
            <p className="text-quikle-slate">
              {searchQuery || categoryFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'No settings changes have been recorded yet'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SettingsHistory;
