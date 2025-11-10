import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AgentPerformanceData } from '@/hooks/useDashboardData';

interface AgentPerformanceChartProps {
  data: AgentPerformanceData[];
  loading?: boolean;
}

// ✅ NUEVO: Tooltip personalizado para mostrar nombres de agentes
const CustomAgentTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
        <p className="font-semibold text-foreground mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            <span className="font-medium">{entry.name}:</span> {entry.value}%
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const AgentPerformanceChart = ({ data, loading }: AgentPerformanceChartProps) => {
  
  if (loading) {
    return (
      <div className="h-96 w-full flex items-center justify-center">
        <div className="text-muted-foreground">Cargando datos de agentes...</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-96 w-full flex items-center justify-center">
        <div className="text-muted-foreground">No hay datos de agentes disponibles</div>
      </div>
    );
  }

  // Obtener nombres de agentes dinámicamente
  const agentNames = data.length > 0 
    ? Object.keys(data[0]).filter(key => key !== 'metric') 
    : [];
  
  if (agentNames.length === 0) {
    return (
      <div className="h-96 w-full flex items-center justify-center">
        <div className="text-muted-foreground">No hay agentes con datos</div>
      </div>
    );
  }

  // Transformar datos para BarChart
  const metricData = data.map(metric => {
    const result: any = { metric: metric.metric };
    agentNames.forEach(agentName => {
      result[agentName] = metric[agentName] || 0;
    });
    return result;
  });

  // Separar métricas en categorías para mejores gráficos
  const percentageMetrics = metricData.filter(m => m.metric.includes('%'));
  const volumeMetrics = metricData.filter(m => m.metric === 'Total de llamadas');
  const performanceMetrics = metricData.filter(m => 
    m.metric.includes('Duración') || m.metric.includes('Llamadas por hora')
  );

  // ✅ NUEVO: Colores consistentes para agentes
  const getAgentColor = (index: number) => {
    const colors = [
      'hsl(var(--primary))',
      'hsl(var(--success))', 
      'hsl(var(--warning))',
      'hsl(var(--destructive))',
      'hsl(var(--info))',
      'hsl(var(--accent))'
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="space-y-8">
      {/* Gráfico 1: Métricas porcentuales - CORREGIDO */}
      <div className="bg-card border rounded-lg p-4">
        <h4 className="text-lg font-semibold mb-4">📊 Métricas de Calidad (%)</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={percentageMetrics}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="metric" 
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(value) => `${value}%`}
              />
              {/* ✅ CORREGIDO: Usar CustomTooltip en lugar de formatter */}
              <Tooltip content={<CustomAgentTooltip />} />
              <Legend />
              {agentNames.map((agentName, index) => (
                <Bar
                  key={agentName}
                  dataKey={agentName}
                  name={agentName}
                  fill={getAgentColor(index)}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico 2: Métricas de volumen y performance - TAMBIÉN CORREGIDOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Volumen de llamadas */}
        <div className="bg-card border rounded-lg p-4">
          <h4 className="text-lg font-semibold mb-4">📞 Volumen de Llamadas</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volumeMetrics}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="metric" 
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                />
                {/* ✅ CORREGIDO: Tooltip personalizado */}
                <Tooltip 
                  content={<CustomAgentTooltip />}
                  formatter={(value: number) => [value, 'Llamadas']}
                />
                <Legend />
                {agentNames.map((agentName, index) => (
                  <Bar
                    key={agentName}
                    dataKey={agentName}
                    name={agentName}
                    fill={getAgentColor(index)}
                    radius={[4, 4, 0, 0]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Performance operativa */}
        <div className="bg-card border rounded-lg p-4">
          <h4 className="text-lg font-semibold mb-4">⏱️ Métricas Operativas</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceMetrics}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="metric" 
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                />
                {/* ✅ CORREGIDO: Tooltip personalizado */}
                <Tooltip 
                  content={<CustomAgentTooltip />}
                  formatter={(value: number, name: string) => {
                    if (name.includes('Duración')) return [value, 'minutos'];
                    return [value, 'llamadas/hora'];
                  }}
                />
                <Legend />
                {agentNames.map((agentName, index) => (
                  <Bar
                    key={agentName}
                    dataKey={agentName}
                    name={agentName}
                    fill={getAgentColor(index)}
                    radius={[4, 4, 0, 0]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tabla de resumen (se mantiene igual) */}
      <div className="bg-card border rounded-lg p-6">
        <h4 className="text-lg font-semibold mb-4">👥 Resumen Comparativo de Agentes</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {agentNames.map(agentName => {
            const agentData = data.reduce((acc, metric) => {
              acc[metric.metric] = metric[agentName];
              return acc;
            }, {} as Record<string, any>);
            
            const successRate = agentData['Tasa de éxito (%)'];
            const satisfaction = agentData['Satisfacción (%)'];
            const totalCalls = agentData['Total de llamadas'];
            const avgScore = (successRate + satisfaction) / 2;
            
            return (
              <div key={agentName} className="border-2 rounded-lg p-4 bg-gradient-to-br from-card to-muted/20">
                <div className="flex justify-between items-start mb-3">
                  <h5 className="font-semibold text-lg">{agentName}</h5>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    avgScore >= 60 ? 'bg-green-100 text-green-800' :
                    avgScore >= 50 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {avgScore >= 60 ? '⭐ Excelente' : avgScore >= 50 ? '✅ Bueno' : '📊 Regular'}
                  </span>
                </div>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Tasa de éxito:</span>
                    <span className="font-semibold text-green-600">{successRate}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Satisfacción:</span>
                    <span className="font-semibold text-blue-600">{satisfaction}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Duración promedio:</span>
                    <span className="font-semibold text-orange-600">{agentData['Duración promedio (min)']} min</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Llamadas/hora:</span>
                    <span className="font-semibold text-purple-600">{agentData['Llamadas por hora']}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-muted-foreground">Total llamadas:</span>
                    <span className="font-bold text-primary">{totalCalls}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};