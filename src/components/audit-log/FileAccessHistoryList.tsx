
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getFileAccessHistory } from '@/services/auditLogService';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import LoadingSpinner from '../auth/LoadingSpinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

interface FileAccessHistoryListProps {
  searchTerm: string;
}

const FileAccessHistoryList = ({ searchTerm }: FileAccessHistoryListProps) => {
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
                <TableHead>File Path</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHistory && filteredHistory.length > 0 ? (
                filteredHistory.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{log.employees?.first_name} {log.employees?.last_name}</TableCell>
                    <TableCell>{log.employees?.email}</TableCell>
                    <TableCell>{new Date(log.accessed_at).toLocaleString()}</TableCell>
                    <TableCell>{log.action}</TableCell>
                    <TableCell className="max-w-xs truncate">{log.file_path}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">No file access history found.</TableCell>
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
