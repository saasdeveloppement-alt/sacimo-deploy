import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  icon?: string;
  badge?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  trend,
  trendDirection = 'neutral',
  icon,
  badge
}: MetricCardProps) {
  const getTrendIcon = () => {
    if (trendDirection === 'up') return <ArrowUp className="h-4 w-4" />;
    if (trendDirection === 'down') return <ArrowDown className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };

  const getTrendColor = () => {
    if (trendDirection === 'up') return 'text-green-500';
    if (trendDirection === 'down') return 'text-red-500';
    return 'text-gray-500';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          {icon && <span className="text-2xl">{icon}</span>}
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
        </div>
        {badge && <Badge variant="secondary">{badge}</Badge>}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
        {trend && (
          <div className={`flex items-center gap-1 mt-2 ${getTrendColor()}`}>
            {getTrendIcon()}
            <span className="text-sm font-medium">{trend}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
