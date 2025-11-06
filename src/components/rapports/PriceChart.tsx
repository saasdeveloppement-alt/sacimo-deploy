'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface PriceChartProps {
  data: Array<{ date: string; price: number }>;
  height?: number;
}

export function PriceChart({ data, height = 300 }: PriceChartProps) {
  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short'
    }).format(date);
  };

  const formattedData = data.map(item => ({
    ...item,
    displayDate: formatDate(item.date)
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={formattedData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis 
          dataKey="displayDate" 
          className="text-xs"
        />
        <YAxis 
          tickFormatter={formatPrice}
          className="text-xs"
        />
        <Tooltip
          formatter={(value: number) => [formatPrice(value), 'Prix']}
          labelStyle={{ color: '#000' }}
        />
        <Line
          type="monotone"
          dataKey="price"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={{ fill: 'hsl(var(--primary))' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
