import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Zap, Sparkles, Shield, Lock, CreditCard, ArrowRight, Star, AlertCircle } from 'lucide-react';
import { api } from '../../api/client';

export default function PricingModal({ isOpen, onClose, onUpgradeSuccess, currentUser }) {
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'annual'
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const currentPlanId = currentUser?.subscription?.plan || 'free';

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRazorpayCheckout = async (planId) => {
    setError('');
    setLoadingPlan(planId);

    try {
      // 1. Create order on backend
      const orderData = await api.subscription.createOrder(planId, billingCycle);
      
      // 2. Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay payment gateway. Please check your internet connection.');
      }

      // 3. Open Razorpay options
      const options = {
        key: orderData.razorpayKeyId || 'rzp_test_demo',
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'StartupIQ // Venture OS',
        description: `${orderData.planName} (${billingCycle === 'annual' ? 'Annual' : 'Monthly'})`,
        order_id: orderData.orderId,
        prefill: {
          name: currentUser?.fullName || 'Founder',
          email: currentUser?.email || 'founder@startupiq.io',
          contact: currentUser?.phone || '+91 9876543210'
        },
        theme: {
          color: '#6366F1'
        },
        handler: async function (response) {
          try {
            setLoadingPlan(planId);
            const verifyRes = await api.subscription.verifyPayment({
              razorpay_order_id: response.razorpay_order_id || orderData.orderId,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planId,
              billingCycle
            });

            setSuccessMsg(`🎉 Success! Upgraded to ${orderData.planName}.`);
            setTimeout(() => {
              if (onUpgradeSuccess) onUpgradeSuccess(verifyRes.user);
              onClose();
            }, 800);
          } catch (verifyErr) {
            setError(verifyErr.message || 'Payment verification failed.');
          } finally {
            setLoadingPlan(null);
          }
        },
        modal: {
          ondismiss: function () {
            setLoadingPlan(null);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (resp) {
        setError(resp.error?.description || 'Payment was unsuccessful.');
        setLoadingPlan(null);
      });
      rzp.open();
    } catch (err) {
      setError(err.message || 'Could not initiate Razorpay checkout.');
      setLoadingPlan(null);
    }
  };

  // Instant Test/Dev Mode bypass for testing without active cards
  const handleTestUpgrade = async (planId) => {
    setError('');
    setLoadingPlan(planId);
    try {
      let upgradedUser = null;
      try {
        const res = await api.subscription.testUpgrade(planId, billingCycle);
        upgradedUser = res.user;
      } catch (apiErr) {
        // Fallback for guest/demo sandbox mode: simulate updated local user state
        const localUser = currentUser || {
          _id: 'guest_investor',
          fullName: 'Victoria Sterling (General Partner)',
          email: 'investor@startupiq.io',
          role: 'investor'
        };
        upgradedUser = {
          ...localUser,
          subscription: {
            plan: planId,
            status: 'active',
            billingCycle,
            startDate: new Date().toISOString()
          }
        };
        try {
          localStorage.setItem('startupi_user', JSON.stringify(upgradedUser));
        } catch (e) {}
      }

      setSuccessMsg(`⚡ Test Upgrade Successful! Activated ${planId.replace(/_/g, ' ').toUpperCase()}.`);
      setTimeout(() => {
        if (onUpgradeSuccess && upgradedUser) onUpgradeSuccess(upgradedUser);
        onClose();
      }, 700);
    } catch (err) {
      setError(err.message || 'Failed to activate test subscription.');
    } finally {
      setLoadingPlan(null);
    }
  };

  const plans = [
    {
      id: 'free',
      name: 'Founder Explorer',
      subtitle: 'Educational & Public Discovery',
      priceMonthly: 0,
      priceAnnual: 0,
      badge: 'Free Forever',
      features: [
        'All 30 Academy curriculum lessons',
        '50 Startup terms & formula library',
        '25 Marketing KPI benchmarks',
        '12-Month Financial Projections (Read-Only)',
        'Public Deal Room deal summaries',
        '1 saved startup watchlist target',
        'Founder Community & Knowledge Hub',
        'Standard Knowledgebase Support'
      ],
      cta: currentPlanId === 'free' ? 'Current Plan' : 'Downgrade to Free',
      disabled: currentPlanId === 'free'
    },
    {
      id: 'founder_pro',
      name: 'Founder Pro',
      subtitle: 'Operational & Financial Modeling Engine',
      priceMonthly: 1999,
      priceAnnual: 19990,
      badge: 'Most Popular',
      highlight: true,
      features: [
        'Everything in Founder Explorer',
        'Interactive 5-Year DCF Simulation & Levers',
        '10-Dimension Health Score Radar & Benchmarks',
        '30-Day Personalized Founder Action Plan',
        'Unlimited Idea & Lean RAT Experiment Testing',
        'AI Prompt Builder Studio (Pitch & Memos)',
        'GTM Persona & Channel Priority Gantt',
        'Export Financial Models to CSV & PDF'
      ],
      cta: currentPlanId === 'founder_pro' ? 'Current Plan' : 'Upgrade to Founder Pro',
      disabled: currentPlanId === 'founder_pro'
    },
    {
      id: 'investor_pro',
      name: 'Investor Pro',
      subtitle: 'Institutional Deal Room & Cap Table Engine',
      priceMonthly: 4999,
      priceAnnual: 49990,
      badge: 'For Angels & VCs',
      features: [
        'Direct Founder Contact (Chat, Video & WhatsApp)',
        'Full Institutional Deal Room Access',
        'Gordon Growth DCF Fair Share Valuations',
        'Interactive Cap Table Dilution Simulator',
        'Audited Double-Entry Financial Ledger',
        'Virtual Data Room (VDR) Confidential Vault',
        'Unlimited Due Diligence Watchlists & Notes',
        'Portfolio MOIC, IRR & Sector Telemetry',
        'Institutional Due Diligence Export (PDF)'
      ],
      cta: currentPlanId === 'investor_pro' ? 'Current Plan' : 'Upgrade to Investor Pro',
      disabled: currentPlanId === 'investor_pro'
    }
  ];

  return (
    <AnimatePresence>
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        background: 'rgba(2, 6, 23, 0.82)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)'
      }}>
        {/* Backdrop Dismiss */}
        <div onClick={onClose} style={{ position: 'absolute', inset: 0 }} />

        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '1100px',
            maxHeight: '92vh',
            overflowY: 'auto',
            background: 'linear-gradient(180deg, rgba(17, 24, 39, 0.98) 0%, rgba(9, 14, 26, 0.98) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '24px',
            boxShadow: '0 30px 80px -20px rgba(0, 0, 0, 0.8), 0 0 50px rgba(99, 102, 241, 0.15)',
            padding: '1.8rem 2rem',
            color: 'var(--text-primary)',
            zIndex: 10
          }}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '1.5rem',
              right: '1.5rem',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>

          {/* Header */}
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 1.25rem' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.35rem 0.9rem',
              borderRadius: 'var(--radius-pill)',
              background: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              color: '#818CF8',
              fontSize: '0.75rem',
              fontWeight: 800,
              marginBottom: '0.9rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              <Sparkles size={13} /> Razorpay Secure Subscription
            </div>
            <h2 style={{
              fontSize: '1.75rem',
              fontWeight: 900,
              margin: '0 0 0.5rem',
              letterSpacing: '-0.03em',
              fontFamily: 'var(--font-display)',
              color: '#fff'
            }}>
              Upgrade Your Venture Operating System
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>
              Unlock institutional 5-Year DCF modeling, confidential data rooms, cap table dilution analysis, and actionable diligence radars.
            </p>

            {/* Monthly / Annual Toggle */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-pill)',
              padding: '4px',
              marginTop: '0.85rem'
            }}>
              <button
                onClick={() => setBillingCycle('monthly')}
                style={{
                  padding: '0.45rem 1.1rem',
                  borderRadius: 'var(--radius-pill)',
                  border: 'none',
                  background: billingCycle === 'monthly' ? 'linear-gradient(135deg, #6366F1, #8B5CF6)' : 'transparent',
                  color: billingCycle === 'monthly' ? '#fff' : 'var(--text-secondary)',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease'
                }}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '0.45rem 1.1rem',
                  borderRadius: 'var(--radius-pill)',
                  border: 'none',
                  background: billingCycle === 'annual' ? 'linear-gradient(135deg, #6366F1, #8B5CF6)' : 'transparent',
                  color: billingCycle === 'annual' ? '#fff' : 'var(--text-secondary)',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease'
                }}
              >
                <span>Annual Billing</span>
                <span style={{
                  fontSize: '0.68rem',
                  padding: '0.15rem 0.45rem',
                  borderRadius: 'var(--radius-pill)',
                  background: '#10B981',
                  color: '#fff',
                  fontWeight: 900
                }}>
                  SAVE 20%
                </span>
              </button>
            </div>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              padding: '0.85rem 1.2rem',
              borderRadius: '10px',
              color: '#F87171',
              fontSize: '0.85rem',
              marginBottom: '1.5rem',
              maxWidth: '680px',
              margin: '0 auto 1.5rem'
            }}>
              <AlertCircle size={17} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              padding: '0.85rem 1.2rem',
              borderRadius: '10px',
              color: '#34D399',
              fontSize: '0.85rem',
              maxWidth: '680px',
              margin: '0 auto 1.5rem'
            }}>
              <Check size={17} style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Responsive CSS for Strict Horizontal Alignment */}
          <style>{`
            .pricing-cards-grid {
              display: grid;
              grid-template-columns: repeat(3, minmax(0, 1fr));
              gap: 1.5rem;
              margin-bottom: 1.8rem;
              align-items: stretch;
            }
            @media (max-width: 960px) {
              .pricing-cards-grid {
                grid-template-columns: 1fr;
              }
            }
          `}</style>

          {/* 3 Pricing Cards Grid with Pixel-Perfect Row Alignment */}
          <div className="pricing-cards-grid">
            {plans.map((plan) => {
              const isCurrent = currentPlanId === plan.id;
              const price = billingCycle === 'annual' ? plan.priceAnnual : plan.priceMonthly;
              const perMonth = billingCycle === 'annual' && price > 0 ? Math.round(price / 12) : price;

              return (
                <div
                  key={plan.id}
                  style={{
                    position: 'relative',
                    background: plan.highlight
                      ? 'linear-gradient(180deg, rgba(99, 102, 241, 0.09) 0%, rgba(15, 23, 42, 0.94) 100%)'
                      : 'rgba(15, 23, 42, 0.65)',
                    border: plan.highlight
                      ? '2px solid #6366F1'
                      : isCurrent
                        ? '1.5px solid #10B981'
                        : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '20px',
                    padding: '1.4rem 1.3rem',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: plan.highlight
                      ? '0 15px 35px -10px rgba(99, 102, 241, 0.35)'
                      : 'none',
                    transition: 'transform 0.2s ease, border-color 0.2s ease'
                  }}
                >
                  {/* Row 1: Top Badge Bar (Strict 28px height) */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    height: '28px',
                    marginBottom: '1rem'
                  }}>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '0.22rem 0.65rem',
                      borderRadius: 'var(--radius-pill)',
                      background: plan.highlight
                        ? 'linear-gradient(135deg, #6366F1, #A855F7)'
                        : 'rgba(255, 255, 255, 0.07)',
                      color: plan.highlight ? '#fff' : 'var(--text-secondary)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      border: plan.highlight ? '1px solid rgba(168, 85, 247, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)'
                    }}>
                      {plan.badge}
                    </span>

                    {isCurrent ? (
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        padding: '0.2rem 0.6rem',
                        borderRadius: 'var(--radius-pill)',
                        background: 'rgba(16, 185, 129, 0.2)',
                        color: '#34D399',
                        border: '1px solid rgba(16, 185, 129, 0.35)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
                        Active Plan
                      </span>
                    ) : (
                      <div style={{ width: '1px', height: '1px' }} />
                    )}
                  </div>

                  {/* Row 2: Plan Name (Strict 30px height) */}
                  <div style={{ height: '30px', display: 'flex', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <h3 style={{
                      fontSize: '1.35rem',
                      fontWeight: 800,
                      margin: 0,
                      color: '#fff',
                      fontFamily: 'var(--font-display)',
                      letterSpacing: '-0.02em',
                      lineHeight: 1
                    }}>
                      {plan.name}
                    </h3>
                  </div>

                  {/* Row 3: Plan Subtitle (Strict 36px height) */}
                  <div style={{ height: '36px', display: 'flex', alignItems: 'flex-start', marginBottom: '1.1rem' }}>
                    <p style={{
                      fontSize: '0.78rem',
                      color: 'var(--text-muted)',
                      margin: 0,
                      lineHeight: '1.35'
                    }}>
                      {plan.subtitle}
                    </p>
                  </div>

                  {/* Row 4: Price Tag Block (Strict 64px height) */}
                  <div style={{
                    height: '64px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    marginBottom: '1.1rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                      <span style={{
                        fontSize: '2.3rem',
                        fontWeight: 900,
                        color: '#fff',
                        fontFamily: 'var(--font-display)',
                        lineHeight: 1
                      }}>
                        {price === 0 ? '₹0' : `₹${price.toLocaleString()}`}
                      </span>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                        {price === 0 ? '/ month' : (billingCycle === 'annual' ? '/ year' : '/ month')}
                      </span>
                    </div>

                    <div style={{ minHeight: '18px', marginTop: '6px' }}>
                      {billingCycle === 'annual' && price > 0 ? (
                        <span style={{ fontSize: '0.74rem', color: '#34D399', fontWeight: 700 }}>
                          ₹{perMonth.toLocaleString()} / month, billed annually
                        </span>
                      ) : price === 0 ? (
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                          Free forever for early founders
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                          Standard monthly flex billing
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Row 5: Horizontal Aligned Divider Line */}
                  <div style={{
                    height: '1px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    marginBottom: '1.2rem'
                  }} />

                  {/* Row 6: Feature List (8 Items, Each 26px min-height) */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.45rem',
                    marginBottom: '1rem',
                    flex: 1
                  }}>
                    {plan.features.map((f, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.6rem',
                          fontSize: '0.8rem',
                          color: 'var(--text-secondary)',
                          minHeight: '26px',
                          lineHeight: '1.35'
                        }}
                      >
                        <Check size={14} color="#10B981" style={{ flexShrink: 0, marginTop: '3px' }} />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>

                  {/* Row 7: Actions Section (Pinned to bottom via marginTop: auto) */}
                  <div style={{
                    marginTop: 'auto',
                    paddingTop: '0.8rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                  }}>
                    {plan.id === 'free' ? (
                      <>
                        <button
                          disabled
                          style={{
                            width: '100%',
                            height: '46px',
                            padding: '0.85rem',
                            borderRadius: '10px',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            background: isCurrent ? 'rgba(16, 185, 129, 0.16)' : 'rgba(255, 255, 255, 0.04)',
                            color: isCurrent ? '#34D399' : 'var(--text-muted)',
                            fontSize: '0.88rem',
                            fontWeight: 800,
                            cursor: 'default',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem'
                          }}
                        >
                          {isCurrent ? (
                            <>
                              <Check size={16} />
                              <span>Current Active Plan</span>
                            </>
                          ) : (
                            <span>Free Forever</span>
                          )}
                        </button>
                        <div style={{
                          width: '100%',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '5px',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          color: 'var(--text-muted)'
                        }}>
                          <Shield size={12} color="#10B981" />
                          <span>No credit card required • Always free</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <button
                          disabled={isCurrent || loadingPlan === plan.id}
                          onClick={() => handleRazorpayCheckout(plan.id)}
                          style={{
                            width: '100%',
                            height: '46px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.55rem',
                            padding: '0.85rem',
                            borderRadius: '10px',
                            border: 'none',
                            background: isCurrent
                              ? 'rgba(16, 185, 129, 0.2)'
                              : plan.highlight
                                ? 'linear-gradient(135deg, #6366F1, #8B5CF6)'
                                : 'linear-gradient(135deg, #10B981, #059669)',
                            color: isCurrent ? '#34D399' : '#fff',
                            fontSize: '0.88rem',
                            fontWeight: 800,
                            cursor: isCurrent ? 'default' : 'pointer',
                            boxShadow: plan.highlight && !isCurrent ? '0 4px 18px rgba(99, 102, 241, 0.4)' : 'none',
                            opacity: loadingPlan === plan.id ? 0.7 : 1,
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {isCurrent ? (
                            <>
                              <Check size={16} />
                              <span>Current Active Plan</span>
                            </>
                          ) : (
                            <>
                              <CreditCard size={15} />
                              <span>
                                {loadingPlan === plan.id
                                  ? 'Connecting Razorpay...'
                                  : `Pay with Razorpay (₹${price.toLocaleString()})`}
                              </span>
                            </>
                          )}
                        </button>

                        {!isCurrent ? (
                          <button
                            type="button"
                            onClick={() => handleTestUpgrade(plan.id)}
                            style={{
                              width: '100%',
                              height: '32px',
                              padding: '0.45rem',
                              borderRadius: '8px',
                              border: '1px dashed rgba(255, 255, 255, 0.15)',
                              background: 'transparent',
                              color: 'var(--text-muted)',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <Zap size={12} color="#FBBF24" />
                            <span>⚡ Activate in Sandbox / Test Mode</span>
                          </button>
                        ) : (
                          <div style={{
                            width: '100%',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '5px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            color: '#34D399'
                          }}>
                            <Sparkles size={12} />
                            <span>Unlocked & Active</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Guarantee */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1.5rem',
            paddingTop: '1rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Shield size={14} color="#10B981" />
              <span>Razorpay 256-Bit SSL Encrypted</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Sparkles size={14} color="#6366F1" />
              <span>Instant Cloud Activation</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <CreditCard size={14} color="#38BDF8" />
              <span>UPI, Cards, NetBanking, & Wallets</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
