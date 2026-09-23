import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Briefcase, Compass, BarChart3, BookOpen, Calculator,
  TrendingUp, ArrowRight, ArrowLeft, CheckCircle2, Shield, 
  HelpCircle, Award, Target, X, Zap
} from 'lucide-react';
import { api } from '../../api/client';

export default function OnboardingModal({ 
  isOpen, 
  onClose, 
  initialRole = 'founder', 
  currentUser = null,
  onCompleteRouting 
}) {
  const [step, setStep] = useState(1);
  const [knowledge, setKnowledge] = useState(''); // 'beginner' | 'intermediate' | 'advanced'
  const [experience, setExperience] = useState(''); // '0-1' | '1-3' | '3+'
  const [objective, setObjective] = useState(''); // role-specific key
  const [isRouting, setIsRouting] = useState(false);

  if (!isOpen) return null;

  // Role themes
  const roleThemeMap = {
    founder: { name: 'Founder + Academic', color: '#6366F1', bg: 'rgba(99, 102, 241, 0.12)', border: 'rgba(99, 102, 241, 0.35)', icon: Sparkles },
    investor: { name: 'Investor', color: '#10B981', bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.35)', icon: Briefcase },
    advisor: { name: 'Advisor', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.35)', icon: Compass },
    analyst: { name: 'Analyst', color: '#06B6D4', bg: 'rgba(6, 182, 212, 0.12)', border: 'rgba(6, 182, 212, 0.35)', icon: BarChart3 },
  };
  const theme = roleThemeMap[initialRole] || roleThemeMap.founder;
  const RoleIcon = theme.icon;

  // Question 3 Objectives per selected role
  const objectivesMap = {
    founder: [
      { id: 'learn', label: 'Master startup fundamentals & frameworks', sub: 'Study 30 business lessons, terms & unit economic formulas', icon: BookOpen, tag: 'Academic Track' },
      { id: 'validate', label: 'Validate problem urgency & test lean hypotheses', sub: 'Run 6-stage RAT validation & assess market size', icon: Target, tag: 'Validation Lab' },
      { id: 'fundraise', label: 'Build 5-year financial model & prepare investor diligence', sub: 'DCF enterprise valuation, revenue compounding & investor deck', icon: TrendingUp, tag: 'Fundraising' },
    ],
    investor: [
      { id: 'learn', label: 'Learn angel investing & due diligence fundamentals', sub: 'Master term sheets, SAFE notes, valuation metrics & cap tables', icon: BookOpen, tag: 'Academy & Terms' },
      { id: 'portfolio', label: 'Manage active venture portfolio & screen deal flow', sub: 'Track MRR, runway, burn multiple & stage incoming deals', icon: Briefcase, tag: 'Portfolio Hub' },
      { id: 'cap_table', label: 'Simulate cap table dilution & audit ledgers', sub: 'Model liquidation preferences, waterfalls & double-entry ledgers', icon: Calculator, tag: 'Cap Table Matrix' },
    ],
    advisor: [
      { id: 'learn', label: 'Study venture mentorship & evaluation frameworks', sub: 'Review competency rubrics, health benchmarks & curriculum', icon: BookOpen, tag: 'Frameworks' },
      { id: 'milestones', label: 'Track founder quarterly OKRs & health scores', sub: 'Conduct founder alignment sessions & monitor execution', icon: Compass, tag: 'Advisory Cockpit' },
      { id: 'governance', label: 'Supervise institutional governance & diligence compliance', sub: 'Oversee board governance, cap tables & milestone sign-offs', icon: Shield, tag: 'Governance' },
    ],
    analyst: [
      { id: 'learn', label: 'Study financial formulas & valuation calculators', sub: 'Master 30 finance calculators, liquidity ratios & turnover', icon: Calculator, tag: 'Formulas Library' },
      { id: 'screener', label: 'Screen startups & run DCF sensitivity stress-tests', sub: 'Model growth scenarios, discount rates & peer benchmarks', icon: BarChart3, tag: 'Diligence Screener' },
      { id: 'waterfall', label: 'Model liquidation preference & equity distribution', sub: 'Evaluate participating preferred returns & exit waterfalls', icon: TrendingUp, tag: 'Waterfall Matrix' },
    ]
  };

  const objectives = objectivesMap[initialRole] || objectivesMap.founder;

  // Deterministic routing calculation
  const calculateRoute = () => {
    // 1. FOUNDER + ACADEMIC
    if (initialRole === 'founder') {
      if (knowledge === 'beginner' || experience === '0-1' || objective === 'learn') {
        return {
          role: 'founder',
          tab: 'learning',
          badge: 'Business Academy Track',
          headline: 'Configured: 30-Lesson Business Learning Curriculum',
          reason: 'As a first-time founder building venture knowledge, we have routed you directly to the 30-Lesson Business Academy & Terms Library to build foundational mastery.'
        };
      }
      if (knowledge === 'advanced' && objective === 'fundraise') {
        return {
          role: 'founder',
          tab: 'financial-model',
          badge: '5-Year Financial Model',
          headline: 'Configured: 5-Year DCF Financial Model & Valuation',
          reason: 'With advanced financial experience, you have been routed directly to the 5-Year DCF Financial Model to prepare institutional investor materials.'
        };
      }
      return {
        role: 'founder',
        tab: 'overview',
        badge: 'Founder OS Cockpit',
        headline: 'Configured: Founder OS Overview Cockpit',
        reason: 'Your personalized Founder Cockpit is initialized with health score metrics, lean testing, and valuation tools.'
      };
    }

    // 2. INVESTOR
    if (initialRole === 'investor') {
      if (knowledge === 'beginner' || experience === '0-1' || objective === 'learn') {
        return {
          role: 'founder',
          tab: 'learning',
          badge: 'Diligence Academy',
          headline: 'Configured: Due Diligence & Valuation Academy',
          reason: 'Welcome to Venture Capital! As a new investor, we have routed you to the Due Diligence & Valuation Academy to master startup terms and cap tables before allocating capital.'
        };
      }
      if (objective === 'cap_table' || knowledge === 'advanced') {
        return {
          role: 'investor',
          tab: 'cap-table',
          badge: 'Cap Table Waterfall',
          headline: 'Configured: Dynamic Cap Table & Waterfall Simulations',
          reason: 'Routed directly to the Cap Table dilution matrix and transaction ledger for institutional investment structuring.'
        };
      }
      return {
        role: 'investor',
        tab: 'investor-portfolio',
        badge: 'Investor Portfolio',
        headline: 'Configured: Multi-Company Portfolio & Deal Room',
        reason: 'Your institutional Investor Portfolio and Live Deal Room pipeline are ready for active capital management.'
      };
    }

    // 3. ADVISOR
    if (initialRole === 'advisor') {
      if (knowledge === 'beginner' || experience === '0-1' || objective === 'learn') {
        return {
          role: 'founder',
          tab: 'learning',
          badge: 'Advisory Frameworks',
          headline: 'Configured: Venture Mentorship Knowledge Base',
          reason: 'Routed to StartupIQ venture benchmarks and lesson tracks to ground your advisory methodology in standardized institutional metrics.'
        };
      }
      return {
        role: 'advisor',
        tab: 'advisor-workspace',
        badge: 'Advisory Cockpit',
        headline: 'Configured: Executive Advisory Board Cockpit',
        reason: 'Your Advisory Cockpit is ready to track founder quarterly OKRs, review health diagnostics, and verify milestones.'
      };
    }

    // 4. ANALYST
    if (initialRole === 'analyst') {
      if (knowledge === 'beginner' || experience === '0-1' || objective === 'learn') {
        return {
          role: 'founder',
          tab: 'formulas',
          badge: 'Finance Formulas Library',
          headline: 'Configured: 30 Financial Formulas & Valuation Calculators',
          reason: 'As an aspiring research analyst, you have been routed to the 30 Financial Formulas & Calculators library to master profitability and DCF mechanics.'
        };
      }
      return {
        role: 'analyst',
        tab: 'analyst-workspace',
        badge: 'Diligence Screener',
        headline: 'Configured: Venture Diligence Screener & Sensitivity Matrix',
        reason: 'Your quantitative diligence workbench is initialized with burn multiples, DCF sensitivity, and peer cohort comparisons.'
      };
    }

    return {
      role: initialRole,
      tab: 'overview',
      badge: 'Default Workspace',
      headline: 'Configured Workspace',
      reason: 'Initialized your tailored environment.'
    };
  };

  const handleFinish = async () => {
    const route = calculateRoute();
    setIsRouting(true);

    let updatedUser = currentUser;
    try {
      const res = await api.auth.saveOnboarding({
        investmentKnowledge: knowledge,
        experienceYears: experience,
        primaryObjective: objective,
        assignedWorkspace: route.role,
        assignedTab: route.tab,
        routingReason: route.reason
      });
      if (res) {
        updatedUser = res;
      }
    } catch (err) {
      console.warn('Could not persist onboarding to API:', err.message);
    }

    setTimeout(() => {
      onCompleteRouting(route, updatedUser);
    }, 900);
  };

  const handleSkip = async () => {
    const route = {
      role: initialRole,
      tab: initialRole === 'investor' ? 'investor-portfolio' : (initialRole === 'advisor' ? 'advisor-workspace' : (initialRole === 'analyst' ? 'analyst-workspace' : 'overview')),
      badge: 'Default Workspace',
      headline: 'Standard Configuration',
      reason: 'Welcome to your default workspace environment.'
    };

    let updatedUser = currentUser;
    try {
      const res = await api.auth.saveOnboarding({
        investmentKnowledge: 'standard',
        experienceYears: '1-3',
        primaryObjective: 'default',
        assignedWorkspace: route.role,
        assignedTab: route.tab,
        routingReason: route.reason
      });
      if (res) {
        updatedUser = res;
      }
    } catch (err) {}

    onCompleteRouting(route, updatedUser);
  };

  const recommendedRoute = calculateRoute();

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      background: 'rgba(3, 7, 18, 0.85)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)'
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        style={{
          width: '100%',
          maxWidth: '680px',
          background: '#0B1120',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '1.5rem',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Top Progress & Header Bar */}
        <div style={{
          padding: '1.8rem 2.2rem 1.2rem 2.2rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.3rem 0.75rem',
              borderRadius: '9999px',
              background: theme.bg,
              border: `1px solid ${theme.border}`,
              color: theme.color,
              fontSize: '0.74rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}>
              <RoleIcon size={13} />
              <span>{theme.name} Onboarding</span>
            </div>

            <button
              type="button"
              onClick={handleSkip}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748B',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#CBD5E1'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#64748B'}
            >
              Skip to Default →
            </button>
          </div>

          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em', marginBottom: '0.3rem' }}>
            Personalize Your Workspace Experience
          </h2>
          <p style={{ fontSize: '0.86rem', color: '#94A3B8', margin: 0 }}>
            Answer 3 quick questions so StartupIQ can configure your dashboard and route you to the optimal tools.
          </p>

          {/* Progress bar */}
          <div style={{
            display: 'flex',
            gap: '8px',
            marginTop: '1.2rem'
          }}>
            {[1, 2, 3].map(s => (
              <div 
                key={s} 
                style={{
                  flex: 1,
                  height: '4px',
                  borderRadius: '2px',
                  background: step >= s ? theme.color : 'rgba(255, 255, 255, 0.08)',
                  transition: 'all 0.3s ease'
                }}
              />
            ))}
          </div>
        </div>

        {/* Question Body */}
        <div style={{ padding: '2rem 2.2rem', minHeight: '320px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {isRouting ? (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                style={{
                  width: '48px',
                  height: '48px',
                  margin: '0 auto 1.5rem auto',
                  borderRadius: '50%',
                  border: `3px solid ${theme.color}33`,
                  borderTopColor: theme.color
                }}
              />
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.5rem' }}>
                {recommendedRoute.headline}
              </h3>
              <p style={{ fontSize: '0.92rem', color: '#94A3B8', maxWidth: '480px', margin: '0 auto', lineHeight: 1.5 }}>
                {recommendedRoute.reason}
              </p>
            </div>
          ) : (
            <div>
              {/* STEP 1: INVESTMENT KNOWLEDGE */}
              {step === 1 && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: theme.color, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
                    Question 1 of 3
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '1.4rem' }}>
                    What is your current level of venture & investment knowledge?
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {[
                      { id: 'beginner', label: 'Beginner / No Prior Knowledge', desc: 'New to venture finance, cap tables, valuation formulas & startup terms' },
                      { id: 'intermediate', label: 'Intermediate Understanding', desc: 'Familiar with seed funding, burn rate, ARR metrics & basic unit economics' },
                      { id: 'advanced', label: 'Advanced / Institutional', desc: 'Experienced in equity dilution, term sheets, DCF models & portfolio management' }
                    ].map(opt => {
                      const isSelected = knowledge === opt.id;
                      return (
                        <div
                          key={opt.id}
                          onClick={() => setKnowledge(opt.id)}
                          style={{
                            padding: '1rem 1.25rem',
                            borderRadius: '0.85rem',
                            background: isSelected ? theme.bg : 'rgba(255, 255, 255, 0.025)',
                            border: isSelected ? `1.5px solid ${theme.color}` : '1px solid rgba(255, 255, 255, 0.08)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}
                        >
                          <div>
                            <div style={{ fontSize: '0.96rem', fontWeight: 700, color: isSelected ? '#FFFFFF' : '#CBD5E1', marginBottom: '0.2rem' }}>
                              {opt.label}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                              {opt.desc}
                            </div>
                          </div>
                          {isSelected && (
                            <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: theme.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', shrink: 0 }}>
                              <CheckCircle2 size={14} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* STEP 2: YEARS OF EXPERIENCE */}
              {step === 2 && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: theme.color, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
                    Question 2 of 3
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '1.4rem' }}>
                    How many years of experience do you have in startups or venture capital?
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {[
                      { id: '0-1', label: '0 – 1 Years', desc: 'First-time founder, student, or aspiring investor exploring early venture concepts' },
                      { id: '1-3', label: '1 – 3 Years', desc: 'Early-stage operational experience, angel backing, or growth-stage involvement' },
                      { id: '3+', label: '3 – 5+ Years', desc: 'Seasoned serial founder, institutional fund allocator, or executive board advisor' }
                    ].map(opt => {
                      const isSelected = experience === opt.id;
                      return (
                        <div
                          key={opt.id}
                          onClick={() => setExperience(opt.id)}
                          style={{
                            padding: '1rem 1.25rem',
                            borderRadius: '0.85rem',
                            background: isSelected ? theme.bg : 'rgba(255, 255, 255, 0.025)',
                            border: isSelected ? `1.5px solid ${theme.color}` : '1px solid rgba(255, 255, 255, 0.08)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}
                        >
                          <div>
                            <div style={{ fontSize: '0.96rem', fontWeight: 700, color: isSelected ? '#FFFFFF' : '#CBD5E1', marginBottom: '0.2rem' }}>
                              {opt.label}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                              {opt.desc}
                            </div>
                          </div>
                          {isSelected && (
                            <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: theme.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', shrink: 0 }}>
                              <CheckCircle2 size={14} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* STEP 3: PRIMARY OBJECTIVE */}
              {step === 3 && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: theme.color, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
                    Question 3 of 3 • Personalized Objective
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '1.4rem' }}>
                    What is your immediate primary objective in the platform?
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {objectives.map(opt => {
                      const OptIcon = opt.icon;
                      const isSelected = objective === opt.id;
                      return (
                        <div
                          key={opt.id}
                          onClick={() => setObjective(opt.id)}
                          style={{
                            padding: '1rem 1.25rem',
                            borderRadius: '0.85rem',
                            background: isSelected ? theme.bg : 'rgba(255, 255, 255, 0.025)',
                            border: isSelected ? `1.5px solid ${theme.color}` : '1px solid rgba(255, 255, 255, 0.08)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '1rem'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
                            <div style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '8px',
                              background: isSelected ? `${theme.color}25` : 'rgba(255, 255, 255, 0.05)',
                              border: `1px solid ${isSelected ? theme.color : 'rgba(255, 255, 255, 0.08)'}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: isSelected ? theme.color : '#64748B',
                              shrink: 0
                            }}>
                              <OptIcon size={18} />
                            </div>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.2rem' }}>
                                <span style={{ fontSize: '0.94rem', fontWeight: 700, color: isSelected ? '#FFFFFF' : '#CBD5E1' }}>
                                  {opt.label}
                                </span>
                                <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '0.15rem 0.45rem', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.06)', color: theme.color }}>
                                  {opt.tag}
                                </span>
                              </div>
                              <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                                {opt.sub}
                              </div>
                            </div>
                          </div>

                          {isSelected && (
                            <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: theme.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', shrink: 0 }}>
                              <CheckCircle2 size={14} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Footer Controls */}
        {!isRouting && (
          <div style={{
            padding: '1.2rem 2.2rem',
            background: 'rgba(255, 255, 255, 0.02)',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <ArrowLeft size={16} /> Back
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                type="button"
                disabled={(step === 1 && !knowledge) || (step === 2 && !experience)}
                onClick={() => setStep(step + 1)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '0.65rem 1.4rem',
                  borderRadius: '0.65rem',
                  background: ((step === 1 && !knowledge) || (step === 2 && !experience)) ? 'rgba(255, 255, 255, 0.1)' : theme.color,
                  color: ((step === 1 && !knowledge) || (step === 2 && !experience)) ? '#64748B' : '#FFFFFF',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  border: 'none',
                  cursor: ((step === 1 && !knowledge) || (step === 2 && !experience)) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Next Question <ArrowRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                disabled={!objective}
                onClick={handleFinish}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '0.65rem 1.5rem',
                  borderRadius: '0.65rem',
                  background: !objective ? 'rgba(255, 255, 255, 0.1)' : `linear-gradient(135deg, ${theme.color}, #8B5CF6)`,
                  color: !objective ? '#64748B' : '#FFFFFF',
                  fontSize: '0.9rem',
                  fontWeight: 800,
                  border: 'none',
                  cursor: !objective ? 'not-allowed' : 'pointer',
                  boxShadow: !objective ? 'none' : `0 4px 18px ${theme.color}44`,
                  transition: 'all 0.2s ease'
                }}
              >
                Launch Tailored Workspace <Zap size={15} />
              </button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
