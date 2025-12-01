// src/utils/test-normalizer.ts (opcional)
import { DataNormalizer } from '../services/data-normalizer';

// Datos de ejemplo en formato cliente1
const sampleDataCliente1 = {
  status: 'Ended',
  call_status: 'Ended',
  call_successful: 'true',
  duration: '120',
  cost: '0.25',
  country_code: 'us',
  disconnection_reason: 'user_hangup',
  agent_id: 'agent_123',
  sentiment: 'positive',
  timestamp: '2024-01-15T10:30:00Z'
};

// Datos de ejemplo en formato cliente2  
const sampleDataCliente2 = {
  call_result: 'COMPLETED',
  call_state: 'COMPLETED',
  success: 'true',
  call_duration: '180',
  call_cost: '0.35',
  country: 'mx',
  end_reason: 'user_hangup',
  agent: 'agent_456',
  call_sentiment: 'neutral',
  created_at: '2024-01-15T11:30:00Z'
};

export const testNormalizer = () => {
  console.log('🧪 TESTEANDO NORMALIZADOR...');
  
  // Test cliente1
  const normalized1 = DataNormalizer.normalizeCallData(sampleDataCliente1, 'cliente1');
  console.log('Cliente1 normalizado:', normalized1);
  
  // Test cliente2
  const normalized2 = DataNormalizer.normalizeCallData(sampleDataCliente2, 'cliente2');
  console.log('Cliente2 normalizado:', normalized2);
  
  return { normalized1, normalized2 };
};