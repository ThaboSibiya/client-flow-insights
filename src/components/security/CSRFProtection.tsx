
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { generateCSRFToken } from '@/utils/securityUtils';

interface CSRFContextType {
  token: string;
  refreshToken: () => void;
}

const CSRFContext = createContext<CSRFContextType | undefined>(undefined);

export const CSRFProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string>('');

  const refreshToken = () => {
    const newToken = generateCSRFToken();
    setToken(newToken);
    sessionStorage.setItem('csrf_token', newToken);
  };

  useEffect(() => {
    // Check if token exists in session storage
    const existingToken = sessionStorage.getItem('csrf_token');
    if (existingToken) {
      setToken(existingToken);
    } else {
      refreshToken();
    }
  }, []);

  return (
    <CSRFContext.Provider value={{ token, refreshToken }}>
      {children}
    </CSRFContext.Provider>
  );
};

export const useCSRF = (): CSRFContextType => {
  const context = useContext(CSRFContext);
  if (!context) {
    throw new Error('useCSRF must be used within a CSRFProvider');
  }
  return context;
};

// HOC for protecting sensitive components
export const withCSRFProtection = <P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> => {
  return (props: P) => {
    const { token } = useCSRF();
    
    if (!token) {
      return <div>Loading security context...</div>;
    }

    return <Component {...props} />;
  };
};
