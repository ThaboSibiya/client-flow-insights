
import { useState, useEffect } from 'react';

export const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      // Check for mobile viewport
      const mobileViewport = window.innerWidth <= 768;
      
      // Check for touch capability
      const touchCapable = 'ontouchstart' in window || 
                          navigator.maxTouchPoints > 0 || 
                          (navigator as any).msMaxTouchPoints > 0;
      
      setIsMobile(mobileViewport);
      setIsTouchDevice(touchCapable);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);

    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return { 
    isMobile, 
    isTouchDevice,
    shouldUseMobileView: isMobile || isTouchDevice 
  };
};
