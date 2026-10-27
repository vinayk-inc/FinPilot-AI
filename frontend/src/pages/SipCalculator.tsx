import React, { useState, useEffect } from 'react';
import {
  Calculator,
  TrendingUp,
  Coins,
  Calendar,
  Sparkles,
  BarChart2,
  PieChart as PieIcon
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
  CartesianGrid,
  Legend
} from 'recharts';
import { calculateSip } from '../services/api';
import { SipResult } from '../types';
import { MetricCard } from '../components/MetricCard';
import { formatCurrencyINR, formatNumberINR } from '../utils/formatters';

export const SipCalculator: React.FC = () => {
  const [investmentType, setInvestmentType] = useState<'Monthly SIP' | 'Lump Sum'>('Monthly SIP');
  const [amount, setAmount] = useState<number>(10000);
  const [annualReturn, setAnnualReturn] = useState<number>(12);
  const [years, setYears] = useState<number>(10);

  const [loading, setLoading] = useState<boolean>(false);
  const [sipData, setSipData] = useState<SipResult | null>(null);

  const fetchCalculation = async (
    type = investmentType,
    amt = amount,
    ret = annualReturn,
    yr = years
  ) => {
    try {
      setLoading(true);
      const res = await calculateSip(type, amt, ret, yr);
      setSipData(res);
    } catch (err) {
      console.error('Failed to compute SIP projection:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalculation(investmentType, amount, annualReturn, years);
  }, [investmentType, amount, annualReturn, years]);

  const handleTypeChange = (newType: 'Monthly SIP' | 'Lump Sum') => {
    setInvestmentType(newType);
    if (newType === 'Lump Sum' && amount === 10000) {
      setAmount(100000);
    } else if (newType === 'Monthly SIP' && amount === 100000) {
      setAmount(10000);
    }
  };

  // Breakdown bar data
  const breakdownData = sipData
    ? [
        {
          name: 'Breakdown',
          Invested: sipData.invested,
          Gain: Math.max(0, sipData.gains),
        },
      ]
    : [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header and Controls */}
      <div className="bg-[#10182A] border border-[#26344E] rounded-2xl p-6 shadow-md space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-[#F8FAFC]">SIP & Investment Calculator</h2>
          <p className="text-sm text-[#94A3B8] mt-1">
            Simulate long-term wealth compounding via recurring systematic investment plans (SIP) or lump-sum allocations.
          </p>
        </div>

        {/* Investment Type Selector */}
        <div className="flex rounded-xl bg-[#121D32] p-1 border border-[#26344E] w-fit">
          <button
            onClick={() => handleTypeChange('Monthly SIP')}
            className={`px-5 py-2 text-xs font-bold rounded-lg transition-all ${
              investmentType === 'Monthly SIP'
                ? 'bg-[#3B82F6] text-white shadow-sm'
                : 'text-[#94A3B8] hover:text-[#F8FAFC]'
            }`}
          >
            Monthly SIP
          </button>
          <button
            onClick={() => handleTypeChange('Lump Sum')}
            className={`px-5 py-2 text-xs font-bold rounded-lg transition-all ${
              investmentType === 'Lump Sum'
                ? 'bg-[#3B82F6] text-white shadow-sm'
                : 'text-[#94A3B8] hover:text-[#F8FAFC]'
            }`}
          >
            Lump Sum
          </button>
        </div>

        {/* Sliders and Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Amount */}
          <div className="space-y-2 bg-[#121D32] p-4 rounded-xl border border-[#26344E]">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold uppercase tracking-wider text-[#9FB1CA]">
                {investmentType === 'Monthly SIP' ? 'Monthly Investment' : 'Initial Investment'}
              </span>
              <span className="font-mono text-sm font-bold text-[#60A5FA]">
                ₹{formatNumberINR(amount)}
              </span>
            </div>
            <input
              type="range"
              min={investmentType === 'Monthly SIP' ? 500 : 5000}
              max={investmentType === 'Monthly SIP' ? 200000 : 5000000}
              step={investmentType === 'Monthly SIP' ? 500 : 5000}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full accent-[#3B82F6] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#64748B]">
              <span>{investmentType === 'Monthly SIP' ? '₹500' : '₹5,000'}</span>
              <span>{investmentType === 'Monthly SIP' ? '₹2,00,000' : '₹50,00,000'}</span>
            </div>
          </div>

          {/* Annual Return */}
          <div className="space-y-2 bg-[#121D32] p-4 rounded-xl border border-[#26344E]">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold uppercase tracking-wider text-[#9FB1CA]">
                Assumed Annual Return
              </span>
              <span className="font-mono text-sm font-bold text-[#60A5FA]">{annualReturn}%</span>
            </div>
            <input
              type="range"
              min={1}
              max={30}
              step={0.5}
              value={annualReturn}
              onChange={(e) => setAnnualReturn(Number(e.target.value))}
              className="w-full accent-[#3B82F6] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#64748B]">
              <span>1%</span>
              <span>30%</span>
            </div>
          </div>

          {/* Investment Period */}
          <div className="space-y-2 bg-[#121D32] p-4 rounded-xl border border-[#26344E]">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold uppercase tracking-wider text-[#9FB1CA]">
                Investment Duration
              </span>
              <span className="font-mono text-sm font-bold text-[#60A5FA]">{years} Years</span>
            </div>
            <input
              type="range"
              min={1}
              max={40}
              step={1}
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full accent-[#3B82F6] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#64748B]">
              <span>1 Year</span>
              <span>40 Years</span>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      {sipData && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MetricCard
            label="Total Invested Amount"
            value={formatCurrencyINR(sipData.invested)}
            subtext={`${years} years @ ${formatCurrencyINR(amount)} / ${
              investmentType === 'Monthly SIP' ? 'mo' : 'one-time'
            }`}
            icon={<Coins className="w-5 h-5 text-slate-400" />}
            loading={loading}
          />
          <MetricCard
            label="Estimated Future Value"
            value={formatCurrencyINR(sipData.future_value)}
            changeType="positive"
            subtext={`Wealth multiple: ${(sipData.future_value / sipData.invested).toFixed(2)}x`}
            icon={<Sparkles className="w-5 h-5 text-blue-400" />}
            loading={loading}
          />
          <MetricCard
            label="Estimated Gains (Wealth Created)"
            value={formatCurrencyINR(sipData.gains)}
            changeType="positive"
            change={((sipData.gains / sipData.invested) * 100).toFixed(1)}
            subtext={`${annualReturn}% CAGR growth`}
            icon={<TrendingUp className="w-5 h-5 text-emerald-400" />}
            loading={loading}
          />
        </div>
      )}

      {/* Charts Grid */}
      {sipData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Progression Area Chart */}
          <div className="lg:col-span-2 bg-[#10182A] border border-[#26344E] rounded-2xl p-6 shadow-md space-y-4">
            <h3 className="text-lg font-bold text-[#F8FAFC]">Yearly Growth Projection</h3>
            <p className="text-xs text-[#94A3B8]">
              Comparison of total capital invested versus compounding portfolio valuation.
            </p>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sipData.progression} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="valueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#60A5FA" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="investedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#64748B" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#64748B" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#26344E" vertical={false} />
                  <XAxis dataKey="year" stroke="#64748B" fontSize={11} tickFormatter={(y) => `Yr ${y}`} />
                  <YAxis
                    stroke="#64748B"
                    fontSize={11}
                    tickFormatter={(val) => `₹${(val / 100000).toFixed(1)}L`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#10182A',
                      borderColor: '#26344E',
                      borderRadius: '8px',
                      color: '#F8FAFC',
                    }}
                    formatter={(val: any, name: any) => [
                      formatCurrencyINR(Number(val)),
                      name === 'future_value' ? 'Future Value' : 'Invested Capital',
                    ]}
                    labelFormatter={(lbl) => `Year ${lbl}`}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    formatter={(value) => (
                      <span className="text-xs text-[#CBD5E1]">
                        {value === 'future_value' ? 'Estimated Future Value' : 'Invested Capital'}
                      </span>
                    )}
                  />
                  <Area
                    type="monotone"
                    dataKey="future_value"
                    name="future_value"
                    stroke="#60A5FA"
                    strokeWidth={2.5}
                    fill="url(#valueGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="invested"
                    name="invested"
                    stroke="#64748B"
                    strokeWidth={2}
                    fill="url(#investedGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Investment Breakdown Bar */}
          <div className="bg-[#10182A] border border-[#26344E] rounded-2xl p-6 shadow-md flex flex-col justify-between space-y-4">
            <div>
              <h3 className="text-lg font-bold text-[#F8FAFC]">Capital vs Gains Ratio</h3>
              <p className="text-xs text-[#94A3B8]">
                Proportion of final corpus derived from invested principal vs capital gains.
              </p>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={breakdownData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#26344E" vertical={false} />
                  <XAxis dataKey="name" hide />
                  <YAxis stroke="#64748B" fontSize={11} tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#10182A',
                      borderColor: '#26344E',
                      borderRadius: '8px',
                      color: '#F8FAFC',
                    }}
                    formatter={(val: any) => formatCurrencyINR(Number(val))}
                  />
                  <Legend
                    verticalAlign="bottom"
                    formatter={(val) => (
                      <span className="text-xs text-[#CBD5E1]">
                        {val === 'Invested' ? 'Amount Invested' : 'Estimated Gains'}
                      </span>
                    )}
                  />
                  <Bar dataKey="Invested" fill="#64748B" stackId="a" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="Gain" fill="#60A5FA" stackId="a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 pt-2 border-t border-[#26344E] text-xs">
              <div className="flex justify-between text-[#94A3B8]">
                <span>Principal Share:</span>
                <span className="font-semibold text-[#F8FAFC]">
                  {((sipData.invested / sipData.future_value) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between text-[#94A3B8]">
                <span>Gains Share:</span>
                <span className="font-semibold text-emerald-400">
                  {((sipData.gains / sipData.future_value) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Milestone Breakdown Table */}
      {sipData && sipData.progression.length > 0 && (
        <div className="bg-[#10182A] border border-[#26344E] rounded-2xl p-6 shadow-md space-y-4">
          <h3 className="text-lg font-bold text-[#F8FAFC]">Yearly Milestone Schedule</h3>

          <div className="overflow-x-auto rounded-xl border border-[#26344E]">
            <table className="w-full text-left text-sm text-[#E2E8F0]">
              <thead className="bg-[#121D32] text-xs uppercase text-[#9FB1CA] border-b border-[#26344E]">
                <tr>
                  <th className="py-3 px-4">Year</th>
                  <th className="py-3 px-4">Invested Capital</th>
                  <th className="py-3 px-4">Estimated Future Value</th>
                  <th className="py-3 px-4">Estimated Gain</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#26344E]/60 text-xs font-mono">
                {sipData.progression.map((item) => (
                  <tr key={item.year} className="hover:bg-[#152033] transition-colors">
                    <td className="py-3 px-4 font-sans font-bold text-[#F8FAFC]">Year {item.year}</td>
                    <td className="py-3 px-4 text-[#94A3B8]">{formatCurrencyINR(item.invested)}</td>
                    <td className="py-3 px-4 font-bold text-[#60A5FA]">
                      {formatCurrencyINR(item.future_value)}
                    </td>
                    <td className="py-3 px-4 text-emerald-400">+{formatCurrencyINR(item.gain)}</td>
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
