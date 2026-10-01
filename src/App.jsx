import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles as SparklesIcon, X as XIcon } from 'lucide-react';

// Layout & Common
import TopCommandBar from './components/layout/TopCommandBar';
import AuroraBackdrop from './components/layout/AuroraBackdrop';
import SearchPalette from './components/common/SearchPalette';
import AuthModal from './components/common/AuthModal';
import PricingModal from './components/common/PricingModal';
import FeaturePaywall from './components/common/FeaturePaywall';

// Founder OS (StartupIQ) Modules
import FounderAssessmentModule from './components/modules/FounderAssessmentModule';
import PortalGatewayModule from './components/modules/PortalGatewayModule';
import OverviewModule from './components/modules/OverviewModule';
import LearningModule from './components/modules/LearningModule';
import TermsLibraryModule from './components/modules/TermsLibraryModule';
import MarketingIndexModule from './components/modules/MarketingIndexModule';
import FinanceFormulasModule from './components/modules/FinanceFormulasModule';
import HealthScoreModule from './components/modules/HealthScoreModule';
import IdeaAnalyzerModule from './components/modules/IdeaAnalyzerModule';
import IdeaTestingModule from './components/modules/IdeaTestingModule';
import GtmRoadmapModule from './components/modules/GtmRoadmapModule';
import FinancialModelModule from './components/modules/FinancialModelModule';
import MetricExplorerModule from './components/modules/MetricExplorerModule';
import ActionPlanModule from './components/modules/ActionPlanModule';
import PromptBuilderModule from './components/modules/PromptBuilderModule';
import MyStartupModule from './components/modules/MyStartupModule';
import ToolsModule from './components/modules/ToolsModule';
import AnalyzeModule from './components/modules/AnalyzeModule';
import CompanyProfileWizardModule from './components/modules/CompanyProfileWizardModule';
import FloatingAICopilot from './components/ai/FloatingAICopilot';

// Actual Investment Module & Deal Room Components
import InvestorPortfolioModule from './components/modules/InvestorPortfolioModule';
import DealRoomModule from './components/modules/DealRoomModule';
import CapTableModule from './components/modules/CapTableModule';
import LedgerModule from './components/modules/LedgerModule';
import WatchlistModule from './components/modules/WatchlistModule';
import DataRoomModule from './components/modules/DataRoomModule';

// Additional Stakeholder Workspace Modules (Section 2 & 3 Compliance)
import AnalystWorkspaceModule from './components/modules/AnalystWorkspaceModule';
import AdvisorWorkspaceModule from './components/modules/AdvisorWorkspaceModule';
import AdminWorkspaceModule from './components/modules/AdminWorkspaceModule';

import { DEFAULT_COMPANY, SAMPLE_COMPANIES } from './data/mockCompany';
import { api, getStoredUser, setStoredUser, getAuthToken, clearAuth } from './api/client';

export default function App() {
  const [engineMode, setEngineMode] = useState('founder'); // 'founder' | 'investor'
  const [activeTab, setActiveTab] = useState('portal');
  const [company, setCompany] = useState(DEFAULT_COMPANY);
  const [selectedTicker, setSelectedTicker] = useState('TELEDU');
  const [companiesList, setCompaniesList] = useState(() => {
    try {
      const map = new Map();
      SAMPLE_COMPANIES.forEach(c => map.set(c.ticker.toUpperCase(), { ...DEFAULT_COMPANY, ...c }));
      const saved = localStorage.getItem('startupi_custom_companies');
      if (saved) {
        const parsed = JSON.parse(saved);
        parsed.forEach(c => {
          const base = map.get(c.ticker.toUpperCase()) || DEFAULT_COMPANY;
          map.set(c.ticker.toUpperCase(), { ...base, ...c });
        });
      }
      return Array.from(map.values());
    } catch (e) {}
    return SAMPLE_COMPANIES;
  });

  const handleAddNewCompany = async (newComp) => {
    const cleanTicker = (newComp.ticker || 'NEW').trim().toUpperCase();
    const cleanName = (newComp.companyName || newComp.name || cleanTicker).trim();

    const formatted = {
      ...DEFAULT_COMPANY,
      ...newComp,
      ticker: cleanTicker,
      name: cleanName,
      companyName: cleanName,
      stage: newComp.stage || 'Seed',
      industry: newComp.industry || 'Technology & Growth',
      businessModel: newComp.businessModel || 'B2B SaaS / Subscription',
      revenueModel: newComp.revenueModel || 'Monthly subscription',
      targetCustomer: newComp.targetCustomer || 'Enterprise and growth companies',
      monthlyRevenue: Number(newComp.monthlyRevenue) || 30000,
      mrr: Number(newComp.mrr || newComp.monthlyRevenue) || 30000,
      monthlyBurn: Number(newComp.monthlyBurn) || 18000,
      cashAvailable: Number(newComp.cashAvailable) || 250000,
      cac: Number(newComp.cac) || 400,
      ltv: Number(newComp.ltv) || 1800,
      churnRate: Number(newComp.churnRate) || 2.8,
      conversionRate: Number(newComp.conversionRate) || 4.2,
      grossMargin: Number(newComp.grossMargin) || 75,
      growthRate: Number(newComp.growthRate) || 16,
      customers: Number(newComp.customers) || 150
    };

    setCompaniesList(prev => {
      const filtered = prev.filter(c => c.ticker.toUpperCase() !== cleanTicker);
      const updated = [...filtered, formatted];
      try {
        localStorage.setItem('startupi_custom_companies', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    try {
      await api.createCompany({
        companyName: cleanName,
        ticker: cleanTicker,
        stage: formatted.stage,
        industry: formatted.industry,
        monthlyRevenue: formatted.monthlyRevenue,
        monthlyBurn: formatted.monthlyBurn,
        cashAvailable: formatted.cashAvailable
      }).catch(() => null);
    } catch (e) {}

    setSelectedTicker(cleanTicker);
    setCompany(formatted);
  };

  const handleUpdateCompany = async (updates) => {
    // 1. Immediately update active company state
    setCompany(prev => ({
      ...prev,
      ...updates,
      monthlyRevenue: Number(updates.monthlyRevenue ?? prev.monthlyRevenue),
      mrr: Number(updates.mrr ?? updates.monthlyRevenue ?? prev.mrr),
      monthlyBurn: Number(updates.monthlyBurn ?? prev.monthlyBurn),
      cashAvailable: Number(updates.cashAvailable ?? prev.cashAvailable),
      growthRate: Number(updates.growthRate ?? prev.growthRate),
      grossMargin: Number(updates.grossMargin ?? prev.grossMargin),
      customers: Number(updates.customers ?? prev.customers),
      cac: Number(updates.cac ?? prev.cac),
      ltv: Number(updates.ltv ?? prev.ltv)
    }));

    // 2. Persist in companiesList and localStorage
    setCompaniesList(list => {
      const targetTicker = selectedTicker.toUpperCase();
      let found = false;
      const updated = list.map(c => {
        if (c.ticker.toUpperCase() === targetTicker) {
          found = true;
          return { ...c, ...updates };
        }
        return c;
      });
      const finalList = found ? updated : [...updated, { ticker: targetTicker, ...updates }];
      try {
        localStorage.setItem('startupi_custom_companies', JSON.stringify(finalList));
      } catch (e) {}
      return finalList;
    });

    // 3. Persist to backend API (if authenticated / company exists)
    try {
      await api.updateProfile(selectedTicker, updates).catch(() => null);
    } catch (e) {}
  };
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [welcomeToast, setWelcomeToast] = useState(null);
  const [currentUser, setCurrentUser] = useState(getStoredUser());
  const [apiConnected, setApiConnected] = useState(false);
  const [healthScore, setHealthScore] = useState(78);

  // If a legacy link or state requests 'prompt-builder', open floating AI and default to overview
  useEffect(() => {
    if (activeTab === 'prompt-builder' || activeTab === 'promptBuilder') {
      setIsAIOpen(true);
      setActiveTab('overview');
    }
  }, [activeTab]);

  // Synchronize active workspace with authenticated user role (Role-Isolation Enforcement)
  useEffect(() => {
    if (currentUser) {
      const assignedRole = (currentUser.onboarding?.assignedWorkspace || currentUser.role || 'founder').toLowerCase();
      if (['founder', 'investor', 'analyst', 'advisor', 'admin', 'super_admin'].includes(assignedRole)) {
        setEngineMode(assignedRole);
      }
    } else {
      setEngineMode('founder');
    }
  }, [currentUser]);

  // Restore authenticated user session on mount
  useEffect(() => {
    async function restoreSession() {
      const token = getAuthToken();
      if (!token) return;
      try {
        const user = await api.auth.getMe();
        if (user && user.role) {
          setCurrentUser(user);
          setApiConnected(true);

          // If user already completed onboarding, resume their configured workspace & tab!
          if (user.onboarding && user.onboarding.completed && user.onboarding.assignedTab) {
            const role = user.onboarding.assignedWorkspace || user.role;
            setEngineMode(role);
            setActiveTab(user.onboarding.assignedTab);
            if (user.onboarding.routingReason) {
              setWelcomeToast({
                text: user.onboarding.routingReason,
                role,
                tab: user.onboarding.assignedTab
              });
            }
          }
        }
      } catch (err) {
        console.warn('Session expired or invalid token:', err.message);
        clearAuth();
        setCurrentUser(null);
      }
    }
    restoreSession();
  }, []);

  // Fetch available companies from backend API
  useEffect(() => {
    async function loadBackendCompanies() {
      try {
        const data = await api.getCompanies().catch(() => null);
        if (Array.isArray(data) && data.length > 0) {
          setCompaniesList(prev => {
            const map = new Map();
            prev.forEach(c => map.set(c.ticker.toUpperCase(), c));
            data.forEach(c => {
              if (c.ticker) {
                const existing = map.get(c.ticker.toUpperCase()) || DEFAULT_COMPANY;
                map.set(c.ticker.toUpperCase(), {
                  ...existing,
                  ...c,
                  ticker: c.ticker.toUpperCase(),
                  companyName: c.companyName || c.name || existing.companyName,
                  name: c.companyName || c.name || existing.name,
                  monthlyRevenue: Number(c.monthlyRevenue ?? c.currentRevenue ?? existing.monthlyRevenue),
                  mrr: Number(c.mrr ?? c.monthlyRevenue ?? c.currentRevenue ?? existing.mrr),
                  monthlyBurn: Number(c.monthlyBurn ?? c.monthlyExpenses ?? existing.monthlyBurn),
                  cashAvailable: Number(c.cashAvailable ?? c.cashBalance ?? existing.cashAvailable),
                  growthRate: Number(c.growthRate ?? c.revenueGrowthRate ?? existing.growthRate),
                  grossMargin: Number(c.grossMargin ?? existing.grossMargin),
                  stage: c.stage || existing.stage || 'Seed',
                  industry: c.industry || existing.industry || 'Technology & Growth'
                });
              }
            });
            return Array.from(map.values());
          });
        }
      } catch (e) {
        console.warn('Backend companies load fallback:', e.message);
      }
    }
    loadBackendCompanies();
  }, [currentUser]);

  // Fetch live company profile and health score
  useEffect(() => {
    async function fetchCompanyData() {
      try {
        const localTarget = companiesList.find(c => c.ticker.toUpperCase() === selectedTicker.toUpperCase())
          || SAMPLE_COMPANIES.find(c => c.ticker.toUpperCase() === selectedTicker.toUpperCase())
          || DEFAULT_COMPANY;

        const profileRes = await api.getProfile(selectedTicker).catch(() => null);
        const profile = profileRes && profileRes.company ? profileRes.company : profileRes;

        if (profile && (profile.companyName || profile.name)) {
          const normalized = {
            ...DEFAULT_COMPANY,
            ...localTarget,
            ...profile,
            ticker: (profile.ticker || selectedTicker).toUpperCase(),
            name: profile.companyName || profile.name || localTarget.name,
            companyName: profile.companyName || profile.name || localTarget.companyName,
            monthlyRevenue: Number(profile.monthlyRevenue ?? profile.currentRevenue ?? localTarget.monthlyRevenue ?? 28000),
            mrr: Number(profile.mrr ?? profile.monthlyRevenue ?? profile.currentRevenue ?? localTarget.mrr ?? 28000),
            monthlyBurn: Number(profile.monthlyBurn ?? profile.monthlyExpenses ?? localTarget.monthlyBurn ?? 18000),
            cashAvailable: Number(profile.cashAvailable ?? profile.cashBalance ?? localTarget.cashAvailable ?? 165000),
            growthRate: Number(profile.growthRate ?? profile.revenueGrowthRate ?? localTarget.growthRate ?? 14),
            grossMargin: Number(profile.grossMargin ?? localTarget.grossMargin ?? 72),
            customers: Number(profile.customers ?? localTarget.customers ?? 240),
            cac: Number(profile.cac ?? localTarget.cac ?? 120),
            ltv: Number(profile.ltv ?? localTarget.ltv ?? 560),
            churnRate: Number(profile.churnRate ?? profile.customerChurnRate ?? localTarget.churnRate ?? 3.2),
            stage: profile.stage || localTarget.stage || 'Seed',
            industry: profile.industry || localTarget.industry || 'Technology & Growth'
          };
          setCompany(normalized);
          setApiConnected(true);
        } else {
          // When fallback/mock or unauthenticated, replace company state completely with local target
          setCompany({
            ...DEFAULT_COMPANY,
            ...localTarget
          });
        }

        const healthRes = await api.getHealthScore(selectedTicker).catch(() => null);
        if (healthRes && healthRes.overallScore) {
          setHealthScore(healthRes.overallScore);
        }
      } catch (e) {
        console.warn('Live profile fetch fallback:', e.message);
      }
    }
    fetchCompanyData();
  }, [selectedTicker, currentUser]);

  const handleLogout = async () => {
    await api.auth.logout();
    setCurrentUser(null);
    setApiConnected(false);
  };

  const handleSelectCompanyInDealRoom = (ticker) => {
    setSelectedTicker(ticker);
    setEngineMode('investor');
    setActiveTab('cap-table');
  };

  const renderModule = () => {
    switch (activeTab) {
            // --- 4-OPTION INITIAL GATEWAY PORTAL ---
      case 'portal':
      case 'gateway':
        return (
          <PortalGatewayModule
            onSelectRole={(role, defaultTab, user, routingReason) => {
              const assignedRole = role || user?.role || 'founder';
              if (user) {
                const userWithAssigned = {
                  ...user,
                  role: assignedRole,
                  onboarding: {
                    ...(user.onboarding || {}),
                    completed: true,
                    assignedWorkspace: assignedRole,
                    assignedTab: defaultTab
                  }
                };
                setCurrentUser(userWithAssigned);
                setStoredUser(userWithAssigned);
                setApiConnected(true);
              }
              setEngineMode(assignedRole);
              setActiveTab(defaultTab);
              if (routingReason) {
                setWelcomeToast({ text: routingReason, role: assignedRole, tab: defaultTab });
              }
            }}
            onEnterGuest={() => {
              setEngineMode('founder');
              setActiveTab('overview');
            }}
            currentUser={currentUser}
            company={company}
          />
        );

      // --- FOUNDER OS (STARTUPIQ) ---
      case 'overview':
        return <OverviewModule onNavigate={setActiveTab} company={company} healthScore={healthScore} onOpenAI={() => setIsAIOpen(true)} onUpdateCompany={handleUpdateCompany} />;
      case 'learning':
      case 'curriculum':
        return <LearningModule company={company} currentUser={currentUser} onOpenPricing={() => setIsPricingOpen(true)} />;
      case 'terms':
        return <TermsLibraryModule onNavigateToPrompt={() => setIsAIOpen(true)} />;
      case 'founder-assessment':
      case 'founderAssessment':
        return (
          <FounderAssessmentModule
            company={company}
            onStatusUpdated={(newStatus) => {
              setCompany(prev => ({ ...prev, status: newStatus }));
            }}
          />
        );
      case 'idea-analyzer':
      case 'ideaAnalyzer':
        return <IdeaAnalyzerModule company={company} />;
      case 'idea-testing':
      case 'ideaTesting':
        return <IdeaTestingModule company={company} />;
      case 'gtm':
      case 'gtmRoadmap':
      case 'audienceRoadmap':
      case 'audience-roadmap':
        return <AnalyzeModule company={company} onNavigate={setActiveTab} defaultTab="audienceRoadmap" />;
      case 'action-plan':
      case 'actionPlan':
        return (
          <FeaturePaywall
            requiredPlan="founder_pro"
            featureName="30-Day Founder Action Plan"
            featureDescription="An automated, tactical execution roadmap generated directly from your startup's weakest health percentiles and unit economics."
            benefits={[
              "Weekly step-by-step milestone execution sprints",
              "Targeted burn-rate reduction and CAC payback playbooks",
              "Direct alignment with Seed & Series A investor diligence criteria"
            ]}
            currentUser={currentUser}
            onOpenPricing={() => setIsPricingOpen(true)}
          >
            <ActionPlanModule
              company={company}
              onUpdateCompany={(updated) => setCompany(prev => ({ ...prev, ...updated }))}
            />
          </FeaturePaywall>
        );
      case 'financial-model':
      case 'financialModel':
        return <FinancialModelModule company={company} />;
      // --- TOOLS & CALCULATOR STUDIO ECOSYSTEM ---
      case 'tools':
      case 'tools-hub':
      case 'calculator-studio':
      case 'calculatorStudio':
        return <ToolsModule company={company} onNavigate={setActiveTab} onUpdateCompany={handleUpdateCompany} defaultTab="calc" />;
      case 'formulas':
      case 'financeFormulas':
      case 'finance-formulas':
        return <ToolsModule company={company} onNavigate={setActiveTab} onUpdateCompany={handleUpdateCompany} defaultTab="finance" />;
      case 'what-if':
      case 'whatif':
      case 'scenario-simulator':
        return <ToolsModule company={company} onNavigate={setActiveTab} onUpdateCompany={handleUpdateCompany} defaultTab="whatif" />;
      case '12mo-model':
      case 'monthly-financial-model':
        return <ToolsModule company={company} onNavigate={setActiveTab} onUpdateCompany={handleUpdateCompany} defaultTab="model12" />;
      case 'metrics':
      case 'metricExplorer':
        return <ToolsModule company={company} onNavigate={setActiveTab} onUpdateCompany={handleUpdateCompany} defaultTab="metrics" />;
      case 'analyze':
      case 'analyze-hub':
      case 'health-score':
      case 'health':
        return <AnalyzeModule company={company} onNavigate={setActiveTab} defaultTab="health" />;
      case 'prompt-builder':
      case 'promptBuilder':
        return <OverviewModule onNavigate={setActiveTab} company={company} healthScore={healthScore} onOpenAI={() => setIsAIOpen(true)} onUpdateCompany={handleUpdateCompany} />;
      case 'marketing':
        return <MarketingIndexModule />;
      case 'profile-wizard':
      case 'profileWizard':
      case 'wizard':
      case 'myStartup':
      case 'my-startup':
      case 'company-profile':
        return <CompanyProfileWizardModule company={company} onUpdateCompany={handleUpdateCompany} onNavigate={setActiveTab} />;

      // --- INVESTOR OS (ACTUAL INVESTMENT MODULE) ---
      case 'investor-portfolio':
        return <InvestorPortfolioModule onSelectCompany={handleSelectCompanyInDealRoom} onAddCompany={handleAddNewCompany} />;
      case 'deal-room':
        return <DealRoomModule onSelectCompany={handleSelectCompanyInDealRoom} activeCompany={company} />;
      case 'cap-table':
        return <CapTableModule activeTicker={selectedTicker} />;
      case 'ledger':
        return <LedgerModule activeTicker={selectedTicker} />;
      case 'watchlist':
        return <WatchlistModule onSelectCompany={handleSelectCompanyInDealRoom} />;

      // --- ANALYST WORKSPACE ---
      case 'analyst-workspace':
        return <AnalystWorkspaceModule activeCompany={company} onSelectCompany={handleSelectCompanyInDealRoom} />;

      // --- ADVISOR WORKSPACE ---
      case 'advisor-workspace':
        return <AdvisorWorkspaceModule activeCompany={company} />;

      // --- ADMIN & SUPER ADMIN WORKSPACE ---
      case 'admin-workspace':
      case 'admin-audit':
      case 'admin-security':
        return <AdminWorkspaceModule currentUser={currentUser} />;
      case 'data-room':
        return (
          <FeaturePaywall
            requiredPlan={['founder_pro', 'investor_pro']}
            featureName="Virtual Data Room (VDR) & Confidential Vault"
            featureDescription="Institutional repository storing audited financial statements, historical cap tables, KYC filings, and proprietary IP agreements."
            benefits={[
              "Access to audited financial balance sheets and tax filings",
              "Secure download of pitch decks and legal incorporation contracts",
              "Granular permission logs and investor activity tracking"
            ]}
            currentUser={currentUser}
            onOpenPricing={() => setIsPricingOpen(true)}
          >
            <DataRoomModule activeTicker={selectedTicker} />
          </FeaturePaywall>
        );

      default:
        return (
          <OverviewModule 
            onNavigate={setActiveTab} 
            company={company} 
            healthScore={healthScore} 
            onOpenAI={() => setIsAIOpen(true)} 
            onUpdateCompany={handleUpdateCompany} 
          />
        );
    }
  };

  return (
    <div className="command-layout">
      <AuroraBackdrop engineMode={engineMode} />

      {/* Top Command Bar & Horizontal Navigation */}
      <TopCommandBar
        engineMode={engineMode}
        setEngineMode={setEngineMode}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedCompany={selectedTicker}
        setSelectedCompany={setSelectedTicker}
        companies={companiesList}
        onAddCompany={handleAddNewCompany}
        apiConnected={apiConnected}
        onOpenSearch={() => setIsSearchOpen(true)}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onOpenPricing={() => setIsPricingOpen(true)}
        onOpenPortal={() => setActiveTab('portal')}
      />

      {/* Full-Width Canvas */}
      <main className="command-canvas">
        {welcomeToast && activeTab !== 'portal' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              margin: '0 0 1.25rem 0',
              padding: '0.9rem 1.25rem',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(16, 185, 129, 0.12) 100%)',
              border: '1px solid rgba(129, 140, 248, 0.35)',
              backdropFilter: 'blur(16px)',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              zIndex: 40
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(99, 102, 241, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#818CF8',
                flexShrink: 0
              }}>
                <SparklesIcon size={16} />
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#A5B4FC', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Smart Routing Activated
                </div>
                <div style={{ fontSize: '0.88rem', color: '#E2E8F0', fontWeight: 500 }}>
                  {welcomeToast.text}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setWelcomeToast(null)}
              style={{
                background: 'none',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <XIcon size={16} />
            </button>
          </motion.div>
        )}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10, scale: 0.995 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.995 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            {renderModule()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Command Palette (Ctrl+K) */}
      <SearchPalette
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectTerm={(term) => {
          setEngineMode('founder');
          setActiveTab('terms');
        }}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          setApiConnected(true);
        }}
      />

      {/* Subscription & Razorpay Pricing Modal */}
      <PricingModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
        currentUser={currentUser}
        onUpgradeSuccess={(user) => {
          setCurrentUser(user);
        }}
      />

      {/* Global Floating AI Copilot (Accessible from anywhere) */}
      <FloatingAICopilot
        isOpen={isAIOpen}
        setIsOpen={setIsAIOpen}
        company={company}
      />
    </div>
  );
}
