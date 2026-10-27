import axios from 'axios';
import {
  HealthStatus,
  MarketCard,
  StockSummary,
  PortfolioResult,
  RiskResult,
  SipResult,
  ChatMessage
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getHealth = async (): Promise<HealthStatus> => {
  const response = await apiClient.get<HealthStatus>('/health');
  return response.data;
};

export const getMarket = async (): Promise<MarketCard[]> => {
  const response = await apiClient.get<{ data: MarketCard[]; total: number }>('/market');
  return response.data.data;
};

export const getStock = async (ticker: string, period = '1y'): Promise<StockSummary> => {
  const response = await apiClient.get<StockSummary>(`/stock/${encodeURIComponent(ticker)}`, {
    params: { period }
  });
  return response.data;
};

export const analyzePortfolio = async (file: File, weights?: string): Promise<PortfolioResult> => {
  const formData = new FormData();
  formData.append('file', file);
  if (weights && weights.trim()) {
    formData.append('weights', weights.trim());
  }

  const response = await apiClient.post<PortfolioResult>('/portfolio/analyze', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const analyzeRisk = async (
  ticker: string,
  period = '1y',
  confidence = 0.95,
  portfolioValue = 100000
): Promise<RiskResult> => {
  const response = await apiClient.post<RiskResult>('/risk/analyze', {
    ticker,
    period,
    confidence,
    portfolio_value: portfolioValue,
  });
  return response.data;
};

export const calculateSip = async (
  investmentType = 'Monthly SIP',
  amount = 10000,
  annualReturn = 12,
  years = 10
): Promise<SipResult> => {
  const response = await apiClient.post<SipResult>('/sip/calculate', {
    investment_type: investmentType,
    amount,
    annual_return: annualReturn,
    years,
  });
  return response.data;
};

export const sendChatMessage = async (messages: ChatMessage[]): Promise<ChatMessage> => {
  const response = await apiClient.post<ChatMessage>('/ai/chat', {
    messages,
  });
  return response.data;
};
