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
import { api, getStoredUser, getAuthToken, clearAuth } from './api/client';

export default function App() {
  const [engineMode, setEngineMode] = useState('founder'); // 'founder' | 'investor'
  const [activeTab, setActiveTab] = useState('portal');
  const [company, setCompany] = useState(DEFAULT_COMPANY);
  const [selectedTicker, setSelectedTicker] = useState('TELEDU');
  const [companiesList, setCompaniesList] = useState(() => {
    try {
      const saved = localStorage.getItem('startupi_custom_companies');
      if (saved) {
        const parsed = JSON.parse(saved);
        const map = new Map();
        SAMPLE_COMPANIES.forEach(c => map.set(c.ticker.toUpperCase(), c));
        parsed.forEach(c => map.set(c.ticker.toUpperCase(), c));
        return Array.from(map.values());
      }
    } catch (e) {}
    return SAMPLE_COMPANIES;
  });

  const handleAddNewCompany = async (newComp) => {
    const cleanTicker = (newComp.ticker || 'NEW').trim().toUpperCase();
    const cleanName = (newComp.companyName || newComp.name || cleanTicker).trim();

    const formatted = {
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
    setCompany(prev => ({ ...prev, ...formatted }));
  };
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [welcomeToast, setWelcomeToast] = useState(null);
  const [currentUser, setCurrentUser] = useState(getStoredUser());
  const [apiConnected, setApiConnected] = useState(false);
  const [healthScore, setHealthScore] = useState(78);

  // Synchronize active workspace with authenticated user role (Role-Isolation Enforcement)
  useEffect(() => {
    if (currentUser?.role) {
      const r = currentUser.role.toLowerCase();
      if (['founder', 'investor', 'analyst', 'advisor', 'admin', 'super_admin'].includes(r) && activeTab !== 'portal') {
        setEngineMode(r);
        if (r === 'founder') setActiveTab('overview');
        else if (r === 'investor') setActiveTab('investor-portfolio');
        else if (r === 'analyst') setActiveTab('analyst-workspace');
        else if (r === 'advisor') setActiveTab('advisor-workspace');
        else if (r === 'admin' || r === 'super_admin') setActiveTab('admin-workspace');
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

  // Fetch live company profile and health score
  useEffect(() => {
    async function fetchCompanyData() {
      try {
        const profileRes = await api.getProfile(selectedTicker).catch(() => null);
        const profile = profileRes && profileRes.company ? profileRes.company : profileRes;
        if (profile && (profile.companyName || profile.name)) {
          setCompany(prev => ({ ...prev, ...profile }));
          setApiConnected(true);
        } else {
          const custom = companiesList.find(c => c.ticker.toUpperCase() === selectedTicker.toUpperCase());
          if (custom) {
            setCompany(prev => ({ ...prev, ...custom }));
          }
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
              if (user) {
                setCurrentUser(user);
                setApiConnected(true);
              }
              setEngineMode(role);
              setActiveTab(defaultTab);
              if (routingReason) {
                setWelcomeToast({ text: routingReason, role, tab: defaultTab });
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
        return <OverviewModule onNavigate={setActiveTab} company={company} healthScore={healthScore} />;
      case 'learning':
      case 'curriculum':
        return <LearningModule company={company} currentUser={currentUser} onOpenPricing={() => setIsPricingOpen(true)} />;
      case 'terms':
        return <TermsLibraryModule onNavigateToPrompt={() => setActiveTab('prompt-builder')} />;
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
        return <GtmRoadmapModule company={company} />;
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
            <ActionPlanModule company={company} />
          </FeaturePaywall>
        );
      case 'financial-model':
      case 'financialModel':
        return <FinancialModelModule company={company} />;
      case 'metrics':
      case 'metricExplorer':
        return <MetricExplorerModule company={company} />;
      case 'health-score':
      case 'health':
        return <HealthScoreModule company={company} />;
      case 'prompt-builder':
      case 'promptBuilder':
        return <PromptBuilderModule company={company} />;
      case 'formulas':
      case 'financeFormulas':
        return <FinanceFormulasModule />;
      case 'marketing':
        return <MarketingIndexModule />;
      case 'myStartup':
        return <MyStartupModule company={company} onUpdateCompany={(updated) => setCompany(prev => ({ ...prev, ...updated }))} />;

      // --- INVESTOR OS (ACTUAL INVESTMENT MODULE) ---
      case 'investor-portfolio':
        return <InvestorPortfolioModule onSelectCompany={handleSelectCompanyInDealRoom} onAddCompany={handleAddNewCompany} />;
      case 'deal-room':
        return <DealRoomModule onSelectCompany={handleSelectCompanyInDealRoom} />;
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
            requiredPlan="investor_pro"
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
        return <OverviewModule onNavigate={setActiveTab} company={company} healthScore={healthScore} />;
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
    </div>
  );
}
