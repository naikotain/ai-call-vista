import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { FiltersSection } from "@/components/dashboard/FiltersSection";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";

const Index = () => {
  const metrics = [
    {
      value: "84%",
      label: "Call Picked Up Rate",
      variant: "primary" as const,
      trend: { value: 5.2, isPositive: true }
    },
    {
      value: "78%",
      label: "Call Successful Rate",
      variant: "success" as const,
      trend: { value: 3.1, isPositive: true }
    },
    {
      value: "12%",
      label: "Call Transfer Rate",
      variant: "info" as const,
      trend: { value: 1.8, isPositive: false }
    },
    {
      value: "22%",
      label: "Voicemail Rate",
      variant: "warning" as const,
      trend: { value: 2.4, isPositive: false }
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <div className="container mx-auto px-4 space-y-6">
        <FiltersSection />
        
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
        <DashboardTabs />
      </div>
    </div>
  );
};

export default Index;