import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle2, Circle, AlertTriangle, RefreshCw } from 'lucide-react';
import { api } from '../../api/client';
import GaugeRing from '../common/GaugeRing';

export default function ActionPlanModule({ company }) {
  const [plan, setPlan] = useState(null);
  const [completedTasks, setCompletedTasks] = useState(() => {
    try { return JSON.parse(localStorage.getItem('siq_action_plan_done')) || {}; } catch(e) { return {}; }
  });

  useEffect(() => {
    async function loadPlan() {
      try {
        const res = await api.getActionPlan(company.ticker).catch(() => null);
        if (res) {
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

  const toggleTask = (taskId) => {
    const next = { ...completedTasks, [taskId]: !completedTasks[taskId] };
    setCompletedTasks(next);
    try { localStorage.setItem('siq_action_plan_done', JSON.stringify(next)); } catch(e) {}
  };

  const allTasks = (plan?.weeks || []).flatMap((w, wi) => (w.items || []).map((text, ti) => ({ id: `w${wi}_t${ti}`, text })));
  const total = allTasks.length;
  const doneCount = allTasks.filter(t => completedTasks[t.id]).length;
  const percent = total > 0 ? Math.round((doneCount / total) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <span className="badge-tag badge-rose" style={{ marginBottom: '0.6rem' }}>Execution Engine</span>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>30-Day Founder Action Plan</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
            A structured 4-week task roadmap adapting automatically to the weakest operational area in your startup profile.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <GaugeRing score={percent} size={110} strokeWidth={10} label="Completion" />
          <div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff' }}>{doneCount} / {total}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Tasks Completed</div>
          </div>
        </div>
      </div>

      {/* 4 Weekly Phases */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {(plan?.weeks || []).map((week, wi) => (
          <div key={wi} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.6rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase' }}>Week {wi + 1}</div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>{week.theme}</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {(week.items || []).map((item, ti) => {
                const id = `w${wi}_t${ti}`;
                const isDone = !!completedTasks[id];
                return (
                  <div
                    key={ti}
                    onClick={() => toggleTask(id)}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                      padding: '0.75rem 0.85rem', borderRadius: 'var(--radius-md)',
                      background: isDone ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                      border: isDone ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-subtle)',
                      cursor: 'pointer', transition: 'all 0.15s ease'
                    }}
                  >
                    {isDone ? (
                      <CheckCircle2 size={18} color="var(--success)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    ) : (
                      <Circle size={18} color="var(--text-muted)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    )}
                    <span style={{
                      fontSize: '0.86rem', color: isDone ? 'var(--text-muted)' : 'var(--text-primary)',
                      textDecoration: isDone ? 'line-through' : 'none', lineHeight: 1.45
                    }}>
                      {item}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
