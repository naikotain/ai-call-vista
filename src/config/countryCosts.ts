// Configuración escalable de costos por país
export interface CountryCost {
  code: string;
  name: string;
  costPerMinute: number;
  currency: string;
  flag?: string;
}

export const COUNTRY_COSTS: Record<string, CountryCost> = {
  'CL': {
    code: 'CL',
    name: 'Chile',
    costPerMinute: 0.04,
    currency: 'USD',
    flag: '🇨🇱'
  },
  'AR': {
    code: 'AR',
    name: 'Argentina',
    costPerMinute: 0.0019,
    currency: 'USD',
    flag: '🇦🇷'
  },
  'MX': {
    code: 'MX',
    name: 'México',
    costPerMinute: 0.02,
    currency: 'USD',
    flag: '🇲🇽'
  },
  'ES': {
    code: 'ES',
    name: 'España',
    costPerMinute: 0.91,
    currency: 'USD',
    flag: '🇪🇸'
  }
};

// Función para obtener costo por país con fallback seguro
export const getCountryCost = (countryCode: string): CountryCost => {
  return COUNTRY_COSTS[countryCode] || COUNTRY_COSTS['CL']; // Default Chile
};

// Función para calcular costo total escalable
export const calculateCallCost = (
  retellCost: number, 
  duration: string, 
  countryCode: string
): number => {
  const country = getCountryCost(countryCode);
  const minutes = parseDurationToMinutes(duration);
  const callCost = minutes * country.costPerMinute;
  return Number((retellCost + callCost).toFixed(4));
};

// Función auxiliar para parsear duración (MANTENIENDO LA EXISTENTE)
export const parseDurationToMinutes = (durationStr: string | null): number => {
  if (!durationStr) return 0;
  
  let totalSeconds = 0;
  const minutesMatch = durationStr.match(/(\d+)m/);
  const secondsMatch = durationStr.match(/(\d+)s/);
  
  if (minutesMatch) totalSeconds += parseInt(minutesMatch[1]) * 60;
  if (secondsMatch) totalSeconds += parseInt(secondsMatch[1]);
  
  return totalSeconds / 60;
};