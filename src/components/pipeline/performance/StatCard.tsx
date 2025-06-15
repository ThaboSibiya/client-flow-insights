
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactElement;
  valueClassName?: string;
}

const StatCard = ({ title, value, icon, valueClassName }: StatCardProps) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className={cn("text-2xl font-bold", valueClassName)}>
              {value}
            </p>
          </div>
          {icon}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
