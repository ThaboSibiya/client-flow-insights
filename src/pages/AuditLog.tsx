
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search, ShieldCheck } from 'lucide-react';
import LoginHistoryList from '@/components/audit-log/LoginHistoryList';
import FileAccessHistoryList from '@/components/audit-log/FileAccessHistoryList';

const AuditLog = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-quikle-charcoal flex items-center gap-2">
            <ShieldCheck className="h-8 w-8 text-quikle-primary" />
            Audit Log
          </h1>
          <p className="text-quikle-slate mt-1">
            Review user login history and file access events.
          </p>
        </div>
      </div>

      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-quikle-slate h-4 w-4" />
        <Input
          placeholder="Search logs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 border-quikle-silver max-w-sm"
        />
      </div>

      <Tabs defaultValue="login" className="space-y-4">
        <TabsList>
          <TabsTrigger value="login">Login History</TabsTrigger>
          <TabsTrigger value="file">File Access History</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <LoginHistoryList searchTerm={searchTerm} />
        </TabsContent>
        <TabsContent value="file">
          <FileAccessHistoryList searchTerm={searchTerm} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AuditLog;
