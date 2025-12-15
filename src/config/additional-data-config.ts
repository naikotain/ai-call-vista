// Configuración específica para campos adicionales por cliente
export const ADDITIONAL_DATA_CONFIG = {
  // ✅ CONFIGURACIÓN PARA CLIENTE1 Y CLIENTE2 (OSDOP - Consultas médicas)
  'cliente1': {
    tableTitle: '📋 Datos de Consultas y Trámites - OSDOP',
    columns: [
      { key: 'fecha', displayName: 'Fecha Registro' },
      { key: 'nombre', displayName: 'Nombre' },
      { key: 'segundo_nombre', displayName: 'Segundo Nombre' },
      { key: 'telefono', displayName: 'Teléfono' },
      { key: 'numero_afiliado', displayName: 'N° Afiliado' },
      { key: 'motivo_consulta', displayName: 'Motivo Consulta' },
      { key: 'tipo_tramite', displayName: 'Tipo Trámite' },
      { key: 'localidad', displayName: 'Localidad' },
      { key: 'estado_tramite', displayName: 'Estado' }
    ]
  },
  
  'cliente2': {
      tableTitle: '📋 Sistema de Seguimiento de Consultas - Demo',
      columns: [
        // Campos básicos (usando campos existentes)
        { key: 'fecha', displayName: 'Fecha de Consulta', width: '110px' },
        { key: 'nombre', displayName: 'Nombre del Cliente', width: '120px' },
        { key: 'segundo_nombre', displayName: 'Apellido', width: '120px' },
        { key: 'telefono', displayName: 'Teléfono', width: '110px' },
        { key: 'email', displayName: 'Email', width: '150px' },
        
        // LOS 5 CAMPOS ESPECÍFICOS:
        { key: 'motivo_consulta', displayName: 'Motivo de la Consulta', width: '180px' },
        { key: 'tipo_tramite', displayName: 'Tipo de Llamada', width: '130px' },
        { key: 'numero_afiliado', displayName: 'Medicamento Tomado', width: '110px' },
        { key: 'detalle_reclamo', displayName: 'Anotaciones Generales', width: '200px' },
        { key: 'horario_actual', displayName: 'Instrucciones a Seguir', width: '200px' }
     
      ],
      
      fieldConfig: {
        fecha: { type: 'date', format: 'DD/MM/YYYY' },
        
        'tipo_tramite': {
          type: 'badge',
          variants: {
            'Venta': 'default',
            'Solicitud Interna': 'secondary',
            'Soporte': 'outline',
            'Consulta General': 'destructive',
            'Reclamo': 'destructive',
            'Cotización': 'secondary'
          }
        },
        
        'numero_afiliado': {
          type: 'badge',
          variants: {
            'Sí': 'default',
            'No': 'secondary',
            'No aplica': 'outline',
            'No informado': 'destructive'
          }
        },
        
        
        'email': {
          type: 'email',
          clickable: true
        },
        
        'detalle_reclamo': {
          type: 'textarea',
          maxLines: 3
        },
        
        'horario_actual': {
          type: 'textarea',
          maxLines: 3
        }
      }
    },
    
  'cliente3': {
    tableTitle: '🏢 Leads Inmobiliarios',
    columns: [
      { key: 'fecha', displayName: 'Fecha Contacto', width: '110px' },
      { key: 'nombre', displayName: 'Nombre', width: '120px' },
      { key: 'telefono', displayName: 'Teléfono', width: '110px' },
      { key: 'email', displayName: 'Email', width: '150px' },
      { key: 'tipo_tramite', displayName: 'Compra/Alquiler', width: '120px' },
      { key: 'especialidad', displayName: 'Tipo Propiedad', width: '110px' },
      { key: 'motivo_consulta', displayName: 'Precio Máximo', width: '110px' },
      { key: 'nombre_prestador', displayName: 'Zonas', width: '130px' },
      { key: 'numero_afiliado', displayName: 'Habitaciones', width: '90px' },
      { key: 'segundo_nombre', displayName: 'Baños', width: '70px' },
      { key: 'estado_tramite', displayName: 'Garaje', width: '70px' },
      { key: 'canal_contacto', displayName: 'Piscina', width: '70px' },
      { key: 'detalle_reclamo', displayName: 'Trastero', width: '70px' },
      { key: 'localidad', displayName: 'Calle Interesa', width: '140px' },
      { key: 'precio_propiedad_interesa', displayName: 'Precio Interesa', width: '110px' },
      { key: 'horario_actual', displayName: 'Comentarios', width: '200px' }
    ],
    // 🔧 CONFIGURACIÓN ESPECÍFICA DE FORMATOS PARA INMOBILIARIA
    fieldConfig: {
      fecha: { type: 'date', format: 'DD/MM/YYYY' },
      'motivo_consulta': { 
        type: 'currency', 
        currency: 'EUR',
        style: 'currency'
      },
      'precio_propiedad_interesa': { // ← NUEVO CAMPO CON FORMATO
        type: 'currency',
        currency: 'EUR', 
        style: 'currency'
      },
      'numero_afiliado': { type: 'number' },
      'segundo_nombre': { type: 'number' },
      'estado_tramite': {
        type: 'badge',
        variants: {
          'SI': 'default',
          'NO': 'secondary'
        }
      },
      'canal_contacto': {
        type: 'badge',
        variants: {
          'SI': 'default',
          'NO': 'secondary'
        }
      },
      'detalle_reclamo': {
        type: 'badge', 
        variants: {
          'SI': 'default',
          'NO': 'secondary'
        }
      },
      'tipo_tramite': {
        type: 'badge',
        variants: {
          'COMPRA': 'default',
          'ALQUILER': 'outline',
          'COMPRA/ALQUILER': 'secondary'
        }
      },
      'email': { // ← NUEVO FORMATO PARA EMAIL
        type: 'email',
        clickable: true
      }
    }
  }
};

// Helper para obtener configuración del cliente
export const getAdditionalDataConfig = (clientId: string) => {
  return ADDITIONAL_DATA_CONFIG[clientId as keyof typeof ADDITIONAL_DATA_CONFIG] || 
         ADDITIONAL_DATA_CONFIG['cliente1'];
};