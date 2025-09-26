import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DashboardData } from '@/hooks/useDashboardData';

interface SentimentTrendChartProps {
  data: DashboardData | null;
  loading?: boolean;
}

export const SentimentTrendChart = ({ data, loading }: SentimentTrendChartProps) => {
  if (loading) {
    return (
      <div className="h-80 w-full flex items-center justify-center">
        <div className="text-muted-foreground">Cargando tendencia de sentimiento...</div>
      </div>
    );
  }

  if (!data || !data.sentimentTrend || data.sentimentTrend.length === 0) {
    return (
      <div className="h-80 w-full flex items-center justify-center">
        <div className="text-muted-foreground">No hay datos de tendencia de sentimiento</div>
      </div>
    );
  }

  // Filtrar días que tienen datos (evitar días con 0 llamadas)
  const chartData = data.sentimentTrend.filter(day => 
    day.positivo > 0 || day.neutral || day.negativo
  );

  if (chartData.length === 0) {
    return (
      <div className="h-80 w-full flex items-center justify-center">
        <div className="text-muted-foreground">No hay suficientes datos de sentimiento</div>
      </div>
    );
  }

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="sentimentGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0.05}/>
            </linearGradient>
            <linearGradient id="neutralGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--warning))" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="hsl(var(--warning))" stopOpacity={0.05}/>
            </linearGradient>
            <linearGradient id="negativeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0.05}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="name" 
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
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px'
            }}
            formatter={(value: number, name: string) => {
              const labels: { [key: string]: string } = {
                positivo: 'Positivo',
                neutral: 'Neutral', 
                negativo: 'Negativo'
              };
              return [`${value}%`, labels[name] || name];
            }}
          />
          {/* Línea de sentimiento positivo (principal) */}
          <Area
            type="monotone"
            dataKey="positivo"
            stroke="hsl(var(--success))"
            fillOpacity={1}
            fill="url(#sentimentGradient)"
            strokeWidth={2}
            name="positivo"
          />
          {/* Opcional: agregar neutral y negativo si quieres múltiples líneas */}
          {/* 
          <Area
            type="monotone"
            dataKey="neutral"
            stroke="hsl(var(--warning))"
            fill="url(#neutralGradient)"
            strokeWidth={1}
            name="neutral"
          />
          <Area
            type="monotone"
            dataKey="negativo"
            stroke="hsl(var(--destructive))"
            fill="url(#negativeGradient)"
            strokeWidth={1}
            name="negativo"
          />
          */}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};