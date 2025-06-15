
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

const UserProfile = () => {
  const { user, signOut } = useAuth();
  
  if (!user) return null;
  
  return (
    <div className="flex flex-col items-center space-y-3 border-t border-gray-200 pt-4">
      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-broker-primary to-broker-accent flex items-center justify-center text-white font-medium">
        {user.email?.charAt(0).toUpperCase()}
      </div>
      <div className="text-center">
        <p className="text-sm font-medium truncate max-w-[180px]">{user.email}</p>
        <p className="text-xs text-gray-500">Broker</p>
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={signOut} 
        className="text-xs w-full"
      >
        <LogOut className="mr-2 h-3 w-3" />
        Sign Out
      </Button>
    </div>
  );
};

export default UserProfile;
