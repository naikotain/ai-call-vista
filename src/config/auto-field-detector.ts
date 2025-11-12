import { FIELD_MAPPINGS, VALUE_MAPPINGS } from './field-mappings';
import { DEFAULT_CLIENT } from './clients';

// Patrones para detectar campos automáticamente
const FIELD_PATTERNS = {
  status: ['status', 'call_status', 'result', 'call_result', 'state'],
  call_type: ['call_type', 'tipo_de_llamada', 'direction', 'call_direction', 'type'],
  duration: ['duration', 'call_duration', 'duracion', 'length', 'call_length'],
  cost: ['cost', 'call_cost', 'retell_cost', 'costo', 'price'],
  customer_phone: ['customer_phone', 'phone', 'customer_number', 'numero'],
  country_code: ['country_code', 'country', 'pais', 'countrycode'],
  sentiment: ['sentiment', 'call_sentiment', 'sentimiento', 'feeling'],
  agent_id: ['agent_id', 'api', 'agent', 'agente_id'],
  // ... agregar más patrones según necesites
};

export class AutoFieldDetector {
  static detectFields(sampleData: any[], clientId: string) {
    if (!sampleData.length) return FIELD_MAPPINGS[DEFAULT_CLIENT as keyof typeof FIELD_MAPPINGS];
    
    const sample = sampleData[0];
    const availableFields = Object.keys(sample);
    
    const detectedMapping: any = {};
    
    // Detectar cada campo basado en patrones
    Object.entries(FIELD_PATTERNS).forEach(([internalField, patterns]) => {
      const foundField = patterns.find(pattern => 
        availableFields.includes(pattern)
      );
      
      detectedMapping[internalField] = foundField || patterns[0];
    });

    return detectedMapping;
  }
  
  static getAutoFieldMapping(clientId: string, sampleData?: any[]) {


    // Si ya existe mapeo manual, usarlo
    if (FIELD_MAPPINGS[clientId]) {
      return FIELD_MAPPINGS[clientId];
    }
    
    // Si tenemos datos de muestra, detectar automáticamente
    if (sampleData && sampleData.length > 0) {
      return this.detectFields(sampleData, clientId);
    }
    
    // Fallback al cliente1
    return FIELD_MAPPINGS[DEFAULT_CLIENT as keyof typeof FIELD_MAPPINGS];
  }
}