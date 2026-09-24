import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, TrendingUp, Activity, DollarSign, Compass, ShieldCheck, 
  ArrowUpRight, ArrowRight, Zap, Target, BookOpen, Library, 
  FlaskConical, Map, CheckSquare, Calculator, Network, 
  Wand2, HelpCircle, Briefcase, FileSpreadsheet, Bookmark, 
  FolderLock, Layers, BarChart3, Clock, AlertTriangle, CheckCircle2
} from 'lucide-react';
import GaugeRing from '../common/GaugeRing';

export default function OverviewModule({ onNavigate, company, healthScore, onOpenAI }) {
  const [activeSubTab, setActiveSubTab] = useState('projections'); // 'projections' | 'unit-economics' | 'experiments'

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
        { id: 'metrics', title: 'Metric Driver Network', desc: 'Trace how CAC shifts LTV:CAC, and how burn shifts runway.', icon: Network, badge: 'Simulations' },
        { id: 'health-score', title: 'Startup Health Score', desc: 'Algorithmic benchmark measuring growth, burn & churn.', icon: Activity, badge: '84.5 / 100' },
        { id: 'formulas', title: '30 Finance Calculators', desc: 'Formulas for profitability, liquidity, turnover & valuation.', icon: Calculator, badge: '30 Cards' }
      ]
    },
    {
      domain: 'Academy & Knowledge Base',
      color: '#8B5CF6',
      tools: [
        { id: 'learning', title: '30 Core Curriculum Lessons', desc: 'Structured frameworks from Idea stage to IPO governance.', icon: BookOpen, badge: '5 Tracks' },
        { id: 'terms', title: '50 Startup Terms Library', desc: 'Exact formulas, real examples & AI prompt presets.', icon: Library, badge: '50 Terms' },
        { id: 'marketing', title: 'Marketing Index (25 KPIs)', desc: 'Formulas for ROAS, CTR, Payback & blended acquisition.', icon: BarChart3, badge: '25 KPIs' },
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
      {/* ============================================================
          ZONE 1: LIVE FINANCIAL TELEMETRY STRIP
          ============================================================ */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem'
      }}>
        {/* DCF Valuation */}
        <div className="glass-card" style={{ padding: '1.4rem', borderLeft: '4px solid #6366F1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              DCF Enterprise Value
            </span>
            <span className="badge-tag badge-indigo">+17.0% UPSIDE</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: '4px' }} className="numeral-mono">
            $5.85M
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Fair Share Price: <strong style={{ color: '#10B981' }}>$58.50</strong> (Asking: $50.00)
          </div>
        </div>

        {/* Revenue Run-Rate */}
        <div className="glass-card" style={{ padding: '1.4rem', borderLeft: '4px solid #10B981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Annual Run-Rate (ARR)
            </span>
            <span className="badge-tag badge-success">+68% YOY</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#10B981', marginTop: '4px' }} className="numeral-mono">
            $336,000
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Current MRR: <strong style={{ color: 'var(--text-primary)' }}>$28,000/mo</strong> across 240 seats
          </div>
        </div>

        {/* Startup Health Score */}
        <div className="glass-card" style={{ padding: '1.4rem', borderLeft: '4px solid #F59E0B' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Startup Health Score
            </span>
            <span style={{ fontSize: '0.74rem', color: '#FBBF24', fontWeight: 800 }}>84.5 / 100</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#FBBF24', marginTop: '4px' }} className="numeral-mono">
            Top 8th Percentile
          </div>
          <div style={{ fontSize: '0.74rem', color: '#34D399', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
            <span className="beacon-dot" />
            Institutional Investment Ready
          </div>
        </div>

        {/* Cash Runway */}
        <div className="glass-card" style={{ padding: '1.4rem', borderLeft: '4px solid #06B6D4' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Cash Runway
            </span>
            <span className="badge-tag badge-cyan">CASH FLOW SAFE</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: '4px' }} className="numeral-mono">
            8.7 Months
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Burn: <strong>$18,000/mo</strong> • Cash: <strong>$165,000</strong>
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
            BUY
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Based on Gordon Growth DCF model
          </div>
        </div>
      </div>

      {/* ============================================================
          ZONE 2: DUAL-ZONE EXECUTIVE INTELLIGENCE WORKSPACE
          ============================================================ */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.8fr) minmax(340px, 1.1fr)',
        gap: '1.6rem',
        alignItems: 'start'
      }}>
        {/* Left Side: Interactive Operating Telemetry Canvas */}
        <div className="glass-card" style={{ padding: '1.8rem', display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
          {/* Sub-Tabs Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {company.companyName} • Operational Intelligence
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Ticker: <strong style={{ color: 'var(--accent)' }}>{company.ticker}</strong> • {company.industry} • Series: Seed
              </p>
            </div>

            {/* Switchable View Pills */}
            <div style={{ display: 'flex', gap: '4px', background: 'rgba(255, 255, 255, 0.04)', padding: '3px', borderRadius: 'var(--radius-pill)' }}>
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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', fontSize: '0.8rem' }}>
                <div style={{ padding: '0.8rem', borderRadius: 'var(--radius-md)', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Gross Margin</div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#10B981', marginTop: '2px' }}>72.0%</div>
                </div>
                <div style={{ padding: '0.8rem', borderRadius: 'var(--radius-md)', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>EBITDA Margin</div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)', marginTop: '2px' }}>24.0%</div>
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
                  <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>5-Year Compound Revenue Projections ($K)</span>
                  <span style={{ color: '#34D399', fontWeight: 800 }}>CAGR: +68.0%</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.6rem', alignItems: 'end', height: '110px', padding: '0.5rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  {[
                    { year: 'Yr 1', rev: '$336K', height: '24%' },
                    { year: 'Yr 2', rev: '$564K', height: '42%' },
                    { year: 'Yr 3', rev: '$948K', height: '62%' },
                    { year: 'Yr 4', rev: '$1.59M', height: '82%' },
                    { year: 'Yr 5', rev: '$2.67M', height: '100%' },
                  ].map((col, idx) => (
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              <div style={{ padding: '1.2rem', borderRadius: 'var(--radius-md)', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Customer Acquisition Cost (CAC)</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: '4px' }}>$120</div>
                <div style={{ fontSize: '0.72rem', color: '#10B981', marginTop: '4px' }}>Blended organic + paid</div>
              </div>
              <div style={{ padding: '1.2rem', borderRadius: 'var(--radius-md)', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Customer Lifetime Value (LTV)</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#10B981', marginTop: '4px' }}>$560</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>Estimated 20-month retention</div>
              </div>
              <div style={{ padding: '1.2rem', borderRadius: 'var(--radius-md)', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>LTV : CAC Multiplier</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#34D399', marginTop: '4px' }}>4.66x</div>
                <div style={{ fontSize: '0.72rem', color: '#34D399', marginTop: '4px' }}>Benchmark: &gt; 3.0x (Elite)</div>
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
              { label: 'Virtual Data Room (VDR) Documents', value: 80, color: '#F59E0B' },
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
              onClick={() => onNavigate('cap-table')}
              className="btn btn-secondary btn-sm"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <Layers size={15} /> Inspect Cap Table & Dilution
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

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.4rem'
        }}>
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
    </div>
  );
}
