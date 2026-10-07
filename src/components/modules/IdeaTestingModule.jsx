import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, Plus, ArrowRight, FlaskConical, CheckCircle2, 
  XCircle, Clock, Sparkles, FileText, X, AlertCircle, BarChart2 
} from 'lucide-react';
import { api } from '../../api/client';

export default function IdeaTestingModule({ company }) {
  const [hypotheses, setHypotheses] = useState([]);
  const [experiments, setExperiments] = useState([]);
  const [newHypo, setNewHypo] = useState({ category: 'DESIRABILITY', statement: '', riskLevel: 'HIGH' });
  const [showAddModal, setShowAddModal] = useState(false);

  // Log Test Modal State
  const [selectedHypoForTest, setSelectedHypoForTest] = useState(null);
  const [testForm, setTestForm] = useState({
    name: '',
    method: 'CUSTOMER_INTERVIEW',
    targetSample: 20,
    successCriteria: '',
    actualResult: '',
    resultStatus: 'SUCCESS',
    evidenceQuality: 'HIGH'
  });
  const [isSubmittingTest, setIsSubmittingTest] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    async function loadData() {
      if (!company?.ticker) return;

      // 1. Load Hypotheses
      try {
        const hRes = await api.getHypotheses(company.ticker).catch(() => ({ hypotheses: [] }));
        const list = Array.isArray(hRes) ? hRes : (hRes.hypotheses || hRes.data || []);
        if (list.length > 0) {
          setHypotheses(list);
        } else {
          // Check local storage fallback
          const localSaved = localStorage.getItem(`siq_hypotheses_${company.ticker}`);
          if (localSaved) {
            setHypotheses(JSON.parse(localSaved));
          } else {
            setHypotheses([
              { _id: 'hypo-1', category: 'DESIRABILITY', statement: 'Coaching institutes will pay $120+/mo per branch for integrated AI question paper generation and automated parent updates.', riskLevel: 'CRITICAL', status: 'VALIDATED' },
              { _id: 'hypo-2', category: 'FEASIBILITY', statement: 'AI OCR grading engine can achieve >92% accuracy on handwritten student test sheets in Indian exam formats.', riskLevel: 'HIGH', status: 'OPEN' },
              { _id: 'hypo-3', category: 'VIABILITY', statement: 'Direct sales to test prep academies can maintain customer CAC at $120 with LTV exceeding $1,200 (10x ratio).', riskLevel: 'HIGH', status: 'OPEN' },
            ]);
          }
        }
      } catch (e) {
        console.warn('Hypotheses load error:', e);
      }

      // 2. Load Experiments
      try {
        const expRes = await api.getExperiments(company.ticker).catch(() => ({ experiments: [] }));
        const expList = Array.isArray(expRes) ? expRes : (expRes.experiments || expRes.data || []);
        if (expList.length > 0) {
          setExperiments(expList);
        } else {
          const localExp = localStorage.getItem(`siq_experiments_${company.ticker}`);
          if (localExp) {
            setExperiments(JSON.parse(localExp));
          } else {
            setExperiments([
              {
                _id: 'exp-1',
                hypothesisId: 'hypo-1',
                name: 'Academy Director Discovery Interviews',
                method: 'CUSTOMER_INTERVIEW',
                targetSample: 20,
                successCriteria: 'At least 12 of 20 directors commit to paid beta pilot.',
                actualResult: '16 of 20 directors confirmed urgent pain; 10 signed pilot LOIs with deposits.',
                resultStatus: 'SUCCESS',
                evidenceQuality: 'HIGH',
                createdAt: new Date().toISOString()
              }
            ]);
          }
        }
      } catch (e) {
        console.warn('Experiments load error:', e);
      }
    }
    loadData();
  }, [company?.ticker]);

  // Save hypotheses to local storage
  const persistHypotheses = (updated) => {
    setHypotheses(updated);
    try {
      localStorage.setItem(`siq_hypotheses_${company?.ticker || 'default'}`, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed saving hypotheses locally:', e);
    }
  };

  // Save experiments to local storage
  const persistExperiments = (updated) => {
    setExperiments(updated);
    try {
      localStorage.setItem(`siq_experiments_${company?.ticker || 'default'}`, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed saving experiments locally:', e);
    }
  };

  const handleAddHypothesis = async (e) => {
    e.preventDefault();
    if (!newHypo.statement.trim()) return;

    const created = {
      ...newHypo,
      _id: `hypo-${Date.now()}`,
      status: 'OPEN',
      confidence: 50,
      createdAt: new Date().toISOString()
    };
    const updated = [created, ...hypotheses];
    persistHypotheses(updated);
    setShowAddModal(false);
    setNewHypo({ category: 'DESIRABILITY', statement: '', riskLevel: 'HIGH' });

    try {
      await api.createHypothesis(company.ticker, {
        title: `${newHypo.category} Hypothesis`,
        statement: newHypo.statement,
        category: newHypo.category,
        assumption: newHypo.statement,
        expectedOutcome: "Customer validation or quantifiable proof threshold met",
        riskLevel: newHypo.riskLevel
      });
    } catch (err) {
      console.warn('Sync hypothesis backend notice:', err?.message || err);
    }

    triggerToast('New hypothesis registered to testing board.');
  };

  const handleOpenLogTest = (hypothesis) => {
    setSelectedHypoForTest(hypothesis);
    // Suggest smart defaults based on the hypothesis category
    let defaultMethod = 'CUSTOMER_INTERVIEW';
    let defaultCriteria = 'At least 60% of test subjects confirm willingness to adopt or pay.';
    let defaultName = `Empirical Test: ${hypothesis.category}`;

    if (hypothesis.category === 'DESIRABILITY') {
      defaultMethod = 'CUSTOMER_INTERVIEW';
      defaultCriteria = 'At least 12 of 20 prospects confirm high pain and request immediate onboarding.';
      defaultName = 'Prospect Problem Discovery Interviews';
    } else if (hypothesis.category === 'FEASIBILITY') {
      defaultMethod = 'PROTOTYPE_DEMO';
      defaultCriteria = 'System processes 50+ test samples with >90% algorithmic accuracy.';
      defaultName = 'Algorithmic Accuracy Benchmark Sprint';
    } else if (hypothesis.category === 'VIABILITY') {
      defaultMethod = 'PREORDER_PILOT';
      defaultCriteria = 'At least 5 signed LOIs or deposit checks at $120/mo standard price.';
      defaultName = 'Commercial Pilot LOI Validation';
    }

    setTestForm({
      name: defaultName,
      method: defaultMethod,
      targetSample: 20,
      successCriteria: defaultCriteria,
      actualResult: '',
      resultStatus: 'SUCCESS',
      evidenceQuality: 'HIGH'
    });
  };

  const handleSaveExperiment = async (e) => {
    e.preventDefault();
    if (!selectedHypoForTest) return;

    setIsSubmittingTest(true);

    const newExperiment = {
      _id: `exp-${Date.now()}`,
      hypothesisId: selectedHypoForTest._id,
      name: testForm.name.trim() || `Validation Test for ${selectedHypoForTest.category}`,
      objective: `Validate: ${selectedHypoForTest.statement}`,
      method: testForm.method,
      targetSample: Number(testForm.targetSample) || 20,
      successCriteria: testForm.successCriteria.trim() || "Empirical threshold for validation",
      actualResult: testForm.actualResult.trim() || "Test concluded with observed empirical findings.",
      evidence: [testForm.actualResult.trim() || "Direct experimental proof logged"],
      evidenceQuality: testForm.evidenceQuality,
      resultStatus: testForm.resultStatus,
      createdAt: new Date().toISOString()
    };

    // 1. Update Hypotheses Status reactively
    const updatedStatus = testForm.resultStatus === 'SUCCESS' 
      ? 'VALIDATED' 
      : testForm.resultStatus === 'FAILED' 
        ? 'INVALIDATED' 
        : 'TESTING';

    const updatedHypotheses = hypotheses.map(h => {
      if (h._id === selectedHypoForTest._id) {
        return {
          ...h,
          status: updatedStatus,
          lastTestedAt: new Date().toISOString()
        };
      }
      return h;
    });

    persistHypotheses(updatedHypotheses);
    persistExperiments([newExperiment, ...experiments]);

    // 2. Sync to Backend
    try {
      await api.createExperiment(company.ticker, {
        hypothesisId: selectedHypoForTest._id,
        name: newExperiment.name,
        objective: newExperiment.objective,
        method: newExperiment.method,
        targetSample: newExperiment.targetSample,
        successCriteria: newExperiment.successCriteria,
        actualResult: newExperiment.actualResult,
        evidence: newExperiment.evidence,
        evidenceQuality: newExperiment.evidenceQuality,
        resultStatus: newExperiment.resultStatus
      });
    } catch (err) {
      console.warn('Backend experiment sync fallback notice:', err?.message || err);
    }

    setIsSubmittingTest(false);
    setSelectedHypoForTest(null);

    triggerToast(
      testForm.resultStatus === 'SUCCESS'
        ? `Empirical test logged! Hypothesis verified as VALIDATED.`
        : testForm.resultStatus === 'FAILED'
          ? `Empirical test logged. Hypothesis marked INVALIDATED (Pivot recommended).`
          : `Empirical test logged. Hypothesis marked under active TESTING.`
    );
  };

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Toast Notice */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          background: 'linear-gradient(135deg, #10B981, #059669)',
          color: '#FFFFFF',
          padding: '0.85rem 1.4rem',
          borderRadius: '12px',
          boxShadow: '0 10px 30px rgba(16, 185, 129, 0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.86rem',
          fontWeight: 700
        }}>
          <CheckCircle2 size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="badge-tag badge-rose" style={{ marginBottom: '0.6rem' }}>Strategyzer Lean Framework</span>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Business Idea Testing Board</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
            Map hypotheses by risk level (Desirability, Feasibility, Viability), log empirical experiments, and trigger automated pivot recommendations.
          </p>
        </div>

        <button id="add-hypothesis-btn" onClick={() => setShowAddModal(true)} className="btn btn-primary">
          <Plus size={16} />
          Add Hypothesis
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem'
      }}>
        <div style={{
          padding: '1rem 1.25rem',
          borderRadius: '14px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.07)'
        }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800 }}>Total Hypotheses</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#FFFFFF', marginTop: '4px' }}>{hypotheses.length}</div>
        </div>

        <div style={{
          padding: '1rem 1.25rem',
          borderRadius: '14px',
          background: 'rgba(16, 185, 129, 0.06)',
          border: '1px solid rgba(16, 185, 129, 0.2)'
        }}>
          <div style={{ fontSize: '0.72rem', color: '#6EE7B7', textTransform: 'uppercase', fontWeight: 800 }}>Validated Assumptions</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#34D399', marginTop: '4px' }}>
            {hypotheses.filter(h => h.status === 'VALIDATED').length}
          </div>
        </div>

        <div style={{
          padding: '1rem 1.25rem',
          borderRadius: '14px',
          background: 'rgba(99, 102, 241, 0.06)',
          border: '1px solid rgba(99, 102, 241, 0.2)'
        }}>
          <div style={{ fontSize: '0.72rem', color: '#A5B4FC', textTransform: 'uppercase', fontWeight: 800 }}>Empirical Tests Logged</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#818CF8', marginTop: '4px' }}>
            {experiments.length}
          </div>
        </div>

        <div style={{
          padding: '1rem 1.25rem',
          borderRadius: '14px',
          background: 'rgba(245, 158, 11, 0.06)',
          border: '1px solid rgba(245, 158, 11, 0.2)'
        }}>
          <div style={{ fontSize: '0.72rem', color: '#FCD34D', textTransform: 'uppercase', fontWeight: 800 }}>Awaiting Empirical Proof</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#FBBF24', marginTop: '4px' }}>
            {hypotheses.filter(h => h.status !== 'VALIDATED').length}
          </div>
        </div>
      </div>

      {/* Hypotheses Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
        {hypotheses.map(h => {
          const relevantExp = experiments.filter(e => e.hypothesisId === h._id);
          const latestExp = relevantExp[0];

          return (
            <div key={h._id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span className="badge-tag badge-indigo">{h.category}</span>
                  <span className={'badge-tag ' + (h.riskLevel === 'CRITICAL' ? 'badge-rose' : 'badge-amber')}>
                    {h.riskLevel} Risk
                  </span>
                </div>

                <p style={{ fontSize: '0.96rem', fontWeight: 600, color: '#fff', lineHeight: 1.5, marginBottom: '0.8rem' }}>
                  "{h.statement}"
                </p>

                {/* Empirical Test Badge if tests logged */}
                {latestExp && (
                  <div style={{
                    padding: '0.55rem 0.8rem',
                    borderRadius: '8px',
                    background: latestExp.resultStatus === 'SUCCESS' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(244, 63, 94, 0.08)',
                    border: latestExp.resultStatus === 'SUCCESS' ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(244, 63, 94, 0.25)',
                    fontSize: '0.75rem',
                    color: latestExp.resultStatus === 'SUCCESS' ? '#34D399' : '#F87171',
                    marginBottom: '0.6rem'
                  }}>
                    <div style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '5px' }}>
                      {latestExp.resultStatus === 'SUCCESS' ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
                      <span>Proof: {latestExp.name} ({latestExp.resultStatus})</span>
                    </div>
                    {latestExp.actualResult && (
                      <div style={{ color: 'var(--text-secondary)', marginTop: '2px', fontSize: '0.72rem' }}>
                        "{latestExp.actualResult.slice(0, 85)}{latestExp.actualResult.length > 85 ? '...' : ''}"
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div style={{
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                paddingTop: '0.85rem', 
                borderTop: '1px solid var(--border-subtle)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ 
                    fontSize: '0.74rem', 
                    color: h.status === 'VALIDATED' 
                      ? '#34D399' 
                      : h.status === 'INVALIDATED'
                        ? '#F87171'
                        : '#FBBF24', 
                    fontWeight: 800,
                    padding: '0.2rem 0.55rem',
                    borderRadius: '999px',
                    background: h.status === 'VALIDATED'
                      ? 'rgba(16, 185, 129, 0.15)'
                      : h.status === 'INVALIDATED'
                        ? 'rgba(244, 63, 94, 0.15)'
                        : 'rgba(245, 158, 11, 0.15)'
                  }}>
                    {h.status === 'VALIDATED' ? '✓ VALIDATED' : h.status === 'INVALIDATED' ? '✕ INVALIDATED' : '⏳ ' + (h.status || 'OPEN')}
                  </span>
                </div>

                <button 
                  id={`log-test-btn-${h._id}`}
                  onClick={() => handleOpenLogTest(h)} 
                  className="btn btn-secondary btn-sm" 
                  style={{ gap: '0.4rem', cursor: 'pointer', fontWeight: 700 }}
                  title="Record an empirical customer experiment / validation test"
                >
                  <FlaskConical size={13} color="#818CF8" />
                  <span>Log Test</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ================= MODAL 1: ADD HYPOTHESIS ================= */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ padding: '2rem', maxWidth: '520px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', margin: 0 }}>Add Business Hypothesis</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddHypothesis} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="input-label">Hypothesis Category</label>
                <select 
                  className="input-field"
                  value={newHypo.category}
                  onChange={e => setNewHypo({ ...newHypo, category: e.target.value })}
                >
                  <option value="DESIRABILITY">Desirability (Do customers urgently want this?)</option>
                  <option value="FEASIBILITY">Feasibility (Can we reliably engineer & deliver this?)</option>
                  <option value="VIABILITY">Viability (Do the unit economics & margins work?)</option>
                </select>
              </div>

              <div>
                <label className="input-label">Risk Severity Level</label>
                <select 
                  className="input-field"
                  value={newHypo.riskLevel}
                  onChange={e => setNewHypo({ ...newHypo, riskLevel: e.target.value })}
                >
                  <option value="CRITICAL">Critical (Existential venture risk)</option>
                  <option value="HIGH">High Risk</option>
                  <option value="MEDIUM">Medium Risk</option>
                </select>
              </div>

              <div>
                <label className="input-label">Hypothesis Statement ('We believe that...')</label>
                <textarea
                  className="input-field"
                  rows={3}
                  placeholder="e.g. Private coaching institutes will pay $120/mo per branch to automate question paper generation..."
                  value={newHypo.statement}
                  onChange={e => setNewHypo({ ...newHypo, statement: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Hypothesis</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: LOG TEST / RECORD EXPERIMENT ================= */}
      {selectedHypoForTest && (
        <div className="modal-overlay" onClick={() => setSelectedHypoForTest(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ padding: '2rem', maxWidth: '620px', width: '92%' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.2rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span className="badge-tag badge-indigo">{selectedHypoForTest.category}</span>
                  <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>EMPIRICAL EXPERIMENT</span>
                </div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                  Log Validation Test
                </h3>
              </div>
              <button onClick={() => setSelectedHypoForTest(null)} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            {/* Target Hypothesis Reminder Box */}
            <div style={{
              padding: '0.85rem 1.1rem',
              borderRadius: '10px',
              background: 'rgba(99, 102, 241, 0.08)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              marginBottom: '1.2rem',
              fontSize: '0.84rem',
              color: '#C7D2FE',
              lineHeight: 1.45
            }}>
              <strong>Hypothesis under test:</strong> "{selectedHypoForTest.statement}"
            </div>

            <form onSubmit={handleSaveExperiment} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div>
                <label className="input-label">Experiment Name / Title</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Coaching Director 1-on-1 Problem Interviews"
                  value={testForm.name}
                  onChange={e => setTestForm({ ...testForm, name: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <div>
                  <label className="input-label">Validation Method</label>
                  <select
                    className="input-field"
                    value={testForm.method}
                    onChange={e => setTestForm({ ...testForm, method: e.target.value })}
                  >
                    <option value="CUSTOMER_INTERVIEW">Customer Discovery Interviews (1-on-1)</option>
                    <option value="PREORDER_PILOT">Letter of Intent (LOI) / Paid Pre-Order</option>
                    <option value="SMOKE_TEST">Landing Page Smoke Test & Ad Conversion</option>
                    <option value="PROTOTYPE_DEMO">Interactive Prototype / Figma Usability</option>
                    <option value="CONCIERGE_TEST">Concierge Manual Service Run</option>
                    <option value="SURVEY_DATA">Quantitative Discovery Survey</option>
                  </select>
                </div>

                <div>
                  <label className="input-label">Target Sample Size (N)</label>
                  <input
                    type="number"
                    min="1"
                    className="input-field"
                    placeholder="e.g. 20"
                    value={testForm.targetSample}
                    onChange={e => setTestForm({ ...testForm, targetSample: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="input-label">Success Criteria / Falsification Threshold</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. At least 12 of 20 prospects commit to paid pilot ($120/mo)"
                  value={testForm.successCriteria}
                  onChange={e => setTestForm({ ...testForm, successCriteria: e.target.value })}
                  required
                />
              </div>

              {/* Experiment Outcome Selector */}
              <div>
                <label className="input-label">Empirical Outcome / Result Status</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem' }}>
                  {[
                    { id: 'SUCCESS', label: '✓ SUCCESS', desc: 'Validates hypothesis', color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)' },
                    { id: 'FAILED', label: '✕ FAILED', desc: 'Invalidates (Pivot)', color: '#F43F5E', bg: 'rgba(244, 63, 94, 0.15)' },
                    { id: 'INCONCLUSIVE', label: '⏳ IN PROGRESS', desc: 'Awaiting more data', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)' },
                  ].map(statusOpt => {
                    const isSelected = testForm.resultStatus === statusOpt.id;
                    return (
                      <button
                        key={statusOpt.id}
                        type="button"
                        onClick={() => setTestForm({ ...testForm, resultStatus: statusOpt.id })}
                        style={{
                          padding: '0.65rem 0.5rem',
                          borderRadius: '8px',
                          border: isSelected ? `2px solid ${statusOpt.color}` : '1px solid rgba(255, 255, 255, 0.08)',
                          background: isSelected ? statusOpt.bg : 'rgba(255, 255, 255, 0.02)',
                          color: isSelected ? statusOpt.color : 'var(--text-secondary)',
                          cursor: 'pointer',
                          textAlign: 'center',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ fontSize: '0.82rem', fontWeight: 800 }}>{statusOpt.label}</div>
                        <div style={{ fontSize: '0.68rem', marginTop: '2px', opacity: 0.85 }}>{statusOpt.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="input-label">Actual Result & Evidence Proof</label>
                <textarea
                  className="input-field"
                  rows={3}
                  placeholder="e.g. 16 of 20 academy owners confirmed severe manual grading pain; 10 signed pilot LOIs with 5 depositing advance checks..."
                  value={testForm.actualResult}
                  onChange={e => setTestForm({ ...testForm, actualResult: e.target.value })}
                  required
                />
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setSelectedHypoForTest(null)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingTest}
                  className="btn btn-primary"
                  style={{ gap: '6px' }}
                >
                  <CheckCircle2 size={16} />
                  <span>{isSubmittingTest ? 'Recording Proof...' : 'Record Test & Update Status'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
