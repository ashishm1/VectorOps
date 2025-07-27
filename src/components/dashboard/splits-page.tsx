
'use client';

import { useState, useMemo, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import type { Receipt, SplitParticipant } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ArrowDownLeft, ArrowUpRight, Check, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useReceipts } from '@/lib/receipts-context';

const currencySymbol = '₹';

interface SplitTransaction {
  receipt: Receipt;
  participant: SplitParticipant;
  type: 'owe' | 'owed';
}

interface UserSplitSummary {
  email: string;
  netBalance: number; // +ve if they owe me, -ve if I owe them
  transactions: SplitTransaction[];
}

export function SplitsPage() {
  const { user } = useAuth();
  const { receipts, setReceipts, refreshReceipts } = useReceipts();
  const { toast } = useToast();
  const [loadingStates, setLoadingStates] = useState<{[key: string]: boolean}>({});
  
  const { iOwe, iAmOwed, splitSummary } = useMemo(() => {
    if (!user || !receipts) return { iOwe: [], iAmOwed: [], splitSummary: [] };

    const iOwe: SplitTransaction[] = [];
    const iAmOwed: SplitTransaction[] = [];
    const balances: { [email: string]: { balance: number; transactions: SplitTransaction[] } } = {};

    receipts.forEach(r => {
      if (r.splitInfo?.isSplit) {
        // Find what I owe to others (I am a participant who owes money)
        const myParticipantInfo = r.splitInfo.participants.find(p => p.email === user.email);
        if (myParticipantInfo && myParticipantInfo.owes > 0) {
          const transaction: SplitTransaction = { receipt: r, participant: myParticipantInfo, type: 'owe' };
          iOwe.push(transaction);

          // Add to the person I owe money to
          const payer = r.splitInfo.payer;
          if (!balances[payer]) balances[payer] = { balance: 0, transactions: [] };
          balances[payer].balance += myParticipantInfo.owes; // They are owed money
          balances[payer].transactions.push(transaction);
        }

        // Find what others owe me (I am the payer, others owe me money)
        if (r.splitInfo.payer === user.email) {
          r.splitInfo.participants.forEach(p => {
            if (p.email !== user.email && p.owes > 0) {
              const transaction: SplitTransaction = { receipt: r, participant: p, type: 'owed' };
              iAmOwed.push(transaction);
              
              // Add to the person who owes me money
              const participantEmail = p.email;
              if (!balances[participantEmail]) balances[participantEmail] = { balance: 0, transactions: [] };
              balances[participantEmail].balance -= p.owes; // They owe money
              balances[participantEmail].transactions.push(transaction);
            }
          });
        }
      }
    });
    
    const summary: UserSplitSummary[] = Object.entries(balances)
      .map(([email, data]) => ({
        email,
        netBalance: data.balance,
        transactions: data.transactions,
      }))
      .sort((a,b) => b.netBalance - a.netBalance);

    return { iOwe, iAmOwed, splitSummary: summary };
  }, [receipts, user]);
  
  const handleSettleUp = useCallback(async (receiptId: string, myEmail: string) => {
    const actionKey = `settle-${receiptId}-${myEmail}`;
    setLoadingStates(prev => ({ ...prev, [actionKey]: true }));
    
    try {
      // Optimistic update - immediately update the UI
      setReceipts(prevReceipts => {
        if (!prevReceipts) return prevReceipts;
        return prevReceipts.map(receipt => {
          if (receipt.id === receiptId && receipt.splitInfo?.isSplit) {
            return {
              ...receipt,
              splitInfo: {
                ...receipt.splitInfo,
                participants: receipt.splitInfo.participants.map(participant => {
                  if (participant.email === myEmail) {
                    return { ...participant, status: 'pending' };
                  }
                  return participant;
                })
              }
            };
          }
          return receipt;
        });
      });

      const response = await fetch(`/api/receipts/${receiptId}/settle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiptId,
          participantEmail: myEmail,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to settle up');
      }

      toast({
        title: "Settlement Pending",
        description: "The payer has been notified that you have settled your share.",
      });
      
      // Refresh data in background
      setTimeout(() => {
        refreshReceipts();
      }, 1000);
      
    } catch (error) {
      console.error('Error settling up:', error);
      
      // Revert optimistic update on error
      setReceipts(prevReceipts => {
        if (!prevReceipts) return prevReceipts;
        return prevReceipts.map(receipt => {
          if (receipt.id === receiptId && receipt.splitInfo?.isSplit) {
            return {
              ...receipt,
              splitInfo: {
                ...receipt.splitInfo,
                participants: receipt.splitInfo.participants.map(participant => {
                  if (participant.email === myEmail) {
                    return { ...participant, status: 'unsettled' };
                  }
                  return participant;
                })
              }
            };
          }
          return receipt;
        });
      });
      
      toast({
        title: "Error",
        description: "Failed to settle up. Please try again.",
        variant: 'destructive',
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, [actionKey]: false }));
    }
  }, [setReceipts, refreshReceipts, toast]);
  
  const handleConfirmReceipt = useCallback(async (receiptId: string, participantEmail: string) => {
    const actionKey = `confirm-${receiptId}-${participantEmail}`;
    setLoadingStates(prev => ({ ...prev, [actionKey]: true }));
    
    try {
      // Optimistic update - immediately update the UI
      setReceipts(prevReceipts => {
        if (!prevReceipts) return prevReceipts;
        return prevReceipts.map(receipt => {
          if (receipt.id === receiptId && receipt.splitInfo?.isSplit) {
            return {
              ...receipt,
              splitInfo: {
                ...receipt.splitInfo,
                participants: receipt.splitInfo.participants.map(participant => {
                  if (participant.email === participantEmail) {
                    return { ...participant, status: 'settled', owes: 0 };
                  }
                  return participant;
                })
              }
            };
          }
          return receipt;
        });
      });

      const response = await fetch(`/api/receipts/${receiptId}/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiptId,
          participantEmail,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to confirm payment');
      }

      toast({
        title: "Settlement Confirmed",
        description: `You have confirmed receipt of payment from ${participantEmail}.`,
      });
      
      // Refresh data in background
      setTimeout(() => {
        refreshReceipts();
      }, 1000);
      
    } catch (error) {
      console.error('Error confirming payment:', error);
      
      // Revert optimistic update on error
      setReceipts(prevReceipts => {
        if (!prevReceipts) return prevReceipts;
        return prevReceipts.map(receipt => {
          if (receipt.id === receiptId && receipt.splitInfo?.isSplit) {
            return {
              ...receipt,
              splitInfo: {
                ...receipt.splitInfo,
                participants: receipt.splitInfo.participants.map(participant => {
                  if (participant.email === participantEmail) {
                    return { ...participant, status: 'pending' };
                  }
                  return participant;
                })
              }
            };
          }
          return receipt;
        });
      });
      
      toast({
        title: "Error",
        description: "Failed to confirm payment. Please try again.",
        variant: 'destructive',
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, [actionKey]: false }));
    }
  }, [setReceipts, refreshReceipts, toast]);

  const totalOwedToMe = iAmOwed.reduce((acc, { participant }) => acc + ((participant.status && participant.status !== 'settled') ? participant.owes : 0), 0);
  const totalIOwe = iOwe.reduce((acc, { participant }) => acc + ((participant.status && participant.status !== 'settled') ? participant.owes : 0), 0);
  
  if (!receipts) {
    return (
       <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Splits</h1>
        <p className="text-muted-foreground">Manage your shared expenses.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-red-600 dark:text-red-400">
               <ArrowDownLeft />
              <span>You Owe</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-800 dark:text-red-300">{currencySymbol}{totalIOwe.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-green-600 dark:text-green-400">
              <ArrowUpRight />
              <span>You Are Owed</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-800 dark:text-green-300">{currencySymbol}{totalOwedToMe.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
          <CardHeader>
              <CardTitle>Splits Summary</CardTitle>
          </CardHeader>
          <CardContent>
              {splitSummary.length > 0 ? (
                  <Accordion type="single" collapsible className="w-full">
                      {splitSummary.map(summary => (
                          <AccordionItem value={summary.email} key={summary.email}>
                              <AccordionTrigger className="hover:no-underline">
                                  <div className="flex justify-between items-center w-full">
                                      <span className="font-semibold">{summary.email}</span>
                                      {summary.netBalance > 0 ? (
                                          <span className="text-green-600">Owes you {currencySymbol}{summary.netBalance.toFixed(2)}</span>
                                      ) : (
                                          <span className="text-red-600">You owe {currencySymbol}{Math.abs(summary.netBalance).toFixed(2)}</span>
                                      )}
                                  </div>
                              </AccordionTrigger>
                              <AccordionContent>
                                  <div className="space-y-4 pl-4 border-l-2 ml-2">
                                      {/* Individual Transaction Rows */}
                                      <div className="space-y-2">
                                          {summary.transactions.map((transaction, index) => (
                                              <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                                  <div className="flex-grow">
                                                      <div className="flex items-center gap-3">
                                                          <div className="text-sm font-medium">
                                                              {transaction.receipt.merchantName}
                                                          </div>
                                                          <Badge variant="outline" className="text-xs">
                                                              {transaction.type === 'owe' ? 'You Owe' : 'You Are Owed'}
                                                          </Badge>
                                                      </div>
                                                      <div className="text-xs text-muted-foreground mt-1">
                                                          {new Date(transaction.receipt.transactionDate).toLocaleDateString()} • 
                                                          ₹{transaction.participant.owes.toFixed(2)}
                                                      </div>
                                                  </div>
                                                  
                                                  <div className="flex items-center gap-2">
                                                      {/* Show appropriate button based on transaction type and status */}
                                                      {transaction.type === 'owe' && transaction.participant.status === 'unsettled' && (
                                                          <Button 
                                                              onClick={() => handleSettleUp(transaction.receipt.id, transaction.participant.email)}
                                                              size="sm"
                                                              variant="default"
                                                              disabled={loadingStates[`settle-${transaction.receipt.id}-${transaction.participant.email}`]}
                                                          >
                                                              {loadingStates[`settle-${transaction.receipt.id}-${transaction.participant.email}`] ? (
                                                                  <Clock className="mr-2 h-4 w-4 animate-spin" />
                                                              ) : (
                                                                  "Settle Up"
                                                              )}
                                                          </Button>
                                                      )}
                                                      
                                                      {transaction.type === 'owe' && transaction.participant.status === 'pending' && (
                                                          <Button size="sm" variant="outline" disabled>
                                                              Pending Confirmation
                                                          </Button>
                                                      )}
                                                      
                                                      {transaction.type === 'owed' && transaction.participant.status === 'pending' && (
                                                          <Button 
                                                              onClick={() => handleConfirmReceipt(transaction.receipt.id, transaction.participant.email)}
                                                              size="sm"
                                                              variant="secondary"
                                                              disabled={loadingStates[`confirm-${transaction.receipt.id}-${transaction.participant.email}`]}
                                                          >
                                                              {loadingStates[`confirm-${transaction.receipt.id}-${transaction.participant.email}`] ? (
                                                                  <Clock className="mr-2 h-4 w-4 animate-spin" />
                                                              ) : (
                                                                  "Confirm Received"
                                                              )}
                                                          </Button>
                                                      )}
                                                      
                                                      {transaction.participant.status === 'settled' && (
                                                          <div className="flex items-center gap-1 text-green-600">
                                                              <Check className="h-4 w-4" />
                                                              <span className="text-sm">Settled</span>
                                                          </div>
                                                      )}
                                                  </div>
                                              </div>
                                          ))}
                                      </div>
                                  </div>
                              </AccordionContent>
                          </AccordionItem>
                      ))}
                  </Accordion>
              ) : (
                  <p className="text-muted-foreground text-center py-8">No active splits. All settled up!</p>
              )}
          </CardContent>
      </Card>
    </div>
  );
}
