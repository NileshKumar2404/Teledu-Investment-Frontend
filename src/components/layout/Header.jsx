import React from 'react';
import { motion } from 'framer-motion';
import { 
  Search, Menu, Building2, ShieldCheck, Zap, Briefcase, 
  Sparkles, TrendingUp, Activity, DollarSign 
} from 'lucide-react';
import { SAMPLE_COMPANIES } from '../../data/mockCompany';

export default function Header({ 
  selectedCompany, 
  setSelectedCompany, 
  engineMode = 'founder',
  setEngineMode, 
  onOpenSearch, 
  onOpenMobileSidebar,
  apiConnected 
}) {
  const isInvestor = engineMode === 'investor';

  return (
    <header style={{
      height: '72px',
      background: 'rgba(8, 12, 24, 0.82)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2.2rem',
      position: 'sticky',
      top: 0,
      zIndex: 40
    }}>
      {/* Left Area: Mobile toggle, Workspace Selector, Mode Beacon */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button 
          onClick={onOpenMobileSidebar}
          className="btn btn-ghost btn-sm"
          style={{ display: 'flex', alignItems: 'center', padding: '0.4rem', color: 'var(--text-secondary)' }}
        >
          <Menu size={20} />
        </button>

        {/* Company Workspace Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.55rem',
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-pill)',
          padding: '0.38rem 0.95rem',
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.06)'
        }}>
          <Building2 size={15} color={isInvestor ? '#34D399' : 'var(--accent)'} />
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Workspace:</span>
          <select 
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              fontWeight: 800,
              fontSize: '0.82rem',
              cursor: 'pointer',
              outline: 'none',
              fontFamily: 'var(--font-sans)'
            }}
          >
            {SAMPLE_COMPANIES.map(c => (
              <option key={c.ticker} value={c.ticker} style={{ background: '#0B0F19', color: '#fff' }}>
                {c.name} ({c.ticker})
              </option>
            ))}
          </select>
        </div>

        {/* Engine Mode Toggle Capsule */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setEngineMode && setEngineMode(isInvestor ? 'founder' : 'investor')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            fontSize: '0.74rem',
            fontWeight: 800,
            cursor: 'pointer',
            padding: '0.35rem 0.85rem',
            borderRadius: 'var(--radius-pill)',
            background: isInvestor ? 'rgba(16, 185, 129, 0.16)' : 'rgba(99, 102, 241, 0.16)',
            border: isInvestor ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(99, 102, 241, 0.4)',
            color: isInvestor ? '#34D399' : '#A5B4FC',
            boxShadow: isInvestor ? '0 0 16px -2px rgba(16, 185, 129, 0.3)' : '0 0 16px -2px rgba(99, 102, 241, 0.3)',
            transition: 'all 0.25s ease'
          }}
          title="Click to toggle between Founder OS and Investor OS"
        >
          {isInvestor ? <Briefcase size={13} /> : <Sparkles size={13} />}
          <span>{isInvestor ? 'Mode: Investor OS' : 'Mode: Founder OS'}</span>
          <span className={isInvestor ? 'beacon-dot' : 'beacon-dot-indigo'} style={{ marginLeft: '2px' }} />
        </motion.div>
      </div>

      {/* Center: Live Financial & Valuation Ticker */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1.4rem',
        background: 'rgba(255, 255, 255, 0.025)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: 'var(--radius-pill)',
        padding: '0.35rem 1.2rem',
        fontSize: '0.74rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ color: 'var(--text-muted)' }}>DCF Valuation:</span>
          <span style={{ fontWeight: 800, color: '#10B981' }} className="numeral-mono">$5.85M</span>
        </div>
        <div style={{ width: 1, height: 12, background: 'var(--border-subtle)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ color: 'var(--text-muted)' }}>Fair Price Upside:</span>
          <span style={{ fontWeight: 800, color: '#34D399' }} className="numeral-mono">+17.0%</span>
        </div>
        <div style={{ width: 1, height: 12, background: 'var(--border-subtle)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ color: 'var(--text-muted)' }}>Signal:</span>
          <span style={{
            fontWeight: 800,
            padding: '0.1rem 0.45rem',
            borderRadius: '4px',
            background: 'rgba(16, 185, 129, 0.2)',
            color: '#34D399'
          }}>
            BUY
          </span>
        </div>
        <div style={{ width: 1, height: 12, background: 'var(--border-subtle)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ color: 'var(--text-muted)' }}>Health Score:</span>
          <span style={{ fontWeight: 800, color: '#FBBF24' }} className="numeral-mono">84.5/100</span>
        </div>
      </div>

      {/* Right Tools: Search Palette & Connectivity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
        {/* API Status Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          fontSize: '0.72rem',
          fontWeight: 700,
          color: apiConnected ? '#34D399' : '#FBBF24',
          background: apiConnected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
          padding: '0.25rem 0.65rem',
          borderRadius: 'var(--radius-pill)',
          border: `1px solid ${apiConnected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
        }}>
          <span style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: apiConnected ? 'var(--success)' : 'var(--amber)',
            boxShadow: `0 0 8px ${apiConnected ? 'var(--success)' : 'var(--amber)'}`
          }} />
          {apiConnected ? 'System Live' : 'Demo Mode'}
        </div>

        {/* Search Command Palette Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onOpenSearch}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '0.48rem 0.95rem',
            color: 'var(--text-secondary)',
            fontSize: '0.82rem',
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = isInvestor ? 'rgba(16, 185, 129, 0.5)' : 'rgba(99, 102, 241, 0.5)'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
        >
          <Search size={15} color={isInvestor ? '#34D399' : '#818CF8'} />
          <span>Quick Search...</span>
          <kbd style={{
            background: 'rgba(255, 255, 255, 0.08)',
            padding: '0.15rem 0.45rem',
            borderRadius: '4px',
            fontSize: '0.7rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-primary)'
          }}>Ctrl K</kbd>
        </motion.button>
      </div>
    </header>
  );
}
