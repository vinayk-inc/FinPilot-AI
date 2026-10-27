export const formatCurrencyINR = (val: number | null | undefined): string => {
  if (val === null || val === undefined || isNaN(val)) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(val);
};

export const formatNumberINR = (val: number | null | undefined): string => {
  if (val === null || val === undefined || isNaN(val)) return '0.00';
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(val);
};

export const formatPercent = (val: number | null | undefined): string => {
  if (val === null || val === undefined || isNaN(val)) return '0.00%';
  const prefix = val > 0 ? '+' : '';
  return `${prefix}${val.toFixed(2)}%`;
};

export const generateSampleCsv = (): string => {
  return `Date,RELIANCE,TCS,INFY,HDFCBANK
2026-01-01,2450.00,3850.00,1650.00,1580.00
2026-01-02,2465.50,3870.00,1665.20,1592.50
2026-01-03,2440.00,3860.00,1648.00,1575.00
2026-01-06,2480.00,3910.00,1680.00,1605.00
2026-01-07,2495.20,3935.50,1695.00,1618.00
2026-01-08,2510.00,3920.00,1702.50,1622.00
2026-01-09,2490.50,3895.00,1688.00,1610.50
2026-01-10,2525.00,3940.00,1715.00,1630.00
2026-01-13,2540.00,3975.00,1730.00,1645.00
2026-01-14,2530.00,3960.00,1722.00,1638.00
`;
};
