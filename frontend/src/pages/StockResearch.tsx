import React, { useState, useEffect } from 'react';
import {
  Search,
  Download,
  TrendingUp,
  Activity,
  Calendar,
  AlertCircle,
  Table as TableIcon
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { getStock } from '../services/api';
import { StockSummary } from '../types';
import { MetricCard } from '../components/MetricCard';
import { formatNumberINR, formatPercent } from '../utils/formatters';

const PRESET_TICKERS = [
  'RELIANCE.NS',
  'TCS.NS',
  'INFY.NS',
  'HDFCBANK.NS',
  'TATAMOTORS.NS',
  '^NSEI',
  '^BSESN',
];

export const StockResearch: React.FC = () => {
  const [tickerInput, setTickerInput] = useState('RELIANCE.NS');
  const [period, setPeriod] = useState('1y');
  const [stockData, setStockData] = useState<StockSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStock = async (symbol: string, timePeriod: string) => {
    if (!symbol.trim()) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getStock(symbol.trim().toUpperCase(), timePeriod);
      setStockData(data);
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
        err.message ||
        `No market data found for '${symbol}'. Please verify the ticker symbol.`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStock('RELIANCE.NS', '1y');
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStock(tickerInput, period);
  };

  const handlePresetSelect = (preset: string) => {
    setTickerInput(preset);
    fetchStock(preset, period);
  };

  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod);
    if (stockData?.ticker) {
      fetchStock(stockData.ticker, newPeriod);
    }
  };

  const handleDownloadCsv = () => {
    if (!stockData || !stockData.history.length) return;

    const headers = 'Date,Open,High,Low,Close,Volume\n';
    const rows = stockData.history
      .map(
        (item) =>
          `${item.date},${item.open},${item.high},${item.low},${item.close},${item.volume}`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${stockData.ticker.replace('.', '_')}_historical_${period}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & Controls */}
      <div className="bg-[#10182A] border border-[#26344E] rounded-2xl p-6 shadow-md space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-[#F8FAFC]">Stock Research</h2>
          <p className="text-sm text-[#94A3B8] mt-1">
            Explore real-time and historical price dynamics, volatility profiles, and export datasets.
          </p>
        </div>

        {/* Input & Filters */}
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3 pt-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={tickerInput}
              onChange={(e) => setTickerInput(e.target.value)}
              placeholder="Enter ticker (e.g., RELIANCE.NS, TCS.NS, ^NSEI)"
              className="w-full bg-[#121D32] border border-[#26344E] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6] transition-colors placeholder:text-[#64748B]"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-[#121D32] p-1 rounded-xl border border-[#26344E]">
            {['1mo', '3mo', '6mo', '1y', '2y', '5y'].map((p) => (
              <button
                type="button"
                key={p}
                onClick={() => handlePeriodChange(p)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  period === p
                    ? 'bg-[#3B82F6] text-white shadow-sm'
                    : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                }`}
              >
                {p.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold text-sm transition-colors shadow-md shadow-blue-500/20 disabled:opacity-50 shrink-0"
          >
            {loading ? 'Analyzing...' : 'Analyse Stock'}
          </button>
        </form>

        {/* Quick presets */}
        <div className="flex items-center gap-2 flex-wrap pt-1 text-xs">
          <span className="text-[#64748B]">Popular tickers:</span>
          {PRESET_TICKERS.map((preset) => (
            <button
              key={preset}
              onClick={() => handlePresetSelect(preset)}
              className="px-2.5 py-1 rounded-lg bg-[#121D32] border border-[#26344E] text-[#9FB1CA] hover:text-[#60A5FA] hover:border-[#3B82F6]/50 transition-colors"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Metrics Row */}
      {stockData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Latest Adjusted Close"
            value={`₹${formatNumberINR(stockData.latest_close)}`}
            change={stockData.change_percent}
            subtext={`Change: ₹${formatNumberINR(stockData.change)}`}
            loading={loading}
          />
          <MetricCard
            label="Period Return"
            value={formatPercent(stockData.total_return_percent)}
            changeType={stockData.total_return_percent >= 0 ? 'positive' : 'negative'}
            subtext={`Over ${stockData.period.toUpperCase()}`}
            loading={loading}
          />
          <MetricCard
            label="Annualised Volatility"
            value={`${stockData.annualized_volatility_percent.toFixed(2)}%`}
            subtext="Calculated from daily simple returns"
            loading={loading}
          />
          <MetricCard
            label="Sample Observations"
            value={`${stockData.observations} Days`}
            subtext={`Prev: ₹${formatNumberINR(stockData.previous_close)}`}
            loading={loading}
          />
        </div>
      )}

      {/* Price & Volume Chart */}
      {stockData && stockData.history.length > 0 && (
        <div className="bg-[#10182A] border border-[#26344E] rounded-2xl p-6 shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-lg font-bold text-[#F8FAFC]">
                {stockData.ticker} — Price History
              </h3>
              <p className="text-xs text-[#94A3B8]">Adjusted close prices with 252-day annualization</p>
            </div>
            <button
              onClick={handleDownloadCsv}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#121D32] hover:bg-[#1A2844] border border-[#26344E] text-xs font-semibold text-[#60A5FA] transition-colors"
            >
              <Download className="w-4 h-4" /> Download Historical Data (CSV)
            </button>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stockData.history} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="stockAreaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#60A5FA" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#26344E" vertical={false} />
                <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} minTickGap={35} />
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
                  }}
                  formatter={(val: any) => [`₹${formatNumberINR(Number(val))}`, 'Close Price']}
                />
                <Area
                  type="monotone"
                  dataKey="close"
                  stroke="#60A5FA"
                  strokeWidth={2.5}
                  fill="url(#stockAreaGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Volume chart */}
          <div className="h-28 w-full pt-2">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] mb-1">
              Trading Volume
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stockData.history} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="date" hide />
                <YAxis stroke="#64748B" fontSize={9} tickLine={false} orientation="right" />
                <Bar dataKey="volume" fill="#3B82F6" opacity={0.4} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Historical Data Table */}
      {stockData && stockData.recent_history.length > 0 && (
        <div className="bg-[#10182A] border border-[#26344E] rounded-2xl p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TableIcon className="w-5 h-5 text-[#60A5FA]" />
              <h3 className="text-lg font-bold text-[#F8FAFC]">Recent Historical Observations</h3>
            </div>
            <span className="text-xs text-[#94A3B8]">Showing latest {stockData.recent_history.length} trading days</span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#26344E]">
            <table className="w-full text-left text-sm text-[#E2E8F0]">
              <thead className="bg-[#121D32] text-xs uppercase text-[#9FB1CA] border-b border-[#26344E]">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Close (₹)</th>
                  <th className="py-3 px-4">Open (₹)</th>
                  <th className="py-3 px-4">High (₹)</th>
                  <th className="py-3 px-4">Low (₹)</th>
                  <th className="py-3 px-4">Volume</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#26344E]/60 font-mono text-xs">
                {stockData.recent_history.map((row) => (
                  <tr key={row.date} className="hover:bg-[#152033] transition-colors">
                    <td className="py-3 px-4 font-sans font-medium text-[#F8FAFC]">{row.date}</td>
                    <td className="py-3 px-4 text-[#60A5FA] font-bold">₹{formatNumberINR(row.close)}</td>
                    <td className="py-3 px-4">₹{formatNumberINR(row.open)}</td>
                    <td className="py-3 px-4 text-emerald-400">₹{formatNumberINR(row.high)}</td>
                    <td className="py-3 px-4 text-rose-400">₹{formatNumberINR(row.low)}</td>
                    <td className="py-3 px-4 text-[#94A3B8]">{row.volume.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
