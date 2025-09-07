import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
  failedMetrics?: {
    totalFailed: number;
    failedInbound: number;
    failedOutbound: number;
    failureRate: number;
    inboundFailureRate: number;
    outboundFailureRate: number;
  };
}

// Helper function to get week days in Spanish (SIN problemas de timezone)
const getWeekDays = (): { id: number, name: string }[] => {
  return [
    { id: 1, name: 'Lun' },
    { id: 2, name: 'Mar' },
    { id: 3, name: 'Mié' },
    { id: 4, name: 'Jue' },
    { id: 5, name: 'Vie' },
    { id: 6, name: 'Sáb' },
    { id: 0, name: 'Dom' }
  ];
};

// Fetch data from Supabase
async function fetchDataFromSupabase(filters: DashboardFilters): Promise<DashboardData> {
  try {
    let query = supabase
      .from('calls')
      .select('*, agents(name)');

    // Aplicar filtros condicionalmente
    if (filters.agent !== 'all') {
      query = query.eq('agent_id', filters.agent);
    }

    if (filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    if (filters.callType !== 'all') {
      query = query.eq('direction', filters.callType);
    }

    if (filters.channel !== 'all') {
      query = query.eq('channel', filters.channel);
    }

    // Aplicar filtro de rango de tiempo
    if (filters.timeRange !== 'all') {
      const date = new Date();
      let startDate: Date;
      
      switch (filters.timeRange) {
        case 'today':
          startDate = new Date(date.setHours(0, 0, 0, 0));
          break;
        case 'week':
          startDate = new Date(date.setDate(date.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(date.setMonth(date.getMonth() - 1));
          break;
        default:
          startDate = new Date(0);
      }
      
      query = query.gte('started_at', startDate.toISOString());
    }

    // Ejecutar la consulta
    const { data: calls, error: callsError } = await query;

    if (callsError) {
      console.error('Error fetching calls:', callsError);
      throw callsError;
    }

    // Fetch agents for agent performance
    const { data: agents, error: agentsError } = await supabase
      .from('agents')
      .select('*');

    if (agentsError) {
      console.error('Error fetching agents:', agentsError);
      throw agentsError;
    }

    // Calculate metrics
    const totalCalls = calls?.length || 0;
    const successfulCalls = calls?.filter(call => call.status === 'completed' || call.status === 'successful').length || 0;
    const transferredCalls = calls?.filter(call => call.status === 'transferred').length || 0;
    const voicemailCalls = calls?.filter(call => call.status === 'voicemail').length || 0;
    const answeredCalls = calls?.filter(call => call.status !== 'missed' && call.status !== 'failed').length || 0;
    const failedCalls = calls?.filter(call => call.status === 'failed').length || 0;
    const inboundCalls = calls?.filter(call => call.direction === 'inbound').length || 0;
    const outboundCalls = calls?.filter(call => call.direction === 'outbound').length || 0;

    // Calculate rates
    const pickupRate = totalCalls > 0 ? Math.round((answeredCalls / totalCalls) * 100) : 0;
    const successRate = totalCalls > 0 ? Math.round((successfulCalls / totalCalls) * 100) : 0;
    const transferRate = totalCalls > 0 ? Math.round((transferredCalls / totalCalls) * 100) : 0;
    const voicemailRate = totalCalls > 0 ? Math.round((voicemailCalls / totalCalls) * 100) : 0;

    // Get week days for charts (SIN problemas de timezone)
    const weekDays = getWeekDays();
    
    // DEBUG: Verificar datos
    console.log('=== DEBUG DATOS ===');
    console.log('Filtros aplicados:', filters);
    console.log('Total llamadas obtenidas:', calls?.length);
    console.log('Rango de fechas de llamadas:');
    if (calls && calls.length > 0) {
      const dates = calls.map(call => call.started_at).filter(Boolean);
      if (dates.length > 0) {
        console.log('Fecha más antigua:', new Date(Math.min(...dates.map(d => new Date(d).getTime()))));
        console.log('Fecha más reciente:', new Date(Math.max(...dates.map(d => new Date(d).getTime()))));
      }
    }
    
    // 1. Volumen de llamadas por día (SOLUCIÓN ROBUSTA)
    const callVolume = weekDays.map(day => ({
      name: day.name,
      calls: calls?.filter(call => {
        if (!call.started_at) return false;
        return new Date(call.started_at).getDay() === day.id;
      }).length || 0
    }));

    // 2. Duración promedio por día (SOLUCIÓN ROBUSTA)
    const callDuration = weekDays.map(day => {
      const dayCalls = calls?.filter(call => {
        if (!call.started_at || !call.duration) return false;
        return new Date(call.started_at).getDay() === day.id;
      }) || [];

      const avgDuration = dayCalls.length > 0 
        ? dayCalls.reduce((sum, call) => sum + (call.duration || 0), 0) / dayCalls.length / 60
        : 0;

      return {
        name: day.name,
        duration: Math.round(avgDuration * 10) / 10
      };
    });

    // 3. Latencia promedio por día (SOLUCIÓN ROBUSTA)
    const latency = weekDays.map(day => {
      const dayCalls = calls?.filter(call => {
        if (!call.started_at || !call.latency) return false;
        return new Date(call.started_at).getDay() === day.id;
      }) || [];

      const avgLatency = dayCalls.length > 0 
        ? dayCalls.reduce((sum, call) => sum + (call.latency || 0), 0) / dayCalls.length / 1000
        : 0;

      return {
        name: day.name,
        latency: Math.round(avgLatency * 10) / 10
      };
    });

    // 4. Llamadas entrantes vs salientes por día (SOLUCIÓN ROBUSTA)
    const inboundOutbound = weekDays.map(day => ({
      name: day.name,
      entrantes: calls?.filter(call => {
        if (!call.started_at) return false;
        return new Date(call.started_at).getDay() === day.id && call.direction === 'inbound';
      }).length || 0,
      salientes: calls?.filter(call => {
        if (!call.started_at) return false;
        return new Date(call.started_at).getDay() === day.id && call.direction === 'outbound';
      }).length || 0
    }));

    // Calculate sentiment distribution
    const sentimentCounts = {
      positive: calls?.filter(call => call.sentiment === 'positive').length || 0,
      neutral: calls?.filter(call => call.sentiment === 'neutral').length || 0,
      negative: calls?.filter(call => call.sentiment === 'negative').length || 0
    };

    const sentimentTotal = sentimentCounts.positive + sentimentCounts.neutral + sentimentCounts.negative;
    
    const sentiment = [
      {
        name: 'Positivo',
        value: sentimentTotal > 0 ? Math.round((sentimentCounts.positive / sentimentTotal) * 100) : 0,
        color: 'hsl(var(--success))'
      },
      {
        name: 'Neutral',
        value: sentimentTotal > 0 ? Math.round((sentimentCounts.neutral / sentimentTotal) * 100) : 0,
        color: 'hsl(var(--warning))'
      },
      {
        name: 'Negativo',
        value: sentimentTotal > 0 ? Math.round((sentimentCounts.negative / sentimentTotal) * 100) : 0,
        color: 'hsl(var(--danger))'
      }
    ];

    // Calculate agent performance
    const agentPerformance = agents?.slice(0, 3).reduce((acc, agent, index) => {
      const agentCalls = calls?.filter(call => call.agent_id === agent.id) || [];
      const agentName = `Agente ${index + 1}`;
      
      const agentSuccessRate = agentCalls.length > 0 
        ? Math.round((agentCalls.filter(call => call.status === 'completed' || call.status === 'successful').length / agentCalls.length) * 100)
        : 0;
      
      const agentTransferRate = agentCalls.length > 0
        ? Math.round((agentCalls.filter(call => call.status === 'transferred').length / agentCalls.length) * 100)
        : 0;
      
      const agentAvgDuration = agentCalls.length > 0
        ? Math.round(agentCalls.reduce((sum, call) => sum + (call.duration || 0), 0) / agentCalls.length / 60)
        : 0;

      // Mock values for satisfaction and calls per hour
      const satisfaction = Math.floor(Math.random() * 25) + 70;
      const callsPerHour = Math.floor(Math.random() * 20) + 70;

      if (!acc.length) {
        acc = [
          { metric: 'Tasa de éxito', [agentName]: agentSuccessRate },
          { metric: 'Tasa de transferencia', [agentName]: agentTransferRate },
          { metric: 'Duración promedio', [agentName]: agentAvgDuration },
          { metric: 'Satisfacción cliente', [agentName]: satisfaction },
          { metric: 'Llamadas/hora', [agentName]: callsPerHour }
        ];
      } else {
        acc[0][agentName] = agentSuccessRate;
        acc[1][agentName] = agentTransferRate;
        acc[2][agentName] = agentAvgDuration;
        acc[3][agentName] = satisfaction;
        acc[4][agentName] = callsPerHour;
      }

      return acc;
    }, [] as any[]) || [];

    // Métricas para fallos
    const failedMetrics = {
      totalFailed: failedCalls,
      failedInbound: calls?.filter(call => call.status === 'failed' && call.direction === 'inbound').length || 0,
      failedOutbound: calls?.filter(call => call.status === 'failed' && call.direction === 'outbound').length || 0,
      failureRate: totalCalls > 0 ? Math.round((failedCalls / totalCalls) * 100) : 0,
      inboundFailureRate: inboundCalls > 0 ? Math.round((calls?.filter(call => call.status === 'failed' && call.direction === 'inbound').length || 0) / inboundCalls * 100) : 0,
      outboundFailureRate: outboundCalls > 0 ? Math.round((calls?.filter(call => call.status === 'failed' && call.direction === 'outbound').length || 0) / outboundCalls * 100) : 0
    };

    return {
      pickupRate,
      successRate,
      transferRate,
      voicemailRate,
      callVolume,
      callDuration,
      latency,
      inboundOutbound,
      sentiment,
      agentPerformance,
      failedMetrics
    };

  } catch (error) {
    console.error('Error fetching data from Supabase:', error);
    
    // Return default empty data on error
    const weekDays = getWeekDays();
    const emptyDayData = weekDays.map(day => ({ name: day.name, calls: 0 }));
    
    return {
      pickupRate: 0,
      successRate: 0,
      transferRate: 0,
      voicemailRate: 0,
      callVolume: emptyDayData,
      callDuration: emptyDayData.map(d => ({ name: d.name, duration: 0 })),
      latency: emptyDayData.map(d => ({ name: d.name, latency: 0 })),
      inboundOutbound: emptyDayData.map(d => ({ name: d.name, entrantes: 0, salientes: 0 })),
      sentiment: [
        { name: 'Positivo', value: 0, color: 'hsl(var(--success))' },
        { name: 'Neutral', value: 0, color: 'hsl(var(--warning))' },
        { name: 'Negativo', value: 0, color: 'hsl(var(--danger))' }
      ],
      agentPerformance: [],
      failedMetrics: {
        totalFailed: 0,
        failedInbound: 0,
        failedOutbound: 0,
        failureRate: 0,
        inboundFailureRate: 0,
        outboundFailureRate: 0
      }
    };
  }
}

export interface Agent {
  id: string;
  name: string;
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
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<DashboardFilters>({
    agent: 'all',
    timeRange: 'all',
    callType: 'all',
    status: 'all',
    channel: 'all',
  });

  // Fetch agents list
  const fetchAgents = async () => {
    try {
      const { data: agentsData, error } = await supabase
        .from('agents')
        .select('id, name')
        .order('name');
      
      if (error) {
        console.error('Error fetching agents:', error);
        return;
      }
      
      setAgents(agentsData || []);
    } catch (error) {
      console.error('Error fetching agents:', error);
    }
  };

  const updateData = async (newFilters: Partial<DashboardFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    setLoading(true);
    
    try {
      const newData = await fetchDataFromSupabase(updatedFilters);
      setData(newData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load initial data and agents
  useEffect(() => {
    fetchAgents();
    updateData({});
  }, []);

  return {
    data,
    agents,
    loading,
    filters,
    updateData,
  };
};