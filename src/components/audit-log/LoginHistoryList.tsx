
import React, { useMemo, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getLoginHistory, LoginHistoryEntry } from '@/services/auditLogService';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Terminal } from 'lucide-react';
import LoadingSpinner from '../auth/LoadingSpinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface LoginHistoryListProps {
  searchTerm: string;
}

const PAGE_SIZE = 25;

const LoginHistoryList = ({ searchTerm }: LoginHistoryListProps) => {
  const { data: history, isLoading, error } = useQuery({
    queryKey: ['loginHistory'],
    queryFn: getLoginHistory,
    staleTime: 60_000,
  });

  const [page, setPage] = useState(1);

  const filteredHistory = useMemo(() => {
    const search = searchTerm.toLowerCase();
    return (history || []).filter((log: LoginHistoryEntry) => {
      const employee = log.employees;
      return (
        employee?.first_name?.toLowerCase().includes(search) ||
        employee?.last_name?.toLowerCase().includes(search) ||
        employee?.email?.toLowerCase().includes(search) ||
        log.ip_address?.toLowerCase().includes(search) ||
        log.user_agent?.toLowerCase().includes(search)
      );
    });
  }, [history, searchTerm]);

  useEffect(() => setPage(1), [searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredHistory.length / PAGE_SIZE));
  const pageRows = filteredHistory.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (isLoading) return <LoadingSpinner />;
  if (error) return (
    <Alert variant="destructive">
      <Terminal className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>Failed to load login history: {(error as Error).message}</AlertDescription>
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
                <TableHead>IP Address</TableHead>
                <TableHead>User Agent</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageRows.length > 0 ? (
                pageRows.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{log.employees?.first_name} {log.employees?.last_name}</TableCell>
                    <TableCell>{log.employees?.email}</TableCell>
                    <TableCell>{new Date(log.login_timestamp).toLocaleString()}</TableCell>
                    <TableCell>{log.ip_address}</TableCell>
                    <TableCell className="max-w-xs truncate">{log.user_agent}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">No login history found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {filteredHistory.length > PAGE_SIZE && (
          <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
            <span>
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredHistory.length)} of {filteredHistory.length}
            </span>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft className="h-4 w-4" /> Prev
              </Button>
              <span>Page {page} of {totalPages}</span>
              <Button variant="ghost" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LoginHistoryList;
