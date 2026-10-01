import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, Map, CheckCircle2, RotateCcw, RefreshCw, 
  ChevronRight, Calendar, Users, Megaphone, Target, 
  Zap, AlertCircle, ArrowRight, ShieldCheck, Sparkles, Sliders
} from 'lucide-react';

export default function AnalyzeModule({ 
  company = {}, 
  onNavigate, 
  defaultTab = 'health' 
}) {
  const [activeTab, setActiveTab] = useState(defaultTab); // 'health' | 'audienceRoadmap'
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // ==============================================================
  // 1) STARTUP HEALTH SCORE LOGIC & STATE (from StartupIQ.html)
  // ==============================================================
  const H_FIELDS = [
    { id: 'revenue',    label: 'Monthly Revenue',     unit: '$', companyKey: 'monthlyRevenue', default: 336000 },
    { id: 'mrr',        label: 'MRR',                 unit: '$', companyKey: 'mrr', default: 336000 },
    { id: 'growth',     label: 'Monthly Growth Rate', unit: '%', companyKey: 'growthRate', default: 14 },
    { id: 'cac',        label: 'CAC',                 unit: '$', companyKey: 'cac', default: 120 },
    { id: 'ltv',        label: 'LTV',                 unit: '$', companyKey: 'ltv', default: 560 },
    { id: 'churn',      label: 'Monthly Churn Rate',  unit: '%', default: 3.2 },
    { id: 'margin',     label: 'Gross Margin',        unit: '%', companyKey: 'grossMargin', default: 72 },
    { id: 'burn',       label: 'Monthly Burn Rate',   unit: '$', companyKey: 'monthlyBurn', default: 18000 },
    { id: 'cash',       label: 'Cash Available',      unit: '$', companyKey: 'cashAvailable', default: 165000 },
    { id: 'runway',     label: 'Runway',              unit: 'mo', default: 9.2 },
    { id: 'conversion', label: 'Conversion Rate',     unit: '%', default: 4.5 },
    { id: 'customers',  label: 'Customer Count',      unit: '#', companyKey: 'customers', default: 240 },
  ];

  const [healthInputs, setHealthInputs] = useState(() => {
    const init = {};
    H_FIELDS.forEach(f => {
      init[f.id] = (f.companyKey && company[f.companyKey] !== undefined) ? company[f.companyKey] : f.default;
    });
    return init;
  });

  const handleHealthInputChange = (id, val) => {
    setHealthInputs(prev => ({
      ...prev,
      [id]: val === '' ? '' : Number(val)
    }));
  };

  const handleHealthReset = () => {
    const empty = {};
    H_FIELDS.forEach(f => { empty[f.id] = ''; });
    setHealthInputs(empty);
    showToast('Health diagnostic fields cleared');
  };

  const handleHealthUseProfile = () => {
    const populated = {};
    H_FIELDS.forEach(f => {
      populated[f.id] = (f.companyKey && company[f.companyKey] !== undefined) ? company[f.companyKey] : f.default;
    });
    setHealthInputs(populated);
    showToast(`Loaded live metrics from ${company.companyName || company.ticker || 'startup profile'}`);
  };

  // Interpolation helper from StartupIQ.html
  function lerpTable(x, pts) {
    if (x <= pts[0][0]) return pts[0][1];
    for (let i = 0; i < pts.length - 1; i++) {
      const x0 = pts[i][0], y0 = pts[i][1];
      const x1 = pts[i + 1][0], y1 = pts[i + 1][1];
      if (x <= x1) {
        const t = (x - x0) / (x1 - x0);
        return y0 + t * (y1 - y0);
      }
    }
    return pts[pts.length - 1][1];
  }
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

  // Compute Health Diagnostic Categories
  const healthResults = useMemo(() => {
    const v = healthInputs;
    const cats = [];

    // 1. Growth
    if (v.growth !== '' && v.growth !== null) {
      const g = Number(v.growth);
      const s = Math.round(lerpTable(g, [[-100, 10], [0, 25], [3, 45], [5, 58], [8, 70], [12, 82], [18, 92], [30, 98]]));
      cats.push({
        key: 'growth',
        name: 'Growth Velocity',
        score: clamp(s, 0, 100),
        exp: `At ${g}% month-over-month, your expansion velocity is ${g >= 10 ? 'strong' : g >= 5 ? 'moderate' : 'early'}. Compounding at this rate roughly ${g >= 10 ? 'doubles recurring revenue several times a year' : 'requires steady execution to reach scale'}.`,
        rec: g >= 10 ? 'Protect the channels driving this and watch that CAC stays efficient as you scale.' : 'Find one repeatable acquisition channel and focus on lifting conversion before adding new channels.'
      });
    }

    // 2. Customer Economics (LTV:CAC)
    if (v.ltv !== '' && v.cac !== '' && Number(v.cac) > 0) {
      const ratio = Number(v.ltv) / Number(v.cac);
      const s = Math.round(lerpTable(ratio, [[0, 10], [1, 35], [2, 60], [3, 80], [4, 90], [6, 97]]));
      cats.push({
        key: 'econ',
        name: 'Customer Economics',
        score: clamp(s, 0, 100),
        exp: `Your LTV:CAC ratio is about ${ratio.toFixed(1)}x. The common institutional venture benchmark is 3.0x — ${ratio >= 3 ? 'you are comfortably above it' : 'you are below the target efficiency threshold'}.`,
        rec: ratio >= 3 ? 'Healthy unit economics. Consider whether you can afford to invest more in paid acquisition to capture market share faster.' : 'Lift LTV (retention, pricing, seat expansion) or lower CAC before scaling marketing spend.'
      });
    }

    // 3. Retention (churn)
    if (v.churn !== '' && v.churn !== null) {
      const churn = Number(v.churn);
      const s = Math.round(lerpTable(churn, [[0, 97], [2, 88], [4, 74], [6, 58], [8, 42], [12, 22], [20, 8]]));
      cats.push({
        key: 'ret',
        name: 'Cohort Retention',
        score: clamp(s, 0, 100),
        exp: `Monthly churn of ${churn}% implies keeping roughly ${clamp(100 - churn, 0, 100).toFixed(0)}% of subscribers each month. ${churn <= 4 ? 'That is a solid, durable retention range for B2B models.' : 'That churn rate creates a leaky bucket fighting your new growth.'}`,
        rec: churn <= 4 ? 'Solid retention. Segment churn by cohort to prevent degradation as you scale.' : 'Prioritize user activation and early time-to-value — customer retention compounds directly into LTV.'
      });
    }

    // 4. Financial Health (runway + margin)
    let runway = v.runway !== '' && v.runway !== null ? Number(v.runway) : null;
    if (runway === null && v.cash !== '' && v.burn !== '' && Number(v.burn) > 0) {
      runway = Number(v.cash) / Number(v.burn);
    }
    const finParts = [];
    if (runway !== null) finParts.push(lerpTable(runway, [[0, 8], [3, 30], [6, 50], [12, 72], [18, 86], [24, 94]]));
    if (v.margin !== '' && v.margin !== null) finParts.push(lerpTable(Number(v.margin), [[0, 10], [30, 45], [50, 65], [70, 82], [80, 92], [90, 96]]));
    if (finParts.length) {
      const s = Math.round(finParts.reduce((a, b) => a + b, 0) / finParts.length);
      cats.push({
        key: 'fin',
        name: 'Financial Health',
        score: clamp(s, 0, 100),
        exp: `Based on ${runway ? `~${runway.toFixed(1)} months of cash runway` : ''} ${v.margin ? `and ${v.margin}% gross margin` : ''}. ${runway && runway < 6 ? 'Short runway limits strategic flexibility and deal leverage.' : 'This provides adequate runway to hit milestones before raising your next round.'}`,
        rec: runway && runway < 6 ? 'Extend runway toward a specific milestone, or begin raising from a position of strength.' : 'Keep recalculating as burn changes, and protect gross margin as headcount expands.'
      });
    }

    // 5. Product / Market Fit
    const pmParts = [];
    if (v.conversion !== '' && v.conversion !== null) pmParts.push(lerpTable(Number(v.conversion), [[0, 15], [1, 45], [2, 60], [3, 72], [5, 85], [8, 94]]));
    if (v.churn !== '' && v.churn !== null) pmParts.push(lerpTable(Number(v.churn), [[0, 95], [2, 84], [4, 70], [6, 52], [10, 30], [20, 10]]));
    if (pmParts.length) {
      const s = Math.round(pmParts.reduce((a, b) => a + b, 0) / pmParts.length);
      cats.push({
        key: 'pmf',
        name: 'Product-Market Fit',
        score: clamp(s, 0, 100),
        exp: `A blended signal from conversion rate and subscriber retention. Strong product-market fit shows up as customers converting and then sticking around.`,
        rec: s >= 75 ? 'Signals of fit are encouraging — conduct power-user interviews to double down on your core differentiator.' : 'Interview churned and newly converted accounts to find where perceived value breaks.'
      });
    }

    // 6. Operational Health (Burn Multiple)
    let opScore = null, opExp = '', opRec = '';
    const burn = Number(v.burn) || 0;
    const mrr = Number(v.mrr) || 0;
    const growth = Number(v.growth) || 0;
    if (burn > 0 && mrr > 0 && growth > 0) {
      const netNew = mrr * (growth / 100);
      const bm = burn / Math.max(netNew, 1);
      opScore = lerpTable(bm, [[0.5, 95], [1, 85], [1.5, 72], [2, 58], [3, 40], [5, 20], [10, 8]]);
      opExp = `Your burn multiple is about ${bm.toFixed(1)}x — spending approximately $${bm.toFixed(2)} to generate $1.00 of net-new monthly recurring revenue.`;
      opRec = bm <= 2.0 ? 'Efficient. Capital deployment converts well into recurring ARR.' : 'Tighten discretionary spend or increase acquisition efficiency — a high burn multiple is costly to sustain.';
    } else if (runway !== null) {
      opScore = lerpTable(runway, [[0, 10], [3, 32], [6, 52], [12, 72], [18, 88]]);
      opExp = `Estimated from runway (~${runway.toFixed(1)} months) as burn-efficiency inputs were partially supplied.`;
      opRec = 'Add MRR, growth rate, and burn rate to get an exact burn-multiple calculation.';
    }
    if (opScore !== null) {
      cats.push({
        key: 'ops',
        name: 'Operational Efficiency',
        score: clamp(Math.round(opScore), 0, 100),
        exp: opExp,
        rec: opRec
      });
    }

    const overall = cats.length ? Math.round(cats.reduce((a, c) => a + c.score, 0) / cats.length) : 78;
    return { cats, overall };
  }, [healthInputs]);

  // ==============================================================
  // 2) TARGET AUDIENCE ROADMAP & GANTT (from StartupIQ.html)
  // ==============================================================
  const [arForm, setArForm] = useState({
    product: company.companyName ? `${company.companyName} - EdTech & Learning Management Platform` : 'Teledu Learning - AI SaaS platform for coaching academies',
    category: 'B2B SaaS',
    audience: 'Independent tutors, test prep institutes, and coaching academies with 5-50 faculty members',
    problem: 'Manual fee collection, fragmented live classes, and lack of automated student performance analytics',
    region: 'South Asia & Emerging Markets',
    price: '$1,400 per year per institute',
    startDate: new Date().toISOString().slice(0, 10),
    weeks: 12
  });

  const [arScores, setArScores] = useState({
    marketFit: 68,
    buyingIntent: 60,
    painIntensity: 74,
    reachability: 58,
    competition: 42,
    conversion: 55
  });

  // GTM Phase Tracking
  const GTM_PHASES = [
    { key: 'research',   name: 'Customer Discovery', w: 1.5, desc: 'Interview 25+ target tutors & academy owners to validate core pain urgency.' },
    { key: 'persona',    name: 'ICP Persona Specs',  w: 1.0, desc: 'Codify 2 distinct buyer personas: Academy Director (Budget Holder) vs Faculty (User).' },
    { key: 'segment',    name: 'Beachhead Segment',  w: 1.0, desc: 'Carve out initial beachhead: Tier-2 city STEM coaching institutes.' },
    { key: 'channel',    name: 'Channel Selection',  w: 1.0, desc: 'Select top 2 acquisition channels: Direct Outbound & Local Educator Associations.' },
    { key: 'content',    name: 'Sales Enablement',   w: 2.0, desc: 'Build demo sandbox, ROI calculator, and video walkthroughs.' },
    { key: 'launch',     name: 'Pilot Campaign',     w: 1.5, desc: 'Go live across outbound channels with initial 50 trial academy cohorts.' },
    { key: 'testing',    name: 'A/B Funnel Testing', w: 1.5, desc: 'Optimize demo-to-contract conversion and onboarding activation speed.' },
    { key: 'analysis',   name: 'CAC & Cohort Audit', w: 1.0, desc: 'Analyze CAC payback, retention signals, and faculty daily active usage.' },
    { key: 'optimize',   name: 'Scale Playbook',     w: 1.5, desc: 'Double down on the top conversion channel and expand outbound SDR team.' }
  ];

  const [gtmProgress, setGtmProgress] = useState(() => {
    try {
      const saved = localStorage.getItem('sst_gtm_progress');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return { research: 100, persona: 100, segment: 75, channel: 50, content: 25, launch: 0, testing: 0, analysis: 0, optimize: 0 };
  });

  const handleUpdateGtmProgress = (key, val) => {
    setGtmProgress(prev => {
      const updated = { ...prev, [key]: val };
      try {
        localStorage.setItem('sst_gtm_progress', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const handleResetGtmProgress = () => {
    const reset = { research: 0, persona: 0, segment: 0, channel: 0, content: 0, launch: 0, testing: 0, analysis: 0, optimize: 0 };
    setGtmProgress(reset);
    try {
      localStorage.setItem('sst_gtm_progress', JSON.stringify(reset));
    } catch (e) {}
    showToast('GTM Gantt progress reset to initial status');
  };

  const handleDemoAudience = () => {
    setArForm({
      product: 'Teledu Learning - AI SaaS for coaching institutes',
      category: 'B2B SaaS',
      audience: 'Coaching institutes & private tutoring centers with 100-2,000 students',
      problem: 'Administrative overhead, manual test grading, and student churn to large online edtechs',
      region: 'South Asia & Southeast Asia',
      price: '$120 - $250 / month / academy',
      startDate: new Date().toISOString().slice(0, 10),
      weeks: 12
    });
    setArScores({
      marketFit: 78,
      buyingIntent: 72,
      painIntensity: 84,
      reachability: 65,
      competition: 38,
      conversion: 62
    });
    showToast('Loaded realistic high-intent B2B SaaS target audience profile');
  };

  // Audience Priority Score calculation from StartupIQ.html
  const priorityScore = useMemo(() => {
    const s = arScores;
    const w = { marketFit: 0.22, buyingIntent: 0.20, painIntensity: 0.18, reachability: 0.14, conversion: 0.16, competition: 0.10 };
    const compInverted = 100 - s.competition;
    const raw = s.marketFit * w.marketFit + s.buyingIntent * w.buyingIntent + s.painIntensity * w.painIntensity
              + s.reachability * w.reachability + s.conversion * w.conversion + compInverted * w.competition;
    return Math.round(clamp(raw, 0, 100));
  }, [arScores]);

  // Target Customer Personas
  const generatedPersonas = useMemo(() => {
    return [
      {
        name: 'Vikram, Academy Director',
        role: 'Primary Decision Maker · Owner / Founder',
        goals: 'Prevent student churn to national platforms, automate fee collections, increase admissions',
        pains: 'Spending 15+ hours weekly on admin chaos; cannot afford custom software development',
        channels: ['Direct WhatsApp Outbound', 'Regional Education Association Events', 'Peer Referral'],
        badgeColor: '#6366F1'
      },
      {
        name: 'Neha, Head of Faculty',
        role: 'Internal Champion & Power User · Senior Teacher',
        goals: 'Quick mock exam generation, automated grading, track student progress effortlessly',
        pains: 'Frustrated by complicated legacy portals; grading 200 paper exams every weekend',
        channels: ['Product Demo Sandbox', 'Teacher WhatsApp Groups', 'Self-Serve Trial'],
        badgeColor: '#10B981'
      }
    ];
  }, [arForm.category, arForm.region]);

  // Segmentation breakdown
  const segments = useMemo(() => {
    const eager = clamp(Math.round(20 + arScores.buyingIntent * 0.22 + arScores.painIntensity * 0.10), 20, 55);
    const curious = clamp(Math.round(35 + (100 - arScores.competition) * 0.12), 25, 45);
    const passive = Math.max(10, 100 - eager - curious);
    return [
      { name: 'Early Adopters (Beachhead)', share: eager, color: '#6366F1', desc: 'Academies facing intense digital competition who need an immediate modern LMS.' },
      { name: 'Pragmatic Majority', share: curious, color: '#F59E0B', desc: 'Need case studies from neighboring institutes before signing annual contracts.' },
      { name: 'Passive / Price Sensitive', share: passive, color: '#94A3B8', desc: 'Traditional single-tutor setups with low willingness to pay for digital tools.' }
    ];
  }, [arScores]);

  // Top 4 Recommended Channels
  const topChannels = [
    { name: 'Direct WhatsApp & Phone Outbound', score: 92, cadence: 'Daily Cadence', cost: 'Low Cost / SDR Time', desc: 'Direct outreach to academy directors with tailored pitch decks.' },
    { name: 'Educator Association Partnerships', score: 86, cadence: 'Bi-Weekly BD', cost: 'Commission / Rev-Share', desc: 'Partnering with state tutoring associations for accredited vendor access.' },
    { name: 'SEO & Regional Search Landing Pages', score: 79, cadence: 'Always-On', cost: 'Organic / Compounding', desc: 'Targeting high-intent terms like "institute management software South Asia".' },
    { name: 'Referral & Co-Marketing Credits', score: 74, cadence: 'Automated In-App', cost: '1 Month Free Credit', desc: 'Rewarding institute owners for referring peers in non-competing regions.' }
  ];

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

      {/* Main Header Card */}
      <div className="glass-card" style={{ padding: '1.75rem 2rem', borderLeft: '4px solid #6366F1' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
              <span className="badge-tag badge-indigo">
                <Activity size={13} style={{ marginRight: '4px' }} />
                Venture Intelligence
              </span>
              <span className="badge-tag badge-cyan">StartupIQ Analyze Suite</span>
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Venture Diagnostics & Audience Roadmap
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '780px', marginTop: '4px' }}>
              Diagnose startup health percentiles across burn, growth, and unit economics, and formulate your complete go-to-market audience roadmap and launch timeline.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: 'flex',
          gap: '6px',
          background: 'rgba(255, 255, 255, 0.04)',
          padding: '4px',
          borderRadius: 'var(--radius-pill)',
          marginTop: '1.5rem',
          width: 'fit-content'
        }}>
          <button
            onClick={() => setActiveTab('health')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.45rem 1.2rem',
              borderRadius: 'var(--radius-pill)',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: activeTab === 'health' ? 'var(--accent)' : 'transparent',
              color: activeTab === 'health' ? '#FFFFFF' : 'var(--text-muted)',
              transition: 'all 0.18s ease'
            }}
          >
            <Activity size={14} />
            <span>Startup Health Score</span>
            <span style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: '8px', background: 'rgba(255,255,255,0.15)' }}>
              Diagnostic
            </span>
          </button>

          <button
            onClick={() => setActiveTab('audienceRoadmap')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.45rem 1.2rem',
              borderRadius: 'var(--radius-pill)',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: activeTab === 'audienceRoadmap' ? 'var(--accent)' : 'transparent',
              color: activeTab === 'audienceRoadmap' ? '#FFFFFF' : 'var(--text-muted)',
              transition: 'all 0.18s ease'
            }}
          >
            <Map size={14} />
            <span>Audience Roadmap</span>
            <span style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: '8px', background: 'rgba(255,255,255,0.15)' }}>
              GTM & Gantt
            </span>
          </button>
        </div>
      </div>

      {/* ==============================================================
          VIEW 1: STARTUP HEALTH SCORE (from StartupIQ.html)
          ============================================================== */}
      {activeTab === 'health' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 360px) minmax(0, 1fr)', gap: '1.5rem', alignItems: 'start' }}>
          {/* Left Column: Number Input Form */}
          <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.6rem' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff' }}>Your Numbers</h3>
                <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: 0 }}>Enter figures you know. Empty inputs are skipped.</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
              {H_FIELDS.map(f => (
                <div key={f.id}>
                  <label style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>
                    {f.label} ({f.unit})
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={healthInputs[f.id] ?? ''}
                    placeholder="—"
                    onChange={e => handleHealthInputChange(f.id, e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.45rem 0.6rem',
                      borderRadius: '4px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-subtle)',
                      color: '#fff',
                      fontSize: '0.8rem',
                      fontFamily: 'var(--font-mono)'
                    }}
                  />
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleHealthUseProfile}
                className="btn btn-primary btn-sm"
                style={{ flex: 1, justifyContent: 'center', fontSize: '0.75rem' }}
              >
                <RefreshCw size={12} style={{ marginRight: '4px' }} />
                Use My Startup Data
              </button>
              <button
                type="button"
                onClick={handleHealthReset}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '0.75rem' }}
              >
                Clear
              </button>
            </div>
          </div>

          {/* Right Column: Diagnostic Output Canvas */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Top Score Banner */}
            <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.75rem', flexWrap: 'wrap' }}>
              {/* Radial SVG Gauge Ring */}
              <div style={{ position: 'relative', width: '120px', height: '120px', flexShrink: 0 }}>
                {(() => {
                  const R = 48;
                  const C = 2 * Math.PI * R;
                  const off = C * (1 - healthResults.overall / 100);
                  const color = healthResults.overall >= 80 ? '#10B981' : healthResults.overall >= 60 ? '#F59E0B' : '#F43F5E';
                  return (
                    <svg width="120" height="120" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
                      <circle
                        cx="60"
                        cy="60"
                        r={R}
                        fill="none"
                        stroke={color}
                        strokeWidth="10"
                        strokeDasharray={C}
                        strokeDashoffset={off}
                        strokeLinecap="round"
                        transform="rotate(-90 60 60)"
                        style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                      />
                    </svg>
                  );
                })()}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{ fontSize: '1.8rem', fontWeight: 900, color: '#FFFFFF', fontFamily: 'var(--font-mono)', lineHeight: 1 }}>
                    {healthResults.overall}
                  </span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                    / 100
                  </span>
                </div>
              </div>

              {/* Status and Summary Text */}
              <div style={{ flex: 1, minWidth: '220px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span className={`badge-tag ${healthResults.overall >= 80 ? 'badge-success' : healthResults.overall >= 60 ? 'badge-indigo' : 'badge-rose'}`}>
                    {healthResults.overall >= 80 ? 'Healthy • Top Percentile' : healthResults.overall >= 60 ? 'Moderate • Above Average' : 'Needs Optimization'}
                  </span>
                  <span style={{ fontSize: '0.74rem', color: '#10B981', fontWeight: 700 }}>
                    Venture Benchmark Verified
                  </span>
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                  Startup Health Diagnostics
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.5 }}>
                  {healthResults.overall >= 80
                    ? 'Across the operational metrics provided, your startup displays institutional-grade capital efficiency and resilient retention.'
                    : healthResults.overall >= 60
                    ? 'A balanced profile. Fundamentals are working, with specific opportunities to tighten CAC payback and expand customer lifetime value.'
                    : 'Several core metrics require strategic attention. Prioritize reducing burn rate and testing price elasticity.'}
                </p>
              </div>
            </div>

            {/* Diagnostic Categories Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
              {healthResults.cats.map(cat => {
                const statusKey = cat.score >= 80 ? 'healthy' : cat.score >= 60 ? 'moderate' : 'risk';
                const color = statusKey === 'healthy' ? '#10B981' : statusKey === 'moderate' ? '#F59E0B' : '#F43F5E';

                return (
                  <div key={cat.key} className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#FFFFFF' }}>{cat.name}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '1rem', fontWeight: 900, color: color, fontFamily: 'var(--font-mono)' }}>
                          {cat.score}
                        </span>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>/ 100</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div style={{ height: '6px', borderRadius: 'var(--radius-pill)', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                      <div style={{ width: `${cat.score}%`, height: '100%', background: color, transition: 'width 0.6s ease' }} />
                    </div>

                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>
                      {cat.exp}
                    </p>

                    <div style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '6px',
                      padding: '0.5rem 0.75rem',
                      fontSize: '0.74rem',
                      color: '#E2E8F0',
                      marginTop: '4px'
                    }}>
                      <strong style={{ color: 'var(--accent)' }}>Improve: </strong>
                      {cat.rec}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* ==============================================================
          VIEW 2: AUDIENCE ROADMAP & GANTT (from StartupIQ.html)
          ============================================================== */}
      {activeTab === 'audienceRoadmap' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 360px) minmax(0, 1fr)', gap: '1.5rem', alignItems: 'start' }}>
          {/* Left Column: Form with Sliders & Dates */}
          <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff' }}>Describe Your Audience</h3>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: 0 }}>Sliders drive the needle gauges; dates drive the launch Gantt.</p>
            </div>

            {/* Input Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Product One-Liner</label>
                <input
                  type="text"
                  value={arForm.product}
                  onChange={e => setArForm({ ...arForm, product: e.target.value })}
                  style={{ width: '100%', padding: '0.45rem 0.6rem', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', color: '#fff', fontSize: '0.8rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Business Type</label>
                <select
                  value={arForm.category}
                  onChange={e => setArForm({ ...arForm, category: e.target.value })}
                  style={{ width: '100%', padding: '0.45rem 0.6rem', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', color: '#fff', fontSize: '0.8rem' }}
                >
                  {['B2B SaaS', 'B2C App', 'Marketplace', 'E-commerce / DTC', 'Services / Agency', 'Fintech', 'Education', 'Other'].map(opt => (
                    <option key={opt} value={opt} style={{ background: '#1E1E24', color: '#fff' }}>{opt}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Target Customer Segment</label>
                <textarea
                  rows={2}
                  value={arForm.audience}
                  onChange={e => setArForm({ ...arForm, audience: e.target.value })}
                  style={{ width: '100%', padding: '0.45rem 0.6rem', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', color: '#fff', fontSize: '0.8rem', resize: 'vertical' }}
                />
              </div>
            </div>

            {/* 6 Sliders (0 - 100) */}
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#A5B4FC', textTransform: 'uppercase' }}>
                Rate Your Audience (0–100)
              </span>

              {[
                { id: 'marketFit', label: 'Market Fit' },
                { id: 'buyingIntent', label: 'Buying Intent' },
                { id: 'painIntensity', label: 'Pain Intensity' },
                { id: 'reachability', label: 'Reachability' },
                { id: 'competition', label: 'Competition' },
                { id: 'conversion', label: 'Conversion Potential' }
              ].map(sl => (
                <div key={sl.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 700, marginBottom: '2px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{sl.label}</span>
                    <span style={{ color: '#60A5FA' }}>{arScores[sl.id]}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={arScores[sl.id]}
                    onChange={e => setArScores({ ...arScores, [sl.id]: Number(e.target.value) })}
                    style={{ width: '100%', accentColor: 'var(--accent)' }}
                  />
                </div>
              ))}
            </div>

            {/* Launch Plan Dates */}
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#A5B4FC', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                Launch Plan Parameters
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                <div>
                  <label style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>Start Date</label>
                  <input
                    type="date"
                    value={arForm.startDate}
                    onChange={e => setArForm({ ...arForm, startDate: e.target.value })}
                    style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', color: '#fff', fontSize: '0.75rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>Timeline Length</label>
                  <select
                    value={arForm.weeks}
                    onChange={e => setArForm({ ...arForm, weeks: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', color: '#fff', fontSize: '0.75rem' }}
                  >
                    {[8, 10, 12, 16, 20].map(w => (
                      <option key={w} value={w} style={{ background: '#1E1E24', color: '#fff' }}>{w} weeks</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={handleDemoAudience}
                className="btn btn-secondary btn-sm"
                style={{ flex: 1, justifyContent: 'center', fontSize: '0.74rem' }}
              >
                <Sparkles size={12} style={{ marginRight: '4px' }} />
                Demo Audience
              </button>
            </div>
          </div>

          {/* Right Column: Visual GTM Intelligence Canvas */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* 1. Audience Priority Score Banner */}
            <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderLeft: '4px solid #10B981' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span className={`badge-tag ${priorityScore >= 70 ? 'badge-success' : priorityScore >= 50 ? 'badge-indigo' : 'badge-amber'}`}>
                    {priorityScore >= 70 ? 'High Priority • Ideal Target' : priorityScore >= 50 ? 'Promising Opportunity' : 'Needs Validation'}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Algorithmically Weighted</span>
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                  Audience Priority Index: {priorityScore} / 100
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px', maxWidth: '580px' }}>
                  {priorityScore >= 70
                    ? 'This audience scores high across buying intent, acute pain, and conversion viability. Concentrate initial launch budget and messaging here.'
                    : 'Workable market opportunity with clear strengths. Address reachability and funnel friction before scaling paid spend.'}
                </p>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '2.2rem', fontWeight: 900, color: '#10B981', fontFamily: 'var(--font-mono)' }}>
                  {priorityScore}%
                </span>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Target Conviction</div>
              </div>
            </div>

            {/* 2. Six Half-Circle SVG Needle Gauges (Exact UI from StartupIQ.html) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem' }}>
              {[
                { id: 'marketFit', name: 'Market Fit', score: arScores.marketFit },
                { id: 'buyingIntent', name: 'Buying Intent', score: arScores.buyingIntent },
                { id: 'painIntensity', name: 'Pain Intensity', score: arScores.painIntensity },
                { id: 'reachability', name: 'Reachability', score: arScores.reachability },
                { id: 'competition', name: 'Low Rivalry', score: 100 - arScores.competition },
                { id: 'conversion', name: 'Conversion Potential', score: arScores.conversion }
              ].map(g => {
                const angle = (g.score / 100) * 180 - 90;
                const col = g.score >= 67 ? '#10B981' : g.score >= 40 ? '#F59E0B' : '#F43F5E';
                const tag = g.score >= 67 ? 'Strong' : g.score >= 40 ? 'Moderate' : 'Weak';

                return (
                  <div key={g.id} className="glass-card" style={{ padding: '1rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {/* SVG Gauge */}
                    <div style={{ width: '110px', height: '58px', marginBottom: '2px' }}>
                      <svg width="110" height="58" viewBox="0 0 118 62">
                        {/* Background track */}
                        <path d="M 13 56 A 46 46 0 0 1 105 56" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="9" strokeLinecap="round" />
                        {/* Colored Arc */}
                        <path
                          d="M 13 56 A 46 46 0 0 1 105 56"
                          fill="none"
                          stroke={col}
                          strokeWidth="9"
                          strokeLinecap="round"
                          strokeDasharray={Math.PI * 46}
                          strokeDashoffset={Math.PI * 46 * (1 - g.score / 100)}
                          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                        />
                        {/* Needle */}
                        <line
                          x1="59"
                          y1="56"
                          x2="59"
                          y2="20"
                          stroke="#FFFFFF"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          style={{
                            transformOrigin: '59px 56px',
                            transform: `rotate(${angle}deg)`,
                            transition: 'transform 0.8s cubic-bezier(0.2, 0.7, 0.3, 1)'
                          }}
                        />
                        <circle cx="59" cy="56" r="4.5" fill="#FFFFFF" />
                      </svg>
                    </div>

                    <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fff', fontFamily: 'var(--font-mono)' }}>
                      {g.score}<span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>/100</span>
                    </div>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                      {g.name}
                    </span>
                    <span style={{ fontSize: '0.65rem', fontWeight: 800, color: col, textTransform: 'uppercase', marginTop: '2px' }}>
                      {tag}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* 3. Generated ICP Personas */}
            <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={17} color="var(--accent)" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff' }}>Target ICP Personas</h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                {generatedPersonas.map(p => (
                  <div key={p.name} style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.1rem',
                    borderLeft: `4px solid ${p.badgeColor}`
                  }}>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff' }}>{p.name}</div>
                    <div style={{ fontSize: '0.74rem', color: p.badgeColor, fontWeight: 700, marginBottom: '6px' }}>{p.role}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      <strong style={{ color: '#fff' }}>Goals: </strong>{p.goals}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                      <strong style={{ color: '#F43F5E' }}>Pains: </strong>{p.pains}
                    </div>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {p.channels.map(ch => (
                        <span key={ch} style={{ fontSize: '0.68rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)' }}>
                          {ch}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Audience Segmentation Bar */}
            <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fff' }}>Audience Segmentation Breakdown</span>
              {/* Stacked bar */}
              <div style={{ height: '14px', borderRadius: 'var(--radius-pill)', overflow: 'hidden', display: 'flex' }}>
                {segments.map(seg => (
                  <div key={seg.name} style={{ width: `${seg.share}%`, background: seg.color }} title={`${seg.name}: ${seg.share}%`} />
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                {segments.map(seg => (
                  <div key={seg.name} style={{ fontSize: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#fff' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: seg.color }} />
                      {seg.name} ({seg.share}%)
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', margin: '2px 0 0 14px' }}>
                      {seg.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* 5. Interactive GTM Launch Timeline & Gantt (from StartupIQ.html) */}
            <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff' }}>12-Week Launch Gantt Timeline</h3>
                  <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: 0 }}>Interactive execution roadmap across 9 chronological phases.</p>
                </div>
                <button onClick={handleResetGtmProgress} className="btn btn-ghost btn-sm" style={{ fontSize: '0.72rem' }}>
                  <RotateCcw size={12} style={{ marginRight: '4px' }} />
                  Reset Timeline Progress
                </button>
              </div>

              {/* Gantt Phase Rows */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {GTM_PHASES.map((phase, idx) => {
                  const prog = gtmProgress[phase.key] || 0;
                  const isDone = prog >= 100;
                  const isActive = prog > 0 && prog < 100;
                  const color = isDone ? '#10B981' : isActive ? '#6366F1' : '#94A3B8';

                  return (
                    <div key={phase.key} style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.85rem 1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            background: isDone ? 'rgba(16, 185, 129, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                            color: isDone ? '#10B981' : '#A5B4FC',
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            {isDone ? '✓' : idx + 1}
                          </span>
                          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fff' }}>{phase.name}</span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>({phase.w} wks)</span>
                        </div>

                        {/* Progress Buttons Preset */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {[0, 25, 50, 75, 100].map(val => (
                            <button
                              key={val}
                              onClick={() => handleUpdateGtmProgress(phase.key, val)}
                              style={{
                                padding: '2px 7px',
                                borderRadius: '4px',
                                border: '1px solid var(--border-subtle)',
                                background: prog === val ? 'var(--accent)' : 'rgba(255,255,255,0.04)',
                                color: prog === val ? '#fff' : 'var(--text-muted)',
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              {val === 0 ? '—' : val === 100 ? '✓' : `${val}%`}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Progress Track */}
                      <div style={{ height: '5px', borderRadius: 'var(--radius-pill)', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                        <div style={{ width: `${prog}%`, height: '100%', background: color, transition: 'width 0.4s ease' }} />
                      </div>

                      <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                        {phase.desc}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
