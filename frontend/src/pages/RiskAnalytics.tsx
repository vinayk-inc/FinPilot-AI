import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Info,
  Calendar,
  Percent,
  TrendingDown,
  BarChart2,
  RefreshCw
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';
import { analyzeRisk } from '../services/api';
import { RiskResult } from '../types';
import { MetricCard } from '../components/MetricCard';
import { formatCurrencyINR, formatNumberINR } from '../utils/formatters';

export const RiskAnalytics: React.FC = () => {
  const [ticker, setTicker] = useState('^NSEI');
  const [period, setPeriod] = useState('1y');
  const [confidence, setConfidence] = useState(0.95);
  const [portfolioValue, setPortfolioValue] = useState(100000);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [riskData, setRiskData] = useState<RiskResult | null>(null);

  const handleCalculateRisk = async (
    t = ticker,
    p = period,
    c = confidence,
    v = portfolioValue
  ) => {
    if (!t.trim()) return;
    try {
      setLoading(true);
      setError(null);
      const data = await analyzeRisk(t.trim().toUpperCase(), p, c, v);
      setRiskData(data);
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
        err.message ||
        'Risk calculation failed. Verify ticker symbol and market data availability.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleCalculateRisk('^NSEI', '1y', 0.95, 100000);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCalculateRisk();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header and Input Form */}
      <div className="bg-[#10182A] border border-[#26344E] rounded-2xl p-6 shadow-md space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-[#F8FAFC]">Risk Analytics</h2>
          <p className="text-sm text-[#94A3B8] mt-1">
            Quantify downside market risk using Value at Risk (VaR), Conditional VaR (Expected Shortfall), and historical return distributions.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {/* Ticker Input */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#9FB1CA] block mb-1">
              Stock or Index Ticker
            </label>
            <input
              type="text"
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              placeholder="e.g. ^NSEI, RELIANCE.NS"
              className="w-full bg-[#121D32] border border-[#26344E] rounded-xl px-4 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6]"
            />
          </div>

          {/* Lookback Period */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#9FB1CA] block mb-1">
              Lookback Period
            </label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full bg-[#121D32] border border-[#26344E] rounded-xl px-4 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6]"
            >
              <option value="6mo">6 Months</option>
              <option value="1y">1 Year</option>
              <option value="2y">2 Years</option>
              <option value="5y">5 Years</option>
            </select>
          </div>

          {/* Confidence Level */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#9FB1CA] block mb-1">
              VaR Confidence Level
            </label>
            <select
              value={confidence}
              onChange={(e) => setConfidence(parseFloat(e.target.value))}
              className="w-full bg-[#121D32] border border-[#26344E] rounded-xl px-4 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6]"
            >
              <option value={0.90}>90% Confidence</option>
              <option value={0.95}>95% Confidence</option>
              <option value={0.99}>99% Confidence</option>
            </select>
          </div>

          {/* Portfolio Value */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#9FB1CA] block mb-1">
              Portfolio Value (₹)
            </label>
            <input
              type="number"
              min={1000}
              step={5000}
              value={portfolioValue}
              onChange={(e) => setPortfolioValue(parseFloat(e.target.value) || 0)}
              className="w-full bg-[#121D32] border border-[#26344E] rounded-xl px-4 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6]"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-4 flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold text-sm transition-colors shadow-md shadow-blue-500/20 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Calculating Risk Metrics...
                </>
              ) : (
                'Calculate Risk'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Error notification */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Risk Metrics */}
      {riskData && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <MetricCard
              label={`Historical VaR (${riskData.confidence_label})`}
              value={formatCurrencyINR(riskData.var_amount)}
              change={-riskData.var_percent}
              changeType="negative"
              subtext={`Estimated 1-day max loss (${riskData.var_percent.toFixed(2)}%)`}
              icon={<ShieldAlert className="w-5 h-5 text-amber-400" />}
            />
            <MetricCard
              label={`Historical CVaR (${riskData.confidence_label})`}
              value={formatCurrencyINR(riskData.cvar_amount)}
              change={-riskData.cvar_percent}
              changeType="negative"
              subtext={`Expected shortfall in tail (${riskData.cvar_percent.toFixed(2)}%)`}
              icon={<TrendingDown className="w-5 h-5 text-rose-400" />}
            />
            <MetricCard
              label="Annualised Volatility"
              value={`${riskData.annualized_volatility_percent.toFixed(2)}%`}
              subtext={`From ${riskData.observations} daily returns`}
              icon={<Percent className="w-5 h-5 text-blue-400" />}
            />
          </div>

          {/* Supplementary Statistics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#121D32] p-4 rounded-xl border border-[#26344E]">
              <span className="text-[11px] font-medium text-[#9FB1CA]">Positive Return Days</span>
              <div className="text-lg font-bold text-emerald-400 mt-0.5">
                {riskData.positive_days_percent}%
              </div>
            </div>
            <div className="bg-[#121D32] p-4 rounded-xl border border-[#26344E]">
              <span className="text-[11px] font-medium text-[#9FB1CA]">Negative Return Days</span>
              <div className="text-lg font-bold text-rose-400 mt-0.5">
                {riskData.negative_days_percent}%
              </div>
            </div>
            <div className="bg-[#121D32] p-4 rounded-xl border border-[#26344E]">
              <span className="text-[11px] font-medium text-[#9FB1CA]">Max 1-Day Gain</span>
              <div className="text-lg font-bold text-emerald-400 mt-0.5">
                +{riskData.max_single_day_gain_percent}%
              </div>
            </div>
            <div className="bg-[#121D32] p-4 rounded-xl border border-[#26344E]">
              <span className="text-[11px] font-medium text-[#9FB1CA]">Max 1-Day Loss</span>
              <div className="text-lg font-bold text-rose-400 mt-0.5">
                {riskData.max_single_day_loss_percent}%
              </div>
            </div>
          </div>

          {/* Return Distribution Histogram */}
          <div className="bg-[#10182A] border border-[#26344E] rounded-2xl p-6 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-lg font-bold text-[#F8FAFC]">Distribution of Daily Returns</h3>
                <p className="text-xs text-[#94A3B8]">
                  Empirical histogram of daily simple returns. Red bars indicate the VaR tail risk zone ({riskData.confidence_label} confidence).
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5 text-[#E2E8F0]">
                  <div className="w-3 h-3 rounded-sm bg-[#60A5FA]"></div> Normal Region
                </span>
                <span className="flex items-center gap-1.5 text-[#E2E8F0]">
                  <div className="w-3 h-3 rounded-sm bg-[#F43F5E]"></div> VaR Loss Tail
                </span>
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={riskData.distribution} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#26344E" vertical={false} />
                  <XAxis
                    dataKey="bin_label"
                    stroke="#64748B"
                    fontSize={10}
                    tickLine={false}
                    interval={3}
                  />
                  <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#10182A',
                      borderColor: '#26344E',
                      borderRadius: '8px',
                      color: '#F8FAFC',
                    }}
                    formatter={(val: any) => [`${val} days`, 'Frequency']}
                    labelFormatter={(lbl) => `Return Range: ${lbl}`}
                  />
                  <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                    {riskData.distribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.is_var_zone ? '#F43F5E' : '#60A5FA'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Informational Callout */}
          <div className="p-4 rounded-xl bg-[#121D32] border border-[#26344E] text-xs text-[#94A3B8] flex items-start gap-3">
            <Info className="w-5 h-5 text-[#60A5FA] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold text-[#E2E8F0]">Statistical Footnote:</span>
              <p>
                Calculated from {riskData.observations} daily trading return observations. VaR (Value at Risk) and CVaR (Conditional Value at Risk) are historical simulation estimates and do not represent guaranteed loss boundaries.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
