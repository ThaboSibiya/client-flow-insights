
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const CustomerTableSkeleton = () => {
  return (
    <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/30 border-b border-border">
            <tr>
              <th className="w-12 px-4 py-3"><Skeleton className="h-4 w-4" /></th>
              <th className="text-left px-4 py-3"><Skeleton className="h-4 w-16" /></th>
              <th className="text-left px-4 py-3"><Skeleton className="h-4 w-16" /></th>
              <th className="text-left px-4 py-3"><Skeleton className="h-4 w-16" /></th>
              <th className="text-left px-4 py-3"><Skeleton className="h-4 w-16" /></th>
              <th className="text-left px-4 py-3"><Skeleton className="h-4 w-16" /></th>
              <th className="w-12 px-4 py-3"><Skeleton className="h-4 w-8" /></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {Array.from({ length: 5 }).map((_, index) => (
              <tr key={index}>
                <td className="px-4 py-3"><Skeleton className="h-4 w-4" /></td>
                <td className="px-4 py-3"><Skeleton className="h-4 w-32" /></td>
                <td className="px-4 py-3"><Skeleton className="h-4 w-40" /></td>
                <td className="px-4 py-3"><Skeleton className="h-6 w-16 rounded-full" /></td>
                <td className="px-4 py-3"><Skeleton className="h-4 w-12" /></td>
                <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                <td className="px-4 py-3"><Skeleton className="h-6 w-6" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20">
        <Skeleton className="h-4 w-32" />
        <div className="flex items-center gap-1">
          <Skeleton className="h-7 w-7" />
          <Skeleton className="h-7 w-7" />
          <Skeleton className="h-7 w-7" />
        </div>
      </div>
    </div>
  );
};

export default CustomerTableSkeleton;
