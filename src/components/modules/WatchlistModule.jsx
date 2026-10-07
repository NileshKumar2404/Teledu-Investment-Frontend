import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bookmark, ShieldCheck, Plus, Trash2, Edit3, CheckCircle2, 
  ExternalLink, ChevronRight, AlertCircle, Sparkles, Filter
} from 'lucide-react';
import { api } from '../../api/client';
import { WATCHLIST_ITEMS } from '../../data/investmentData';

export default function WatchlistModule({ onSelectCompany }) {
  const [items, setItems] = useState(WATCHLIST_ITEMS);
  const [editingId, setEditingId] = useState(null);
  const [editNote, setEditNote] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  useEffect(() => {
    async function loadWatchlist() {
      try {
        const data = await api.getMyWatchlist();
        if (data && data.length > 0) {
          setItems(data);
        }
      } catch (err) {
        console.warn('Using offline watchlist data', err);
      }
    }
    loadWatchlist();
  }, []);

  const handleStartEdit = (item) => {
    setEditingId(item._id);
    setEditNote(item.note || '');
  };

  const handleSaveNote = (id) => {
    setItems(items.map(it => it._id === id ? { ...it, note: editNote } : it));
    setEditingId(null);
  };

  const handleRemove = (id, ticker) => {
    setItems(items.filter(it => it._id !== id));
    api.removeFromWatchlist(ticker).catch(() => {});
  };

  const filteredItems = items.filter(it => {
    if (priorityFilter === 'ALL') return true;
    return it.priority === priorityFilter;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '1.5rem',
        padding: '2rem',
        borderRadius: 'var(--radius-xl)',
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(99, 102, 241, 0.12) 50%, rgba(15, 23, 42, 0.6) 100%)',
        border: '1px solid rgba(245, 158, 11, 0.3)',
        boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{ maxWidth: '640px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.85rem',
            borderRadius: 'var(--radius-pill)',
            background: 'rgba(245, 158, 11, 0.2)',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            color: '#FBBF24',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.05em',
            marginBottom: '0.8rem'
          }}>
            <Bookmark size={14} />
            DILIGENCE PIPELINE • VENTURE MONITORING
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.6rem', letterSpacing: '-0.02em' }}>
            Investor Diligence Watchlist
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '0.8rem' }}>
            Track target startups through the investment evaluation lifecycle, log due diligence findings, and monitor health score fluctuations prior to term sheet issuance.
          </p>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '0.4rem 0.8rem',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            fontSize: '0.74rem',
            color: '#CBD5E1'
          }}>
            <ShieldCheck size={13} color="#FBBF24" />
            <span>Ratings reflect algorithmic diligence scores and founder data room submissions. Non-solicitation notice.</span>
          </div>
        </div>

        {/* Priority Filter */}
        <div style={{ display: 'flex', gap: '0.4rem', background: 'rgba(255, 255, 255, 0.04)', padding: '0.3rem', borderRadius: 'var(--radius-md)' }}>
          {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((p) => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              style={{
                padding: '0.4rem 0.9rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem',
                fontWeight: 600,
                border: 'none',
                background: priorityFilter === p ? 'var(--accent)' : 'transparent',
                color: priorityFilter === p ? '#fff' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Watchlist Cards Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
        {filteredItems.length === 0 ? (
          <div style={{
            padding: '3.5rem 2rem',
            borderRadius: 'var(--radius-xl)',
            background: 'var(--surface-card)',
            border: '1px dashed var(--border-subtle)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FBBF24'
            }}>
              <Bookmark size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                {priorityFilter === 'ALL' ? 'Your Diligence Watchlist is Empty' : `No ${priorityFilter} Priority Startups Found`}
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto', lineHeight: 1.6 }}>
                {priorityFilter === 'ALL'
                  ? 'Track target startups through your investment evaluation pipeline. Add companies from the Deal Room or restore sample deals below.'
                  : `You do not have any deals flagged as ${priorityFilter} priority. Switch back to "ALL" to inspect all tracked targets.`}
              </p>
            </div>
            {priorityFilter !== 'ALL' ? (
              <button onClick={() => setPriorityFilter('ALL')} className="btn btn-secondary btn-sm" style={{ marginTop: '0.5rem' }}>
                Show All Priorities
              </button>
            ) : (
              <button 
                onClick={() => setItems(WATCHLIST_ITEMS)} 
                className="btn btn-primary btn-sm"
                style={{ marginTop: '0.5rem', gap: '6px' }}
              >
                <Sparkles size={15} />
                <span>⚡ Restore Sample Watchlist Deals</span>
              </button>
            )}
          </div>
        ) : (
          filteredItems.map((item) => {
          const comp = item.companyId;
          const isEditing = editingId === item._id;
          return (
            <div
              key={item._id}
              style={{
                padding: '1.8rem',
                borderRadius: 'var(--radius-xl)',
                background: 'var(--surface-card)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.2rem',
                transition: 'border-color 0.2s ease'
              }}
            >
              {/* Card Top */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: 'var(--radius-md)',
                    background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: '1rem'
                  }}>
                    {comp.ticker?.substring(0, 2) || 'TK'}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {comp.companyName}
                      </h3>
                      <span style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 700 }}>
                        {comp.ticker}
                      </span>
                      <span style={{
                        padding: '0.2rem 0.6rem',
                        borderRadius: 'var(--radius-pill)',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        background: item.priority === 'HIGH' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                        color: item.priority === 'HIGH' ? '#F87171' : '#FBBF24'
                      }}>
                        {item.priority} PRIORITY
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {comp.sector} • Target Round: <strong>{item.targetRound}</strong>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <span style={{
                    padding: '0.3rem 0.8rem',
                    borderRadius: 'var(--radius-pill)',
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: '#34D399',
                    fontSize: '0.75rem',
                    fontWeight: 700
                  }}>
                    {comp.recommendation || 'HIGH CONVICTION'}
                  </span>

                  <button
                    onClick={() => {
                      if (onSelectCompany) onSelectCompany(comp.ticker);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '0.5rem 0.9rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-primary)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Deal Room <ExternalLink size={14} />
                  </button>

                  <button
                    onClick={() => handleRemove(item._id, comp.ticker)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: '6px'
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Diligence Notes Section */}
              <div style={{
                padding: '1.2rem',
                borderRadius: 'var(--radius-lg)',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.05)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Due Diligence Notes & Findings
                  </span>
                  {!isEditing ? (
                    <button
                      onClick={() => handleStartEdit(item)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--accent)',
                        fontSize: '0.75rem',
                        cursor: 'pointer'
                      }}
                    >
                      <Edit3 size={12} /> Edit Note
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSaveNote(item._id)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: 'var(--accent)',
                        color: '#fff',
                        border: 'none',
                        padding: '0.2rem 0.6rem',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.75rem',
                        cursor: 'pointer'
                      }}
                    >
                      <CheckCircle2 size={12} /> Save
                    </button>
                  )}
                </div>

                {!isEditing ? (
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                    {item.note || 'No diligence notes recorded yet.'}
                  </p>
                ) : (
                  <textarea
                    rows={3}
                    value={editNote}
                    onChange={(e) => setEditNote(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.7rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-primary)',
                      fontSize: '0.85rem',
                      resize: 'vertical'
                    }}
                  />
                )}
              </div>
            </div>
          );
        }))}
      </div>
    </div>
  );
}
