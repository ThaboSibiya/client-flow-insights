
import React from 'react';
import { Shield } from 'lucide-react';

const EmptyPermissionsState: React.FC = () => {
  return (
    <div className="text-center py-8 text-muted-foreground">
      <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
      <p>No specific automation permissions granted</p>
      <p className="text-sm">Employee will use general automation privileges</p>
    </div>
  );
};

export default EmptyPermissionsState;
