import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, TrendingUp, DollarSign, PieChart, ArrowUpRight, 
  Layers, Plus, CheckCircle2, AlertCircle, Clock, ShieldCheck, 
  ExternalLink, Filter, ChevronRight, X
} from 'lucide-react';
import { api } from '../../api/client';
import { PORTFOLIO_SUMMARY, INVESTMENTS_LIST } from '../../data/investmentData';

export default function InvestorPortfolioModule({ onSelectCompany, onAddCompany }) {
  const [portfolio, setPortfolio] = useState(PORTFOLIO_SUMMARY);
  const [investments, setInvestments] = useState(INVESTMENTS_LIST);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDeal, setNewDeal] = useState({
    ticker: 'TELEDU',
    companyName: 'Teledu Learning',
    round: 'Seed',
    amount: 100000,
    equity: 5.0,
    currentValue: 150000,
    status: 'Active'
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [portData, invData] = await Promise.all([
          api.getMyPortfolio(),
          api.getMyInvestments()
        ]);
        if (portData) setPortfolio(portData);
        if (invData && invData.length > 0) setInvestments(invData);
      } catch (err) {
        console.warn('Using offline portfolio data', err);
      }
    }
    loadData();
  }, []);

  const filteredInvestments = investments.filter(inv => {
    if (filterStatus === 'ALL') return true;
    return inv.status.toUpperCase() === filterStatus;
  });

  const handleCreateDeal = (e) => {
    e.preventDefault();
    const amount = Number(newDeal.amount) || 50000;
    const curVal = Number(newDeal.currentValue) || amount;
    const roi = Number((((curVal - amount) / amount) * 100).toFixed(2));
    const cleanTicker = (newDeal.ticker || 'DEAL').trim().toUpperCase();
    const cleanName = (newDeal.companyName || cleanTicker).trim();

    const dealObj = {
      _id: `inv-${Date.now()}`,
      companyId: {
        _id: `comp-${Date.now()}`,
        companyName: cleanName,
        ticker: cleanTicker,
        sector: 'Technology & Growth',
        logoUrl: ''
      },
      round: newDeal.round,
      amount,
      equity: Number(newDeal.equity) || 5,
      investmentDate: new Date().toISOString().split('T')[0],
      currentValue: curVal,
      roi,
      status: newDeal.status
    };

    setInvestments([dealObj, ...investments]);
    setPortfolio(prev => ({
      ...prev,
      totalInvested: prev.totalInvested + amount,
      currentPortfolioValue: prev.currentPortfolioValue + curVal,
      investmentCount: prev.investmentCount + 1,
      activeInvestments: prev.activeInvestments + (newDeal.status === 'Active' ? 1 : 0)
    }));

    if (onAddCompany) {
      onAddCompany({
        ticker: cleanTicker,
        name: cleanName,
        companyName: cleanName,
        stage: newDeal.round || 'Seed',
        industry: 'Technology & Growth',
        monthlyRevenue: 30000,
        mrr: 30000,
        monthlyBurn: 18000,
        cashAvailable: curVal || amount
      });
    }

    setShowAddModal(false);
  };

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
        borderRadius: 'var(--radius-xl)',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.1) 50%, rgba(15, 23, 42, 0.6) 100%)',
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
            <ShieldCheck size={14} />
            ACCREDITED INVESTOR OS • ACTIVE ASSET ALLOCATION
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.6rem', letterSpacing: '-0.02em' }}>
            Angel & Syndicate Portfolio
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
            Track capital deployment, unrealized multiples, cap table ownership stakes, and liquidity events across your active startup deals.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.8rem 1.4rem',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
              color: '#fff',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
              transition: 'all 0.2s ease'
            }}
          >
            <Plus size={18} />
            Deploy Capital / Add Deal
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.2rem'
      }}>
        {/* Total Invested */}
        <div style={{
          padding: '1.5rem',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--surface-card)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Total Invested</span>
            <DollarSign size={18} color="#818CF8" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            ${(portfolio.totalInvested || 0).toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Across {portfolio.investmentCount || investments.length} portfolio companies
          </div>
        </div>

        {/* Current Portfolio Value */}
        <div style={{
          padding: '1.5rem',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--surface-card)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Current Value</span>
            <TrendingUp size={18} color="#10B981" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#10B981' }}>
            ${(portfolio.currentPortfolioValue || 0).toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#34D399', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ArrowUpRight size={14} />
            +${((portfolio.currentPortfolioValue || 0) - (portfolio.totalInvested || 0)).toLocaleString()} Unrealized Gain
          </div>
        </div>

        {/* Aggregate Net ROI */}
        <div style={{
          padding: '1.5rem',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--surface-card)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Aggregate ROI</span>
            <PieChart size={18} color="#F59E0B" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#FBBF24' }}>
            +{portfolio.totalROI || 127.2}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Multiple: {((portfolio.currentPortfolioValue || 1) / (portfolio.totalInvested || 1)).toFixed(2)}x invested capital
          </div>
        </div>

        {/* Deal Status Distribution */}
        <div style={{
          padding: '1.5rem',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--surface-card)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Deal Status</span>
            <Briefcase size={18} color="#C084FC" />
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'baseline', marginTop: '0.2rem' }}>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10B981' }}>{portfolio.activeInvestments || 6}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Active</div>
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#60A5FA' }}>{portfolio.exitedInvestments || 2}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Exited</div>
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#F59E0B' }}>{portfolio.pendingInvestments || 1}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Pending</div>
            </div>
          </div>
        </div>
      </div>

      {/* Sector Allocation Breakdown */}
      <div style={{
        padding: '1.8rem',
        borderRadius: 'var(--radius-xl)',
        background: 'var(--surface-card)',
        border: '1px solid var(--border-subtle)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Sector Capital Allocation</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Portfolio diversification across emerging venture sectors</p>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 600 }}>8 Portfolio Companies</span>
        </div>

        {/* Progress Bar visual */}
        <div style={{
          height: '12px',
          borderRadius: 'var(--radius-pill)',
          background: 'rgba(255, 255, 255, 0.06)',
          display: 'flex',
          overflow: 'hidden',
          marginBottom: '1rem'
        }}>
          <div style={{ width: '32%', background: '#6366F1' }} title="EdTech & Learning (32%)" />
          <div style={{ width: '28%', background: '#10B981' }} title="AI & Enterprise Cloud (28%)" />
          <div style={{ width: '18%', background: '#F59E0B' }} title="HealthTech & Diagnostics (18%)" />
          <div style={{ width: '14%', background: '#EC4899' }} title="FinTech & Cross-Border (14%)" />
          <div style={{ width: '8%', background: '#06B6D4' }} title="CleanTech & Energy (8%)" />
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.2rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#6366F1' }} />
            EdTech (32%)
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10B981' }} />
            Enterprise AI (28%)
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#F59E0B' }} />
            HealthTech (18%)
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#EC4899' }} />
            FinTech (14%)
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#06B6D4' }} />
            CleanTech (8%)
          </span>
        </div>
      </div>

      {/* Portfolio Holdings Table */}
      <div style={{
        padding: '1.8rem',
        borderRadius: 'var(--radius-xl)',
        background: 'var(--surface-card)',
        border: '1px solid var(--border-subtle)'
      }}>
        {/* Table Filter Bar */}
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
              Portfolio Holdings & Stakes
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Real-time fair value and cap table ownership tracked against active valuation models
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255, 255, 255, 0.04)', padding: '0.3rem', borderRadius: 'var(--radius-md)' }}>
            {['ALL', 'ACTIVE', 'EXITED'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                style={{
                  padding: '0.4rem 0.9rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  border: 'none',
                  background: filterStatus === status ? 'var(--accent)' : 'transparent',
                  color: filterStatus === status ? '#fff' : 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Table Content */}
        <div className="table-responsive">
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '0.9rem 1rem' }}>Company & Ticker</th>
                <th style={{ padding: '0.9rem 1rem' }}>Round</th>
                <th style={{ padding: '0.9rem 1rem' }}>Date</th>
                <th style={{ padding: '0.9rem 1rem' }}>Invested Capital</th>
                <th style={{ padding: '0.9rem 1rem' }}>Current Value</th>
                <th style={{ padding: '0.9rem 1rem' }}>Equity Stake</th>
                <th style={{ padding: '0.9rem 1rem' }}>ROI Multiple</th>
                <th style={{ padding: '0.9rem 1rem' }}>Status</th>
                <th style={{ padding: '0.9rem 1rem' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvestments.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '3.5rem 1rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.85rem' }}>
                      <div style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: '50%',
                        background: 'rgba(99, 102, 241, 0.12)',
                        border: '1px solid rgba(99, 102, 241, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#818CF8'
                      }}>
                        <Briefcase size={22} />
                      </div>
                      <div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
                          No Portfolio Investments Found
                        </div>
                        <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', maxWidth: '440px', margin: 0, lineHeight: 1.5 }}>
                          {filterStatus === 'ALL'
                            ? 'You have not recorded any active investments yet. Deploy capital or add your first deal to track fair value, ownership, and returns.'
                            : `No investments currently found in "${filterStatus}" status. Switch back to "ALL" to inspect all holdings.`}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                        <button
                          onClick={() => setShowAddModal(true)}
                          className="btn btn-primary btn-sm"
                          style={{ gap: '6px' }}
                        >
                          <Plus size={14} /> Deploy Capital / Add Deal
                        </button>
                        <button
                          onClick={() => setInvestments(INVESTMENTS_LIST)}
                          className="btn btn-secondary btn-sm"
                          style={{ gap: '6px' }}
                        >
                          <Sparkles size={14} /> ⚡ Load Demo Portfolio
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredInvestments.map((deal) => {
                const isPositive = (deal.roi || 0) >= 0;
                return (
                  <tr
                    key={deal._id}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* Company */}
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                        {deal.companyId?.companyName || 'Target Startup'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600 }}>
                        {deal.companyId?.ticker || 'TKR'} • {deal.companyId?.sector || 'Growth'}
                      </div>
                    </td>

                    {/* Round */}
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.25rem 0.6rem',
                        borderRadius: 'var(--radius-pill)',
                        background: 'rgba(99, 102, 241, 0.15)',
                        color: '#A5B4FC',
                        fontSize: '0.75rem',
                        fontWeight: 600
                      }}>
                        {deal.round || 'Seed'}
                      </span>
                    </td>

                    {/* Date */}
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                      {deal.investmentDate ? new Date(deal.investmentDate).toLocaleDateString() : '2024-01-15'}
                    </td>

                    {/* Invested Capital */}
                    <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      ${Number(deal.amount || 0).toLocaleString()}
                    </td>

                    {/* Current Value */}
                    <td style={{ padding: '1rem', fontWeight: 700, color: '#10B981' }}>
                      ${Number(deal.currentValue || 0).toLocaleString()}
                    </td>

                    {/* Equity Stake */}
                    <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {deal.equity || 0}%
                    </td>

                    {/* ROI Multiple */}
                    <td style={{ padding: '1rem' }}>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: isPositive ? '#34D399' : '#F87171',
                        fontWeight: 700
                      }}>
                        <ArrowUpRight size={14} />
                        +{deal.roi || 0}%
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: '4px' }}>
                          ({((deal.currentValue || 1) / (deal.amount || 1)).toFixed(2)}x)
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '0.25rem 0.65rem',
                        borderRadius: 'var(--radius-pill)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: deal.status === 'Active' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                        color: deal.status === 'Active' ? '#34D399' : '#60A5FA'
                      }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: deal.status === 'Active' ? '#10B981' : '#3B82F6' }} />
                        {deal.status}
                      </span>
                    </td>

                    {/* Action */}
                    <td style={{ padding: '1rem' }}>
                      <button
                        onClick={() => {
                          if (onSelectCompany && deal.companyId?.ticker) {
                            onSelectCompany(deal.companyId.ticker);
                          }
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '0.35rem 0.75rem',
                          borderRadius: 'var(--radius-sm)',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid var(--border-subtle)',
                          color: 'var(--text-secondary)',
                          fontSize: '0.75rem',
                          cursor: 'pointer'
                        }}
                      >
                        Cap Table <ExternalLink size={12} />
                      </button>
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Deploy Capital / Record Investment */}
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
                maxWidth: '560px',
                maxHeight: '90vh',
                overflowY: 'auto',
                WebkitOverflowScrolling: 'touch',
                padding: '2rem',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    Deploy Capital / Record Investment
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Records deal parameters into the company cap table and ledger.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateDeal} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div className="cockpit-modal-form-grid">
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 600 }}>
                      Company Ticker
                    </label>
                    <input
                      type="text"
                      value={newDeal.ticker}
                      onChange={(e) => setNewDeal({ ...newDeal, ticker: e.target.value.toUpperCase() })}
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

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 600 }}>
                      Funding Round Tier
                    </label>
                    <select
                      value={newDeal.round}
                      onChange={(e) => setNewDeal({ ...newDeal, round: e.target.value })}
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
                      <option value="Pre-Seed">Pre-Seed</option>
                      <option value="Seed">Seed Round</option>
                      <option value="Series A">Series A</option>
                      <option value="SAFE">SAFE Note</option>
                      <option value="Bridge">Bridge Round</option>
                    </select>
                  </div>
                </div>

                <div className="cockpit-modal-form-grid">
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 600 }}>
                      Amount Invested ($)
                    </label>
                    <input
                      type="number"
                      value={newDeal.amount}
                      onChange={(e) => setNewDeal({ ...newDeal, amount: e.target.value })}
                      required
                      min="1000"
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

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 600 }}>
                      Equity Stake (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={newDeal.equity}
                      onChange={(e) => setNewDeal({ ...newDeal, equity: e.target.value })}
                      required
                      min="0.1"
                      max="100"
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

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 600 }}>
                    Estimated Fair Valuation ($)
                  </label>
                  <input
                    type="number"
                    value={newDeal.currentValue}
                    onChange={(e) => setNewDeal({ ...newDeal, currentValue: e.target.value })}
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
                      background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                      border: 'none',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    Confirm & Record Deal
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
