export interface MarketCard {
  name: string;
  ticker: string;
  current: number | null;
  previous: number | null;
  change: number | null;
  change_percent: number | null;
  status: string;
  sparkline: Array<{ date: string; price: number }>;
}

export interface StockHistoryItem {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StockSummary {
  ticker: string;
  period: string;
  latest_close: number;
  previous_close: number;
  change: number;
  change_percent: number;
  total_return_percent: number;
  annualized_volatility_percent: number;
  observations: number;
  history: StockHistoryItem[];
  recent_history: StockHistoryItem[];
}

export interface AssetBreakdown {
  asset: string;
  weight_percent: number;
  total_return_percent: number;
  annualized_volatility_percent: number;
}

export interface PortfolioResult {
  filename: string;
  assets: string[];
  asset_count: number;
  observations: number;
  total_return_percent: number;
  annualized_volatility_percent: number;
  asset_breakdown: AssetBreakdown[];
  cumulative_history: Array<{ date: string; return: number }>;
}

export interface RiskDistributionItem {
  bin_start: number;
  bin_end: number;
  bin_label: string;
  count: number;
  is_var_zone: boolean;
}

export interface RiskResult {
  ticker: string;
  period: string;
  confidence: number;
  confidence_label: string;
  portfolio_value: number;
  var_amount: number;
  cvar_amount: number;
  var_percent: number;
  cvar_percent: number;
  annualized_volatility_percent: number;
  observations: number;
  max_single_day_gain_percent: number;
  max_single_day_loss_percent: number;
  positive_days_percent: number;
  negative_days_percent: number;
  distribution: RiskDistributionItem[];
}

export interface SipProgressionItem {
  year: number;
  invested: number;
  future_value: number;
  gain: number;
}

export interface SipResult {
  investment_type: string;
  amount: number;
  annual_return_percent: number;
  years: number;
  invested: number;
  future_value: number;
  gains: number;
  progression: SipProgressionItem[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface HealthStatus {
  status: string;
  app: string;
  version: string;
  ai_ready: boolean;
  ai_model: string;
}
