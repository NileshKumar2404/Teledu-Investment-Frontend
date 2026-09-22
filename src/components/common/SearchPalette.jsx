import React, { useState, useEffect } from 'react';
import { Search, X, BookOpen, FileText, ArrowRight, Zap } from 'lucide-react';
import { STARTUP_TERMS } from '../../data/termsData';

export default function SearchPalette({ isOpen, onClose, onSelectTerm, onSelectLesson }) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        // toggle handled by parent
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredTerms = query.trim() === '' ? STARTUP_TERMS.slice(0, 6) : STARTUP_TERMS.filter(t => 
    t.short.toLowerCase().includes(query.toLowerCase()) ||
    t.full.toLowerCase().includes(query.toLowerCase()) ||
    t.definition.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 8);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '600px', padding: '1rem' }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.75rem 1rem',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          <Search size={20} color="var(--accent)" />
          <input
            autoFocus
            type="text"
            placeholder="Search startup terms, formulas, calculators..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: '#fff',
              fontSize: '1rem',
              outline: 'none',
              fontFamily: 'var(--font-sans)'
            }}
          />
          <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ padding: '0.2rem' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '0.75rem 0.5rem', maxHeight: '380px', overflowY: 'auto' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '0.4rem 0.8rem' }}>
            Startup Terms ({filteredTerms.length})
          </div>

          {filteredTerms.map(t => (
            <div
              key={t.n}
              onClick={() => {
                if (onSelectTerm) onSelectTerm(t);
                onClose();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.7rem 0.8rem',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span className="badge-tag badge-indigo">{t.short}</span>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#fff' }}>{t.full}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', maxWidth: '400px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {t.definition}
                  </div>
                </div>
              </div>
              <ArrowRight size={14} color="var(--text-muted)" />
            </div>
          ))}

          {filteredTerms.length === 0 && (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No matches found for "{query}".
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
