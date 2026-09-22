import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Compass, Target, Flag, Award, BookOpen, CheckSquare, 
  Lightbulb, ArrowRight, ShieldCheck, HeartHandshake, Zap
} from 'lucide-react';
import { SAMPLE_COMPANIES } from '../../data/mockCompany';

export default function AdvisorWorkspaceModule({ activeCompany }) {
  const [selectedCompany, setSelectedCompany] = useState(activeCompany || SAMPLE_COMPANIES[0]);
  const [milestones, setMilestones] = useState([
    { id: 1, title: 'Achieve $50k MRR Milestone', category: 'Revenue', status: 'completed', targetQuarter: 'Q3 2026' },
    { id: 2, title: 'Finalize SOC2 Type II Security Compliance', category: 'Governance', status: 'in-progress', targetQuarter: 'Q4 2026' },
    { id: 3, title: 'Institutional Series A Lead Syndicate Alignment', category: 'Fundraising', status: 'in-progress', targetQuarter: 'Q1 2027' },
    { id: 4, title: 'Hire Head of Enterprise Sales', category: 'Talent', status: 'pending', targetQuarter: 'Q1 2027' }
  ]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header Banner */}
      <div style={{
        padding: '2rem',
        background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.7) 0%, rgba(6, 78, 59, 0.4) 100%)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid rgba(52, 211, 153, 0.25)',
        backdropFilter: 'blur(20px)'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.35rem 0.85rem',
          borderRadius: '9999px',
          background: 'rgba(52, 211, 153, 0.15)',
          border: '1px solid rgba(52, 211, 153, 0.3)',
          color: '#6EE7B7',
          fontSize: '0.75rem',
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: '0.75rem'
        }}>
          <Compass size={13} /> Strategic Advisory & Governance Workspace
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
          Executive Advisory Board Cockpit
        </h1>
        <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 0 0', maxWidth: '650px', fontSize: '0.95rem' }}>
          Steer portfolio companies through strategic OKRs, commercial GTM playbooks, governance compliance, and institutional investor readiness.
        </p>
      </div>

      {/* Advisory OKRs & Roadmaps */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        <div style={{
          padding: '1.75rem',
          borderRadius: 'var(--radius-xl)',
          background: 'rgba(15, 23, 42, 0.65)',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
              Strategic Milestones & Executive Deliverables
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#6EE7B7', fontWeight: 600 }}>Active Advisory Mandate</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {milestones.map((m) => (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem 1.25rem',
                  borderRadius: 'var(--radius-lg)',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, color: '#FFFFFF', fontSize: '0.95rem' }}>{m.title}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    Track: <span style={{ color: '#A5B4FC' }}>{m.category}</span> • Target: {m.targetQuarter}
                  </div>
                </div>
                <span style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  background: m.status === 'completed' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                  color: m.status === 'completed' ? '#34D399' : '#FBBF24',
                  border: m.status === 'completed' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)'
                }}>
                  {m.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Advisory Health Score Diagnostic */}
        <div style={{
          padding: '1.75rem',
          borderRadius: 'var(--radius-xl)',
          background: 'rgba(15, 23, 42, 0.65)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#FFFFFF', margin: 0, marginBottom: '1rem' }}>
              Venture Health Diagnostic
            </h3>
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <div style={{ fontSize: '3.5rem', fontWeight: 900, color: '#34D399', lineHeight: 1 }}>88</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                Overall Governance & Maturity Score
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Commercial Scalability:</span>
                <span style={{ color: '#FFFFFF', fontWeight: 600 }}>92%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Financial Health & Runway:</span>
                <span style={{ color: '#FFFFFF', fontWeight: 600 }}>85%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Governance & Cap Table:</span>
                <span style={{ color: '#FFFFFF', fontWeight: 600 }}>87%</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', padding: '0.85rem', borderRadius: 'var(--radius-md)', background: 'rgba(52, 211, 153, 0.1)', border: '1px solid rgba(52, 211, 153, 0.2)', fontSize: '0.8rem', color: '#6EE7B7' }}>
            Next Advisory Board Meeting scheduled for Oct 15, 2026.
          </div>
        </div>
      </div>
    </div>
  );
}
