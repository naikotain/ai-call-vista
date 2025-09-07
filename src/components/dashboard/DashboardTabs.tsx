import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CallVolumeChart } from "@/components/charts/CallVolumeChart";
import { CallDistributionChart } from "@/components/charts/CallDistributionChart";
import { CallDurationChart } from "@/components/charts/CallDurationChart";
import { LatencyChart } from "@/components/charts/LatencyChart";
import { DisconnectionChart } from "@/components/charts/DisconnectionChart";
import { InboundOutboundChart } from "@/components/charts/InboundOutboundChart";
import { SuccessByHourChart } from "@/components/charts/SuccessByHourChart";
import { AgentPerformanceChart } from "@/components/charts/AgentPerformanceChart";
import { SentimentDistributionChart } from "@/components/charts/SentimentDistributionChart";
import { SentimentTrendChart } from "@/components/charts/SentimentTrendChart";
import { DashboardData } from "@/hooks/useDashboardData";

interface DashboardTabsProps {
  data: DashboardData;
  loading?: boolean;
}

// Componente de esqueleto para las tarjetas de gráficos
const ChartSkeleton = () => (
  <div className="space-y-2">
    <Skeleton className="h-4 w-32" />
    <Skeleton className="h-[200px] w-full" />
  </div>
);

export const DashboardTabs = ({ data, loading }: DashboardTabsProps) => {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-4 mb-6">
        <TabsTrigger value="overview">Resumen</TabsTrigger>
        <TabsTrigger value="calls">Llamadas</TabsTrigger>
        <TabsTrigger value="agents">Agentes</TabsTrigger>
        <TabsTrigger value="sentiment">Sentimiento</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="shadow-metric">
              <CardHeader>
                <CardTitle>Volumen de Llamadas por Día</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? <ChartSkeleton /> : <CallVolumeChart data={data.callVolume} />}
              </CardContent>
            </Card>
          </div>
          <Card className="shadow-metric">
            <CardHeader>
              <CardTitle>Distribución de Llamadas</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? <ChartSkeleton /> : <CallDistributionChart />}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-metric">
            <CardHeader>
              <CardTitle>Duración Promedio de Llamadas (minutos)</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? <ChartSkeleton /> : <CallDurationChart data={data.callDuration} />}
            </CardContent>
          </Card>
          <Card className="shadow-metric">
            <CardHeader>
              <CardTitle>Latencia Promedio (segundos)</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? <ChartSkeleton /> : <LatencyChart data={data.latency} />}
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="calls" className="space-y-6">
        <h3 className="text-xl font-semibold border-l-4 border-primary pl-3">
          Métricas de Llamadas
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-metric">
            <CardHeader>
              <CardTitle>Razones de Desconexión</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? <ChartSkeleton /> : <DisconnectionChart />}
            </CardContent>
          </Card>
          <Card className="shadow-metric">
            <CardHeader>
              <CardTitle>Llamadas Entrantes vs Salientes</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? <ChartSkeleton /> : <InboundOutboundChart data={data.inboundOutbound} />}
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-metric">
          <CardHeader>
            <CardTitle>Tasa de Éxito por Hora del Día</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <ChartSkeleton /> : <SuccessByHourChart />}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="agents" className="space-y-6">
        <h3 className="text-xl font-semibold border-l-4 border-primary pl-3">
          Rendimiento por Agente
        </h3>
        
        <Card className="shadow-metric">
          <CardHeader>
            <CardTitle>Comparativa de Agentes</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <ChartSkeleton /> : <AgentPerformanceChart data={data.agentPerformance} />}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="sentiment" className="space-y-6">
        <h3 className="text-xl font-semibold border-l-4 border-primary pl-3">
          Análisis de Sentimiento
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-metric">
            <CardHeader>
              <CardTitle>Distribución de Sentimiento</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? <ChartSkeleton /> : <SentimentDistributionChart data={data.sentiment} />}
            </CardContent>
          </Card>
          <Card className="shadow-metric">
            <CardHeader>
              <CardTitle>Evolución del Sentimiento</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? <ChartSkeleton /> : <SentimentTrendChart />}
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
};