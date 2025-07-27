
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './auth';

interface QuotasContextType {
  quotas: { [key: string]: number };
  setQuota: (category: string, amount: number) => Promise<void>;
  refreshQuotas: () => Promise<void>;
  isLoading: boolean;
}

const QuotasContext = createContext<QuotasContextType | undefined>(undefined);

export function QuotasProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [quotas, setQuotas] = useState<{ [key: string]: number }>({});
  const [isLoading, setIsLoading] = useState(false);
  
  const refreshQuotas = async () => {
    if (!user?.email) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/quotas?email=${encodeURIComponent(user.email)}`);
      if (response.ok) {
        const data = await response.json();
        setQuotas(data.quotas || {});
      }
    } catch (error) {
      console.error('Failed to fetch quotas:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const setQuota = async (category: string, amount: number) => {
    if (!user?.email) return;
    
    try {
      const response = await fetch('/api/quotas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          category,
          amount,
        }),
      });
      
      if (response.ok) {
        setQuotas((prev) => ({ ...prev, [category]: amount }));
      }
    } catch (error) {
      console.error('Failed to update quota:', error);
    }
  };

  useEffect(() => {
    if (user?.email) {
      refreshQuotas();
    } else {
      setQuotas({});
    }
  }, [user?.email]);

  return (
    <QuotasContext.Provider value={{ quotas, setQuota, refreshQuotas, isLoading }}>
      {children}
    </QuotasContext.Provider>
  );
}

export function useQuotas() {
  const context = useContext(QuotasContext);
  if (context === undefined) {
    throw new Error('useQuotas must be used within a QuotasProvider');
  }
  return context;
}
