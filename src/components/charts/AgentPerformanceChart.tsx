import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from 'recharts';

interface AgentPerformanceChartProps {
  data: Array<{
    metric: string;
    'Agente 1': number;
    'Agente 2': number;
    'Agente 3': number;
  }>;
}

export const AgentPerformanceChart = ({ data }: AgentPerformanceChartProps) => {
  return (
    <div className="h-96 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data}>
          <PolarGrid stroke="hsl(var(--border))" />
          <PolarAngleAxis 
            dataKey="metric" 
            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 100]} 
            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
          />
          <Radar
            name="Agente 1"
            dataKey="Agente 1"
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary))"
            fillOpacity={0.2}
            strokeWidth={2}
          />
          <Radar
            name="Agente 2"
            dataKey="Agente 2"
            stroke="hsl(var(--success))"
            fill="hsl(var(--success))"
            fillOpacity={0.2}
            strokeWidth={2}
          />
          <Radar
            name="Agente 3"
            dataKey="Agente 3"
            stroke="hsl(var(--warning))"
            fill="hsl(var(--warning))"
            fillOpacity={0.2}
            strokeWidth={2}
          />
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};