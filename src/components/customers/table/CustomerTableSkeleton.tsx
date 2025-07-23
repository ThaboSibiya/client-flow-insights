
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const CustomerTableSkeleton = () => {
  return (
    <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="w-12 px-4 py-3">
                <Skeleton className="h-4 w-4" />
              </th>
              <th className="text-left px-4 py-3">
                <Skeleton className="h-4 w-16" />
              </th>
              <th className="text-left px-4 py-3">
                <Skeleton className="h-4 w-16" />
              </th>
              <th className="text-left px-4 py-3">
                <Skeleton className="h-4 w-16" />
              </th>
              <th className="text-left px-4 py-3">
                <Skeleton className="h-4 w-16" />
              </th>
              <th className="text-left px-4 py-3">
                <Skeleton className="h-4 w-16" />
              </th>
              <th className="text-left px-4 py-3">
                <Skeleton className="h-4 w-16" />
              </th>
              <th className="w-16 px-4 py-3">
                <Skeleton className="h-4 w-8" />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {Array.from({ length: 5 }).map((_, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Skeleton className="h-4 w-4" />
                </td>
                <td className="px-4 py-3">
                  <Skeleton className="h-4 w-32" />
                </td>
                <td className="px-4 py-3">
                  <Skeleton className="h-4 w-40" />
                </td>
                <td className="px-4 py-3">
                  <Skeleton className="h-4 w-24" />
                </td>
                <td className="px-4 py-3">
                  <Skeleton className="h-6 w-16 rounded-full" />
                </td>
                <td className="px-4 py-3">
                  <Skeleton className="h-4 w-8" />
                </td>
                <td className="px-4 py-3">
                  <Skeleton className="h-4 w-20" />
                </td>
                <td className="px-4 py-3">
                  <Skeleton className="h-8 w-8" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
        <Skeleton className="h-4 w-48" />
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
    </div>
  );
};

export default CustomerTableSkeleton;
