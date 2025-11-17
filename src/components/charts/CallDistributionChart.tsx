import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useDashboardData } from '@/hooks/useDashboardData';
import { Skeleton } from '@/components/ui/skeleton';

export const CallDistributionChart = () => {
  const { data, loading } = useDashboardData();

  if (loading || !data) {
    return <Skeleton className="h-80 w-full" />;
  }

  // ✅ CALCULAR DISTRIBUCIÓN BASADA EN DATOS REALES DISPONIBLES
  const calculateDistribution = () => {
    if (!data.totalCalls || data.totalCalls === 0) {
      return [];
    }

    const distribution = [
      { 
        name: 'Exitosas', 
        value: Math.round((data.successRate / 100) * data.totalCalls),
        color: 'hsl(var(--success))' 
      },
      { 
        name: 'Fallidas', 
        value: data.failedMetrics?.totalFailed || 0,
        color: 'hsl(var(--danger))' 
      }
    ];

    return distribution.filter(item => item.value > 0);
  };

  const distributionData = calculateDistribution();

  if (distributionData.length === 0) {
    return (
      <div className="h-80 w-full flex items-center justify-center border border-border rounded-lg bg-card">
        <div className="text-center text-muted-foreground">
          <p>No hay datos de distribución disponibles</p>
        </div>
      </div>
    );
  }

  const totalCalls = distributionData.reduce((sum, item) => sum + item.value, 0);

  // Custom label component para mejor legibilidad
  const renderCustomizedLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent, name
  }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="hsl(var(--card-foreground))" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="h-80 w-full p-4 bg-card border border-border rounded-lg">
      <h3 className="text-lg font-semibold mb-2 text-center text-card-foreground">
        Distribución de Llamadas
      </h3>
      <p className="text-sm text-muted-foreground mb-4 text-center">
        Total: {totalCalls} llamadas
      </p>
      
      <ResponsiveContainer width="100%" height="90%">
        <PieChart>
          <Pie
            data={distributionData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            label={renderCustomizedLabel}
            labelLine={false}
          >
            {distributionData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                const percentage = ((data.value / totalCalls) * 100).toFixed(1);
                return (
                  <div className="bg-popover border border-border p-3 rounded-lg shadow-metric">
                    <p className="text-popover-foreground font-medium">
                      {data.name}
                    </p>
                    <p className="text-popover-foreground">
                      {data.value} llamadas ({percentage}%)
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend 
            wrapperStyle={{
              color: 'hsl(var(--card-foreground))',
              fontSize: '14px'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};