// components/charts/CostCharts.tsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface CostChartsProps {
  costMetrics: {
    totalCosto: number;
    costoPromedioPorLlamada: number;
    costoPorMinuto: number;
    costoPorTipo: {
      inbound: number;
      outbound: number;
    };
    costoPorAgente: Array<{
      agente: string;
      costo: number;
      llamadas: number;
      costoPromedio: number;
    }>;
    costoPorDia: Array<{
      name: string;
      costo: number;
    }>;
  };
  loading?: boolean;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export const CostCharts = ({ costMetrics, loading = false }: CostChartsProps) => {
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-80 w-full" />
        </div>
      </div>
    );
  }

  const agentData = costMetrics.costoPorAgente.map(agent => ({
    name: agent.agente,
    costo: agent.costo,
    llamadas: agent.llamadas
  }));

  const tipoData = [
    { name: 'Entrantes', costo: costMetrics.costoPorTipo.inbound },
    { name: 'Salientes', costo: costMetrics.costoPorTipo.outbound }
  ];

  return (
    <div className="space-y-6">
      {/* Métricas Principales de Costo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Costo Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${costMetrics.totalCosto.toFixed(4)}</div>
            <p className="text-xs text-muted-foreground">Costo acumulado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Costo Promedio/Llamada</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${costMetrics.costoPromedioPorLlamada.toFixed(4)}</div>
            <p className="text-xs text-muted-foreground">Por llamada</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Costo por Minuto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${costMetrics.costoPorMinuto.toFixed(4)}</div>
            <p className="text-xs text-muted-foreground">Tarifa por minuto</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos de Costos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gráfico de costos por agente */}
        <Card>
          <CardHeader>
            <CardTitle>Costo por Agente</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={agentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${Number(value).toFixed(4)}`, 'Costo']} />
                <Legend />
                <Bar dataKey="costo" fill="#3b82f6" name="Costo Total" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de costos por tipo */}
        <Card>
          <CardHeader>
            <CardTitle>Costo por Tipo de Llamada</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={tipoData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="costo"
                >
                  {tipoData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${Number(value).toFixed(4)}`, 'Costo']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Costo por Día de la Semana */}
      <Card>
        <CardHeader>
          <CardTitle>Costos por Día de la Semana</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
            {costMetrics.costoPorDia.map((dia, index) => (
              <div key={index} className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="font-semibold text-sm">{dia.name}</div>
                <div className="text-lg font-bold">${dia.costo.toFixed(4)}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabla detallada de costos por agente */}
      <Card>
        <CardHeader>
          <CardTitle>Desglose Detallado de Costos por Agente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Agente</th>
                  <th className="text-right py-2">Llamadas</th>
                  <th className="text-right py-2">Costo Total</th>
                  <th className="text-right py-2">Costo Promedio</th>
                </tr>
              </thead>
              <tbody>
                {costMetrics.costoPorAgente.map((agent, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-2">{agent.agente}</td>
                    <td className="text-right py-2">{agent.llamadas}</td>
                    <td className="text-right py-2">${agent.costo.toFixed(4)}</td>
                    <td className="text-right py-2">${agent.costoPromedio.toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};