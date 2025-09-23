
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { useEmployeePrivileges } from '@/hooks/useEmployeePrivileges';

export const useLocation = () => {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const { canUpdateCustomerStatusOnsite } = useEmployeePrivileges();

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          console.log('Location captured:', position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.warn('Location access denied:', error);
          toast({
            title: "Location Access",
            description: "Location access denied. Job completion will be recorded without location data.",
            variant: "destructive"
          });
        }
      );
    }
  };

  useEffect(() => {
    // Only request location if user has onsite privileges
    if (canUpdateCustomerStatusOnsite) {
      getCurrentLocation();
    }
  }, [canUpdateCustomerStatusOnsite]);

  return { location };
};
