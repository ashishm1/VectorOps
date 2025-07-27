
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Receipt } from './types';
import { useAuth } from './auth';

interface ReceiptsContextType {
  receipts: Receipt[];
  setReceipts: React.Dispatch<React.SetStateAction<Receipt[]>>;
  addReceipt: (receipt: Receipt) => void;
  refreshReceipts: () => Promise<void>;
  isLoading: boolean;
}

const ReceiptsContext = createContext<ReceiptsContextType | undefined>(undefined);

export function ReceiptsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const refreshReceipts = async () => {
    if (!user?.email) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/receipts?email=${encodeURIComponent(user.email)}`);
      if (response.ok) {
        const data = await response.json();
        setReceipts(data.receipts || []);
      }
    } catch (error) {
      console.error('Failed to fetch receipts:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const addReceipt = (newReceipt: Receipt) => {
    setReceipts((prev) => [newReceipt, ...prev]);
  };

  useEffect(() => {
    if (user?.email) {
      refreshReceipts();
    } else {
      setReceipts([]);
    }
  }, [user?.email]);

  return (
    <ReceiptsContext.Provider value={{ receipts, setReceipts, addReceipt, refreshReceipts, isLoading }}>
      {children}
    </ReceiptsContext.Provider>
  );
}

export function useReceipts() {
  const context = useContext(ReceiptsContext);
  if (context === undefined) {
    throw new Error('useReceipts must be used within a ReceiptsProvider');
  }
  return context;
}
