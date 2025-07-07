
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Database } from "lucide-react";

interface CacheStatsCardProps {
  cacheSize: number;
}

const CacheStatsCard = ({ cacheSize }: CacheStatsCardProps) => {
  const maxCacheSize = 4096; // 4GB max cache
  const cacheUsagePercent = (cacheSize / maxCacheSize) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Cache Statistics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Cache Usage</span>
              <span className="text-sm text-muted-foreground">
                {cacheSize}MB / {maxCacheSize}MB
              </span>
            </div>
            <Progress value={cacheUsagePercent} />
          </div>
          
          <div className="text-xs text-muted-foreground">
            <p>Cache hit rate: 94.2%</p>
            <p>Average response time: 45ms</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CacheStatsCard;
