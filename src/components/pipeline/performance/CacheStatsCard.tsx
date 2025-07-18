
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database } from "lucide-react";

interface CacheStatsCardProps {
  cacheSize: number;
}

const CacheStatsCard = ({ cacheSize }: CacheStatsCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-purple-500" />
          Cache Statistics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Cached Items</p>
            <p className="text-xl font-semibold">{cacheSize}</p>
          </div>
          <Badge variant={cacheSize > 0 ? 'default' : 'secondary'}>
            {cacheSize > 0 ? 'Active' : 'Empty'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default CacheStatsCard;
