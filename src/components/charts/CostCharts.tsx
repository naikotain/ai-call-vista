// components/charts/CostCharts.tsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from 'react';

interface CostChartsProps {
  costMetrics?: {
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
    costoPorPais: Array<{
      pais: string;
      codigo?: string;
      costo: number;
      llamadas: number;
      costoPromedio: number;
      porcentaje?: number;
      bandera?: string;
    }>;
    desgloseCostos: {
      totalRetell: number;
      totalLlamadas: number;
      porcentajeRetell?: number;
      porcentajeLlamada?: number;
    };
    tendenciaCostos?: Array<{
      fecha: string;
      costo: number;
      retellCost?: number;
      llamadaCost?: number;
    }>;
  };
  loading?: boolean;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];
const COUNTRY_COLORS: { [key: string]: string } = {
  'Chile': '#0033A0',
  'Argentina': '#74ACDF',
  'México': '#006847',
  'España': '#AA151B',
  'Otros': '#666666'
};

export const CostCharts = ({ costMetrics, loading = false }: CostChartsProps) => {
  useEffect(() => {
    console.log('CostCharts - costMetrics:', costMetrics);
  }, [costMetrics]);

  if (loading || !costMetrics) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
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

  // Datos seguros con valores por defecto
  const safeCostMetrics = {
    totalCosto: costMetrics.totalCosto || 0,
    costoPromedioPorLlamada: costMetrics.costoPromedioPorLlamada || 0,
    costoPorMinuto: costMetrics.costoPorMinuto || 0,
    costoPorTipo: {
      inbound: costMetrics.costoPorTipo?.inbound || 0,
      outbound: costMetrics.costoPorTipo?.outbound || 0
    },
    costoPorAgente: costMetrics.costoPorAgente || [],
    costoPorDia: costMetrics.costoPorDia || [],
    costoPorPais: costMetrics.costoPorPais || [],
    desgloseCostos: {
      totalRetell: costMetrics.desgloseCostos?.totalRetell || 0,
      totalLlamadas: costMetrics.desgloseCostos?.totalLlamadas || 0,
      porcentajeRetell: costMetrics.desgloseCostos?.porcentajeRetell || 0,
      porcentajeLlamada: costMetrics.desgloseCostos?.porcentajeLlamada || 0
    },
    tendenciaCostos: costMetrics.tendenciaCostos || []
  };

  // Preparar datos para gráficos
  const agentData = safeCostMetrics.costoPorAgente.map(agent => ({
    name: agent.agente.substring(0, 10) + (agent.agente.length > 10 ? '...' : ''),
    costo: agent.costo || 0,
    llamadas: agent.llamadas || 0
  }));

  const tipoData = [
    { name: 'Entrantes', costo: safeCostMetrics.costoPorTipo.inbound },
    { name: 'Salientes', costo: safeCostMetrics.costoPorTipo.outbound }
  ];

  const paisData = safeCostMetrics.costoPorPais.map(pais => ({
    name: pais.pais || 'Desconocido',
    codigo: pais.codigo || 'OTRO',
    costo: pais.costo || 0,
    llamadas: pais.llamadas || 0,
    porcentaje: pais.porcentaje || 0
  }));

  const desgloseData = [
    { 
      name: 'Retell AI', 
      value: safeCostMetrics.desgloseCostos.totalRetell, 
      porcentaje: safeCostMetrics.desgloseCostos.porcentajeRetell 
    },
    { 
      name: 'Llamada', 
      value: safeCostMetrics.desgloseCostos.totalLlamadas, 
      porcentaje: safeCostMetrics.desgloseCostos.porcentajeLlamada 
    }
  ];

  // Función segura para formatear números
  const formatCurrency = (value: number) => `$${(value || 0).toFixed(4)}`;

  return (
    <div className="space-y-6">
      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Costo Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(safeCostMetrics.totalCosto)}</div>
            <p className="text-xs text-muted-foreground">Costo acumulado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Costo Promedio/Llamada</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(safeCostMetrics.costoPromedioPorLlamada)}</div>
            <p className="text-xs text-muted-foreground">Por llamada</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Costo Retell AI</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(safeCostMetrics.desgloseCostos.totalRetell)}</div>
            <p className="text-xs text-muted-foreground">
              {(safeCostMetrics.desgloseCostos.porcentajeRetell || 0).toFixed(1)}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Costo Llamadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(safeCostMetrics.desgloseCostos.totalLlamadas)}</div>
            <p className="text-xs text-muted-foreground">
              {(safeCostMetrics.desgloseCostos.porcentajeLlamada || 0).toFixed(1)}% del total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos de Costos por País */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Distribución de Costos por País</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paisData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, porcentaje }) => `${name}: ${(porcentaje || 0).toFixed(1)}%`}
                  outerRadius={80}
                  dataKey="costo"
                >
                  {paisData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COUNTRY_COLORS[entry.name] || COLORS[index % COLORS.length]} 
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'Costo']}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Costo por País</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={paisData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'Costo']}
                />
                <Legend />
                <Bar 
                  dataKey="costo" 
                  name="Costo Total"
                  fill="#3b82f6"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos de Desglose */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Desglose de Costos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={desgloseData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, porcentaje }) => `${name}: ${(porcentaje || 0).toFixed(1)}%`}
                  outerRadius={80}
                  dataKey="value"
                >
                  {desgloseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [formatCurrency(value), 'Costo']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tendencia de costos - Solo si hay datos */}
        {safeCostMetrics.tendenciaCostos.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Tendencia de Costos</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={safeCostMetrics.tendenciaCostos}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="fecha" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => [formatCurrency(value), 'Costo']} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="costo" 
                    stroke="#3b82f6" 
                    name="Costo Total"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Gráficos por Agente y Tipo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {agentData.length > 0 && (
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
                  <Tooltip formatter={(value: number) => [formatCurrency(value), 'Costo']} />
                  <Legend />
                  <Bar dataKey="costo" fill="#3b82f6" name="Costo Total" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

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
                  label={({ name, costo }) => `${name}: ${formatCurrency(costo)}`}
                  outerRadius={80}
                  dataKey="costo"
                >
                  {tipoData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [formatCurrency(value), 'Costo']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tablas Detalladas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tabla de costos por país */}
        {paisData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Costos por País</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">País</th>
                      <th className="text-right py-2">Llamadas</th>
                      <th className="text-right py-2">Costo Total</th>
                      <th className="text-right py-2">% del Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paisData.map((pais, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="py-2 font-medium">{pais.name}</td>
                        <td className="text-right py-2">{pais.llamadas}</td>
                        <td className="text-right py-2">{formatCurrency(pais.costo)}</td>
                        <td className="text-right py-2">{(pais.porcentaje || 0).toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabla de costos por agente */}
        {agentData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Costos por Agente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Agente</th>
                      <th className="text-right py-2">Llamadas</th>
                      <th className="text-right py-2">Costo Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agentData.map((agent, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="py-2">{agent.name}</td>
                        <td className="text-right py-2">{agent.llamadas}</td>
                        <td className="text-right py-2">{formatCurrency(agent.costo)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Costo por Día de la Semana */}
      {safeCostMetrics.costoPorDia.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Costos por Día de la Semana</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
              {safeCostMetrics.costoPorDia.map((dia, index) => (
                <div key={index} className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="font-semibold text-sm">{dia.name}</div>
                  <div className="text-lg font-bold">{formatCurrency(dia.costo || 0)}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};