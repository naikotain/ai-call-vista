import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from 'recharts';

const data = [
  {
    metric: 'Tasa de éxito',
    'Agente 1': 85,
    'Agente 2': 75,
    'Agente 3': 90,
  },
  {
    metric: 'Tasa de transferencia',
    'Agente 1': 15,
    'Agente 2': 10,
    'Agente 3': 5,
  },
  {
    metric: 'Duración promedio',
    'Agente 1': 70,
    'Agente 2': 85,
    'Agente 3': 65,
  },
  {
    metric: 'Satisfacción cliente',
    'Agente 1': 80,
    'Agente 2': 70,
    'Agente 3': 90,
  },
  {
    metric: 'Llamadas/hora',
    'Agente 1': 85,
    'Agente 2': 75,
    'Agente 3': 80,
  },
];

export const AgentPerformanceChart = () => {
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