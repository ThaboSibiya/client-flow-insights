import React from 'react';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface ImportProgressProps {
  progress: number;
}

const ImportProgress = ({ progress }: ImportProgressProps) => (
  <Card>
    <CardContent className="p-10 text-center space-y-5">
      <div className="relative w-fit mx-auto">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
      <div>
        <h3 className="font-medium text-foreground">Importing your data…</h3>
        <p className="text-sm text-muted-foreground mt-1">Please don't close this page</p>
      </div>
      <div className="max-w-xs mx-auto space-y-2">
        <Progress value={progress} />
        <p className="text-xs text-muted-foreground">{Math.min(progress, 100)}% complete</p>
      </div>
    </CardContent>
  </Card>
);

export default ImportProgress;
