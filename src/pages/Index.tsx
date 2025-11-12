import { useState, useEffect } from 'react';
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { FiltersSection } from "@/components/dashboard/FiltersSection";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import { CallsTable } from "@/components/calls/CallsTable";
import { NavigationMenu } from "@/components/dashboard/NavigationMenu";
import { OSDOPDataTable } from "@/components/additional-data/OSDOPDataTable"; // ← NUEVO IMPORT
import { useDashboardData } from "@/hooks/useDashboardData";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { testNormalizer } from '../utils/test-normalizer';

const Index = () => {
  const { data, agents, loading, filters, updateData } = useDashboardData();
  // ACTUALIZAR: Agregar 'additional-data' al estado
  const [activeView, setActiveView] = useState<'dashboard' | 'call-table' | 'additional-data'>('dashboard');

  if (!data && loading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <div className="container mx-auto px-4 space-y-6">
          {/* Navigation Menu Skeleton */}
          <Card>
            <CardContent className="p-4">
              <div className="flex space-x-2">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-40" />
                <Skeleton className="h-10 w-44" /> {/* ← NUEVO SKELETON */}
              </div>
            </CardContent>
          </Card>
          
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

  // Calcular tendencias basadas en datos reales
  const calculateTrend = (currentRate: number, baseRate: number = 50) => {
    const difference = currentRate - baseRate;
    return {
      value: Math.abs(difference),
      isPositive: difference >= 0
    };
  };

  const metrics = data ? [
    {
      value: `${data.pickupRate}%`,
      label: "Call Picked Up Rate",
      variant: "primary" as const,
      trend: calculateTrend(data.pickupRate)
    },
    {
      value: `${data.successRate}%`,
      label: "Call Successful Rate",
      variant: "success" as const,
      trend: calculateTrend(data.successRate)
    },
    {
      value: `${data.transferRate}%`,
      label: "Call Transfer Rate",
      variant: "info" as const,
      trend: calculateTrend(data.transferRate)
    },
    {
      value: `${data.voicemailRate}%`,
      label: "Voicemail Rate",
      variant: "warning" as const,
      trend: calculateTrend(data.voicemailRate)
    }
  ] : [];

  // Calcular totales para las nuevas tarjetas de conteo
  const totalCalls = data ? data.callVolume.reduce((sum, day) => sum + day.calls, 0) : 0;
  const totalInbound = data ? data.inboundOutbound.reduce((sum, day) => sum + day.entrantes, 0) : 0;
  const totalOutbound = data ? data.inboundOutbound.reduce((sum, day) => sum + day.salientes, 0) : 0;

  console.log('🔍 DEBUG TARJETAS CONTEO:', {
  dataCallVolume: data?.callVolume,
  dataInboundOutbound: data?.inboundOutbound,
  totalCallsCalculado: data ? data.callVolume.reduce((sum, day) => sum + day.calls, 0) : 0,
  totalInboundCalculado: data ? data.inboundOutbound.reduce((sum, day) => sum + day.entrantes, 0) : 0,
  totalOutboundCalculado: data ? data.inboundOutbound.reduce((sum, day) => sum + day.salientes, 0) : 0
});

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <div className="container mx-auto px-4 space-y-6">
        {/* Menú de Navegación ACTUALIZADO */}
        <NavigationMenu 
          activeView={activeView} 
          onViewChange={setActiveView} 
        />

        {/* Vista del Dashboard */}
        {activeView === 'dashboard' && (
          <>
            {/* Filtros (solo en dashboard) */}
            <FiltersSection 
              filters={filters}
              onFilterChange={updateData}
              agents={agents}
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
                  loading={loading}
                />
              ))}
            </div>

            {/* Tarjetas de Conteo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <MetricCard
                value={totalCalls.toString()}
                label="Total Llamadas"
                variant="info"
                description="Conteo total con filtros aplicados"
                loading={loading}
              />
              <MetricCard
                value={totalInbound.toString()}
                label="Llamadas Entrantes"
                variant="info"
                description="Llamadas recibidas"
                loading={loading}
              />
              <MetricCard
                value={totalOutbound.toString()}
                label="Llamadas Salientes"
                variant="info"
                description="Llamadas realizadas"
                loading={loading}
              />
            </div>

            {/* Dashboard Tabs */}
            {data && (
              <DashboardTabs 
                data={data} 
                loading={loading}
              />
            )}
          </>
        )}

        {/* Vista de Tabla de Llamadas */}
        {activeView === 'call-table' && (
          <CallsTable filters={filters} />
        )}

        {/* NUEVA VISTA: Datos Adicionales */}
        {activeView === 'additional-data' && (
          <OSDOPDataTable />
        )}
      </div>
    </div>
  );
};

export default Index;