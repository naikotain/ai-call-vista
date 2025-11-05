import { DASHBOARD_CONFIG } from '../config/dashboard-config';
import { InternalStatus, CallType, Sentiment } from '../types/normalized';

export const useDashboardConfig = () => {
  // Helper seguro para colores
  const getStatusColor = (status: string): string => {
    if (isValidStatus(status)) {
      return DASHBOARD_CONFIG.status.colors[status];
    }
    return '#6B7280';
  };
  
  // Helper seguro para labels
  const getStatusLabel = (status: string): string => {
    if (isValidStatus(status)) {
      return DASHBOARD_CONFIG.status.labels[status];
    }
    return status;
  };
  
  // Type guard
  const isValidStatus = (status: string): status is InternalStatus => {
    return DASHBOARD_CONFIG.status.internal.includes(status as InternalStatus);
  };

  // Helpers para call_type
  const getCallTypeColor = (callType: string): string => {
    if (isValidCallType(callType)) {
      return DASHBOARD_CONFIG.call_type.colors[callType];
    }
    return '#6B7280';
  };
  
  const getCallTypeLabel = (callType: string): string => {
    if (isValidCallType(callType)) {
      return DASHBOARD_CONFIG.call_type.labels[callType];
    }
    return callType;
  };
  
  const isValidCallType = (callType: string): callType is CallType => {
    return DASHBOARD_CONFIG.call_type.internal.includes(callType as CallType);
  };
  
  // Helpers para sentiment
  const getSentimentColor = (sentiment: string): string => {
    if (isValidSentiment(sentiment)) {
      return DASHBOARD_CONFIG.sentiment.colors[sentiment];
    }
    return '#6B7280';
  };
  
  const getSentimentLabel = (sentiment: string): string => {
    if (isValidSentiment(sentiment)) {
      return DASHBOARD_CONFIG.sentiment.labels[sentiment];
    }
    return sentiment;
  };
  
  const isValidSentiment = (sentiment: string): sentiment is Sentiment => {
    return DASHBOARD_CONFIG.sentiment.internal.includes(sentiment as Sentiment);
  };

  return {
    // Configuraciones
    statusConfig: DASHBOARD_CONFIG.status,
    callTypeConfig: DASHBOARD_CONFIG.call_type,
    sentimentConfig: DASHBOARD_CONFIG.sentiment,
    
    // Helpers
    getStatusColor,
    getStatusLabel,
    getCallTypeColor,
    getCallTypeLabel,
    getSentimentColor,
    getSentimentLabel,
    
    // Type guards
    isValidStatus,
    isValidCallType,
    isValidSentiment,
    
    // Valores internos
    statusValues: DASHBOARD_CONFIG.status.internal,
    callTypeValues: DASHBOARD_CONFIG.call_type.internal,
    sentimentValues: DASHBOARD_CONFIG.sentiment.internal
  };
};