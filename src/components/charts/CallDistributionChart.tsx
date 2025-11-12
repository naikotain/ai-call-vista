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
      <div className="h-80 w-full flex items-center justify-center border rounded-lg">
        <div className="text-center text-muted-foreground">
          <p>No hay datos de distribución disponibles</p>
        </div>
      </div>
    );
  }

  const totalCalls = distributionData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="h-80 w-full">
      <h3 className="text-lg font-semibold mb-2 text-center">Distribución de Llamadas</h3>
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
            label={({ name, value }) => 
              `${name}: ${value} (${((value / totalCalls) * 100).toFixed(1)}%)`
            }
            labelLine={false}
          >
            {distributionData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => {
              const percentage = ((value / totalCalls) * 100).toFixed(1);
              return [`${value} llamadas (${percentage}%)`];
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};