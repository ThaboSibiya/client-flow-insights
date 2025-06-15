
import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';

export const AutomationSettingsSkeleton = () => (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <Skeleton className="h-9 w-64 rounded-lg" />
            <Skeleton className="h-10 w-28 rounded-lg" />
        </div>
        {[...Array(3)].map((_, i) => (
            <Card key={i}>
                <CardHeader>
                    <Skeleton className="h-6 w-48 rounded-lg" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-16 w-full rounded-lg" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                    <Skeleton className="h-24 w-full rounded-lg" />
                </CardContent>
            </Card>
        ))}
    </div>
);
