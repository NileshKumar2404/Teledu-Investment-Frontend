import React, { useState } from 'react';
import { Calculator, Search, CheckCircle2 } from 'lucide-react';
import { FINANCE_FORMULAS, FINANCE_CATEGORIES } from '../../data/financeFormulasData';

export default function FinanceFormulasModule() {
  const [selectedCat, setSelectedCat] = useState('All');
  const [search, setSearch] = useState('');
  const [inputsState, setInputsState] = useState({});

  const handleInputChange = (formulaIndex, fieldId, value) => {
    setInputsState(prev => ({
      ...prev,
      [`${formulaIndex}_${fieldId}`]: parseFloat(value) || 0
    }));
  };

  const calculateResult = (formula, formulaIndex) => {
    if (!formula.calc) return null;
    const values = {};
    formula.inputs.forEach(input => {
      values[input.id] = inputsState[`${formulaIndex}_${input.id}`] ?? (input.default || 100);
    });
    try {
      return formula.calc(values);
    } catch(e) {
      return null;
    }
  };

  const filtered = FINANCE_FORMULAS.filter(f => {
    const matchesCat = selectedCat === 'All' || f.cat === selectedCat;
    const matchesSearch = f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.formula.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="glass-card">
        <span className="badge-tag badge-cyan" style={{ marginBottom: '0.6rem' }}>Interactive Studio</span>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Finance & Accounting Formulas (30 Live Calculators)</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
          Enter your own numbers, see the results calculate instantly, and read plain-language explanations of what the ratios mean.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {FINANCE_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`chip ${selectedCat === cat ? 'active' : ''}`}
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
            placeholder="Search 30 calculators..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', fontSize: '0.85rem', width: '100%' }}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '1.5rem' }}>
        {filtered.map((formula, fIdx) => {
          const res = calculateResult(formula, fIdx);
          return (
            <div key={formula.n} className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span className="badge-tag badge-cyan">#{formula.n} · {formula.cat}</span>
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '0.35rem' }}>
                  {formula.name}
                </h3>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: '0.84rem', color: '#67E8F9',
                  background: 'rgba(6, 182, 212, 0.08)', padding: '0.5rem 0.75rem', borderRadius: '6px', marginBottom: '1rem'
                }}>
                  {formula.formula}
                </div>

                {/* Inputs */}
                <div style={{ display: 'grid', gridTemplateColumns: formula.inputs.length > 1 ? '1fr 1fr' : '1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                  {formula.inputs.map(inp => (
                    <div key={inp.id}>
                      <label className="input-label" style={{ fontSize: '0.75rem' }}>{inp.label}</label>
                      <input
                        type="number"
                        className="input-field"
                        style={{ padding: '0.45rem 0.65rem', fontSize: '0.85rem' }}
                        value={inputsState[`${fIdx}_${inp.id}`] ?? (inp.default || 100)}
                        onChange={(e) => handleInputChange(fIdx, inp.id, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Result Callout */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)', padding: '0.9rem 1rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Computed Output</span>
                  <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-mono)' }}>
                    {typeof res === 'number' ? (formula.unit === 'percent' ? `${res.toFixed(1)}%` : formula.unit === 'currency' ? `${res.toLocaleString()}` : res.toFixed(2)) : '—'}
                  </span>
                </div>
                <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {formula.meaning}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
