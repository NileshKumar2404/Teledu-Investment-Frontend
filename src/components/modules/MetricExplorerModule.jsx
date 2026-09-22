import React, { useState, useEffect } from 'react';
import { Share2, ArrowRight, ArrowDownRight, Sparkles } from 'lucide-react';
import { api } from '../../api/client';

export default function MetricExplorerModule({ company }) {
  const [relationships, setRelationships] = useState([]);
  const [selectedMetric, setSelectedMetric] = useState('CAC');

  const METRIC_KEYS = [
    { key: "CAC", label: "Customer Acquisition Cost" },
    { key: "LTV", label: "Customer Lifetime Value" },
    { key: "Churn Rate", label: "Monthly Churn" },
    { key: "ARPU", label: "Average Revenue Per User" },
    { key: "Gross Margin", label: "Gross Margin %" },
  ];

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.getMetricRelationships(company.ticker).catch(() => null);
        if (res && res.relationships) {
          setRelationships(res.relationships);
        } else {
          setRelationships([
            { key: "cac-ltvcac", from: "CAC", to: "LTV:CAC Ratio", effect: "NEGATIVE", explanation: "Higher acquisition spend without equal LTV gains reduces unit-economics efficiency.", action: "Pause underperforming acquisition channels or improve onboarding conversion." },
            { key: "cac-payback", from: "CAC", to: "Payback Period", effect: "NEGATIVE", explanation: "Higher CAC extends the months needed to recoup acquisition dollars from gross margin.", action: "Target payback under 12 months before scaling spend." },
            { key: "ltv-ltvcac", from: "LTV", to: "LTV:CAC Ratio", effect: "POSITIVE", explanation: "Expanding customer lifetime value lifts unit return on every acquisition dollar spent.", action: "Implement expansion pricing or retention cohorts." },
            { key: "churn-ltv", from: "Churn Rate", to: "Estimated LTV", effect: "NEGATIVE", explanation: "Higher customer cancellation immediately caps lifetime revenue potential.", action: "Run churn exit interviews to diagnose root causes." },
          ]);
        }
      } catch(e) {
        console.warn('Relationships load error:', e);
      }
    }
    loadData();
  }, [company?.ticker]);

  const activeRels = relationships.filter(r => r.from.toLowerCase().includes(selectedMetric.toLowerCase()) || r.to.toLowerCase().includes(selectedMetric.toLowerCase()));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="glass-card">
        <span className="badge-tag badge-success" style={{ marginBottom: '0.6rem' }}>Causality Engine</span>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Metric Relationship Explorer</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
          Trace how pulling one strategic lever causes downstream ripple effects across unit economics, payback, and survival runway.
        </p>
      </div>

      {/* Metric Selector Pills */}
      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
        {METRIC_KEYS.map(m => (
          <button
            key={m.key}
            onClick={() => setSelectedMetric(m.key)}
            className={`chip ${selectedMetric === m.key ? 'active' : ''}`}
          >
            {m.key} · {m.label}
          </button>
        ))}
      </div>

      {/* Relationships Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.25rem' }}>
        {activeRels.map(rel => (
          <div key={rel.key} className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 700, fontSize: '1.05rem', color: '#fff' }}>
                <span>{rel.from}</span>
                <ArrowRight size={16} color="var(--accent)" />
                <span style={{ color: '#818CF8' }}>{rel.to}</span>
              </div>
              <span className={`badge-tag ${rel.effect === 'POSITIVE' ? 'badge-success' : 'badge-rose'}`}>
                {rel.effect}
              </span>
            </div>

            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
              {rel.explanation}
            </p>

            <div style={{
              background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)',
              padding: '0.75rem 0.9rem', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: 'var(--text-primary)'
            }}>
              <span style={{ fontWeight: 700, color: 'var(--accent)' }}>Action: </span>
              {rel.action}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
