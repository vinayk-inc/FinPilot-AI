import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  ShieldAlert,
  Briefcase,
  ArrowRight,
  TrendingDown,
  Info,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line
} from 'recharts';
import { getMarket, getStock } from '../services/api';
import { MarketCard as IMarketCard, StockSummary } from '../types';
import { formatNumberINR, formatPercent } from '../utils/formatters';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [marketCards, setMarketCards] = useState<IMarketCard[]>([]);
  const [loadingMarket, setLoadingMarket] = useState(true);
  const [marketError, setMarketError] = useState<string | null>(null);

  const [benchmarkTicker, setBenchmarkTicker] = useState('^NSEI');
  const [benchmarkPeriod, setBenchmarkPeriod] = useState('1y');
  const [benchmarkData, setBenchmarkData] = useState<StockSummary | null>(null);
  const [loadingBenchmark, setLoadingBenchmark] = useState(true);

  const fetchMarket = async () => {
    try {
      setLoadingMarket(true);
      setMarketError(null);
      const data = await getMarket();
      setMarketCards(data);
    } catch (err: any) {
      setMarketError(err.message || 'Failed to retrieve market watch data.');
    } finally {
      setLoadingMarket(false);
    }
  };

  const fetchBenchmark = async (ticker: string, period: string) => {
    try {
      setLoadingBenchmark(true);
      const data = await getStock(ticker, period);
      setBenchmarkData(data);
    } catch (err: any) {
      console.error('Failed to load benchmark data:', err);
    } finally {
      setLoadingBenchmark(false);
    }
  };

  useEffect(() => {
    fetchMarket();
  }, []);

  useEffect(() => {
    fetchBenchmark(benchmarkTicker, benchmarkPeriod);
  }, [benchmarkTicker, benchmarkPeriod]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Hero Banner */}
      <div className="p-8 rounded-2xl bg-gradient-to-r from-[#142746] via-[#101E36] to-[#10182A] border border-[#263B5C] relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial-gradient from-blue-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[#60A5FA] text-xs font-bold tracking-wider uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Your Financial Command Centre
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F8FAFC] tracking-tight mb-3">
            Welcome to FinPilot AI.
          </h1>
          <p className="text-[#A9B9D0] text-base leading-relaxed">
            Research markets, analyse portfolios, measure risk and make more informed financial decisions from one unified intelligence workspace.
          </p>
        </div>
      </div>

      {/* Market Watch Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold text-[#F8FAFC]">Market Watch</h2>
            <p className="text-xs text-[#94A3B8]">
              Live market watchlist from Yahoo Finance. Real-time updates and historical market breadth.
            </p>
          </div>
        </div>

        {marketError && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center justify-between">
            <span>{marketError}</span>
            <button
              onClick={fetchMarket}
              className="text-xs font-semibold underline hover:text-white"
            >
              Retry
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {loadingMarket ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-[#121D32] border border-[#26344E] rounded-xl p-5 animate-pulse space-y-3">
                <div className="h-4 bg-[#1E293B] rounded w-1/2"></div>
                <div className="h-8 bg-[#1E293B] rounded w-3/4"></div>
                <div className="h-10 bg-[#1E293B] rounded w-full"></div>
              </div>
            ))
          ) : (
            marketCards.map((card) => {
              const isPositive = (card.change_percent ?? 0) >= 0;
              const hasData = card.current !== null;

              return (
                <div
                  key={card.name}
                  onClick={() => {
                    setBenchmarkTicker(card.ticker);
                  }}
                  className={`bg-[#121D32] border rounded-xl p-5 transition-all duration-200 cursor-pointer shadow-sm relative overflow-hidden group ${
                    benchmarkTicker === card.ticker
                      ? 'border-[#60A5FA] bg-[#16233D]'
                      : 'border-[#26344E] hover:border-[#3B5075] hover:bg-[#152033]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#9FB1CA]">
                      {card.name}
                    </span>
                    <span className="text-[10px] text-[#64748B] font-mono">{card.ticker}</span>
                  </div>

                  {hasData ? (
                    <>
                      <div className="text-2xl font-bold text-[#F8FAFC] tracking-tight">
                        ₹{formatNumberINR(card.current)}
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <span
                          className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded ${
                            isPositive
                              ? 'text-emerald-400 bg-emerald-500/10'
                              : 'text-rose-400 bg-rose-500/10'
                          }`}
                        >
                          {isPositive ? '+' : ''}
                          {card.change_percent?.toFixed(2)}%
                        </span>

                        <span className="text-xs text-[#94A3B8]">
                          {isPositive ? '+' : ''}₹{formatNumberINR(card.change)}
                        </span>
                      </div>

                      {/* Sparkline */}
                      {card.sparkline && card.sparkline.length > 2 && (
                        <div className="h-9 mt-3 -mx-2">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={card.sparkline}>
                              <Line
                                type="monotone"
                                dataKey="price"
                                stroke={isPositive ? '#10B981' : '#F43F5E'}
                                strokeWidth={1.8}
                                dot={false}
                                isAnimationActive={false}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="py-4 text-center">
                      <div className="text-sm font-medium text-[#94A3B8]">Data Unavailable</div>
                      <div className="text-xs text-[#64748B] mt-1">{card.status}</div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Benchmark Historical Chart */}
      <div className="bg-[#10182A] border border-[#26344E] rounded-2xl p-6 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-[#F8FAFC]">
                {benchmarkData?.ticker || benchmarkTicker} Historical Performance
              </h3>
              <span className="text-xs px-2 py-0.5 rounded bg-[#1E293B] text-[#60A5FA] font-medium">
                {benchmarkPeriod.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-[#94A3B8] mt-1">
              Select any market card above or change the historical time window.
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-[#121D32] p-1 rounded-xl border border-[#26344E]">
            {['1mo', '3mo', '6mo', '1y', '2y', '5y'].map((p) => (
              <button
                key={p}
                onClick={() => setBenchmarkPeriod(p)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  benchmarkPeriod === p
                    ? 'bg-[#3B82F6] text-white shadow-sm'
                    : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                }`}
              >
                {p.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Metrics Row for Selected Benchmark */}
        {benchmarkData && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="bg-[#121D32] p-3.5 rounded-xl border border-[#26344E]/80">
              <div className="text-[11px] font-medium text-[#9FB1CA]">Latest Close</div>
              <div className="text-lg font-bold text-[#F8FAFC]">₹{formatNumberINR(benchmarkData.latest_close)}</div>
            </div>
            <div className="bg-[#121D32] p-3.5 rounded-xl border border-[#26344E]/80">
              <div className="text-[11px] font-medium text-[#9FB1CA]">Period Return</div>
              <div className={`text-lg font-bold ${benchmarkData.total_return_percent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatPercent(benchmarkData.total_return_percent)}
              </div>
            </div>
            <div className="bg-[#121D32] p-3.5 rounded-xl border border-[#26344E]/80">
              <div className="text-[11px] font-medium text-[#9FB1CA]">Annual Volatility</div>
              <div className="text-lg font-bold text-[#F8FAFC]">{benchmarkData.annualized_volatility_percent.toFixed(2)}%</div>
            </div>
            <div className="bg-[#121D32] p-3.5 rounded-xl border border-[#26344E]/80">
              <div className="text-[11px] font-medium text-[#9FB1CA]">Data Points</div>
              <div className="text-lg font-bold text-[#F8FAFC]">{benchmarkData.observations} days</div>
            </div>
          </div>
        )}

        <div className="h-80 w-full">
          {loadingBenchmark ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#60A5FA]"></div>
            </div>
          ) : benchmarkData?.history && benchmarkData.history.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={benchmarkData.history} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#60A5FA" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#26344E" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#64748B"
                  fontSize={11}
                  tickLine={false}
                  minTickGap={40}
                />
                <YAxis
                  stroke="#64748B"
                  fontSize={11}
                  tickLine={false}
                  domain={['auto', 'auto']}
                  tickFormatter={(val) => `₹${val.toLocaleString()}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#10182A',
                    borderColor: '#26344E',
                    borderRadius: '8px',
                    color: '#F8FAFC',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                  }}
                  formatter={(val: any) => [`₹${formatNumberINR(Number(val))}`, 'Adjusted Close']}
                  labelFormatter={(lbl) => `Date: ${lbl}`}
                />
                <Area
                  type="monotone"
                  dataKey="close"
                  stroke="#60A5FA"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#priceGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm text-[#94A3B8]">
              No historical chart points available.
            </div>
          )}
        </div>
      </div>

      {/* Explore the Platform */}
      <div>
        <h2 className="text-xl font-bold text-[#F8FAFC] mb-4">Explore Platform Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div
            onClick={() => onNavigate('Stock Research')}
            className="p-6 rounded-xl bg-[#121D32] border border-[#26344E] hover:border-[#3B5075] transition-all cursor-pointer group hover:bg-[#152033]"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[#60A5FA] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#F8FAFC] flex items-center justify-between">
              Stock Research
              <ArrowRight className="w-4 h-4 text-[#60A5FA] group-hover:translate-x-1 transition-transform" />
            </h3>
            <p className="text-sm text-[#94A3B8] mt-2">
              Deep dive into price action, volatility calculations, and export historical CSV prices.
            </p>
          </div>

          <div
            onClick={() => onNavigate('Risk Analytics')}
            className="p-6 rounded-xl bg-[#121D32] border border-[#26344E] hover:border-[#3B5075] transition-all cursor-pointer group hover:bg-[#152033]"
          >
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#F8FAFC] flex items-center justify-between">
              Risk Analytics
              <ArrowRight className="w-4 h-4 text-rose-400 group-hover:translate-x-1 transition-transform" />
            </h3>
            <p className="text-sm text-[#94A3B8] mt-2">
              Quantify downside exposure with historical VaR, CVaR and return distribution histograms.
            </p>
          </div>

          <div
            onClick={() => onNavigate('Portfolio Analyzer')}
            className="p-6 rounded-xl bg-[#121D32] border border-[#26344E] hover:border-[#3B5075] transition-all cursor-pointer group hover:bg-[#152033]"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#F8FAFC] flex items-center justify-between">
              Portfolio Analyzer
              <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
            </h3>
            <p className="text-sm text-[#94A3B8] mt-2">
              Upload price files, adjust asset weightings, and model cumulative portfolio trajectory.
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-[#10182A] border border-[#26344E] text-xs text-[#94A3B8] flex items-center gap-3">
        <Info className="w-5 h-5 text-[#60A5FA] shrink-0" />
        <span>
          FinPilot AI is a competition-grade financial analytics platform. Market data is retrieved dynamically via Yahoo Finance and processed via high-performance NumPy/Pandas pipelines.
        </span>
      </div>
    </div>
  );
};
