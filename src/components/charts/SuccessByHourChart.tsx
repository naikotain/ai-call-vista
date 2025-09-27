import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useDashboardData } from '@/hooks/useDashboardData';

export const SuccessByHourChart = () => {
  const { data, loading } = useDashboardData();

  // Si no hay datos o está cargando, mostrar estado vacío
  if (loading || !data) {
    return (
      <div className="h-80 w-full flex items-center justify-center border rounded-lg">
        <div className="text-muted-foreground">Cargando datos de éxito por hora...</div>
      </div>
    );
  }

  // Usar los datos reales del hook - asumiendo que agregaste successByHour a DashboardData
  const successByHour = data.successByHour || [];

  if (successByHour.length === 0) {
    return (
      <div className="h-80 w-full flex items-center justify-center border rounded-lg">
        <div className="text-muted-foreground">No hay datos de éxito por hora disponibles</div>
      </div>
    );
  }

  return (
    <div className="h-80 w-full">
      <h3 className="text-lg font-semibold mb-4">Tasa de Éxito por Hora</h3>
      <ResponsiveContainer width="100%" height="90%">
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
            label={{ value: 'Hora del día', position: 'insideBottom', offset: -5 }}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            domain={[0, 100]}
            label={{ value: 'Tasa (%)', angle: -90, position: 'insideLeft' }}
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