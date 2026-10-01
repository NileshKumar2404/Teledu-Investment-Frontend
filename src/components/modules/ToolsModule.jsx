import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calculator, Search, TrendingUp, Sliders, Activity, 
  RotateCcw, Sparkles, ArrowRight, ShieldCheck, CheckCircle2,
  DollarSign, BarChart3, AlertCircle, ChevronDown, ChevronUp,
  Layers, RefreshCw, Zap, Target
} from 'lucide-react';
import { 
  BUSINESS_CALCULATORS, 
  CALCULATOR_CATEGORIES 
} from '../../data/calculatorStudioData';
import { 
  FINANCE_FORMULAS, 
  FINANCE_CATEGORIES 
} from '../../data/financeFormulasData';

export default function ToolsModule({ 
  company = {}, 
  onNavigate, 
  onUpdateCompany,
  defaultTab = 'calc' 
}) {
  const [activeSubTab, setActiveSubTab] = useState(defaultTab); // 'calc' | 'finance' | 'whatif' | 'model12' | 'metrics'
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // ==============================================================
  // TAB 1: CALCULATOR STUDIO STATE
  // ==============================================================
  const [selectedCalcCategory, setSelectedCalcCategory] = useState('All');
  const [calcSearch, setCalcSearch] = useState('');
  const [expandedAdvanced, setExpandedAdvanced] = useState({});

  // Initialize calculator input states with company values where applicable
  const [calcInputs, setCalcInputs] = useState(() => {
    const initial = {};
    BUSINESS_CALCULATORS.forEach(calc => {
      calc.fields.forEach(f => {
        let val = f.default;
        if (f.companyKey && company[f.companyKey] !== undefined) {
          val = company[f.companyKey];
        }
        initial[`${calc.id}_${f.id}`] = val;
      });
      if (calc.advanced) {
        calc.advanced.forEach((adv, aIdx) => {
          adv.inputs.forEach(inp => {
            initial[`adv_${calc.id}_${aIdx}_${inp.id}`] = inp.default;
          });
        });
      }
    });
    return initial;
  });

  // Re-sync with active company telemetry
  const handleSyncCompanyTelemetry = () => {
    setCalcInputs(prev => {
      const updated = { ...prev };
      BUSINESS_CALCULATORS.forEach(calc => {
        calc.fields.forEach(f => {
          if (f.companyKey && company[f.companyKey] !== undefined) {
            updated[`${calc.id}_${f.id}`] = company[f.companyKey];
          }
        });
      });
      return updated;
    });
    showToast(`Synced live telemetry from ${company.companyName || company.ticker || 'Startup'}`);
  };

  const handleCalcInputChange = (calcId, fieldId, value) => {
    setCalcInputs(prev => ({
      ...prev,
      [`${calcId}_${fieldId}`]: value
    }));
  };

  const handleAdvInputChange = (calcId, advIdx, fieldId, value) => {
    setCalcInputs(prev => ({
      ...prev,
      [`adv_${calcId}_${advIdx}_${fieldId}`]: value
    }));
  };

  const toggleAdvanced = (calcId) => {
    setExpandedAdvanced(prev => ({
      ...prev,
      [calcId]: !prev[calcId]
    }));
  };

  // ==============================================================
  // TAB 2: FINANCE & ACCOUNTING FORMULAS STATE
  // ==============================================================
  const [selectedFinanceCat, setSelectedFinanceCat] = useState('All');
  const [financeSearch, setFinanceSearch] = useState('');
  const [financeInputs, setFinanceInputs] = useState({});

  const handleFinanceInputChange = (formulaIndex, fieldId, value) => {
    setFinanceInputs(prev => ({
      ...prev,
      [`${formulaIndex}_${fieldId}`]: parseFloat(value) || 0
    }));
  };

  // ==============================================================
  // TAB 3: WHAT-IF SCENARIO SIMULATOR STATE
  // ==============================================================
  const baseRevenue = Number(company.monthlyRevenue || company.mrr || 336000);
  const baseBurn = Number(company.monthlyBurn || 18000);
  const baseCash = Number(company.cashAvailable || 165000);
  const baseCustomers = Number(company.customers || 240);
  const baseCAC = Number(company.cac || 120);
  const baseLTV = Number(company.ltv || 560);
  const baseMargin = Number(company.grossMargin || 72) / 100;
  const baseGrowth = Number(company.growthRate || 14);

  const [levers, setLevers] = useState({
    priceDelta: 0,       // -50% to +50%
    cacDelta: 0,         // -50% to +50%
    churnDelta: 0,       // -5% to +5%
    marketingDelta: 0,   // -100% to +100%
    growthDelta: 0       // -20% to +20%
  });

  const resetLevers = () => {
    setLevers({ priceDelta: 0, cacDelta: 0, churnDelta: 0, marketingDelta: 0, growthDelta: 0 });
    showToast('Simulation levers reset to base profile');
  };

  // Compute What-If Scenario outputs
  const scenarioResults = useMemo(() => {
    const baseArpu = baseCustomers > 0 ? baseRevenue / baseCustomers : 1400;
    const scenArpu = baseArpu * (1 + levers.priceDelta / 100);
    const scenCAC = Math.max(1, baseCAC * (1 + levers.cacDelta / 100));
    const baseChurn = 3.2;
    const scenChurn = Math.max(0.2, baseChurn + levers.churnDelta);
    
    // LTV = (ARPU * Gross Margin) / Churn
    const baseLtvComputed = (baseArpu * baseMargin) / (baseChurn / 100);
    const scenLtvComputed = (scenArpu * baseMargin) / (scenChurn / 100);

    // LTV:CAC Ratio
    const baseRatio = baseCAC > 0 ? baseLtvComputed / baseCAC : 4.6;
    const scenRatio = scenCAC > 0 ? scenLtvComputed / scenCAC : 4.6;

    // CAC Payback (months)
    const basePayback = (baseArpu * baseMargin) > 0 ? baseCAC / (baseArpu * baseMargin) : 1.2;
    const scenPayback = (scenArpu * baseMargin) > 0 ? scenCAC / (scenArpu * baseMargin) : 1.2;

    // Next Month MRR
    const scenGrowth = Math.max(-50, baseGrowth + levers.growthDelta);
    const scenMRR = baseRevenue * (1 + scenGrowth / 100) * (1 + levers.priceDelta / 100);

    // Monthly Burn
    const scenBurn = Math.max(1000, baseBurn * (1 + levers.marketingDelta / 100));

    // Cash Runway
    const baseRunway = baseBurn > 0 ? baseCash / baseBurn : 999;
    const scenRunway = scenBurn > 0 ? baseCash / scenBurn : 999;

    return {
      ltv: { base: baseLtvComputed, scen: scenLtvComputed, better: 'up', fmt: v => `$${Math.round(v).toLocaleString()}` },
      ratio: { base: baseRatio, scen: scenRatio, better: 'up', fmt: v => `${v.toFixed(2)}x` },
      payback: { base: basePayback, scen: scenPayback, better: 'down', fmt: v => `${v.toFixed(1)} mo` },
      mrr: { base: baseRevenue, scen: scenMRR, better: 'up', fmt: v => `$${Math.round(v).toLocaleString()}` },
      burn: { base: baseBurn, scen: scenBurn, better: 'down', fmt: v => `$${Math.round(v).toLocaleString()}/mo` },
      runway: { base: baseRunway, scen: scenRunway, better: 'up', fmt: v => `${v.toFixed(1)} mo` }
    };
  }, [baseRevenue, baseBurn, baseCash, baseCustomers, baseCAC, baseLTV, baseMargin, baseGrowth, levers]);

  // Automated trade-off analysis
  const tradeOffInsight = useMemo(() => {
    const isTouched = Object.values(levers).some(v => v !== 0);
    if (!isTouched) {
      return "Adjust the levers on the left to see how strategic pricing, marketing, and retention changes ripple through unit economics, burn, and runway.";
    }

    const deltas = [
      { key: 'LTV:CAC Ratio', delta: ((scenarioResults.ratio.scen - scenarioResults.ratio.base) / scenarioResults.ratio.base) * 100, better: 'up' },
      { key: 'Cash Runway', delta: ((scenarioResults.runway.scen - scenarioResults.runway.base) / scenarioResults.runway.base) * 100, better: 'up' },
      { key: 'Monthly Burn', delta: ((scenarioResults.burn.scen - scenarioResults.burn.base) / scenarioResults.burn.base) * 100, better: 'down' },
      { key: 'Next Month MRR', delta: ((scenarioResults.mrr.scen - scenarioResults.mrr.base) / scenarioResults.mrr.base) * 100, better: 'up' }
    ];

    const gains = deltas.filter(d => (d.better === 'up' && d.delta > 1) || (d.better === 'down' && d.delta < -1));
    const losses = deltas.filter(d => (d.better === 'up' && d.delta < -1) || (d.better === 'down' && d.delta > 1));

    if (gains.length > 0 && losses.length > 0) {
      return `Key Trade-Off: Your simulation improves ${gains[0].key} (${Math.abs(gains[0].delta).toFixed(1)}% favorable), but watch out — ${losses[0].key} weakens by ${Math.abs(losses[0].delta).toFixed(1)}%.`;
    } else if (gains.length > 0) {
      return `Positive Vector: Significant upside in ${gains.map(g => `${g.key} (+${Math.abs(g.delta).toFixed(1)}%)`).join(', ')} with no major downside observed.`;
    } else if (losses.length > 0) {
      return `Risk Warning: This strategic adjustment degrades ${losses.map(l => `${l.key} (${Math.abs(l.delta).toFixed(1)}% adverse)`).join(', ')}. Consider counterbalancing levers.`;
    }
    return "Balanced impact across primary financial benchmarks.";
  }, [levers, scenarioResults]);

  // ==============================================================
  // TAB 4: 12-MONTH FINANCIAL MODEL STATE
  // ==============================================================
  const [fmAssumptions, setFmAssumptions] = useState({
    startCash: baseCash,
    startRevenue: baseRevenue,
    growthRate: baseGrowth,
    grossMargin: 72,
    salaries: 12000,
    marketing: 4000,
    other: 2000,
    cac: baseCAC,
    churn: 3.2,
    startCustomers: baseCustomers
  });

  const handleFmReset = () => {
    setFmAssumptions({
      startCash: baseCash,
      startRevenue: baseRevenue,
      growthRate: baseGrowth,
      grossMargin: 72,
      salaries: 12000,
      marketing: 4000,
      other: 2000,
      cac: baseCAC,
      churn: 3.2,
      startCustomers: baseCustomers
    });
    showToast('Financial model reset to company telemetry defaults');
  };

  // Compute 12-month projection matrix
  const fmProjection = useMemo(() => {
    const months = [];
    let currentCash = Number(fmAssumptions.startCash) || 0;
    let currentCustomers = Number(fmAssumptions.startCustomers) || 0;
    const g = (Number(fmAssumptions.growthRate) || 0) / 100;
    const gm = (Number(fmAssumptions.grossMargin) || 70) / 100;
    const opex = (Number(fmAssumptions.salaries) || 0) + (Number(fmAssumptions.marketing) || 0) + (Number(fmAssumptions.other) || 0);
    const cac = Number(fmAssumptions.cac) || 1;
    const churn = (Number(fmAssumptions.churn) || 0) / 100;

    let breakevenMonth = null;
    let runOutMonth = null;
    let total12MoRevenue = 0;

    for (let m = 1; m <= 12; m++) {
      const rev = (Number(fmAssumptions.startRevenue) || 0) * Math.pow(1 + g, m - 1);
      const grossProfit = rev * gm;
      const opProfit = grossProfit - opex;
      currentCash += opProfit;

      const newCustomers = cac > 0 ? (Number(fmAssumptions.marketing) || 0) / cac : 0;
      currentCustomers = (currentCustomers * (1 - churn)) + newCustomers;
      total12MoRevenue += rev;

      if (breakevenMonth === null && opProfit >= 0 && rev > 0) {
        breakevenMonth = m;
      }
      if (runOutMonth === null && currentCash < 0) {
        runOutMonth = m;
      }

      months.push({
        month: m,
        revenue: rev,
        grossProfit,
        opex,
        opProfit,
        cash: currentCash,
        customers: Math.round(currentCustomers)
      });
    }

    const last = months[11];
    const arpu = last.customers > 0 ? last.revenue / last.customers : 0;
    const ltv = (arpu * gm) / Math.max(0.001, churn);
    const ltvCac = cac > 0 ? ltv / cac : 0;

    return {
      months,
      endCash: currentCash,
      totalRevenue: total12MoRevenue,
      breakevenMonth,
      runOutMonth,
      ltv,
      ltvCac
    };
  }, [fmAssumptions]);

  // ==============================================================
  // TAB 5: METRIC RELATIONSHIP EXPLORER STATE
  // ==============================================================
  const [selectedRelMetric, setSelectedRelMetric] = useState('CAC');

  const REL_METRICS = [
    {
      key: 'CAC',
      def: 'What you spend, fully loaded, to acquire one new paying customer account.',
      chain: ['Marketing Spend', 'CAC', 'LTV:CAC', 'Payback Period', 'Runway'],
      affectedBy: ['Channel efficiency & targeting', 'Landing page conversion rate', 'Team salaries', 'Ad bidding competition'],
      affects: ['LTV:CAC ratio', 'CAC payback duration', 'Burn rate', 'Net profit margin'],
      why: 'CAC dictates scalable unit economics. If acquisition costs scale faster than customer lifetime values, additional growth burns reserves rather than creating value.',
      action: 'Target a payback period under 12 months. Pause channels with CAC > 33% of LTV.'
    },
    {
      key: 'LTV',
      def: 'The total gross margin a customer generates over the entire lifecycle of their relationship with the startup.',
      chain: ['ARPU', 'Gross Margin', 'Churn Rate', 'LTV', 'Enterprise Valuation'],
      affectedBy: ['Average selling price (ARPU)', 'Gross margin health', 'Monthly customer churn', 'Seat expansion and upsells'],
      affects: ['LTV:CAC multiple', 'Maximum allowable CAC ceiling', 'Long-term corporate valuation'],
      why: 'LTV defines the upper limit of what you can profitably deploy to acquire new market share.',
      action: 'Implement tiered seat expansion and retention playbooks to extend customer tenure.'
    },
    {
      key: 'Churn',
      def: 'The percentage rate at which subscribers cancel subscriptions or fail to renew.',
      chain: ['Activation Quality', 'Churn Rate', 'Cohort Retention', 'LTV', 'Growth Rate'],
      affectedBy: ['Onboarding and activation speed', 'Core product value & ROI', 'Customer success responsiveness', 'Incorrect target ICP'],
      affects: ['Net revenue retention (NRR)', 'Customer lifetime value', 'Growth compounding rate'],
      why: 'Churn silently undermines new sales momentum. A 5% monthly churn rate means replacing ~46% of your customer base every year.',
      action: 'Conduct exit interviews on cancelled accounts and engineer automated health alerts for declining usage.'
    },
    {
      key: 'MRR',
      def: 'Predictable normalized recurring revenue recognized by the business every month.',
      chain: ['New MRR + Expansion − Churn', 'Net MRR', 'Annual Run-Rate (ARR)', 'Venture Valuation'],
      affectedBy: ['New customer acquisition', 'Contract expansions', 'Account downgrades and cancellations', 'Pricing tiers'],
      affects: ['ARR run-rate', 'Cash runway longevity', 'Fundraising valuation multiple'],
      why: 'Recurring revenue velocity and durability is the primary valuation driver in venture SaaS.',
      action: 'Focus on net revenue expansion from existing power accounts while optimizing organic conversion.'
    },
    {
      key: 'Runway',
      def: 'The remaining number of operational months before available cash balances reach zero.',
      chain: ['Cash in Bank', 'Monthly Net Burn', 'Runway Months', 'Fundraising Urgency'],
      affectedBy: ['Gross operating burn rate', 'Collections & receivable cycles', 'Cash reserves', 'Revenue offsets'],
      affects: ['Founder negotiation leverage', 'Capital expenditure freedom', 'Survival probability'],
      why: 'A startup with under 6 months of runway has zero negotiation leverage with venture capital funds.',
      action: 'Begin Series fundraising when runway is 10-12 months out. Trim non-core discretionary burn if runway drops below 6 months.'
    }
  ];

  const activeRelData = REL_METRICS.find(m => m.key === selectedRelMetric) || REL_METRICS[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', paddingBottom: '3rem' }}>
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: 'fixed',
              top: '20px',
              right: '24px',
              zIndex: 9999,
              background: '#10B981',
              color: '#FFFFFF',
              padding: '0.75rem 1.4rem',
              borderRadius: 'var(--radius-pill)',
              fontWeight: 700,
              fontSize: '0.85rem',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem'
            }}
          >
            <CheckCircle2 size={16} />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Header Banner */}
      <div className="glass-card" style={{ padding: '1.75rem 2rem', borderLeft: '4px solid var(--accent)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
              <span className="badge-tag badge-indigo">
                <Calculator size={13} style={{ marginRight: '4px' }} />
                Founder Tools Studio
              </span>
              <span className="badge-tag badge-success">Live Formulas Engine</span>
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Financial Calculators & Decision Tools
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '780px', marginTop: '4px' }}>
              Put startup financial and operational formulas to work. Enter your own numbers, trace causal ripple effects, simulate strategic scenarios, and plan cash runway.
            </p>
          </div>

          <button
            onClick={handleSyncCompanyTelemetry}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700 }}
            title="Auto-fill calculators with your active startup data"
          >
            <RefreshCw size={13} />
            Sync from {company.companyName || company.ticker || 'Telemetry'}
          </button>
        </div>

        {/* Master Sub-Navigation Switcher */}
        <div style={{
          display: 'flex',
          gap: '6px',
          background: 'rgba(255, 255, 255, 0.04)',
          padding: '4px',
          borderRadius: 'var(--radius-pill)',
          marginTop: '1.5rem',
          flexWrap: 'wrap'
        }}>
          {[
            { id: 'calc', label: 'Calculator Studio', icon: Calculator, badge: `${BUSINESS_CALCULATORS.length} Tools` },
            { id: 'finance', label: 'Accounting & Finance Formulas', icon: Layers, badge: '30 Formulas' },
            { id: 'whatif', label: 'What-If Simulator', icon: Sliders, badge: '5 Levers' },
            { id: 'model12', label: '12-Month Financial Model', icon: TrendingUp, badge: 'Pro-Forma' },
            { id: 'metrics', label: 'Metric Relationship Explorer', icon: Target, badge: 'Causal Graph' },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '0.45rem 1rem',
                  borderRadius: 'var(--radius-pill)',
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: isActive ? 'var(--accent)' : 'transparent',
                  color: isActive ? '#FFFFFF' : 'var(--text-muted)',
                  transition: 'all 0.18s ease'
                }}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
                <span style={{
                  fontSize: '0.68rem',
                  padding: '1px 6px',
                  borderRadius: '8px',
                  background: isActive ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)',
                  color: isActive ? '#fff' : 'var(--text-muted)'
                }}>
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ==============================================================
          SUB-TAB 1: CALCULATOR STUDIO (PRACTICAL BUSINESS CALCULATORS)
          ============================================================== */}
      {activeSubTab === 'calc' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Controls Bar: Category Filter & Search */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {CALCULATOR_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCalcCategory(cat)}
                  className={`chip ${selectedCalcCategory === cat ? 'active' : ''}`}
                  style={{ fontSize: '0.75rem', padding: '0.35rem 0.8rem' }}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '0.4rem 0.8rem',
              width: '260px'
            }}>
              <Search size={14} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Search calculators..."
                value={calcSearch}
                onChange={e => setCalcSearch(e.target.value)}
                style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', fontSize: '0.82rem', width: '100%' }}
              />
            </div>
          </div>

          {/* Calculators Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {BUSINESS_CALCULATORS
              .filter(calc => {
                const matchesCat = selectedCalcCategory === 'All' || calc.category === selectedCalcCategory;
                const matchesSearch = calc.name.toLowerCase().includes(calcSearch.toLowerCase()) ||
                  calc.formula.toLowerCase().includes(calcSearch.toLowerCase());
                return matchesCat && matchesSearch;
              })
              .map(calc => {
                // Get values for this calculator
                const vals = {};
                calc.fields.forEach(f => {
                  vals[f.id] = calcInputs[`${calc.id}_${f.id}`];
                });
                const res = calc.compute(vals);
                const isAdvOpen = expandedAdvanced[calc.id];

                return (
                  <div key={calc.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {/* Card Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                          {calc.name}
                        </span>
                        <span className="badge-tag badge-indigo" style={{ fontSize: '0.68rem' }}>
                          {calc.badge}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        Category: <strong style={{ color: 'var(--accent)' }}>{calc.category}</strong>
                      </span>
                    </div>

                    {/* Card Body: Left (Inputs & Live Result) vs Right (Formula & Meaning) */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
                      {/* Left: Input Fields */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: calc.fields.length > 1 ? 'repeat(2, 1fr)' : '1fr', gap: '0.75rem' }}>
                          {calc.fields.map(f => (
                            <div key={f.id}>
                              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
                                {f.label}
                              </label>
                              <input
                                type="number"
                                step="any"
                                value={calcInputs[`${calc.id}_${f.id}`] ?? ''}
                                placeholder={f.placeholder}
                                onChange={e => handleCalcInputChange(calc.id, f.id, e.target.value)}
                                style={{
                                  width: '100%',
                                  padding: '0.55rem 0.75rem',
                                  borderRadius: 'var(--radius-sm)',
                                  background: 'rgba(255, 255, 255, 0.05)',
                                  border: '1px solid var(--border-subtle)',
                                  color: '#FFFFFF',
                                  fontSize: '0.85rem',
                                  fontFamily: 'var(--font-mono)'
                                }}
                              />
                            </div>
                          ))}
                        </div>

                        {/* Calculated Live Result Banner */}
                        <div style={{
                          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(16, 185, 129, 0.08))',
                          border: '1px solid rgba(99, 102, 241, 0.3)',
                          borderRadius: 'var(--radius-md)',
                          padding: '0.85rem 1rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div>
                            <span style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--accent)' }}>
                              Calculated Output
                            </span>
                            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#10B981', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                              {res ? res.value : '—'}
                            </div>
                          </div>
                          {res && (
                            <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                              {res.unit}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right: Monospace Formula Box & Interpretation */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.78rem',
                          color: '#A5B4FC',
                          background: 'rgba(0, 0, 0, 0.25)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-md)',
                          padding: '0.75rem 0.9rem',
                          lineHeight: 1.5
                        }}>
                          {calc.formula}
                        </div>

                        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.55, margin: 0 }}>
                          {calc.interpretation}
                        </p>

                        <div style={{
                          fontSize: '0.74rem',
                          color: '#34D399',
                          background: 'rgba(16, 185, 129, 0.06)',
                          border: '1px solid rgba(16, 185, 129, 0.2)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '0.45rem 0.75rem'
                        }}>
                          <strong>Benchmark: </strong>{calc.benchmark}
                        </div>
                      </div>
                    </div>

                    {/* Advanced Multi-Variation Accordion Toggle */}
                    {calc.advanced && calc.advanced.length > 0 && (
                      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
                        <button
                          onClick={() => toggleAdvanced(calc.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#818CF8',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '0.2rem 0'
                          }}
                        >
                          {isAdvOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          {isAdvOpen ? 'Hide Advanced Variations' : `Explore ${calc.advanced.length} Advanced Variations (Fully-Loaded, NPV, Cohort)`}
                        </button>

                        {isAdvOpen && (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem', marginTop: '0.75rem' }}>
                            {calc.advanced.map((adv, aIdx) => {
                              const advVals = {};
                              adv.inputs.forEach(inp => {
                                advVals[inp.id] = calcInputs[`adv_${calc.id}_${aIdx}_${inp.id}`] ?? inp.default;
                              });
                              const advResult = adv.calc(advVals);

                              return (
                                <div key={adv.name} style={{
                                  background: 'rgba(255, 255, 255, 0.02)',
                                  border: '1px solid var(--border-subtle)',
                                  borderRadius: 'var(--radius-md)',
                                  padding: '1rem',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '0.6rem'
                                }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#FFFFFF' }}>{adv.name}</span>
                                    <span style={{ fontSize: '0.68rem', color: '#6366F1', fontWeight: 700 }}>Advanced</span>
                                  </div>
                                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>{adv.desc}</p>
                                  
                                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#A5B4FC' }}>
                                    {adv.formula}
                                  </div>

                                  <div style={{ display: 'grid', gridTemplateColumns: adv.inputs.length > 2 ? 'repeat(2, 1fr)' : '1fr', gap: '0.5rem', marginTop: '4px' }}>
                                    {adv.inputs.map(inp => (
                                      <div key={inp.id}>
                                        <label style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>{inp.label}</label>
                                        <input
                                          type="number"
                                          step="any"
                                          value={calcInputs[`adv_${calc.id}_${aIdx}_${inp.id}`] ?? inp.default}
                                          onChange={e => handleAdvInputChange(calc.id, aIdx, inp.id, e.target.value)}
                                          style={{
                                            width: '100%',
                                            padding: '0.35rem 0.5rem',
                                            borderRadius: '4px',
                                            background: 'rgba(255, 255, 255, 0.04)',
                                            border: '1px solid var(--border-subtle)',
                                            color: '#fff',
                                            fontSize: '0.78rem'
                                          }}
                                        />
                                      </div>
                                    ))}
                                  </div>

                                  <div style={{
                                    marginTop: '6px',
                                    padding: '0.5rem 0.75rem',
                                    borderRadius: '6px',
                                    background: 'rgba(16, 185, 129, 0.1)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                  }}>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Result:</span>
                                    <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#10B981', fontFamily: 'var(--font-mono)' }}>
                                      {advResult}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </motion.div>
      )}

      {/* ==============================================================
          SUB-TAB 2: ACCOUNTING & FINANCE FORMULAS (30 FORMULAS)
          ============================================================== */}
      {activeSubTab === 'finance' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {FINANCE_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedFinanceCat(cat)}
                  className={`chip ${selectedFinanceCat === cat ? 'active' : ''}`}
                  style={{ fontSize: '0.75rem', padding: '0.35rem 0.8rem' }}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '0.4rem 0.8rem',
              width: '260px'
            }}>
              <Search size={14} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Search 30 formulas..."
                value={financeSearch}
                onChange={e => setFinanceSearch(e.target.value)}
                style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', fontSize: '0.82rem', width: '100%' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
            {FINANCE_FORMULAS
              .filter(f => {
                const matchesCat = selectedFinanceCat === 'All' || f.cat === selectedFinanceCat;
                const matchesSearch = f.name.toLowerCase().includes(financeSearch.toLowerCase()) ||
                  f.formula.toLowerCase().includes(financeSearch.toLowerCase());
                return matchesCat && matchesSearch;
              })
              .map((formula, fIdx) => {
                const values = {};
                formula.inputs.forEach(input => {
                  values[input.id] = financeInputs[`${formula.n}_${input.id}`] ?? (input.default || 100);
                });
                let computed = null;
                try {
                  computed = formula.calc(values);
                } catch (e) {
                  computed = null;
                }

                let displayVal = '—';
                if (typeof computed === 'number' && isFinite(computed)) {
                  if (formula.unit === 'currency') displayVal = `$${Math.round(computed).toLocaleString()}`;
                  else if (formula.unit === 'percent') displayVal = `${computed.toFixed(1)}%`;
                  else if (formula.unit === 'x' || formula.unit === 'times') displayVal = `${computed.toFixed(2)}x`;
                  else if (formula.unit === 'days') displayVal = `${computed.toFixed(1)} days`;
                  else displayVal = computed.toFixed(2);
                } else if (computed && computed.error) {
                  displayVal = computed.error;
                }

                return (
                  <div key={formula.n} className="glass-card" style={{ padding: '1.4rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span className="badge-tag badge-cyan">#{formula.n} · {formula.cat}</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{formula.unit}</span>
                      </div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', marginBottom: '0.4rem' }}>
                        {formula.name}
                      </h3>
                      <div style={{
                        fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: '#67E8F9',
                        background: 'rgba(6, 182, 212, 0.08)', padding: '0.5rem 0.75rem', borderRadius: '6px', marginBottom: '0.85rem'
                      }}>
                        {formula.formula}
                      </div>

                      {/* Inputs */}
                      <div style={{ display: 'grid', gridTemplateColumns: formula.inputs.length > 1 ? 'repeat(2, 1fr)' : '1fr', gap: '0.6rem', marginBottom: '0.85rem' }}>
                        {formula.inputs.map(inp => (
                          <div key={inp.id}>
                            <label style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>
                              {inp.label}
                            </label>
                            <input
                              type="number"
                              step="any"
                              value={financeInputs[`${formula.n}_${inp.id}`] ?? (inp.default || 100)}
                              onChange={e => handleFinanceInputChange(formula.n, inp.id, e.target.value)}
                              style={{
                                width: '100%',
                                padding: '0.4rem 0.6rem',
                                borderRadius: '4px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid var(--border-subtle)',
                                color: '#fff',
                                fontSize: '0.8rem'
                              }}
                            />
                          </div>
                        ))}
                      </div>

                      <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>
                        {formula.meaning}
                      </p>
                    </div>

                    <div style={{
                      padding: '0.65rem 0.9rem',
                      borderRadius: '8px',
                      background: 'rgba(16, 185, 129, 0.08)',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>Result:</span>
                      <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#10B981', fontFamily: 'var(--font-mono)' }}>
                        {displayVal}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </motion.div>
      )}

      {/* ==============================================================
          SUB-TAB 3: WHAT-IF SCENARIO SIMULATOR
          ============================================================== */}
      {activeSubTab === 'whatif' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="tools-whatif-layout" style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.5rem', alignItems: 'start' }}>
          {/* Left Panel: Sliders & Controls */}
          <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff' }}>Simulation Levers</h3>
              <button
                onClick={resetLevers}
                className="btn btn-ghost btn-sm"
                style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}
              >
                <RotateCcw size={12} style={{ marginRight: '4px' }} />
                Reset
              </button>
            </div>

            {/* Slider 1: Pricing / ARPU */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Pricing / ARPU</span>
                <span style={{ color: levers.priceDelta >= 0 ? '#10B981' : '#F43F5E' }}>
                  {levers.priceDelta > 0 ? `+${levers.priceDelta}%` : `${levers.priceDelta}%`}
                </span>
              </div>
              <input
                type="range"
                min="-50"
                max="50"
                step="5"
                value={levers.priceDelta}
                onChange={e => setLevers(prev => ({ ...prev, priceDelta: Number(e.target.value) }))}
                style={{ width: '100%', accentColor: 'var(--accent)' }}
              />
            </div>

            {/* Slider 2: CAC */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Acquisition Cost (CAC)</span>
                <span style={{ color: levers.cacDelta <= 0 ? '#10B981' : '#F43F5E' }}>
                  {levers.cacDelta > 0 ? `+${levers.cacDelta}%` : `${levers.cacDelta}%`}
                </span>
              </div>
              <input
                type="range"
                min="-50"
                max="50"
                step="5"
                value={levers.cacDelta}
                onChange={e => setLevers(prev => ({ ...prev, cacDelta: Number(e.target.value) }))}
                style={{ width: '100%', accentColor: 'var(--accent)' }}
              />
            </div>

            {/* Slider 3: Churn Delta */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Monthly Churn Rate</span>
                <span style={{ color: levers.churnDelta <= 0 ? '#10B981' : '#F43F5E' }}>
                  {levers.churnDelta > 0 ? `+${levers.churnDelta}%` : `${levers.churnDelta}%`}
                </span>
              </div>
              <input
                type="range"
                min="-3"
                max="5"
                step="0.5"
                value={levers.churnDelta}
                onChange={e => setLevers(prev => ({ ...prev, churnDelta: Number(e.target.value) }))}
                style={{ width: '100%', accentColor: 'var(--accent)' }}
              />
            </div>

            {/* Slider 4: Marketing Spend */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Marketing Budget Scale</span>
                <span style={{ color: levers.marketingDelta <= 0 ? '#10B981' : '#F59E0B' }}>
                  {levers.marketingDelta > 0 ? `+${levers.marketingDelta}%` : `${levers.marketingDelta}%`}
                </span>
              </div>
              <input
                type="range"
                min="-50"
                max="100"
                step="10"
                value={levers.marketingDelta}
                onChange={e => setLevers(prev => ({ ...prev, marketingDelta: Number(e.target.value) }))}
                style={{ width: '100%', accentColor: 'var(--accent)' }}
              />
            </div>

            {/* Slider 5: Growth Rate */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Revenue Growth Delta</span>
                <span style={{ color: levers.growthDelta >= 0 ? '#10B981' : '#F43F5E' }}>
                  {levers.growthDelta > 0 ? `+${levers.growthDelta}%` : `${levers.growthDelta}%`}
                </span>
              </div>
              <input
                type="range"
                min="-20"
                max="20"
                step="2"
                value={levers.growthDelta}
                onChange={e => setLevers(prev => ({ ...prev, growthDelta: Number(e.target.value) }))}
                style={{ width: '100%', accentColor: 'var(--accent)' }}
              />
            </div>
          </div>

          {/* Right Panel: Comparison Cards & Trade-off Commentary */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Trade-off Insight Banner */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(16, 185, 129, 0.1))',
              border: '1px solid rgba(129, 140, 248, 0.35)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <Zap size={18} color="#818CF8" style={{ flexShrink: 0 }} />
              <p style={{ fontSize: '0.84rem', color: '#E2E8F0', margin: 0, lineHeight: 1.5 }}>
                {tradeOffInsight}
              </p>
            </div>

            {/* 6 Key Financial Metrics Output Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              {[
                { title: 'Customer Lifetime Value', key: 'ltv' },
                { title: 'LTV : CAC Multiplier', key: 'ratio' },
                { title: 'CAC Payback Duration', key: 'payback' },
                { title: 'Projected Next Month MRR', key: 'mrr' },
                { title: 'Monthly Net Burn', key: 'burn' },
                { title: 'Cash Runway Longevity', key: 'runway' }
              ].map(item => {
                const metric = scenarioResults[item.key];
                const baseVal = metric.base;
                const scenVal = metric.scen;
                const dp = baseVal !== 0 ? ((scenVal - baseVal) / Math.abs(baseVal)) * 100 : 0;
                const isImproved = metric.better === 'up' ? scenVal > baseVal : scenVal < baseVal;
                const isChanged = Math.abs(dp) >= 0.5;

                return (
                  <div key={item.key} className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        {item.title}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                        <span style={{ fontSize: '1rem', color: 'var(--text-muted)', textDecoration: isChanged ? 'line-through' : 'none' }}>
                          {metric.fmt(baseVal)}
                        </span>
                        {isChanged && <ArrowRight size={14} color="var(--accent)" />}
                        {isChanged && (
                          <span style={{ fontSize: '1.35rem', fontWeight: 900, color: isImproved ? '#10B981' : '#F43F5E' }}>
                            {metric.fmt(scenVal)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ marginTop: '0.75rem' }}>
                      <span className={`badge-tag ${!isChanged ? 'badge-indigo' : isImproved ? 'badge-success' : 'badge-rose'}`} style={{ fontSize: '0.68rem' }}>
                        {!isChanged ? 'Base Trajectory' : `${dp > 0 ? '+' : ''}${dp.toFixed(1)}% ${isImproved ? 'Favorable' : 'Adverse'}`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* ==============================================================
          SUB-TAB 4: 12-MONTH FINANCIAL MODEL (PRO-FORMA PROJECTION)
          ============================================================== */}
      {activeSubTab === 'model12' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Summary Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="glass-card" style={{ padding: '1.2rem', borderLeft: '4px solid #10B981' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>12-Month Total Revenue</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#10B981', marginTop: '2px' }}>
                ${(fmProjection.totalRevenue / 1e6).toFixed(2)}M
              </div>
            </div>

            <div className="glass-card" style={{ padding: '1.2rem', borderLeft: '4px solid #6366F1' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>Month 12 Cash Balance</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: fmProjection.endCash >= 0 ? '#FFFFFF' : '#F43F5E', marginTop: '2px' }}>
                ${(fmProjection.endCash / 1e6).toFixed(2)}M
              </div>
            </div>

            <div className="glass-card" style={{ padding: '1.2rem', borderLeft: '4px solid #F59E0B' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>Break-Even Milestone</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: fmProjection.breakevenMonth ? '#34D399' : '#F59E0B', marginTop: '2px' }}>
                {fmProjection.breakevenMonth ? `Month ${fmProjection.breakevenMonth}` : 'Not in 12 Mo'}
              </div>
            </div>

            <div className="glass-card" style={{ padding: '1.2rem', borderLeft: '4px solid #EC4899' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>Cash Depletion Risk</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: fmProjection.runOutMonth ? '#F43F5E' : '#10B981', marginTop: '2px' }}>
                {fmProjection.runOutMonth ? `Month ${fmProjection.runOutMonth}` : 'Fully Funded'}
              </div>
            </div>
          </div>

          {/* Assumption Inputs Row */}
          <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.6rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#FFFFFF' }}>Model Planning Assumptions</h3>
              <button onClick={handleFmReset} className="btn btn-ghost btn-sm" style={{ fontSize: '0.72rem' }}>
                <RotateCcw size={12} style={{ marginRight: '4px' }} />
                Reset Defaults
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem' }}>
              {[
                { id: 'startCash', label: 'Starting Cash ($)', val: fmAssumptions.startCash },
                { id: 'startRevenue', label: 'Starting MRR ($)', val: fmAssumptions.startRevenue },
                { id: 'growthRate', label: 'Monthly Growth (%)', val: fmAssumptions.growthRate },
                { id: 'grossMargin', label: 'Gross Margin (%)', val: fmAssumptions.grossMargin },
                { id: 'salaries', label: 'Monthly Salaries ($)', val: fmAssumptions.salaries },
                { id: 'marketing', label: 'Monthly Marketing ($)', val: fmAssumptions.marketing },
                { id: 'other', label: 'Other OPEX ($)', val: fmAssumptions.other },
                { id: 'cac', label: 'Blended CAC ($)', val: fmAssumptions.cac },
              ].map(f => (
                <div key={f.id}>
                  <label style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>
                    {f.label}
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={f.val}
                    onChange={e => setFmAssumptions(prev => ({ ...prev, [f.id]: Number(e.target.value) || 0 }))}
                    style={{
                      width: '100%',
                      padding: '0.45rem 0.6rem',
                      borderRadius: '4px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-subtle)',
                      color: '#FFFFFF',
                      fontSize: '0.8rem'
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* SVG Line Chart: Cash Balance vs Revenue */}
          <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#FFFFFF' }}>
                12-Month Cash vs. Revenue Growth Trajectory
              </span>
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.74rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#6366F1' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#6366F1' }} />
                  Cash Balance
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10B981' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10B981' }} />
                  Monthly Revenue
                </span>
              </div>
            </div>

            {/* SVG Render */}
            <div style={{ width: '100%', height: '180px', background: 'rgba(0, 0, 0, 0.2)', borderRadius: 'var(--radius-md)', padding: '10px' }}>
              {(() => {
                const w = 700;
                const h = 160;
                const allCash = fmProjection.months.map(m => m.cash);
                const allRev = fmProjection.months.map(m => m.revenue);
                const minVal = Math.min(0, ...allCash, ...allRev);
                const maxVal = Math.max(...allCash, ...allRev, 1000);
                const range = maxVal - minVal || 1;

                const getX = i => (i / 11) * (w - 40) + 20;
                const getY = val => h - 25 - ((val - minVal) / range) * (h - 45);

                const cashPoints = allCash.map((val, i) => `${getX(i).toFixed(1)},${getY(val).toFixed(1)}`).join(' ');
                const revPoints = allRev.map((val, i) => `${getX(i).toFixed(1)},${getY(val).toFixed(1)}`).join(' ');
                const zeroY = getY(0);

                return (
                  <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%" preserveAspectRatio="none">
                    {/* Zero Line */}
                    <line x1="20" y1={zeroY} x2={w - 20} y2={zeroY} stroke="rgba(255,255,255,0.15)" strokeDasharray="4 4" />
                    {/* Polylines */}
                    <polyline fill="none" stroke="#6366F1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={cashPoints} />
                    <polyline fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={revPoints} />
                    {/* Month labels */}
                    {fmProjection.months.map((m, idx) => (
                      <text key={m.month} x={getX(idx)} y={h - 6} fill="var(--text-muted)" fontSize="9" textAnchor="middle" fontFamily="monospace">
                        M{m.month}
                      </text>
                    ))}
                  </svg>
                );
              })()}
            </div>
          </div>

          {/* 12-Month Table */}
          <div className="glass-card" style={{ padding: '1.25rem', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.78rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.6rem' }}>Month</th>
                  <th style={{ padding: '0.6rem' }}>Revenue</th>
                  <th style={{ padding: '0.6rem' }}>Gross Profit</th>
                  <th style={{ padding: '0.6rem' }}>OPEX</th>
                  <th style={{ padding: '0.6rem' }}>Operating P/L</th>
                  <th style={{ padding: '0.6rem' }}>Cash Balance</th>
                  <th style={{ padding: '0.6rem' }}>Active Seats</th>
                </tr>
              </thead>
              <tbody>
                {fmProjection.months.map(m => (
                  <tr key={m.month} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '0.6rem', fontWeight: 700 }}>Month {m.month}</td>
                    <td style={{ padding: '0.6rem', color: '#10B981' }}>${Math.round(m.revenue).toLocaleString()}</td>
                    <td style={{ padding: '0.6rem' }}>${Math.round(m.grossProfit).toLocaleString()}</td>
                    <td style={{ padding: '0.6rem', color: 'var(--text-muted)' }}>${Math.round(m.opex).toLocaleString()}</td>
                    <td style={{ padding: '0.6rem', color: m.opProfit >= 0 ? '#10B981' : '#F43F5E', fontWeight: 700 }}>
                      ${Math.round(m.opProfit).toLocaleString()}
                    </td>
                    <td style={{ padding: '0.6rem', fontWeight: 800, color: m.cash >= 0 ? '#FFFFFF' : '#F43F5E' }}>
                      ${Math.round(m.cash).toLocaleString()}
                    </td>
                    <td style={{ padding: '0.6rem' }}>{m.customers}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* ==============================================================
          SUB-TAB 5: METRIC RELATIONSHIP EXPLORER
          ============================================================== */}
      {activeSubTab === 'metrics' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Metric Selector Pills */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {REL_METRICS.map(m => (
              <button
                key={m.key}
                onClick={() => setSelectedRelMetric(m.key)}
                className={`chip ${selectedRelMetric === m.key ? 'active' : ''}`}
                style={{ fontSize: '0.8rem', padding: '0.4rem 1rem' }}
              >
                {m.key}
              </button>
            ))}
          </div>

          {/* Active Metric Card */}
          <div className="glass-card" style={{ padding: '1.8rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <span className="badge-tag badge-cyan">Causal Dependency Node</span>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#FFFFFF', marginTop: '4px' }}>
                {activeRelData.key} • Relational Impact Analysis
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '4px' }}>
                {activeRelData.def}
              </p>
            </div>

            {/* Causal Chain Breadcrumbs */}
            <div style={{
              background: 'rgba(0, 0, 0, 0.25)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 1.2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              flexWrap: 'wrap'
            }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>Chain:</span>
              {activeRelData.chain.map((step, idx) => (
                <React.Fragment key={step}>
                  <span style={{
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: step === activeRelData.key ? '#38BDF8' : '#FFFFFF',
                    background: step === activeRelData.key ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                    padding: '2px 8px',
                    borderRadius: '4px'
                  }}>
                    {step}
                  </span>
                  {idx < activeRelData.chain.length - 1 && <ArrowRight size={12} color="var(--text-muted)" />}
                </React.Fragment>
              ))}
            </div>

            {/* Upstream & Downstream Drivers Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '1.2rem'
              }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#A5B4FC', marginBottom: '0.6rem' }}>
                  Upstream Drivers (Affected By)
                </h4>
                <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {activeRelData.affectedBy.map(item => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '1.2rem'
              }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#34D399', marginBottom: '0.6rem' }}>
                  Downstream Consequences (Affects)
                </h4>
                <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {activeRelData.affects.map(item => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Strategic Action Recommendation */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(16, 185, 129, 0.06))',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem 1.25rem'
            }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase' }}>
                Founder Playbook Recommendation
              </span>
              <p style={{ fontSize: '0.84rem', color: '#E2E8F0', margin: '4px 0 0 0', lineHeight: 1.5 }}>
                {activeRelData.action}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
