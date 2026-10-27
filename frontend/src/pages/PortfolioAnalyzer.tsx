import React, { useState } from 'react';
import {
  Upload,
  FileSpreadsheet,
  AlertCircle,
  Download,
  PieChart as PieIcon,
  TrendingUp,
  CheckCircle2,
  Sliders,
  RefreshCw
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { analyzePortfolio } from '../services/api';
import { PortfolioResult } from '../types';
import { MetricCard } from '../components/MetricCard';
import { formatPercent, generateSampleCsv } from '../utils/formatters';

export const PortfolioAnalyzer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [weightsInput, setWeightsInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PortfolioResult | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleDownloadSample = () => {
    const csvContent = generateSampleCsv();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'sample_portfolio_prices.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError('Please select a CSV or Excel file to upload.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await analyzePortfolio(selectedFile, weightsInput);
      setResult(data);
      // Pre-fill weights input if not already customized
      if (!weightsInput) {
        setWeightsInput(data.asset_breakdown.map((a) => a.weight_percent.toFixed(2)).join(', '));
      }
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
        err.message ||
        'Portfolio analysis failed. Check file formatting and weights.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Overview Card */}
      <div className="bg-[#10182A] border border-[#26344E] rounded-2xl p-6 shadow-md space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-[#F8FAFC]">Portfolio Analyzer</h2>
          <p className="text-sm text-[#94A3B8] mt-1">
            Upload historical asset prices to evaluate target-weighted portfolio performance and annualized volatility.
          </p>
        </div>

        {/* Format Spec */}
        <div className="bg-[#121D32] border border-[#26344E] rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#60A5FA]">
              Required File Format
            </span>
            <p className="text-xs text-[#E2E8F0]">
              Must contain one <code className="bg-[#1E293B] px-1.5 py-0.5 rounded text-[#60A5FA]">Date</code> column and one column per numeric asset price.
            </p>
          </div>
          <button
            onClick={handleDownloadSample}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1E293B] hover:bg-[#26344E] border border-[#3B82F6]/30 text-xs font-semibold text-[#60A5FA] transition-colors shrink-0"
          >
            <Download className="w-4 h-4" /> Download Sample CSV
          </button>
        </div>

        {/* Upload Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* File Picker */}
          <div className="border-2 border-dashed border-[#26344E] hover:border-[#3B82F6] rounded-xl p-6 text-center cursor-pointer transition-colors bg-[#121D32]/50 relative group">
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
            />
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-[#60A5FA] flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div className="text-sm font-semibold text-[#F8FAFC]">
                {selectedFile ? selectedFile.name : 'Click or drag price file (.csv, .xlsx)'}
              </div>
              <div className="text-xs text-[#94A3B8]">
                {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB selected` : 'Supports CSV and Excel files'}
              </div>
            </div>
          </div>

          {/* Weights input */}
          <div className="bg-[#121D32] border border-[#26344E] rounded-xl p-5 flex flex-col justify-between space-y-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#9FB1CA] block mb-1">
                Portfolio Weights (%)
              </label>
              <p className="text-xs text-[#64748B] mb-3">
                Comma-separated target percentages in column order. Automatically normalized to 100%. (Leave blank for equal weighting).
              </p>
              <input
                type="text"
                value={weightsInput}
                onChange={(e) => setWeightsInput(e.target.value)}
                placeholder="e.g. 25, 25, 25, 25 or 40, 30, 20, 10"
                className="w-full bg-[#10182A] border border-[#26344E] rounded-xl px-4 py-2.5 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6]"
              />
            </div>

            <button
              onClick={handleAnalyze}
              disabled={loading || !selectedFile}
              className="w-full py-2.5 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold text-sm transition-colors shadow-md shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Calculating Portfolio...
                </>
              ) : (
                'Analyse Portfolio'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Analysis Results */}
      {result && (
        <>
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <MetricCard
              label="Portfolio Return"
              value={formatPercent(result.total_return_percent)}
              changeType={result.total_return_percent >= 0 ? 'positive' : 'negative'}
              subtext="Cumulative compounded return"
              icon={<TrendingUp className="w-5 h-5" />}
            />
            <MetricCard
              label="Annualised Volatility"
              value={`${result.annualized_volatility_percent.toFixed(2)}%`}
              subtext="Based on 252 annual trading days"
              icon={<Sliders className="w-5 h-5" />}
            />
            <MetricCard
              label="Number of Assets"
              value={result.asset_count.toString()}
              subtext={`${result.observations} dated observations`}
              icon={<PieIcon className="w-5 h-5" />}
            />
          </div>

          {/* Cumulative Return Chart */}
          <div className="bg-[#10182A] border border-[#26344E] rounded-2xl p-6 shadow-md space-y-4">
            <div>
              <h3 className="text-lg font-bold text-[#F8FAFC]">Portfolio Cumulative Return (%)</h3>
              <p className="text-xs text-[#94A3B8]">
                Growth trajectory based on target asset allocation across historical periods
              </p>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={result.cumulative_history} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#26344E" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} minTickGap={35} />
                  <YAxis
                    stroke="#64748B"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(val) => `${val.toFixed(1)}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#10182A',
                      borderColor: '#26344E',
                      borderRadius: '8px',
                      color: '#F8FAFC',
                    }}
                    formatter={(val: any) => [`${Number(val).toFixed(2)}%`, 'Cumulative Return']}
                  />
                  <Line
                    type="monotone"
                    dataKey="return"
                    stroke="#60A5FA"
                    strokeWidth={2.5}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Asset Allocation Breakdown */}
          <div className="bg-[#10182A] border border-[#26344E] rounded-2xl p-6 shadow-md space-y-4">
            <h3 className="text-lg font-bold text-[#F8FAFC]">Asset Allocation Breakdown</h3>

            <div className="overflow-x-auto rounded-xl border border-[#26344E]">
              <table className="w-full text-left text-sm text-[#E2E8F0]">
                <thead className="bg-[#121D32] text-xs uppercase text-[#9FB1CA] border-b border-[#26344E]">
                  <tr>
                    <th className="py-3 px-4">Asset</th>
                    <th className="py-3 px-4">Weight (%)</th>
                    <th className="py-3 px-4">Asset Return (%)</th>
                    <th className="py-3 px-4">Annual Volatility (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#26344E]/60 text-xs">
                  {result.asset_breakdown.map((row) => (
                    <tr key={row.asset} className="hover:bg-[#152033] transition-colors">
                      <td className="py-3 px-4 font-semibold text-[#F8FAFC]">{row.asset}</td>
                      <td className="py-3 px-4 text-[#60A5FA] font-bold">
                        {row.weight_percent.toFixed(2)}%
                      </td>
                      <td
                        className={`py-3 px-4 font-semibold ${
                          row.total_return_percent >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {formatPercent(row.total_return_percent)}
                      </td>
                      <td className="py-3 px-4 text-[#E2E8F0]">
                        {row.annualized_volatility_percent.toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
