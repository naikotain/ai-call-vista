import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { FiltersSection } from "@/components/dashboard/FiltersSection";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import { useDashboardData } from "@/hooks/useDashboardData";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const { data, loading, filters, updateData } = useDashboardData();

  if (!data && loading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <div className="container mx-auto px-4 space-y-6">
          <Skeleton className="h-24 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const metrics = data ? [
    {
      value: `${data.pickupRate}%`,
      label: "Call Picked Up Rate",
      variant: "primary" as const,
      trend: { value: 5.2, isPositive: true }
    },
    {
      value: `${data.successRate}%`,
      label: "Call Successful Rate",
      variant: "success" as const,
      trend: { value: 3.1, isPositive: true }
    },
    {
      value: `${data.transferRate}%`,
      label: "Call Transfer Rate",
      variant: "info" as const,
      trend: { value: 1.8, isPositive: false }
    },
    {
      value: `${data.voicemailRate}%`,
      label: "Voicemail Rate",
      variant: "warning" as const,
      trend: { value: 2.4, isPositive: false }
    }
  ] : [];

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <div className="container mx-auto px-4 space-y-6">
        <FiltersSection 
          filters={filters}
          onFilterChange={updateData}
          loading={loading}
        />
        
        {/* Main Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {metrics.map((metric, index) => (
            <MetricCard
              key={index}
              value={metric.value}
              label={metric.label}
              variant={metric.variant}
              trend={metric.trend}
            />
          ))}
        </div>

        {/* Dashboard Tabs */}
        {data && <DashboardTabs data={data} />}
      </div>
    </div>
  );
};

export default Index;