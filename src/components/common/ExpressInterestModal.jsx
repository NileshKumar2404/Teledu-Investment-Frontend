import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, DollarSign, Send, CheckCircle2, Phone, Mail, 
  ExternalLink, Sparkles, Building2, User, Clock, ArrowRight,
  ShieldCheck, HelpCircle, Lock, Zap
} from 'lucide-react';

const CHECK_OPTIONS = [50000, 100000, 150000, 250000, 500000];

export default function ExpressInterestModal({
  isOpen,
  onClose,
  company,
  currentUser = { fullName: 'Victoria Sterling (General Partner)' },
  onOpenPricing,
  onInterestSubmitted
}) {
  // Subscription Entitlement Check
  const userPlan = currentUser?.subscription?.plan || 'free';
  const isAdmin = ['admin', 'super_admin'].includes(currentUser?.role);
  const isPaidUser = Boolean(
    isAdmin ||
    (['investor_pro', 'all_access_pro', 'founder_pro'].includes(userPlan) && (currentUser?.subscription?.status === 'active' || !currentUser?.subscription?.status)) ||
    ['investor_pro', 'all_access_pro'].includes(userPlan)
  );

  const [checkSize, setCheckSize] = useState(50000);
  const [customCheck, setCustomCheck] = useState('');
  const [investorRole, setInvestorRole] = useState('Co-Investor / Syndicate'); // 'Lead Investor' | 'Co-Investor' | 'Angel'
  const [message, setMessage] = useState(
    `Hello ${company?.founderName || 'Founder'}, I reviewed ${company?.companyName || 'your company'} in the StartupIQ Deal Room and would like to express interest in participating in your current round.`
  );
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen || !company) return null;

  const minCheckRequired = company.minInvestment || 50000;
  const effectiveCheck = customCheck ? Number(customCheck) : checkSize;
  const isBelowMin = effectiveCheck < minCheckRequired;
  const founderName = company.founderName || 'Founder';
  const founderWhatsApp = company.founderWhatsApp || '+91 98201 44521';
  const founderEmail = company.founderEmail || `${company.ticker?.toLowerCase() || 'founder'}@startupiq.io`;

  // WhatsApp deep link formatting
  const cleanPhone = founderWhatsApp.replace(/[^0-9+]/g, '');
  const waEncodedMsg = encodeURIComponent(
    `Hi ${founderName}, I'm ${currentUser?.fullName || 'an accredited investor'} on StartupIQ Deal Room. I would like to express interest in a $${effectiveCheck.toLocaleString()} check for ${company.companyName} (${company.ticker}).\n\n"${message}"`
  );
  const whatsAppUrl = `https://wa.me/${cleanPhone.replace('+', '')}?text=${waEncodedMsg}`;

  // Mailto deep link formatting
  const mailtoSubject = encodeURIComponent(`Investment Interest: $${effectiveCheck.toLocaleString()} Check for ${company.companyName} (${company.ticker})`);
  const mailtoBody = encodeURIComponent(
    `Dear ${founderName},\n\nI reviewed ${company.companyName} on StartupIQ Deal Room.\n\nInvestment Details:\n- Intended Check: $${effectiveCheck.toLocaleString()}\n- Investor: ${currentUser?.fullName || 'Accredited Investor'}\n- Role: ${investorRole}\n\nNote:\n${message}\n\nPlease share your current cap table and let us know when you are available for a 20-minute diligence call.\n\nBest regards,\n${currentUser?.fullName || 'Investor'}`
  );
  const mailtoUrl = `mailto:${founderEmail}?subject=${mailtoSubject}&body=${mailtoBody}`;

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);

    const leadEntry = {
      id: `lead-${Date.now()}`,
      investorName: currentUser?.fullName || 'Victoria Sterling (General Partner)',
      checkSize: effectiveCheck,
      investorRole,
      message,
      submittedAt: new Date().toISOString(),
      companyTicker: company.ticker,
      status: 'SOFT_COMMITTED'
    };

    // Save lead in localStorage
    try {
      const storageKey = `siq_inbound_interests_${company.ticker.toUpperCase()}`;
      const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const updated = [leadEntry, ...existing];
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch (err) {
      console.warn('Inbound lead save error:', err);
    }

    setSubmitted(true);
    setSubmitting(false);

    if (onInterestSubmitted) {
      onInterestSubmitted(leadEntry);
    }
  };

  return (
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
        background: 'rgba(5, 10, 20, 0.85)',
        backdropFilter: 'blur(10px)',
        zIndex: 1200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem'
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        style={{
          background: 'linear-gradient(145deg, #0e1726 0%, #070d18 100%)',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '620px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 40px rgba(16, 185, 129, 0.15)',
          color: '#F8FAFC',
          overflow: 'hidden'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '1.4rem 1.6rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(99, 102, 241, 0.1) 100%)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <div>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '0.2rem 0.6rem',
              borderRadius: '999px',
              background: 'rgba(16, 185, 129, 0.2)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              color: '#34D399',
              fontSize: '0.72rem',
              fontWeight: 800,
              marginBottom: '5px'
            }}>
              <DollarSign size={12} /> EXPRESS INTEREST & SOFT COMMITMENT
            </span>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff' }}>
              Express Interest in {company.companyName}
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '3px' }}>
              Send an allocation inquiry and soft commitment directly to founder <strong>{founderName}</strong>.
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: 'none',
              color: '#94A3B8',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        {!submitted ? (
          <form onSubmit={handleSubmit} style={{ padding: '1.5rem 1.6rem', display: 'flex', flexDirection: 'column', gap: '1.3rem', overflowY: 'auto' }}>
            
            {/* Round Summary Strip */}
            <div className="express-interest-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.8rem',
              padding: '0.9rem',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              textAlign: 'center'
            }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Target Raise</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', marginTop: '2px' }}>
                  ${(company.fundingRequired || 0).toLocaleString()}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Valuation</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', marginTop: '2px' }}>
                  ${((company.valuation || 0) / 1000000).toFixed(1)}M
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Min Check</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#34D399', marginTop: '2px' }}>
                  ${(company.minInvestment || 25000).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Check Size Selection */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#CBD5E1', marginBottom: '8px' }}>
                Select Your Intended Check Size ($ USD)
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '8px' }}>
                {CHECK_OPTIONS.map(size => {
                  const isSelected = effectiveCheck === size && !customCheck;
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => {
                        setCheckSize(size);
                        setCustomCheck('');
                      }}
                      style={{
                        padding: '0.5rem 0.9rem',
                        borderRadius: '8px',
                        background: isSelected ? '#10B981' : 'rgba(255, 255, 255, 0.05)',
                        color: isSelected ? '#041d14' : '#E2E8F0',
                        border: isSelected ? '1px solid #10B981' : '1px solid rgba(255, 255, 255, 0.1)',
                        fontWeight: 800,
                        fontSize: '0.82rem',
                        cursor: 'pointer'
                      }}
                    >
                      ${(size / 1000).toFixed(0)}k
                    </button>
                  );
                })}
              </div>

              <input
                type="number"
                placeholder="Or enter custom amount (e.g. 75000)"
                value={customCheck}
                onChange={e => setCustomCheck(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.8rem',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: isBelowMin ? '1px solid #EF4444' : '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />
              {isBelowMin && (
                <div style={{ color: '#F87171', fontSize: '0.74rem', marginTop: '5px', fontWeight: 600 }}>
                  ⚠️ Minimum check size for this syndicate round is ${minCheckRequired.toLocaleString()}.
                </div>
              )}
            </div>

            {/* Syndicate / Investor Role */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#CBD5E1', marginBottom: '6px' }}>
                Investor Participation Role
              </label>
              <select
                value={investorRole}
                onChange={e => setInvestorRole(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.8rem',
                  background: '#0F172A',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              >
                <option value="Lead Investor">Lead Investor (Term Sheet Ready)</option>
                <option value="Co-Investor / Syndicate">Co-Investor / Syndicate Participant</option>
                <option value="Angel Investor">Angel Investor / Advisory Check</option>
                <option value="Exploring Diligence">Exploring Diligence & Cap Table Review</option>
              </select>
            </div>

            {/* Direct Message to Founder */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#CBD5E1', marginBottom: '6px' }}>
                Note to Founder ({founderName})
              </label>
              <textarea
                rows={3}
                value={message}
                onChange={e => setMessage(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.8rem',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.85rem',
                  outline: 'none',
                  resize: 'none',
                  lineHeight: 1.4
                }}
              />
            </div>

            {/* Direct Instant Channels (WhatsApp & Email preview) */}
            <div style={{
              display: 'flex',
              gap: '0.7rem',
              padding: '0.85rem',
              borderRadius: '10px',
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap'
            }}>
              <span style={{ fontSize: '0.78rem', color: '#6EE7B7', fontWeight: 600 }}>
                ⚡ Also Reach Out Directly:
              </span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {isPaidUser ? (
                  <>
                    <a
                      href={whatsAppUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '0.4rem 0.75rem',
                        borderRadius: '6px',
                        background: '#25D366',
                        color: '#000',
                        fontWeight: 800,
                        fontSize: '0.74rem',
                        textDecoration: 'none'
                      }}
                    >
                      <Phone size={12} /> WhatsApp ({founderWhatsApp})
                    </a>

                    <a
                      href={mailtoUrl}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '0.4rem 0.75rem',
                        borderRadius: '6px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '0.74rem',
                        textDecoration: 'none'
                      }}
                    >
                      <Mail size={12} /> Email Founder
                    </a>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (onOpenPricing) onOpenPricing();
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '0.4rem 0.75rem',
                      borderRadius: '6px',
                      background: 'rgba(99, 102, 241, 0.15)',
                      border: '1px solid rgba(99, 102, 241, 0.3)',
                      color: '#A5B4FC',
                      fontWeight: 800,
                      fontSize: '0.72rem',
                      cursor: 'pointer'
                    }}
                  >
                    <Lock size={11} color="#FBBF24" /> Unlock Direct WhatsApp & Email (Investor Pro)
                  </button>
                )}
              </div>
            </div>

            {/* Submit Action */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94A3B8',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || isBelowMin}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '7px',
                  padding: '0.7rem 1.4rem',
                  borderRadius: '8px',
                  background: isBelowMin ? 'rgba(255, 255, 255, 0.1)' : 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  color: isBelowMin ? '#64748B' : '#fff',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  cursor: isBelowMin ? 'not-allowed' : 'pointer',
                  boxShadow: isBelowMin ? 'none' : '0 4px 14px rgba(16, 185, 129, 0.35)'
                }}
              >
                <Send size={15} />
                Submit ${effectiveCheck.toLocaleString()} Soft Commitment
              </button>
            </div>

            {/* Regulatory Disclaimer Footnote */}
            <div style={{
              fontSize: '0.7rem',
              color: '#94A3B8',
              lineHeight: 1.4,
              textAlign: 'center',
              borderTop: '1px solid rgba(255, 255, 255, 0.05)',
              paddingTop: '0.6rem'
            }}>
              * Non-binding soft commitment. Final syndicate allocation terms, subscription agreements, and accredited investor verification executed separately.
            </div>
          </form>
        ) : (
          <div style={{ padding: '2.5rem 1.8rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.2)',
              border: '2px solid #10B981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#34D399'
            }}>
              <CheckCircle2 size={32} />
            </div>

            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>
              Interest Recorded! (${effectiveCheck.toLocaleString()})
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#94A3B8', maxWidth: '440px', lineHeight: 1.5 }}>
              Your soft-commitment for <strong>{company.companyName}</strong> has been logged. Founder <strong>{founderName}</strong> has been notified and direct channels are active.
            </p>

            <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1rem' }}>
              {isPaidUser ? (
                <a
                  href={whatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '7px',
                    padding: '0.65rem 1.2rem',
                    borderRadius: '8px',
                    background: '#25D366',
                    color: '#000',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    textDecoration: 'none'
                  }}
                >
                  <Phone size={14} /> Send Directly on WhatsApp
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onOpenPricing) onOpenPricing();
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '7px',
                    padding: '0.65rem 1.2rem',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #6366F1, #4F46E5)',
                    color: '#fff',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)'
                  }}
                >
                  <Lock size={14} color="#FBBF24" /> Unlock WhatsApp Contact (Investor Pro)
                </button>
              )}

              <button
                onClick={onClose}
                style={{
                  padding: '0.65rem 1.2rem',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Back to Deal Room
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
