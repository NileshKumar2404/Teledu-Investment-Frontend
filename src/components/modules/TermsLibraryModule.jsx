import React, { useState } from 'react';
import { FileText, Search, Sparkles, BookMarked, ArrowRight, X, Copy, Check } from 'lucide-react';
import { STARTUP_TERMS, TERM_CATEGORIES } from '../../data/termsData';

export default function TermsLibraryModule({ onNavigateToPrompt }) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeTerm, setActiveTerm] = useState(null);
  const [copied, setCopied] = useState(false);

  const filtered = STARTUP_TERMS.filter(t => {
    const matchesCat = selectedCategory === 'All' || t.category === selectedCategory;
    const matchesSearch = t.short.toLowerCase().includes(search.toLowerCase()) ||
      t.full.toLowerCase().includes(search.toLowerCase()) ||
      t.definition.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const copyPrompt = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Banner */}
      <div className="glass-card">
        <span className="badge-tag badge-indigo" style={{ marginBottom: '0.6rem' }}>50 Essential Terms</span>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Startup Terms & Vocabulary</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
          Real formulas, practical examples, founder insights, and AI prompt engineering presets for every startup concept.
        </p>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {TERM_CATEGORIES.map(cat => (
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
            placeholder="Filter terms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              background: 'transparent', border: 'none', color: '#fff', outline: 'none',
              fontSize: '0.85rem', width: '100%'
            }}
          />
        </div>
      </div>

      {/* Terms Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
        gap: '1.2rem'
      }}>
        {filtered.map(t => (
          <div
            key={t.n}
            onClick={() => setActiveTerm(t)}
            className="glass-card glass-card-hover"
            style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span className="badge-tag badge-indigo">#{t.n} · {t.short}</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t.category}</span>
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.4rem', color: '#fff' }}>
                {t.full}
              </h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {t.definition}
              </p>
            </div>

            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)'
            }}>
              <span style={{ fontSize: '0.76rem', color: 'var(--accent)', fontWeight: 600 }}>
                {t.formula ? 'Has Formula' : 'Conceptual'}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                <span>Inspect</span>
                <ArrowRight size={13} />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Detail View */}
      {activeTerm && (
        <div className="modal-overlay" onClick={() => setActiveTerm(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.2rem' }}>
              <div>
                <span className="badge-tag badge-indigo" style={{ marginBottom: '0.4rem' }}>Term #{activeTerm.n}</span>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{activeTerm.full}</h2>
              </div>
              <button onClick={() => setActiveTerm(null)} className="btn btn-ghost btn-sm">
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Formal Definition</h4>
                <p style={{ fontSize: '0.95rem', color: '#fff', lineHeight: 1.6 }}>{activeTerm.definition}</p>
              </div>

              {activeTerm.formula && (
                <div style={{
                  background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.3)',
                  padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)'
                }}>
                  <h4 style={{ fontSize: '0.78rem', color: '#818CF8', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Exact Formula</h4>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>
                    {activeTerm.formula}
                  </div>
                </div>
              )}

              {activeTerm.prompt && (
                <div style={{
                  background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)',
                  padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <h4 style={{ fontSize: '0.78rem', color: 'var(--amber)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Sparkles size={14} />
                      AI Prompt Template
                    </h4>
                    <button onClick={() => copyPrompt(activeTerm.prompt)} className="btn btn-ghost btn-sm" style={{ padding: '0.2rem 0.5rem' }}>
                      {copied ? <Check size={14} color="var(--success)" /> : <Copy size={14} />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, maxHeight: '120px', overflowY: 'auto' }}>
                    {activeTerm.prompt}
                  </p>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button onClick={() => setActiveTerm(null)} className="btn btn-secondary">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
