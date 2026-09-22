import React, { useState, useEffect } from 'react';
import { Target, Users, Megaphone, Calendar } from 'lucide-react';
import { api } from '../../api/client';

export default function GtmRoadmapModule({ company }) {
  const [personas, setPersonas] = useState([]);
  const [channels, setChannels] = useState([]);
  const [roadmapItems, setRoadmapItems] = useState([]);

  useEffect(() => {
    async function loadGtm() {
      try {
        const [pRes, cRes, rRes] = await Promise.all([
          api.getPersonas(company.ticker).catch(() => ({ personas: [] })),
          api.getChannels(company.ticker).catch(() => ({ channels: [] })),
          api.getRoadmapItems(company.ticker).catch(() => ({ roadmapItems: [] }))
        ]);

        setPersonas(pRes.personas?.length ? pRes.personas : [
          { _id: '1', title: "Early-Stage Technical Founder", role: "CEO / Co-founder", priority: "TOP", priorityScore: 88, painPoint: "Burning cash without clarity on true runway." },
          { _id: '2', title: "Venture Portfolio Operator", role: "Venture Partner", priority: "HIGH", priorityScore: 76, painPoint: "Needs standardized reporting across 15 portfolio startups." }
        ]);

        setChannels(cRes.channels?.length ? cRes.channels : [
          { _id: 'c1', name: "LinkedIn Founder Thought Leadership", channelType: "CONTENT", status: "ACTIVE", expectedCac: 45, priorityScore: 84 },
          { _id: 'c2', name: "Startup Incubator Partnerships", channelType: "PARTNERSHIP", status: "TESTING", expectedCac: 60, priorityScore: 80 },
          { _id: 'c3', name: "Cold Email Outbound to Seed Founders", channelType: "OUTBOUND", status: "TESTING", expectedCac: 110, priorityScore: 68 }
        ]);

        setRoadmapItems(rRes.roadmapItems?.length ? rRes.roadmapItems : [
          { _id: 'r1', week: 1, title: "Customer Interviews & Problem Validation", phase: "Discovery", status: "COMPLETED" },
          { _id: 'r2', week: 3, title: "Landing Page Smoke Test & Waitlist Launch", phase: "Acquisition", status: "ACTIVE" },
          { _id: 'r3', week: 6, title: "Closed Beta Launch with First 25 Founders", phase: "Activation", status: "PLANNED" },
          { _id: 'r4', week: 10, title: "Public Product Hunt & Demo Launch", phase: "Scaling", status: "PLANNED" }
        ]);
      } catch(e) {
        console.warn('GTM load error:', e);
      }
    }
    loadGtm();
  }, [company?.ticker]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="glass-card">
        <span className="badge-tag badge-indigo" style={{ marginBottom: '0.6rem' }}>Go-to-Market Strategy</span>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Audience & GTM Launch Roadmap</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
          Prioritize target customer personas, score acquisition channels by expected CAC, and execute the 12-week launch timeline.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Users size={19} color="var(--accent)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Target Personas</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {personas.map(p => (
              <div key={p._id} style={{
                background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)', padding: '1rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>{p.title}</div>
                  <span className="badge-tag badge-indigo">Priority {p.priorityScore || 85}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Role: {p.role}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Pain: {p.painPoint}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Megaphone size={19} color="var(--amber)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Acquisition Channels</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {channels.map(c => (
              <div key={c._id} style={{
                background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#fff', marginBottom: '0.2rem' }}>{c.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Type: {c.channelType} · Est. CAC: ${c.expectedCac}</div>
                </div>
                <span className={'badge-tag ' + (c.status === 'ACTIVE' ? 'badge-success' : 'badge-amber')}>
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <Calendar size={19} color="var(--cyan)" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>12-Week Launch Timeline</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {roadmapItems.map(item => (
            <div key={item._id} style={{
              display: 'flex', alignItems: 'center', gap: '1rem',
              padding: '0.85rem 1.25rem', background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)'
            }}>
              <div style={{
                width: '60px', fontWeight: 800, fontSize: '0.85rem', color: 'var(--accent)', fontFamily: 'var(--font-mono)'
              }}>
                Week {item.week}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#fff' }}>{item.title}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Phase: {item.phase}</div>
              </div>
              <span className={'badge-tag ' + (item.status === 'COMPLETED' ? 'badge-success' : item.status === 'ACTIVE' ? 'badge-amber' : 'badge-indigo')}>
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
