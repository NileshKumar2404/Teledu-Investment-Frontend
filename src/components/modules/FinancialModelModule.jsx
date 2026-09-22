import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Calendar, AlertCircle, RefreshCw } from 'lucide-react';
import { api } from '../../api/client';

export default function FinancialModelModule({ company }) {
  const [params, setParams] = useState({
    startingCash: company.cashAvailable || 150000,
    startingMrr: company.mrr || 25000,
    monthlyGrowthRate: 12,
    grossMargin: company.grossMargin || 70,
    monthlyFixedCosts: company.monthlyBurn || 18000,
    cac: company.cac || 120,
    monthlyChurnRate: company.churnRate || 3
  });

  const [forecast, setForecast] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function compute() {
      setLoading(true);
      try {
        const res = await api.calculateFinancialModel(company.ticker, params).catch(() => null);
        if (res && res.forecast) {
          setForecast(res.forecast);
          setSummary(res.summary);
        } else {
          // Local fallback computation
          const rows = [];
          let rev = params.startingMrr;
          let cash = params.startingCash;
          for (let m = 1; m <= 12; m++) {
            rev = m === 1 ? rev : rev * (1 + params.monthlyGrowthRate / 100);
            const gp = rev * (params.grossMargin / 100);
            const opex = params.monthlyFixedCosts;
            const net = gp - opex;
            cash += net;
            rows.push({ month: m, revenue: Math.round(rev), grossProfit: Math.round(gp), operatingExpenses: Math.round(opex), netProfit: Math.round(net), endingCash: Math.round(cash) });
          }
          setForecast(rows);
          const be = rows.find(r => r.netProfit >= 0);
          setSummary({
            annualRevenue: rows.reduce((s, r) => s + r.revenue, 0),
            endingCash: rows[rows.length - 1].endingCash,
            breakEvenMonth: be ? be.month : null,
            runwayMonths: rows.length
          });
        }
      } finally {
        setLoading(false);
      }
    }
    compute();
  }, [company?.ticker, params]);

  // SVG Line Chart coordinates
  const maxVal = Math.max(...forecast.map(r => Math.max(r.revenue, r.endingCash, 10000)));
  const minVal = Math.min(0, ...forecast.map(r => r.endingCash));
  const range = maxVal - minVal || 1;
  const chartW = 750;
  const chartH = 180;

  const pointsRev = forecast.map((r, i) => {
    const x = 30 + (i / 11) * (chartW - 60);
    const y = chartH - 25 - ((r.revenue - minVal) / range) * (chartH - 50);
    return `${x},${y}`;
  }).join(' ');

  const pointsCash = forecast.map((r, i) => {
    const x = 30 + (i / 11) * (chartW - 60);
    const y = chartH - 25 - ((r.endingCash - minVal) / range) * (chartH - 50);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="glass-card">
        <span className="badge-tag badge-cyan" style={{ marginBottom: '0.6rem' }}>Financial Forecasting</span>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Startup Financial Model (12-Month Projection)</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
          Adjust operating assumptions to simulate revenue compounding, cash burn, breakeven milestone, and runway trajectory.
        </p>
      </div>

      {/* Summary KPI Cards */}
      {summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Annual Revenue (Y1)</div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#fff', marginTop: '0.2rem' }}>
              ${(summary.annualRevenue || 0).toLocaleString()}
            </div>
          </div>
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Ending Cash (M12)</div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: summary.endingCash >= 0 ? '#34D399' : '#F43F5E', marginTop: '0.2rem' }}>
              ${(summary.endingCash || 0).toLocaleString()}
            </div>
          </div>
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Breakeven Month</div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--cyan)', marginTop: '0.2rem' }}>
              {summary.breakEvenMonth ? `Month ${summary.breakEvenMonth}` : 'Post Year 1'}
            </div>
          </div>
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Runway Status</div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#FBBF24', marginTop: '0.2rem' }}>
              {summary.endingCash >= 0 ? '12+ Months' : '< 12 Months'}
            </div>
          </div>
        </div>
      )}

      {/* SVG Multi-Line Chart */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>12-Month Cash & Revenue Trajectory</h3>
          <div style={{ display: 'flex', gap: '1.2rem', fontSize: '0.78rem', fontWeight: 600 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#6366F1' }}>
              <span style={{ width: '10px', height: '3px', background: '#6366F1', borderRadius: '2px' }} />
              Revenue
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#10B981' }}>
              <span style={{ width: '10px', height: '3px', background: '#10B981', borderRadius: '2px' }} />
              Cash Balance
            </span>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <svg viewBox={`0 0 ${chartW} ${chartH}`} style={{ width: '100%', height: 'auto', minWidth: '600px' }}>
            {/* Zero line */}
            {minVal < 0 && (
              <line 
                x1="20" y1={chartH - 25 - ((0 - minVal) / range) * (chartH - 50)} 
                x2={chartW - 20} y2={chartH - 25 - ((0 - minVal) / range) * (chartH - 50)} 
                stroke="rgba(244, 63, 94, 0.3)" strokeDasharray="4"
              />
            )}
            {/* Revenue Polyline */}
            <polyline fill="none" stroke="#6366F1" strokeWidth="3" points={pointsRev} strokeLinecap="round" />
            {/* Cash Polyline */}
            <polyline fill="none" stroke="#10B981" strokeWidth="3" points={pointsCash} strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {/* Sliders / Controls */}
      <div className="glass-card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <div>
          <label className="input-label">Starting Cash Balance ($)</label>
          <input
            type="number" className="input-field"
            value={params.startingCash}
            onChange={e => setParams({ ...params, startingCash: Number(e.target.value) || 0 })}
          />
        </div>
        <div>
          <label className="input-label">Starting MRR ($)</label>
          <input
            type="number" className="input-field"
            value={params.startingMrr}
            onChange={e => setParams({ ...params, startingMrr: Number(e.target.value) || 0 })}
          />
        </div>
        <div>
          <label className="input-label">Monthly Growth Rate (%)</label>
          <input
            type="number" className="input-field"
            value={params.monthlyGrowthRate}
            onChange={e => setParams({ ...params, monthlyGrowthRate: Number(e.target.value) || 0 })}
          />
        </div>
        <div>
          <label className="input-label">Gross Margin (%)</label>
          <input
            type="number" className="input-field"
            value={params.grossMargin}
            onChange={e => setParams({ ...params, grossMargin: Number(e.target.value) || 0 })}
          />
        </div>
        <div>
          <label className="input-label">Monthly Fixed Burn ($)</label>
          <input
            type="number" className="input-field"
            value={params.monthlyFixedCosts}
            onChange={e => setParams({ ...params, monthlyFixedCosts: Number(e.target.value) || 0 })}
          />
        </div>
      </div>
    </div>
  );
}
