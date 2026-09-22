import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, BookOpen, Library, Target, FlaskConical, Map, 
  CheckSquare, Calculator, Network, Activity, Wand2, 
  HelpCircle, X, Compass, ChevronRight, Briefcase, 
  TrendingUp, PieChart, FileSpreadsheet, Bookmark, FolderLock, 
  Layers, ShieldCheck, Zap
} from 'lucide-react';

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  engineMode = 'founder', 
  setEngineMode, 
  isOpen, 
  onClose 
}) {
  // Navigation Groups for Founder OS (StartupIQ)
  const founderNavGroups = [
    {
      title: 'FOUNDER OPERATING SYSTEM',
      items: [
        { id: 'overview', label: 'Overview & Cockpit', icon: Compass, badge: 'Hub' },
        { id: 'learning', label: 'Business Learning', icon: BookOpen, badge: '5 Tracks' },
        { id: 'terms', label: 'Startup Terms Library', icon: Library, badge: '50 Terms' },
      ]
    },
    {
      title: 'STRATEGY & VALIDATION',
      items: [
        { id: 'idea-analyzer', label: 'Idea Assessment', icon: Target, badge: 'AI' },
        { id: 'idea-testing', label: 'Lean Idea Testing', icon: FlaskConical, badge: '6 Stages' },
        { id: 'gtm', label: 'GTM Roadmap', icon: Map, badge: 'Planner' },
        { id: 'action-plan', label: '30-Day Action Plan', icon: CheckSquare, badge: 'Tasks' },
      ]
    },
    {
      title: 'VALUATION & METRICS',
      items: [
        { id: 'financial-model', label: 'Financial Model', icon: Calculator, badge: '5-Yr DCF' },
        { id: 'metrics', label: 'Metric Explorer', icon: Network, badge: 'Drivers' },
        { id: 'health-score', label: 'Startup Health Score', icon: Activity, badge: 'Score' },
        { id: 'prompt-builder', label: 'AI Prompt Builder', icon: Wand2, badge: 'Generator' },
        { id: 'formulas', label: 'Finance Formulas', icon: HelpCircle, badge: '13 Cards' },
      ]
    }
  ];

  // Navigation Groups for Investor OS (Actual Investment Module)
  const investorNavGroups = [
    {
      title: 'PORTFOLIO & CAPITAL ALLOCATION',
      items: [
        { id: 'investor-portfolio', label: 'Portfolio Dashboard', icon: Briefcase, badge: 'Live MOIC' },
        { id: 'deal-room', label: 'Deal Room & Discovery', icon: Compass, badge: 'DCF Signals' },
      ]
    },
    {
      title: 'CAPITALIZATION & DILIGENCE',
      items: [
        { id: 'cap-table', label: 'Cap Table & Rounds', icon: PieChart, badge: 'Equity' },
        { id: 'ledger', label: 'Financial Ledger', icon: FileSpreadsheet, badge: 'Cash Flow' },
        { id: 'watchlist', label: 'Diligence Watchlist', icon: Bookmark, badge: 'Pipeline' },
        { id: 'data-room', label: 'Virtual Data Room', icon: FolderLock, badge: 'Audited' },
      ]
    }
  ];

  const isInvestor = engineMode === 'investor';
  const currentNavGroups = isInvestor ? investorNavGroups : founderNavGroups;

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.72)',
              backdropFilter: 'blur(6px)',
              zIndex: 49
            }}
          />
        )}
      </AnimatePresence>

      <aside style={{
        width: '280px',
        height: '100vh',
        position: 'sticky',
        top: 0,
        background: 'rgba(8, 12, 24, 0.88)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 50,
        flexShrink: 0,
        overflow: 'hidden'
      }}>
        {/* Top Brand Header */}
        <div style={{
          padding: '1.4rem 1.4rem 1.1rem',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              background: isInvestor 
                ? 'linear-gradient(135deg, #10B981 0%, #06B6D4 100%)'
                : 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: isInvestor 
                ? '0 6px 18px -2px rgba(16, 185, 129, 0.45)' 
                : '0 6px 18px -2px rgba(99, 102, 241, 0.45)',
              transition: 'all 0.35s ease'
            }}>
              {isInvestor ? <Briefcase size={20} color="#fff" /> : <Sparkles size={20} color="#fff" />}
            </div>
            <div>
              <div style={{
                fontSize: '1rem',
                fontWeight: 900,
                color: 'var(--text-primary)',
                letterSpacing: '-0.03em',
                fontFamily: 'var(--font-display)',
                lineHeight: 1.1
              }}>
                {isInvestor ? 'INVESTOR OS' : 'STARTUPIQ OS'}
              </div>
              <div style={{ fontSize: '0.72rem', color: isInvestor ? '#34D399' : '#A5B4FC', fontWeight: 700, marginTop: '2px' }}>
                {isInvestor ? 'Capital & Deal Flow' : 'Founder Platform'}
              </div>
            </div>
          </div>

          {onClose && (
            <button 
              onClick={onClose} 
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Fluid Sliding Dual-Engine Switcher */}
        <div style={{ padding: '0.9rem 1rem 0.5rem' }}>
          <div style={{
            position: 'relative',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            background: 'rgba(15, 23, 42, 0.75)',
            borderRadius: 'var(--radius-md)',
            padding: '3px',
            border: '1px solid var(--border-subtle)'
          }}>
            {/* Sliding Pill Indicator */}
            <motion.div
              layoutId="engine-mode-pill"
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              style={{
                position: 'absolute',
                top: '3px',
                bottom: '3px',
                left: isInvestor ? '50%' : '3px',
                right: isInvestor ? '3px' : '50%',
                background: isInvestor
                  ? 'linear-gradient(135deg, #10B981, #059669)'
                  : 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                borderRadius: 'var(--radius-sm)',
                boxShadow: isInvestor 
                  ? '0 2px 10px rgba(16, 185, 129, 0.4)' 
                  : '0 2px 10px rgba(99, 102, 241, 0.4)',
                zIndex: 1
              }}
            />

            <button
              onClick={() => {
                setEngineMode('founder');
                if (activeTab.startsWith('investor-') || activeTab === 'deal-room' || activeTab === 'cap-table' || activeTab === 'ledger' || activeTab === 'watchlist' || activeTab === 'data-room') {
                  setActiveTab('overview');
                }
              }}
              style={{
                position: 'relative',
                zIndex: 2,
                padding: '0.5rem 0.6rem',
                border: 'none',
                background: 'transparent',
                color: !isInvestor ? '#FFFFFF' : 'var(--text-muted)',
                fontSize: '0.74rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                transition: 'color 0.2s ease'
              }}
            >
              <Sparkles size={13} /> Founder
            </button>

            <button
              onClick={() => {
                setEngineMode('investor');
                if (!activeTab.startsWith('investor-') && activeTab !== 'deal-room' && activeTab !== 'cap-table' && activeTab !== 'ledger' && activeTab !== 'watchlist' && activeTab !== 'data-room') {
                  setActiveTab('investor-portfolio');
                }
              }}
              style={{
                position: 'relative',
                zIndex: 2,
                padding: '0.5rem 0.6rem',
                border: 'none',
                background: 'transparent',
                color: isInvestor ? '#FFFFFF' : 'var(--text-muted)',
                fontSize: '0.74rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                transition: 'color 0.2s ease'
              }}
            >
              <Briefcase size={13} /> Investor
            </button>
          </div>
        </div>

        {/* Navigation Item Tree */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '0.8rem 0.9rem 1.8rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.4rem'
        }}>
          {currentNavGroups.map((group) => (
            <div key={group.title}>
              <div style={{
                fontSize: '0.67rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                padding: '0 0.8rem 0.45rem',
                letterSpacing: '0.08em'
              }}>
                {group.title}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        if (onClose) onClose();
                      }}
                      style={{
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.68rem 0.85rem',
                        borderRadius: 'var(--radius-md)',
                        background: isActive 
                          ? (isInvestor ? 'rgba(16, 185, 129, 0.14)' : 'rgba(99, 102, 241, 0.14)')
                          : 'transparent',
                        border: isActive 
                          ? (isInvestor ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(99, 102, 241, 0.35)')
                          : '1px solid transparent',
                        color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
                        width: '100%'
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                        <Icon 
                          size={18} 
                          color={isActive 
                            ? (isInvestor ? '#34D399' : '#818CF8') 
                            : '#94A3B8'
                          } 
                          style={{ flexShrink: 0 }} 
                        />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ 
                            fontSize: '0.85rem', 
                            fontWeight: isActive ? 800 : 500, 
                            whiteSpace: 'nowrap', 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis' 
                          }}>
                            {item.label}
                          </div>
                        </div>
                      </div>

                      {item.badge && (
                        <span style={{
                          fontSize: '0.65rem',
                          fontWeight: 800,
                          padding: '0.12rem 0.5rem',
                          borderRadius: 'var(--radius-pill)',
                          background: isActive 
                            ? (isInvestor ? '#10B981' : 'var(--accent)')
                            : 'rgba(255, 255, 255, 0.07)',
                          color: isActive ? '#fff' : 'var(--text-muted)',
                          boxShadow: isActive 
                            ? (isInvestor ? '0 0 10px rgba(16, 185, 129, 0.4)' : '0 0 10px rgba(99, 102, 241, 0.4)')
                            : 'none'
                        }}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Status Bar */}
        <div style={{
          padding: '1.1rem 1.4rem',
          borderTop: '1px solid var(--border-subtle)',
          fontSize: '0.74rem',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(6, 10, 20, 0.6)'
        }}>
          <span style={{ fontWeight: 600 }}>v2.6 Institutional</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#34D399', fontWeight: 700 }}>
            <span className="beacon-dot" />
            Live Verified
          </span>
        </div>
      </aside>
    </>
  );
}
