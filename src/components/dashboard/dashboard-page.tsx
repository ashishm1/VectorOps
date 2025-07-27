
'use client';

import { useState, useMemo } from 'react';
import type { Receipt } from '@/lib/types';
import { useAuth } from '@/lib/auth';
import { NewUserOnboarding } from './new-user-onboarding';
import { ReceiptDetailsDialog } from './receipt-details-dialog';
import { ReceiptUploadButton } from './receipt-upload-button';
import { Chatbot } from './chatbot';
import { useReceipts } from '@/lib/receipts-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CategoryDistributionChart } from './category-distribution-chart';
import { useQuotas } from '@/lib/quotas-context';
import { startOfMonth } from 'date-fns';
import { ActionableInsightsCarousel } from './actionable-insights-carousel';
import { calculateMonthlyCategorySpending } from '@/lib/utils';
import { FinancialHealthGauge } from './financial-health-gauge';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { RecurringPayments } from './recurring-payments';


export function DashboardPage() {
  const { user } = useAuth();
  const { receipts, addReceipt } = useReceipts();
  const { quotas } = useQuotas();
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);

  const userReceipts = useMemo(() => {
    if (!receipts || !user) return [];
    return receipts
      .filter((receipt) => {
        if (receipt.userId === user.email) return true;
        if (receipt.splitInfo?.participants.some(p => p.email === user.email)) return true;
        return false;
      })
      .sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime());
  }, [receipts, user]);

  const { totalSpentThisMonth, categorySpending } = useMemo(() => {
    if (!user) return { totalSpentThisMonth: 0, categorySpending: {} };
    
    const spending = calculateMonthlyCategorySpending(userReceipts, user.email);
    const total = Object.values(spending).reduce((sum, val) => sum + val, 0);

    return { 
        totalSpentThisMonth: total, 
        categorySpending: spending
    };

  }, [userReceipts, user]);

  const payoutsReceivedThisMonth = useMemo(() => {
    if (!user) return 0;
    const startOfCurrentMonth = startOfMonth(new Date());

    return receipts.reduce((total, receipt) => {
      if (
        receipt.splitInfo?.payer === user.email &&
        new Date(receipt.transactionDate) >= startOfCurrentMonth
      ) {
        const settledAmount = receipt.splitInfo.participants.reduce((sum, p) => {
          // Count payouts from others that are now settled
          if (p.email !== user.email && p.status === 'settled') {
            return sum + p.share;
          }
          return sum;
        }, 0);
        return total + settledAmount;
      }
      return total;
    }, 0);
  }, [receipts, user]);

  const totalQuota = useMemo(() => {
    return Object.values(quotas).reduce((sum, q) => sum + q, 0);
  }, [quotas]);

  const utilizationScore = totalQuota > 0 ? (totalSpentThisMonth / totalQuota) * 100 : 0;

  if (!receipts) {
    return (
       <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }
  
  const hasUsedBefore = userReceipts.length > 0;

  return (
    <div className="flex h-full flex-col gap-8">
      {!hasUsedBefore ? (
         <NewUserOnboarding onUpload={addReceipt} />
      ) : (
        <>
         <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground">
                An overview of your recent receipts and spending.
              </p>
            </div>
            <ReceiptUploadButton setReceipts={addReceipt} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             <Card className="col-span-1 md:col-span-2 lg:col-span-1">
                <CardHeader>
                    <CardTitle>Monthly Utilization</CardTitle>
                    <CardDescription>Your spending vs. your quota.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center p-6">
                    <FinancialHealthGauge score={utilizationScore} />
                </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Spent (This Month)</CardTitle>
                <ArrowDownLeft className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{totalSpentThisMonth.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                   Compared to your average spend
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Payouts Received (This Month)</CardTitle>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                 <div className="text-2xl font-bold">₹{payoutsReceivedThisMonth.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                    From settled splits where you were the payer
                </p>
              </CardContent>
            </Card>
          </div>
          
           <ActionableInsightsCarousel receipts={userReceipts} quotas={quotas} />

           <Card>
              <CardHeader>
                <CardTitle>Categorical Distribution</CardTitle>
                <CardDescription>How you spent your money this month.</CardDescription>
              </CardHeader>
              <CategoryDistributionChart receipts={userReceipts} />
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RecurringPayments receipts={userReceipts}/>
            </div>
          
        </>
      )}

      <ReceiptDetailsDialog
        receipt={selectedReceipt}
        isOpen={!!selectedReceipt}
        onOpenChange={(isOpen) => !isOpen && setSelectedReceipt(null)}
      />
      {hasUsedBefore && <Chatbot receipts={userReceipts} />}
    </div>
  );
}
