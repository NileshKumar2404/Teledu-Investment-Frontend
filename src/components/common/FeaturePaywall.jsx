import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Sparkles, ArrowRight, ShieldAlert, Check } from 'lucide-react';

export default function FeaturePaywall({
  requiredPlan = 'founder_pro',
  featureName = 'This Premium Tool',
  featureDescription = 'Upgrade your plan to unlock full interactive modeling, institutional diligence, and exportable forecasts.',
  benefits = [],
  currentUser,
  onOpenPricing,
  children
}) {
  const userPlan = currentUser?.subscription?.plan || 'free';
  const isAdmin = ['admin', 'super_admin'].includes(currentUser?.role);

  const allowedPlans = Array.isArray(requiredPlan) ? requiredPlan : [requiredPlan];
  const isEntitled = isAdmin || userPlan === 'all_access_pro' || allowedPlans.includes(userPlan);

  // If user is entitled, render the full content
  if (isEntitled) {
    return <>{children}</>;
  }

  const planLabel = allowedPlans.includes('investor_pro') ? 'Investor Pro' : 'Founder Pro';

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '440px', overflow: 'hidden', borderRadius: '18px' }}>
      {/* Blurred preview background */}
      <div style={{
        filter: 'blur(10px)',
        opacity: 0.25,
        pointerEvents: 'none',
        userSelect: 'none'
      }}>
        {children}
      </div>

      {/* Foreground Paywall Card */}
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        background: 'radial-gradient(circle at center, rgba(15, 23, 42, 0.92) 0%, rgba(6, 10, 20, 0.98) 100%)',
        zIndex: 10
      }}>
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          style={{
            maxWidth: '520px',
            width: '100%',
            textAlign: 'center',
            background: 'rgba(15, 23, 42, 0.9)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 35px rgba(99, 102, 241, 0.2)',
            borderRadius: '20px',
            padding: '2.4rem 2rem',
            color: 'var(--text-primary)'
          }}
        >
          {/* Luminous Lock Badge */}
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2))',
            border: '1px solid rgba(99, 102, 241, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.2rem',
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)'
          }}>
            <Lock size={24} color="#818CF8" />
          </div>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '0.25rem 0.75rem',
            borderRadius: 'var(--radius-pill)',
            background: 'rgba(99, 102, 241, 0.15)',
            color: '#818CF8',
            fontSize: '0.72rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            marginBottom: '0.8rem',
            letterSpacing: '0.04em'
          }}>
            <Sparkles size={12} /> {planLabel} Exclusive
          </div>

          <h3 style={{
            fontSize: '1.45rem',
            fontWeight: 900,
            margin: '0 0 0.5rem',
            letterSpacing: '-0.02em',
            fontFamily: 'var(--font-display)',
            color: '#fff'
          }}>
            Unlock {featureName}
          </h3>

          <p style={{
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.5,
            margin: '0 0 1.5rem'
          }}>
            {featureDescription}
          </p>

          {/* Key Benefits List */}
          {benefits.length > 0 && (
            <div style={{
              textAlign: 'left',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '12px',
              padding: '0.9rem 1.1rem',
              marginBottom: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              {benefits.map((b, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.78rem', color: '#E2E8F0' }}>
                  <Check size={14} color="#10B981" style={{ flexShrink: 0 }} />
                  <span>{b}</span>
                </div>
              ))}
            </div>
          )}

          {/* CTA Upgrade Button */}
          <button
            onClick={onOpenPricing}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.6rem',
              padding: '0.85rem',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
              color: '#fff',
              fontWeight: 800,
              fontSize: '0.9rem',
              cursor: 'pointer',
              boxShadow: '0 4px 18px rgba(99, 102, 241, 0.45)',
              transition: 'transform 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
          >
            <span>Upgrade to {planLabel} with Razorpay</span>
            <ArrowRight size={16} />
          </button>
        </motion.div>
      </div>
    </div>
  );
}
