import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Briefcase, Building2, Search, Compass, BookOpen, 
  Library, Target, FlaskConical, Map, TrendingUp, Activity, 
  PieChart, FileSpreadsheet, Bookmark, FolderLock, Zap, ChevronDown,
  User, Lock, LogOut, ShieldCheck, Crown, CreditCard, Plus, X, AlertCircle,
  BarChart3, Shield, Users, Layers, Menu, Calculator
} from 'lucide-react';
import { SAMPLE_COMPANIES } from '../../data/mockCompany';

export default function TopCommandBar({
  activeTab,
  setActiveTab,
  engineMode,
  setEngineMode,
  selectedCompany,
  setSelectedCompany,
  companies = SAMPLE_COMPANIES,
  onAddCompany,
  onOpenSearch,
  currentUser,
  onOpenAuth,
  onLogout,
  onOpenPricing,
  onOpenPortal
}) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isAddCompanyOpen, setIsAddCompanyOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const navRef = useRef(null);

  // Auto-scroll active tab into horizontal view whenever activeTab or engineMode changes
  useEffect(() => {
    if (!navRef.current) return;
    const activeBtn = navRef.current.querySelector('[data-active="true"]');
    if (activeBtn) {
      activeBtn.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest'
      });
    }
  }, [activeTab, engineMode]);

  // Lock background scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileDrawerOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isMobileDrawerOpen]);

  // Close drawer on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isMobileDrawerOpen) {
        setIsMobileDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileDrawerOpen]);

  const [newCompForm, setNewCompForm] = useState({
    companyName: '',
    ticker: '',
    industry: 'AI & Enterprise Software',
    stage: 'Seed',
    monthlyRevenue: 30000,
    monthlyBurn: 18000,
    cashAvailable: 250000
  });
  const [addCompError, setAddCompError] = useState('');

  const currentRole = engineMode || (currentUser?.onboarding?.assignedWorkspace || currentUser?.role || 'founder').toLowerCase();
  const isInvestor = engineMode === 'investor';
  const isAnalyst = engineMode === 'analyst';
  const isAdvisor = engineMode === 'advisor';
  const isAdmin = engineMode === 'admin' || engineMode === 'super_admin';

  const userPlan = currentUser?.subscription?.plan || 'free';
  const isPro = userPlan !== 'free';

  // Founder OS primary navigation tabs
  const founderTabs = [
    { id: 'overview', label: 'Cockpit', icon: Compass },
    { id: 'profile-wizard', label: 'Company Wizard', icon: Sparkles },
    { id: 'tools', label: 'Tools', icon: Calculator },
    { id: 'analyze', label: 'Analyze', icon: Activity },
    { id: 'learning', label: 'Academy', icon: BookOpen },
    { id: 'terms', label: 'Terms & Formulas', icon: Library },
    { id: 'idea-analyzer', label: 'Idea Lab', icon: Target },
    { id: 'idea-testing', label: 'Lean Testing', icon: FlaskConical },
    { id: 'financial-model', label: '5-Yr DCF', icon: TrendingUp, isPro: true },
    { id: 'action-plan', label: 'Action Plan', icon: Target, isPro: true },
    { id: 'data-room', label: 'Data Room', icon: FolderLock, isPro: true },
  ];

  // Investor OS primary navigation tabs (Section 2)
  const investorTabs = [
    { id: 'investor-portfolio', label: 'Portfolio', icon: Briefcase },
    { id: 'deal-room', label: 'Deal Room', icon: Compass },
    { id: 'cap-table', label: 'Cap Table', icon: PieChart },
    { id: 'ledger', label: 'Ledger Journal', icon: FileSpreadsheet },
    { id: 'watchlist', label: 'Watchlist', icon: Bookmark },
    { id: 'data-room', label: 'Data Room', icon: FolderLock, isPro: true },
  ];

  const analystTabs = [
    { id: 'analyst-workspace', label: 'Diligence Screener', icon: BarChart3 },
    { id: 'financial-model', label: 'DCF & Sensitivity', icon: TrendingUp },
    { id: 'cap-table', label: 'Cap Table Waterfall', icon: PieChart },
    { id: 'data-room', label: 'Diligence Data Room', icon: FolderLock },
  ];

  const advisorTabs = [
    { id: 'advisor-workspace', label: 'Advisory Cockpit', icon: Compass },
    { id: 'gtm', label: 'GTM Acceleration', icon: Map },
    { id: 'health-score', label: 'Venture Health', icon: Activity },
    { id: 'action-plan', label: 'Strategic OKRs', icon: Target },
    { id: 'learning', label: 'Knowledge Academy', icon: BookOpen },
  ];

  const adminTabs = [
    { id: 'admin-workspace', label: 'User & Role Management', icon: Users },
    { id: 'admin-audit', label: 'Audit Trail', icon: Activity },
    { id: 'admin-security', label: 'Security & Access', icon: Lock },
  ];

  // Select active navigation tabs dynamically based on active engine mode
  let currentTabs = founderTabs;
  let activeThemeColor = '#818CF8';

  if (isInvestor) {
    currentTabs = investorTabs;
    activeThemeColor = '#34D399';
  } else if (isAnalyst) {
    currentTabs = analystTabs;
    activeThemeColor = '#A5B4FC';
  } else if (isAdvisor) {
    currentTabs = advisorTabs;
    activeThemeColor = '#FBBF24';
  } else if (isAdmin) {
    currentTabs = adminTabs;
    activeThemeColor = '#C084FC';
  }

  // Role Badges
  const roleBadges = {
    founder: { title: 'Founder Workspace', icon: Sparkles, color: '#818CF8', bg: 'rgba(99, 102, 241, 0.15)', border: 'rgba(129, 140, 248, 0.4)' },
    investor: { title: 'Investor Workspace', icon: Briefcase, color: '#34D399', bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(52, 211, 153, 0.4)' },
    analyst: { title: 'Analyst Workspace', icon: BarChart3, color: '#A5B4FC', bg: 'rgba(129, 140, 248, 0.15)', border: 'rgba(129, 140, 248, 0.4)' },
    advisor: { title: 'Advisor Workspace', icon: Compass, color: '#FBBF24', bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(251, 191, 36, 0.4)' },
    admin: { title: 'Admin Control Center', icon: Shield, color: '#C084FC', bg: 'rgba(168, 85, 247, 0.15)', border: 'rgba(192, 132, 252, 0.4)' },
    super_admin: { title: 'Super Admin Platform', icon: Crown, color: '#F472B6', bg: 'rgba(236, 72, 153, 0.15)', border: 'rgba(244, 114, 182, 0.4)' },
  };

  const activeBadge = roleBadges[currentRole] || roleBadges.founder;
  const ActiveRoleIcon = activeBadge.icon;

  const handleSaveNewCompany = (e) => {
    e.preventDefault();
    if (!newCompForm.companyName.trim()) {
      setAddCompError('Company name is required');
      return;
    }
    if (!newCompForm.ticker.trim()) {
      setAddCompError('Ticker symbol is required (e.g. ACME)');
      return;
    }
    setAddCompError('');
    if (onAddCompany) {
      onAddCompany({
        ...newCompForm,
        ticker: newCompForm.ticker.trim().toUpperCase(),
        companyName: newCompForm.companyName.trim()
      });
    }
    setIsAddCompanyOpen(false);
    setNewCompForm({
      companyName: '',
      ticker: '',
      industry: 'AI & Enterprise Software',
      stage: 'Seed',
      monthlyRevenue: 30000,
      monthlyBurn: 18000,
      cashAvailable: 250000
    });
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: isMobileDrawerOpen ? 99999 : 50,
      width: '100%',
      background: 'rgba(10, 14, 23, 0.95)',
      backdropFilter: 'blur(28px)',
      WebkitBackdropFilter: 'blur(28px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
      boxShadow: '0 10px 35px -10px rgba(0, 0, 0, 0.7)'
    }}>
      {/* Top Tier: Brand, Mode/Role Badge, Workspace Selector & Controls */}
      <div className="top-bar-tier-1" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.65rem 1.5rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        {/* Left: Brand + Role Badge */}
        <div className="top-bar-brand-group" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div 
            onClick={() => {
              if (currentRole === 'founder') setActiveTab('overview');
              else if (currentRole === 'investor') setActiveTab('investor-portfolio');
              else if (currentRole === 'analyst') setActiveTab('analyst-workspace');
              else if (currentRole === 'advisor') setActiveTab('advisor-workspace');
              else if (currentRole === 'admin' || currentRole === 'super_admin') setActiveTab('admin-workspace');
            }}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.6rem', 
              cursor: 'pointer',
              userSelect: 'none'
            }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(99, 102, 241, 0.45)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <Zap size={18} color="#fff" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }} />
            </div>
            <div>
              <div style={{ 
                fontFamily: 'var(--font-mono)', 
                fontWeight: 800, 
                fontSize: '1.05rem', 
                letterSpacing: '-0.03em',
                color: 'var(--text-primary)',
                lineHeight: 1.1
              }}>
                Startup<span style={{ color: '#818CF8' }}>IQ</span>
              </div>
              <div className="top-bar-brand-subtitle" style={{ 
                fontSize: '0.62rem', 
                color: 'var(--text-muted)', 
                letterSpacing: '0.08em', 
                textTransform: 'uppercase',
                fontWeight: 700
              }}>
                Venture Intelligence OS
              </div>
            </div>
          </div>

          <div className="top-bar-divider" style={{ width: '1px', height: '22px', background: 'rgba(255, 255, 255, 0.1)' }} />

          {/* Isolated Stakeholder Role Badge (Role-Isolation Enforced) */}
          <div className="top-bar-role-badge" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '0.4rem 1rem',
            borderRadius: 'var(--radius-pill)',
            background: activeBadge.bg,
            border: `1px solid ${activeBadge.border}`,
            color: activeBadge.color,
            fontSize: '0.8rem',
            fontWeight: 800,
            letterSpacing: '0.02em',
            boxShadow: `0 2px 10px ${activeBadge.color}15`
          }}>
            <ActiveRoleIcon size={14} />
            <span className="top-bar-role-badge-text">{activeBadge.title}</span>
          </div>
        </div>

        {/* Right Controls: Desktop vs Mobile Viewports */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {/* DESKTOP CONTROLS (Screen >= 900px) */}
          <div className="top-bar-desktop-only" style={{ alignItems: 'center', gap: '0.75rem' }}>
            {/* Workspace Dropdown + Add Company Button */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.16)',
              borderRadius: 'var(--radius-lg)',
              padding: '2px 4px 2px 8px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
            }}>
              <Building2 size={13} style={{ color: '#CBD5E1' }} />
              <select
                value={selectedCompany}
                onChange={(e) => {
                  if (e.target.value === '__ADD_NEW__') {
                    setIsAddCompanyOpen(true);
                  } else {
                    setSelectedCompany(e.target.value);
                  }
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  outline: 'none',
                  cursor: 'pointer',
                  padding: '0.35rem 0.2rem'
                }}
              >
                {activeTab === 'investor-portfolio' && (
                  <option value="ALL_PORTFOLIO" style={{ background: '#0F172A', color: '#34D399', fontWeight: 800 }}>
                    💼 All Portfolio Holdings (8 Companies)
                  </option>
                )}
                {companies.map(c => (
                  <option key={c.ticker} value={c.ticker} style={{ background: '#0B0F19', color: '#fff' }}>
                    {c.ticker} - {c.companyName || c.name}
                  </option>
                ))}
                <option value="__ADD_NEW__" style={{ background: '#1E1B4B', color: '#A5B4FC', fontWeight: 'bold' }}>
                  + Add Company / Workspace...
                </option>
              </select>

              <button
                onClick={() => setIsAddCompanyOpen(true)}
                title="Register & Add Startup Workspace"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '24px',
                  height: '24px',
                  borderRadius: 'var(--radius-md)',
                  background: 'linear-gradient(135deg, #4F46E5, #6366F1)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(99, 102, 241, 0.5)',
                  transition: 'all 0.2s ease'
                }}
              >
                <Plus size={13} />
              </button>
            </div>

            {/* Command Palette Trigger */}
            <button
              onClick={onOpenSearch}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.42rem 0.85rem',
                borderRadius: 'var(--radius-lg)',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.16)',
                color: '#CBD5E1',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <Search size={13} />
              <span>Search</span>
              <kbd style={{
                fontSize: '0.65rem',
                background: 'rgba(255, 255, 255, 0.12)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                padding: '1px 5px',
                borderRadius: '4px',
                color: '#FFFFFF'
              }}>Ctrl+K</kbd>
            </button>

            {/* User Account Capsule / Auth Trigger */}
            <div style={{ position: 'relative' }}>
              {currentUser ? (
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.35rem 0.75rem',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(129, 140, 248, 0.3)',
                    color: '#fff',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <div style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6366F1, #EC4899)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.68rem',
                    fontWeight: 800
                  }}>
                    {currentUser.fullName ? currentUser.fullName[0].toUpperCase() : 'U'}
                  </div>
                  <span>{currentUser.fullName || currentUser.email}</span>
                  <ChevronDown size={13} style={{ color: 'var(--text-muted)' }} />
                </button>
              ) : (
                <button
                  onClick={onOpenAuth}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.4rem 0.9rem',
                    borderRadius: 'var(--radius-full)',
                    background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                    border: 'none',
                    color: '#fff',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 10px rgba(99, 102, 241, 0.3)'
                  }}
                >
                  <User size={13} /> Sign In / Demo Roles
                </button>
              )}

              {/* Dropdown User Menu */}
              {isUserMenuOpen && currentUser && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  width: '240px',
                  background: '#0B0F19',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.7)',
                  padding: '0.6rem',
                  zIndex: 100
                }}>
                  <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', marginBottom: '0.4rem' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>{currentUser.fullName}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{currentUser.email}</div>
                    <div style={{ marginTop: '0.35rem', display: 'flex', gap: '4px' }}>
                      <span style={{ fontSize: '0.65rem', padding: '1px 6px', borderRadius: '4px', background: activeBadge.bg, color: activeThemeColor, fontWeight: 700, textTransform: 'uppercase' }}>
                        {currentRole.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onOpenAuth();
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-secondary)',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <Users size={14} /> Switch Stakeholder Account
                  </button>

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onLogout();
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'transparent',
                      border: 'none',
                      color: '#EF4444',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                      marginTop: '0.2rem'
                    }}
                  >
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* MOBILE CONTROLS (Screen < 900px) */}
          <div className="top-bar-mobile-only" style={{ alignItems: 'center', gap: '0.45rem' }}>
            {/* Quick Company Selector */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(255, 255, 255, 0.07)',
              border: '1px solid rgba(255, 255, 255, 0.16)',
              borderRadius: 'var(--radius-pill)',
              padding: '2px 8px'
            }}>
              <select
                value={selectedCompany}
                onChange={(e) => {
                  if (e.target.value === '__ADD_NEW__') {
                    setIsAddCompanyOpen(true);
                  } else {
                    setSelectedCompany(e.target.value);
                  }
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  fontFamily: 'var(--font-mono)',
                  outline: 'none',
                  cursor: 'pointer',
                  maxWidth: '90px'
                }}
              >
                {companies.map(c => (
                  <option key={c.ticker} value={c.ticker} style={{ background: '#0B0F19', color: '#fff' }}>
                    {c.ticker}
                  </option>
                ))}
                <option value="__ADD_NEW__" style={{ background: '#1E1B4B', color: '#A5B4FC', fontWeight: 'bold' }}>
                  + Add...
                </option>
              </select>
            </div>

            {/* Quick Search Button */}
            <button
              onClick={onOpenSearch}
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.14)',
                color: '#CBD5E1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0
              }}
              title="Search Palette (Ctrl+K)"
              aria-label="Search"
            >
              <Search size={15} />
            </button>

            {/* Mobile Hamburger Drawer Toggle */}
            <button
              onClick={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)}
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: isMobileDrawerOpen ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                border: isMobileDrawerOpen ? '1px solid #818CF8' : '1px solid rgba(255, 255, 255, 0.18)',
                color: isMobileDrawerOpen ? '#A5B4FC' : '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                flexShrink: 0
              }}
              title="Toggle Navigation Menu"
              aria-label="Navigation Menu"
            >
              {isMobileDrawerOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE FULL-SCREEN NAVIGATION DRAWER */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isMobileDrawerOpen && (
            <motion.div
              className="mobile-nav-drawer"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              {/* Drawer Top Bar */}
              <div className="mobile-nav-drawer-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: 'var(--radius-md)',
                    background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 16px rgba(99, 102, 241, 0.45)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}>
                    <Zap size={18} color="#fff" />
                  </div>
                  <div>
                    <div style={{ 
                      fontFamily: 'var(--font-mono)', 
                      fontWeight: 800, 
                      fontSize: '1.05rem', 
                      letterSpacing: '-0.03em',
                      color: 'var(--text-primary)',
                      lineHeight: 1.1
                    }}>
                      Startup<span style={{ color: '#818CF8' }}>IQ</span>
                    </div>
                    <div style={{ 
                      fontSize: '0.66rem', 
                      color: activeBadge.color,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em'
                    }}>
                      {activeBadge.title}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setIsMobileDrawerOpen(false)}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.16)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  aria-label="Close Navigation"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Drawer Scrollable Body */}
              <div className="mobile-nav-drawer-body">
                {/* Search Quick Action */}
                <button
                  onClick={() => {
                    setIsMobileDrawerOpen(false);
                    onOpenSearch();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#CBD5E1',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <Search size={16} color="#818CF8" />
                  <span style={{ flex: 1 }}>Search commands & modules...</span>
                  <kbd style={{
                    fontSize: '0.65rem',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.16)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    color: '#CBD5E1'
                  }}>Ctrl+K</kbd>
                </button>

                {/* User / Auth Info */}
                <div style={{
                  padding: '0.9rem',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)'
                }}>
                  {currentUser ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.8rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', overflow: 'hidden' }}>
                        <div style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #6366F1, #EC4899)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.85rem',
                          fontWeight: 800,
                          color: '#fff',
                          flexShrink: 0
                        }}>
                          {currentUser.fullName ? currentUser.fullName[0].toUpperCase() : 'U'}
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                          <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                            {currentUser.fullName}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                            {currentUser.email}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setIsMobileDrawerOpen(false);
                          onLogout();
                        }}
                        style={{
                          background: 'rgba(239, 68, 68, 0.15)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          color: '#F87171',
                          padding: '0.35rem 0.65rem',
                          borderRadius: '6px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          flexShrink: 0
                        }}
                      >
                        Logout
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setIsMobileDrawerOpen(false);
                        onOpenAuth();
                      }}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                        border: 'none',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <User size={15} /> Sign In / Demo Stakeholder Roles
                    </button>
                  )}
                </div>

                {/* Company / Workspace Selector */}
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.45rem' }}>
                    Active Company Workspace
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                    padding: '0.55rem 0.75rem',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                      <Building2 size={16} color="#818CF8" style={{ flexShrink: 0 }} />
                      <select
                        value={selectedCompany}
                        onChange={(e) => {
                          if (e.target.value === '__ADD_NEW__') {
                            setIsMobileDrawerOpen(false);
                            setIsAddCompanyOpen(true);
                          } else {
                            setSelectedCompany(e.target.value);
                          }
                        }}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#fff',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          width: '100%',
                          outline: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        {companies.map(c => (
                          <option key={c.ticker} value={c.ticker} style={{ background: '#0B0F19', color: '#fff' }}>
                            {c.ticker} - {c.companyName || c.name}
                          </option>
                        ))}
                        <option value="__ADD_NEW__" style={{ background: '#1E1B4B', color: '#A5B4FC', fontWeight: 'bold' }}>
                          + Add Company / Workspace...
                        </option>
                      </select>
                    </div>
                    <button
                      onClick={() => {
                        setIsMobileDrawerOpen(false);
                        setIsAddCompanyOpen(true);
                      }}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        background: 'linear-gradient(135deg, #4F46E5, #6366F1)',
                        border: 'none',
                        color: '#fff',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                        flexShrink: 0
                      }}
                    >
                      <Plus size={12} /> Add
                    </button>
                  </div>
                </div>

                {/* Stakeholder Engine / Workspace Switcher */}
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.45rem' }}>
                    Switch Operating System
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                    {[
                      { role: 'founder', label: 'Founder OS', tab: 'overview', icon: Sparkles, color: '#818CF8' },
                      { role: 'investor', label: 'Investor OS', tab: 'investor-portfolio', icon: Briefcase, color: '#34D399' },
                      { role: 'analyst', label: 'Analyst OS', tab: 'analyst-workspace', icon: BarChart3, color: '#A5B4FC' },
                      { role: 'advisor', label: 'Advisor OS', tab: 'advisor-workspace', icon: Compass, color: '#FBBF24' },
                    ].map(r => (
                      <button
                        key={r.role}
                        onClick={() => {
                          setEngineMode(r.role);
                          setActiveTab(r.tab);
                          setIsMobileDrawerOpen(false);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '0.65rem 0.75rem',
                          borderRadius: '8px',
                          background: currentRole === r.role ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                          border: currentRole === r.role ? `1px solid ${r.color}` : '1px solid rgba(255, 255, 255, 0.06)',
                          color: currentRole === r.role ? r.color : 'var(--text-secondary)',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        <r.icon size={15} style={{ flexShrink: 0 }} />
                        <span style={{ whiteSpace: 'nowrap' }}>{r.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Workspace Navigation Tabs */}
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.45rem' }}>
                    Workspace Modules ({currentTabs.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {currentTabs.map(tab => {
                      const Icon = tab.icon;
                      const isActive = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => {
                            setActiveTab(tab.id);
                            setIsMobileDrawerOpen(false);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.75rem 0.9rem',
                            borderRadius: '8px',
                            background: isActive ? `${activeThemeColor}18` : 'rgba(255, 255, 255, 0.03)',
                            border: isActive ? `1px solid ${activeThemeColor}60` : '1px solid rgba(255, 255, 255, 0.05)',
                            color: isActive ? '#fff' : 'var(--text-secondary)',
                            fontSize: '0.84rem',
                            fontWeight: isActive ? 800 : 600,
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                            <Icon size={16} color={isActive ? activeThemeColor : 'currentColor'} style={{ flexShrink: 0 }} />
                            <span>{tab.label}</span>
                          </div>
                          {tab.isPro && (
                            <span style={{ fontSize: '0.62rem', padding: '1px 5px', borderRadius: '4px', background: 'rgba(245, 158, 11, 0.18)', color: '#FBBF24', fontWeight: 800 }}>
                              PILOT PREVIEW
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Portal / Gateway entry */}
                <button
                  onClick={() => {
                    setIsMobileDrawerOpen(false);
                    onOpenPortal();
                  }}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: 'var(--text-secondary)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Compass size={14} /> Return to Roles Gateway Portal
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Bottom Tier: Role-Specific Navigation Tabs */}
      <div className="top-bar-nav-scroll-container">
        <nav 
          ref={navRef}
          className="top-bar-tier-nav" 
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '0 1.25rem',
            gap: '0.35rem',
            overflowX: 'auto',
            overflowY: 'hidden',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            flexWrap: 'nowrap',
            width: '100%',
            maxWidth: '100%',
            boxSizing: 'border-box'
          }}
        >
          {currentTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                data-active={isActive ? 'true' : 'false'}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.75rem 0.95rem',
                  border: 'none',
                  borderRadius: '8px 8px 0 0',
                  background: isActive ? 'rgba(255, 255, 255, 0.06)' : 'transparent',
                  color: isActive ? '#FFFFFF' : '#CBD5E1',
                  fontSize: '0.84rem',
                  fontWeight: isActive ? 800 : 600,
                  cursor: 'pointer',
                  position: 'relative',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  flex: '0 0 auto',
                  minWidth: 'max-content',
                  WebkitTapHighlightColor: 'transparent',
                  transition: 'all 0.18s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = '#FFFFFF';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = '#CBD5E1';
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <Icon size={15} color={isActive ? activeThemeColor : 'currentColor'} style={{ flexShrink: 0 }} />
                <span style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>{tab.label}</span>
                {tab.isPro && (
                  <span style={{
                    fontSize: '0.62rem',
                    padding: '1px 5px',
                    borderRadius: '4px',
                    background: 'rgba(245, 158, 11, 0.18)',
                    color: '#FBBF24',
                    fontWeight: 800,
                    flexShrink: 0
                  }}>
                    PILOT PREVIEW
                  </span>
                )}
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '3px',
                      background: activeThemeColor,
                      boxShadow: `0 0 12px ${activeThemeColor}, 0 0 4px #FFFFFF`
                    }}
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Add Company / Workspace Modal (Portaled to document.body to bypass header backdrop-filter containing block) */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isAddCompanyOpen && (
            <div 
              onClick={(e) => {
                if (e.target === e.currentTarget) setIsAddCompanyOpen(false);
              }}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 999999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(4, 7, 16, 0.85)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                padding: '1.5rem',
                overflowY: 'auto'
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 15 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                style={{
                  position: 'relative',
                  width: '100%',
                  maxWidth: '540px',
                  background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.98) 0%, rgba(10, 15, 30, 0.98) 100%)',
                  border: '1px solid rgba(129, 140, 248, 0.35)',
                  borderRadius: 'var(--radius-2xl)',
                  boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 35px rgba(99, 102, 241, 0.15)',
                  padding: '2.25rem',
                  color: '#fff',
                  margin: 'auto'
                }}
              >
                {/* Header with icon, title, description, and close button */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: 'var(--radius-lg)',
                      background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(168, 85, 247, 0.25))',
                      border: '1px solid rgba(129, 140, 248, 0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#818CF8',
                      boxShadow: '0 4px 15px rgba(99, 102, 241, 0.2)'
                    }}>
                      <Building2 size={22} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                        Register Company Workspace
                      </h3>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
                        Add a new startup asset profile to track telemetry and cap table.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsAddCompanyOpen(false)}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>

                {addCompError && (
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    padding: '0.75rem 1rem', 
                    background: 'rgba(239, 68, 68, 0.1)', 
                    border: '1px solid rgba(239, 68, 68, 0.3)', 
                    borderRadius: 'var(--radius-md)', 
                    color: '#F87171', 
                    fontSize: '0.85rem', 
                    marginBottom: '1.25rem' 
                  }}>
                    <AlertCircle size={16} />
                    <span>{addCompError}</span>
                  </div>
                )}

                <form onSubmit={handleSaveNewCompany} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                  <div className="cockpit-modal-form-grid">
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', fontWeight: 600 }}>
                        Company Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Apex AI Dynamics"
                        value={newCompForm.companyName}
                        onChange={(e) => setNewCompForm({ ...newCompForm, companyName: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.7rem 0.9rem',
                          borderRadius: 'var(--radius-md)',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid var(--border-subtle)',
                          color: '#fff',
                          fontSize: '0.85rem'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', fontWeight: 600 }}>
                        Ticker Symbol *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. APEX"
                        value={newCompForm.ticker}
                        onChange={(e) => setNewCompForm({ ...newCompForm, ticker: e.target.value.toUpperCase() })}
                        style={{
                          width: '100%',
                          padding: '0.7rem 0.9rem',
                          borderRadius: 'var(--radius-md)',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid var(--border-subtle)',
                          color: '#fff',
                          fontSize: '0.85rem',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700
                        }}
                      />
                    </div>
                  </div>

                  <div className="cockpit-modal-form-grid">
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', fontWeight: 600 }}>
                        Industry / Sector
                      </label>
                      <select
                        value={newCompForm.industry}
                        onChange={(e) => setNewCompForm({ ...newCompForm, industry: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.7rem 0.9rem',
                          borderRadius: 'var(--radius-md)',
                          background: '#0F172A',
                          border: '1px solid var(--border-subtle)',
                          color: '#fff',
                          fontSize: '0.85rem'
                        }}
                      >
                        <option value="AI & Enterprise Software">AI & Enterprise Software</option>
                        <option value="FinTech & Web3">FinTech & Web3</option>
                        <option value="HealthTech & Bio">HealthTech & Bio</option>
                        <option value="Climate & CleanTech">Climate & CleanTech</option>
                        <option value="E-Commerce & Retail">E-Commerce & Retail</option>
                        <option value="EdTech & Learning">EdTech & Learning</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', fontWeight: 600 }}>
                        Growth Stage
                      </label>
                      <select
                        value={newCompForm.stage}
                        onChange={(e) => setNewCompForm({ ...newCompForm, stage: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.7rem 0.9rem',
                          borderRadius: 'var(--radius-md)',
                          background: '#0F172A',
                          border: '1px solid var(--border-subtle)',
                          color: '#fff',
                          fontSize: '0.85rem'
                        }}
                      >
                        <option value="Pre-Seed">Pre-Seed</option>
                        <option value="Seed">Seed</option>
                        <option value="Series A">Series A</option>
                        <option value="Series B+">Series B+</option>
                        <option value="Growth">Growth</option>
                      </select>
                    </div>
                  </div>

                  <div className="cockpit-modal-form-grid">
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', fontWeight: 600 }}>
                        Monthly Revenue ($)
                      </label>
                      <input
                        type="number"
                        value={newCompForm.monthlyRevenue}
                        onChange={(e) => setNewCompForm({ ...newCompForm, monthlyRevenue: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.7rem 0.9rem',
                          borderRadius: 'var(--radius-md)',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid var(--border-subtle)',
                          color: '#fff',
                          fontSize: '0.85rem'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', fontWeight: 600 }}>
                        Monthly Burn ($)
                      </label>
                      <input
                        type="number"
                        value={newCompForm.monthlyBurn}
                        onChange={(e) => setNewCompForm({ ...newCompForm, monthlyBurn: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.7rem 0.9rem',
                          borderRadius: 'var(--radius-md)',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid var(--border-subtle)',
                          color: '#fff',
                          fontSize: '0.85rem'
                        }}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '0.85rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                      border: 'none',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      marginTop: '0.5rem',
                      boxShadow: '0 4px 16px rgba(99, 102, 241, 0.4)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Plus size={16} /> Create & Open Company Workspace
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsAddCompanyOpen(false);
                      setActiveTab('profile-wizard');
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(99, 102, 241, 0.4)',
                      color: '#A5B4FC',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      marginTop: '0.4rem',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Sparkles size={15} /> Launch Full 8-Step Profile Wizard
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </header>
  );
}
