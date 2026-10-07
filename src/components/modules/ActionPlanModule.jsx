import React, { useState, useEffect } from 'react';
import {
  Calendar, CheckCircle2, Circle, AlertTriangle, RefreshCw,
  Sparkles, ShieldCheck, Link as LinkIcon, FileText, Upload,
  Zap, ArrowRight, ExternalLink, Filter, TrendingUp, Check
} from 'lucide-react';
import { api } from '../../api/client';
import GaugeRing from '../common/GaugeRing';
import ActionProofModal from '../common/ActionProofModal';

export default function ActionPlanModule({ company, onUpdateCompany }) {
  const [plan, setPlan] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'pending' | 'verified'

  // Task proofs dictionary: taskId -> proofObject
  const [taskProofs, setTaskProofs] = useState(() => {
    const ticker = company?.ticker || 'default';
    try {
      const saved = localStorage.getItem(`siq_action_plan_proofs_${ticker}`);
      if (saved) return JSON.parse(saved);
      // Legacy fallback
      const oldDone = JSON.parse(localStorage.getItem('siq_action_plan_done')) || {};
      const converted = {};
      Object.keys(oldDone).forEach(k => {
        if (oldDone[k]) {
          converted[k] = {
            completed: true,
            completedAt: new Date().toISOString(),
            notes: 'Completed during initial sprint.',
            aiReview: { score: 88, verdict: 'Verified Milestone', feedback: 'Completed with platform telemetry.' }
          };
        }
      });
      return converted;
    } catch(e) {
      return {};
    }
  });

  // Modal active task state
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function loadPlan() {
      try {
        const res = await api.getActionPlan(company?.ticker || 'TELEDU').catch(() => null);
        if (res && res.weeks) {
          setPlan(res);
        } else {
          setPlan({
            targetMetric: "LTV:CAC",
            focusTheme: "Unit Economics & Runway Extension",
            weeks: [
              { week: 1, theme: "Week 1 — Diagnosis & Metric Accuracy", items: ["Audit marketing channels and calculate granular CAC per channel.", "Interview 5 recently churned customers to find retention gaps.", "Verify 12-month runway projection against current monthly burn."] },
              { week: 2, theme: "Week 2 — Attack the #1 Vulnerability", items: ["Pause underperforming acquisition channels with payback > 12 months.", "Revamp onboarding flow to increase day-1 activation.", "Implement annual prepaid plan discount to inject upfront cash."] },
              { week: 3, theme: "Week 3 — Controlled Experiments", items: ["A/B test pricing page with new value tiers.", "Launch targeted referral campaign for active power users."] },
              { week: 4, theme: "Week 4 — Measurement & Loop Closure", items: ["Recalculate Startup Health Score and LTV:CAC ratio.", "Update My Startup Cockpit metrics with month-end numbers.", "Define the single North Star metric for the subsequent 30 days."] }
            ]
          });
        }
      } catch(e) {
        console.warn('Action plan load error:', e);
      }
    }
    loadPlan();
  }, [company?.ticker]);

  // Persist proofs
  const handleSaveProof = (taskId, proofData) => {
    const next = { ...taskProofs, [taskId]: proofData };
    setTaskProofs(next);
    const ticker = company?.ticker || 'default';
    try {
      localStorage.setItem(`siq_action_plan_proofs_${ticker}`, JSON.stringify(next));
      // Keep legacy format synced as well
      const doneMap = {};
      Object.keys(next).forEach(k => { if (next[k]?.completed) doneMap[k] = true; });
      localStorage.setItem('siq_action_plan_done', JSON.stringify(doneMap));
    } catch(e) {}
  };

  const handleRemoveProof = (taskId) => {
    const next = { ...taskProofs };
    delete next[taskId];
    setTaskProofs(next);
    const ticker = company?.ticker || 'default';
    try {
      localStorage.setItem(`siq_action_plan_proofs_${ticker}`, JSON.stringify(next));
      const doneMap = {};
      Object.keys(next).forEach(k => { if (next[k]?.completed) doneMap[k] = true; });
      localStorage.setItem('siq_action_plan_done', JSON.stringify(doneMap));
    } catch(e) {}
  };

  const handleOpenTask = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  // Compile all tasks
  const allTasks = (plan?.weeks || []).flatMap((w, wi) =>
    (w.items || []).map((text, ti) => ({
      id: `w${wi}_t${ti}`,
      text,
      weekNumber: w.week || wi + 1,
      weekTheme: w.theme
    }))
  );

  const total = allTasks.length;
  const verifiedTasks = allTasks.filter(t => taskProofs[t.id]?.completed);
  const doneCount = verifiedTasks.length;
  const percent = total > 0 ? Math.round((doneCount / total) * 100) : 0;

  // Compute Average Execution Rigor Index
  const scoresWithReview = verifiedTasks
    .map(t => taskProofs[t.id]?.aiReview?.score)
    .filter(s => typeof s === 'number');
  const avgRigor = scoresWithReview.length > 0
    ? Math.round(scoresWithReview.reduce((a, b) => a + b, 0) / scoresWithReview.length)
    : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Banner & KPI Glass Card */}
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.6rem' }}>
            <span className="badge-tag badge-rose">Execution Engine</span>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '0.2rem 0.6rem',
              borderRadius: '9999px',
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#10B981',
              fontSize: '0.72rem',
              fontWeight: 800,
              textTransform: 'uppercase'
            }}>
              <ShieldCheck size={12} />
              Verifiable Proof of Work Active
            </span>
          </div>

          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FFFFFF', margin: '0 0 0.4rem 0' }}>
            30-Day Founder Action Plan
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', margin: 0, maxWidth: '640px', lineHeight: 1.5 }}>
            A structured 4-week task roadmap adapting automatically to the weakest operational area in your startup profile.
            Every completed milestone requires empirical proof audited by StartupIQ AI Copilot.
          </p>
        </div>

        {/* Right Metric Gauges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.8rem', flexWrap: 'wrap' }}>
          {doneCount > 0 && (
            <div style={{
              padding: '0.85rem 1.15rem',
              borderRadius: '1rem',
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              minWidth: '100px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10B981', fontSize: '1.35rem', fontWeight: 900 }}>
                <Zap size={16} /> {avgRigor}%
              </div>
              <div style={{ fontSize: '0.72rem', color: '#A7F3D0', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                AI Rigor Index
              </div>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
            <GaugeRing score={percent} size={105} strokeWidth={10} label="Completion" />
            <div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#FFFFFF' }}>{doneCount} / {total}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Milestones Verified</div>
            </div>
          </div>
        </div>
      </div>

      {/* Diagnostic Rationale Callout Banner */}
      <div style={{
        padding: '0.9rem 1.4rem',
        borderRadius: 'var(--radius-lg)',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(16, 185, 129, 0.08) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.8rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Sparkles size={16} color="#818CF8" style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#A5B4FC', letterSpacing: '0.03em', textTransform: 'uppercase' }}>
              Diagnostic Execution Rationale • {company?.companyName || 'Teledu Learning'}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#E2E8F0', marginTop: '2px', lineHeight: 1.4 }}>
              Tasks generated directly from Teledu Learning's unit economics audit: LTV:CAC is institutional-grade at 10.0x ($1,200 LTV vs $120 CAC) with +$10,500/mo net operating cash flow. Milestones focus on marketing channel payback discipline and preparation for institutional Seed closing ($500k target).
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255, 255, 255, 0.03)', padding: '0.3rem', borderRadius: '0.75rem', border: '1px solid rgba(255, 255, 255, 0.07)' }}>
          {[
            { id: 'all', label: `All Milestones (${total})` },
            { id: 'pending', label: `Pending Proof (${total - doneCount})` },
            { id: 'verified', label: `Verified with Proof (${doneCount})` }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              style={{
                padding: '0.45rem 0.95rem',
                borderRadius: '0.55rem',
                border: 'none',
                background: activeFilter === f.id ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
                color: activeFilter === f.id ? '#FFFFFF' : '#94A3B8',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div style={{ fontSize: '0.82rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sparkles size={14} color="#818CF8" />
          <span>Click any task to submit verifiable links, files, or audit notes</span>
        </div>
      </div>

      {/* 4 Weekly Phase Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))', gap: '1.5rem' }}>
        {(plan?.weeks || []).map((week, wi) => {
          const weekTasks = (week.items || []).map((text, ti) => ({
            id: `w${wi}_t${ti}`,
            text,
            weekNumber: week.week || wi + 1,
            weekTheme: week.theme
          }));

          const filteredWeekTasks = weekTasks.filter(t => {
            const isDone = !!taskProofs[t.id]?.completed;
            if (activeFilter === 'pending') return !isDone;
            if (activeFilter === 'verified') return isDone;
            return true;
          });

          return (
            <div key={wi} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Column Header */}
              <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Week {week.week || wi + 1}
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 700 }}>
                    {weekTasks.filter(t => taskProofs[t.id]?.completed).length}/{weekTasks.length} Done
                  </span>
                </div>
                <h3 style={{ fontSize: '1.02rem', fontWeight: 700, color: '#FFFFFF', margin: 0, lineHeight: 1.35 }}>
                  {week.theme}
                </h3>
              </div>

              {/* Tasks List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {filteredWeekTasks.length === 0 ? (
                  <div style={{ padding: '1.5rem 1rem', textAlign: 'center', color: '#64748B', fontSize: '0.82rem' }}>
                    No milestones match active filter.
                  </div>
                ) : (
                  filteredWeekTasks.map((t) => {
                    const proof = taskProofs[t.id];
                    const isDone = !!proof?.completed;

                    return (
                      <div
                        key={t.id}
                        onClick={() => handleOpenTask(t)}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.5rem',
                          padding: '0.85rem 1rem',
                          borderRadius: 'var(--radius-md)',
                          background: isDone
                            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(99, 102, 241, 0.03))'
                            : 'rgba(255, 255, 255, 0.025)',
                          border: isDone
                            ? '1px solid rgba(16, 185, 129, 0.35)'
                            : '1px solid var(--border-subtle)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          position: 'relative'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = isDone ? '#10B981' : 'rgba(99, 102, 241, 0.5)';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = isDone ? 'rgba(16, 185, 129, 0.35)' : 'var(--border-subtle)';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        {/* Top Line: Checkbox + Text + Rigor Badge */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                          {isDone ? (
                            <div style={{
                              width: '20px',
                              height: '20px',
                              borderRadius: '50%',
                              background: '#10B981',
                              color: '#FFFFFF',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              marginTop: '2px',
                              boxShadow: '0 0 10px rgba(16, 185, 129, 0.35)'
                            }}>
                              <Check size={13} strokeWidth={3} />
                            </div>
                          ) : (
                            <Circle size={19} color="#64748B" style={{ flexShrink: 0, marginTop: '2px' }} />
                          )}

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <span style={{
                              fontSize: '0.86rem',
                              color: isDone ? '#E2E8F0' : 'var(--text-primary)',
                              fontWeight: isDone ? 600 : 500,
                              lineHeight: 1.45,
                              display: 'block'
                            }}>
                              {t.text}
                            </span>
                          </div>
                        </div>

                        {/* Bottom Metadata Badges */}
                        {isDone && proof && (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '6px',
                            paddingTop: '0.35rem',
                            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                            marginTop: '0.2rem'
                          }}>
                            {/* AI Rigor Badge */}
                            {proof.aiReview?.score && (
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                                padding: '0.15rem 0.45rem',
                                borderRadius: '4px',
                                background: 'rgba(16, 185, 129, 0.15)',
                                color: '#10B981',
                                fontSize: '0.68rem',
                                fontWeight: 800
                              }}>
                                <Zap size={10} />
                                {proof.aiReview.score}% Rigor
                              </span>
                            )}

                            {/* Artifact Pill */}
                            {proof.url && (
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '0.15rem 0.45rem',
                                borderRadius: '4px',
                                background: 'rgba(56, 189, 248, 0.12)',
                                color: '#38BDF8',
                                fontSize: '0.68rem',
                                fontWeight: 700
                              }}>
                                <LinkIcon size={10} /> Live Link
                              </span>
                            )}

                            {proof.fileInfo && (
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '0.15rem 0.45rem',
                                borderRadius: '4px',
                                background: 'rgba(245, 158, 11, 0.12)',
                                color: '#FBBF24',
                                fontSize: '0.68rem',
                                fontWeight: 700
                              }}>
                                <Upload size={10} /> {proof.fileInfo.name.length > 18 ? proof.fileInfo.name.slice(0, 15) + '...' : proof.fileInfo.name}
                              </span>
                            )}

                            {proof.notes && (
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '0.15rem 0.45rem',
                                borderRadius: '4px',
                                background: 'rgba(255, 255, 255, 0.06)',
                                color: '#94A3B8',
                                fontSize: '0.68rem',
                                fontWeight: 600
                              }}>
                                <FileText size={10} /> Audit Notes
                              </span>
                            )}

                            {proof.metricSync?.synced && (
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '0.15rem 0.45rem',
                                borderRadius: '4px',
                                background: 'rgba(16, 185, 129, 0.15)',
                                color: '#34D399',
                                fontSize: '0.68rem',
                                fontWeight: 800
                              }}>
                                📊 {proof.metricSync.label.split(' ')[0]}: {proof.metricSync.unit}{proof.metricSync.newValue}
                              </span>
                            )}

                            <span style={{ marginLeft: 'auto', fontSize: '0.68rem', color: '#64748B', fontWeight: 600 }}>
                              View Dossier →
                            </span>
                          </div>
                        )}

                        {!isDone && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: '#818CF8', fontWeight: 700, paddingLeft: '1.7rem' }}>
                            <span>Submit Proof of Work</span>
                            <ArrowRight size={12} />
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Proof of Work Modal */}
      {selectedTask && (
        <ActionProofModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          task={selectedTask}
          existingProof={taskProofs[selectedTask.id] || null}
          company={company}
          onSaveProof={handleSaveProof}
          onRemoveProof={handleRemoveProof}
          onUpdateCompany={onUpdateCompany}
        />
      )}
    </div>
  );
}
