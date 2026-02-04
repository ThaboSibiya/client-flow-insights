import { useState, useEffect } from 'react';

interface SafeAreaInsets {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export function useSafeArea(): SafeAreaInsets {
  const [insets, setInsets] = useState<SafeAreaInsets>({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  });

  useEffect(() => {
    const computeInsets = () => {
      const computedStyle = getComputedStyle(document.documentElement);
      
      setInsets({
        top: parseInt(computedStyle.getPropertyValue('--sat') || '0', 10) || 
             parseInt(computedStyle.getPropertyValue('env(safe-area-inset-top)') || '0', 10),
        bottom: parseInt(computedStyle.getPropertyValue('--sab') || '0', 10) ||
                parseInt(computedStyle.getPropertyValue('env(safe-area-inset-bottom)') || '0', 10),
        left: parseInt(computedStyle.getPropertyValue('--sal') || '0', 10) ||
              parseInt(computedStyle.getPropertyValue('env(safe-area-inset-left)') || '0', 10),
        right: parseInt(computedStyle.getPropertyValue('--sar') || '0', 10) ||
               parseInt(computedStyle.getPropertyValue('env(safe-area-inset-right)') || '0', 10),
      });
    };

    computeInsets();
    window.addEventListener('resize', computeInsets);
    return () => window.removeEventListener('resize', computeInsets);
  }, []);

  return insets;
}

export function useSafeAreaStyle() {
  return {
    paddingTop: 'env(safe-area-inset-top)',
    paddingBottom: 'env(safe-area-inset-bottom)',
    paddingLeft: 'env(safe-area-inset-left)',
    paddingRight: 'env(safe-area-inset-right)',
  };
}
