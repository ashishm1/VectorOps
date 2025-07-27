
'use client';

import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { Receipt } from '@/lib/types';
import { useAuth } from '@/lib/auth';
import { calculateMonthlyCategorySpending } from '@/lib/utils';
import { CardContent } from '@/components/ui/card';

interface CategoryDistributionChartProps {
  receipts: Receipt[];
}

const COLORS = ['#3B82F6', '#8B5CF6', '#EC4899', '#F97316', '#10B981', '#F59E0B', '#14B8A6', '#6366F1'];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) { // Don't render label for very small slices
    return null;
  }

  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-xs font-bold">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const renderLegend = (data: {name: string, value: number}[]) => (
  <div className="w-full md:w-1/3 space-y-2 text-sm">
      {data.map((entry, index) => (
          <div key={`legend-${index}`} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
              <span className="text-muted-foreground">{entry.name}</span>
            </div>
             <span className="font-medium">
                {new Intl.NumberFormat('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                    minimumFractionDigits: 0,
                }).format(entry.value)}
            </span>
          </div>
      ))}
  </div>
);


export function CategoryDistributionChart({ receipts }: CategoryDistributionChartProps) {
  const { user } = useAuth();
  
  const categoryData = useMemo(() => {
    if (!user) return [];
    
    const monthlySpending = calculateMonthlyCategorySpending(receipts, user.email);

    return Object.entries(monthlySpending).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);
  }, [receipts, user]);


  return (
    <CardContent>
      {categoryData.length > 0 ? (
        <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="h-56 w-full md:w-2/3">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      innerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={renderCustomizedLabel}
                      cornerRadius={8}
                      paddingAngle={2}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke={COLORS[index % COLORS.length]}/>
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => {
                          const formattedValue = new Intl.NumberFormat('en-IN', {
                              style: 'currency',
                              currency: 'INR',
                          }).format(value as number);
                          return [formattedValue, name];
                      }}
                       contentStyle={{
                        background: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: 'var(--radius)',
                        color: 'hsl(var(--foreground))',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                      }}
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                      wrapperClassName="!bg-transparent"
                    />
                  </PieChart>
                </ResponsiveContainer>
            </div>
            {renderLegend(categoryData)}
        </div>
      ) : (
        <div className="flex h-full items-center justify-center text-muted-foreground py-10">
          No data available for the current month.
        </div>
      )}
    </CardContent>
  );
}
