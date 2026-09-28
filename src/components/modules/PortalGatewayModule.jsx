import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, Sparkles, Briefcase, Compass, BarChart3, ArrowRight, ArrowLeft, 
  CheckCircle2, Shield, TrendingUp, BookOpen, Layers, Target, 
  FileSpreadsheet, Lock, Mail, Eye, EyeOff, Wand2, ChevronRight, Moon
} from 'lucide-react';
import { api, setAuthToken, setStoredUser } from '../../api/client';
import OnboardingModal from '../common/OnboardingModal';

export default function PortalGatewayModule({ onSelectRole, currentUser, company, onEnterGuest }) {
  const [selectedRole, setSelectedRole] = useState('founder');
  const [authMode, setAuthMode] = useState('quick'); // 'quick' | 'email'
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('founder@startupiq.io');
  const [password, setPassword] = useState('Founder@123');
  const [fullName, setFullName] = useState('Alex Chen');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [pendingAuthUser, setPendingAuthUser] = useState(null);

  const roles = [
    {
      id: 'founder',
      title: 'Founder + Academic',
      subtitle: 'Build, validate & learn',
      icon: Sparkles,
      defaultTab: 'overview',
      accentColor: '#6366F1',
      secondaryColor: '#8B5CF6',
      badgeBg: 'rgba(99, 102, 241, 0.12)',
      badgeBorder: 'rgba(99, 102, 241, 0.3)',
      tagline: 'Venture Operating System & Academy',
      heroHeadline: 'Build ventures with institutional rigor.',
      heroDescription: 'From initial hypothesis to product-market fit, unit economics, and 5-year financial models — backed by 30 core curriculum lessons.',
      demoUser: {
        name: 'Alex Chen',
        email: 'founder@startupiq.io',
        role: 'founder'
      },
      keyCapabilities: [
        'Idea Assessment Lab & 6-Stage Lean RAT Testing',
        'Founder Competency Assessment (AI Diagnostic)',
        '5-Year DCF Financial Model & Startup Health Score',
        '30 Core Business Lessons & 50-Term Financial Library'
      ]
    },
    {
      id: 'investor',
      title: 'Investor',
      subtitle: 'Deploy capital & track funds',
      icon: Briefcase,
      defaultTab: 'investor-portfolio',
      accentColor: '#10B981',
      secondaryColor: '#059669',
      badgeBg: 'rgba(16, 185, 129, 0.12)',
      badgeBorder: 'rgba(16, 185, 129, 0.3)',
      tagline: 'Capital Allocation & Due Diligence OS',
      heroHeadline: 'Deploy capital with data-driven confidence.',
      heroDescription: 'Manage multi-asset venture portfolios, structure deal room pipelines, simulate cap table dilution, and audit transaction ledgers in real time.',
      demoUser: {
        name: 'Victoria Sterling',
        email: 'investor@startupiq.io',
        role: 'investor'
      },
      keyCapabilities: [
        'Multi-Company Portfolio Dashboard & Real-Time Metrics',
        'Live Deal Room Pipeline & Term Sheet Staging',
        'Dynamic Cap Table & Liquidation Waterfall Simulations',
        'Double-Entry Investment Ledger & Virtual Data Room (VDR)'
      ]
    },
    {
      id: 'advisor',
      title: 'Advisor',
      subtitle: 'Strategic mentorship & governance',
      icon: Compass,
      defaultTab: 'advisor-workspace',
      accentColor: '#F59E0B',
      secondaryColor: '#D97706',
      badgeBg: 'rgba(245, 158, 11, 0.12)',
      badgeBorder: 'rgba(245, 158, 11, 0.3)',
      tagline: 'Strategic Governance & Mentorship Hub',
      heroHeadline: 'Supervise growth and milestone execution.',
      heroDescription: 'Empower advisory board members and seasoned mentors to track quarterly milestone execution, audit venture health, and verify diligence gates.',
      demoUser: {
        name: 'Dr. Sarah Jenkins',
        email: 'advisor@startupiq.io',
        role: 'advisor'
      },
      keyCapabilities: [
        'Advisory Cockpit & Founder Alignment Tracking',
        'Strategic OKR Roadmap & Milestone Verification',
        'Venture Health Scoring & Risk Mitigation Audits',
        'GTM Acceleration & Investor Readiness Sign-offs'
      ]
    },
    {
      id: 'analyst',
      title: 'Analyst',
      subtitle: 'Quantitative modeling & research',
      icon: BarChart3,
      defaultTab: 'analyst-workspace',
      accentColor: '#06B6D4',
      secondaryColor: '#3B82F6',
      badgeBg: 'rgba(6, 182, 212, 0.12)',
      badgeBorder: 'rgba(6, 182, 212, 0.3)',
      tagline: 'Quantitative Research & Valuation Screener',
      heroHeadline: 'Stress-test venture valuations and unit economics.',
      heroDescription: 'Conduct institutional diligence research, run DCF sensitivity matrices, model liquidation preference waterfalls, and benchmark peer cohorts.',
      demoUser: {
        name: 'Marcus Vance',
        email: 'analyst@startupiq.io',
        role: 'analyst'
      },
      keyCapabilities: [
        'Comprehensive Diligence Screener & Risk Scorecard',
        'DCF Sensitivity Stress-Testing & Growth Scenario Matrices',
        'Liquidation Preference & Waterfall Distribution Modeling',
        'Cohort Retention, Magic Number & Burn Multiple Analytics'
      ]
    }
  ];

  const currentRoleConfig = roles.find(r => r.id === selectedRole) || roles[0];

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
    const cfg = roles.find(r => r.id === roleId);
    if (cfg) {
      setEmail(cfg.demoUser.email);
      setFullName(cfg.demoUser.name);
      setPassword('StartupIQ@2026');
    }
    setErrorMsg('');
  };

  const handleLaunch = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      let authUser = null;

      if (authMode === 'quick') {
        // Authenticate directly with the seeded demo credentials for the selected role
        try {
          const loginRes = await api.auth.login({
            email: currentRoleConfig.demoUser.email,
            password: 'StartupIQ@2026'
          });
          if (loginRes && loginRes.user) {
            authUser = loginRes.user;
          }
        } catch (apiErr) {
          console.warn('Demo login API fallback:', apiErr.message);
        }
      } else {
        // Custom Email Form Authentication
        if (isSignUp) {
          const regRes = await api.auth.register({
            fullName: fullName.trim() || currentRoleConfig.demoUser.name,
            email: email.trim(),
            password: password.trim(),
            role: selectedRole
          });
          if (regRes && regRes.user) {
            authUser = regRes.user;
          }
        } else {
          const loginRes = await api.auth.login({
            email: email.trim(),
            password: password.trim()
          });
          if (loginRes && loginRes.user) {
            authUser = loginRes.user;
          }
        }
      }

      // Default demo session if offline
      if (!authUser) {
        authUser = {
          _id: `user-${selectedRole}-demo`,
          fullName: currentRoleConfig.demoUser.name,
          email: currentRoleConfig.demoUser.email,
          role: selectedRole,
          subscription: { plan: 'founder_pro', status: 'active' },
          onboarding: { completed: false }
        };
        setAuthToken(`demo-token-${selectedRole}`);
        setStoredUser(authUser);
      }

      setPendingAuthUser(authUser);

      // If user already completed onboarding, route directly into their saved workspace & tab!
      if (authUser.onboarding && authUser.onboarding.completed && authUser.onboarding.assignedTab) {
        onSelectRole(
          authUser.onboarding.assignedWorkspace || authUser.role || selectedRole,
          authUser.onboarding.assignedTab,
          authUser,
          authUser.onboarding.routingReason || `Welcome back, ${authUser.fullName || 'User'}!`
        );
      } else {
        setIsOnboardingOpen(true);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to enter workspace');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteOnboarding = (route, updatedUser) => {
    setIsOnboardingOpen(false);
    onSelectRole(route.role, route.tab, updatedUser || pendingAuthUser, route.reason);
  };

  const handleGuest = () => {
    if (onEnterGuest) onEnterGuest();
    else onSelectRole('founder', 'overview');
  };

  return (
    <div className="portal-gateway-root">
      {/* ================= LEFT SIDE: STARTUPIQ VENTURE SHOWCASE ================= */}
      <div className="portal-gateway-left">
        {/* Subtle dynamic glow matching active role */}
        <div style={{
          position: 'absolute',
          top: '30%',
          left: '0%',
          width: 'min(450px, 90vw)',
          height: 'min(450px, 90vw)',
          maxWidth: '100%',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${currentRoleConfig.accentColor}18 0%, transparent 70%)`,
          pointerEvents: 'none',
          filter: 'blur(70px)',
          transition: 'all 0.4s ease',
          zIndex: 0
        }} />

        {/* Top Header & Brand */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
            marginBottom: '3rem'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(99, 102, 241, 0.45)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <Zap size={22} color="#fff" />
            </div>

            <div>
              <div style={{
                fontSize: '1.4rem',
                fontWeight: 900,
                letterSpacing: '-0.03em',
                color: '#FFFFFF',
                lineHeight: 1.1
              }}>
                Startup<span style={{ color: '#818CF8' }}>IQ</span>
              </div>
              <div style={{
                fontSize: '0.65rem',
                color: 'var(--text-muted, #94A3B8)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                fontWeight: 700
              }}>
                Project Alpha Core • Dual Engine
              </div>
            </div>
          </div>

          {/* Active Role Category Badge */}
          <motion.div
            key={currentRoleConfig.tagline}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '0.35rem 0.9rem',
              borderRadius: '9999px',
              background: currentRoleConfig.badgeBg,
              border: `1px solid ${currentRoleConfig.badgeBorder}`,
              color: currentRoleConfig.accentColor,
              fontSize: '0.78rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              marginBottom: '1.8rem'
            }}
          >
            <Sparkles size={13} />
            <span>{currentRoleConfig.tagline}</span>
          </motion.div>

          {/* Dynamic Headline */}
          <motion.h1
            key={currentRoleConfig.heroHeadline}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              fontSize: 'clamp(2.1rem, 3.2vw, 3rem)',
              fontWeight: 800,
              lineHeight: 1.2,
              letterSpacing: '-0.03em',
              color: '#FFFFFF',
              marginBottom: '1.2rem',
              maxWidth: '560px'
            }}
          >
            {currentRoleConfig.heroHeadline}
          </motion.h1>

          {/* Dynamic Subtitle */}
          <motion.p
            key={currentRoleConfig.heroDescription}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            style={{
              fontSize: '1.02rem',
              color: '#94A3B8',
              lineHeight: 1.6,
              marginBottom: '2.5rem',
              maxWidth: '520px'
            }}
          >
            {currentRoleConfig.heroDescription}
          </motion.p>

          {/* Capabilities Checklist */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.1rem',
            maxWidth: '520px'
          }}>
            {currentRoleConfig.keyCapabilities.map((cap, cIdx) => (
              <motion.div
                key={cIdx}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, delay: 0.08 + cIdx * 0.06 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.9rem'
                }}
              >
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: currentRoleConfig.badgeBg,
                  border: `1px solid ${currentRoleConfig.badgeBorder}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: currentRoleConfig.accentColor,
                  flexShrink: 0
                }}>
                  <CheckCircle2 size={15} />
                </div>
                <span style={{
                  fontSize: '0.92rem',
                  fontWeight: 500,
                  color: '#CBD5E1',
                  lineHeight: 1.4
                }}>
                  {cap}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom Platform Stat Footer */}
        <div className="portal-gateway-stats" style={{
          position: 'relative',
          zIndex: 1,
          marginTop: '3.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '2rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          paddingTop: '1.5rem',
          flexWrap: 'wrap'
        }}>
          <div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF' }}>120+</div>
            <div style={{ fontSize: '0.72rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Vetted Scenarios</div>
          </div>
          <div className="portal-gateway-stat-divider" style={{ width: '1px', height: '24px', background: 'rgba(255, 255, 255, 0.1)' }} />
          <div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF' }}>50+</div>
            <div style={{ fontSize: '0.72rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Venture Terms</div>
          </div>
          <div className="portal-gateway-stat-divider" style={{ width: '1px', height: '24px', background: 'rgba(255, 255, 255, 0.1)' }} />
          <div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF' }}>Zero Latency</div>
            <div style={{ fontSize: '0.72rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>In-Memory Sync</div>
          </div>
        </div>
      </div>

      {/* ================= RIGHT SIDE: CLEAN ROLE SELECTOR & ACCESS ================= */}
      <div className="portal-gateway-right">
        {/* Mobile-only branding header */}
        <div className="portal-mobile-brand" style={{
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '1rem',
          width: '100%',
          maxWidth: '480px'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            flexShrink: 0
          }}>
            <Zap size={18} color="#fff" />
          </div>
          <div>
            <div style={{
              fontSize: '1.15rem',
              fontWeight: 900,
              letterSpacing: '-0.03em',
              color: '#FFFFFF',
              lineHeight: 1.1
            }}>
              Startup<span style={{ color: '#818CF8' }}>IQ</span>
            </div>
            <div style={{
              fontSize: '0.6rem',
              color: 'var(--text-muted, #94A3B8)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              fontWeight: 700
            }}>
              Project Alpha Core • Dual Engine
            </div>
          </div>
        </div>

        {/* Top Controls: Return to platform */}
        <div style={{
          width: '100%',
          maxWidth: '480px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
          flexShrink: 0
        }}>
          <button
            type="button"
            onClick={handleGuest}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'none',
              border: 'none',
              color: '#94A3B8',
              fontSize: '0.88rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'color 0.2s ease',
              padding: 0
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#FFFFFF'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#94A3B8'}
          >
            <ArrowLeft size={16} />
            <span>Enter as Guest</span>
          </button>

          <div style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            padding: '0.3rem 0.75rem',
            borderRadius: '9999px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            color: '#94A3B8'
          }}>
            Alpha 8.0
          </div>
        </div>

        {/* Central Card */}
        <div style={{
          width: '100%',
          maxWidth: '480px',
          margin: '0 auto',
          paddingBottom: '3rem',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Header */}
          <div style={{ marginBottom: '1.8rem' }}>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: 800,
              color: '#FFFFFF',
              letterSpacing: '-0.02em',
              marginBottom: '0.45rem'
            }}>
              Choose Your Workspace
            </h2>
            <p style={{
              fontSize: '0.9rem',
              color: '#94A3B8'
            }}>
              Select your operational role to launch your dedicated environment.
            </p>
          </div>

          {/* 4-Option Role Selector (2x2 Grid) */}
          <div style={{ marginBottom: '1.8rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.8rem',
              fontWeight: 700,
              color: '#94A3B8',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginBottom: '0.75rem'
            }}>
              I'm entering as
            </label>

            <div className="portal-gateway-roles-grid">
              {roles.map((r) => {
                const RoleIcon = r.icon;
                const isSelected = selectedRole === r.id;

                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handleRoleSelect(r.id)}
                    className="portal-role-button"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.4rem',
                      padding: '1rem',
                      borderRadius: '0.85rem',
                      background: isSelected 
                        ? `linear-gradient(135deg, ${r.accentColor}18, ${r.secondaryColor}08)`
                        : 'rgba(255, 255, 255, 0.025)',
                      border: isSelected 
                        ? `1.5px solid ${r.accentColor}` 
                        : '1px solid rgba(255, 255, 255, 0.08)',
                      color: isSelected ? '#FFFFFF' : '#94A3B8',
                      cursor: 'pointer',
                      transition: 'all 0.22s ease',
                      boxShadow: isSelected ? `0 0 20px ${r.accentColor}25` : 'none',
                      textAlign: 'left'
                    }}
                  >
                    <div className="portal-role-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <div className="portal-role-icon-box" style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: isSelected ? `${r.accentColor}25` : 'rgba(255, 255, 255, 0.05)',
                        border: `1px solid ${isSelected ? r.accentColor : 'rgba(255, 255, 255, 0.1)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isSelected ? r.accentColor : '#64748B'
                      }}>
                        <RoleIcon size={16} />
                      </div>

                      {isSelected && (
                        <div className="portal-role-badge-indicator" style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: r.accentColor,
                          boxShadow: `0 0 8px ${r.accentColor}`
                        }} />
                      )}
                    </div>

                    <div className="portal-role-content">
                      <div className="portal-role-title" style={{
                        fontSize: '0.9rem',
                        fontWeight: 800,
                        color: isSelected ? '#FFFFFF' : '#CBD5E1',
                        letterSpacing: '-0.01em'
                      }}>
                        {r.title}
                      </div>
                      <div className="portal-role-subtitle" style={{
                        fontSize: '0.72rem',
                        color: isSelected ? r.accentColor : '#64748B',
                        fontWeight: 600
                      }}>
                        {r.subtitle}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mode Switcher: One-Click Instant Access vs Custom Email Sign In */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.07)',
            borderRadius: '0.65rem',
            padding: '4px',
            marginBottom: '1.5rem'
          }}>
            <button
              type="button"
              onClick={() => setAuthMode('quick')}
              style={{
                flex: 1,
                padding: '0.5rem',
                borderRadius: '0.5rem',
                border: 'none',
                background: authMode === 'quick' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                color: authMode === 'quick' ? '#FFFFFF' : '#64748B',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              1-Click Demo Access
            </button>

            <button
              type="button"
              onClick={() => setAuthMode('email')}
              style={{
                flex: 1,
                padding: '0.5rem',
                borderRadius: '0.5rem',
                border: 'none',
                background: authMode === 'email' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                color: authMode === 'email' ? '#FFFFFF' : '#64748B',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Custom Credentials
            </button>
          </div>

          {/* Form / Quick Action Area */}
          <form onSubmit={handleLaunch} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {errorMsg && (
              <div style={{
                padding: '0.75rem 1rem',
                borderRadius: '0.6rem',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#F87171',
                fontSize: '0.82rem'
              }}>
                {errorMsg}
              </div>
            )}

            {/* Custom Email Form (if active) */}
            {authMode === 'email' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}
              >
                {isSignUp && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94A3B8', marginBottom: '0.4rem' }}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Alex Chen"
                      style={{
                        width: '100%',
                        padding: '0.8rem 1rem',
                        borderRadius: '0.75rem',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#FFFFFF',
                        fontSize: '0.9rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94A3B8', marginBottom: '0.4rem' }}>
                    Email
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} color="#64748B" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@startupiq.io"
                      required
                      style={{
                        width: '100%',
                        padding: '0.8rem 1rem 0.8rem 2.6rem',
                        borderRadius: '0.75rem',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#FFFFFF',
                        fontSize: '0.9rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94A3B8', marginBottom: '0.4rem' }}>
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} color="#64748B" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      style={{
                        width: '100%',
                        padding: '0.8rem 2.6rem',
                        borderRadius: '0.75rem',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#FFFFFF',
                        fontSize: '0.9rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '1rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#64748B',
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 0.2rem' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      setErrorMsg('');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: currentRoleConfig.accentColor,
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
                  </button>
                  <span style={{ fontSize: '0.74rem', color: '#64748B' }}>
                    Role: {currentRoleConfig.title}
                  </span>
                </div>
              </motion.div>
            )}

            {/* Quick Demo Profile Card (if 1-click mode) */}
            {authMode === 'quick' && (
              <div style={{
                padding: '0.85rem 1.1rem',
                borderRadius: '0.75rem',
                background: 'rgba(255, 255, 255, 0.025)',
                border: '1px solid rgba(255, 255, 255, 0.07)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#FFFFFF' }}>
                    Preconfigured Profile: {currentRoleConfig.demoUser.name}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#64748B' }}>
                    {currentRoleConfig.demoUser.email} • Direct Role Isolation
                  </div>
                </div>

                <div style={{
                  padding: '0.25rem 0.65rem',
                  borderRadius: '9999px',
                  background: currentRoleConfig.badgeBg,
                  color: currentRoleConfig.accentColor,
                  fontSize: '0.7rem',
                  fontWeight: 800
                }}>
                  Instant
                </div>
              </div>
            )}

            {/* Primary Launch Action Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.85rem 1rem',
                borderRadius: '0.85rem',
                border: 'none',
                background: `linear-gradient(135deg, ${currentRoleConfig.accentColor}, ${currentRoleConfig.secondaryColor})`,
                color: '#FFFFFF',
                fontSize: 'clamp(0.85rem, 3.5vw, 0.96rem)',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: loading ? 'wait' : 'pointer',
                boxShadow: `0 8px 24px ${currentRoleConfig.accentColor}40`,
                transition: 'all 0.22s ease',
                opacity: loading ? 0.7 : 1
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                if (!loading) e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <span>{loading ? 'Initializing...' : `Launch ${currentRoleConfig.title} Workspace`}</span>
              <ArrowRight size={18} />
            </button>
          </form>

          {/* Social Google or Alternate Action */}
          <div style={{
            marginTop: '1.2rem',
            textAlign: 'center'
          }}>
            <button
              type="button"
              onClick={handleLaunch}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748B',
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#94A3B8'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#64748B'}
            >
              <span>Or sign in with Google Workspace</span>
            </button>
          </div>
        </div>
        <OnboardingModal
          isOpen={isOnboardingOpen}
          onClose={() => setIsOnboardingOpen(false)}
          initialRole={selectedRole}
          currentUser={pendingAuthUser || currentUser}
          onCompleteRouting={handleCompleteOnboarding}
        />
      </div>
    </div>
  );
}
