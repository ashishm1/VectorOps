
'use client';

import { useState, useMemo } from 'react';
import { useQuotas } from '@/lib/quotas-context';
import { useReceipts } from '@/lib/receipts-context';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { cn, calculateMonthlyCategorySpending } from '@/lib/utils';

const categories = [
  'Home', 'Food', 'Health', 'Restaurant', 'Shopping', 'Travel', 'Entertainment', 'Fuel', 'Other'
];

const currencySymbol = '₹';

export function QuotasPage() {
  const { user } = useAuth();
  const { receipts } = useReceipts();
  const { quotas, setQuota } = useQuotas();
  const { toast } = useToast();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [newQuota, setNewQuota] = useState<number | string>('');

  const monthlySpending = useMemo(() => {
    if (!user || !receipts) return {};
    return calculateMonthlyCategorySpending(receipts, user.email);
  }, [receipts, user]);
  
  const averageSpending = useMemo(() => {
    if (!user || !receipts) return {};
    const spending: { [key: string]: { total: number, months: Set<string> } } = {};
    
    receipts.forEach(receipt => {
      // Consider receipts where the user is the owner or a participant
      if (receipt.userId === user.email || receipt.splitInfo?.participants.some(p => p.email === user.email)) {
        
        // Find my share for this receipt
        const myShare = receipt.splitInfo 
          ? receipt.splitInfo.participants.find(p => p.email === user.email)?.share ?? 0 
          : receipt.totalAmount;

        const shareRatio = receipt.totalAmount > 0 ? myShare / receipt.totalAmount : 0;

        receipt.lineItems.forEach(item => {
            const category = item.category;
            // My portion of the item's cost is proportional to my share of the total bill
            let itemCost = (item.price * item.quantity) * shareRatio;

            if (!spending[category]) {
                spending[category] = { total: 0, months: new Set() };
            }
            
            spending[category].total += itemCost;
            spending[category].months.add(receipt.transactionDate.substring(0, 7)); // YYYY-MM
        });
      }
    });

    const averages: { [key: string]: number } = {};
    for (const category in spending) {
      const numMonths = spending[category].months.size || 1;
      averages[category] = spending[category].total / numMonths;
    }
    return averages;
  }, [receipts, user]);

  const handleOpenDialog = (category: string) => {
    setSelectedCategory(category);
    setNewQuota(quotas[category] || '');
  };

  const handleSetQuota = () => {
    if (selectedCategory && typeof newQuota === 'number' && newQuota >= 0) {
      setQuota(selectedCategory, newQuota);
      toast({
        title: 'Quota Updated',
        description: `Your spending quota for ${selectedCategory} is now ${currencySymbol}${newQuota}.`,
      });
      setSelectedCategory(null);
    } else {
        toast({
            title: 'Invalid Input',
            description: `Please enter a valid number for the quota.`,
            variant: 'destructive',
        });
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress > 95) return '[&>div]:bg-red-500';
    if (progress > 60) return '[&>div]:bg-yellow-500';
    if (progress > 40) return '[&>div]:bg-gray-400';
    return '[&>div]:bg-green-500';
  };

  return (
    <div className="flex h-full flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Spending Quotas</h1>
        <p className="text-muted-foreground">
          Manage your monthly spending limits for each category.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map(category => {
          const spend = monthlySpending[category] || 0;
          const quota = quotas[category] || 0;
          const progress = quota > 0 ? (spend / quota) * 100 : 0;
          const avg = averageSpending[category] || 0;

          return (
            <Card key={category}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>{category}</CardTitle>
                  <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(category)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription>
                    {avg > 0 ? `Avg. spend: ${currencySymbol}${avg.toFixed(0)}/month` : 'No spending history'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span>{currencySymbol}{spend.toFixed(0)}</span>
                    <span className="text-muted-foreground">{quota > 0 ? `${currencySymbol}${quota}`: 'No quota set'}</span>
                  </div>
                  {quota > 0 && (
                    <Progress value={progress} className={cn(getProgressColor(progress))} />
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={!!selectedCategory} onOpenChange={() => setSelectedCategory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Quota for {selectedCategory}</DialogTitle>
            <DialogDescription>
                Set a monthly spending limit. We'll alert you if you get close to it. Your average spend is {currencySymbol}{ (averageSpending[selectedCategory!] || 0).toFixed(0)}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
             <div className="space-y-2">
                <Label htmlFor="quota">Monthly Quota ({currencySymbol})</Label>
                <Input
                    id="quota"
                    type="number"
                    value={newQuota}
                    onChange={(e) => setNewQuota(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    placeholder="e.g. 5000"
                />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">Cancel</Button>
            </DialogClose>
            <Button type="button" onClick={handleSetQuota}>Save Quota</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
