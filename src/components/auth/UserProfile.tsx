
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';

const UserProfile = () => {
  const { user, signOut } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="flex items-center gap-3 p-3 border-t border-gray-200">
      <div className="flex items-center gap-2 flex-1">
        <div className="w-8 h-8 bg-quikle-primary rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {user.email}
          </p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={signOut}
        className="h-8 w-8 p-0"
      >
        <LogOut className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default UserProfile;
