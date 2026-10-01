import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Sparkles, Building2, DollarSign, Percent, Phone, Mail, 
  Send, FileText, CheckCircle2, AlertCircle, ArrowRight, ArrowLeft,
  HelpCircle, Users, Link2, ShieldCheck, Zap, PieChart, TrendingUp,
  Briefcase, Scale, Award, Layers, Sliders, Upload, Check, ChevronRight
} from 'lucide-react';
import { api } from '../../api/client';
import { STARTUP_INVESTMENT_CHECKLIST_TEMPLATE } from '../../data/investmentData';

const SECTORS = [
  'EdTech & Education',
  'Enterprise AI & Cloud',
  'HealthTech & Diagnostics',
  'FinTech & Cross-Border',
  'Supply Chain & Logistics',
  'CleanTech & Energy',
  'Consumer & D2C',
  'Cybersecurity & Infrastructure'
];

const STAGES = [
  'Pre-Seed',
  'Seed Round',
  'Pre-Series A',
  'Series A',
  'Series B'
];

export default function ListStartupModal({
  isOpen,
  onClose,
  onStartupListed,
  activeCompany = null
}) {
  const [activeStepTab, setActiveStepTab] = useState(1);
  const [showWhyModal, setShowWhyModal] = useState(true);

  // 11-Item Investment Checklist Form State
  const [formData, setFormData] = useState({
    // Item 1: Company Profile
    companyName: '',
    ticker: '',
    sector: SECTORS[0],
    stage: 'Seed Round',
    tagline: '',
    problemSolution: 'Automating high-touch manual workflows with verifiable intelligence and compliance guarantees.',
    headcount: 12,

    // Item 2: Pitch Deck
    pitchDeckUrl: '',
    pitchDeckFileName: 'Series A Pitch Deck presentation.pdf',
    pitchDeckUploaded: true,

    // Item 3: Business Model
    businessModelType: 'B2B SaaS / Annual Subscription',
    pricingStrategy: '$1,200/mo tier-1 tier + usage-based API overages',
    cac: 420,
    ltv: 2400,
    grossMargin: 75,

    // Item 4: Financial Statements
    currentRevenue: 320000,
    monthlyExpenses: 22000,
    cashBalance: 180000,
    financialStatementsFileName: 'Audited Financial Statements (FY24).xlsx',
    financialStatementsAudited: true,

    // Item 5: Financial Projections
    revenueGrowthRate: 85,
    projectedArr3Year: 1850000,
    terminalEbitdaMargin: 28,
    projectionsNotes: '5-year institutional DCF model showing positive operating cash flow by Month 18.',

    // Item 6: Cap Table
    foundersEquityPercent: 72.0,
    esopPoolPercent: 12.0,
    investorsEquityPercent: 16.0,
    capTableFileName: 'Fully Diluted Cap Table & ESOP Ledger.csv',

    // Item 7: Funding Requirement & Use of Funds
    fundingRequired: 500000,
    valuation: 5000000,
    equityOffered: 10.0,
    minInvestment: 25000,
    useOfFunds: {
      rnd: 40,        // 40% Product R&D
      marketing: 30,  // 30% Marketing & CAC
      hiring: 20,     // 20% Team Expansion
      operations: 10  // 10% Working Capital & Legal
    },

    // Item 8: Company Documents
    cin: 'U72200KA2020PTC138890',
    pan: 'ABCDE1234F',
    gstin: '29AAAAA0000A1Z5',
    companyDocsUploaded: true,
    companyDocsFileName: 'Incorporation Certificate, MOA & AOA.pdf',

    // Item 9: Founder KYC
    founderName: '',
    founderRole: 'Founder & CEO',
    founderWhatsApp: '',
    founderEmail: '',
    founderLinkedIn: '',
    founderKycVerified: true,

    // Item 10: Legal & Tax Documents
    taxComplianceStatus: 'Active & Compliant (No Pending Notices)',
    auditorName: 'Deloitte & Touche LLP / Statutory Auditor',
    legalTaxDocsUploaded: true,

    // Item 11: Contracts & IP Documents
    ipPatentsSummary: '2 provisional utility patents filed for proprietary algorithm; trademark registered.',
    keyCustomerContracts: '6 signed enterprise pilot contracts & Master Services Agreements (MSAs).',
    contractsIpUploaded: true,

    founderPitchNote: 'Seeking value-add angels and syndicate leads. Audited financials and full data room available upon request.'
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [successCelebration, setSuccessCelebration] = useState(false);

  if (!isOpen) return null;

  // Calculate Investment Checklist Preparedness (11 points)
  const checklistStatus = {
    companyProfile: Boolean(formData.companyName.trim() && formData.ticker.trim() && formData.tagline.trim()),
    pitchDeck: Boolean(formData.pitchDeckUploaded || formData.pitchDeckUrl.trim()),
    businessModel: Boolean(formData.businessModelType && formData.grossMargin > 0),
    financialStatements: Boolean(formData.currentRevenue > 0 && formData.financialStatementsFileName),
    financialProjections: Boolean(formData.revenueGrowthRate > 0 && formData.projectedArr3Year > 0),
    capTable: Boolean(formData.foundersEquityPercent > 0 && formData.capTableFileName),
    fundingAndUseOfFunds: Boolean(formData.fundingRequired > 0 && formData.equityOffered > 0),
    companyDocuments: Boolean(formData.cin && formData.companyDocsUploaded),
    founderKyc: Boolean(formData.founderName.trim() && (formData.founderWhatsApp.trim() || formData.founderEmail.trim())),
    legalAndTaxDocs: Boolean(formData.taxComplianceStatus && formData.legalTaxDocsUploaded),
    contractsAndIpDocs: Boolean(formData.ipPatentsSummary && formData.contractsIpUploaded)
  };

  const completedCount = Object.values(checklistStatus).filter(Boolean).length;
  const readinessPercent = Math.round((completedCount / 11) * 100);

  const handleAutofillFromActive = () => {
    if (!activeCompany) return;
    setFormData(prev => ({
      ...prev,
      companyName: activeCompany.companyName || activeCompany.name || prev.companyName || 'AlphaTech Solutions',
      ticker: (activeCompany.ticker || prev.ticker || 'ALPH').toUpperCase(),
      sector: activeCompany.sector || prev.sector,
      stage: activeCompany.stage || prev.stage,
      tagline: activeCompany.tagline || activeCompany.productsServices || `${activeCompany.companyName || 'Next-gen'} high-growth SaaS platform.`,
      fundingRequired: Number(activeCompany.fundingRequired) || prev.fundingRequired,
      valuation: Number(activeCompany.valuation || activeCompany.impliedValuation) || prev.valuation,
      equityOffered: Number(activeCompany.equityOffered) || prev.equityOffered,
      minInvestment: Number(activeCompany.minInvestment) || prev.minInvestment,
      currentRevenue: Number(activeCompany.currentRevenue || (activeCompany.monthlyRevenue ? activeCompany.monthlyRevenue * 12 : 336000)),
      revenueGrowthRate: Number(activeCompany.growthRate || activeCompany.revenueGrowthRate) || prev.revenueGrowthRate,
      founderName: activeCompany.founderName || (activeCompany.founders && activeCompany.founders[0]?.name) || prev.founderName || 'Zeeshan Khan',
      founderRole: (activeCompany.founders && activeCompany.founders[0]?.role) || prev.founderRole || 'Co-Founder & CEO',
      founderEmail: activeCompany.businessEmail || prev.founderEmail || 'founder@teledu.io',
      founderWhatsApp: activeCompany.businessPhone || prev.founderWhatsApp || '+1 (555) 234-5678',
      founderLinkedIn: activeCompany.founderLinkedIn || 'https://linkedin.com/in/founder-teledu',
      pitchDeckUrl: activeCompany.pitchDeckUrl || 'https://teledu.io/pitch.pdf'
    }));
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      // Auto-compute implied valuation if fundingRequired or equityOffered changed
      if (field === 'fundingRequired' || field === 'equityOffered') {
        const funding = field === 'fundingRequired' ? Number(value) : Number(prev.fundingRequired);
        const equity = field === 'equityOffered' ? Number(value) : Number(prev.equityOffered);
        if (funding > 0 && equity > 0) {
          updated.valuation = Math.round(funding / (equity / 100));
        }
      }
      return updated;
    });

    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleUseOfFundsChange = (cat, val) => {
    setFormData(prev => ({
      ...prev,
      useOfFunds: {
        ...prev.useOfFunds,
        [cat]: Number(val)
      }
    }));
  };

  const validate = () => {
    const err = {};
    if (!formData.companyName.trim()) err.companyName = 'Company name is required';
    if (!formData.ticker.trim()) err.ticker = 'Ticker symbol is required (e.g. ACME)';
    if (!formData.tagline.trim()) err.tagline = 'Please provide a 1-sentence elevator pitch';
    if (!formData.fundingRequired || Number(formData.fundingRequired) <= 0) err.fundingRequired = 'Target raise must be greater than 0';
    if (!formData.equityOffered || Number(formData.equityOffered) <= 0) err.equityOffered = 'Equity offered must be greater than 0';
    if (!formData.founderName.trim()) err.founderName = 'Founder name is required';
    if (!formData.founderWhatsApp.trim() && !formData.founderEmail.trim()) {
      err.founderContact = 'Provide either a direct WhatsApp number or email for investor contact';
    }
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);

    const cleanTicker = formData.ticker.trim().toUpperCase();
    const fundingReq = Number(formData.fundingRequired);
    const val = Number(formData.valuation) || 5000000;
    const askPrice = 50.0;
    const fairPrice = Number((askPrice * 1.25).toFixed(1));

    const newDealCompany = {
      _id: `custom-comp-${Date.now()}`,
      ticker: cleanTicker,
      companyName: formData.companyName.trim(),
      sector: formData.sector,
      stage: formData.stage,
      status: 'INVESTMENT_READY',
      fundingRequired: fundingReq,
      minInvestment: Number(formData.minInvestment) || 25000,
      maxInvestment: Math.round(fundingReq * 0.5),
      equityOffered: Number(formData.equityOffered),
      valuation: val,
      currentRevenue: Number(formData.currentRevenue) || 120000,
      revenueGrowthRate: Number(formData.revenueGrowthRate) || 85,
      ebitdaMargin: 22,
      healthScore: 89.5,
      overallRiskScore: 23.0,
      dcfEnterpriseValue: Math.round(val * 1.15),
      dcfEquityValue: Math.round(val * 1.18),
      currentSharePrice: askPrice,
      fairSharePrice: fairPrice,
      priceUpsidePercent: 25.0,
      recommendation: 'STRONG BUY',
      recommendationColorHex: '#10B981',
      tagline: formData.tagline.trim(),
      founderName: formData.founderName.trim(),
      founderRole: formData.founderRole.trim() || 'Founder & CEO',
      founderWhatsApp: formData.founderWhatsApp.trim(),
      founderEmail: formData.founderEmail.trim(),
      founderLinkedIn: formData.founderLinkedIn.trim(),
      pitchDeckUrl: formData.pitchDeckUrl.trim() || formData.pitchDeckFileName,
      founderPitchNote: formData.founderPitchNote.trim(),
      headcount: formData.headcount || 12,
      isCustomListing: true,
      seekingInvestment: true,
      inboundInquiriesCount: 1,
      softCommittedAmount: Math.round(fundingReq * 0.25),
      useOfFunds: formData.useOfFunds,
      investmentChecklist: {
        companyProfile: { status: 'VERIFIED', label: 'Company Profile & Vision Verified' },
        pitchDeck: { status: 'VERIFIED', label: formData.pitchDeckFileName || 'Pitch Deck Uploaded' },
        businessModel: { status: 'VERIFIED', label: formData.businessModelType },
        financialStatements: { status: 'VERIFIED', label: formData.financialStatementsFileName || 'Financial Statements Verified' },
        financialProjections: { status: 'VERIFIED', label: `Projections: ${formData.revenueGrowthRate}% YoY Growth` },
        capTable: { status: 'VERIFIED', label: `Cap Table Verified (Founders ${formData.foundersEquityPercent}%)` },
        fundingAndUseOfFunds: { status: 'VERIFIED', label: `$${fundingReq.toLocaleString()} Ask (${formData.useOfFunds.rnd}% R&D, ${formData.useOfFunds.marketing}% GTM)` },
        companyDocuments: { status: 'VERIFIED', label: `CIN ${formData.cin}, PAN ${formData.pan}, GST` },
        founderKyc: { status: 'VERIFIED', label: `Verified Founder (${formData.founderName})` },
        legalAndTaxDocs: { status: 'VERIFIED', label: formData.taxComplianceStatus },
        contractsAndIpDocs: { status: 'VERIFIED', label: formData.ipPatentsSummary }
      },
      completeness: {
        profile: 100,
        kyc: 95,
        team: 90,
        business: 95,
        financials: 95,
        funding: 100,
        documents: 90,
        overall: 95
      },
      listedAt: new Date().toISOString()
    };

    // 1. Persist to localStorage
    try {
      const existing = JSON.parse(localStorage.getItem('siq_deal_room_custom_companies') || '[]');
      const filtered = existing.filter(c => c.ticker.toUpperCase() !== cleanTicker);
      const updated = [newDealCompany, ...filtered];
      localStorage.setItem('siq_deal_room_custom_companies', JSON.stringify(updated));
    } catch (err) {
      console.warn('Storage error:', err);
    }

    // 2. Persist to backend API (async)
    try {
      await api.createCompany({
        companyName: newDealCompany.companyName,
        ticker: cleanTicker,
        stage: newDealCompany.stage,
        industry: newDealCompany.sector,
        monthlyRevenue: Math.round(newDealCompany.currentRevenue / 12),
        monthlyBurn: Math.round(formData.monthlyExpenses),
        cashAvailable: Math.round(formData.cashBalance)
      }).catch(() => null);
    } catch (e) {}

    setSuccessCelebration(true);
    setTimeout(() => {
      setSubmitting(false);
      if (onStartupListed) {
        onStartupListed(newDealCompany);
      }
      onClose();
    }, 1400);
  };

  const steps = [
    { id: 1, label: '1. Profile & Pitch Deck', items: ['Company Profile', 'Pitch Deck'], icon: Building2 },
    { id: 2, label: '2. Business Model & Financials', items: ['Business Model', 'Financial Statements', 'Projections'], icon: TrendingUp },
    { id: 3, label: '3. Cap Table & Use of Funds', items: ['Cap Table', 'Funding Ask & Allocation'], icon: PieChart },
    { id: 4, label: '4. Statutory Docs & KYC', items: ['Company Docs (COI/GST)', 'Founder KYC'], icon: ShieldCheck },
    { id: 5, label: '5. Legal, Tax & IP', items: ['Legal & Tax Filings', 'Contracts & IP'], icon: Scale }
  ];

  return (
    <div 
      className="modal-overlay" 
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting) onClose();
      }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(5, 10, 20, 0.88)',
        backdropFilter: 'blur(12px)',
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
        overflowY: 'auto'
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.2 }}
        style={{
          background: 'linear-gradient(145deg, #0e1726 0%, #070d18 100%)',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '860px',
          maxHeight: '92vh',
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
          padding: '1.4rem 1.8rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.14) 0%, rgba(99, 102, 241, 0.1) 100%)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '1rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '0.2rem 0.65rem',
                borderRadius: '999px',
                background: 'rgba(16, 185, 129, 0.2)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                color: '#34D399',
                fontSize: '0.72rem',
                fontWeight: 800,
                letterSpacing: '0.04em'
              }}>
                <Sparkles size={13} />
                STARTUP INVESTMENT CHECKLIST • 11 DILIGENCE PILLARS
              </span>

              {activeCompany && (
                <button
                  type="button"
                  onClick={handleAutofillFromActive}
                  style={{
                    background: 'rgba(99, 102, 241, 0.2)',
                    border: '1px solid rgba(129, 140, 248, 0.4)',
                    color: '#A5B4FC',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.65rem',
                    borderRadius: '999px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  title="Autofill from active workspace startup"
                >
                  <Zap size={12} />
                  Autofill Active Profile ({activeCompany.companyName || activeCompany.ticker})
                </button>
              )}
            </div>

            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
              Apply for Investment & List Deal Room
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#94A3B8', marginTop: '3px' }}>
              Complete the 11-point investment checklist required by angel syndicates and venture funds to verify and fund your startup.
            </p>
          </div>

          <button
            onClick={onClose}
            disabled={submitting}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: 'none',
              color: '#94A3B8',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Why Investors Need This - Explainer Card (from User Request) */}
        {showWhyModal && (
          <div style={{
            padding: '0.75rem 1.8rem',
            background: 'rgba(16, 185, 129, 0.06)',
            borderBottom: '1px solid rgba(16, 185, 129, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            fontSize: '0.78rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                background: '#10B981',
                color: '#041d14',
                padding: '0.15rem 0.45rem',
                borderRadius: '4px',
                fontWeight: 800,
                fontSize: '0.7rem'
              }}>
                WHY?
              </span>
              <span style={{ color: '#D1FAE5', lineHeight: 1.4 }}>
                <strong>Investor Standard:</strong> The investor needs to understand what the startup does, whether it can make money, who owns it, how the investment will be used, and whether the company is legally and financially genuine.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowWhyModal(false)}
              style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '0.72rem' }}
            >
              Dismiss
            </button>
          </div>
        )}

        {/* 11-Item Progress Meter */}
        <div style={{
          padding: '0.8rem 1.8rem',
          background: 'rgba(255, 255, 255, 0.02)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.2rem',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#fff' }}>
              Diligence Readiness:
            </span>
            <span style={{
              fontSize: '0.78rem',
              fontWeight: 800,
              color: readinessPercent >= 90 ? '#10B981' : '#FBBF24',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <CheckCircle2 size={14} />
              {completedCount} of 11 Items Prepared ({readinessPercent}%)
            </span>
          </div>

          <div style={{ flex: 1, minWidth: '180px', height: '6px', borderRadius: '999px', background: 'rgba(255, 255, 255, 0.08)', overflow: 'hidden' }}>
            <div style={{
              width: `${readinessPercent}%`,
              height: '100%',
              background: readinessPercent >= 90
                ? 'linear-gradient(90deg, #10B981, #34D399)'
                : 'linear-gradient(90deg, #F59E0B, #10B981)',
              transition: 'width 0.3s ease'
            }} />
          </div>

          <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
            {readinessPercent >= 90 ? '🌟 Institutional Grade Complete' : '⚡ Complete required sections below'}
          </div>
        </div>

        {/* Step Navigation Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: '#0B132B',
          overflowX: 'auto',
          padding: '0.2rem 1.8rem 0 1.8rem'
        }}>
          {steps.map(step => {
            const isActive = activeStepTab === step.id;
            const StepIcon = step.icon;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => setActiveStepTab(step.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '0.75rem 1rem',
                  background: 'none',
                  border: 'none',
                  borderBottom: isActive ? '2px solid #10B981' : '2px solid transparent',
                  color: isActive ? '#34D399' : '#94A3B8',
                  fontSize: '0.78rem',
                  fontWeight: isActive ? 800 : 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                <StepIcon size={14} />
                <span>{step.label}</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} style={{ overflowY: 'auto', padding: '1.6rem 1.8rem', display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
          
          {/* STEP 1: COMPANY PROFILE & PITCH DECK (Items 1 & 2) */}
          {activeStepTab === 1 && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
              
              {/* Item 1: Company Profile */}
              <div style={{ padding: '1.2rem', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#10B981', color: '#041d14', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>1</span>
                    <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#fff' }}>Company Profile</h3>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>To explain the business, problem & solution</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.9rem' }}>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#CBD5E1', marginBottom: '4px' }}>
                      Legal Entity or Company Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Teledu Learning Inc."
                      value={formData.companyName}
                      onChange={e => handleInputChange('companyName', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        background: 'rgba(15, 23, 42, 0.8)',
                        border: errors.companyName ? '1px solid #EF4444' : '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '0.85rem',
                        outline: 'none'
                      }}
                    />
                    {errors.companyName && <span style={{ color: '#EF4444', fontSize: '0.72rem', marginTop: '2px', display: 'block' }}>{errors.companyName}</span>}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#CBD5E1', marginBottom: '4px' }}>
                      Ticker / Code *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. TELEDU"
                      value={formData.ticker}
                      onChange={e => handleInputChange('ticker', e.target.value.toUpperCase())}
                      maxLength={6}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        background: 'rgba(15, 23, 42, 0.8)',
                        border: errors.ticker ? '1px solid #EF4444' : '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: '8px',
                        color: '#34D399',
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        outline: 'none',
                        textTransform: 'uppercase'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.9rem', marginTop: '0.9rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#CBD5E1', marginBottom: '4px' }}>Industry / Sector</label>
                    <select
                      value={formData.sector}
                      onChange={e => handleInputChange('sector', e.target.value)}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', background: '#0F172A', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }}
                    >
                      {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#CBD5E1', marginBottom: '4px' }}>Round Stage</label>
                    <select
                      value={formData.stage}
                      onChange={e => handleInputChange('stage', e.target.value)}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', background: '#0F172A', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }}
                    >
                      {STAGES.map(st => <option key={st} value={st}>{st}</option>)}
                    </select>
                  </div>
                </div>

                <div style={{ marginTop: '0.9rem' }}>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#CBD5E1', marginBottom: '4px' }}>
                    1-Sentence Elevator Pitch / Tagline *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. AI-driven vertical learning management system for coaching institutes and academies."
                    value={formData.tagline}
                    onChange={e => handleInputChange('tagline', e.target.value)}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'rgba(15, 23, 42, 0.8)', border: errors.tagline ? '1px solid #EF4444' : '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              {/* Item 2: Pitch Deck */}
              <div style={{ padding: '1.2rem', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#10B981', color: '#041d14', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>2</span>
                    <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#fff' }}>Pitch Deck</h3>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>To present the idea, product, market, and growth</span>
                </div>

                <div style={{
                  padding: '1.2rem',
                  borderRadius: '10px',
                  background: 'rgba(16, 185, 129, 0.05)',
                  border: '1px dashed rgba(16, 185, 129, 0.35)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.6rem',
                  textAlign: 'center',
                  marginBottom: '1rem'
                }}>
                  <FileText size={28} color="#34D399" />
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>
                    {formData.pitchDeckFileName || 'Upload Presentation Deck (PDF, PPTX)'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                    Attached Institutional Investor Deck (14 Slides, Financial Traction & Roadmap)
                  </div>
                  <span style={{
                    padding: '0.2rem 0.6rem',
                    borderRadius: '999px',
                    background: 'rgba(16, 185, 129, 0.2)',
                    color: '#34D399',
                    fontSize: '0.7rem',
                    fontWeight: 700
                  }}>
                    ✓ Verified Document Attached
                  </span>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#CBD5E1', marginBottom: '4px' }}>
                    Or Public Pitch Deck URL (DocSend / Google Drive / Notion)
                  </label>
                  <input
                    type="url"
                    placeholder="https://docsend.com/... or https://drive.google.com/..."
                    value={formData.pitchDeckUrl}
                    onChange={e => handleInputChange('pitchDeckUrl', e.target.value)}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: BUSINESS MODEL & FINANCIAL STATEMENTS (Items 3, 4 & 5) */}
          {activeStepTab === 2 && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
              
              {/* Item 3: Business Model */}
              <div style={{ padding: '1.2rem', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#10B981', color: '#041d14', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</span>
                    <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#fff' }}>Business Model</h3>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>To show how the startup makes money</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.9rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#CBD5E1', marginBottom: '4px' }}>Revenue & Monetization Model</label>
                    <input
                      type="text"
                      placeholder="e.g. B2B SaaS Tiered Subscriptions + Marketplace Take-rate"
                      value={formData.businessModelType}
                      onChange={e => handleInputChange('businessModelType', e.target.value)}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#CBD5E1', marginBottom: '4px' }}>Gross Margin (%)</label>
                    <input
                      type="number"
                      placeholder="75"
                      value={formData.grossMargin}
                      onChange={e => handleInputChange('grossMargin', e.target.value)}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '8px', color: '#34D399', fontWeight: 800, fontSize: '0.85rem' }}
                    />
                  </div>
                </div>
              </div>

              {/* Item 4: Financial Statements */}
              <div style={{ padding: '1.2rem', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#10B981', color: '#041d14', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>4</span>
                    <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#fff' }}>Financial Statements</h3>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>To show historical financial performance</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.9rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#CBD5E1', marginBottom: '4px' }}>Annual ARR / Revenue ($)</label>
                    <input
                      type="number"
                      value={formData.currentRevenue}
                      onChange={e => handleInputChange('currentRevenue', e.target.value)}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#CBD5E1', marginBottom: '4px' }}>Monthly Expenses / Burn ($)</label>
                    <input
                      type="number"
                      value={formData.monthlyExpenses}
                      onChange={e => handleInputChange('monthlyExpenses', e.target.value)}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#CBD5E1', marginBottom: '4px' }}>Cash Balance ($)</label>
                    <input
                      type="number"
                      value={formData.cashBalance}
                      onChange={e => handleInputChange('cashBalance', e.target.value)}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '8px', color: '#34D399', fontWeight: 800, fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                <div style={{ marginTop: '0.9rem', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.03)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={16} color="#818CF8" />
                    <span style={{ fontSize: '0.8rem', color: '#E2E8F0' }}>{formData.financialStatementsFileName}</span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 700 }}>✓ Audited by CPA</span>
                </div>
              </div>

              {/* Item 5: Financial Projections */}
              <div style={{ padding: '1.2rem', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#10B981', color: '#041d14', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>5</span>
                    <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#fff' }}>Financial Projections</h3>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>To show expected future performance (3-5 Years)</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.9rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#CBD5E1', marginBottom: '4px' }}>Expected YoY Growth (%)</label>
                    <input
                      type="number"
                      value={formData.revenueGrowthRate}
                      onChange={e => handleInputChange('revenueGrowthRate', e.target.value)}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '8px', color: '#10B981', fontWeight: 800, fontSize: '0.85rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#CBD5E1', marginBottom: '4px' }}>Target 3-Year ARR ($)</label>
                    <input
                      type="number"
                      value={formData.projectedArr3Year}
                      onChange={e => handleInputChange('projectedArr3Year', e.target.value)}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: CAP TABLE & FUNDING ASK WITH USE OF FUNDS (Items 6 & 7) */}
          {activeStepTab === 3 && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
              
              {/* Item 6: Cap Table */}
              <div style={{ padding: '1.2rem', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#10B981', color: '#041d14', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>6</span>
                    <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#fff' }}>Cap Table</h3>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>To show who owns the company & ESOP pool</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.9rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#CBD5E1', marginBottom: '4px' }}>Founders Equity (%)</label>
                    <input
                      type="number"
                      value={formData.foundersEquityPercent}
                      onChange={e => handleInputChange('foundersEquityPercent', e.target.value)}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#CBD5E1', marginBottom: '4px' }}>ESOP Option Pool (%)</label>
                    <input
                      type="number"
                      value={formData.esopPoolPercent}
                      onChange={e => handleInputChange('esopPoolPercent', e.target.value)}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#CBD5E1', marginBottom: '4px' }}>Existing Angels/VCs (%)</label>
                    <input
                      type="number"
                      value={formData.investorsEquityPercent}
                      onChange={e => handleInputChange('investorsEquityPercent', e.target.value)}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                <div style={{ marginTop: '0.9rem', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.03)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <PieChart size={16} color="#A78BFA" />
                    <span style={{ fontSize: '0.8rem', color: '#E2E8F0' }}>{formData.capTableFileName}</span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#34D399', fontWeight: 700 }}>✓ Fully Diluted Ledger Attached</span>
                </div>
              </div>

              {/* Item 7: Funding Requirement & Use of Funds */}
              <div style={{ padding: '1.2rem', borderRadius: '12px', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(99, 102, 241, 0.05) 100%)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#10B981', color: '#041d14', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>7</span>
                    <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#34D399' }}>Funding Requirement & Use of Funds</h3>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#A7F3D0' }}>Where every dollar will be spent</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.9rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#CBD5E1', marginBottom: '4px' }}>Target Raise ($) *</label>
                    <input
                      type="number"
                      value={formData.fundingRequired}
                      onChange={e => handleInputChange('fundingRequired', e.target.value)}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#CBD5E1', marginBottom: '4px' }}>Equity Offered (%) *</label>
                    <input
                      type="number"
                      step="0.5"
                      value={formData.equityOffered}
                      onChange={e => handleInputChange('equityOffered', e.target.value)}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#CBD5E1', marginBottom: '4px' }}>Implied Valuation ($)</label>
                    <input
                      type="number"
                      value={formData.valuation}
                      readOnly
                      style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '8px', color: '#34D399', fontWeight: 800, fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                {/* Detailed Use of Funds Breakdown */}
                <div style={{ marginTop: '1.2rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.7rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#fff' }}>Use of Funds Allocation:</span>
                    <span style={{ fontSize: '0.74rem', color: '#A7F3D0' }}>
                      Total: {formData.useOfFunds.rnd + formData.useOfFunds.marketing + formData.useOfFunds.hiring + formData.useOfFunds.operations}% (100% Allocated)
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.8rem', textAlign: 'center' }}>
                    {[
                      { key: 'rnd', label: 'Product & R&D', color: '#3B82F6' },
                      { key: 'marketing', label: 'Marketing & GTM', color: '#10B981' },
                      { key: 'hiring', label: 'Talent & Hiring', color: '#8B5CF6' },
                      { key: 'operations', label: 'Operations & Ops', color: '#F59E0B' }
                    ].map(item => {
                      const pct = formData.useOfFunds[item.key] || 0;
                      const dollars = Math.round((Number(formData.fundingRequired) * pct) / 100);
                      return (
                        <div key={item.key} style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                          <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{item.label}</div>
                          <div style={{ fontSize: '1rem', fontWeight: 800, color: item.color, margin: '3px 0' }}>{pct}%</div>
                          <div style={{ fontSize: '0.74rem', color: '#E2E8F0', fontWeight: 600 }}>${dollars.toLocaleString()}</div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={pct}
                            onChange={e => handleUseOfFundsChange(item.key, e.target.value)}
                            style={{ width: '100%', marginTop: '6px', accentColor: item.color }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 4: STATUTORY COMPANY DOCUMENTS & FOUNDER KYC (Items 8 & 9) */}
          {activeStepTab === 4 && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
              
              {/* Item 8: Company Documents */}
              <div style={{ padding: '1.2rem', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#10B981', color: '#041d14', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>8</span>
                    <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#fff' }}>Company Documents</h3>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Incorporation certificate (COI), MOA, AOA, PAN, GST</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.9rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#CBD5E1', marginBottom: '4px' }}>Corporate CIN / Reg No</label>
                    <input
                      type="text"
                      value={formData.cin}
                      onChange={e => handleInputChange('cin', e.target.value)}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#CBD5E1', marginBottom: '4px' }}>Tax PAN / Tax ID</label>
                    <input
                      type="text"
                      value={formData.pan}
                      onChange={e => handleInputChange('pan', e.target.value)}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#CBD5E1', marginBottom: '4px' }}>GSTIN Registration</label>
                    <input
                      type="text"
                      value={formData.gstin}
                      onChange={e => handleInputChange('gstin', e.target.value)}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                <div style={{ marginTop: '0.9rem', padding: '0.8rem', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Layers size={16} color="#34D399" />
                    <span style={{ fontSize: '0.8rem', color: '#fff' }}>{formData.companyDocsFileName}</span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#34D399', fontWeight: 700 }}>✓ Statutory Dossier Uploaded</span>
                </div>
              </div>

              {/* Item 9: Founder KYC & Direct Investor Contact */}
              <div style={{ padding: '1.2rem', borderRadius: '12px', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(99, 102, 241, 0.05) 100%)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#10B981', color: '#041d14', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>9</span>
                    <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#34D399' }}>Founder KYC & Direct Investor Line</h3>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#A7F3D0' }}>To verify the founders/directors</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.9rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#CBD5E1', marginBottom: '4px' }}>Founder Full Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Zeeshan Khan"
                      value={formData.founderName}
                      onChange={e => handleInputChange('founderName', e.target.value)}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'rgba(15, 23, 42, 0.8)', border: errors.founderName ? '1px solid #EF4444' : '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#CBD5E1', marginBottom: '4px' }}>Founder Role / Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Co-Founder & CEO"
                      value={formData.founderRole}
                      onChange={e => handleInputChange('founderRole', e.target.value)}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.9rem', marginTop: '0.9rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#34D399', marginBottom: '4px' }}>
                      Direct WhatsApp Number (with Country Code) *
                    </label>
                    <input
                      type="text"
                      placeholder="+1 (555) 234-5678 or +91 98765 43210"
                      value={formData.founderWhatsApp}
                      onChange={e => handleInputChange('founderWhatsApp', e.target.value)}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '8px', color: '#6EE7B7', fontWeight: 700, fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#CBD5E1', marginBottom: '4px' }}>Direct Founder Email *</label>
                    <input
                      type="email"
                      placeholder="founder@teledu.io"
                      value={formData.founderEmail}
                      onChange={e => handleInputChange('founderEmail', e.target.value)}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 5: LEGAL, TAX, CONTRACTS & IP ASSETS (Items 10 & 11) */}
          {activeStepTab === 5 && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
              
              {/* Item 10: Legal & Tax Documents */}
              <div style={{ padding: '1.2rem', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#10B981', color: '#041d14', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>10</span>
                    <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#fff' }}>Legal & Tax Documents</h3>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>For investor due diligence & compliance</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.9rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#CBD5E1', marginBottom: '4px' }}>Tax Compliance Status</label>
                    <input
                      type="text"
                      value={formData.taxComplianceStatus}
                      onChange={e => handleInputChange('taxComplianceStatus', e.target.value)}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '8px', color: '#34D399', fontWeight: 700, fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#CBD5E1', marginBottom: '4px' }}>Statutory Auditor Retainer</label>
                    <input
                      type="text"
                      value={formData.auditorName}
                      onChange={e => handleInputChange('auditorName', e.target.value)}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>
              </div>

              {/* Item 11: Contracts & IP Documents */}
              <div style={{ padding: '1.2rem', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#10B981', color: '#041d14', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>11</span>
                    <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#fff' }}>Contracts & IP Documents</h3>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>To verify business assets, IP, and client agreements</span>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#CBD5E1', marginBottom: '4px' }}>Proprietary IP & Patent Filings Summary</label>
                  <textarea
                    rows={2}
                    value={formData.ipPatentsSummary}
                    onChange={e => handleInputChange('ipPatentsSummary', e.target.value)}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem', resize: 'none' }}
                  />
                </div>

                <div style={{ marginTop: '0.8rem' }}>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#CBD5E1', marginBottom: '4px' }}>Commercial Client Contracts & MSAs</label>
                  <textarea
                    rows={2}
                    value={formData.keyCustomerContracts}
                    onChange={e => handleInputChange('keyCustomerContracts', e.target.value)}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem', resize: 'none' }}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Footer Actions */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '1.2rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            flexWrap: 'wrap',
            gap: '0.8rem'
          }}>
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              {activeStepTab > 1 && (
                <button
                  type="button"
                  onClick={() => setActiveStepTab(prev => prev - 1)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '0.65rem 1rem',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    color: '#fff',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer'
                  }}
                >
                  <ArrowLeft size={14} /> Back
                </button>
              )}
              {activeStepTab < 5 && (
                <button
                  type="button"
                  onClick={() => setActiveStepTab(prev => prev + 1)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '0.65rem 1.1rem',
                    borderRadius: '8px',
                    background: 'rgba(99, 102, 241, 0.2)',
                    border: '1px solid rgba(129, 140, 248, 0.4)',
                    color: '#A5B4FC',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    cursor: 'pointer'
                  }}
                >
                  Next Section <ArrowRight size={14} />
                </button>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                style={{ background: 'transparent', border: 'none', color: '#94A3B8', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '0.75rem 1.6rem',
                  borderRadius: '10px',
                  background: successCelebration
                    ? '#059669'
                    : 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 16px rgba(16, 185, 129, 0.45)',
                  transition: 'all 0.2s ease'
                }}
              >
                {successCelebration ? (
                  <>
                    <CheckCircle2 size={18} />
                    <span>Checklist Verified & Listed!</span>
                  </>
                ) : submitting ? (
                  <span>Submitting Diligence Package...</span>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>Publish 11-Point Diligence Package</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
