import React, { useState } from 'react';
import { User, Save, RefreshCw, DollarSign, TrendingUp, CheckCircle2 } from 'lucide-react';
import { api } from '../../api/client';

export default function MyStartupModule({ company, onUpdateCompany }) {
  const [form, setForm] = useState({ ...company });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateProfile(company.ticker, form).catch(() => null);
      if (onUpdateCompany) onUpdateCompany(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  // Derived metrics
  const arpu = form.customers > 0 ? Math.round(form.monthlyRevenue / form.customers) : 0;
  const ltvCac = form.cac > 0 ? (form.ltv / form.cac).toFixed(1) : 0;
  const grossProfit = Math.round(form.monthlyRevenue * (form.grossMargin / 100));
  const netBurn = Math.max(0, form.monthlyBurn - grossProfit);
  const runway = netBurn > 0 ? (form.cashAvailable / netBurn).toFixed(1) : 'Profitable';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="glass-card">
        <span className="badge-tag badge-indigo" style={{ marginBottom: '0.6rem' }}>Founder Cockpit</span>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>My Startup Profile</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
          The single source of truth for your company. Changes made here automatically recalibrate the Health Score, Financial Model, and 30-Day Action Plan.
        </p>
      </div>

      {/* Derived Quick KPI Badges */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1rem' }}>
        <div className="glass-card" style={{ padding: '1.1rem' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>ARPU (Per Customer)</div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', marginTop: '0.2rem' }}>${arpu}/mo</div>
        </div>
        <div className="glass-card" style={{ padding: '1.1rem' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>LTV:CAC Ratio</div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: ltvCac >= 3 ? '#34D399' : '#FBBF24', marginTop: '0.2rem' }}>{ltvCac}x</div>
        </div>
        <div className="glass-card" style={{ padding: '1.1rem' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>Net Monthly Burn</div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#F43F5E', marginTop: '0.2rem' }}>${netBurn.toLocaleString()}/mo</div>
        </div>
        <div className="glass-card" style={{ padding: '1.1rem' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>Operating Runway</div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#60A5FA', marginTop: '0.2rem' }}>{runway} {runway !== 'Profitable' ? 'mo' : ''}</div>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
          Company Details & Unit Economics
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
          <div>
            <label className="input-label">Company Name</label>
            <input type="text" className="input-field" value={form.companyName} onChange={e => setForm({ ...form, companyName: e.target.value })} required />
          </div>
          <div>
            <label className="input-label">Industry Sector</label>
            <input type="text" className="input-field" value={form.industry} onChange={e => setForm({ ...form, industry: e.target.value })} />
          </div>
          <div>
            <label className="input-label">Startup Stage</label>
            <select className="input-field" value={form.stage} onChange={e => setForm({ ...form, stage: e.target.value })}>
              <option value="Idea">Idea</option>
              <option value="Pre-revenue">Pre-revenue</option>
              <option value="Early revenue">Early revenue</option>
              <option value="Growth">Growth</option>
              <option value="Scaling">Scaling</option>
            </select>
          </div>
          <div>
            <label className="input-label">Monthly Revenue ($)</label>
            <input type="number" className="input-field" value={form.monthlyRevenue} onChange={e => setForm({ ...form, monthlyRevenue: Number(e.target.value) || 0 })} />
          </div>
          <div>
            <label className="input-label">Monthly Fixed Burn ($)</label>
            <input type="number" className="input-field" value={form.monthlyBurn} onChange={e => setForm({ ...form, monthlyBurn: Number(e.target.value) || 0 })} />
          </div>
          <div>
            <label className="input-label">Available Cash ($)</label>
            <input type="number" className="input-field" value={form.cashAvailable} onChange={e => setForm({ ...form, cashAvailable: Number(e.target.value) || 0 })} />
          </div>
          <div>
            <label className="input-label">Active Customers</label>
            <input type="number" className="input-field" value={form.customers} onChange={e => setForm({ ...form, customers: Number(e.target.value) || 0 })} />
          </div>
          <div>
            <label className="input-label">Customer Acquisition Cost ($)</label>
            <input type="number" className="input-field" value={form.cac} onChange={e => setForm({ ...form, cac: Number(e.target.value) || 0 })} />
          </div>
          <div>
            <label className="input-label">Customer Lifetime Value ($)</label>
            <input type="number" className="input-field" value={form.ltv} onChange={e => setForm({ ...form, ltv: Number(e.target.value) || 0 })} />
          </div>
          <div>
            <label className="input-label">Monthly Churn Rate (%)</label>
            <input type="number" step="0.1" className="input-field" value={form.churnRate} onChange={e => setForm({ ...form, churnRate: Number(e.target.value) || 0 })} />
          </div>
          <div>
            <label className="input-label">Gross Margin (%)</label>
            <input type="number" className="input-field" value={form.grossMargin} onChange={e => setForm({ ...form, grossMargin: Number(e.target.value) || 0 })} />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
            <span>{saved ? 'Saved Successfully!' : 'Save & Recalculate Platform'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
