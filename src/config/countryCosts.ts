// Configuración escalable de costos por país MULTI-TENANT
export interface CountryCost {
  code: string;
  name: string;
  costPerMinute: number;
  currency: string;
  flag: string;
}

// ✅ CONFIGURACIÓN MULTI-CLIENTE
export const COUNTRY_COST_CONFIGS: Record<string, Record<string, CountryCost>> = {
  // 🔵 CLIENTE1 - TODOS LOS PAÍSES A COSTO CERO
  'cliente1': {
    'cl': {
      code: 'cl',
      name: 'Chile',
      costPerMinute: 0,
      currency: 'USD',
      flag: '🇨🇱'
    },
    'arg': {
      code: 'arg',
      name: 'Argentina',
      costPerMinute: 0,
      currency: 'USD',
      flag: '🇦🇷'
    },
    'mx': {
      code: 'mx',
      name: 'México',
      costPerMinute: 0,
      currency: 'USD',
      flag: '🇲🇽'
    },
    'esp': {
      code: 'esp',
      name: 'España',
      costPerMinute: 0,
      currency: 'USD',
      flag: '🇪🇸'
    },
    '*': { // ✅ WILDCARD PARA TODOS LOS DEMÁS PAÍSES
      code: '*',
      name: 'Otros Países',
      costPerMinute: 0, // ✅ CERO para cliente1
      currency: 'USD',
      flag: '🏳️'
    }
  },
  
  // 🟢 CLIENTE2 - COSTOS NORMALES
  'cliente2': {
    'cl': {
      code: 'cl',
      name: 'Chile',
      costPerMinute: 0.04,
      currency: 'USD',
      flag: '🇨🇱'
    },
    'arg': {
      code: 'arg',
      name: 'Argentina',
      costPerMinute: 0.0019,
      currency: 'USD',
      flag: '🇦🇷'
    },
    'mx': {
      code: 'mx',
      name: 'México',
      costPerMinute: 0.02,
      currency: 'USD',
      flag: '🇲🇽'
    },
    'esp': {
      code: 'esp',
      name: 'España',
      costPerMinute: 0.91,
      currency: 'USD',
      flag: '🇪🇸'
    },
    '*': { // ✅ WILDCARD PARA PAÍSES COMO GB, US, ETC.
      code: '*',
      name: 'Otros Países',
      costPerMinute: 0.05, // ✅ Costo por defecto
      currency: 'USD',
      flag: '🏳️'
    }
  },

  'cliente3': {
    'cl': {
      code: 'cl',
      name: 'Chile',
      costPerMinute: 0.04,
      currency: 'USD',
      flag: '🇨🇱'
    },
    'arg': {
      code: 'arg',
      name: 'Argentina',
      costPerMinute: 0.0019,
      currency: 'USD',
      flag: '🇦🇷'
    },
    'mx': {
      code: 'mx',
      name: 'México',
      costPerMinute: 0.02,
      currency: 'USD',
      flag: '🇲🇽'
    },
    'esp': {
      code: 'esp',
      name: 'España',
      costPerMinute: 0.91,
      currency: 'USD',
      flag: '🇪🇸'
    },
    '*': { // ✅ WILDCARD PARA PAÍSES COMO GB, US, ETC.
      code: '*',
      name: 'Otros Países',
      costPerMinute: 0.05, // ✅ Costo por defecto
      currency: 'USD',
      flag: '🏳️'
    }
  }
};

// ✅ FUNCIÓN MEJORADA CON MULTI-TENANT
export const getCountryCost = (countryCode: string, clientId?: string): CountryCost => {
  // Obtener el clientId actual si no se proporciona
  const actualClientId = clientId || getCurrentClientId();
  
  // Normalizar código del país
  const normalizedCode = countryCode.trim().toLowerCase();

  
  // Obtener configuración del cliente o usar cliente2 por defecto
  const clientConfig = COUNTRY_COST_CONFIGS[actualClientId] || COUNTRY_COST_CONFIGS['cliente2'];
  
  // Buscar país específico
  if (clientConfig[normalizedCode]) {
    return clientConfig[normalizedCode];
  }
  
  // ✅ PARA CLIENTE1: Siempre usar wildcard con costo cero
  if (actualClientId === 'cliente1' && clientConfig['*']) {
    return clientConfig['*'];
  }
  
  // Para otros clientes, usar wildcard o crear uno por defecto
  return clientConfig['*'] || {
    code: normalizedCode,
    name: `País ${normalizedCode.toUpperCase()}`,
    costPerMinute: 0.05,
    currency: 'USD',
    flag: '🏳️'
  };
};

// ✅ FUNCIÓN DE CÁLCULO MEJORADA CON MULTI-TENANT
// ✅ FUNCIÓN DE CÁLCULO CORREGIDA - VERIFICAR QUE SUMA CORRECTAMENTE
export const calculateCallCost = (
  retellCost: number, 
  duration: string, 
  countryCode: string,
  clientId?: string
): number => {
  const country = getCountryCost(countryCode, clientId);
  const minutes = parseDurationToMinutes(duration);
  

  const callCost = minutes * country.costPerMinute;
  const totalCost = retellCost + callCost;
  
  return Number(totalCost.toFixed(4));
};
// ✅ NUEVA FUNCIÓN: Calcular costo total para múltiples llamadas
export const calculateTotalCost = (calls: any[], clientId?: string): number => {
  const actualClientId = clientId || getCurrentClientId();
  
  // ✅ Short-circuit para cliente1
  if (actualClientId === 'cliente1') {
    return 0;
  }
  
  return calls.reduce((total, call) => {
    const callCost = calculateCallCost(
      call.retell_cost || 0,
      call.duration,
      call.country_code || 'arg', // default Argentina
      actualClientId
    );
    return total + callCost;
  }, 0);
};

// Función auxiliar para parsear duración (MANTENIENDO LA EXISTENTE)
export const parseDurationToMinutes = (durationStr: string | null): number => {
  if (!durationStr) return 0;
  
  // Si ya es un número (segundos directos), convertir a minutos
  if (!isNaN(Number(durationStr))) {
    const seconds = Number(durationStr);
    return seconds / 60;
  }
  
  const duration = String(durationStr).trim();
  
  // FORMATO "Xm Ys" (ej: "5m 3s")
  if (duration.includes('m') || duration.includes('s')) {
    let totalSeconds = 0;
    const minutesMatch = duration.match(/(\d+)m/);
    const secondsMatch = duration.match(/(\d+)s/);
    
    if (minutesMatch) totalSeconds += parseInt(minutesMatch[1]) * 60;
    if (secondsMatch) totalSeconds += parseInt(secondsMatch[1]);
    
    return totalSeconds / 60;
  }
  
  // FORMATO "MM:SS" (ej: "05:30")
  if (/^\d+:\d{2}$/.test(duration)) {
    const [minutes, seconds] = duration.split(':').map(Number);
    return minutes + (seconds / 60);
  }
  
  console.warn(`Formato de duración no reconocido: "${durationStr}"`);
  return 0;
};



// ✅ NECESITAMOS ESTA FUNCIÓN - Si no existe, créala
export const getCurrentClientId = (): string => {
  // Usar la lógica que ya tienes en tu proyecto
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('client') || 'cliente2'; // default a cliente2
};