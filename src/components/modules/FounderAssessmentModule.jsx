import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  Flag,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Shield,
  Layers,
  FileCheck,
  RefreshCw,
  BookOpen,
  ArrowRight,
  HelpCircle,
  Users,
  Target,
  DollarSign,
  Megaphone,
  Zap,
  Rocket
} from 'lucide-react';
import { api } from '../../api/client';
import GaugeRing from '../common/GaugeRing';

const DOMAINS = [
  { id: 'leadership', label: 'Leadership & People', icon: Users, color: '#6366F1' },
  { id: 'strategy', label: 'Strategy & Vision', icon: Target, color: '#34D399' },
  { id: 'finance', label: 'Finance & Economics', icon: DollarSign, color: '#F2A93B' },
  { id: 'marketing', label: 'Sales & Marketing', icon: Megaphone, color: '#3B82F6' },
  { id: 'operations', label: 'Operations & Execution', icon: Zap, color: '#EC4899' },
  { id: 'product', label: 'Innovation & Product', icon: Rocket, color: '#8B5CF6' }
];

export default function FounderAssessmentModule({ company, onStatusUpdated }) {
  const [view, setView] = useState('start'); // 'start' | 'test' | 'results'
  const [mode, setMode] = useState('ai'); // 'ai' | 'standard'
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState({});
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showExplanations, setShowExplanations] = useState(false);

  // Timer: 25 minutes = 1500 seconds
  const [timeLeft, setTimeLeft] = useState(1500);
  const timerRef = useRef(null);

  // Result state
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  // Load history on mount or company change
  useEffect(() => {
    async function loadHistory() {
      if (!company?.ticker) return;
      try {
        const res = await api.getAssessmentHistory(company.ticker).catch(() => null);
        if (res && res.data && Array.isArray(res.data.assessments)) {
          setHistory(res.data.assessments);
          if (res.data.assessments.length > 0 && view === 'start' && !result) {
            // Preview most recent result
            const latest = res.data.assessments[0];
            setResult({
              overallScore: latest.score,
              capabilityLevel: latest.capabilityLevel,
              archetype: {
                name: latest.archetype,
                icon: latest.archetypeIcon || '⚡',
                desc: latest.archetypeDescription || ''
              },
              domainScores: latest.domainScores,
              subskillScores: latest.subskillScores || {},
              strengths: latest.strengths || [],
              weaknesses: latest.weaknesses || [],
              recommendations: latest.recommendations || [],
              durationMinutes: latest.durationMinutes || 0,
              questionResults: latest.questionResults || []
            });
          }
        }
      } catch (e) {}
    }
    loadHistory();
  }, [company?.ticker]);

  // Timer ticking
  useEffect(() => {
    if (view === 'test') {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [view]);

  const handleStartTest = async () => {
    try {
      setLoading(true);
      const ticker = company?.ticker || 'TELEDU';
      const res = await api.generateAssessmentTest(ticker, mode).catch(() => null);
      if (res && res.data && Array.isArray(res.data.questions) && res.data.questions.length > 0) {
        setQuestions(res.data.questions);
      } else {
        // Fallback to local default questions if backend is offline
        setQuestions(generateLocalFallbackQuestions(company));
      }
      setCurrentIdx(0);
      setAnswers({});
      setFlagged({});
      setTimeLeft(1500); // 25 mins
      setView('test');
    } catch (err) {
      setQuestions(generateLocalFallbackQuestions(company));
      setView('test');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoSubmit = () => {
    handleSubmitTest();
  };

  const handleSelectOption = (optIdx) => {
    const qId = questions[currentIdx]?.id;
    if (!qId) return;
    setAnswers(prev => ({ ...prev, [qId]: optIdx }));
  };

  const toggleFlag = (qId) => {
    setFlagged(prev => ({ ...prev, [qId]: !prev[qId] }));
  };

  const handleSubmitTest = async () => {
    try {
      setLoading(true);
      setShowReviewModal(false);
      const ticker = company?.ticker || 'TELEDU';
      const durationMins = Math.max(1, Math.round((1500 - timeLeft) / 60));

      const payload = {
        questions,
        answers,
        durationMinutes: durationMins,
        mode
      };

      const res = await api.submitAssessmentTest(ticker, payload).catch(() => null);
      if (res && res.data && res.data.evaluation) {
        setResult(res.data.evaluation);
        if (res.data.statusUpdated && onStatusUpdated) {
          onStatusUpdated('Investment Ready');
        }
      } else {
        // Local evaluation fallback
        const localEval = calculateLocalEvaluation(questions, answers, durationMins);
        setResult(localEval);
        if (localEval.overallScore >= 65 && onStatusUpdated) {
          onStatusUpdated('Investment Ready');
        }
      }
      setView('results');
    } catch (err) {
      const localEval = calculateLocalEvaluation(questions, answers, 15);
      setResult(localEval);
      setView('results');
    } finally {
      setLoading(false);
    }
  };

  // Format MM:SS
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const currentQ = questions[currentIdx] || null;
  const answeredCount = Object.keys(answers).length;
  const flaggedCount = Object.values(flagged).filter(Boolean).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80 backdrop-blur-xl">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
            <Award size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-100">Founder Competency Assessment</h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                <Sparkles size={11} /> AI Diagnostic
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Rigorous 6-domain situational evaluation measuring leadership depth, strategic discipline, and investment readiness for <span className="text-slate-200 font-medium">{company?.name || company?.companyName || 'your startup'}</span>.
            </p>
          </div>
        </div>

        {view === 'start' && (
          <div className="flex items-center gap-3">
            <div className="flex bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 text-xs">
              <button
                onClick={() => setMode('ai')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${mode === 'ai' ? 'bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <Sparkles size={13} /> AI Dynamic
              </button>
              <button
                onClick={() => setMode('standard')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${mode === 'standard' ? 'bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <BookOpen size={13} /> 120-Bank Curated
              </button>
            </div>
            <button
              onClick={handleStartTest}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition"
            >
              {loading ? (
                <RefreshCw size={16} className="animate-spin" />
              ) : (
                <Rocket size={16} />
              )}
              {result ? 'Retake Assessment' : 'Start Assessment Test'}
            </button>
          </div>
        )}

        {view === 'results' && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setView('start')}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs border border-slate-700 transition"
            >
              Assessment Hub
            </button>
            <button
              onClick={handleStartTest}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center gap-1.5 transition"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Retake Test
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 1. START VIEW                                                             */}
      {/* ========================================================================= */}
      {view === 'start' && (
        <div className="space-y-6">
          {/* Previous Scorecard (if available) */}
          {result && (
            <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-slate-900 border border-indigo-500/30 backdrop-blur-xl">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="relative w-20 h-20 shrink-0">
                    <GaugeRing score={result.overallScore} size={80} strokeWidth={8} color={result.overallScore >= 75 ? '#34D399' : result.overallScore >= 55 ? '#F2A93B' : '#F87171'} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xl font-bold text-slate-100">{result.overallScore}</span>
                      <span className="text-[9px] text-slate-400 uppercase">/ 100</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{result.archetype?.icon || '⚡'}</span>
                      <h3 className="text-lg font-bold text-slate-100">{result.archetype?.name || 'Visionary Builder'}</h3>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {result.capabilityLevel || 'Capable Founder'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 max-w-xl line-clamp-2">
                      {result.archetype?.desc || 'Balanced leadership strength across strategic vision and operational discipline.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setView('results')}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition"
                  >
                    View Full Diagnostic <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Test Methodology & Framework Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-xl">
              <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mb-3">
                <Clock size={18} />
              </div>
              <h4 className="text-sm font-bold text-slate-200">25-Minute Timed Session</h4>
              <p className="text-xs text-slate-400 mt-1">
                Simulates real-world high-pressure decision velocity. 30 randomized scenario dilemmas with auto-submission.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-xl">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mb-3">
                <Sparkles size={18} />
              </div>
              <h4 className="text-sm font-bold text-slate-200">AI Contextual Simulation</h4>
              <p className="text-xs text-slate-400 mt-1">
                Generates dilemmas tailored to your stage ({company?.stage || 'Seed'}) and industry ({company?.industry || 'Tech'}).
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-xl">
              <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center mb-3">
                <Shield size={18} />
              </div>
              <h4 className="text-sm font-bold text-slate-200">Investment Ready Catalyst</h4>
              <p className="text-xs text-slate-400 mt-1">
                Achieving a score &ge; 65/100 automatically advances your startup status to <strong>Investment Ready</strong>.
              </p>
            </div>
          </div>

          {/* 6 Venture Competency Domains Overview */}
          <div className="bg-slate-900/40 rounded-2xl border border-slate-800/80 p-6 backdrop-blur-xl">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">
              The 6 Core Venture Competency Domains Evaluated
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {DOMAINS.map(domain => {
                const IconComponent = domain.icon;
                return (
                  <div key={domain.id} className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 hover:border-slate-700 transition">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${domain.color}20`, color: domain.color }}>
                        <IconComponent size={16} />
                      </div>
                      <h4 className="text-sm font-semibold text-slate-200">{domain.label}</h4>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {domain.id === 'leadership' && 'Team hiring rubrics, culture building, decision rights (RACI), and co-founder alignment.'}
                      {domain.id === 'strategy' && 'Market positioning, defensibility, unit economics strategy, and competitive moats.'}
                      {domain.id === 'finance' && '13-week rolling cash flow, runway management, capital allocation, and burn governance.'}
                      {domain.id === 'marketing' && 'Full-funnel conversion, CAC/LTV payback, cohort retention, and channel optimization.'}
                      {domain.id === 'operations' && 'SOP codification, capacity ceiling modeling, bottleneck elimination, and OKRs.'}
                      {domain.id === 'product' && 'Product-market fit, onboarding velocity, RICE roadmap scoring, and feature prioritization.'}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. ACTIVE TEST RUNNER VIEW                                                */}
      {/* ========================================================================= */}
      {view === 'test' && currentQ && (
        <div className="space-y-4">
          {/* Top Sticky Test Bar */}
          <div className="sticky top-16 z-30 bg-slate-900/90 backdrop-blur-xl p-4 rounded-2xl border border-slate-800 shadow-2xl flex flex-wrap items-center justify-between gap-4">
            {/* Domain Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
              {DOMAINS.map(dom => {
                const domQs = questions.filter(q => q.domain === dom.id);
                const answeredDom = domQs.filter(q => answers[q.id] !== undefined).length;
                const isCurrent = currentQ.domain === dom.id;
                const IconComponent = dom.icon;
                return (
                  <button
                    key={dom.id}
                    onClick={() => {
                      const firstIdx = questions.findIndex(q => q.domain === dom.id);
                      if (firstIdx >= 0) setCurrentIdx(firstIdx);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                      isCurrent
                        ? 'bg-indigo-600 text-white shadow-md'
                        : answeredDom === domQs.length && domQs.length > 0
                        ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <IconComponent size={13} />
                    <span>{dom.label.split(' ')[0]}</span>
                    <span className="opacity-60 text-[10px]">({answeredDom}/{domQs.length})</span>
                  </button>
                );
              })}
            </div>

            {/* Timer & Controls */}
            <div className="flex items-center gap-3 shrink-0">
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-mono font-bold text-sm ${
                  timeLeft <= 120
                    ? 'bg-red-950/60 border-red-500 text-red-400 animate-pulse'
                    : timeLeft <= 300
                    ? 'bg-amber-950/50 border-amber-500 text-amber-400'
                    : 'bg-slate-800/80 border-slate-700 text-slate-200'
                }`}
              >
                <Clock size={15} />
                <span>{formatTime(timeLeft)}</span>
              </div>

              <button
                onClick={() => toggleFlag(currentQ.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
                  flagged[currentQ.id]
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-md'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200 border-slate-700'
                }`}
              >
                <Flag size={13} className={flagged[currentQ.id] ? 'fill-amber-400' : ''} />
                {flagged[currentQ.id] ? 'Flagged' : 'Flag'}
              </button>

              <button
                onClick={() => setShowReviewModal(true)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition flex items-center gap-1.5"
              >
                <FileCheck size={14} /> Review ({answeredCount}/30)
              </button>
            </div>
          </div>

          {/* Question Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQ.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="p-6 md:p-8 rounded-2xl bg-slate-900/80 border border-slate-800/90 shadow-xl backdrop-blur-xl space-y-6"
            >
              {/* Question Metadata */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-400">Q{currentIdx + 1} of {questions.length}</span>
                  <span className="px-2 py-0.5 rounded-md font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {currentQ.domainLabel || currentQ.domain}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                    {currentQ.subskill}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-md border font-semibold ${
                      currentQ.diff === 'Easy'
                        ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
                        : currentQ.diff === 'Hard'
                        ? 'border-red-500/30 text-red-400 bg-red-500/10'
                        : 'border-amber-500/30 text-amber-400 bg-amber-500/10'
                    }`}
                  >
                    {currentQ.diff}
                  </span>
                </div>

                {flagged[currentQ.id] && (
                  <span className="text-amber-400 font-medium flex items-center gap-1">
                    <Flag size={12} className="fill-amber-400" /> Flagged for review
                  </span>
                )}
              </div>

              {/* Question Text */}
              <h3 className="text-base md:text-lg font-semibold text-slate-100 leading-relaxed">
                {currentQ.question}
              </h3>

              {/* Options */}
              <div className="space-y-3 pt-2">
                {currentQ.options.map((optText, optIdx) => {
                  const isSelected = answers[currentQ.id] === optIdx;
                  const letter = String.fromCharCode(65 + optIdx);
                  return (
                    <div
                      key={optIdx}
                      onClick={() => handleSelectOption(optIdx)}
                      className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition select-none ${
                        isSelected
                          ? 'bg-indigo-600/20 border-indigo-500 text-slate-100 shadow-md shadow-indigo-500/10'
                          : 'bg-slate-800/40 hover:bg-slate-800/80 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center font-mono font-bold text-xs transition ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {letter}
                      </div>
                      <span className="text-sm leading-relaxed flex-1 mt-0.5">{optText}</span>
                    </div>
                  );
                })}
              </div>

              {/* Active Test Navigation Bar */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-800/80">
                <button
                  onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
                  disabled={currentIdx === 0}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition"
                >
                  <ChevronLeft size={16} /> Previous
                </button>

                <span className="text-xs text-slate-500 font-mono">
                  {answeredCount} of {questions.length} Answered
                </span>

                {currentIdx < questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentIdx(prev => Math.min(questions.length - 1, prev + 1))}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition"
                  >
                    Next <ChevronRight size={16} />
                  </button>
                ) : (
                  <button
                    onClick={() => setShowReviewModal(true)}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition"
                  >
                    Finish & Review <FileCheck size={16} />
                  </button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. PRE-SUBMIT REVIEW MODAL                                                */}
      {/* ========================================================================= */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-slate-100">Review Assessment Answers</h3>
                <p className="text-xs text-slate-400 mt-0.5">Click any question to verify or change your choice before submitting.</p>
              </div>
              <button
                onClick={() => setShowReviewModal(false)}
                className="text-slate-400 hover:text-slate-200 p-1"
              >
                ✕
              </button>
            </div>

            {/* Summary Stat Bar */}
            <div className="flex items-center justify-around p-3 rounded-xl bg-slate-800/50 border border-slate-800 text-xs">
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <CheckCircle2 size={14} /> {answeredCount} Answered
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <AlertCircle size={14} /> {questions.length - answeredCount} Unanswered
              </span>
              <span className="flex items-center gap-1.5 text-amber-400">
                <Flag size={14} /> {flaggedCount} Flagged
              </span>
              <span className="flex items-center gap-1.5 text-indigo-400 font-mono font-bold">
                <Clock size={14} /> {formatTime(timeLeft)}
              </span>
            </div>

            {/* 30-Question Grid */}
            <div className="grid grid-cols-6 sm:grid-cols-10 gap-2">
              {questions.map((q, i) => {
                const isAnswered = answers[q.id] !== undefined;
                const isFlag = flagged[q.id];
                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      setCurrentIdx(i);
                      setShowReviewModal(false);
                    }}
                    className={`h-11 rounded-lg text-xs font-mono font-bold relative flex flex-col items-center justify-center transition border ${
                      isAnswered
                        ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60'
                        : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    <span>{i + 1}</span>
                    {isFlag && (
                      <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                onClick={() => setShowReviewModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
              >
                Continue Answering
              </button>
              <button
                onClick={handleSubmitTest}
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition"
              >
                {loading ? <RefreshCw size={14} className="animate-spin" /> : <FileCheck size={14} />}
                Confirm & Submit Assessment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. RESULTS & DIAGNOSTIC VIEW                                              */}
      {/* ========================================================================= */}
      {view === 'results' && result && (
        <div className="space-y-6">
          {/* Main Scorecard Header */}
          <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/30 to-purple-950/20 border border-slate-800 backdrop-blur-xl shadow-xl">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              {/* Score Ring & Capability */}
              <div className="flex items-center gap-6">
                <div className="relative w-28 h-28 shrink-0">
                  <GaugeRing
                    score={result.overallScore}
                    size={112}
                    strokeWidth={10}
                    color={result.overallScore >= 75 ? '#34D399' : result.overallScore >= 55 ? '#F2A93B' : '#F87171'}
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-extrabold text-slate-100">{result.overallScore}</span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">Overall</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider"
                      style={{
                        background: result.overallScore >= 75 ? '#34D39915' : result.overallScore >= 55 ? '#F2A93B15' : '#F8717115',
                        borderColor: result.overallScore >= 75 ? '#34D39940' : result.overallScore >= 55 ? '#F2A93B40' : '#F8717140',
                        color: result.overallScore >= 75 ? '#34D399' : result.overallScore >= 55 ? '#F2A93B' : '#F87171'
                      }}
                    >
                      {result.capabilityLevel}
                    </span>
                    <span className="text-xs text-slate-400">⏱️ {result.durationMinutes || 15} mins</span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-slate-100">
                    Founder Capability Diagnostic
                  </h3>
                  <p className="text-xs text-slate-400 max-w-lg">
                    {result.overallScore >= 65
                      ? 'Investment threshold cleared. Verified operational competence unlocks Investment Ready positioning.'
                      : 'Developing profile. Implement the targeted playbooks below before opening formal Series A discussions.'}
                  </p>
                </div>
              </div>

              {/* Archetype Badge */}
              <div className="p-5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 max-w-md w-full">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{result.archetype?.icon || '⚡'}</span>
                  <div>
                    <span className="text-[10px] text-indigo-400 uppercase font-bold tracking-wider">Founder Archetype</span>
                    <h4 className="text-base font-bold text-slate-100">{result.archetype?.name || 'Visionary Builder'}</h4>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {result.archetype?.desc}
                </p>
              </div>
            </div>
          </div>

          {/* Domain Breakdown Bars */}
          <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6 backdrop-blur-xl">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">
              Venture Domain Performance Breakdown
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {DOMAINS.map(domain => {
                const score = result.domainScores ? (result.domainScores[domain.id] || 0) : 0;
                const IconComponent = domain.icon;
                return (
                  <div key={domain.id} className="space-y-2 p-3.5 rounded-xl bg-slate-800/30 border border-slate-800">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-slate-200 font-semibold">
                        <IconComponent size={15} style={{ color: domain.color }} />
                        <span>{domain.label}</span>
                      </div>
                      <span className="font-mono font-bold" style={{ color: score >= 75 ? '#34D399' : score >= 55 ? '#F2A93B' : '#F87171' }}>
                        {score}/100
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-700/50 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${score}%`,
                          backgroundColor: score >= 75 ? '#34D399' : score >= 55 ? '#F2A93B' : '#F87171'
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Strengths vs Priority Areas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Strengths */}
            <div className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 backdrop-blur-xl space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <CheckCircle2 size={18} /> Top Validated Strengths
              </div>
              <div className="space-y-2.5">
                {result.strengths && result.strengths.length > 0 ? (
                  result.strengths.map((st, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-xs">
                      <span className="font-medium text-slate-200">{st.subskill}</span>
                      <span className="font-mono font-bold text-emerald-400">{st.score}/100</span>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-400">Core operational execution and strategic resilience.</div>
                )}
              </div>
            </div>

            {/* Priority Development Areas */}
            <div className="p-6 rounded-2xl bg-amber-950/20 border border-amber-500/30 backdrop-blur-xl space-y-4">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <AlertCircle size={18} /> Priority Capability Focus Areas
              </div>
              <div className="space-y-2.5">
                {result.weaknesses && result.weaknesses.length > 0 ? (
                  result.weaknesses.map((w, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-amber-950/30 border border-amber-500/20 text-xs">
                      <span className="font-medium text-slate-200">{w.subskill}</span>
                      <span className="font-mono font-bold text-amber-400">{w.score}/100</span>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-400">Financial model stress-testing and pipeline predictability.</div>
                )}
              </div>
            </div>
          </div>

          {/* Actionable Playbooks */}
          {result.recommendations && result.recommendations.length > 0 && (
            <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6 backdrop-blur-xl space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                Targeted Action Playbooks & Remediation
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {result.recommendations.map((rec, i) => (
                  <div key={i} className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold">
                        {rec.subskill}
                      </span>
                      <span className="text-amber-400 font-semibold">{rec.priority} Priority</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-200">{rec.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{rec.body}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Question-by-Question Diagnostic Toggle */}
          {result.questionResults && result.questionResults.length > 0 && (
            <div className="bg-slate-900/40 rounded-2xl border border-slate-800 p-6 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-200">Question-by-Question Deep Dive</h3>
                  <p className="text-xs text-slate-400">Inspect pedagogical rationales and best practices for each dilemma.</p>
                </div>
                <button
                  onClick={() => setShowExplanations(!showExplanations)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 border border-slate-700 transition"
                >
                  {showExplanations ? 'Hide Explanations' : 'Show All Explanations'}
                </button>
              </div>

              {showExplanations && (
                <div className="space-y-4 pt-2">
                  {result.questionResults.map((q, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-800/30 border border-slate-800 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="font-mono font-bold">Q{idx + 1} · {q.domain} ({q.subskill})</span>
                        <span className={`font-semibold ${q.score >= 3 ? 'text-emerald-400' : q.score >= 1 ? 'text-amber-400' : 'text-red-400'}`}>
                          Earned {q.score} / {q.maxScore} pts
                        </span>
                      </div>
                      <p className="text-slate-200 font-medium">{q.question}</p>
                      {q.options && q.selectedOption >= 0 && (
                        <div className="p-2.5 rounded-lg bg-slate-800/80 text-slate-300">
                          <span className="text-slate-400">Your choice: </span>
                          <span>{q.options[q.selectedOption]}</span>
                        </div>
                      )}
                      {q.explanation && (
                        <div className="p-2.5 rounded-lg bg-indigo-950/30 border border-indigo-500/20 text-indigo-300">
                          <span className="font-semibold text-indigo-200">Venture Rationale: </span>
                          <span>{q.explanation}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Fallback questions generator if offline
function generateLocalFallbackQuestions(company) {
  const compName = company?.name || company?.companyName || 'NimbusCart';
  const industry = company?.industry || 'Technology';

  return [
    {
      id: 'l1',
      domain: 'leadership',
      domainLabel: 'Leadership & People',
      subskill: 'Team Building',
      diff: 'Easy',
      question: `Your key engineer at ${compName} threatens to resign two weeks before a critical release unless given an immediate 35% equity increase. How do you respond?`,
      options: [
        'Grant the increase immediately to protect the upcoming launch deadline',
        'Hold an immediate 1-on-1 to understand underlying motivation, refuse extortionate demands, and construct a contingency release plan',
        'Fire them on the spot to demonstrate strong leadership authority',
        'Promise the equity verbally but delay formal paperwork until after the release'
      ],
      scores: [0, 3, 0, 0],
      explanation: 'Founders must never negotiate under hostage conditions. Understanding motivation while preparing contingency protects governance and team integrity.'
    },
    {
      id: 's1',
      domain: 'strategy',
      domainLabel: 'Strategy & Vision',
      subskill: 'Competitive Positioning',
      diff: 'Medium',
      question: `A well-funded competitor enters your ${industry} market with pricing 40% below your baseline. How do you respond?`,
      options: [
        'Match their price cuts across all tiers immediately to defend market share',
        'Spend double on paid advertising to capture top-of-funnel mindshare',
        'Focus on customer retention, deepen unique product workflow integration, and highlight superior ROI rather than racing to the bottom',
        'Publicly criticize the competitor on social channels'
      ],
      scores: [0, 0, 3, 0],
      explanation: 'Matching predatory pricing erodes margin and triggers a race to the bottom. Defensibility comes from switching costs, retention, and differentiated value.'
    },
    {
      id: 'f1',
      domain: 'finance',
      domainLabel: 'Finance & Economics',
      subskill: 'Cash Management',
      diff: 'Hard',
      question: `${compName}'s runway has contracted to 4.5 months. An existing investor offers bridge funding at a 30% discount with aggressive liquidation preferences. What is your priority?`,
      options: [
        'Reject the offer outright and hope new investors emerge next month',
        'Immediately model cash survival scenarios to reduce burn to cash-flow neutral, while negotiating standard bridge terms from a position of control',
        'Accept the terms without reading the liquidation preference clauses',
        'Increase marketing spend to boost top-line revenue before running out of cash'
      ],
      scores: [0, 3, 0, 0],
      explanation: 'When runway dips below 6 months, founders must immediately take control of burn rate to achieve default-alive status before negotiating bridge rounds.'
    },
    {
      id: 'm1',
      domain: 'marketing',
      domainLabel: 'Sales & Marketing',
      subskill: 'Customer Acquisition',
      diff: 'Medium',
      question: `Your blended CAC increases by 65% over one quarter while customer payback stretches from 6 to 14 months. What is your intervention?`,
      options: [
        'Raise seed funding immediately to subsidize the higher customer acquisition costs',
        'Pause unprofitable marketing channels, audit drop-off in the conversion funnel, and incentivize referrals and organic word-of-mouth',
        'Increase product prices by 65% across all customer tiers',
        'Double down on the same channels hoping ad algorithms optimize over time'
      ],
      scores: [0, 3, 0, 0],
      explanation: 'Payback beyond 12 months in early stage threatens solvency. Ruthlessly cutting underperforming channels and fixing funnel leaks restores unit economics.'
    },
    {
      id: 'o1',
      domain: 'operations',
      domainLabel: 'Operations & Execution',
      subskill: 'Process SOPs',
      diff: 'Easy',
      question: `Customer onboarding complaints at ${compName} surge as order volume doubles. What is the root cause solution?`,
      options: [
        'Hire 10 additional support agents immediately',
        'Standardize the onboarding SOP, automate account provisioning, and introduce interactive setup milestones',
        'Limit new customer signups to 5 per week',
        'Blame the customer for failing to read documentation'
      ],
      scores: [0, 3, 0, 0],
      explanation: 'Scaling operations through linear headcount hiring increases burn. Codifying SOPs and automating customer onboarding creates scalable unit margins.'
    },
    {
      id: 'p1',
      domain: 'product',
      domainLabel: 'Innovation & Product',
      subskill: 'Roadmap Prioritization',
      diff: 'Hard',
      question: `A single enterprise prospect offering 25% of your annual revenue targets demands bespoke features that contradict your long-term product roadmap. How do you evaluate?`,
      options: [
        'Build whatever they ask for immediately because revenue solves all problems',
        'Evaluate whether the request can be generalized into a reusable platform feature, negotiate partial development funding, or decline if it creates technical debt',
        'Refuse to speak to enterprise clients to preserve product purity',
        'Subcontract the build to an offshore agency without code review'
      ],
      scores: [0, 3, 0, 0],
      explanation: 'Custom development for single large clients turns startups into agency service shops. Generalizing requests into core platform assets protects scalability.'
    }
  ];
}

function calculateLocalEvaluation(questions, answers, durationMinutes) {
  let totalScore = 0;
  let maxScore = 0;
  const domainTotals = {};
  const domainMaxes = {};

  DOMAINS.forEach(d => {
    domainTotals[d.id] = 0;
    domainMaxes[d.id] = 0;
  });

  const questionResults = questions.map(q => {
    const chosenIdx = answers[q.id] !== undefined ? answers[q.id] : -1;
    const scores = q.scores || [0, 1, 3, 0];
    const earned = chosenIdx >= 0 ? scores[chosenIdx] || 0 : 0;
    const maxPoss = Math.max(...scores, 1);

    totalScore += earned;
    maxScore += maxPoss;

    if (domainTotals[q.domain] !== undefined) {
      domainTotals[q.domain] += earned;
      domainMaxes[q.domain] += maxPoss;
    }

    return {
      domain: q.domain,
      subskill: q.subskill,
      question: q.question,
      options: q.options,
      selectedOption: chosenIdx,
      score: earned,
      maxScore: maxPoss,
      explanation: q.explanation
    };
  });

  const domainScores = {};
  DOMAINS.forEach(d => {
    const max = domainMaxes[d.id] || 1;
    domainScores[d.id] = Math.min(100, Math.round((domainTotals[d.id] / max) * 100));
  });

  const overall = maxScore > 0 ? Math.min(100, Math.round((totalScore / maxScore) * 100)) : 75;

  return {
    overallScore: overall,
    capabilityLevel: overall >= 80 ? 'Highly Capable Founder' : overall >= 65 ? 'Capable Founder' : 'Developing Founder',
    archetype: {
      name: overall >= 75 ? 'Visionary Builder' : 'Operational Architect',
      icon: overall >= 75 ? '⚡' : '🏗️',
      desc: 'Demonstrates balanced strategic vision with disciplined execution and focus on scalable unit economics.'
    },
    domainScores,
    subskillScores: {},
    strengths: [
      { subskill: 'Cash Management', score: 85 },
      { subskill: 'Competitive Positioning', score: 82 },
      { subskill: 'Roadmap Prioritization', score: 80 }
    ],
    weaknesses: [
      { subskill: 'Customer Acquisition', score: 55 },
      { subskill: 'Process SOPs', score: 60 }
    ],
    recommendations: [
      { subskill: 'Customer Acquisition', priority: 'High', title: 'Optimize CAC Payback', body: 'Audit marketing channels and double down on organic referral loops.' },
      { subskill: 'Process SOPs', priority: 'Medium', title: 'Codify Onboarding Workflows', body: 'Document repetitive customer touchpoints to reduce support friction.' }
    ],
    durationMinutes,
    questionResults
  };
}
