
import { useState, useEffect } from 'react';

export const useMobileDetection = () => {
  const [shouldUseMobileView, setShouldUseMobileView] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      // Check screen width
      const isMobileWidth = window.innerWidth < 768;
      
      // Check user agent for mobile devices
      const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
      
      // Check touch capability
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      setShouldUseMobileView(isMobileWidth || (isMobileUA && isTouchDevice));
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return { shouldUseMobileView };
};
