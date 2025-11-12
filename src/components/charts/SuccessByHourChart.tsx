import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useEffect, useRef } from 'react';

// ✅ DEFINIR PROPS INTERFACE
interface SuccessByHourChartProps {
  data: Array<{
    hour: string;
    successRate: number;
    totalCalls: number;
    successfulCalls: number;
  }>;
  filters: {
    agent: string;
    timeRange: string;
    callType: string;
    status: string;
    channel: string;
    country: string;
  };
  loading?: boolean;
}

export const SuccessByHourChart = ({ data, filters, loading = false }: SuccessByHourChartProps) => {
  const previousFilters = useRef(filters); // ✅ PARA DETECTAR CAMBIOS

  // ✅ DEBUG DE CAMBIOS EN FILTROS
  useEffect(() => {

    previousFilters.current = filters;
  }, [filters]);

  // ✅ DEBUG DE DATOS
  useEffect(() => {

  }, [data, loading, filters]);

  // Si no hay datos o está cargando, mostrar estado vacío
  if (loading || !data) {
    return (
      <div className="h-80 w-full flex items-center justify-center border rounded-lg">
        <div className="text-muted-foreground">Cargando datos de éxito por hora...</div>
      </div>
    );
  }

  const successByHour = data || [];


  if (successByHour.length === 0) {
    return (
      <div className="h-80 w-full flex items-center justify-center border rounded-lg">
        <div className="text-muted-foreground">No hay datos de éxito por hora disponibles</div>
      </div>
    );
  }

  // ✅ FUNCIÓN CORREGIDA: Calcular métricas precisas
  const getChartInsights = () => {
    if (successByHour.length === 0) return null;

    // Filtrar solo horas con llamadas para evitar división por cero
    const hoursWithCalls = successByHour.filter(hour => hour.totalCalls > 0);
    
    if (hoursWithCalls.length === 0) return null;

    const bestHour = hoursWithCalls.reduce((best, current) => 
      current.successRate > best.successRate ? current : best
    );
    
    const worstHour = hoursWithCalls.reduce((worst, current) => 
      current.successRate < worst.successRate ? current : worst
    );

    const totalSuccessful = hoursWithCalls.reduce((sum, hour) => sum + hour.successfulCalls, 0);
    const totalCalls = hoursWithCalls.reduce((sum, hour) => sum + hour.totalCalls, 0);
    const overallSuccessRate = totalCalls > 0 ? Math.round((totalSuccessful / totalCalls) * 100) : 0;

 

    return {
      bestHour,
      worstHour, 
      overallSuccessRate,
      totalCalls
    };
  };

  const insights = getChartInsights();

  // ✅ AGREGAR INDICADOR DE FILTROS ACTIVOS
  const getActiveFiltersText = () => {
    const activeFilters = [];
    
    if (filters.agent !== 'all') {
      activeFilters.push(`Agente filtrado`);
    }
    
    if (filters.country !== 'all') activeFilters.push(`País: ${filters.country}`);
    if (filters.callType !== 'all') activeFilters.push(`Tipo: ${filters.callType}`);
    
    return activeFilters.length > 0 ? activeFilters.join(' | ') : 'Todos los agentes';
  };

  return (
    <div className="h-80 w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Tasa de Éxito por Hora</h3>
        <div className="text-sm text-muted-foreground">
          {getActiveFiltersText()}
        </div>
      </div>

      {/* ✅ AGREGAR INSIGHTS */}
      {insights && (
        <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
          <div className="bg-green-50 p-2 rounded border">
            <div className="font-medium text-green-700">Mejor hora</div>
            <div>{insights.bestHour.hour} ({insights.bestHour.successRate}%)</div>
          </div>
          <div className="bg-red-50 p-2 rounded border">
            <div className="font-medium text-red-700">Peor hora</div>
            <div>{insights.worstHour.hour} ({insights.worstHour.successRate}%)</div>
          </div>
          <div className="bg-blue-50 p-2 rounded border">
            <div className="font-medium text-blue-700">Tasa general</div>
            <div>{insights.overallSuccessRate}% ({insights.totalCalls} llamadas)</div>
          </div>
        </div>
      )}

      <ResponsiveContainer width="100%" height="75%">
        <AreaChart data={successByHour}>
          <defs>
            <linearGradient id="successGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0.05}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="hour" 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            domain={[0, 100]}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip 
            formatter={(value: number, name: string) => {
              if (name === 'successRate') return [`${value}%`, 'Tasa de éxito'];
              return [value, name === 'successfulCalls' ? 'Llamadas exitosas' : 'Total llamadas'];
            }}
            labelFormatter={(label, payload) => {
              if (payload && payload[0]) {
                const data = payload[0].payload;
                return `Hora: ${label} (${data.successfulCalls}/${data.totalCalls} exitosas)`;
              }
              return `Hora: ${label}`;
            }}
          />
          <Area
            type="monotone"
            dataKey="successRate"
            stroke="hsl(var(--success))"
            fillOpacity={1}
            fill="url(#successGradient)"
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--success))', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: 'hsl(var(--success))' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};