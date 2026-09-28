import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Bot, X, Send, Maximize2, Minimize2, Copy, Check,
  Zap, TrendingUp, DollarSign, Clock, ArrowRight, MessageSquare,
  Activity, Target, Award, RefreshCw, ChevronRight, HelpCircle
} from 'lucide-react';
import { api } from '../../api/client';

export default function FloatingAICopilot({
  isOpen,
  setIsOpen,
  company = {}
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isOpen !== undefined ? isOpen : internalOpen;
  const setOpen = setIsOpen || setInternalOpen;

  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'playbooks' | 'prompt'
  const [isExpanded, setIsExpanded] = useState(false);
  const [aiStatus, setAiStatus] = useState({ activeProvider: 'StartupIQ Venture Core Engine', isLiveLLM: false });

  // Chat State
  const [chatInput, setChatInput] = useState('');
  const [chatting, setChatting] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'assistant',
      text: `Hello! I am your AI Venture Copilot. I have indexed ${company?.companyName || 'your startup'}'s live telemetry. Ask me anything about runway preservation, CAC payback compression, unit economics, or fundraising defense.`
    }
  ]);
  const messagesEndRef = useRef(null);

  // Strategic Playbooks State
  const [taskType, setTaskType] = useState('strategy');
  const [goal, setGoal] = useState('Audit current burn rate and identify immediate levers to extend runway past 18 months.');
  const [analyzing, setAnalyzing] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState(null);
  const [copiedReport, setCopiedReport] = useState(false);

  // Prompt Studio State
  const [audience, setAudience] = useState('Seed & Series A Venture Investors');
  const [tone, setTone] = useState('tactical, rigorous, direct');
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [compilingPrompt, setCompilingPrompt] = useState(false);

  // Curated 1-Click Playbooks
  const PLAYBOOKS = [
    {
      id: 'runway',
      type: 'strategy',
      title: 'Runway Extension & Burn Cut',
      desc: 'Extend runway past 18 months without firing key engineers',
      goal: 'Audit current monthly burn, eliminate non-core SaaS/marketing waste, and structure an upfront annual prepayment incentive to extend runway past 18 months.'
    },
    {
      id: 'cac',
      type: 'growth',
      title: 'CAC Payback & Acquisition Turnaround',
      desc: 'Compress payback window under 10 months and diversify away from paid ads',
      goal: 'Diagnose current blended CAC, identify 2 organic/product-led expansion channels, and compress payback window to under 10 months.'
    },
    {
      id: 'pitch',
      type: 'fundraising',
      title: 'Series A Pitch Defense & Diligence Audit',
      desc: 'Stress-test unit economics against Tier-1 VC partner challenges',
      goal: 'Audit cohort retention, gross margin expansion, and Rule of 40 readiness to prepare counter-arguments for institutional venture capital diligence.'
    },
    {
      id: 'pricing',
      type: 'unitEconomics',
      title: 'Pricing & Net Expansion Monetization',
      desc: 'Transition from flat seat pricing to usage-based value metric',
      goal: 'Redesign packaging tiers to introduce a high-margin expansion lever that increases net revenue retention (NRR) past 115%.'
    }
  ];

  // Helper currency formatter
  const fmt = (num) => '$' + (Number(num) || 0).toLocaleString('en-US');

  // Company financial metrics
  const companyName = company?.companyName || company?.name || 'Startup';
  const ticker = company?.ticker || 'PORT';
  const stage = company?.stage || 'Seed';
  const industry = company?.industry || 'Technology';
  const mrr = company?.monthlyRevenue || company?.mrr || 42000;
  const burn = company?.monthlyBurn || 28000;
  const cash = company?.cashAvailable || 340000;
  const cac = company?.cac || 420;
  const ltv = company?.ltv || 1680;
  const churn = company?.churnRate || 3.2;
  const runway = burn > 0 ? (cash / burn).toFixed(1) : '12.1';
  const ltvCac = cac > 0 ? (ltv / cac).toFixed(1) : '4.0';

  // Keyboard shortcut Ctrl + J or Alt + A
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        setOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setOpen]);

  // Fetch AI status
  useEffect(() => {
    api.getAIStatus?.()
      .then(res => {
        const payload = res?.data || res;
        if (payload?.activeProvider) setAiStatus(payload);
      })
      .catch(() => {});
  }, []);

  // Scroll to bottom of chat
  useEffect(() => {
    if (activeTab === 'chat' && open) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeTab, open]);

  // Local briefing generator fallback
  const generateLocalBriefing = ({ goalText, typeParam }) => {
    return `# StartupIQ Executive Venture Briefing: ${companyName} (${ticker})
**Intelligence Model:** StartupIQ Venture Core (Institutional Advisory Engine)
**Stage / Sector:** ${stage} · ${industry} | **Runway:** ${runway} Months (${fmt(cash)} liquid)

---

### 1. Executive Summary & Diagnostic Verdict
Based on current operating metrics, **${companyName}** demonstrates an **LTV:CAC ratio of ${ltvCac}x** and monthly recurring revenue of **${fmt(mrr)}**, with net burn stabilizing at **${fmt(burn)}/mo**.
The strategic mandate—*"${goalText || goal}"*—requires tightening unit acquisition payback while maximizing organic product retention.

---

### 2. Metrics Drill-Down
- **Capital Runway:** ${runway} certified months (${fmt(cash)} cash on hand / ${fmt(burn)} net burn). Preserving a 14+ month cushion ensures favorable terms during next round.
- **Unit Economics Health:** Blended CAC ${fmt(cac)} vs. LTV ${fmt(ltv)} (${ltvCac}x efficiency). Monthly churn is ${churn}%.
- **Core Priority:** Shift focus from paid customer acquisition toward high-margin expansion cohorts.

---

### 3. 14-Day Tactical Execution Sprint
- **Day 1–3:** Audit customer drop-off in the first 72 hours; remove friction in initial time-to-value.
- **Day 4–7:** Eliminate underperforming marketing channels; redirect spend to highest converting landing page.
- **Day 8–10:** Launch an annual upfront pre-pay discount (15% off) to immediately pull forward working capital.
- **Day 11–14:** Package cohort retention analytics into an investor-ready diligence slide.`;
  };

  // Run Strategic Diagnosis
  const executeAnalysis = async (targetGoal, targetType) => {
    setAnalyzing(true);
    setAiAnalysisResult(null);

    const goalToUse = targetGoal || goal;
    const typeToUse = targetType || taskType;

    try {
      const res = await api.generateAIAnalysis({
        ticker,
        type: typeToUse,
        goal: goalToUse
      });
      const payload = res?.data || res;
      if (payload && payload.text) {
        setAiAnalysisResult(payload);
        setAnalyzing(false);
        return;
      }
    } catch (err) {
      console.warn('API call failed, generating local briefing:', err);
    }

    const text = generateLocalBriefing({ goalText: goalToUse, typeParam: typeToUse });
    setAiAnalysisResult({
      text,
      provider: 'venture-core',
      model: 'StartupIQ Venture Core Engine'
    });
    setAnalyzing(false);
  };

  // Handle Chat Submit
  const handleSendChat = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!chatInput.trim() || chatting) return;

    const userMsg = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatting(true);

    try {
      const res = await api.askAICopilot({
        ticker,
        message: userMsg
      });
      const reply = res?.data?.text || res?.text;
      if (reply) {
        setChatMessages(prev => [...prev, { role: 'assistant', text: reply }]);
        setChatting(false);
        return;
      }
    } catch (err) {
      console.warn('AI copilot API call failed, generating contextual fallback:', err);
    }

    const smartReply = `Based on ${companyName}'s operating telemetry (${runway} months runway, ${fmt(mrr)} MRR, ${fmt(burn)} burn rate), here is my strategic recommendation on "${userMsg}":\n\n` +
      `1. **Immediate Focus:** Protect your ${runway}-month runway by pausing acquisition channels with CAC payback > 12 months.\n` +
      `2. **Working Capital Strategy:** Introduce annual upfront payment incentives (15% discount) to immediately generate liquid cash without dilution.\n` +
      `3. **Diligence Preparedness:** Keep your LTV:CAC multiple above 3.0x (${ltvCac}x currently) and document cohort retention curves for partner meetings.`;

    setChatMessages(prev => [...prev, { role: 'assistant', text: smartReply }]);
    setChatting(false);
  };

  // Handle Quick Prompt Chips
  const handlePromptChipClick = (promptText) => {
    setChatInput(promptText);
  };

  // Compile Master Prompt for ChatGPT / Claude
  const handleCompilePrompt = () => {
    setCompilingPrompt(true);
    const p = [
      `You are an institutional venture operating advisor analyzing ${companyName} (${ticker}).`,
      `Objective: ${goal}`,
      '',
      'COMPANY OPERATING CONTEXT:',
      `- Industry: ${industry}`,
      `- Stage: ${stage}`,
      `- Monthly Recurring Revenue (MRR): ${fmt(mrr)}`,
      `- Net Monthly Burn: ${fmt(burn)}`,
      `- Cash Reserves: ${fmt(cash)} (Runway: ${runway} Months)`,
      `- Blended CAC: ${fmt(cac)} | Customer LTV: ${fmt(ltv)} | Churn: ${churn}%`,
      `- LTV:CAC Multiplier: ${ltvCac}x`,
      '',
      `Target Audience: ${audience}`,
      `Tone & Methodology: ${tone}`,
      '',
      'DELIVERABLE EXPECTED:',
      '1. Root cause diagnosis with mathematical justification.',
      '2. Tactical 14-day execution plan organized into weekly sprints.',
      '3. Specific investor diligence risk guardrails and metric counter-measures.'
    ].join('\n');

    setGeneratedPrompt(p);
    setTimeout(() => setCompilingPrompt(false), 300);
  };

  return (
    <>
      {/* ============================================================== */}
      {/* 1. FLOATING LAUNCHER BUTTON (ALWAYS ACCESSIBLE AT BOTTOM RIGHT) */}
      {/* ============================================================== */}
      <motion.button
        type="button"
        className="floating-ai-launcher"
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 1050,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '0.75rem 1.25rem',
          borderRadius: '9999px',
          background: 'linear-gradient(135deg, #4338CA 0%, #6366F1 35%, #8B5CF6 70%, #EC4899 100%)',
          border: '1px solid rgba(255, 255, 255, 0.35)',
          color: '#FFFFFF',
          fontSize: '0.88rem',
          fontWeight: 800,
          boxShadow: open
            ? '0 0 0 3px rgba(255, 255, 255, 0.5), 0 12px 40px rgba(99, 102, 241, 0.75)'
            : '0 10px 35px rgba(99, 102, 241, 0.65), 0 0 25px rgba(236, 72, 153, 0.5)',
          cursor: 'pointer',
          backdropFilter: 'blur(16px)',
          transition: 'box-shadow 0.2s ease'
        }}
        title="Open AI Venture Copilot (Ctrl+J)"
      >
        <div style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Sparkles size={18} />
          <span style={{
            position: 'absolute',
            top: '-2px',
            right: '-2px',
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background: '#10B981',
            boxShadow: '0 0 8px #10B981'
          }} />
        </div>

        <span>AI Copilot</span>

        <span className="floating-ai-shortcut-badge" style={{
          fontSize: '0.68rem',
          padding: '0.12rem 0.45rem',
          borderRadius: '6px',
          background: 'rgba(0, 0, 0, 0.25)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          color: '#E0E7FF',
          fontWeight: 700,
          letterSpacing: '0.02em'
        }}>
          Ctrl+J
        </span>
      </motion.button>

      {/* ============================================================== */}
      {/* 2. FLOATING AI ASSISTANT WINDOW                                */}
      {/* ============================================================== */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="floating-ai-window"
            initial={{ opacity: 0, scale: 0.92, y: 25 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 25 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'fixed',
              bottom: '84px',
              right: '24px',
              width: isExpanded ? '860px' : '520px',
              maxWidth: 'calc(100vw - 32px)',
              height: 'min(760px, 84vh)',
              zIndex: 1060,
              display: 'flex',
              flexDirection: 'column',
              background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.98) 0%, rgba(9, 14, 26, 0.99) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              borderRadius: '22px',
              boxShadow: '0 25px 70px -10px rgba(0, 0, 0, 0.9), 0 0 45px rgba(99, 102, 241, 0.25)',
              backdropFilter: 'blur(28px)',
              WebkitBackdropFilter: 'blur(28px)',
              overflow: 'hidden',
              transition: 'width 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            {/* --- TOP HEADER --- */}
            <div style={{
              padding: '1rem 1.4rem',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(15, 23, 42, 0.75)',
              flexShrink: 0
            }}>
              {/* Left Identity */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  boxShadow: '0 0 16px rgba(99, 102, 241, 0.4)'
                }}>
                  <Bot size={20} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.94rem', fontWeight: 800, color: '#fff' }}>
                      StartupIQ AI Copilot
                    </span>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.66rem',
                      fontWeight: 700,
                      padding: '0.1rem 0.45rem',
                      borderRadius: '9999px',
                      background: 'rgba(16, 185, 129, 0.15)',
                      color: '#34D399',
                      border: '1px solid rgba(16, 185, 129, 0.3)'
                    }}>
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#34D399' }} />
                      Active
                    </span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                    Indexed to <strong style={{ color: '#E2E8F0' }}>{companyName}</strong> telemetry
                  </div>
                </div>
              </div>

              {/* Right Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {/* Expand / Minimize toggle */}
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: '#94A3B8',
                    cursor: 'pointer',
                    padding: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s ease'
                  }}
                  title={isExpanded ? 'Standard View' : 'Expanded View'}
                >
                  {isExpanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                </button>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: '#94A3B8',
                    cursor: 'pointer',
                    padding: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s ease'
                  }}
                  title="Close Assistant"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* --- LIVE TELEMETRY STRIP --- */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.5rem 1.4rem',
              background: 'rgba(99, 102, 241, 0.06)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
              fontSize: '0.72rem',
              color: '#94A3B8',
              flexShrink: 0,
              overflowX: 'auto',
              gap: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                <span style={{ color: '#64748B' }}>MRR:</span>
                <strong style={{ color: '#F1F5F9' }}>{fmt(mrr)}</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                <span style={{ color: '#64748B' }}>Burn:</span>
                <strong style={{ color: '#F43F5E' }}>{fmt(burn)}/mo</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                <span style={{ color: '#64748B' }}>Runway:</span>
                <strong style={{ color: '#34D399' }}>{runway} Mo</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                <span style={{ color: '#64748B' }}>LTV:CAC:</span>
                <strong style={{ color: '#818CF8' }}>{ltvCac}x</strong>
              </div>
            </div>

            {/* --- TABS SELECTOR --- */}
            <div style={{
              padding: '0.65rem 1.4rem 0.4rem',
              display: 'flex',
              gap: '0.4rem',
              background: 'rgba(15, 23, 42, 0.5)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
              flexShrink: 0
            }}>
              <button
                type="button"
                onClick={() => setActiveTab('chat')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '0.4rem 0.85rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: activeTab === 'chat' ? 'linear-gradient(135deg, #6366F1, #8B5CF6)' : 'rgba(255, 255, 255, 0.04)',
                  color: activeTab === 'chat' ? '#fff' : '#94A3B8',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <MessageSquare size={13} />
                <span>Interactive Chat</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('playbooks')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '0.4rem 0.85rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: activeTab === 'playbooks' ? 'linear-gradient(135deg, #6366F1, #8B5CF6)' : 'rgba(255, 255, 255, 0.04)',
                  color: activeTab === 'playbooks' ? '#fff' : '#94A3B8',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <Zap size={13} />
                <span>Strategic Playbooks</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('prompt')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '0.4rem 0.85rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: activeTab === 'prompt' ? 'linear-gradient(135deg, #6366F1, #8B5CF6)' : 'rgba(255, 255, 255, 0.04)',
                  color: activeTab === 'prompt' ? '#fff' : '#94A3B8',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <Sparkles size={13} />
                <span>Prompt Studio</span>
              </button>
            </div>

            {/* --- TAB CONTENT AREA --- */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '1.2rem 1.4rem',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {/* TAB 1: INTERACTIVE COPILOT CHAT */}
              {activeTab === 'chat' && (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  {/* Quick suggestion prompt chips */}
                  <div style={{
                    display: 'flex',
                    gap: '0.5rem',
                    overflowX: 'auto',
                    paddingBottom: '0.8rem',
                    marginBottom: '0.8rem',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                    flexShrink: 0
                  }}>
                    {[
                      'How do I cut burn without layoffs?',
                      'Diagnose CAC payback period',
                      'Prepare for Series A pitch questions',
                      'Optimize pricing & NRR'
                    ].map((chip, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handlePromptChipClick(chip)}
                        style={{
                          whiteSpace: 'nowrap',
                          fontSize: '0.72rem',
                          padding: '0.35rem 0.75rem',
                          borderRadius: '9999px',
                          background: 'rgba(99, 102, 241, 0.1)',
                          border: '1px solid rgba(99, 102, 241, 0.25)',
                          color: '#C7D2FE',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(99, 102, 241, 0.2)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)'}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>

                  {/* Messages Stream */}
                  <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.85rem',
                    paddingRight: '4px'
                  }}>
                    {chatMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                          gap: '8px'
                        }}
                      >
                        {msg.role === 'assistant' && (
                          <div style={{
                            width: '26px',
                            height: '26px',
                            borderRadius: '8px',
                            background: 'rgba(99, 102, 241, 0.2)',
                            border: '1px solid rgba(99, 102, 241, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#818CF8',
                            flexShrink: 0,
                            marginTop: '2px'
                          }}>
                            <Bot size={14} />
                          </div>
                        )}

                        <div style={{
                          maxWidth: '85%',
                          padding: '0.75rem 1rem',
                          borderRadius: msg.role === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                          background: msg.role === 'user'
                            ? 'linear-gradient(135deg, #4F46E5, #6366F1)'
                            : 'rgba(255, 255, 255, 0.04)',
                          border: msg.role === 'user'
                            ? '1px solid rgba(255, 255, 255, 0.15)'
                            : '1px solid rgba(255, 255, 255, 0.08)',
                          color: '#F8FAFC',
                          fontSize: '0.82rem',
                          lineHeight: 1.55,
                          whiteSpace: 'pre-wrap'
                        }}>
                          {msg.text}
                        </div>
                      </div>
                    ))}

                    {chatting && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#818CF8', fontSize: '0.78rem' }}>
                        <RefreshCw size={13} className="spin-fast" />
                        <span>Copilot is formulating strategic advisory...</span>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Chat Input Bar */}
                  <form
                    onSubmit={handleSendChat}
                    style={{
                      display: 'flex',
                      gap: '8px',
                      marginTop: '0.85rem',
                      paddingTop: '0.85rem',
                      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                      flexShrink: 0
                    }}
                  >
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Ask your AI Copilot about runway, pricing, LTV, CAC..."
                      style={{
                        flex: 1,
                        background: 'rgba(0, 0, 0, 0.35)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: '10px',
                        padding: '0.65rem 0.95rem',
                        color: '#fff',
                        fontSize: '0.82rem',
                        outline: 'none'
                      }}
                    />
                    <button
                      type="submit"
                      disabled={!chatInput.trim() || chatting}
                      style={{
                        padding: '0.65rem 1rem',
                        borderRadius: '10px',
                        border: 'none',
                        background: chatInput.trim() ? 'linear-gradient(135deg, #6366F1, #8B5CF6)' : 'rgba(255, 255, 255, 0.05)',
                        color: '#fff',
                        cursor: chatInput.trim() ? 'pointer' : 'default',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <Send size={15} />
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 2: STRATEGIC PLAYBOOKS */}
              {activeTab === 'playbooks' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                  <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                    Select an institutional playbook to run automated quantitative analysis against your startup:
                  </div>

                  {/* Playbooks Grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: isExpanded ? 'repeat(2, 1fr)' : '1fr',
                    gap: '0.75rem'
                  }}>
                    {PLAYBOOKS.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => {
                          setGoal(p.goal);
                          setTaskType(p.type);
                          executeAnalysis(p.goal, p.type);
                        }}
                        style={{
                          padding: '0.9rem 1rem',
                          borderRadius: '12px',
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)';
                          e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.35)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#F1F5F9' }}>
                            {p.title}
                          </span>
                          <ChevronRight size={14} color="#818CF8" />
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#94A3B8', lineHeight: 1.4 }}>
                          {p.desc}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Custom Analysis Trigger */}
                  <div style={{
                    padding: '1rem',
                    borderRadius: '12px',
                    background: 'rgba(0, 0, 0, 0.25)',
                    border: '1px solid rgba(255, 255, 255, 0.07)'
                  }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#CBD5E1', display: 'block', marginBottom: '6px' }}>
                      Or specify custom strategic challenge:
                    </label>
                    <textarea
                      rows={2}
                      value={goal}
                      onChange={(e) => setGoal(e.target.value)}
                      style={{
                        width: '100%',
                        background: 'rgba(0, 0, 0, 0.35)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        padding: '0.6rem 0.8rem',
                        color: '#fff',
                        fontSize: '0.78rem',
                        resize: 'none',
                        outline: 'none',
                        marginBottom: '8px'
                      }}
                    />
                    <button
                      type="button"
                      disabled={analyzing}
                      onClick={() => executeAnalysis(goal, taskType)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                        color: '#fff',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: analyzing ? 'default' : 'pointer'
                      }}
                    >
                      {analyzing ? <RefreshCw size={13} className="spin-fast" /> : <Zap size={13} />}
                      <span>{analyzing ? 'Synthesizing...' : 'Run Strategic Diagnosis'}</span>
                    </button>
                  </div>

                  {/* Analysis Output Result */}
                  {aiAnalysisResult && (
                    <div style={{
                      padding: '1.2rem',
                      borderRadius: '14px',
                      background: 'rgba(99, 102, 241, 0.05)',
                      border: '1px solid rgba(99, 102, 241, 0.25)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#818CF8', textTransform: 'uppercase' }}>
                          Diagnostic Report Output
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(aiAnalysisResult.text);
                            setCopiedReport(true);
                            setTimeout(() => setCopiedReport(false), 2000);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: 'rgba(255, 255, 255, 0.06)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '6px',
                            padding: '0.3rem 0.6rem',
                            color: '#CBD5E1',
                            fontSize: '0.7rem',
                            cursor: 'pointer'
                          }}
                        >
                          {copiedReport ? <Check size={12} color="#10B981" /> : <Copy size={12} />}
                          <span>{copiedReport ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                      <div style={{
                        fontSize: '0.78rem',
                        color: '#E2E8F0',
                        lineHeight: 1.6,
                        whiteSpace: 'pre-wrap',
                        maxHeight: '300px',
                        overflowY: 'auto',
                        paddingRight: '6px'
                      }}>
                        {aiAnalysisResult.text}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: PROMPT STUDIO */}
              {activeTab === 'prompt' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                    Generate structured prompts pre-populated with {companyName}'s quantitative metrics for Claude, ChatGPT, or Gemini:
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label style={{ fontSize: '0.72rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Audience</label>
                      <select
                        value={audience}
                        onChange={(e) => setAudience(e.target.value)}
                        style={{
                          width: '100%',
                          background: 'rgba(0, 0, 0, 0.35)',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          borderRadius: '8px',
                          padding: '0.45rem 0.6rem',
                          color: '#fff',
                          fontSize: '0.75rem'
                        }}
                      >
                        <option value="Seed & Series A Venture Investors">Seed & Series A VCs</option>
                        <option value="Internal Leadership & Co-Founders">Co-Founders & Execs</option>
                        <option value="Growth & Performance Lead">Growth / Marketing Lead</option>
                        <option value="Advisory Board">Board of Directors</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.72rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Tone</label>
                      <select
                        value={tone}
                        onChange={(e) => setTone(e.target.value)}
                        style={{
                          width: '100%',
                          background: 'rgba(0, 0, 0, 0.35)',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          borderRadius: '8px',
                          padding: '0.45rem 0.6rem',
                          color: '#fff',
                          fontSize: '0.75rem'
                        }}
                      >
                        <option value="tactical, rigorous, direct">Tactical & Rigorous</option>
                        <option value="conservative, risk-averse, institutional">Conservative & Institutional</option>
                        <option value="high-velocity, aggressive growth">Aggressive Growth</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCompilePrompt}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '0.6rem 1rem',
                      borderRadius: '8px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                      color: '#fff',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    <Sparkles size={14} />
                    <span>Compile Master AI Prompt</span>
                  </button>

                  {generatedPrompt && (
                    <div style={{
                      padding: '1rem',
                      borderRadius: '12px',
                      background: '#090D16',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      position: 'relative'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.7rem', color: '#38BDF8', fontFamily: 'monospace' }}>
                          READY FOR CLAUDE / CHATGPT
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(generatedPrompt);
                            setCopiedPrompt(true);
                            setTimeout(() => setCopiedPrompt(false), 2000);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: 'rgba(255, 255, 255, 0.08)',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            borderRadius: '6px',
                            padding: '0.25rem 0.6rem',
                            color: '#fff',
                            fontSize: '0.7rem',
                            cursor: 'pointer'
                          }}
                        >
                          {copiedPrompt ? <Check size={12} color="#10B981" /> : <Copy size={12} />}
                          <span>{copiedPrompt ? 'Copied!' : 'Copy Prompt'}</span>
                        </button>
                      </div>
                      <pre style={{
                        fontSize: '0.74rem',
                        color: '#94A3B8',
                        whiteSpace: 'pre-wrap',
                        fontFamily: 'monospace',
                        margin: 0,
                        maxHeight: '220px',
                        overflowY: 'auto'
                      }}>
                        {generatedPrompt}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
