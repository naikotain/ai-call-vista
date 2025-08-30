import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  value: string;
  label: string;
  variant: "primary" | "success" | "info" | "warning" | "danger";
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const MetricCard = ({ value, label, variant, trend }: MetricCardProps) => {
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

  return (
    <Card className="p-6 text-center shadow-metric hover:shadow-lg transition-shadow duration-200">
      <div className={cn("text-3xl font-bold mb-2", getVariantStyles(variant))}>
        {value}
      </div>
      <div className="text-sm text-muted-foreground mb-2">
        {label}
      </div>
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