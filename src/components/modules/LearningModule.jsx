import React, { useState, useEffect } from 'react';
import { BookOpen, CheckCircle2, Clock, Award, ChevronRight, X, Sparkles, Filter, Check, Play, BookMarked, RotateCcw } from 'lucide-react';
import { api } from '../../api/client';
import { ACADEMY_LESSONS, ACADEMY_PHASES, getLessonById } from '../../data/academyLessonsData';
import LessonReaderModal from './LessonReaderModal';

export default function LearningModule({ company }) {
  const [lessons, setLessons] = useState(ACADEMY_LESSONS);
  const [categories, setCategories] = useState([
    "FOUNDATIONS", "CUSTOMER", "BUSINESS_MODEL", "GTM", "FINANCE", "OPERATIONS", "CAPSTONE"
  ]);
  const [selectedPhase, setSelectedPhase] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = useState('ALL');
  const [activeLesson, setActiveLesson] = useState(null);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(false);

  // Load progress from localStorage and backend on mount
  useEffect(() => {
    // 1. Initial load from localStorage
    try {
      const savedProg = localStorage.getItem('academy_user_progress');
      if (savedProg) {
        setProgress(JSON.parse(savedProg));
      }
    } catch (e) {
      console.warn('Could not read local academy progress');
    }

    // 2. Fetch backend progress & lessons if company ticker exists
    async function loadBackendData() {
      try {
        const [catsRes, lessonsRes] = await Promise.all([
          api.getLessonCategories().catch(() => null),
          api.getLessons().catch(() => null)
        ]);

        if (catsRes?.categories) {
          const mergedCats = Array.from(new Set([...catsRes.categories, 'CAPSTONE']));
          setCategories(mergedCats);
        }

        if (lessonsRes?.lessons && lessonsRes.lessons.length > 0) {
          // Merge backend lessons with rich local lessons data to guarantee complete educational material
          const merged = lessonsRes.lessons.map(beLesson => {
            const richLocal = getLessonById(beLesson.id) || {};
            return { ...richLocal, ...beLesson };
          });
          setLessons(merged);
        }

        if (company?.ticker) {
          const progRes = await api.getLearningProgress(company.ticker).catch(() => null);
          if (progRes?.progress) {
            const pMap = {};
            progRes.progress.forEach(p => { pMap[p.lessonId] = p; });
            setProgress(prev => ({ ...prev, ...pMap }));
          }
        }
      } catch (err) {
        console.warn('Using enriched offline curriculum data:', err.message);
      }
    }

    loadBackendData();
  }, [company?.ticker]);

  // Toggle completion status
  const toggleComplete = async (lessonId) => {
    const currentStatus = progress[lessonId]?.status;
    const newStatus = currentStatus === 'COMPLETED' ? 'NOT_STARTED' : 'COMPLETED';

    const updatedProgress = {
      ...progress,
      [lessonId]: {
        ...(progress[lessonId] || {}),
        status: newStatus,
        completedAt: newStatus === 'COMPLETED' ? new Date().toISOString() : null
      }
    };

    setProgress(updatedProgress);

    // Save to localStorage
    try {
      localStorage.setItem('academy_user_progress', JSON.stringify(updatedProgress));
    } catch (e) {
      console.warn('Failed saving progress to localStorage');
    }

    // Sync to backend if company ticker exists
    if (company?.ticker) {
      try {
        await api.updateLessonProgress(company.ticker, lessonId, { status: newStatus });
      } catch (e) {
        console.warn('Backend progress sync failed, saved locally');
      }
    }
  };

  // Open modal with rich lesson data
  const handleOpenLesson = (lessonItem) => {
    // Ensure we load the rich lesson definition
    const fullLesson = getLessonById(lessonItem.id) || lessonItem;
    setActiveLesson(fullLesson);
  };

  // Filter lessons
  const filteredLessons = lessons.filter(lesson => {
    // 1. Match Phase
    const matchPhase = selectedPhase === 'ALL' || (
      selectedPhase === 1 ? (lesson.phase === 1 || (lesson.number >= 1 && lesson.number <= 5)) :
      selectedPhase === 2 ? (lesson.phase === 2 || (lesson.number >= 6 && lesson.number <= 10)) :
      selectedPhase === 3 ? (lesson.phase === 3 || (lesson.number >= 11 && lesson.number <= 15)) :
      selectedPhase === 4 ? (lesson.phase === 4 || (lesson.number >= 16 && lesson.number <= 20)) :
      selectedPhase === 5 ? (lesson.phase === 5 || (lesson.number >= 21 && lesson.number <= 25)) :
      selectedPhase === 6 ? (lesson.phase === 6 || (lesson.number >= 26 && lesson.number <= 29)) :
      selectedPhase === 7 ? (lesson.phase === 7 || lesson.number === 30 || lesson.category?.toUpperCase() === 'CAPSTONE') :
      lesson.phase === selectedPhase
    );

    // 2. Match Category
    const matchCat = selectedCategory === 'ALL' ||
      lesson.category?.toUpperCase() === selectedCategory.toUpperCase();

    // 3. Match Difficulty
    const matchDiff = selectedDifficulty === 'ALL' ||
      lesson.difficulty?.toUpperCase() === selectedDifficulty.toUpperCase();

    return matchPhase && matchCat && matchDiff;
  });

  const completedCount = Object.values(progress).filter(p => p?.status === 'COMPLETED').length;
  const completionPercent = Math.round((completedCount / 30) * 100);

  const resetAllFilters = () => {
    setSelectedPhase('ALL');
    setSelectedCategory('ALL');
    setSelectedDifficulty('ALL');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header Banner */}
      <div className="glass-card" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.5rem',
        padding: '2rem',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(15, 23, 42, 0.8) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.25)',
        borderRadius: '20px'
      }}>
        <div style={{ maxWidth: '650px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.6rem' }}>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '0.2rem 0.65rem',
              borderRadius: 'var(--radius-pill)',
              background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
              color: '#fff',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}>
              Masterclass Curriculum
            </span>
            <span style={{ fontSize: '0.75rem', color: '#38BDF8', fontWeight: 700 }}>
              7 Phases · 30 Comprehensive Lessons
            </span>
          </div>

          <h1 style={{
            fontSize: '2rem',
            fontWeight: 900,
            margin: '0 0 0.5rem',
            fontFamily: 'var(--font-display)',
            letterSpacing: '-0.02em',
            color: '#fff'
          }}>
            Venture Academy & Learning Engine
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.5, margin: 0 }}>
            Master institutional-grade venture fundamentals: problem-solution discovery, unit economics, GTM engines, financial modeling, and disciplined evidence-based scaling.
          </p>
        </div>

        {/* Progress Card */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
          background: 'rgba(15, 23, 42, 0.7)',
          padding: '1.2rem 1.6rem',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          minWidth: '240px'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '2px solid #10B981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#34D399',
            flexShrink: 0
          }}>
            <Award size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff', fontFamily: 'var(--font-display)' }}>
                {completedCount}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>/ 30 Mastered</span>
            </div>

            {/* Progress Bar */}
            <div style={{
              width: '100%',
              height: '6px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '3px',
              marginTop: '6px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${completionPercent}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #10B981, #34D399)',
                borderRadius: '3px',
                transition: 'width 0.3s ease'
              }} />
            </div>
            <div style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 700, marginTop: '4px' }}>
              {completionPercent}% Curriculum Complete
            </div>
          </div>
        </div>
      </div>

      {/* 7 Phase Interactive Navigation */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            <Sparkles size={14} color="#6366F1" />
            <span>Curriculum Learning Path Across 7 Phases</span>
          </div>
          {selectedPhase !== 'ALL' && (
            <button
              onClick={() => setSelectedPhase('ALL')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: 'transparent',
                border: 'none',
                color: '#818CF8',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <RotateCcw size={12} /> Show All Phases
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.6rem' }}>
          {ACADEMY_PHASES.map(p => {
            const isPhaseActive = selectedPhase === p.num;
            return (
              <div
                key={p.num}
                onClick={() => {
                  if (isPhaseActive) {
                    setSelectedPhase('ALL');
                  } else {
                    setSelectedPhase(p.num);
                    setSelectedCategory('ALL');
                  }
                }}
                style={{
                  background: isPhaseActive
                    ? 'rgba(99, 102, 241, 0.22)'
                    : 'rgba(15, 23, 42, 0.65)',
                  border: isPhaseActive
                    ? `2px solid ${p.color}`
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  boxShadow: isPhaseActive ? `0 0 16px ${p.color}40` : 'none',
                  borderRadius: '14px',
                  padding: '0.75rem 1.1rem',
                  minWidth: '185px',
                  flexShrink: 0,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: p.color, textTransform: 'uppercase', marginBottom: '2px' }}>
                  Phase {p.num} · {p.range}
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#fff' }}>
                  {p.title}
                </div>
                {isPhaseActive && (
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    background: p.color,
                    boxShadow: `0 0 8px ${p.color}`
                  }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter Categories Pills */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>Filter Category:</span>
        {['ALL', ...categories].map(cat => (
          <button
            key={cat}
            onClick={() => {
              setSelectedCategory(cat);
              if (cat !== 'ALL') {
                setSelectedPhase('ALL');
              }
            }}
            className={`chip ${selectedCategory === cat ? 'active' : ''}`}
            style={{
              padding: '0.35rem 0.85rem',
              fontSize: '0.78rem',
              fontWeight: 700,
              borderRadius: 'var(--radius-pill)',
              border: selectedCategory === cat ? '1px solid #6366F1' : '1px solid rgba(255, 255, 255, 0.1)',
              background: selectedCategory === cat ? 'linear-gradient(135deg, #6366F1, #8B5CF6)' : 'rgba(255, 255, 255, 0.04)',
              color: selectedCategory === cat ? '#fff' : 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Active Filter Notice if any filter applied */}
      {(selectedPhase !== 'ALL' || selectedCategory !== 'ALL' || selectedDifficulty !== 'ALL') && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          padding: '0.65rem 1.1rem',
          background: 'rgba(99, 102, 241, 0.08)',
          border: '1px solid rgba(99, 102, 241, 0.22)',
          borderRadius: '12px',
          fontSize: '0.82rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
            <Filter size={14} color="#818CF8" />
            <span>
              Active Filter:
              {selectedPhase !== 'ALL' && (
                <strong style={{ color: '#fff', marginLeft: '6px' }}>
                  Phase {selectedPhase} ({ACADEMY_PHASES.find(p => p.num === selectedPhase)?.title})
                </strong>
              )}
              {selectedCategory !== 'ALL' && (
                <strong style={{ color: '#fff', marginLeft: '6px' }}>
                  Category: {selectedCategory}
                </strong>
              )}
              {selectedDifficulty !== 'ALL' && (
                <strong style={{ color: '#fff', marginLeft: '6px' }}>
                  · Difficulty: {selectedDifficulty}
                </strong>
              )}
              <span style={{ color: '#818CF8', marginLeft: '8px' }}>
                ({filteredLessons.length} {filteredLessons.length === 1 ? 'lesson' : 'lessons'})
              </span>
            </span>
          </div>

          <button
            onClick={resetAllFilters}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#fff',
              padding: '0.25rem 0.65rem',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <X size={12} /> Clear Filter
          </button>
        </div>
      )}

      {/* Lessons Grid or Empty State */}
      {filteredLessons.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          background: 'rgba(15, 23, 42, 0.4)',
          borderRadius: '16px',
          border: '1px dashed rgba(255, 255, 255, 0.15)'
        }}>
          <BookOpen size={42} style={{ color: 'var(--text-muted)', marginBottom: '1rem', opacity: 0.5 }} />
          <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '0.5rem', fontWeight: 800 }}>No lessons found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', marginBottom: '1.2rem' }}>
            No lessons match your currently selected filters.
          </p>
          <button
            onClick={resetAllFilters}
            style={{
              background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
              border: 'none',
              color: '#fff',
              padding: '0.55rem 1.3rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Show All 30 Lessons
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '1.25rem'
        }}>
          {filteredLessons.map(lesson => {
            const isDone = progress[lesson.id]?.status === 'COMPLETED';

            const diffColor = lesson.difficulty === 'BEGINNER' ? '#34D399' :
              lesson.difficulty === 'INTERMEDIATE' ? '#FBBF24' : '#F43F5E';

            return (
              <div
                key={lesson.id}
                onClick={() => handleOpenLesson(lesson)}
                className="glass-card glass-card-hover"
                style={{
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '1.4rem 1.5rem',
                  borderRadius: '16px',
                  background: isDone
                    ? 'linear-gradient(180deg, rgba(16, 185, 129, 0.05) 0%, rgba(15, 23, 42, 0.75) 100%)'
                    : 'rgba(15, 23, 42, 0.65)',
                  border: isDone
                    ? '1px solid rgba(16, 185, 129, 0.35)'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  transition: 'transform 0.18s ease, border-color 0.18s ease'
                }}
              >
                <div>
                  {/* Header Badge Row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '0.2rem 0.6rem',
                      borderRadius: 'var(--radius-pill)',
                      background: 'rgba(99, 102, 241, 0.15)',
                      color: '#818CF8',
                      textTransform: 'uppercase'
                    }}>
                      {lesson.category}
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        color: diffColor
                      }}>
                        {lesson.difficulty}
                      </span>

                      {isDone && (
                        <span style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          color: '#34D399',
                          padding: '0.15rem 0.45rem',
                          borderRadius: 'var(--radius-pill)',
                          background: 'rgba(16, 185, 129, 0.2)'
                        }}>
                          <Check size={11} /> Mastered
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Lesson Title */}
                  <h3 style={{
                    fontSize: '1.12rem',
                    fontWeight: 800,
                    marginBottom: '0.4rem',
                    color: '#fff',
                    lineHeight: 1.3
                  }}>
                    {lesson.number ? `0${lesson.number}. `.slice(-4) : ''}{lesson.title}
                  </h3>

                  {/* Description */}
                  <p style={{
                    fontSize: '0.84rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.5,
                    marginBottom: '1rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {lesson.executiveSummary || lesson.description}
                  </p>

                  {/* Case Study Pill Highlight */}
                  {lesson.caseStudies && lesson.caseStudies.length > 0 && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.74rem',
                      color: '#818CF8',
                      marginBottom: '1rem'
                    }}>
                      <BookMarked size={12} />
                      <span>Case Studies: {lesson.caseStudies.map(c => c.company).join(' & ')}</span>
                    </div>
                  )}
                </div>

                {/* Bottom Card Controls */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '0.85rem',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)'
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <Clock size={13} />
                    {lesson.estimatedMinutes || 25} mins
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleComplete(lesson.id);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '0.35rem 0.75rem',
                        borderRadius: '8px',
                        border: isDone ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)',
                        background: isDone ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                        color: isDone ? '#34D399' : 'var(--text-secondary)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      <CheckCircle2 size={13} />
                      <span>{isDone ? 'Completed' : 'Mark Done'}</span>
                    </button>

                    <span style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: 'rgba(99, 102, 241, 0.15)',
                      color: '#818CF8'
                    }}>
                      <Play size={12} style={{ marginLeft: '2px' }} />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* World-Class Lesson Reader Modal */}
      {activeLesson && (
        <LessonReaderModal
          lesson={activeLesson}
          isOpen={Boolean(activeLesson)}
          onClose={() => setActiveLesson(null)}
          isCompleted={progress[activeLesson.id]?.status === 'COMPLETED'}
          onToggleComplete={(id) => toggleComplete(id)}
          onNavigateLesson={(newLesson) => setActiveLesson(newLesson)}
        />
      )}
    </div>
  );
}
