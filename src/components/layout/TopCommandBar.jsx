import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Briefcase, Building2, Search, Compass, BookOpen, 
  Library, Target, FlaskConical, Map, TrendingUp, Activity, 
  PieChart, FileSpreadsheet, Bookmark, FolderLock, Zap, ChevronDown,
  User, Lock, LogOut, ShieldCheck, Crown, CreditCard, Plus, X, AlertCircle,
  BarChart3, Shield, Users, Layers
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

  const currentRole = currentUser?.role?.toLowerCase() || engineMode || 'founder';
  const isInvestor = engineMode === 'investor';
  const isAnalyst = engineMode === 'analyst';
  const isAdvisor = engineMode === 'advisor';
  const isAdmin = engineMode === 'admin' || engineMode === 'super_admin';

  const userPlan = currentUser?.subscription?.plan || 'free';
  const isPro = userPlan !== 'free';

  // Founder OS primary navigation tabs
  const founderTabs = [
    { id: 'overview', label: 'Cockpit', icon: Compass },
    { id: 'prompt-builder', label: 'AI Copilot', icon: Sparkles },
    { id: 'learning', label: 'Academy', icon: BookOpen },
    { id: 'terms', label: 'Terms & Formulas', icon: Library },
    { id: 'idea-analyzer', label: 'Idea Lab', icon: Target },
    { id: 'idea-testing', label: 'Lean Testing', icon: FlaskConical },
    { id: 'gtm', label: 'GTM Roadmap', icon: Map },
    { id: 'financial-model', label: '5-Yr DCF', icon: TrendingUp, isPro: true },
    { id: 'health-score', label: 'Health Score', icon: Activity },
    { id: 'action-plan', label: 'Action Plan', icon: Target, isPro: true },
  ];

  // Investor OS primary navigation tabs (Section 2)
  const investorTabs = [
    { id: 'investor-portfolio', label: 'Portfolio', icon: Briefcase },
    { id: 'deal-room', label: 'Deal Room', icon: Compass },
    { id: 'cap-table', label: 'Cap Table', icon: PieChart },
    { id: 'ledger', label: 'Ledger Journal', icon: FileSpreadsheet },
    { id: 'watchlist', label: 'Watchlist', icon: Bookmark },
    { id: 'data-room', label: 'Data Room', icon: FolderLock, isPro: true },
    { id: 'prompt-builder', label: 'AI Copilot', icon: Sparkles },
  ];

  const analystTabs = [
    { id: 'analyst-workspace', label: 'Diligence Screener', icon: BarChart3 },
    { id: 'financial-model', label: 'DCF & Sensitivity', icon: TrendingUp },
    { id: 'cap-table', label: 'Cap Table Waterfall', icon: PieChart },
    { id: 'data-room', label: 'Diligence Data Room', icon: FolderLock },
    { id: 'prompt-builder', label: 'AI Copilot', icon: Sparkles },
  ];

  const advisorTabs = [
    { id: 'advisor-workspace', label: 'Advisory Cockpit', icon: Compass },
    { id: 'gtm', label: 'GTM Acceleration', icon: Map },
    { id: 'health-score', label: 'Venture Health', icon: Activity },
    { id: 'action-plan', label: 'Strategic OKRs', icon: Target },
    { id: 'learning', label: 'Knowledge Academy', icon: BookOpen },
    { id: 'prompt-builder', label: 'AI Copilot', icon: Sparkles },
  ];

  const adminTabs = [
    { id: 'admin-workspace', label: 'User & Role Management', icon: Users },
    { id: 'admin-audit', label: 'Audit Trail', icon: Activity },
    { id: 'admin-security', label: 'Security & Access', icon: Lock },
    { id: 'prompt-builder', label: 'AI Copilot', icon: Sparkles },
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
      zIndex: 50,
      width: '100%',
      background: 'rgba(6, 10, 20, 0.94)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderBottom: '1px solid var(--border-subtle)',
      boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.5)'
    }}>
      {/* Top Tier: Brand, Mode/Role Badge, Workspace Selector & Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.65rem 1.5rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        {/* Left: Brand + Role Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div 
            onClick={() => {
              if (onOpenPortal) onOpenPortal();
              else if (currentRole === 'founder') setActiveTab('overview');
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
              <div style={{ 
                fontSize: '0.62rem', 
                color: 'var(--text-muted)', 
                letterSpacing: '0.08em', 
                textTransform: 'uppercase',
                fontWeight: 700
              }}>
                Project Alpha Core
              </div>
            </div>
          </div>

          <div style={{ width: '1px', height: '22px', background: 'rgba(255, 255, 255, 0.1)' }} />

          {/* 4 Core Stakeholder Portals Switcher + Role Gateway */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-pill)',
            padding: '3px',
            position: 'relative',
            gap: '2px'
          }}>
            <button
              onClick={() => onOpenPortal && onOpenPortal()}
              title="Return to 4-Option Role Gateway"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '0.4rem 0.85rem',
                borderRadius: 'var(--radius-pill)',
                border: 'none',
                background: activeTab === 'portal' ? 'linear-gradient(135deg, #6366F1, #EC4899)' : 'rgba(255, 255, 255, 0.05)',
                color: activeTab === 'portal' ? '#fff' : 'var(--text-muted)',
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: activeTab === 'portal' ? '0 2px 10px rgba(99, 102, 241, 0.4)' : 'none'
              }}
            >
              <Layers size={13} /> 4-Role Portal
            </button>

            <button
              onClick={() => {
                setEngineMode('founder');
                setActiveTab('overview');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '0.4rem 0.85rem',
                borderRadius: 'var(--radius-pill)',
                border: 'none',
                background: engineMode === 'founder' && activeTab !== 'portal' ? 'linear-gradient(135deg, #6366F1, #8B5CF6)' : 'transparent',
                color: engineMode === 'founder' && activeTab !== 'portal' ? '#fff' : 'var(--text-muted)',
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: engineMode === 'founder' && activeTab !== 'portal' ? '0 2px 10px rgba(99, 102, 241, 0.35)' : 'none'
              }}
            >
              <Sparkles size={13} /> Founder + Academic
            </button>

            <button
              onClick={() => {
                setEngineMode('investor');
                setActiveTab('investor-portfolio');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '0.4rem 0.85rem',
                borderRadius: 'var(--radius-pill)',
                border: 'none',
                background: engineMode === 'investor' && activeTab !== 'portal' ? 'linear-gradient(135deg, #10B981, #059669)' : 'transparent',
                color: engineMode === 'investor' && activeTab !== 'portal' ? '#fff' : 'var(--text-muted)',
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: engineMode === 'investor' && activeTab !== 'portal' ? '0 2px 10px rgba(16, 185, 129, 0.35)' : 'none'
              }}
            >
              <Briefcase size={13} /> Investor
            </button>

            <button
              onClick={() => {
                setEngineMode('advisor');
                setActiveTab('advisor-workspace');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '0.4rem 0.85rem',
                borderRadius: 'var(--radius-pill)',
                border: 'none',
                background: engineMode === 'advisor' && activeTab !== 'portal' ? 'linear-gradient(135deg, #F59E0B, #D97706)' : 'transparent',
                color: engineMode === 'advisor' && activeTab !== 'portal' ? '#fff' : 'var(--text-muted)',
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: engineMode === 'advisor' && activeTab !== 'portal' ? '0 2px 10px rgba(245, 158, 11, 0.35)' : 'none'
              }}
            >
              <Compass size={13} /> Advisor
            </button>

            <button
              onClick={() => {
                setEngineMode('analyst');
                setActiveTab('analyst-workspace');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '0.4rem 0.85rem',
                borderRadius: 'var(--radius-pill)',
                border: 'none',
                background: engineMode === 'analyst' && activeTab !== 'portal' ? 'linear-gradient(135deg, #06B6D4, #4F46E5)' : 'transparent',
                color: engineMode === 'analyst' && activeTab !== 'portal' ? '#fff' : 'var(--text-muted)',
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: engineMode === 'analyst' && activeTab !== 'portal' ? '0 2px 10px rgba(6, 182, 212, 0.35)' : 'none'
              }}
            >
              <BarChart3 size={13} /> Analyst
            </button>

            {/* If user is Admin/SuperAdmin, allow clicking into Admin Center */}
            {(currentUser?.role === 'admin' || currentUser?.role === 'super_admin' || isAdmin) && (
              <button
                onClick={() => {
                  setEngineMode('admin');
                  setActiveTab('admin-workspace');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '0.4rem 0.85rem',
                  borderRadius: 'var(--radius-pill)',
                  border: 'none',
                  background: isAdmin ? 'linear-gradient(135deg, #A855F7, #7E22CE)' : 'transparent',
                  color: isAdmin ? '#fff' : 'var(--text-muted)',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isAdmin ? '0 2px 10px rgba(168, 85, 247, 0.35)' : 'none'
                }}
              >
                <Crown size={12} /> Admin Center
              </button>
            )}

            {/* If user is Analyst, allow clicking into Analyst Workspace */}
            {currentUser?.role === 'analyst' && (
              <button
                onClick={() => {
                  setEngineMode('analyst');
                  setActiveTab('analyst-workspace');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '0.4rem 0.85rem',
                  borderRadius: 'var(--radius-pill)',
                  border: 'none',
                  background: isAnalyst ? 'linear-gradient(135deg, #818CF8, #4F46E5)' : 'transparent',
                  color: isAnalyst ? '#fff' : 'var(--text-muted)',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <BarChart3 size={12} /> Analyst Mode
              </button>
            )}

            {/* If user is Advisor, allow clicking into Advisor Workspace */}
            {currentUser?.role === 'advisor' && (
              <button
                onClick={() => {
                  setEngineMode('advisor');
                  setActiveTab('advisor-workspace');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '0.4rem 0.85rem',
                  borderRadius: 'var(--radius-pill)',
                  border: 'none',
                  background: isAdvisor ? 'linear-gradient(135deg, #F59E0B, #D97706)' : 'transparent',
                  color: isAdvisor ? '#fff' : 'var(--text-muted)',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <Compass size={12} /> Advisor Mode
              </button>
            )}
          </div>
        </div>

        {/* Right Controls: Workspace Dropdown, Search, Subscription Button, Auth Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Workspace Dropdown + Add Company Button */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '2px 4px 2px 8px'
          }}>
            <Building2 size={13} style={{ color: 'var(--text-muted)' }} />
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
                fontWeight: 600,
                fontFamily: 'var(--font-mono)',
                outline: 'none',
                cursor: 'pointer',
                padding: '0.35rem 0.2rem'
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
                background: 'rgba(99, 102, 241, 0.25)',
                border: '1px solid rgba(129, 140, 248, 0.4)',
                color: '#A5B4FC',
                cursor: 'pointer',
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
              padding: '0.38rem 0.75rem',
              borderRadius: 'var(--radius-lg)',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              fontSize: '0.78rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <Search size={13} />
            <span>Search</span>
            <kbd style={{
              fontSize: '0.65rem',
              background: 'rgba(255, 255, 255, 0.08)',
              padding: '1px 5px',
              borderRadius: '4px',
              color: 'var(--text-muted)'
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
      </div>

      {/* Bottom Tier: Role-Specific Navigation Tabs */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        padding: '0 1.5rem',
        gap: '0.35rem',
        overflowX: 'auto',
        scrollbarWidth: 'none'
      }}>
        {currentTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.75rem 0.95rem',
                border: 'none',
                background: 'transparent',
                color: isActive ? '#fff' : 'var(--text-secondary)',
                fontSize: '0.82rem',
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                position: 'relative',
                whiteSpace: 'nowrap',
                transition: 'color 0.2s ease'
              }}
            >
              <Icon size={14} color={isActive ? activeThemeColor : 'currentColor'} />
              <span>{tab.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '2px',
                    background: activeThemeColor,
                    boxShadow: `0 0 10px ${activeThemeColor}`
                  }}
                />
              )}
            </button>
          );
        })}
      </nav>

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
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1rem' }}>
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

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
