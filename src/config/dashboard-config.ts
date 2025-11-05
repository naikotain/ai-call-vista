// Importar tipos desde el archivo unificado
import { InternalStatus, CallType, Sentiment } from '@/types/normalized';

export const DASHBOARD_CONFIG = {
  status: {
    internal: ['successful', 'failed', 'voicemail', 'transferred', 'ongoing'] as const,
    colors: {
      successful: 'hsl(var(--success))',
      failed: 'hsl(var(--destructive))',
      voicemail: 'hsl(var(--warning))',
      transferred: 'hsl(var(--info))',
      ongoing: 'hsl(var(--primary))'
    },
    labels: {
      successful: 'Exitosa',
      failed: 'Fallida',
      voicemail: 'Buzón de voz',
      transferred: 'Transferida',
      ongoing: 'En curso'
    },
    order: ['successful', 'voicemail', 'transferred', 'ongoing', 'failed'] as const
  },
  call_type: {
    internal: ['inbound', 'outbound'] as const,
    colors: {
      inbound: 'hsl(var(--info))',
      outbound: 'hsl(var(--primary))'
    },
    labels: {
      inbound: 'Entrante',
      outbound: 'Saliente'
    }
  },
  sentiment: {
    internal: ['positive', 'negative', 'neutral'] as const,
    colors: {
      positive: 'hsl(var(--success))',
      negative: 'hsl(var(--destructive))',
      neutral: 'hsl(var(--warning))'
    },
    labels: {
      positive: 'Positivo',
      negative: 'Negativo',
      neutral: 'Neutral'
    }
  }
};

// ❌ ELIMINAR ESTO - ya no necesitamos re-exportar
// export type { InternalStatus, CallType, Sentiment };