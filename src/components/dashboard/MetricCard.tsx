import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  value: string;
  label: string;
  variant: 'primary' | 'success' | 'info' | 'warning';
  trend?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
  loading?: boolean;
}

export const MetricCard = ({ value, label, variant, trend, description, loading }: MetricCardProps) => {
  const getVariantStyles = (variant: string) => {
    switch (variant) {
      case "primary":
        return "text-primary";
      case "success":
        return "text-success";
      case "info":
        return "text-info";
      case "warning":
        return "text-warning";
      case "danger":
        return "text-danger";
      default:
        return "text-primary";
    }
  };

  if (loading) {
    return (
      <Card className="p-6 text-center shadow-metric">
        <Skeleton className="h-8 w-20 mx-auto mb-2" />
        <Skeleton className="h-4 w-32 mx-auto mb-2" />
        <Skeleton className="h-3 w-16 mx-auto" />
      </Card>
    );
  }

  return (
    <Card className="p-6 text-center shadow-metric hover:shadow-lg transition-shadow duration-200">
      <div className={cn("text-3xl font-bold mb-2", getVariantStyles(variant))}>
        {value}
      </div>
      <div className="text-sm text-muted-foreground mb-2">
        {label}
      </div>
      
      {/* Añade esta sección para la descripción */}
      {description && (
        <div className="text-xs text-gray-500 mb-2">
          {description}
        </div>
      )}
      
      {trend && (
        <div className={cn(
          "text-xs font-medium",
          trend.isPositive ? "text-success" : "text-danger"
        )}>
          {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
        </div>
      )}
    </Card>
  );
};