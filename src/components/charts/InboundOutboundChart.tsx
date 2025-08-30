import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const data = [
  { name: 'Lun', entrantes: 85, salientes: 35 },
  { name: 'Mar', entrantes: 92, salientes: 53 },
  { name: 'Mié', entrantes: 78, salientes: 54 },
  { name: 'Jue', entrantes: 95, salientes: 63 },
  { name: 'Vie', entrantes: 88, salientes: 52 },
  { name: 'Sáb', entrantes: 60, salientes: 35 },
  { name: 'Dom', entrantes: 45, salientes: 30 },
];

export const InboundOutboundChart = () => {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="name" 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px'
            }}
          />
          <Legend />
          <Bar 
            dataKey="entrantes" 
            fill="hsl(var(--primary))"
            radius={[4, 4, 0, 0]}
            name="Entrantes"
          />
          <Bar 
            dataKey="salientes" 
            fill="hsl(var(--success))"
            radius={[4, 4, 0, 0]}
            name="Salientes"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};