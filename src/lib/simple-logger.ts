// Logger simple y centralizado para todo el proyecto
export const log = {
  // Para información general del flujo
  info: (message: string, data?: any) => {
    console.log(`📊 AI-CALL-VISTA: ${message}`, data || '');
  },
  
  // Para errores importantes
  error: (message: string, error?: any) => {
    console.error(`❌ AI-CALL-VISTA-ERROR: ${message}`, error || '');
  },
  
  // Para éxito/confirmaciones
  success: (message: string, data?: any) => {
    console.log(`✅ AI-CALL-VISTA-SUCCESS: ${message}`, data || '');
  },
  
  // Solo para desarrollo (se puede desactivar)
  dev: (message: string, data?: any) => {
    if (import.meta.env.DEV) {
      console.log(`🔧 DEV: ${message}`, data || '');
    }
  }
};