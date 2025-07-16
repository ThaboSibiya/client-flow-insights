
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatusCardProps {
  title: string;
  count: number;
  icon: React.ReactNode;
  color: string;
}

const StatusCard = ({ title, count, icon, color }: StatusCardProps) => {
  return (
    <Card className="shadow-md hover:shadow-lg transform hover:translate-y-[-3px] transition-all duration-300 border border-white/40">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-quikle-slate">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <span className="text-3xl font-bold bg-gradient-to-br from-quikle-charcoal to-quikle-primary bg-clip-text text-transparent">{count}</span>
          <div className={`p-3 rounded-full ${color} shadow-lg transform hover:scale-105 transition-transform`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusCard;
