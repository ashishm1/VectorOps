
'use client';

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface FinancialHealthGaugeProps {
  score: number; // Utilization score from 0 to 100+
}

const getScoreColor = (score: number) => {
  if (score > 90) return '#ef4444'; // red-500
  if (score > 75) return '#f59e0b'; // amber-500
  return '#22c55e'; // green-500
};

export function FinancialHealthGauge({ score }: FinancialHealthGaugeProps) {
  const color = getScoreColor(score);
  // Cap the visual score at 100 for the gauge display, but show the real score
  const displayScore = Math.min(score, 100);
  const data = [
    { name: 'Score', value: displayScore },
    { name: 'Remaining', value: Math.max(0, 100 - displayScore) },
  ];

  return (
    <div className="relative h-40 w-40">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            startAngle={90}
            endAngle={450}
            innerRadius="80%"
            outerRadius="100%"
            dataKey="value"
            stroke="none"
            isAnimationActive={false}
          >
            <Cell fill={color} />
            <Cell fill="hsl(var(--muted))" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
       <div className="absolute inset-0 flex items-center justify-center">
        <p className="text-5xl font-bold" style={{ color: "hsl(var(--foreground))" }}>{score.toFixed(0)}<span className="text-3xl text-muted-foreground">%</span></p>
      </div>
    </div>
  );
}
