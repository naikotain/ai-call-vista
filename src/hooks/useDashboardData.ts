import { useState, useEffect } from 'react';

export interface DashboardData {
  pickupRate: number;
  successRate: number;
  transferRate: number;
  voicemailRate: number;
  callVolume: Array<{ name: string; calls: number }>;
  callDuration: Array<{ name: string; duration: number }>;
  latency: Array<{ name: string; latency: number }>;
  inboundOutbound: Array<{ name: string; entrantes: number; salientes: number }>;
  sentiment: Array<{ name: string; value: number; color: string }>;
  agentPerformance: Array<{
    metric: string;
    'Agente 1': number;
    'Agente 2': number;
    'Agente 3': number;
  }>;
}

// Mock API data
const mockApiData: Record<string, DashboardData> = {
  all: {
    pickupRate: 84,
    successRate: 78,
    transferRate: 12,
    voicemailRate: 22,
    callVolume: [
      { name: 'Lun', calls: 120 },
      { name: 'Mar', calls: 145 },
      { name: 'Mié', calls: 132 },
      { name: 'Jue', calls: 158 },
      { name: 'Vie', calls: 140 },
      { name: 'Sáb', calls: 95 },
      { name: 'Dom', calls: 75 },
    ],
    callDuration: [
      { name: 'Lun', duration: 4.2 },
      { name: 'Mar', duration: 5.1 },
      { name: 'Mié', duration: 3.8 },
      { name: 'Jue', duration: 4.5 },
      { name: 'Vie', duration: 4.9 },
      { name: 'Sáb', duration: 6.2 },
      { name: 'Dom', duration: 5.7 },
    ],
    latency: [
      { name: 'Lun', latency: 1.2 },
      { name: 'Mar', latency: 1.5 },
      { name: 'Mié', latency: 1.3 },
      { name: 'Jue', latency: 1.1 },
      { name: 'Vie', latency: 0.9 },
      { name: 'Sáb', latency: 1.4 },
      { name: 'Dom', latency: 1.6 },
    ],
    inboundOutbound: [
      { name: 'Lun', entrantes: 85, salientes: 35 },
      { name: 'Mar', entrantes: 92, salientes: 53 },
      { name: 'Mié', entrantes: 78, salientes: 54 },
      { name: 'Jue', entrantes: 95, salientes: 63 },
      { name: 'Vie', entrantes: 88, salientes: 52 },
      { name: 'Sáb', entrantes: 60, salientes: 35 },
      { name: 'Dom', entrantes: 45, salientes: 30 },
    ],
    sentiment: [
      { name: 'Positivo', value: 65, color: 'hsl(var(--success))' },
      { name: 'Neutral', value: 25, color: 'hsl(var(--warning))' },
      { name: 'Negativo', value: 10, color: 'hsl(var(--danger))' },
    ],
    agentPerformance: [
      { metric: 'Tasa de éxito', 'Agente 1': 85, 'Agente 2': 75, 'Agente 3': 90 },
      { metric: 'Tasa de transferencia', 'Agente 1': 15, 'Agente 2': 10, 'Agente 3': 5 },
      { metric: 'Duración promedio', 'Agente 1': 70, 'Agente 2': 85, 'Agente 3': 65 },
      { metric: 'Satisfacción cliente', 'Agente 1': 80, 'Agente 2': 70, 'Agente 3': 90 },
      { metric: 'Llamadas/hora', 'Agente 1': 85, 'Agente 2': 75, 'Agente 3': 80 },
    ],
  },
  agent1: {
    pickupRate: 92,
    successRate: 85,
    transferRate: 8,
    voicemailRate: 15,
    callVolume: [
      { name: 'Lun', calls: 45 },
      { name: 'Mar', calls: 52 },
      { name: 'Mié', calls: 48 },
      { name: 'Jue', calls: 55 },
      { name: 'Vie', calls: 50 },
      { name: 'Sáb', calls: 35 },
      { name: 'Dom', calls: 28 },
    ],
    callDuration: [
      { name: 'Lun', duration: 3.8 },
      { name: 'Mar', duration: 4.2 },
      { name: 'Mié', duration: 3.5 },
      { name: 'Jue', duration: 4.0 },
      { name: 'Vie', duration: 4.3 },
      { name: 'Sáb', duration: 5.1 },
      { name: 'Dom', duration: 4.8 },
    ],
    latency: [
      { name: 'Lun', latency: 0.9 },
      { name: 'Mar', latency: 1.1 },
      { name: 'Mié', latency: 0.8 },
      { name: 'Jue', latency: 0.7 },
      { name: 'Vie', latency: 0.6 },
      { name: 'Sáb', latency: 1.0 },
      { name: 'Dom', latency: 1.2 },
    ],
    inboundOutbound: [
      { name: 'Lun', entrantes: 30, salientes: 15 },
      { name: 'Mar', entrantes: 35, salientes: 17 },
      { name: 'Mié', entrantes: 32, salientes: 16 },
      { name: 'Jue', entrantes: 38, salientes: 17 },
      { name: 'Vie', entrantes: 33, salientes: 17 },
      { name: 'Sáb', entrantes: 25, salientes: 10 },
      { name: 'Dom', entrantes: 20, salientes: 8 },
    ],
    sentiment: [
      { name: 'Positivo', value: 75, color: 'hsl(var(--success))' },
      { name: 'Neutral', value: 20, color: 'hsl(var(--warning))' },
      { name: 'Negativo', value: 5, color: 'hsl(var(--danger))' },
    ],
    agentPerformance: [
      { metric: 'Tasa de éxito', 'Agente 1': 92, 'Agente 2': 75, 'Agente 3': 90 },
      { metric: 'Tasa de transferencia', 'Agente 1': 8, 'Agente 2': 10, 'Agente 3': 5 },
      { metric: 'Duración promedio', 'Agente 1': 85, 'Agente 2': 85, 'Agente 3': 65 },
      { metric: 'Satisfacción cliente', 'Agente 1': 88, 'Agente 2': 70, 'Agente 3': 90 },
      { metric: 'Llamadas/hora', 'Agente 1': 90, 'Agente 2': 75, 'Agente 3': 80 },
    ],
  },
  agent2: {
    pickupRate: 76,
    successRate: 72,
    transferRate: 15,
    voicemailRate: 28,
    callVolume: [
      { name: 'Lun', calls: 38 },
      { name: 'Mar', calls: 42 },
      { name: 'Mié', calls: 35 },
      { name: 'Jue', calls: 45 },
      { name: 'Vie', calls: 40 },
      { name: 'Sáb', calls: 28 },
      { name: 'Dom', calls: 22 },
    ],
    callDuration: [
      { name: 'Lun', duration: 4.8 },
      { name: 'Mar', duration: 5.5 },
      { name: 'Mié', duration: 4.2 },
      { name: 'Jue', duration: 5.1 },
      { name: 'Vie', duration: 5.3 },
      { name: 'Sáb', duration: 6.8 },
      { name: 'Dom', duration: 6.2 },
    ],
    latency: [
      { name: 'Lun', latency: 1.5 },
      { name: 'Mar', latency: 1.8 },
      { name: 'Mié', latency: 1.6 },
      { name: 'Jue', latency: 1.4 },
      { name: 'Vie', latency: 1.2 },
      { name: 'Sáb', latency: 1.7 },
      { name: 'Dom', latency: 1.9 },
    ],
    inboundOutbound: [
      { name: 'Lun', entrantes: 25, salientes: 13 },
      { name: 'Mar', entrantes: 28, salientes: 14 },
      { name: 'Mié', entrantes: 23, salientes: 12 },
      { name: 'Jue', entrantes: 30, salientes: 15 },
      { name: 'Vie', entrantes: 26, salientes: 14 },
      { name: 'Sáb', entrantes: 18, salientes: 10 },
      { name: 'Dom', entrantes: 15, salientes: 7 },
    ],
    sentiment: [
      { name: 'Positivo', value: 58, color: 'hsl(var(--success))' },
      { name: 'Neutral', value: 30, color: 'hsl(var(--warning))' },
      { name: 'Negativo', value: 12, color: 'hsl(var(--danger))' },
    ],
    agentPerformance: [
      { metric: 'Tasa de éxito', 'Agente 1': 85, 'Agente 2': 72, 'Agente 3': 90 },
      { metric: 'Tasa de transferencia', 'Agente 1': 15, 'Agente 2': 15, 'Agente 3': 5 },
      { metric: 'Duración promedio', 'Agente 1': 70, 'Agente 2': 75, 'Agente 3': 65 },
      { metric: 'Satisfacción cliente', 'Agente 1': 80, 'Agente 2': 65, 'Agente 3': 90 },
      { metric: 'Llamadas/hora', 'Agente 1': 85, 'Agente 2': 70, 'Agente 3': 80 },
    ],
  },
  agent3: {
    pickupRate: 81,
    successRate: 80,
    transferRate: 10,
    voicemailRate: 20,
    callVolume: [
      { name: 'Lun', calls: 37 },
      { name: 'Mar', calls: 51 },
      { name: 'Mié', calls: 49 },
      { name: 'Jue', calls: 58 },
      { name: 'Vie', calls: 50 },
      { name: 'Sáb', calls: 32 },
      { name: 'Dom', calls: 25 },
    ],
    callDuration: [
      { name: 'Lun', duration: 3.6 },
      { name: 'Mar', duration: 4.4 },
      { name: 'Mié', duration: 3.1 },
      { name: 'Jue', duration: 3.4 },
      { name: 'Vie', duration: 3.3 },
      { name: 'Sáb', duration: 4.3 },
      { name: 'Dom', duration: 4.7 },
    ],
    latency: [
      { name: 'Lun', latency: 1.0 },
      { name: 'Mar', latency: 1.2 },
      { name: 'Mié', latency: 1.1 },
      { name: 'Jue', latency: 0.9 },
      { name: 'Vie', latency: 0.8 },
      { name: 'Sáb', latency: 1.1 },
      { name: 'Dom', latency: 1.3 },
    ],
    inboundOutbound: [
      { name: 'Lun', entrantes: 30, salientes: 7 },
      { name: 'Mar', entrantes: 29, salientes: 22 },
      { name: 'Mié', entrantes: 23, salientes: 26 },
      { name: 'Jue', entrantes: 27, salientes: 31 },
      { name: 'Vie', entrantes: 29, salientes: 21 },
      { name: 'Sáb', entrantes: 17, salientes: 15 },
      { name: 'Dom', entrantes: 10, salientes: 15 },
    ],
    sentiment: [
      { name: 'Positivo', value: 82, color: 'hsl(var(--success))' },
      { name: 'Neutral', value: 15, color: 'hsl(var(--warning))' },
      { name: 'Negativo', value: 3, color: 'hsl(var(--danger))' },
    ],
    agentPerformance: [
      { metric: 'Tasa de éxito', 'Agente 1': 85, 'Agente 2': 75, 'Agente 3': 95 },
      { metric: 'Tasa de transferencia', 'Agente 1': 15, 'Agente 2': 10, 'Agente 3': 3 },
      { metric: 'Duración promedio', 'Agente 1': 70, 'Agente 2': 85, 'Agente 3': 90 },
      { metric: 'Satisfacción cliente', 'Agente 1': 80, 'Agente 2': 70, 'Agente 3': 95 },
      { metric: 'Llamadas/hora', 'Agente 1': 85, 'Agente 2': 75, 'Agente 3': 88 },
    ],
  },
};

// Simulate API call
function fetchDataFromApi(agent: string): Promise<DashboardData> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockApiData[agent] || mockApiData.all);
    }, 1000);
  });
}

export interface DashboardFilters {
  agent: string;
  timeRange: string;
  callType: string;
  status: string;
  channel: string;
}

export const useDashboardData = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<DashboardFilters>({
    agent: 'all',
    timeRange: 'month',
    callType: 'all',
    status: 'all',
    channel: 'all',
  });

  const updateData = async (newFilters: Partial<DashboardFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    setLoading(true);
    
    try {
      const newData = await fetchDataFromApi(updatedFilters.agent);
      setData(newData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    updateData({});
  }, []);

  return {
    data,
    loading,
    filters,
    updateData,
  };
};