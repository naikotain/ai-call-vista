import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { COUNTRY_COSTS, calculateCallCost, getCountryCost } from '@/config/countryCosts';

// Usa el tipo correcto de la base de datos
type Call = Database['public']['Tables']['calls']['Row'];

export interface DisconnectionReason {
  reason: string;
  count: number;
  percentage: number;
  category: 'ended' | 'not_connected' | 'error';
}

export interface DisconnectionMetrics {
  totalCalls: number;
  byCategory: {
    ended: number;
    not_connected: number;
    error: number;
  };
  reasons: DisconnectionReason[];
}

export interface AgentPerformanceData {
  metric: string;
  [agentName: string]: number | string;
}

export interface DashboardData {
  pickupRate: number;
  successRate: number;
  averageDuration: number;
  totalCalls: number;
  totalInbound: number;
  totalOutbound: number;
  transferRate: number;
  voicemailRate: number;
  callVolume: Array<{ name: string; calls: number }>;
  callDuration: Array<{ name: string; duration: number }>;
  latency: Array<{ name: string; latency: number }>;
  inboundOutbound: Array<{ name: string; entrantes: number; salientes: number }>;
  sentiment: Array<{ name: string; value: number; color: string }>;
  sentimentTrend: Array<{
    name: string;
    positivo: number;
    neutral?: number;
    negativo?: number;
  }>;
  agentPerformance: AgentPerformanceData[];
  failedMetrics?: {
    totalFailed: number;
    failedInbound: number;
    failedOutbound: number;
    failureRate: number;
    inboundFailureRate: number;
    outboundFailureRate: number;
  };
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
      codigo: string;
      costo: number;
      llamadas: number;
      costoPromedio: number;
      bandera?: string;
    }>;
    desgloseCostos: {
      totalRetell: number;
      totalLlamadas: number;
      porcentajeRetell: number; 
    };
  };
  disconnectMetrics?: DisconnectionMetrics;
  successByHour: Array<{
    hour: string;
    successRate: number;
    totalCalls: number;
    successfulCalls: number;
  }>;
}

// FUNCIÓN PARA CONVERTIR "1m 54s" A SEGUNDOS
const parseDurationToSeconds = (durationStr: string | null): number => {
  if (!durationStr) return 0;
  
  const minutesMatch = durationStr.match(/(\d+)m/);
  const secondsMatch = durationStr.match(/(\d+)s/);
  
  const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;
  const seconds = secondsMatch ? parseInt(secondsMatch[1]) : 0;
  
  return (minutes * 60) + seconds;
};

// Función para manejar diferentes formatos de duración
const parseDuration = (durationStr: string | null): number => {
  if (!durationStr) return 0;
  
  if (/^\d+$/.test(durationStr)) {
    return parseInt(durationStr);
  }
  
  if (durationStr.includes('m') || durationStr.includes('s')) {
    return parseDurationToSeconds(durationStr);
  }
  
  if (/^\d+:\d+$/.test(durationStr)) {
    const [minutes, seconds] = durationStr.split(':').map(Number);
    return (minutes * 60) + seconds;
  }
  
  return 0;
};

// Helper functions para categorizar las razones
const categorizeDisconnectReason = (reason: string): 'ended' | 'not_connected' | 'error' => {
  const endedReasons = ['user_hangup', 'agent_hangup', 'voicemail_reached', 'inactivity', 'max_duration_reached'];
  const notConnectedReasons = ['dial_busy', 'dial_failed', 'dial_no_answer', 'invalid_destination', 
                              'telephony_provider_permission_denied', 'telephony_provider_unavailable',
                              'sip_routing_error', 'marked_as_spam', 'user_declined'];
  
  if (endedReasons.includes(reason)) return 'ended';
  if (notConnectedReasons.includes(reason)) return 'not_connected';
  return 'error';
};

// Helper function to get week days in Spanish
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

export const formatDuration = (minutes: number): string => {
  if (minutes === 0) return '0 seg';
  
  const totalSeconds = Math.round(minutes * 60);
  const mins = Math.floor(totalSeconds / 60);
  const segs = totalSeconds % 60;
  
  if (mins === 0) return `${segs} seg`;
  if (segs === 0) return `${mins} min`;
  
  return `${mins} min ${segs} seg`;
};

// Alternativa formato MM:SS
export const formatDurationMMSS = (minutes: number): string => {
  const totalSeconds = Math.round(minutes * 60);
  const mins = Math.floor(totalSeconds / 60);
  const segs = totalSeconds % 60;
  
  return `${mins}:${segs.toString().padStart(2, '0')}`;
};

// ✅ FUNCIÓN CORREGIDA: calcular éxito por hora
const calculateSuccessByHour = (calls: Call[]): Array<{
  hour: string;
  successRate: number;
  totalCalls: number;
  successfulCalls: number;
}> => {
  const hoursData: Record<number, { total: number; successful: number }> = {};
  
  for (let hour = 0; hour < 24; hour++) {
    hoursData[hour] = { total: 0, successful: 0 };
  }
  
  calls.forEach(call => {
    if (!call.started_at) return;
    
    const callHour = new Date(call.started_at).getHours();
    const isSuccessful = call.status === 'successful';
    
    hoursData[callHour].total += 1;
    if (isSuccessful) {
      hoursData[callHour].successful += 1;
    }
  });
  
  return Object.entries(hoursData)
    .map(([hour, data]) => {
      const hourNum = parseInt(hour);
      const successRate = data.total > 0 ? Math.round((data.successful / data.total) * 100) : 0;
      
      return {
        hour: `${hourNum.toString().padStart(2, '0')}:00`,
        successRate,
        totalCalls: data.total,
        successfulCalls: data.successful
      };
    })
    .filter(item => item.totalCalls > 0)
    .sort((a, b) => parseInt(a.hour) - parseInt(b.hour));
};

// ✅ NUEVAS FUNCIONES DE AGRUPAMIENTO SEGÚN FILTRO
const getCallVolumeData = (calls: Call[], timeRange: string) => {
  switch (timeRange) {
    case 'today':
      return getCallVolumeByHour(calls);
    case 'week':
      return getCallVolumeByDayOfWeek(calls);
    case 'month':
      return getCallVolumeByDayOfMonth(calls);
    case 'all':
      return getCallVolumeByDayOfWeekAllTime(calls);
    default:
      return getCallVolumeByDayOfWeekAllTime(calls);
  }
};

const getCallVolumeByDayOfWeekAllTime = (calls: Call[]) => {
  const weekDays = getWeekDays();
  return weekDays.map(day => ({
    name: day.name,
    calls: calls?.filter(call => {
      if (!call.started_at) return false;
      return new Date(call.started_at).getDay() === day.id;
    }).length || 0
  }));
};

// Agrupar por hora (para "hoy")
const getCallVolumeByHour = (calls: Call[]) => {
  const hoursData: Array<{ name: string; calls: number }> = [];
  
  for (let hour = 0; hour < 24; hour++) {
    const hourCalls = calls?.filter(call => {
      if (!call.started_at) return false;
      const callDate = new Date(call.started_at);
      // ✅ QUITAR restricción de fecha actual
      return callDate.getHours() === hour;
    }).length || 0;
    
    hoursData.push({
      name: `${hour.toString().padStart(2, '0')}:00`,
      calls: hourCalls
    });
  }
  
  return hoursData;
};

// Agrupar por día de semana (para "esta semana")
const getCallVolumeByDayOfWeek = (calls: Call[]) => {
  const weekDays = getWeekDays();
  return weekDays.map(day => ({
    name: day.name,
    calls: calls?.filter(call => {
      if (!call.started_at) return false;
      // ✅ SOLO filtrar por día de semana, SIN fecha actual
      return new Date(call.started_at).getDay() === day.id;
    }).length || 0
  }));
};
// Agrupar por día del mes (para "este mes")
const getCallVolumeByDayOfMonth = (calls: Call[]) => {
  const volumeData: Array<{ name: string; calls: number }> = [];
  
  // Agrupar por día del mes (1-31) sin importar el mes
  for (let day = 1; day <= 31; day++) {
    const dayCalls = calls?.filter(call => {
      if (!call.started_at) return false;
      const callDate = new Date(call.started_at);
      return callDate.getDate() === day;
    }).length || 0;
    
    if (dayCalls > 0) {
      volumeData.push({ name: day.toString(), calls: dayCalls });
    }
  }
  
  return volumeData;
};

// ✅ FUNCIONES PARA CALL DURATION
const getCallDurationData = (calls: Call[], timeRange: string) => {
  switch (timeRange) {
    case 'today':
      return getCallDurationByHour(calls);
    case 'week':
      return getCallDurationByDayOfWeek(calls);
    case 'month':
      return getCallDurationByDayOfMonth(calls);
    case 'all':
      return getCallDurationByDayOfWeekAllTime(calls);
    default:
      return getCallDurationByDayOfWeekAllTime(calls);
  }
};

const getCallDurationByDayOfWeekAllTime = (calls: Call[]) => {
  const weekDays = getWeekDays();
  return weekDays.map(day => {
    const dayCalls = calls?.filter(call => {
      if (!call.started_at || !call.duration) return false;
      return new Date(call.started_at).getDay() === day.id;
    }) || [];

    const totalMinutes = dayCalls.reduce((sum, call) => {
      const seconds = parseDuration(call.duration);
      return sum + (seconds / 60);
    }, 0);

    const avgDurationMinutes = dayCalls.length > 0 
      ? totalMinutes / dayCalls.length
      : 0;

    return {
      name: day.name,
      duration: Math.round(avgDurationMinutes * 10) / 10
    };
  });
};

const getCallDurationByHour = (calls: Call[]) => {
  const durationData: Array<{ name: string; duration: number }> = [];
  
  for (let hour = 0; hour < 24; hour++) {
    const hourCalls = calls?.filter(call => {
      if (!call.started_at || !call.duration) return false;
      const callDate = new Date(call.started_at);
      const today = new Date();
      return callDate.getHours() === hour && 
             callDate.getDate() === today.getDate() &&
             callDate.getMonth() === today.getMonth() &&
             callDate.getFullYear() === today.getFullYear();
    }) || [];

    const totalMinutes = hourCalls.reduce((sum, call) => {
      const seconds = parseDuration(call.duration);
      return sum + (seconds / 60);
    }, 0);

    const avgDurationMinutes = hourCalls.length > 0 
      ? totalMinutes / hourCalls.length
      : 0;

    durationData.push({
      name: `${hour.toString().padStart(2, '0')}:00`,
      duration: Math.round(avgDurationMinutes * 10) / 10
    });
  }
  
  return durationData;
};

const getCallDurationByDayOfWeek = (calls: Call[]) => {
  const weekDays = getWeekDays();
  return weekDays.map(day => {
    const dayCalls = calls?.filter(call => {
      if (!call.started_at || !call.duration) return false;
      // ✅ SOLO filtrar por día de semana
      return new Date(call.started_at).getDay() === day.id;
    }) || [];

    const totalMinutes = dayCalls.reduce((sum, call) => {
      const seconds = parseDuration(call.duration);
      return sum + (seconds / 60);
    }, 0);

    const avgDurationMinutes = dayCalls.length > 0 
      ? totalMinutes / dayCalls.length
      : 0;

    return {
      name: day.name,
      duration: Math.round(avgDurationMinutes * 10) / 10
    };
  });
};


const getCallDurationByDayOfMonth = (calls: Call[]) => {
  const durationData: Array<{ name: string; duration: number }> = [];
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  
  for (let day = 1; day <= daysInMonth; day++) {
    const dayCalls = calls?.filter(call => {
      if (!call.started_at || !call.duration) return false;
      const callDate = new Date(call.started_at);
      return callDate.getDate() === day && 
             callDate.getMonth() === today.getMonth() && 
             callDate.getFullYear() === today.getFullYear();
    }) || [];

    const totalMinutes = dayCalls.reduce((sum, call) => {
      const seconds = parseDuration(call.duration);
      return sum + (seconds / 60);
    }, 0);

    const avgDurationMinutes = dayCalls.length > 0 
      ? totalMinutes / dayCalls.length
      : 0;

    durationData.push({
      name: day.toString(),
      duration: Math.round(avgDurationMinutes * 10) / 10
    });
  }
  
  return durationData;
};

// ✅ FUNCIONES PARA LATENCY
const getLatencyData = (calls: Call[], timeRange: string) => {
  switch (timeRange) {
    case 'today':
      return getLatencyByHour(calls);
    case 'week':
      return getLatencyByDayOfWeek(calls);
    case 'month':
      return getLatencyByDayOfMonth(calls);
    case 'all':
      return getLatencyByDayOfWeekAllTime(calls);
    default:
      return getLatencyByDayOfWeekAllTime(calls);
  }
};

const getLatencyByDayOfWeekAllTime = (calls: Call[]) => {
  const weekDays = getWeekDays();
  return weekDays.map(day => {
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
};

const getLatencyByHour = (calls: Call[]) => {
  const latencyData: Array<{ name: string; latency: number }> = [];
  
  for (let hour = 0; hour < 24; hour++) {
    const hourCalls = calls?.filter(call => {
      if (!call.started_at || !call.latency) return false;
      const callDate = new Date(call.started_at);
      const today = new Date();
      return callDate.getHours() === hour && 
             callDate.getDate() === today.getDate() &&
             callDate.getMonth() === today.getMonth() &&
             callDate.getFullYear() === today.getFullYear();
    }) || [];

    const avgLatency = hourCalls.length > 0 
      ? hourCalls.reduce((sum, call) => sum + (call.latency || 0), 0) / hourCalls.length / 1000
      : 0;

    latencyData.push({
      name: `${hour.toString().padStart(2, '0')}:00`,
      latency: Math.round(avgLatency * 10) / 10
    });
  }
  
  return latencyData;
};

const getLatencyByDayOfWeek = (calls: Call[]) => {
  const weekDays = getWeekDays();
  return weekDays.map(day => {
    const dayCalls = calls?.filter(call => {
      if (!call.started_at || !call.latency) return false;
      // ✅ SOLO filtrar por día de semana
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
};

const getLatencyByDayOfMonth = (calls: Call[]) => {
  const latencyData: Array<{ name: string; latency: number }> = [];
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  
  for (let day = 1; day <= daysInMonth; day++) {
    const dayCalls = calls?.filter(call => {
      if (!call.started_at || !call.latency) return false;
      const callDate = new Date(call.started_at);
      return callDate.getDate() === day && 
             callDate.getMonth() === today.getMonth() && 
             callDate.getFullYear() === today.getFullYear();
    }) || [];

    const avgLatency = dayCalls.length > 0 
      ? dayCalls.reduce((sum, call) => sum + (call.latency || 0), 0) / dayCalls.length / 1000
      : 0;

    latencyData.push({
      name: day.toString(),
      latency: Math.round(avgLatency * 10) / 10
    });
  }
  
  return latencyData;
};

// ✅ FUNCIONES PARA INBOUND/OUTBOUND
const getInboundOutboundData = (calls: Call[], timeRange: string) => {
  switch (timeRange) {
    case 'today':
      return getInboundOutboundByHour(calls);
    case 'week':
      return getInboundOutboundByDayOfWeek(calls);
    case 'month':
      return getInboundOutboundByDayOfMonth(calls);
    case 'all':
      return getInboundOutboundByDayOfWeekAllTime(calls);
    default:
      return getInboundOutboundByDayOfWeekAllTime(calls);
  }
};

const getInboundOutboundByDayOfWeekAllTime = (calls: Call[]) => {
  const weekDays = getWeekDays();
  return weekDays.map(day => {
    const dayCalls = calls?.filter(call => {
      if (!call.started_at) return false;
      return new Date(call.started_at).getDay() === day.id;
    }) || [];

    const entrantes = dayCalls.filter(call => call.tipo_de_llamada === 'inbound').length;
    const salientes = dayCalls.filter(call => call.tipo_de_llamada === 'outbound').length;

    return {
      name: day.name,
      entrantes,
      salientes
    };
  });
};

const getInboundOutboundByHour = (calls: Call[]) => {
  const inboundOutboundData: Array<{ name: string; entrantes: number; salientes: number }> = [];
  
  for (let hour = 0; hour < 24; hour++) {
    const hourCalls = calls?.filter(call => {
      if (!call.started_at) return false;
      const callDate = new Date(call.started_at);
      const today = new Date();
      return callDate.getHours() === hour && 
             callDate.getDate() === today.getDate() &&
             callDate.getMonth() === today.getMonth() &&
             callDate.getFullYear() === today.getFullYear();
    }) || [];

    const entrantes = hourCalls.filter(call => call.tipo_de_llamada === 'inbound').length;
    const salientes = hourCalls.filter(call => call.tipo_de_llamada === 'outbound').length;

    inboundOutboundData.push({
      name: `${hour.toString().padStart(2, '0')}:00`,
      entrantes,
      salientes
    });
  }
  
  return inboundOutboundData;
};

const getInboundOutboundByDayOfWeek = (calls: Call[]) => {
  const weekDays = getWeekDays();
  return weekDays.map(day => {
    const dayCalls = calls?.filter(call => {
      if (!call.started_at) return false;
      // ✅ SOLO filtrar por día de semana
      return new Date(call.started_at).getDay() === day.id;
    }) || [];

    const entrantes = dayCalls.filter(call => call.tipo_de_llamada === 'inbound').length;
    const salientes = dayCalls.filter(call => call.tipo_de_llamada === 'outbound').length;

    return {
      name: day.name,
      entrantes,
      salientes
    };
  });
};

const getInboundOutboundByDayOfMonth = (calls: Call[]) => {
  const inboundOutboundData: Array<{ name: string; entrantes: number; salientes: number }> = [];
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  
  for (let day = 1; day <= daysInMonth; day++) {
    const dayCalls = calls?.filter(call => {
      if (!call.started_at) return false;
      const callDate = new Date(call.started_at);
      return callDate.getDate() === day && 
             callDate.getMonth() === today.getMonth() && 
             callDate.getFullYear() === today.getFullYear();
    }) || [];

    const entrantes = dayCalls.filter(call => call.tipo_de_llamada === 'inbound').length;
    const salientes = dayCalls.filter(call => call.tipo_de_llamada === 'outbound').length;

    inboundOutboundData.push({
      name: day.toString(),
      entrantes,
      salientes
    });
  }
  
  return inboundOutboundData;
};

// NUEVA FUNCIÓN: Calcular costos con sistema por país
const calcularCostosConSistemaPais = (calls: Call[]) => {
  let totalCosto = 0;
  let totalRetellCost = 0;
  let totalCallCost = 0;
  let totalMinutos = 0; 
  
  const costoPorPais: Record<string, { costo: number; llamadas: number }> = {};
  const costoPorTipo = { inbound: 0, outbound: 0 };
  const costoPorAgente: Record<string, { costo: number; llamadas: number }> = {};
  const costoPorDia: Record<string, number> = {};
  const minutosPorDia: Record<string, number> = {};
  

  calls.forEach(call => {
    // Usar country_code o default a Chile para datos antiguos
    const countryCode = call.country_code || 'CL';
    const retellCost = call.retell_cost || 0;
    
    // Calcular costo usando el nuevo sistema
    const costoTotal = calculateCallCost(retellCost, call.duration || '0m', countryCode);
    const costoLlamada = costoTotal - retellCost;
    const minutos = parseDuration(call.duration || '0m') / 60; // ✅ CALCULAR MINUTOS
    
    totalCosto += costoTotal;
    totalRetellCost += retellCost;
    totalCallCost += costoLlamada;
    totalMinutos += minutos;

    // Acumular por país
    if (!costoPorPais[countryCode]) {
      costoPorPais[countryCode] = { costo: 0, llamadas: 0 };
    }
    costoPorPais[countryCode].costo += costoTotal;
    costoPorPais[countryCode].llamadas += 1;

    // Acumular por tipo
    if (call.tipo_de_llamada === 'inbound') {
      costoPorTipo.inbound += costoTotal;
    } else {
      costoPorTipo.outbound += costoTotal;
    }

    // Acumular por agente
    const agentId = call.api || 'unknown';
    if (!costoPorAgente[agentId]) {
      costoPorAgente[agentId] = { costo: 0, llamadas: 0 };
    }
    costoPorAgente[agentId].costo += costoTotal;
    costoPorAgente[agentId].llamadas += 1;


    // ✅ ACUMULAR COSTOS POR DÍA CORRECTAMENTE
    if (call.started_at) {
      const fecha = new Date(call.started_at);
      const diaSemana = fecha.toLocaleDateString('es-ES', { weekday: 'long' }); // "lunes", "martes", etc.
      const diaKey = diaSemana.toLowerCase(); // Para consistencia
      
      costoPorDia[diaKey] = (costoPorDia[diaKey] || 0) + costoTotal;
      minutosPorDia[diaKey] = (minutosPorDia[diaKey] || 0) + minutos;
    }
  });

  const costoPorMinuto = totalMinutos > 0 ? totalCosto / totalMinutos : 0;
  const diasSemana = [
    { key: 'lunes', name: 'Lun', orden: 0 },
    { key: 'martes', name: 'Mar', orden: 1 },
    { key: 'miércoles', name: 'Mié', orden: 2 },
    { key: 'jueves', name: 'Jue', orden: 3 },
    { key: 'viernes', name: 'Vie', orden: 4 },
    { key: 'sábado', name: 'Sáb', orden: 5 },
    { key: 'domingo', name: 'Dom', orden: 6 }
  ];

    

  
  // Formatear costo por país para el dashboard
  const costoPorPaisFormateado = Object.entries(costoPorPais).map(([codigo, data]) => {
    const country = getCountryCost(codigo);
    const porcentaje = totalCosto > 0 ? (data.costo / totalCosto) * 100 : 0;
    return {
      pais: country.name,
      codigo,
      costo: parseFloat(data.costo.toFixed(6)),
      llamadas: data.llamadas,
      costoPromedio: data.llamadas > 0 ? parseFloat((data.costo / data.llamadas).toFixed(6)) : 0,
      porcentaje: parseFloat(porcentaje.toFixed(2)),
      bandera: country.flag
    };
  });

  // Formatear costo por agente
  const costoPorAgenteFormateado = Object.entries(costoPorAgente).map(([agentId, data]) => ({
    agente: agentId,
    costo: parseFloat(data.costo.toFixed(6)),
    llamadas: data.llamadas,
    costoPromedio: data.llamadas > 0 ? parseFloat((data.costo / data.llamadas).toFixed(6)) : 0
  }));

  // Formatear costo por día
  const weekDays = getWeekDays();
  const costoPorDiaFormateado = diasSemana.map(dia => ({
    name: dia.name,
    costo: parseFloat((costoPorDia[dia.key] || 0).toFixed(6)),
    minutos: minutosPorDia[dia.key] || 0,
    costoPorMinuto: (minutosPorDia[dia.key] || 0) > 0 
      ? parseFloat(((costoPorDia[dia.key] || 0) / (minutosPorDia[dia.key] || 1)).toFixed(6))
      : 0
  }));
  

  return {
    totalCosto: parseFloat(totalCosto.toFixed(6)),
    costoPromedioPorLlamada: calls.length > 0 ? parseFloat((totalCosto / calls.length).toFixed(6)) : 0,
    costoPorMinuto: parseFloat(costoPorMinuto.toFixed(6)), // Ya no es fijo, se calcula por país
    costoPorTipo,
    costoPorAgente: costoPorAgenteFormateado,
    costoPorDia: costoPorDiaFormateado,
    costoPorPais: costoPorPaisFormateado, 
    desgloseCostos: {
      totalRetell: parseFloat(totalRetellCost.toFixed(6)),
      totalLlamadas: parseFloat(totalCallCost.toFixed(6)),
      porcentajeRetell: totalCosto > 0 ? parseFloat(((totalRetellCost / totalCosto) * 100).toFixed(2)) : 0,
      porcentajeLlamada: totalCosto > 0 ? parseFloat(((totalCallCost / totalCosto) * 100).toFixed(2)) : 0
    }
  };
};

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
  country: string;
}

// Fetch data from Supabase
async function fetchDataFromSupabase(filters: DashboardFilters): Promise<DashboardData> {
  try {
    let query = supabase
      .from('calls')
      .select('*, agents(name)');

    // Aplicar filtros condicionalmente
    if (filters.agent !== 'all') {
      query = query.eq('api', filters.agent);
    }

    if (filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    if (filters.callType !== 'all') {
      query = query.eq('tipo_de_llamada', filters.callType);
    }

    if (filters.channel !== 'all') {
      query = query.eq('channel', filters.channel);
    }

    // NUEVO: Aplicar filtro por país
    if (filters.country !== 'all') {
      query = query.eq('country_code', filters.country);
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

    // ✅ MÉTRICAS PRINCIPALES CORREGIDAS
    const totalCalls = calls?.length || 0;
    const successfulCalls = calls?.filter(call => call.status === 'successful').length || 0;
    const transferredCalls = calls?.filter(call => call.status === 'transferred').length || 0;
    const voicemailCalls = calls?.filter(call => call.status === 'voicemail').length || 0;
    const answeredCalls = calls?.filter(call => call.status !== 'failed').length || 0;
    const failedCalls = calls?.filter(call => call.status === 'failed').length || 0;
    const inboundCalls = calls?.filter(call => call.tipo_de_llamada === 'inbound').length || 0;
    const outboundCalls = calls?.filter(call => call.tipo_de_llamada === 'outbound').length || 0;
    const totalSeconds = calls?.reduce((sum, call) => sum + parseDuration(call.duration), 0) || 0;
    const averageDurationSeconds = totalCalls > 0 ? totalSeconds / totalCalls : 0;
    const averageDurationMinutes = averageDurationSeconds / 60;
    const averageDurationFormatted = Math.round(averageDurationMinutes * 10) / 10;

    // Calculate rates
    const pickupRate = totalCalls > 0 ? Math.round((answeredCalls / totalCalls) * 100) : 0;
    const successRate = totalCalls > 0 ? Math.round((successfulCalls / totalCalls) * 100) : 0;
    const transferRate = totalCalls > 0 ? Math.round((transferredCalls / totalCalls) * 100) : 0;
    const voicemailRate = totalCalls > 0 ? Math.round((voicemailCalls / totalCalls) * 100) : 0;

    // DEBUG: Verificar datos reales
    console.log('=== DEBUG MÉTRICAS PRINCIPALES ===');
    console.log('Total calls:', totalCalls);
    console.log('Successful calls:', successfulCalls);
    console.log('Success rate:', successRate + '%');

    // ✅ USAR NUEVAS FUNCIONES DE AGRUPAMIENTO
    // 1. Volumen de llamadas por período
    const callVolume = getCallVolumeData(calls || [], filters.timeRange);

    // 2. Duración promedio por período
    const callDuration = getCallDurationData(calls || [], filters.timeRange);

    // 3. Latencia promedio por período
    const latency = getLatencyData(calls || [], filters.timeRange);

    // 4. Llamadas entrantes vs salientes por período
    const inboundOutbound = getInboundOutboundData(calls || [], filters.timeRange);

    // 5. Tasa de éxito por hora (se mantiene igual)
    const successByHour = calculateSuccessByHour(calls || []);

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

    // Sentiment trend por día de semana (se mantiene igual por ahora)
    const weekDays = getWeekDays();
    const sentimentTrend = weekDays.map(day => {
      const dayCalls = calls?.filter(call => {
        if (!call.started_at) return false;
        return new Date(call.started_at).getDay() === day.id;
      }) || [];

      const totalCallsWithSentiment = dayCalls.filter(call => call.sentiment).length;
      
      if (totalCallsWithSentiment === 0) {
        return {
          name: day.name,
          positivo: 0,
          neutral: 0,
          negativo: 0
        };
      }

      const positiveCalls = dayCalls.filter(call => call.sentiment === 'positive').length;
      const neutralCalls = dayCalls.filter(call => call.sentiment === 'neutral').length;
      const negativeCalls = dayCalls.filter(call => call.sentiment === 'negative').length;

      return {
        name: day.name,
        positivo: Math.round((positiveCalls / totalCallsWithSentiment) * 100),
        neutral: Math.round((neutralCalls / totalCallsWithSentiment) * 100),
        negativo: Math.round((negativeCalls / totalCallsWithSentiment) * 100)
      };
    });

    // ✅ AGENT PERFORMANCE CORREGIDO
    const agentPerformanceData = agents?.map(agent => {
      const agentCalls = calls?.filter(call => call.api === agent.id) || [];
      const totalCalls = agentCalls.length;

      if (totalCalls === 0) {
        return {
          agentName: agent.name,
          successRate: 0,
          transferRate: 0,
          avgDuration: 0,
          totalCalls: 0,
          satisfaction: 0,
          callsPerHour: 0
        };
      }

      const successfulCalls = agentCalls.filter(call => call.status === 'successful').length;
      const transferredCalls = agentCalls.filter(call => call.status === 'transferred').length;

      // Calcular duración promedio en minutos
      const totalDurationMinutes = agentCalls.reduce((sum, call) => {
        const durationSeconds = parseDuration(call.duration);
        return sum + (durationSeconds / 60);
      }, 0);
      
      const avgDuration = totalDurationMinutes / totalCalls;

      // Cálculo de satisfacción con datos reales
      const sentimentCalls = agentCalls.filter(call => call.sentiment);
      const positiveCalls = sentimentCalls.filter(call => call.sentiment === 'positive').length;
      const satisfaction = sentimentCalls.length > 0 ? 
        Math.round((positiveCalls / sentimentCalls.length) * 100) : 50;

      // Calcular llamadas por hora
      const totalHours = totalDurationMinutes / 60;
      const callsPerHour = totalHours > 0 ? Math.round(totalCalls / totalHours) : 0;

      return {
        agentName: agent.name,
        successRate: Math.round((successfulCalls / totalCalls) * 100),
        transferRate: Math.round((transferredCalls / totalCalls) * 100),
        avgDuration: Math.round(avgDuration * 10) / 10,
        totalCalls,
        satisfaction,
        callsPerHour: callsPerHour || Math.round(totalCalls / 2)
      };
    }) || [];

    // Formatear para el chart de manera dinámica
    const metrics = [
      { key: 'successRate', label: 'Tasa de éxito (%)' },
      { key: 'transferRate', label: 'Tasa de transferencia (%)' },
      { key: 'satisfaction', label: 'Satisfacción (%)' },
      { key: 'avgDuration', label: 'Duración promedio (min)' },
      { key: 'callsPerHour', label: 'Llamadas por hora' },
      { key: 'totalCalls', label: 'Total de llamadas' }
    ];

    const agentPerformance = metrics.map(metric => {
      const performanceRow: AgentPerformanceData = { metric: metric.label };
      
      agentPerformanceData.forEach(agentData => {
        performanceRow[agentData.agentName] = agentData[metric.key as keyof typeof agentData] || 0;
      });
      
      return performanceRow;
    });

    // Métricas para fallos
    const failedMetrics = {
      totalFailed: failedCalls,
      failedInbound: calls?.filter(call => call.status === 'failed' && call.tipo_de_llamada === 'inbound').length || 0,
      failedOutbound: calls?.filter(call => call.status === 'failed' && call.tipo_de_llamada === 'outbound').length || 0,
      failureRate: totalCalls > 0 ? Math.round((failedCalls / totalCalls) * 100) : 0,
      inboundFailureRate: inboundCalls > 0 ? Math.round((calls?.filter(call => call.status === 'failed' && call.tipo_de_llamada === 'inbound').length || 0) / inboundCalls * 100) : 0,
      outboundFailureRate: outboundCalls > 0 ? Math.round((calls?.filter(call => call.status === 'failed' && call.tipo_de_llamada === 'outbound').length || 0) / outboundCalls * 100) : 0
    };

    // ✅ NUEVO: Calcular costos con sistema por país
    const costMetrics = calcularCostosConSistemaPais(calls || []);

    // Reemplazar nombres de agentes en costoPorAgente
    costMetrics.costoPorAgente = costMetrics.costoPorAgente.map(agenteCosto => {
      const agent = agents?.find(a => a.id === agenteCosto.agente);
      return {
        ...agenteCosto,
        agente: agent?.name || `Agente ${agenteCosto.agente}`
      };
    });

    // Calcular métricas de desconexión
    const disconnectReasonCounts: Record<string, number> = {};

    calls?.forEach((call: Call) => {
      if (call.disconnect_reason) {
        disconnectReasonCounts[call.disconnect_reason] = (disconnectReasonCounts[call.disconnect_reason] || 0) + 1;
      }
    });

    const totalCallsWithDisconnectReason = Object.values(disconnectReasonCounts).reduce((sum, count) => sum + count, 0);
    
    const disconnectReasons = Object.entries(disconnectReasonCounts)
      .map(([reason, count]) => ({
        reason,
        count,
        percentage: totalCallsWithDisconnectReason > 0 ? Math.round((count / totalCallsWithDisconnectReason) * 100) : 0,
        category: categorizeDisconnectReason(reason)
      }))
      .sort((a, b) => b.count - a.count);

    const byCategory = disconnectReasons.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + item.count;
      return acc;
    }, {} as Record<string, number>);

    const disconnectMetrics: DisconnectionMetrics = {
      totalCalls: totalCallsWithDisconnectReason,
      byCategory: {
        ended: byCategory.ended || 0,
        not_connected: byCategory.not_connected || 0,
        error: byCategory.error || 0
      },
      reasons: disconnectReasons
    };

return {
  pickupRate,
  successRate,
  transferRate,
  voicemailRate,
  sentimentTrend,
  averageDuration: averageDurationFormatted,
  totalCalls,
  totalInbound: inboundCalls,
  totalOutbound: outboundCalls,
  callVolume,
  callDuration,
  latency,
  inboundOutbound,
  sentiment,
  agentPerformance,
  failedMetrics,
  costMetrics: {
    ...costMetrics,
    desgloseCostos: {
      ...costMetrics.desgloseCostos,
      porcentajeRetell: costMetrics.totalCosto > 0 
        ? parseFloat(((costMetrics.desgloseCostos.totalRetell / costMetrics.totalCosto) * 100).toFixed(2))
        : 0
    }
  },
  disconnectMetrics,
  successByHour
};

  } catch (error) {
    console.error('Error fetching data from Supabase:', error);
    
    const weekDays = getWeekDays();
    const emptyDayData = weekDays.map(day => ({ name: day.name, calls: 0 }));
    
return {
  pickupRate: 0,
  successRate: 0,
  transferRate: 0,
  averageDuration: 0,
  totalCalls: 0,
  totalInbound: 0,
  totalOutbound: 0,
  voicemailRate: 0,
  sentimentTrend: weekDays.map(day => ({
    name: day.name,
    positivo: 0,
    neutral: 0,
    negativo: 0
  })),
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
  },
  costMetrics: {
    totalCosto: 0,
    costoPromedioPorLlamada: 0,
    costoPorMinuto: 0,
    costoPorTipo: {
      inbound: 0,
      outbound: 0
    },
    costoPorAgente: [],
    costoPorDia: weekDays.map(day => ({ name: day.name, costo: 0 })),
    costoPorPais: [],
    desgloseCostos: {
      totalRetell: 0,
      totalLlamadas: 0,
      porcentajeRetell: 0
    }
  },
  disconnectMetrics: {
    totalCalls: 0,
    byCategory: {
      ended: 0,
      not_connected: 0,
      error: 0
    },
    reasons: []
  },
  successByHour: []
};
  }
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
    country: 'all'
  });
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