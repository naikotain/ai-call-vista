import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CallVolumeChart } from "@/components/charts/CallVolumeChart";
import { CallDistributionChart } from "@/components/charts/CallDistributionChart";
import { CallDurationChart } from "@/components/charts/CallDurationChart";
import { LatencyChart } from "@/components/charts/LatencyChart";
import { InboundOutboundChart } from "@/components/charts/InboundOutboundChart";
import { SuccessByHourChart } from "@/components/charts/SuccessByHourChart";
import { AgentPerformanceChart } from "@/components/charts/AgentPerformanceChart";
import { SentimentDistributionChart } from "@/components/charts/SentimentDistributionChart";
import { SentimentTrendChart } from "@/components/charts/SentimentTrendChart";
import { DashboardData } from "@/hooks/useDashboardData";
import { CostCharts } from "@/components/charts/CostCharts";
import { DisconnectionReasonsChart } from '@/components/charts/DisconnectionReasonsChart';

// ✅ FUNCIÓN DE FORMATO DE DURACIÓN (MANTENER)
const formatDuration = (minutes: number): string => {
  if (minutes === 0) return '0 seg';
  
  const totalSeconds = Math.round(minutes * 60);
  const mins = Math.floor(totalSeconds / 60);
  const segs = totalSeconds % 60;
  
  if (mins === 0) return `${segs} seg`;
  if (segs === 0) return `${mins} min`;
  
  return `${mins} min ${segs} seg`;
};

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

// Tarjetas de métricas rápidas - ACTUALIZADAS CON NUEVAS MÉTRICAS
const MetricCards = ({ data }: { data: DashboardData }) => {
  const costMetrics = data.costMetrics;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
      <Card className="shadow-metric border-l-4 border-l-green-500">
        <CardContent className="p-4">
          <div className="text-sm font-medium text-muted-foreground">Tasa de Respuesta</div>
          <div className="text-2xl font-bold text-green-600">{data.pickupRate}%</div>
          <div className="text-xs text-muted-foreground">Llamadas contestadas</div>
        </CardContent>
      </Card>
      
      <Card className="shadow-metric border-l-4 border-l-blue-500">
        <CardContent className="p-4">
          <div className="text-sm font-medium text-muted-foreground">Tasa de Éxito</div>
          <div className="text-2xl font-bold text-blue-600">{data.successRate}%</div>
          <div className="text-xs text-muted-foreground">Llamadas exitosas</div>
        </CardContent>
      </Card>

      <Card className="shadow-metric border-l-4 border-l-orange-500">
        <CardContent className="p-4">
          <div className="text-sm font-medium text-muted-foreground">Duración Promedio</div>
          <div className="text-2xl font-bold text-orange-600">
            {formatDuration(data.averageDuration)}
          </div>
          <div className="text-xs text-muted-foreground">Por llamada</div>
        </CardContent>
      </Card>
      
      {/* NUEVAS MÉTRICAS DE COSTOS */}
      <Card className="shadow-metric border-l-4 border-l-purple-500">
        <CardContent className="p-4">
          <div className="text-sm font-medium text-muted-foreground">Costo Total</div>
          <div className="text-2xl font-bold text-purple-600">
            ${costMetrics?.totalCosto.toFixed(2) || '0.00'}
          </div>
          <div className="text-xs text-muted-foreground">Inversión total</div>
        </CardContent>
      </Card>

      {/* Tarjeta de Costo Retell AI - ACTUALIZADA */}
      <Card className="shadow-metric border-l-4 border-l-red-500">
        <CardContent className="p-4">
          <div className="text-sm font-medium text-muted-foreground">Costo Retell AI</div>
          <div className="text-2xl font-bold text-red-600">
            ${costMetrics?.desgloseCostos.totalRetell.toFixed(2) || '0.00'}
          </div>
          <div className="text-xs text-muted-foreground">
            {costMetrics?.desgloseCostos.porcentajeRetell.toFixed(1) || '0'}% del total
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-metric border-l-4 border-l-cyan-500">
        <CardContent className="p-4">
          <div className="text-sm font-medium text-muted-foreground">Países Activos</div>
          <div className="text-2xl font-bold text-cyan-600">
            {costMetrics?.costoPorPais.length || 0}
          </div>
          <div className="text-xs text-muted-foreground">Destinos diferentes</div>
        </CardContent>
      </Card>
    </div>
  );
};

export const DashboardTabs = ({ data, loading }: DashboardTabsProps) => {
  return (
    <div className="space-y-6">
      {/* Métricas rápidas en la parte superior */}
      {!loading && <MetricCards data={data} />}

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-6">
          <TabsTrigger value="overview">📊 Resumen</TabsTrigger>
          <TabsTrigger value="calls">📞 Llamadas</TabsTrigger>
          <TabsTrigger value="agents">👥 Agentes</TabsTrigger>
          <TabsTrigger value="sentiment">😊 Sentimiento</TabsTrigger>
          <TabsTrigger value="costs">💰 Costos</TabsTrigger>
        </TabsList>

        {/* Pestaña: Resumen General */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-metric">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>📈</span> Volumen de Llamadas por Día
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? <ChartSkeleton /> : <CallVolumeChart data={data.callVolume} />}
              </CardContent>
            </Card>
            
            <Card className="shadow-metric">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>⏱️</span> Duración Promedio (minutos)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? <ChartSkeleton /> : <CallDurationChart data={data.callDuration} />}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-metric">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>🔄</span> Entrantes vs Salientes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? <ChartSkeleton /> : <InboundOutboundChart data={data.inboundOutbound} />}
              </CardContent>
            </Card>
            
            <Card className="shadow-metric">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>💰</span> Distribución de Costos por País
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? <ChartSkeleton /> : (
                  <div className="h-80">
                    {/* Mini gráfico de costos por país para el resumen */}
                    {data.costMetrics && data.costMetrics.costoPorPais.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {data.costMetrics.costoPorPais.slice(0, 4).map((pais, index) => (
                          <div key={index} className="text-center p-3 bg-blue-50 rounded-lg">
                            <div className="text-lg font-semibold">
                              {pais.pais === 'CL' ? '🇨🇱' : 
                               pais.pais === 'AR' ? '🇦🇷' : 
                               pais.pais === 'MX' ? '🇲🇽' : 
                               pais.pais === 'ES' ? '🇪🇸' : '🌍'}
                            </div>
                            <div className="text-sm font-bold">${pais.costo.toFixed(2)}</div>
                            <div className="text-xs text-muted-foreground">
                              {pais.llamadas.toFixed(1)}% • {pais.llamadas} llamadas
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground">
                        No hay datos de costos por país
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Pestaña: Análisis de Llamadas */}
        <TabsContent value="calls" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-metric">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>🎯</span> Tasa de Éxito por Hora
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? <ChartSkeleton /> : <SuccessByHourChart />}
              </CardContent>
            </Card>
            
            <Card className="shadow-metric">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>⚡</span> Latencia Promedio (segundos)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? <ChartSkeleton /> : <LatencyChart data={data.latency} />}
              </CardContent>
            </Card>
          </div>

          {/* Razones de Desconexión */}
          {data.disconnectMetrics && data.disconnectMetrics.reasons.length > 0 && (
            <Card className="shadow-metric">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>📉</span> Análisis de Desconexiones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-3">Resumen de Desconexiones</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-2 bg-white rounded">
                        <span className="text-sm">✅ Finalizadas normalmente</span>
                        <strong className="text-green-600">{data.disconnectMetrics.byCategory.ended}</strong>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-white rounded">
                        <span className="text-sm">📞 No conectadas</span>
                        <strong className="text-yellow-600">{data.disconnectMetrics.byCategory.not_connected}</strong>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-white rounded">
                        <span className="text-sm">❌ Errores</span>
                        <strong className="text-red-600">{data.disconnectMetrics.byCategory.error}</strong>
                      </div>
                    </div>
                  </div>
                  
                  <DisconnectionReasonsChart data={data.disconnectMetrics.reasons} />
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="shadow-metric">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>📋</span> Distribución de Llamadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? <ChartSkeleton /> : <CallDistributionChart />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pestaña: Rendimiento de Agentes */}
        <TabsContent value="agents" className="space-y-6">
          <Card className="shadow-metric">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>👥</span> Comparativa de Agentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? <ChartSkeleton /> : <AgentPerformanceChart data={data.agentPerformance} />}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-metric">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>💬</span> Métricas por Agente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.costMetrics?.costoPorAgente.slice(0, 5).map((agente, index) => (
                    <div key={index} className="flex justify-between items-center p-2 border rounded">
                      <span className="font-medium">{agente.agente}</span>
                      <div className="text-right">
                        <div className="text-sm">${agente.costo.toFixed(2)}</div>
                        <div className="text-xs text-muted-foreground">{agente.llamadas} llamadas</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-metric">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>🌍</span> Distribución por País
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.costMetrics?.costoPorPais.slice(0, 5).map((pais, index) => (
                    <div key={index} className="flex justify-between items-center p-2 border rounded">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {pais.pais === 'CL' ? '🇨🇱' : 
                           pais.pais === 'AR' ? '🇦🇷' : 
                           pais.pais === 'MX' ? '🇲🇽' : 
                           pais.pais === 'ES' ? '🇪🇸' : '🌍'}
                        </span>
                        <span>{pais.pais}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm">${pais.costo.toFixed(2)}</div>
                        <div className="text-xs text-muted-foreground">{pais.llamadas} llamadas</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Pestaña: Análisis de Sentimiento */}
        <TabsContent value="sentiment" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-metric">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>📊</span> Distribución de Sentimiento
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? <ChartSkeleton /> : <SentimentDistributionChart data={data.sentiment} />}
              </CardContent>
            </Card>
            
            <Card className="shadow-metric">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>📈</span> Evolución del Sentimiento
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? <ChartSkeleton /> : <SentimentTrendChart data={data} loading={loading} />}
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-metric">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>💡</span> Insights de Sentimiento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{data.sentiment.find(s => s.name === 'Positivo')?.value || 0}%</div>
                  <div className="text-sm text-green-700">Positivo</div>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{data.sentiment.find(s => s.name === 'Neutral')?.value || 0}%</div>
                  <div className="text-sm text-yellow-700">Neutral</div>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{data.sentiment.find(s => s.name === 'Negativo')?.value || 0}%</div>
                  <div className="text-sm text-red-700">Negativo</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pestaña: Análisis de Costos */}
<TabsContent value="costs" className="space-y-6">
  {data.costMetrics && Object.keys(data.costMetrics).length > 0 ? (
    <CostCharts costMetrics={data.costMetrics} loading={loading} />
  ) : (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-80 bg-muted rounded-lg animate-pulse"></div>
        <div className="h-80 bg-muted rounded-lg animate-pulse"></div>
      </div>
      <div className="text-center text-muted-foreground py-8">
        <p>No hay datos de costos disponibles</p>
        <p className="text-sm">Los costos se calcularán cuando haya llamadas con datos de país</p>
      </div>
    </div>
  )}

          {/* Resumen de costos expandido */}
          <Card className="shadow-metric">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>💎</span> Resumen de Costos Detallado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">${data.costMetrics?.totalCosto.toFixed(2) || '0.00'}</div>
                  <div className="text-xs text-blue-700">Costo Total</div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="text-lg font-bold text-green-600">${data.costMetrics?.costoPromedioPorLlamada.toFixed(4) || '0.0000'}</div>
                  <div className="text-xs text-green-700">Promedio/Llamada</div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="text-lg font-bold text-purple-600">${data.costMetrics?.costoPorMinuto.toFixed(4) || '0.0000'}
                  </div>
                  <div className="text-xs text-purple-700">Por Minuto</div>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <div className="text-lg font-bold text-orange-600">{data.costMetrics?.costoPorAgente.length || 0}</div>
                  <div className="text-xs text-orange-700">Agentes Activos</div>
                </div>
              </div>
              
              {/* Estadísticas adicionales de países */}
              {data.costMetrics?.costoPorPais && data.costMetrics.costoPorPais.length > 0 && (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-cyan-50 rounded-lg">
                    <div className="text-lg font-bold text-cyan-600">{data.costMetrics.costoPorPais.length}</div>
                    <div className="text-xs text-cyan-700">Países Activos</div>
                  </div>
                  <div className="p-3 bg-red-50 rounded-lg">
                    <div className="text-lg font-bold text-red-600">
                      ${Math.max(...data.costMetrics.costoPorPais.map(p => p.costo)).toFixed(2)}
                    </div>
                    <div className="text-xs text-red-700">Costo Máximo por País</div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="text-lg font-bold text-green-600">
                      {data.costMetrics.costoPorPais.reduce((max, pais) => 
                        pais.llamadas > max ? pais.llamadas : max, 0)}
                    </div>
                    <div className="text-xs text-green-700">Máx. Llamadas por País</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};