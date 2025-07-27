
'use client';

import { useState, useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { Receipt } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { subMonths, startOfMonth } from 'date-fns';

interface MonthlyTrendChartProps {
  receipts: Receipt[];
}

export function MonthlyTrendChart({ receipts }: MonthlyTrendChartProps) {
  const [timeRange, setTimeRange] = useState<string>('3');

  const filteredReceipts = useMemo(() => {
    const months = parseInt(timeRange);
    const endDate = new Date();
    const startDate = startOfMonth(subMonths(endDate, months - 1));
    return receipts.filter(r => new Date(r.transactionDate) >= startDate);
  }, [receipts, timeRange]);

  const monthlyData = useMemo(() => {
    const data = filteredReceipts.reduce((acc, receipt) => {
      const month = new Date(receipt.transactionDate).toLocaleString('default', { month: 'short', year: '2-digit' });
      const existingMonth = acc.find((d) => d.month === month);
      if (existingMonth) {
        existingMonth.total += receipt.totalAmount;
      } else {
        acc.push({ month, total: receipt.totalAmount });
      }
      return acc;
    }, [] as { month: string; total: number }[]);

    // Ensure chronological order
    data.sort((a, b) => {
        const aDate = new Date(`01 ${a.month.replace("'", " 20")}`);
        const bDate = new Date(`01 ${b.month.replace("'", " 20")}`);
        return aDate.getTime() - bDate.getTime();
    });
    return data;
  }, [filteredReceipts]);


  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>Monthly Spending Trend</CardTitle>
            <CardDescription>Your spending overview for the selected period.</CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="3">Last 3 Months</SelectItem>
                <SelectItem value="6">Last 6 Months</SelectItem>
                <SelectItem value="9">Last 9 Months</SelectItem>
                <SelectItem value="12">Last Year</SelectItem>
            </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {monthlyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis
                tickFormatter={(value) =>
                  new Intl.NumberFormat('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                    notation: 'compact',
                  }).format(value as number)
                }
              />
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                }}
                formatter={(value) =>
                  new Intl.NumberFormat('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                  }).format(value as number)
                }
              />
              <Legend />
              <Bar dataKey="total" fill="hsl(var(--primary))" name="Total Spend" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
             <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                No spending data available for this period.
            </div>
        )}
      </CardContent>
    </Card>
  );
}
