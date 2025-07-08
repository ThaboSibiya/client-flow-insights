
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getFileAccessHistory } from '@/services/auditLogService';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import LoadingSpinner from '../auth/LoadingSpinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, File, Clock, User, Download, Upload, Trash2, Eye } from 'lucide-react';

interface FileAccessHistoryListProps {
  searchTerm: string;
  dateRange?: string;
  filterType?: string;
}

const FileAccessHistoryList = ({ searchTerm, dateRange, filterType }: FileAccessHistoryListProps) => {
  const { data: history, isLoading, error } = useQuery({
    queryKey: ['fileAccessHistory'],
    queryFn: getFileAccessHistory,
  });
  
  const filteredHistory = history?.filter(log => {
    const employee = log.employees;
    const search = searchTerm.toLowerCase();
    return (
      employee?.first_name?.toLowerCase().includes(search) ||
      employee?.last_name?.toLowerCase().includes(search) ||
      employee?.email?.toLowerCase().includes(search) ||
      log.file_path?.toLowerCase().includes(search) ||
      log.action?.toLowerCase().includes(search)
    );
  });

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'upload':
        return <Upload className="h-4 w-4" />;
      case 'download':
        return <Download className="h-4 w-4" />;
      case 'delete':
        return <Trash2 className="h-4 w-4" />;
      case 'view':
        return <Eye className="h-4 w-4" />;
      default:
        return <File className="h-4 w-4" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'upload':
        return 'bg-green-100 text-green-800';
      case 'download':
        return 'bg-blue-100 text-blue-800';
      case 'delete':
        return 'bg-red-100 text-red-800';
      case 'view':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) {
      return 'Just now';
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getFileName = (filePath: string) => {
    return filePath.split('/').pop() || filePath;
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return (
    <Alert variant="destructive">
      <Terminal className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>Failed to load file access history: {error.message}</AlertDescription>
    </Alert>
  );

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>File</TableHead>
                <TableHead>Path</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHistory && filteredHistory.length > 0 ? (
                filteredHistory.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-quikle-slate" />
                        {log.employees?.first_name} {log.employees?.last_name}
                      </div>
                    </TableCell>
                    <TableCell>{log.employees?.email}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-quikle-slate" />
                        <div>
                          <div className="text-sm">
                            {new Date(log.accessed_at).toLocaleString()}
                          </div>
                          <div className="text-xs text-quikle-slate">
                            {formatTimestamp(log.accessed_at)}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`flex items-center gap-1 w-fit ${getActionColor(log.action)}`}>
                        {getActionIcon(log.action)}
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <File className="h-4 w-4 text-quikle-slate" />
                        <span className="font-medium">{getFileName(log.file_path)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate text-xs text-quikle-slate" title={log.file_path}>
                        {log.file_path}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <File className="h-8 w-8 text-quikle-slate" />
                      <p className="text-quikle-slate">No file access history found.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default FileAccessHistoryList;
