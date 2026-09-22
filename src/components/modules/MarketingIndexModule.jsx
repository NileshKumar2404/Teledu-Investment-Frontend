import React, { useState } from 'react';
import { BarChart3, Search, TrendingUp, Calculator } from 'lucide-react';
import { MARKETING_TERMS, MARKETING_CATEGORIES } from '../../data/marketingData';

export default function MarketingIndexModule() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = MARKETING_TERMS.filter(m => {
    const matchesCat = selectedCategory === 'All' || m.category === selectedCategory;
    const matchesSearch = m.short.toLowerCase().includes(search.toLowerCase()) ||
      m.full.toLowerCase().includes(search.toLowerCase()) ||
      m.definition.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="glass-card">
        <span className="badge-tag badge-amber" style={{ marginBottom: '0.6rem' }}>Growth & Spend KPIs</span>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Marketing Indexes — 25 Core Metrics</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
          Essential acquisition, efficiency, and conversion metrics every founder should track with formulas and practical benchmarks.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {MARKETING_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`chip ${selectedCategory === cat ? 'active' : ''}`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)', padding: '0.5rem 0.9rem', width: '280px'
        }}>
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search marketing KPI..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', fontSize: '0.85rem', width: '100%' }}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
        {filtered.map(item => (
          <div key={item.n} className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span className="badge-tag badge-amber">{item.short}</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>{item.category}</span>
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.4rem', color: '#fff' }}>{item.full}</h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
                {item.definition}
              </p>

              {item.formula && (
                <div style={{
                  background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)',
                  padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem'
                }}>
                  <div style={{ fontSize: '0.68rem', color: '#FBBF24', textTransform: 'uppercase', fontWeight: 700 }}>Formula</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.86rem', color: '#fff', fontWeight: 600 }}>
                    {item.formula}
                  </div>
                </div>
              )}

              {item.example && (
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5, background: 'rgba(255,255,255,0.02)', padding: '0.6rem', borderRadius: '6px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Example: </span>
                  {item.example}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
