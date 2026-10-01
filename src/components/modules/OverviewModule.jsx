import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, TrendingUp, Activity, DollarSign, Compass, ShieldCheck, 
  ArrowUpRight, ArrowRight, Zap, Target, BookOpen, Library, 
  FlaskConical, Map, CheckSquare, Calculator, Network, 
  Wand2, HelpCircle, Briefcase, FileSpreadsheet, Bookmark, 
  FolderLock, Layers, BarChart3, Clock, AlertTriangle, CheckCircle2,
  Edit3, X, Save, RefreshCw
} from 'lucide-react';

export default function OverviewModule({ onNavigate, company = {}, healthScore = 84.5, onOpenAI, onUpdateCompany }) {
  const [activeSubTab, setActiveSubTab] = useState('projections'); // 'projections' | 'unit-economics' | 'experiments'
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // Dynamic Telemetry Metrics derived from company state
  const compName = company.companyName || company.name || 'Teledu Learning';
  const compTicker = company.ticker || 'TELEDU';
  const compIndustry = company.industry || 'Technology & Growth';
  const compStage = company.stage || 'Early revenue';

  const mrr = Number(company.monthlyRevenue ?? company.mrr ?? company.currentRevenue ?? 28000);
  const arr = mrr * 12;
  const burn = Number(company.monthlyBurn ?? company.monthlyExpenses ?? 18000);
  const cash = Number(company.cashAvailable ?? company.cashBalance ?? 165000);
  const runwayMonths = burn > 0 ? (cash / burn).toFixed(1) : '∞';
  const customers = Number(company.customers ?? 240);
  const cac = Number(company.cac ?? 120);
  const ltv = Number(company.ltv ?? 560);
  const ltvCacRatio = cac > 0 ? (ltv / cac).toFixed(2) : '4.66';
  const grossMargin = Number(company.grossMargin ?? 72);
  const growthRate = Number(company.growthRate ?? company.revenueGrowthRate ?? 14);
  const ebitdaMargin = Number(company.ebitdaMargin ?? 24);
  const currentHealth = healthScore !== undefined && healthScore !== null ? Number(healthScore).toFixed(1) : '84.5';

  // DCF Valuation Multiple based on growth rate
  const multiple = growthRate >= 30 ? 18 : growthRate >= 15 ? 14 : 10;
  const dcfValuationNum = (arr * multiple) / 1000000;
  const dcfFormatted = dcfValuationNum >= 1 ? `$${dcfValuationNum.toFixed(2)}M` : `$${Math.round(arr * multiple / 1000)}K`;
  const fairSharePrice = (dcfValuationNum * 10).toFixed(2);

  // Form State for Quick Editing
  const [formData, setFormData] = useState({
    monthlyRevenue: mrr,
    monthlyBurn: burn,
    cashAvailable: cash,
    customers: customers,
    growthRate: growthRate,
    grossMargin: grossMargin,
    cac: cac,
    ltv: ltv,
  });

  // Keep form data in sync whenever active company changes
  useEffect(() => {
    setFormData({
      monthlyRevenue: mrr,
      monthlyBurn: burn,
      cashAvailable: cash,
      customers: customers,
      growthRate: growthRate,
      grossMargin: grossMargin,
      cac: cac,
      ltv: ltv,
    });
  }, [compTicker, mrr, burn, cash, customers, growthRate, grossMargin, cac, ltv]);

  const handleOpenEdit = () => {
    setFormData({
      monthlyRevenue: mrr,
      monthlyBurn: burn,
      cashAvailable: cash,
      customers: customers,
      growthRate: growthRate,
      grossMargin: grossMargin,
      cac: cac,
      ltv: ltv,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveMetrics = (e) => {
    e.preventDefault();
    if (onUpdateCompany) {
      onUpdateCompany({
        monthlyRevenue: Number(formData.monthlyRevenue) || 0,
        mrr: Number(formData.monthlyRevenue) || 0,
        monthlyBurn: Number(formData.monthlyBurn) || 0,
        cashAvailable: Number(formData.cashAvailable) || 0,
        customers: Number(formData.customers) || 0,
        growthRate: Number(formData.growthRate) || 0,
        grossMargin: Number(formData.grossMargin) || 0,
        cac: Number(formData.cac) || 0,
        ltv: Number(formData.ltv) || 0,
      });
    }
    setIsEditModalOpen(false);
    setToast('Startup metrics updated successfully in Cockpit!');
    setTimeout(() => setToast(null), 3500);
  };

  // 5-Year Projection Bar Model
  const yr1Rev = arr;
  const yr2Rev = yr1Rev * (1 + (growthRate / 100));
  const yr3Rev = yr2Rev * (1 + (growthRate * 0.95 / 100));
  const yr4Rev = yr3Rev * (1 + (growthRate * 0.9 / 100));
  const yr5Rev = yr4Rev * (1 + (growthRate * 0.85 / 100));

  const formatMillions = (val) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(2)}M`;
    return `$${Math.round(val / 1000)}K`;
  };

  const projectionBars = [
    { year: 'Yr 1', rev: formatMillions(yr1Rev), height: '24%' },
    { year: 'Yr 2', rev: formatMillions(yr2Rev), height: '42%' },
    { year: 'Yr 3', rev: formatMillions(yr3Rev), height: '62%' },
    { year: 'Yr 4', rev: formatMillions(yr4Rev), height: '82%' },
    { year: 'Yr 5', rev: formatMillions(yr5Rev), height: '100%' },
  ];

  const subTabs = [
    { id: 'projections', label: 'Financial Projections & DCF' },
    { id: 'unit-economics', label: 'Unit Economics & LTV:CAC' },
    { id: 'experiments', label: 'Lean Experiments & RAT' }
  ];

  const toolsCategories = [
    {
      domain: 'Venture Strategy & Lean Testing',
      color: '#6366F1',
      tools: [
        { id: 'profile-wizard', title: 'Company Profile & Diligence Wizard', desc: '8-step institutional profile, KYC verification, SWOT matrix & data vault.', icon: Award, badge: '8 Steps' },
        { id: 'founder-assessment', title: 'Founder Competency Assessment', desc: 'AI-generated 30-question diagnostic across 6 venture domains.', icon: Award, badge: 'AI Test' },
        { id: 'idea-analyzer', title: 'Idea Assessment Lab', desc: '0-100 score on problem urgency and market size.', icon: Target, badge: 'TAM / SAM' },
        { id: 'idea-testing', title: 'Lean Hypothesis Lab', desc: 'Formulate Riskiest Assumptions (RAT) & validation tests.', icon: FlaskConical, badge: '6 Stages' },
        { id: 'gtm', title: 'GTM Roadmap Gantt', desc: 'Persona targeting, channel priority scoring & timeline.', icon: Map, badge: '12 Weeks' },
        { id: 'action-plan', title: '30-Day Founder Action Plan', desc: 'Weekly tactical sprint roadmap for weakest metrics.', icon: CheckSquare, badge: 'Sprints' }
      ]
    },
    {
      domain: 'Financial Modeling & Valuation',
      color: '#06B6D4',
      tools: [
        { id: 'financial-model', title: '5-Year Financial Model', desc: 'DCF enterprise valuation, revenue compounding & cash flow.', icon: TrendingUp, badge: '5-Yr DCF' },
        { id: 'tools', title: 'Financial & Business Calculators', desc: 'Calculator Studio, 30 Finance Formulas, What-If Simulator & 12-Mo Projections.', icon: Calculator, badge: 'Tools Studio' },
        { id: 'metrics', title: 'Metric Driver Network', desc: 'Trace how CAC shifts LTV:CAC, and how burn shifts runway.', icon: Network, badge: 'Simulations' },
        { id: 'health-score', title: 'Startup Health Score', desc: 'Algorithmic benchmark measuring growth, burn & churn.', icon: Activity, badge: `${currentHealth} / 100` }
      ]
    },
    {
      domain: 'Academy & Knowledge Base',
      color: '#8B5CF6',
      tools: [
        { id: 'learning', title: '30 Core Curriculum Lessons', desc: 'Structured frameworks from Idea stage to IPO governance.', icon: BookOpen, badge: '6 Tracks' },
        { id: 'terms', title: '50 Startup Terms Library', desc: 'Exact formulas, real examples & AI prompt presets.', icon: Library, badge: '50 Terms' },
        { id: 'data-room', title: 'Due Diligence Data Room', desc: 'Secure institutional repository for pitch decks and audits.', icon: FolderLock, badge: 'Vault' },
        { id: 'prompt-builder', title: 'AI Copilot & Playbooks', desc: 'Ask questions, run strategic playbooks & prompt templates.', icon: Wand2, badge: 'Copilot' }
      ]
    },
    {
      domain: 'Capital Allocation & Due Diligence',
      color: '#10B981',
      tools: [
        { id: 'investor-portfolio', title: 'Portfolio Management', desc: 'Track capital deployment, MOIC multiples & active deals.', icon: Briefcase, badge: 'Portfolio' },
        { id: 'deal-room', title: 'Deal Room & Discovery', desc: 'Browse investment-ready startups with DCF valuation signals.', icon: Compass, badge: 'Vetted Deals' },
        { id: 'cap-table', title: 'Cap Table & Rounds', icon: Layers, desc: 'Fully diluted share ownership, ESOP & financing terms.', badge: 'Equity' },
        { id: 'ledger', title: 'Financial Ledger Journal', desc: 'Audited double-entry journal of revenues and expenses.', icon: FileSpreadsheet, badge: 'Cash Flow' }
      ]
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.2rem' }}>
      {/* Toast Alert */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            style={{
              position: 'fixed',
              top: '24px',
              right: '24px',
              zIndex: 2500,
              background: '#10B981',
              color: '#fff',
              padding: '0.85rem 1.4rem',
              borderRadius: 'var(--radius-md)',
              fontWeight: 700,
              fontSize: '0.85rem',
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.45)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <CheckCircle2 size={18} />
            <span>{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================================
          ZONE 1: LIVE FINANCIAL TELEMETRY STRIP (DYNAMIC METRICS)
          ============================================================ */}
      <div className="cockpit-telemetry-grid">
        {/* DCF Valuation */}
        <div className="glass-card" style={{ padding: '1.4rem', borderLeft: '4px solid #6366F1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              DCF Enterprise Value
            </span>
            <span className="badge-tag badge-indigo">+{growthRate}% UPSIDE</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: '4px' }} className="numeral-mono">
            {dcfFormatted}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Fair Share Price: <strong style={{ color: '#10B981' }}>${fairSharePrice}</strong>
          </div>
        </div>

        {/* Revenue Run-Rate (ARR) */}
        <div className="glass-card" style={{ padding: '1.4rem', borderLeft: '4px solid #10B981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Annual Run-Rate (ARR)
            </span>
            <span className="badge-tag badge-success">+{growthRate}% YOY</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#10B981', marginTop: '4px' }} className="numeral-mono">
            ${arr.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Current MRR: <strong style={{ color: 'var(--text-primary)' }}>${mrr.toLocaleString()}/mo</strong> across {customers} seats
          </div>
        </div>

        {/* Startup Health Score */}
        <div className="glass-card" style={{ padding: '1.4rem', borderLeft: '4px solid #F59E0B' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Startup Health Score
            </span>
            <span style={{ fontSize: '0.74rem', color: '#FBBF24', fontWeight: 800 }}>{currentHealth} / 100</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#FBBF24', marginTop: '4px' }} className="numeral-mono">
            {Number(currentHealth) >= 80 ? 'Top 10th Percentile' : Number(currentHealth) >= 60 ? 'Above Average' : 'Needs Optimization'}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#34D399', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
            <span className="beacon-dot" />
            {Number(currentHealth) >= 70 ? 'Institutional Investment Ready' : 'Growth Optimization Stage'}
          </div>
        </div>

        {/* Cash Runway */}
        <div className="glass-card" style={{ padding: '1.4rem', borderLeft: '4px solid #06B6D4' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Cash Runway
            </span>
            <span className={`badge-tag ${Number(runwayMonths) >= 12 ? 'badge-cyan' : Number(runwayMonths) >= 6 ? 'badge-indigo' : 'badge-amber'}`}>
              {Number(runwayMonths) >= 12 ? 'CASH FLOW SAFE' : Number(runwayMonths) >= 6 ? 'HEALTHY RUNWAY' : 'ACTION REQUIRED'}
            </span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: '4px' }} className="numeral-mono">
            {runwayMonths} Months
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Burn: <strong>${burn.toLocaleString()}/mo</strong> • Cash: <strong>${cash.toLocaleString()}</strong>
          </div>
        </div>

        {/* Deal Recommendation Signal */}
        <div className="glass-card" style={{ padding: '1.4rem', borderLeft: '4px solid #10B981', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(13, 19, 36, 0.75))' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Valuation Signal
            </span>
            <ShieldCheck size={16} color="#10B981" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#10B981', marginTop: '4px' }}>
            {Number(runwayMonths) >= 6 && Number(currentHealth) >= 70 ? 'BUY' : 'ACCUMULATE'}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Gordon Growth DCF Valuation Model
          </div>
        </div>
      </div>

      {/* ============================================================
          ZONE 2: DUAL-ZONE EXECUTIVE INTELLIGENCE WORKSPACE
          ============================================================ */}
      <div className="cockpit-executive-grid">
        {/* Left Side: Interactive Operating Telemetry Canvas */}
        <div className="glass-card" style={{ padding: '1.8rem', display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
          {/* Sub-Tabs Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {compName} • Operational Intelligence
                </h2>
                <button
                  onClick={handleOpenEdit}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '0.25rem 0.65rem',
                    borderRadius: 'var(--radius-pill)',
                    background: 'rgba(99, 102, 241, 0.15)',
                    border: '1px solid rgba(99, 102, 241, 0.35)',
                    color: '#818CF8',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                  title="Edit Startup Metrics"
                >
                  <Edit3 size={12} />
                  Edit Telemetry
                </button>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Ticker: <strong style={{ color: 'var(--accent)' }}>{compTicker}</strong> • {compIndustry} • Stage: {compStage}
              </p>
            </div>

            {/* Switchable View Pills */}
            <div style={{ display: 'flex', gap: '4px', background: 'rgba(255, 255, 255, 0.04)', padding: '3px', borderRadius: 'var(--radius-pill)', overflowX: 'auto', maxWidth: '100%', WebkitOverflowScrolling: 'touch' }}>
              {subTabs.map((st) => (
                <button
                  key={st.id}
                  onClick={() => setActiveSubTab(st.id)}
                  style={{
                    padding: '0.35rem 0.85rem',
                    borderRadius: 'var(--radius-pill)',
                    border: 'none',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    background: activeSubTab === st.id ? 'var(--accent)' : 'transparent',
                    color: activeSubTab === st.id ? '#fff' : 'var(--text-muted)',
                    transition: 'all 0.18s ease'
                  }}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sub-Tab 1: Financial Projections & 5-Year Cash Flow */}
          {activeSubTab === 'projections' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div className="cockpit-projections-grid" style={{ fontSize: '0.8rem' }}>
                <div style={{ padding: '0.8rem', borderRadius: 'var(--radius-md)', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Gross Margin</div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#10B981', marginTop: '2px' }}>{grossMargin}%</div>
                </div>
                <div style={{ padding: '0.8rem', borderRadius: 'var(--radius-md)', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>EBITDA Margin</div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)', marginTop: '2px' }}>{ebitdaMargin}%</div>
                </div>
                <div style={{ padding: '0.8rem', borderRadius: 'var(--radius-md)', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Discount Rate (WACC)</div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)', marginTop: '2px' }}>10.0%</div>
                </div>
                <div style={{ padding: '0.8rem', borderRadius: 'var(--radius-md)', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Terminal Growth</div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)', marginTop: '2px' }}>3.0%</div>
                </div>
              </div>

              {/* Compounding Revenue Growth Simulation Bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.6rem' }}>
                  <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>5-Year Compound Revenue Projections ($)</span>
                  <span style={{ color: '#34D399', fontWeight: 800 }}>CAGR: +{growthRate}.0%</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.6rem', alignItems: 'end', height: '110px', padding: '0.5rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  {projectionBars.map((col, idx) => (
                    <div key={col.year} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', gap: '4px' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: idx === 4 ? '#10B981' : 'var(--text-primary)' }}>{col.rev}</span>
                      <div style={{ width: '100%', height: col.height, background: idx === 4 ? 'linear-gradient(180deg, #10B981, #059669)' : 'linear-gradient(180deg, #6366F1, #4F46E5)', borderRadius: '4px' }} />
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{col.year}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Sub-Tab 2: Unit Economics */}
          {activeSubTab === 'unit-economics' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="cockpit-economics-grid">
              <div style={{ padding: '1.2rem', borderRadius: 'var(--radius-md)', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Customer Acquisition Cost (CAC)</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: '4px' }}>${cac}</div>
                <div style={{ fontSize: '0.72rem', color: '#10B981', marginTop: '4px' }}>Blended organic + paid</div>
              </div>
              <div style={{ padding: '1.2rem', borderRadius: 'var(--radius-md)', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Customer Lifetime Value (LTV)</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#10B981', marginTop: '4px' }}>${ltv}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>Estimated 20-month retention</div>
              </div>
              <div style={{ padding: '1.2rem', borderRadius: 'var(--radius-md)', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>LTV : CAC Multiplier</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: Number(ltvCacRatio) >= 3 ? '#34D399' : '#FBBF24', marginTop: '4px' }}>
                  {ltvCacRatio}x
                </div>
                <div style={{ fontSize: '0.72rem', color: Number(ltvCacRatio) >= 3 ? '#34D399' : '#FBBF24', marginTop: '4px' }}>
                  {Number(ltvCacRatio) >= 3 ? 'Benchmark: > 3.0x (Elite)' : 'Benchmark: > 3.0x'}
                </div>
              </div>
            </motion.div>
          )}

          {/* Sub-Tab 3: Lean Experiments */}
          {activeSubTab === 'experiments' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {[
                { name: 'Institutional B2B Seat Contract Pricing', status: 'VALIDATED', passRate: '88%', date: 'Completed 2 weeks ago' },
                { name: 'Self-Serve Multi-Tier Subscription Checkout', status: 'IN_PROGRESS', passRate: '62%', date: 'Running sprint test' },
                { name: 'Automated Mock-Exam Marketplace Addon', status: 'BACKLOG', passRate: 'Pending', date: 'Scheduled Q2' }
              ].map((exp, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem 1rem', borderRadius: 'var(--radius-md)', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{exp.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{exp.date}</div>
                  </div>
                  <span style={{
                    padding: '0.2rem 0.6rem',
                    borderRadius: 'var(--radius-pill)',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    background: exp.status === 'VALIDATED' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                    color: exp.status === 'VALIDATED' ? '#34D399' : '#A5B4FC'
                  }}>
                    {exp.status} • {exp.passRate}
                  </span>
                </div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Right Side: Venture Readiness & Deal Radar Terminal */}
        <div className="glass-card" style={{ padding: '1.8rem', display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              10-Dimension Diligence Radar
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#10B981', fontWeight: 800 }}>91% Complete</span>
          </div>

          {/* Progress Bars */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
            {[
              { label: 'Corporate KYC & Statutory Filings', value: 90, color: '#10B981' },
              { label: 'Financial Audit & DCF Valuation', value: 95, color: '#6366F1' },
              { label: 'Funding Round & Cap Table Terms', value: 100, color: '#10B981' },
              { label: 'Virtual Data Room (VDR) Documents', value: 85, color: '#F59E0B' },
            ].map((item) => (
              <div key={item.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{item.label}</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 800 }}>{item.value}%</span>
                </div>
                <div style={{ height: '6px', borderRadius: 'var(--radius-pill)', background: 'rgba(255, 255, 255, 0.06)', overflow: 'hidden' }}>
                  <div style={{ width: `${item.value}%`, height: '100%', background: item.color }} />
                </div>
              </div>
            ))}
          </div>

          {/* Multi-Factor Risk Assessment */}
          <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.6rem' }}>
              Composite Risk: <span style={{ color: '#34D399' }}>Low Risk (28.0 / 100)</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', fontSize: '0.72rem' }}>
              <div style={{ padding: '0.45rem', borderRadius: 'var(--radius-sm)', background: 'rgba(255, 255, 255, 0.02)', color: 'var(--text-muted)' }}>
                Financial Risk: <strong style={{ color: 'var(--text-primary)' }}>25%</strong>
              </div>
              <div style={{ padding: '0.45rem', borderRadius: 'var(--radius-sm)', background: 'rgba(255, 255, 255, 0.02)', color: 'var(--text-muted)' }}>
                Market Risk: <strong style={{ color: 'var(--text-primary)' }}>25%</strong>
              </div>
              <div style={{ padding: '0.45rem', borderRadius: 'var(--radius-sm)', background: 'rgba(255, 255, 255, 0.02)', color: 'var(--text-muted)' }}>
                Operational Risk: <strong style={{ color: 'var(--text-primary)' }}>20%</strong>
              </div>
              <div style={{ padding: '0.45rem', borderRadius: 'var(--radius-sm)', background: 'rgba(255, 255, 255, 0.02)', color: 'var(--text-muted)' }}>
                Regulatory Risk: <strong style={{ color: 'var(--text-primary)' }}>15%</strong>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingTop: '0.5rem' }}>
            <button
              onClick={() => onNavigate('financial-model')}
              className="btn btn-primary btn-sm"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <TrendingUp size={15} /> Run 5-Year DCF Simulation
            </button>
            <button
              onClick={() => onNavigate('data-room')}
              className="btn btn-secondary btn-sm"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <FolderLock size={15} /> Manage Confidential Data Room
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================
          ZONE 3: CATEGORIZED PLATFORM TOOL LAUNCHPAD MATRICES
          ============================================================ */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Integrated Intelligence & Analytical Modules
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Domain-organized tools powering the dual-engine founder and investor operating system.
          </p>
        </div>

        <div className="cockpit-tools-grid">
          {toolsCategories.map((cat) => (
            <div
              key={cat.domain}
              className="glass-card"
              style={{
                padding: '1.6rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.1rem',
                borderTop: `3px solid ${cat.color}`
              }}
            >
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {cat.domain}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {cat.tools.map((tool) => {
                  const ToolIcon = tool.icon;
                  return (
                    <div
                      key={tool.id}
                      onClick={() => {
                        if (tool.id === 'prompt-builder') {
                          if (onOpenAI) onOpenAI();
                        } else {
                          onNavigate(tool.id);
                        }
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.75rem 0.9rem',
                        borderRadius: 'var(--radius-md)',
                        background: 'rgba(255, 255, 255, 0.025)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        cursor: 'pointer',
                        transition: 'all 0.18s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.07)';
                        e.currentTarget.style.transform = 'translateX(4px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.025)';
                        e.currentTarget.style.transform = 'translateX(0px)';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <ToolIcon size={16} color={cat.color} />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {tool.title}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            {tool.desc}
                          </div>
                        </div>
                      </div>

                      <ArrowRight size={14} color="var(--text-muted)" />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ============================================================
          MODAL: QUICK EDIT STARTUP TELEMETRY METRICS
          ============================================================ */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.78)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 3000,
            padding: '1.5rem'
          }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              style={{
                background: '#131825',
                border: '1px solid rgba(99, 102, 241, 0.4)',
                borderRadius: 'var(--radius-xl)',
                width: '100%',
                maxWidth: '560px',
                maxHeight: '90vh',
                overflowY: 'auto',
                WebkitOverflowScrolling: 'touch',
                padding: '2.2rem',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.85)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    Edit Startup Cockpit Telemetry
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Updating {compName} ({compTicker})
                  </div>
                </div>
                <button 
                  onClick={() => setIsEditModalOpen(false)} 
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveMetrics} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="cockpit-modal-form-grid">
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', fontWeight: 600 }}>
                      Monthly Revenue (MRR $)
                    </label>
                    <input
                      type="number"
                      value={formData.monthlyRevenue}
                      onChange={(e) => setFormData({ ...formData, monthlyRevenue: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: 'var(--radius-md)',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', fontWeight: 600 }}>
                      Monthly Burn ($)
                    </label>
                    <input
                      type="number"
                      value={formData.monthlyBurn}
                      onChange={(e) => setFormData({ ...formData, monthlyBurn: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: 'var(--radius-md)',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem'
                      }}
                    />
                  </div>
                </div>

                <div className="cockpit-modal-form-grid">
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', fontWeight: 600 }}>
                      Cash in Bank ($)
                    </label>
                    <input
                      type="number"
                      value={formData.cashAvailable}
                      onChange={(e) => setFormData({ ...formData, cashAvailable: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: 'var(--radius-md)',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', fontWeight: 600 }}>
                      Customer / Seats Count
                    </label>
                    <input
                      type="number"
                      value={formData.customers}
                      onChange={(e) => setFormData({ ...formData, customers: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: 'var(--radius-md)',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem'
                      }}
                    />
                  </div>
                </div>

                <div className="cockpit-modal-form-grid">
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', fontWeight: 600 }}>
                      CAC (Acquisition Cost $)
                    </label>
                    <input
                      type="number"
                      value={formData.cac}
                      onChange={(e) => setFormData({ ...formData, cac: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: 'var(--radius-md)',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', fontWeight: 600 }}>
                      LTV (Customer Lifetime Value $)
                    </label>
                    <input
                      type="number"
                      value={formData.ltv}
                      onChange={(e) => setFormData({ ...formData, ltv: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: 'var(--radius-md)',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem'
                      }}
                    />
                  </div>
                </div>

                <div className="cockpit-modal-form-grid">
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', fontWeight: 600 }}>
                      YoY Growth Rate (%)
                    </label>
                    <input
                      type="number"
                      value={formData.growthRate}
                      onChange={(e) => setFormData({ ...formData, growthRate: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: 'var(--radius-md)',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', fontWeight: 600 }}>
                      Gross Margin (%)
                    </label>
                    <input
                      type="number"
                      value={formData.grossMargin}
                      onChange={(e) => setFormData({ ...formData, grossMargin: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: 'var(--radius-md)',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginTop: '1.2rem' }}>
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    style={{
                      padding: '0.75rem 1.3rem',
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
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '0.75rem 1.5rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                      border: 'none',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)'
                    }}
                  >
                    <Save size={15} />
                    Save & Update Cockpit
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
