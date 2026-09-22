import React, { useState, useEffect } from 'react';
import { CheckSquare, Plus, ArrowRight } from 'lucide-react';
import { api } from '../../api/client';

export default function IdeaTestingModule({ company }) {
  const [hypotheses, setHypotheses] = useState([]);
  const [newHypo, setNewHypo] = useState({ category: 'DESIRABILITY', statement: '', riskLevel: 'HIGH' });
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const hRes = await api.getHypotheses(company.ticker).catch(() => ({ hypotheses: [] }));
        setHypotheses(hRes.hypotheses?.length ? hRes.hypotheses : [
          { _id: '1', category: 'DESIRABILITY', statement: 'Founders will pay $49/mo for an automated runway & health diagnostic tool.', riskLevel: 'CRITICAL', status: 'VALIDATED' },
          { _id: '2', category: 'FEASIBILITY', statement: 'Heuristic algorithm can accurately evaluate idea viability without a human analyst.', riskLevel: 'HIGH', status: 'OPEN' },
          { _id: '3', category: 'VIABILITY', statement: 'Customer acquisition cost via content marketing can stay below $80 per paying founder.', riskLevel: 'HIGH', status: 'OPEN' },
        ]);
      } catch (e) {
        console.warn('Idea testing load error:', e);
      }
    }
    loadData();
  }, [company?.ticker]);

  const handleAddHypothesis = async (e) => {
    e.preventDefault();
    if (!newHypo.statement.trim()) return;

    const created = { ...newHypo, _id: Date.now().toString(), status: 'OPEN' };
    setHypotheses([created, ...hypotheses]);
    setShowAddModal(false);
    setNewHypo({ category: 'DESIRABILITY', statement: '', riskLevel: 'HIGH' });

    try {
      await api.createHypothesis(company.ticker, newHypo);
    } catch(err) {
      console.warn('Sync hypothesis error:', err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="badge-tag badge-rose" style={{ marginBottom: '0.6rem' }}>Strategyzer Lean Framework</span>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Business Idea Testing Board</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
            Map hypotheses by risk level (Desirability, Feasibility, Viability), log empirical experiments, and trigger automated pivot recommendations.
          </p>
        </div>

        <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
          <Plus size={16} />
          Add Hypothesis
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.25rem' }}>
        {hypotheses.map(h => (
          <div key={h._id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span className="badge-tag badge-indigo">{h.category}</span>
                <span className={'badge-tag ' + (h.riskLevel === 'CRITICAL' ? 'badge-rose' : 'badge-amber')}>
                  {h.riskLevel} Risk
                </span>
              </div>
              <p style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff', lineHeight: 1.5, marginBottom: '1rem' }}>
                "{h.statement}"
              </p>
            </div>

            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)'
            }}>
              <span style={{ fontSize: '0.75rem', color: h.status === 'VALIDATED' ? '#34D399' : 'var(--text-muted)', fontWeight: 700 }}>
                Status: {h.status || 'OPEN'}
              </span>
              <button className="btn btn-secondary btn-sm" style={{ gap: '0.3rem' }}>
                <span>Log Test</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '1.25rem' }}>Add Business Hypothesis</h3>
            <form onSubmit={handleAddHypothesis} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="input-label">Hypothesis Category</label>
                <select 
                  className="input-field"
                  value={newHypo.category}
                  onChange={e => setNewHypo({ ...newHypo, category: e.target.value })}
                >
                  <option value="DESIRABILITY">Desirability (Do customers want it?)</option>
                  <option value="FEASIBILITY">Feasibility (Can we build & deliver it?)</option>
                  <option value="VIABILITY">Viability (Does the unit economics work?)</option>
                </select>
              </div>

              <div>
                <label className="input-label">Hypothesis Statement ('We believe that...')</label>
                <textarea
                  className="input-field"
                  placeholder="e.g. 20% of beta signups will convert to paid users within 14 days..."
                  value={newHypo.statement}
                  onChange={e => setNewHypo({ ...newHypo, statement: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Assumption</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
