import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PieChart, Users, DollarSign, ShieldCheck, Plus, CheckCircle2, 
  Layers, ArrowUpRight, Award, Lock, ExternalLink, X, FileText
} from 'lucide-react';
import { api } from '../../api/client';
import { CAP_TABLE_DATA } from '../../data/investmentData';

export default function CapTableModule({ activeTicker = 'TELEDU' }) {
  const [capData, setCapData] = useState(CAP_TABLE_DATA);
  const [shareholders, setShareholders] = useState(CAP_TABLE_DATA.shareholders);
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newShareholder, setNewShareholder] = useState({
    name: '',
    role: 'Angel Investor',
    category: 'Investors',
    shares: 2500,
    investmentRound: 'Seed Round',
    votingRights: true
  });

  const categories = ['ALL', 'Founders', 'ESOP', 'Investors', 'Open Round'];

  const filteredShareholders = shareholders.filter(s => {
    if (filterCategory === 'ALL') return true;
    return s.category === filterCategory;
  });

  const handleAddShareholder = (e) => {
    e.preventDefault();
    const sharesNum = Number(newShareholder.shares) || 1000;
    const totalShares = capData.totalShares + sharesNum;
    const ownership = Number(((sharesNum / totalShares) * 100).toFixed(2));

    const shObj = {
      id: `sh-${Date.now()}`,
      name: newShareholder.name || 'New Investor',
      role: newShareholder.role,
      category: newShareholder.category,
      shares: sharesNum,
      ownership,
      investmentRound: newShareholder.investmentRound,
      votingRights: newShareholder.votingRights
    };

    setShareholders([...shareholders, shObj]);
    setCapData(prev => ({
      ...prev,
      totalShares: totalShares,
      postMoneyValuation: totalShares * prev.currentSharePrice
    }));
    setShowAddModal(false);
  };

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
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(14, 165, 233, 0.12) 50%, rgba(15, 23, 42, 0.6) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{ maxWidth: '640px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.85rem',
            borderRadius: 'var(--radius-pill)',
            background: 'rgba(99, 102, 241, 0.2)',
            border: '1px solid rgba(99, 102, 241, 0.4)',
            color: '#A5B4FC',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.05em',
            marginBottom: '0.8rem'
          }}>
            <PieChart size={14} />
            EQUITY DILUTION & CAPITAL STRUCTURE • {capData.ticker}
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.6rem', letterSpacing: '-0.02em' }}>
            Cap Table & Round Manager
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
            Interactive capitalization table showing fully diluted share distribution, voting rights, ESOP pools, and post-money valuation metrics.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.8rem 1.4rem',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, #6366F1, #3B82F6)',
            color: '#fff',
            border: 'none',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)'
          }}
        >
          <Plus size={18} />
          Issue Shares / Add Shareholder
        </button>
      </div>

      {/* Cap Table Metric Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.2rem'
      }}>
        <div style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', background: 'var(--surface-card)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Shares Outstanding</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
            {(capData.totalShares || 100000).toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Common + Preferred stock</div>
        </div>

        <div style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', background: 'var(--surface-card)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Current Share Price</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10B981', marginTop: '4px' }}>
            ${capData.currentSharePrice?.toFixed(2) || '50.00'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Based on last closed round</div>
        </div>

        <div style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', background: 'var(--surface-card)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Post-Money Valuation</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#818CF8', marginTop: '4px' }}>
            ${((capData.postMoneyValuation || 5000000) / 1000000).toFixed(2)}M
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Pre-Money: ${(((capData.preMoneyValuation || 4500000)) / 1000000).toFixed(2)}M (Net New Capital: $500k)
          </div>
        </div>

        <div style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', background: 'var(--surface-card)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Round Target Raise</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#F59E0B', marginTop: '4px' }}>
            ${(capData.fundingRequired || 500000).toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 700, marginTop: '4px' }}>
            For exactly {capData.equityOffered || 10.0}% equity stake (10,000 shares)
          </div>
        </div>
      </div>

      {/* Visual Cap Table Distribution Bar */}
      <div style={{
        padding: '1.8rem',
        borderRadius: 'var(--radius-xl)',
        background: 'var(--surface-card)',
        border: '1px solid var(--border-subtle)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Fully Diluted Equity Breakdown
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Pro-rata ownership distribution across stakeholder tiers
            </p>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 700 }}>100% Fully Diluted</span>
        </div>

        {/* Multi-segmented color bar */}
        <div style={{
          height: '16px',
          borderRadius: 'var(--radius-pill)',
          background: 'rgba(255, 255, 255, 0.06)',
          display: 'flex',
          overflow: 'hidden',
          marginBottom: '1.2rem'
        }}>
          <div style={{ width: '72%', background: '#6366F1' }} title="Founders (72%)" />
          <div style={{ width: '10.5%', background: '#F59E0B' }} title="ESOP Pool (10.5%)" />
          <div style={{ width: '12.5%', background: '#10B981' }} title="Investors & Angels (12.5%)" />
          <div style={{ width: '5%', background: '#8B5CF6' }} title="Open Round (5%)" />
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#6366F1' }} />
            <span style={{ color: 'var(--text-secondary)' }}>Founders & Executive: <strong>72.0%</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#F59E0B' }} />
            <span style={{ color: 'var(--text-secondary)' }}>Employee Stock Pool (ESOP): <strong>10.5%</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#10B981' }} />
            <span style={{ color: 'var(--text-secondary)' }}>Angel & Venture Investors: <strong>12.5%</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#8B5CF6' }} />
            <span style={{ color: 'var(--text-secondary)' }}>Active Financing Allocation: <strong>5.0%</strong></span>
          </div>
        </div>
      </div>

      {/* Shareholders Roster Table */}
      <div style={{
        padding: '1.8rem',
        borderRadius: 'var(--radius-xl)',
        background: 'var(--surface-card)',
        border: '1px solid var(--border-subtle)'
      }}>
        {/* Table Header Filter */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Shareholder Roster & Voting Rights
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Registered equity holders, share counts, and board representation
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.4rem', background: 'rgba(255, 255, 255, 0.04)', padding: '0.3rem', borderRadius: 'var(--radius-md)' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                style={{
                  padding: '0.35rem 0.8rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  border: 'none',
                  background: filterCategory === cat ? 'var(--accent)' : 'transparent',
                  color: filterCategory === cat ? '#fff' : 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="table-responsive">
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '0.9rem 1rem' }}>Stakeholder</th>
                <th style={{ padding: '0.9rem 1rem' }}>Category</th>
                <th style={{ padding: '0.9rem 1rem' }}>Round / Instrument</th>
                <th style={{ padding: '0.9rem 1rem' }}>Shares Held</th>
                <th style={{ padding: '0.9rem 1rem' }}>Ownership %</th>
                <th style={{ padding: '0.9rem 1rem' }}>Implied Value</th>
                <th style={{ padding: '0.9rem 1rem' }}>Voting Rights</th>
              </tr>
            </thead>
            <tbody>
              {filteredShareholders.map((sh) => (
                <tr
                  key={sh.id}
                  style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}
                >
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{sh.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{sh.role}</div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '0.2rem 0.6rem',
                      borderRadius: 'var(--radius-pill)',
                      background: 'rgba(255, 255, 255, 0.06)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'var(--text-secondary)'
                    }}>
                      {sh.category}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                    {sh.investmentRound}
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {(sh.shares || 0).toLocaleString()}
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 700, color: '#10B981' }}>
                    {sh.ownership}%
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    ${((sh.shares || 0) * (capData.currentSharePrice || 50)).toLocaleString()}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: sh.votingRights ? '#34D399' : 'var(--text-muted)'
                    }}>
                      {sh.votingRights ? <ShieldCheck size={14} /> : <Lock size={14} />}
                      {sh.votingRights ? 'Voting' : 'Non-Voting'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Shareholder */}
      <AnimatePresence>
        {showAddModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1.5rem'
          }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{
                background: '#131825',
                border: '1px solid rgba(99, 102, 241, 0.35)',
                borderRadius: 'var(--radius-xl)',
                width: '100%',
                maxWidth: '520px',
                maxHeight: '90vh',
                overflowY: 'auto',
                WebkitOverflowScrolling: 'touch',
                padding: '2rem',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Issue Shares / Add Shareholder
                </h3>
                <button onClick={() => setShowAddModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddShareholder} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 600 }}>
                    Stakeholder Name / Entity
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Apex Tech Ventures"
                    value={newShareholder.name}
                    onChange={(e) => setNewShareholder({ ...newShareholder, name: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '0.7rem 0.9rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-primary)',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>

                <div className="cockpit-modal-form-grid">
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 600 }}>
                      Category
                    </label>
                    <select
                      value={newShareholder.category}
                      onChange={(e) => setNewShareholder({ ...newShareholder, category: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.7rem 0.9rem',
                        borderRadius: 'var(--radius-md)',
                        background: '#1E293B',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem'
                      }}
                    >
                      <option value="Investors">Investors</option>
                      <option value="Founders">Founders</option>
                      <option value="ESOP">ESOP Pool</option>
                      <option value="Open Round">Open Round</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 600 }}>
                      Number of Shares
                    </label>
                    <input
                      type="number"
                      value={newShareholder.shares}
                      onChange={(e) => setNewShareholder({ ...newShareholder, shares: e.target.value })}
                      required
                      min="100"
                      style={{
                        width: '100%',
                        padding: '0.7rem 0.9rem',
                        borderRadius: 'var(--radius-md)',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginTop: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    style={{
                      padding: '0.7rem 1.2rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'transparent',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-secondary)',
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '0.7rem 1.4rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'linear-gradient(135deg, #6366F1, #3B82F6)',
                      border: 'none',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    Confirm Share Issuance
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
