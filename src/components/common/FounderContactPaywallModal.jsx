import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Lock, Sparkles, MessageSquare, Video, Calendar, Phone, 
  Mail, ShieldCheck, ArrowRight, CheckCircle2, Zap, Award 
} from 'lucide-react';

export default function FounderContactPaywallModal({
  isOpen,
  onClose,
  company,
  onOpenPricing
}) {
  if (!isOpen) return null;

  const founderName = company?.founderName || 'Founder & CEO';
  const companyName = company?.companyName || 'Startup';
  const ticker = company?.ticker || 'DEAL';
  const stage = company?.stage || 'Active Round';
  const fundingRequired = company?.fundingRequired || 500000;
  const valuation = company?.valuation || 5000000;

  const handleUpgradeClick = () => {
    onClose();
    if (onOpenPricing) {
      onOpenPricing();
    }
  };

  return (
    <AnimatePresence>
      <div
        className="modal-overlay"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(3, 7, 18, 0.88)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          zIndex: 1300,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.25rem'
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 20 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          style={{
            background: 'linear-gradient(165deg, #0d1527 0%, #070b14 100%)',
            border: '1px solid rgba(99, 102, 241, 0.35)',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '640px',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 30px 70px rgba(0, 0, 0, 0.8), 0 0 50px rgba(99, 102, 241, 0.2)',
            color: '#F8FAFC',
            overflow: 'hidden',
            position: 'relative'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Ambient Glow Header Accent */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #6366F1 0%, #A855F7 50%, #10B981 100%)'
          }} />

          {/* Modal Header */}
          <div style={{
            padding: '1.75rem 2rem 1.25rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            position: 'relative'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(168, 85, 247, 0.2))',
                border: '1px solid rgba(129, 140, 248, 0.45)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 25px rgba(99, 102, 241, 0.35)'
              }}>
                <Lock size={26} color="#A5B4FC" />
              </div>
              <div>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '0.2rem 0.65rem',
                  borderRadius: '9999px',
                  background: 'rgba(99, 102, 241, 0.15)',
                  border: '1px solid rgba(129, 140, 248, 0.3)',
                  color: '#A5B4FC',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '0.35rem'
                }}>
                  <Sparkles size={11} /> Investor Pro Feature
                </div>
                <h2 style={{
                  fontSize: '1.35rem',
                  fontWeight: 800,
                  color: '#FFFFFF',
                  lineHeight: 1.2,
                  margin: 0
                }}>
                  Founder Direct Communication
                </h2>
                <p style={{
                  fontSize: '0.82rem',
                  color: '#94A3B8',
                  marginTop: '0.25rem',
                  marginBottom: 0
                }}>
                  Direct bilateral contact channels are reserved for subscribed investors.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: 'none',
                color: '#94A3B8',
                borderRadius: '10px',
                width: '34px',
                height: '34px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#fff';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#94A3B8';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Modal Body */}
          <div style={{
            padding: '1.5rem 2rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}>
            {/* Target Founder & Startup Profile Banner */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.9rem 1.15rem',
              borderRadius: '14px',
              background: 'rgba(15, 23, 42, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              flexWrap: 'wrap',
              gap: '0.75rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #3B82F6, #10B981)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1rem',
                  color: '#fff'
                }}>
                  {founderName ? founderName.charAt(0) : 'F'}
                </div>
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff' }}>
                    {founderName}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                    Founder & CEO at <strong>{companyName}</strong> ({ticker})
                  </div>
                </div>
              </div>

              <div style={{
                textAlign: 'right',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                padding: '0.35rem 0.75rem',
                borderRadius: '8px'
              }}>
                <div style={{ fontSize: '0.68rem', color: '#6EE7B7', fontWeight: 700, textTransform: 'uppercase' }}>
                  {stage}
                </div>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#34D399' }}>
                  Raising ${(fundingRequired).toLocaleString()} @ ${(valuation / 1000000).toFixed(1)}M Val
                </div>
              </div>
            </div>

            {/* Explanation of Why It's Paid */}
            <div style={{
              fontSize: '0.86rem',
              lineHeight: 1.55,
              color: '#CBD5E1',
              background: 'rgba(99, 102, 241, 0.08)',
              border: '1px solid rgba(99, 102, 241, 0.2)',
              borderRadius: '12px',
              padding: '0.85rem 1.1rem'
            }}>
              To protect founder bandwidth from unsolicited outreach and ensure high-conviction deal diligence, bilateral founder communication is restricted to active <strong>Investor Pro</strong> subscribers.
            </div>

            {/* Unlocked Benefits Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{
                fontSize: '0.78rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: '#94A3B8'
              }}>
                Unlocked with Investor Pro Subscription:
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                <div style={{
                  padding: '0.85rem 1rem',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.07)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'rgba(16, 185, 129, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <MessageSquare size={16} color="#34D399" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#fff' }}>
                      Bilateral Deal Room Chat
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#94A3B8', marginTop: '2px', lineHeight: 1.4 }}>
                      Direct messaging with founders + instant 24/7 AI Founder Twin Q&A.
                    </div>
                  </div>
                </div>

                <div style={{
                  padding: '0.85rem 1rem',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.07)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'rgba(59, 130, 246, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Video size={16} color="#60A5FA" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#fff' }}>
                      1-Click Diligence Video Call
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#94A3B8', marginTop: '2px', lineHeight: 1.4 }}>
                      HD video room with screen sharing and integrated memo notepad.
                    </div>
                  </div>
                </div>

                <div style={{
                  padding: '0.85rem 1rem',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.07)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'rgba(168, 85, 247, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Calendar size={16} color="#C084FC" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#fff' }}>
                      Calendar Meeting Scheduler
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#94A3B8', marginTop: '2px', lineHeight: 1.4 }}>
                      One-click 15/30/45 min booking with Google Meet & Zoom dispatch.
                    </div>
                  </div>
                </div>

                <div style={{
                  padding: '0.85rem 1rem',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.07)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'rgba(37, 211, 102, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Phone size={16} color="#4ADE80" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#fff' }}>
                      Direct WhatsApp & VIP Email
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#94A3B8', marginTop: '2px', lineHeight: 1.4 }}>
                      Unredacted phone contact & verified direct founder email channels.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Plan Price & Guarantee Badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem 1.25rem',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(16, 185, 129, 0.08))',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              flexWrap: 'wrap',
              gap: '0.75rem'
            }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#A5B4FC', fontWeight: 700 }}>
                  RECOMMENDED FOR INVESTORS & ANGELS
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '2px' }}>
                  <span style={{ fontSize: '1.45rem', fontWeight: 900, color: '#FFFFFF' }}>
                    ₹4,999
                  </span>
                  <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                    / month (or ₹49,990 / year)
                  </span>
                </div>
              </div>

              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.74rem',
                color: '#34D399',
                fontWeight: 700
              }}>
                <ShieldCheck size={14} /> Instant Unlock Across All Startups
              </div>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div style={{
            padding: '1.25rem 2rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'rgba(10, 15, 28, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94A3B8',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                padding: '0.5rem 0.75rem'
              }}
            >
              Maybe Later
            </button>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <button
                onClick={handleUpgradeClick}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 50%, #4338CA 100%)',
                  border: '1px solid rgba(165, 180, 252, 0.35)',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(99, 102, 241, 0.45)',
                  transition: 'all 0.2s ease'
                }}
              >
                <Zap size={16} />
                <span>Upgrade to Investor Pro</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
