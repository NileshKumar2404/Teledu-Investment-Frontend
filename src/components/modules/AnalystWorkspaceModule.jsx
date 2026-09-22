import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, TrendingUp, PieChart, ShieldAlert, CheckCircle2, 
  Search, Sliders, DollarSign, ArrowUpRight, Cpu, Layers,
  FileSpreadsheet, Activity, AlertTriangle, Sparkles
} from 'lucide-react';
import { SAMPLE_COMPANIES } from '../../data/mockCompany';


export default function AnalystWorkspaceModule({ activeCompany, onSelectCompany }) {
  const [selectedTicker, setSelectedTicker] = useState(activeCompany?.ticker || 'TELEDU');
  const [activeTab, setActiveTab] = useState('screener');
  const [companyData, setCompanyData] = useState(activeCompany || SAMPLE_COMPANIES[0]);
  const [discountRate, setDiscountRate] = useState(12);
  const [terminalGrowth, setTerminalGrowth] = useState(3.5);

  useEffect(() => {
    const found = SAMPLE_COMPANIES.find(c => c.ticker === selectedTicker) || activeCompany || SAMPLE_COMPANIES[0];
    setCompanyData(found);
  }, [selectedTicker, activeCompany]);

  const runwayMonths = companyData.monthlyBurn > 0 ? ((companyData.cashAvailable || 250000) / companyData.monthlyBurn).toFixed(1) : '16.4';
  const burnMultiple = companyData.monthlyRevenue > 0 ? ((companyData.monthlyBurn || 18000) / (companyData.monthlyRevenue * 0.45)).toFixed(2) : '1.12';
  const ltvCacRatio = companyData.cac > 0 ? ((companyData.ltv || 1800) / companyData.cac).toFixed(1) : '4.2';
  const metrics = { runwayMonths, burnMultiple, ltvCacRatio, quickRatio: '3.4', magicNumber: '1.08' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header Banner */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '1.5rem',
        padding: '2rem',
        background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.6) 0%, rgba(15, 23, 42, 0.7) 100%)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid rgba(129, 140, 248, 0.25)',
        boxShadow: '0 20px 40px -15px rgba(0,0,0,0.5)',
        backdropFilter: 'blur(20px)'
      }}>
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.85rem',
            borderRadius: '9999px',
            background: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid rgba(129, 140, 248, 0.3)',
            color: '#A5B4FC',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '0.75rem'
          }}>
            <BarChart3 size={13} /> Institutional Venture Analyst Workspace
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#FFFFFF', margin: 0, letterSpacing: '-0.02em' }}>
            Venture Analytics & Diligence Workbench
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 0 0', maxWidth: '680px', fontSize: '0.95rem' }}>
            Multi-stage financial modeling, scenario sensitivity stress tests, cap table waterfalls, and quantitative investment memorandum synthesis.
          </p>
        </div>

        {/* Company Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Active Asset:</label>
          <select
            value={selectedTicker}
            onChange={(e) => setSelectedTicker(e.target.value)}
            style={{
              padding: '0.65rem 1.25rem',
              borderRadius: 'var(--radius-lg)',
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(129, 140, 248, 0.3)',
              color: '#FFFFFF',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {SAMPLE_COMPANIES.map(c => (
              <option key={c.ticker} value={c.ticker}>{c.ticker} - {c.companyName || c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Analyst Sub-Navigation */}
      <div style={{ display: 'flex', gap: '0.75rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
        {[
          { id: 'screener', label: 'Financial Ratios & Screener', icon: BarChart3 },
          { id: 'dcf', label: 'DCF & Sensitivity Modeling', icon: TrendingUp },
          { id: 'cap-table', label: 'Cap Table Dilution Simulator', icon: PieChart },
          { id: 'risk', label: 'Investment Memo & Risk Matrix', icon: ShieldAlert }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.75rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                background: isActive ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                border: isActive ? '1px solid rgba(129, 140, 248, 0.4)' : '1px solid transparent',
                color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <Icon size={16} color={isActive ? '#818CF8' : 'currentColor'} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Financial Ratios & Screener */}
      {activeTab === 'screener' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {[
            { label: 'Calculated Runway', val: `${metrics?.runwayMonths || 16.4} Months`, note: 'At current net burn rate', status: 'optimal' },
            { label: 'Burn Multiple', val: `${metrics?.burnMultiple || 1.12}x`, note: 'Net Burn / Net New ARR', status: 'optimal' },
            { label: 'LTV : CAC Ratio', val: `${metrics?.ltvCacRatio || 4.2}x`, note: 'Institutional benchmark > 3.0x', status: 'optimal' },
            { label: 'Quick Ratio', val: `${metrics?.quickRatio || 3.4}x`, note: '(ARR Growth) / (Churn + Contraction)', status: 'optimal' },
            { label: 'Magic Number', val: `${metrics?.magicNumber || 1.08}x`, note: 'Sales Efficiency Benchmark', status: 'optimal' },
            { label: 'Implied Enterprise Value', val: `$${((companyData.valuation || 15000000) / 1000000).toFixed(1)}M`, note: 'Pre-money institutional baseline', status: 'highlight' }
          ].map((card, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              style={{
                padding: '1.5rem',
                borderRadius: 'var(--radius-lg)',
                background: 'rgba(15, 23, 42, 0.65)',
                border: '1px solid rgba(255, 255, 255, 0.07)',
                backdropFilter: 'blur(16px)'
              }}
            >
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {card.label}
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: card.status === 'highlight' ? '#818CF8' : '#34D399', margin: '0.5rem 0' }}>
                {card.val}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{card.note}</div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Tab 2: DCF & Sensitivity */}
      {activeTab === 'dcf' && (
        <div style={{
          padding: '2rem',
          borderRadius: 'var(--radius-xl)',
          background: 'rgba(15, 23, 42, 0.65)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(20px)'
        }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '1rem' }}>
            Discounted Cash Flow (DCF) Sensitivity Analysis
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                Discount Rate (WACC): <strong>{discountRate}%</strong>
              </label>
              <input
                type="range"
                min="8"
                max="25"
                step="0.5"
                value={discountRate}
                onChange={(e) => setDiscountRate(Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                Terminal Growth Rate: <strong>{terminalGrowth}%</strong>
              </label>
              <input
                type="range"
                min="1.5"
                max="6"
                step="0.25"
                value={terminalGrowth}
                onChange={(e) => setTerminalGrowth(Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', background: 'rgba(30, 27, 75, 0.4)', border: '1px solid rgba(129, 140, 248, 0.2)' }}>
            <div style={{ fontSize: '0.9rem', color: '#A5B4FC', fontWeight: 600 }}>Modeled Enterprise DCF Value:</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#FFFFFF', margin: '0.4rem 0' }}>
              ${(((companyData.monthlyRevenue || 45000) * 12 * 8.5) / (1 + (discountRate - terminalGrowth) / 100)).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Assumes 5-year forecast horizon with terminal multiple convergence.
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Cap Table Simulator */}
      {activeTab === 'cap-table' && (
        <div style={{
          padding: '2rem',
          borderRadius: 'var(--radius-xl)',
          background: 'rgba(15, 23, 42, 0.65)',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '1rem' }}>
            Round-by-Round Dilution & Cap Table Waterfall
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '0.75rem' }}>Shareholder Class</th>
                <th style={{ padding: '0.75rem' }}>Current Ownership</th>
                <th style={{ padding: '0.75rem' }}>Post-Round (Series A)</th>
                <th style={{ padding: '0.75rem' }}>Voting Power</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Founding Team', pre: '62.5%', post: '50.0%', vote: 'Common A' },
                { name: 'Seed Investors / Syndicate', pre: '20.0%', post: '16.0%', vote: 'Preferred A' },
                { name: 'ESOP Pool (Reserved)', pre: '12.5%', post: '10.0%', vote: 'Non-Voting' },
                { name: 'Series A Institutional Lead', pre: '0.0%', post: '24.0%', vote: 'Preferred B' }
              ].map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '1rem 0.75rem', fontWeight: 600, color: '#FFFFFF' }}>{row.name}</td>
                  <td style={{ padding: '1rem 0.75rem', color: '#A5B4FC' }}>{row.pre}</td>
                  <td style={{ padding: '1rem 0.75rem', color: '#34D399', fontWeight: 700 }}>{row.post}</td>
                  <td style={{ padding: '1rem 0.75rem', color: 'var(--text-secondary)' }}>{row.vote}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 4: Investment Memo */}
      {activeTab === 'risk' && (
        <div style={{
          padding: '2rem',
          borderRadius: 'var(--radius-xl)',
          background: 'rgba(15, 23, 42, 0.65)',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '1rem' }}>
            Investment Memorandum & Risk Factor Matrix
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div style={{ padding: '1.25rem', borderRadius: 'var(--radius-lg)', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#34D399', fontWeight: 700, marginBottom: '0.75rem' }}>
                <CheckCircle2 size={16} /> Investment Theses & Strengths
              </div>
              <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6 }}>
                <li>Strong net revenue retention (124%) indicating institutional customer stickiness.</li>
                <li>Capital efficient customer acquisition model with payback under 8 months.</li>
                <li>Proven defensible proprietary tech stack in high-barrier vertical.</li>
              </ul>
            </div>

            <div style={{ padding: '1.25rem', borderRadius: 'var(--radius-lg)', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#F87171', fontWeight: 700, marginBottom: '0.75rem' }}>
                <AlertTriangle size={16} /> Diligence Risk Factors & Mitigations
              </div>
              <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6 }}>
                <li>Customer concentration: Top 3 enterprise clients account for 38% of current ARR.</li>
                <li>Upcoming key-hire technical dependencies require expanding engineering leadership.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
