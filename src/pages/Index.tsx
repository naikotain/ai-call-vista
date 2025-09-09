import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { FiltersSection } from "@/components/dashboard/FiltersSection";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import { useDashboardData } from "@/hooks/useDashboardData";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const { data, agents, loading, filters, updateData } = useDashboardData();

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

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <div className="container mx-auto px-4 space-y-6">
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

        {/* Nuevas Tarjetas de Conteo */}
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

        {/* ✅ Nuevas Métricas de Costo */}
        {data?.costMetrics && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Análisis de Costos</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <MetricCard
                value={`$${data.costMetrics.totalCosto.toFixed(4)}`}
                label="Costo Total"
                variant="info"
                description="Costo acumulado de llamadas"
                loading={loading}
              />
              <MetricCard
                value={`$${data.costMetrics.costoPromedioPorLlamada.toFixed(4)}`}
                label="Costo Promedio/Llamada"
                variant="info"
                description="Costo promedio por llamada"
                loading={loading}
              />
              <MetricCard
                value={`$${data.costMetrics.costoPorMinuto.toFixed(4)}`}
                label="Costo por Minuto"
                variant="info"
                description="Tarifa por minuto de llamada"
                loading={loading}
              />
            </div>

            {/* ✅ Costo por Tipo de Llamada */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <MetricCard
                value={`$${data.costMetrics.costoPorTipo.inbound.toFixed(4)}`}
                label="Costo Llamadas Entrantes"
                variant="info"
                description="Costo total de llamadas recibidas"
                loading={loading}
              />
              <MetricCard
                value={`$${data.costMetrics.costoPorTipo.outbound.toFixed(4)}`}
                label="Costo Llamadas Salientes"
                variant="info"
                description="Costo total de llamadas realizadas"
                loading={loading}
              />
            </div>

            {/* ✅ Tabla de Costos por Agente */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Costos por Agente</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Agente</th>
                      <th className="text-right py-2">Llamadas</th>
                      <th className="text-right py-2">Costo Total</th>
                      <th className="text-right py-2">Costo Promedio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.costMetrics.costoPorAgente.map((agente, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="py-2">{agente.agente}</td>
                        <td className="text-right py-2">{agente.llamadas}</td>
                        <td className="text-right py-2">${agente.costo.toFixed(4)}</td>
                        <td className="text-right py-2">${agente.costoPromedio.toFixed(4)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ✅ Costo por Día de la Semana */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Costos por Día de la Semana</h3>
              <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
                {data.costMetrics.costoPorDia.map((dia, index) => (
                  <div key={index} className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="font-semibold text-sm">{dia.name}</div>
                    <div className="text-lg font-bold">${dia.costo.toFixed(4)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Tabs con datos filtrados */}
        {data && (
          <DashboardTabs 
            data={data} 
            loading={loading}
          />
        )}
      </div>
    </div>
  );
};

export default Index;