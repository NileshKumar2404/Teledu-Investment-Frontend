import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Check, CheckCircle2, ChevronRight, ChevronLeft, BookOpen,
  Briefcase, FileText, HelpCircle, Sparkles, Clock, Award,
  AlertTriangle, ArrowRight, Copy, CheckCheck, Target, Shield,
  Zap, Lightbulb, TrendingUp, Compass, Play, Video, FileDown, Lock
} from 'lucide-react';
import { getNextLesson, getPreviousLesson } from '../../data/academyLessonsData';
import { getStoredUser } from '../../api/client';

export default function LessonReaderModal({
  lesson,
  isOpen,
  onClose,
  onToggleComplete,
  isCompleted,
  onNavigateLesson,
  currentUser,
  onOpenPricing
}) {
  const [activeTab, setActiveTab] = useState('guide'); // 'guide' | 'cases' | 'worksheet' | 'videos' | 'pdfs' | 'quiz'
  const [worksheetAnswers, setWorksheetAnswers] = useState({});
  const [savedStatus, setSavedStatus] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState({});
  const [copiedNote, setCopiedNote] = useState(false);

  // Check subscription entitlement
  const user = currentUser || getStoredUser();
  const userPlan = user?.subscription?.plan || 'free';
  const userStatus = user?.subscription?.status || 'inactive';
  const isAdmin = ['admin', 'super_admin'].includes(user?.role);
  const isSubscribed = isAdmin || (
    ['founder_pro', 'investor_pro', 'all_access_pro'].includes(userPlan) &&
    ['active', 'trialing'].includes(userStatus)
  );

  // Load saved worksheet responses from localStorage whenever lesson changes
  useEffect(() => {
    if (lesson?.id) {
      try {
        const saved = localStorage.getItem(`academy_worksheet_${lesson.id}`);
        if (saved) {
          setWorksheetAnswers(JSON.parse(saved));
        } else {
          setWorksheetAnswers({});
        }
      } catch (e) {
        setWorksheetAnswers({});
      }
      setQuizAnswers({});
      setQuizSubmitted({});
      setActiveTab('guide');
    }
  }, [lesson?.id]);

  if (!isOpen || !lesson) return null;

  const prevLesson = getPreviousLesson(lesson.id);
  const nextLesson = getNextLesson(lesson.id);

  // Handle Worksheet Input
  const handleWorksheetChange = (fieldId, value) => {
    const updated = { ...worksheetAnswers, [fieldId]: value };
    setWorksheetAnswers(updated);
    try {
      localStorage.setItem(`academy_worksheet_${lesson.id}`, JSON.stringify(updated));
      setSavedStatus(true);
      setTimeout(() => setSavedStatus(false), 1500);
    } catch (e) {
      console.warn('Failed saving worksheet to local storage');
    }
  };

  // Copy Worksheet Summary
  const handleCopyWorksheet = () => {
    const textLines = [
      `=== ACADEMY WORKSHEET: ${lesson.title.toUpperCase()} ===`,
      `Track: ${lesson.trackName || lesson.category}`,
      `Date: ${new Date().toLocaleDateString()}`,
      ''
    ];
    (lesson.worksheet?.fields || []).forEach(f => {
      textLines.push(`[${f.label}]`);
      textLines.push(worksheetAnswers[f.id] || '(No response entered yet)');
      textLines.push('');
    });

    navigator.clipboard.writeText(textLines.join('\n')).then(() => {
      setCopiedNote(true);
      setTimeout(() => setCopiedNote(false), 2000);
    });
  };

  // Handle Quiz Selection
  const handleSelectQuizOption = (qIdx, optIdx) => {
    setQuizAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
    setQuizSubmitted(prev => ({ ...prev, [qIdx]: true }));
  };

  const getDifficultyColor = (diff) => {
    switch (diff) {
      case 'BEGINNER': return '#34D399';
      case 'INTERMEDIATE': return '#FBBF24';
      case 'ADVANCED': return '#F43F5E';
      default: return '#818CF8';
    }
  };

  return (
    <AnimatePresence>
      <div className="lesson-reader-overlay">
        {/* Backdrop Dismiss */}
        <div onClick={onClose} style={{ position: 'absolute', inset: 0 }} />

        <motion.div
          className="lesson-reader-dialog"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Top Bar Navigation */}
          <div style={{
            padding: '1.2rem 1.8rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(15, 23, 42, 0.75)',
            flexShrink: 0
          }}>
            {/* Left Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap' }}>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                padding: '0.22rem 0.65rem',
                borderRadius: 'var(--radius-pill)',
                background: 'rgba(99, 102, 241, 0.15)',
                color: '#818CF8',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}>
                {lesson.trackName || lesson.category} · Lesson {lesson.number || lesson.id.replace('lesson-', '')} of 30
              </span>

              <span style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                padding: '0.22rem 0.65rem',
                borderRadius: 'var(--radius-pill)',
                background: 'rgba(255, 255, 255, 0.06)',
                color: getDifficultyColor(lesson.difficulty),
                border: `1px solid ${getDifficultyColor(lesson.difficulty)}40`
              }}>
                {lesson.difficulty}
              </span>

              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <Clock size={13} />
                {lesson.estimatedMinutes || 25} mins comprehensive
              </span>

              {isCompleted && (
                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '0.2rem 0.6rem',
                  borderRadius: 'var(--radius-pill)',
                  background: 'rgba(16, 185, 129, 0.18)',
                  color: '#34D399',
                  border: '1px solid rgba(16, 185, 129, 0.35)'
                }}>
                  <CheckCircle2 size={12} />
                  Mastered
                </span>
              )}
            </div>

            {/* Right Quick Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              {/* Previous Lesson */}
              <button
                disabled={!prevLesson}
                onClick={() => prevLesson && onNavigateLesson && onNavigateLesson(prevLesson)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '0.4rem 0.75rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  background: 'rgba(255, 255, 255, 0.04)',
                  color: prevLesson ? 'var(--text-secondary)' : 'rgba(255, 255, 255, 0.2)',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: prevLesson ? 'pointer' : 'default'
                }}
              >
                <ChevronLeft size={14} />
                <span>Prev</span>
              </button>

              {/* Next Lesson */}
              <button
                disabled={!nextLesson}
                onClick={() => nextLesson && onNavigateLesson && onNavigateLesson(nextLesson)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '0.4rem 0.75rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  background: 'rgba(255, 255, 255, 0.04)',
                  color: nextLesson ? 'var(--text-secondary)' : 'rgba(255, 255, 255, 0.2)',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: nextLesson ? 'pointer' : 'default'
                }}
              >
                <span>Next</span>
                <ChevronRight size={14} />
              </button>

              {/* Close Button */}
              <button
                onClick={onClose}
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  marginLeft: '0.4rem'
                }}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Lesson Hero Header */}
          <div style={{
            padding: '1.4rem 2rem 1rem',
            background: 'linear-gradient(180deg, rgba(99, 102, 241, 0.07) 0%, transparent 100%)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            flexShrink: 0
          }}>
            <h1 style={{
              fontSize: '1.75rem',
              fontWeight: 900,
              color: '#fff',
              margin: '0 0 0.4rem',
              fontFamily: 'var(--font-display)',
              letterSpacing: '-0.02em'
            }}>
              {lesson.title}
            </h1>
            <p style={{
              fontSize: '0.88rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.5,
              margin: '0 0 1rem',
              maxWidth: '900px'
            }}>
              {lesson.executiveSummary || lesson.description}
            </p>

            {/* 4 Interactive Course Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => setActiveTab('guide')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '0.55rem 1rem',
                  borderRadius: '10px',
                  border: 'none',
                  background: activeTab === 'guide' ? 'linear-gradient(135deg, #6366F1, #8B5CF6)' : 'rgba(255, 255, 255, 0.05)',
                  color: activeTab === 'guide' ? '#fff' : 'var(--text-secondary)',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <BookOpen size={14} />
                <span>Deep Dive & Frameworks</span>
              </button>

              <button
                onClick={() => setActiveTab('cases')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '0.55rem 1rem',
                  borderRadius: '10px',
                  border: 'none',
                  background: activeTab === 'cases' ? 'linear-gradient(135deg, #6366F1, #8B5CF6)' : 'rgba(255, 255, 255, 0.05)',
                  color: activeTab === 'cases' ? '#fff' : 'var(--text-secondary)',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <Briefcase size={14} />
                <span>Real-World Case Studies ({lesson.caseStudies?.length || 2})</span>
              </button>

              <button
                onClick={() => setActiveTab('worksheet')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '0.55rem 1rem',
                  borderRadius: '10px',
                  border: 'none',
                  background: activeTab === 'worksheet' ? 'linear-gradient(135deg, #6366F1, #8B5CF6)' : 'rgba(255, 255, 255, 0.05)',
                  color: activeTab === 'worksheet' ? '#fff' : 'var(--text-secondary)',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <FileText size={14} />
                <span>Founder Worksheet</span>
                {Object.keys(worksheetAnswers).length > 0 && (
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
                )}
              </button>

              {/* TAB 4: VIDEOS (PREMIUM) */}
              <button
                onClick={() => setActiveTab('videos')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '0.55rem 1rem',
                  borderRadius: '10px',
                  border: 'none',
                  background: activeTab === 'videos' ? 'linear-gradient(135deg, #6366F1, #8B5CF6)' : 'rgba(255, 255, 255, 0.05)',
                  color: activeTab === 'videos' ? '#fff' : 'var(--text-secondary)',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <Video size={14} />
                <span>Videos</span>
                {!isSubscribed ? (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '2px',
                    padding: '0.15rem 0.4rem',
                    borderRadius: '6px',
                    background: 'rgba(245, 158, 11, 0.15)',
                    border: '1px solid rgba(245, 158, 11, 0.35)',
                    color: '#F59E0B',
                    fontSize: '0.65rem',
                    fontWeight: 800
                  }}>
                    <Lock size={10} /> PRO
                  </span>
                ) : (
                  <span style={{
                    padding: '0.15rem 0.4rem',
                    borderRadius: '6px',
                    background: 'rgba(99, 102, 241, 0.2)',
                    color: '#818CF8',
                    fontSize: '0.65rem',
                    fontWeight: 700
                  }}>
                    Masterclass
                  </span>
                )}
              </button>

              {/* TAB 5: PDFS (PREMIUM) */}
              <button
                onClick={() => setActiveTab('pdfs')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '0.55rem 1rem',
                  borderRadius: '10px',
                  border: 'none',
                  background: activeTab === 'pdfs' ? 'linear-gradient(135deg, #6366F1, #8B5CF6)' : 'rgba(255, 255, 255, 0.05)',
                  color: activeTab === 'pdfs' ? '#fff' : 'var(--text-secondary)',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <FileDown size={14} />
                <span>PDFs</span>
                {!isSubscribed ? (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '2px',
                    padding: '0.15rem 0.4rem',
                    borderRadius: '6px',
                    background: 'rgba(245, 158, 11, 0.15)',
                    border: '1px solid rgba(245, 158, 11, 0.35)',
                    color: '#F59E0B',
                    fontSize: '0.65rem',
                    fontWeight: 800
                  }}>
                    <Lock size={10} /> PRO
                  </span>
                ) : (
                  <span style={{
                    padding: '0.15rem 0.4rem',
                    borderRadius: '6px',
                    background: 'rgba(16, 185, 129, 0.2)',
                    color: '#34D399',
                    fontSize: '0.65rem',
                    fontWeight: 700
                  }}>
                    Guides
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('quiz')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '0.55rem 1rem',
                  borderRadius: '10px',
                  border: 'none',
                  background: activeTab === 'quiz' ? 'linear-gradient(135deg, #6366F1, #8B5CF6)' : 'rgba(255, 255, 255, 0.05)',
                  color: activeTab === 'quiz' ? '#fff' : 'var(--text-secondary)',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <HelpCircle size={14} />
                <span>Knowledge Check</span>
                {Object.keys(quizSubmitted).length > 0 && (
                  <span style={{ fontSize: '0.7rem', color: '#10B981', fontWeight: 800 }}>✓</span>
                )}
              </button>
            </div>
          </div>

          {/* Main Scrollable Content Area */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.8rem 2rem',
            color: 'var(--text-primary)'
          }}>

            {/* TAB 1: DEEP DIVE & FRAMEWORKS */}
            {activeTab === 'guide' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1020px' }}>

                {/* Key Objectives Card */}
                {lesson.objectives && lesson.objectives.length > 0 && (
                  <div style={{
                    background: 'rgba(99, 102, 241, 0.07)',
                    border: '1px solid rgba(99, 102, 241, 0.25)',
                    borderRadius: '16px',
                    padding: '1.25rem 1.5rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.6rem' }}>
                      <Target size={16} color="#818CF8" />
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#818CF8', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Mastery Learning Objectives
                      </h4>
                    </div>
                    <div className="lesson-reader-quiz-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
                      {lesson.objectives.map((obj, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                          <Check size={14} color="#10B981" style={{ flexShrink: 0, marginTop: '3px' }} />
                          <span>{obj}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Section: The Mental Model & Architecture */}
                {lesson.mentalModel && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.6rem' }}>
                      <Lightbulb size={18} color="#FBBF24" />
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                        {lesson.mentalModel.name}
                      </h3>
                    </div>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 1rem' }}>
                      {lesson.mentalModel.concept}
                    </p>

                    {/* ASCII / Visual Flow Diagram Card */}
                    {lesson.mentalModel.diagram && (
                      <div style={{
                        background: '#090D16',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '14px',
                        padding: '1.2rem 1.4rem',
                        fontFamily: 'monospace',
                        fontSize: '0.78rem',
                        color: '#38BDF8',
                        whiteSpace: 'pre-wrap',
                        lineHeight: 1.45,
                        marginBottom: '1.2rem',
                        overflowX: 'auto'
                      }}>
                        {lesson.mentalModel.diagram}
                      </div>
                    )}

                    {/* Core Principles Bullets */}
                    {lesson.mentalModel.corePrinciples && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                        {lesson.mentalModel.corePrinciples.map((prin, i) => (
                          <div key={i} style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '10px',
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.06)',
                            padding: '0.75rem 1rem',
                            borderRadius: '10px',
                            fontSize: '0.84rem'
                          }}>
                            <span style={{
                              fontWeight: 900,
                              color: '#6366F1',
                              fontSize: '0.78rem',
                              padding: '0.15rem 0.45rem',
                              borderRadius: '4px',
                              background: 'rgba(99, 102, 241, 0.15)'
                            }}>
                              RULE 0{i + 1}
                            </span>
                            <span style={{ color: 'var(--text-primary)', lineHeight: 1.45 }}>{prin}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Section: Operational & VC Benchmarks */}
                {lesson.benchmarks && lesson.benchmarks.length > 0 && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.8rem' }}>
                      <TrendingUp size={18} color="#34D399" />
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                        Quantitative Benchmarks & Rules of Thumb
                      </h3>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                      {lesson.benchmarks.map((bm, i) => (
                        <div key={i} style={{
                          background: 'rgba(16, 185, 129, 0.05)',
                          border: '1px solid rgba(16, 185, 129, 0.2)',
                          borderRadius: '14px',
                          padding: '1.1rem 1.25rem'
                        }}>
                          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                            {bm.metric}
                          </div>
                          <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#34D399', marginBottom: '6px', fontFamily: 'var(--font-display)' }}>
                            {bm.target}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                            {bm.description}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Section: Step-by-Step Founder Playbook */}
                {lesson.playbook && lesson.playbook.length > 0 && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.8rem' }}>
                      <Compass size={18} color="#818CF8" />
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                        Step-by-Step Founder Playbook
                      </h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                      {lesson.playbook.map((step, i) => (
                        <div key={i} style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '1rem',
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          borderRadius: '12px',
                          padding: '1rem 1.2rem'
                        }}>
                          <div style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.8rem',
                            fontWeight: 900,
                            flexShrink: 0
                          }}>
                            {step.step || i + 1}
                          </div>
                          <div>
                            <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#fff', margin: '0 0 0.3rem' }}>
                              {step.title}
                            </h4>
                            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                              {step.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Section: Anti-Patterns & Rookie Traps */}
                {lesson.antiPatterns && lesson.antiPatterns.length > 0 && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.8rem' }}>
                      <AlertTriangle size={18} color="#F43F5E" />
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                        Common Anti-Patterns & Costly Mistakes
                      </h3>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                      {lesson.antiPatterns.map((ap, i) => (
                        <div key={i} style={{
                          background: 'rgba(244, 63, 94, 0.05)',
                          border: '1px solid rgba(244, 63, 94, 0.2)',
                          borderRadius: '14px',
                          padding: '1.1rem 1.25rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.5rem'
                        }}>
                          <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#F87171' }}>
                            ⚠️ {ap.mistake}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                            <strong style={{ color: '#fff' }}>Why it fails:</strong> {ap.whyItFails}
                          </div>
                          <div style={{
                            fontSize: '0.78rem',
                            color: '#34D399',
                            lineHeight: 1.45,
                            background: 'rgba(16, 185, 129, 0.08)',
                            padding: '0.5rem 0.75rem',
                            borderRadius: '8px',
                            border: '1px solid rgba(16, 185, 129, 0.2)',
                            marginTop: '4px'
                          }}>
                            <strong>Pro Fix:</strong> {ap.proFix}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: REAL-WORLD CASE STUDIES */}
            {activeTab === 'cases' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.6rem', maxWidth: '1020px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.2rem' }}>
                  <Briefcase size={18} color="#818CF8" />
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                    Historical Case Studies: Strategy & Execution
                  </h3>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 0.8rem' }}>
                  Analyze how breakout ventures navigated this exact dilemma—and how failed companies collapsed.
                </p>

                <div className="lesson-reader-case-study-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem' }}>
                  {(lesson.caseStudies || []).map((cs, i) => (
                    <div key={i} style={{
                      background: 'rgba(15, 23, 42, 0.75)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '18px',
                      padding: '1.6rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.9rem',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <h4 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fff', margin: 0, fontFamily: 'var(--font-display)' }}>
                          {cs.company}
                        </h4>
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#818CF8', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-pill)', background: 'rgba(99, 102, 241, 0.15)' }}>
                          {cs.stage}
                        </span>
                      </div>

                      {/* Dilemma */}
                      <div>
                        <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#F87171', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '3px' }}>
                          The Existential Dilemma
                        </div>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                          {cs.dilemma}
                        </p>
                      </div>

                      {/* Strategic Play */}
                      <div>
                        <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#38BDF8', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '3px' }}>
                          The Strategic Play
                        </div>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                          {cs.strategy}
                        </p>
                      </div>

                      {/* Quantified Outcome */}
                      <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                        <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#34D399', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '3px' }}>
                          Empirical Outcome
                        </div>
                        <p style={{ fontSize: '0.82rem', color: '#fff', margin: 0, lineHeight: 1.5, fontWeight: 600 }}>
                          {cs.outcome}
                        </p>
                      </div>

                      {/* Key Takeaway */}
                      <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '0.8rem', fontSize: '0.8rem', color: '#818CF8', fontWeight: 700 }}>
                        💡 Founder Takeaway: <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>{cs.keyTakeaway}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: FOUNDER WORKSHEET */}
            {activeTab === 'worksheet' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '860px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <div style={{ display: 'center', alignItems: 'center', gap: '8px' }}>
                      <FileText size={18} color="#10B981" />
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                        Interactive Founder Worksheet
                      </h3>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                      {lesson.worksheet?.prompt || 'Apply the principles of this lesson directly to your company.'}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    {savedStatus && (
                      <span style={{ fontSize: '0.75rem', color: '#34D399', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Check size={13} /> Auto-Saved
                      </span>
                    )}

                    <button
                      onClick={handleCopyWorksheet}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '0.45rem 0.85rem',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: copiedNote ? '#34D399' : 'var(--text-secondary)',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {copiedNote ? <CheckCheck size={14} /> : <Copy size={14} />}
                      <span>{copiedNote ? 'Copied to Clipboard!' : 'Copy Summary'}</span>
                    </button>
                  </div>
                </div>

                {/* Form Fields */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {(lesson.worksheet?.fields || [
                    { id: 'notes', label: 'Key Venture Notes & Takeaways', placeholder: 'Write your strategic reflections...', helperText: 'Saved automatically to your local browser storage.' }
                  ]).map((field) => (
                    <div key={field.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fff' }}>
                        {field.label}
                      </label>
                      <textarea
                        rows={4}
                        value={worksheetAnswers[field.id] || ''}
                        onChange={(e) => handleWorksheetChange(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        style={{
                          width: '100%',
                          padding: '0.85rem 1rem',
                          borderRadius: '12px',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          background: 'rgba(15, 23, 42, 0.6)',
                          color: '#fff',
                          fontSize: '0.85rem',
                          fontFamily: 'inherit',
                          lineHeight: 1.5,
                          outline: 'none',
                          resize: 'vertical',
                          boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.2)'
                        }}
                      />
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        <span>{field.helperText}</span>
                        <span>{(worksheetAnswers[field.id] || '').length} characters</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: VIDEOS (PREMIUM FEATURE) */}
            {activeTab === 'videos' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '920px' }}>
                {!isSubscribed ? (
                  /* LOCKED PAYWALL STATE FOR UNSUBSCRIBED USERS */
                  <div style={{
                    background: 'radial-gradient(ellipse at 50% 30%, rgba(99, 102, 241, 0.14) 0%, rgba(15, 23, 42, 0.95) 75%)',
                    border: '1px solid rgba(99, 102, 241, 0.35)',
                    borderRadius: '20px',
                    padding: '3rem 2rem',
                    textAlign: 'center',
                    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), 0 0 30px rgba(99, 102, 241, 0.2)'
                  }}>
                    <div style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(168, 85, 247, 0.25))',
                      border: '1px solid rgba(99, 102, 241, 0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 1.25rem',
                      boxShadow: '0 0 25px rgba(99, 102, 241, 0.35)'
                    }}>
                      <Lock size={26} color="#818CF8" />
                    </div>

                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '0.3rem 0.85rem',
                      borderRadius: '9999px',
                      background: 'rgba(99, 102, 241, 0.15)',
                      border: '1px solid rgba(99, 102, 241, 0.3)',
                      color: '#818CF8',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      marginBottom: '1rem'
                    }}>
                      <Sparkles size={12} /> Premium Feature • Founder Pro
                    </div>

                    <h3 style={{ fontSize: '1.65rem', fontWeight: 900, color: '#fff', margin: '0 0 0.6rem', letterSpacing: '-0.02em' }}>
                      Unlock Video Masterclasses for {lesson.title}
                    </h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '540px', margin: '0 auto 1.8rem', lineHeight: 1.6 }}>
                      High-definition video teardowns, venture breakdowns, and founder case study sessions are premium features locked to active subscribers.
                    </p>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                      gap: '0.85rem',
                      maxWidth: '680px',
                      margin: '0 auto 2rem',
                      textAlign: 'left'
                    }}>
                      {[
                        '4K video breakdowns of each strategic lesson framework',
                        'Step-by-step financial model teardowns by serial founders',
                        'Real-world deal room and cap table simulations'
                      ].map((benefit, bIdx) => (
                        <div key={bIdx} style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.65rem',
                          padding: '0.75rem 1rem',
                          borderRadius: '10px',
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(255, 255, 255, 0.07)',
                          fontSize: '0.82rem',
                          color: '#E2E8F0'
                        }}>
                          <Check size={14} color="#10B981" style={{ flexShrink: 0 }} />
                          <span>{benefit}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={onOpenPricing}
                      style={{
                        padding: '0.85rem 2rem',
                        borderRadius: '12px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                        color: '#fff',
                        fontSize: '0.92rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 20px rgba(99, 102, 241, 0.45)',
                        transition: 'transform 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
                    >
                      <Sparkles size={16} />
                      <span>Upgrade to Unlock Video Masterclasses</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                ) : (
                  /* COMING SOON SECTION FOR SUBSCRIBED USERS */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
                    {/* Header */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                      paddingBottom: '1.2rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '10px',
                          background: 'rgba(99, 102, 241, 0.15)',
                          border: '1px solid rgba(99, 102, 241, 0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#818CF8'
                        }}>
                          <Video size={18} />
                        </div>
                        <div>
                          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                            Video Masterclasses • {lesson.title}
                          </h3>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                            Interactive visual teardowns and tactical case study walkthroughs
                          </p>
                        </div>
                      </div>

                      <div style={{
                        padding: '0.35rem 0.9rem',
                        borderRadius: '9999px',
                        background: 'rgba(245, 158, 11, 0.15)',
                        border: '1px solid rgba(245, 158, 11, 0.35)',
                        color: '#F59E0B',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        letterSpacing: '0.04em'
                      }}>
                        Coming Soon.....
                      </div>
                    </div>

                    {/* Hero Coming Soon Notice Card */}
                    <div style={{
                      background: 'radial-gradient(ellipse at 50% 20%, rgba(99, 102, 241, 0.12) 0%, rgba(15, 23, 42, 0.8) 80%)',
                      border: '1px solid rgba(99, 102, 241, 0.25)',
                      borderRadius: '18px',
                      padding: '2.5rem 2rem',
                      textAlign: 'center',
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: '50%',
                        background: 'rgba(99, 102, 241, 0.2)',
                        border: '1px solid rgba(99, 102, 241, 0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.2rem',
                        color: '#818CF8'
                      }}>
                        <Play size={22} style={{ marginLeft: '3px' }} />
                      </div>

                      <h4 style={{
                        fontSize: '1.8rem',
                        fontWeight: 900,
                        color: '#FFFFFF',
                        margin: '0 0 0.5rem',
                        letterSpacing: '0.02em',
                        background: 'linear-gradient(135deg, #FFFFFF 0%, #A5B4FC 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                      }}>
                        Coming Soon.....
                      </h4>

                      <p style={{
                        fontSize: '0.92rem',
                        color: '#94A3B8',
                        maxWidth: '560px',
                        margin: '0 auto 1.8rem',
                        lineHeight: 1.6
                      }}>
                        High-definition video masterclasses, framework breakdown screencasts, and founder live teardowns for "{lesson.title}" are currently in post-production by our venture studio partners.
                      </p>

                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '0.5rem 1.2rem',
                        borderRadius: '9999px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        fontSize: '0.8rem',
                        color: '#CBD5E1'
                      }}>
                        <Clock size={14} color="#818CF8" />
                        <span>Included in your active Founder Pro membership</span>
                      </div>
                    </div>

                    {/* Syllabus Previews */}
                    <div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.85rem' }}>
                        Curriculum Modules in Production
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {[
                          { title: 'Core Framework Mechanics & Mathematical Proof', duration: '12 mins', tag: 'Mechanical Breakdown' },
                          { title: 'Real-World Venture Case Study & Pivot Analysis', duration: '15 mins', tag: 'Case Teardown' },
                          { title: 'Financial Modeling, Diligence & Dilution Scenarios', duration: '18 mins', tag: 'Diligence Lab' }
                        ].map((mod, mIdx) => (
                          <div key={mIdx} style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '1rem 1.25rem',
                            borderRadius: '12px',
                            background: 'rgba(255, 255, 255, 0.025)',
                            border: '1px solid rgba(255, 255, 255, 0.07)',
                            gap: '1rem'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                              <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                background: 'rgba(99, 102, 241, 0.1)',
                                border: '1px solid rgba(99, 102, 241, 0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#818CF8',
                                flexShrink: 0
                              }}>
                                <Play size={14} style={{ marginLeft: '2px' }} />
                              </div>
                              <div>
                                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#E2E8F0', marginBottom: '2px' }}>
                                  Module {mIdx + 1}: {mod.title}
                                </div>
                                <div style={{ fontSize: '0.74rem', color: '#64748B' }}>
                                  {mod.tag} • Estimated duration: {mod.duration}
                                </div>
                              </div>
                            </div>

                            <span style={{
                              padding: '0.25rem 0.65rem',
                              borderRadius: '6px',
                              background: 'rgba(255, 255, 255, 0.04)',
                              border: '1px solid rgba(255, 255, 255, 0.08)',
                              color: '#94A3B8',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              flexShrink: 0
                            }}>
                              Coming Soon.....
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: PDFS (PREMIUM FEATURE) */}
            {activeTab === 'pdfs' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '920px' }}>
                {!isSubscribed ? (
                  /* LOCKED PAYWALL STATE FOR UNSUBSCRIBED USERS */
                  <div style={{
                    background: 'radial-gradient(ellipse at 50% 30%, rgba(16, 185, 129, 0.14) 0%, rgba(15, 23, 42, 0.95) 75%)',
                    border: '1px solid rgba(16, 185, 129, 0.35)',
                    borderRadius: '20px',
                    padding: '3rem 2rem',
                    textAlign: 'center',
                    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), 0 0 30px rgba(16, 185, 129, 0.2)'
                  }}>
                    <div style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(6, 182, 212, 0.25))',
                      border: '1px solid rgba(16, 185, 129, 0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 1.25rem',
                      boxShadow: '0 0 25px rgba(16, 185, 129, 0.35)'
                    }}>
                      <Lock size={26} color="#34D399" />
                    </div>

                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '0.3rem 0.85rem',
                      borderRadius: '9999px',
                      background: 'rgba(16, 185, 129, 0.15)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      color: '#34D399',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      marginBottom: '1rem'
                    }}>
                      <Sparkles size={12} /> Premium Feature • Founder Pro
                    </div>

                    <h3 style={{ fontSize: '1.65rem', fontWeight: 900, color: '#fff', margin: '0 0 0.6rem', letterSpacing: '-0.02em' }}>
                      Unlock Executive PDF Summaries for {lesson.title}
                    </h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '540px', margin: '0 auto 1.8rem', lineHeight: 1.6 }}>
                      Downloadable executive briefs, printable due diligence checklists, and formula sheets are premium features locked to active subscribers.
                    </p>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                      gap: '0.85rem',
                      maxWidth: '680px',
                      margin: '0 auto 2rem',
                      textAlign: 'left'
                    }}>
                      {[
                        'High-resolution executive summary one-pagers for offline review',
                        'Printable due diligence verification checklists & scorecards',
                        'Slide deck companion notes & financial formula cheat sheets'
                      ].map((benefit, bIdx) => (
                        <div key={bIdx} style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.65rem',
                          padding: '0.75rem 1rem',
                          borderRadius: '10px',
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(255, 255, 255, 0.07)',
                          fontSize: '0.82rem',
                          color: '#E2E8F0'
                        }}>
                          <Check size={14} color="#10B981" style={{ flexShrink: 0 }} />
                          <span>{benefit}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={onOpenPricing}
                      style={{
                        padding: '0.85rem 2rem',
                        borderRadius: '12px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #10B981, #059669)',
                        color: '#fff',
                        fontSize: '0.92rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 20px rgba(16, 185, 129, 0.45)',
                        transition: 'transform 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
                    >
                      <Sparkles size={16} />
                      <span>Upgrade to Unlock Executive PDFs</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                ) : (
                  /* COMING SOON SECTION FOR SUBSCRIBED USERS */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
                    {/* Header */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                      paddingBottom: '1.2rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '10px',
                          background: 'rgba(16, 185, 129, 0.15)',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#34D399'
                        }}>
                          <FileDown size={18} />
                        </div>
                        <div>
                          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                            Executive PDF Guides • {lesson.title}
                          </h3>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                            Printable executive briefs, due diligence checklists, and formula sheets
                          </p>
                        </div>
                      </div>

                      <div style={{
                        padding: '0.35rem 0.9rem',
                        borderRadius: '9999px',
                        background: 'rgba(245, 158, 11, 0.15)',
                        border: '1px solid rgba(245, 158, 11, 0.35)',
                        color: '#F59E0B',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        letterSpacing: '0.04em'
                      }}>
                        Coming Soon.....
                      </div>
                    </div>

                    {/* Hero Coming Soon Notice Card */}
                    <div style={{
                      background: 'radial-gradient(ellipse at 50% 20%, rgba(16, 185, 129, 0.12) 0%, rgba(15, 23, 42, 0.8) 80%)',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                      borderRadius: '18px',
                      padding: '2.5rem 2rem',
                      textAlign: 'center',
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: '50%',
                        background: 'rgba(16, 185, 129, 0.2)',
                        border: '1px solid rgba(16, 185, 129, 0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.2rem',
                        color: '#34D399'
                      }}>
                        <FileDown size={22} />
                      </div>

                      <h4 style={{
                        fontSize: '1.8rem',
                        fontWeight: 900,
                        color: '#FFFFFF',
                        margin: '0 0 0.5rem',
                        letterSpacing: '0.02em',
                        background: 'linear-gradient(135deg, #FFFFFF 0%, #A7F3D0 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                      }}>
                        Coming Soon.....
                      </h4>

                      <p style={{
                        fontSize: '0.92rem',
                        color: '#94A3B8',
                        maxWidth: '560px',
                        margin: '0 auto 1.8rem',
                        lineHeight: 1.6
                      }}>
                        Downloadable PDF summaries, printable due diligence rubrics, and formula companion decks for "{lesson.title}" are currently being finalized and formatted for high-resolution vector export.
                      </p>

                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '0.5rem 1.2rem',
                        borderRadius: '9999px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        fontSize: '0.8rem',
                        color: '#CBD5E1'
                      }}>
                        <Clock size={14} color="#34D399" />
                        <span>Included in your active Founder Pro membership</span>
                      </div>
                    </div>

                    {/* Document Previews */}
                    <div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.85rem' }}>
                        Executive PDF Documents in Preparation
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {[
                          { title: 'Executive Summary & Framework Cheat Sheet', format: 'Vector PDF • 2 Pages', tag: 'Summary Brief' },
                          { title: 'Due Diligence Checklist & Verification Rubric', format: 'Printable PDF • 4 Pages', tag: 'Diligence Rubric' },
                          { title: 'Unit Economics & Financial Formula Companion', format: 'Spreadsheet Companion • 3 Pages', tag: 'Formulas Deck' }
                        ].map((doc, dIdx) => (
                          <div key={dIdx} style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '1rem 1.25rem',
                            borderRadius: '12px',
                            background: 'rgba(255, 255, 255, 0.025)',
                            border: '1px solid rgba(255, 255, 255, 0.07)',
                            gap: '1rem'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                              <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                background: 'rgba(16, 185, 129, 0.1)',
                                border: '1px solid rgba(16, 185, 129, 0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#34D399',
                                flexShrink: 0
                              }}>
                                <FileDown size={14} />
                              </div>
                              <div>
                                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#E2E8F0', marginBottom: '2px' }}>
                                  {doc.title}
                                </div>
                                <div style={{ fontSize: '0.74rem', color: '#64748B' }}>
                                  {doc.tag} • {doc.format}
                                </div>
                              </div>
                            </div>

                            <span style={{
                              padding: '0.25rem 0.65rem',
                              borderRadius: '6px',
                              background: 'rgba(255, 255, 255, 0.04)',
                              border: '1px solid rgba(255, 255, 255, 0.08)',
                              color: '#94A3B8',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              flexShrink: 0
                            }}>
                              Coming Soon.....
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 6: KNOWLEDGE CHECK QUIZ */}
            {activeTab === 'quiz' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.6rem', maxWidth: '860px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <HelpCircle size={18} color="#818CF8" />
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                      Mastery Knowledge Check
                    </h3>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                    Test your understanding against scenario-based venture situations. Instant feedback provided.
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {(lesson.quiz || []).map((q, qIdx) => {
                    const selectedOpt = quizAnswers[qIdx];
                    const isSubmitted = quizSubmitted[qIdx];
                    const isCorrect = selectedOpt === q.correctIndex;

                    return (
                      <div key={qIdx} style={{
                        background: 'rgba(15, 23, 42, 0.7)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem'
                      }}>
                        <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#fff', lineHeight: 1.45 }}>
                          Question {qIdx + 1}: {q.question}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                          {q.options.map((opt, optIdx) => {
                            let optBg = 'rgba(255, 255, 255, 0.03)';
                            let optBorder = 'rgba(255, 255, 255, 0.08)';
                            let optColor = 'var(--text-secondary)';

                            if (isSubmitted) {
                              if (optIdx === q.correctIndex) {
                                optBg = 'rgba(16, 185, 129, 0.15)';
                                optBorder = '#10B981';
                                optColor = '#34D399';
                              } else if (selectedOpt === optIdx) {
                                optBg = 'rgba(244, 63, 94, 0.15)';
                                optBorder = '#F43F5E';
                                optColor = '#F87171';
                              }
                            } else if (selectedOpt === optIdx) {
                              optBg = 'rgba(99, 102, 241, 0.15)';
                              optBorder = '#6366F1';
                              optColor = '#fff';
                            }

                            return (
                              <button
                                key={optIdx}
                                onClick={() => handleSelectQuizOption(qIdx, optIdx)}
                                style={{
                                  textAlign: 'left',
                                  padding: '0.85rem 1.1rem',
                                  borderRadius: '10px',
                                  border: `1px solid ${optBorder}`,
                                  background: optBg,
                                  color: optColor,
                                  fontSize: '0.82rem',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'flex-start',
                                  gap: '10px',
                                  lineHeight: 1.4,
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                <span style={{
                                  width: '20px',
                                  height: '20px',
                                  borderRadius: '50%',
                                  border: `1px solid ${optBorder}`,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '0.72rem',
                                  fontWeight: 800,
                                  flexShrink: 0
                                }}>
                                  {String.fromCharCode(65 + optIdx)}
                                </span>
                                <span>{opt}</span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Instant Pedagogical Feedback */}
                        {isSubmitted && (
                          <div style={{
                            padding: '0.9rem 1.1rem',
                            borderRadius: '10px',
                            background: isCorrect ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.08)',
                            border: `1px solid ${isCorrect ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
                            fontSize: '0.8rem',
                            color: isCorrect ? '#34D399' : '#F87171',
                            lineHeight: 1.45
                          }}>
                            <strong>{isCorrect ? '🎉 Correct!' : '❌ Not quite.'}</strong> {q.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>

          {/* Bottom Control Bar */}
          <div style={{
            padding: '1.1rem 1.8rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(15, 23, 42, 0.9)',
            flexShrink: 0
          }}>
            {/* Left Nav Button */}
            <div>
              {prevLesson && (
                <button
                  onClick={() => onNavigateLesson && onNavigateLesson(prevLesson)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '0.6rem 1rem',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    background: 'rgba(255, 255, 255, 0.04)',
                    color: 'var(--text-secondary)',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <ChevronLeft size={16} />
                  <span>Lesson {prevLesson.number || prevLesson.id.replace('lesson-', '')}: {prevLesson.title}</span>
                </button>
              )}
            </div>

            {/* Right Completion & Next Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <button
                onClick={() => onToggleComplete(lesson.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '0.65rem 1.4rem',
                  borderRadius: '10px',
                  border: 'none',
                  background: isCompleted
                    ? 'rgba(16, 185, 129, 0.2)'
                    : 'linear-gradient(135deg, #10B981, #059669)',
                  color: isCompleted ? '#34D399' : '#fff',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: !isCompleted ? '0 4px 15px rgba(16, 185, 129, 0.3)' : 'none'
                }}
              >
                <CheckCircle2 size={16} />
                <span>{isCompleted ? 'Mark Lesson Incomplete' : 'Complete & Master Lesson'}</span>
              </button>

              {nextLesson && (
                <button
                  onClick={() => onNavigateLesson && onNavigateLesson(nextLesson)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '0.65rem 1.2rem',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                    color: '#fff',
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(99, 102, 241, 0.35)'
                  }}
                >
                  <span>Next Lesson</span>
                  <ChevronRight size={16} />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
