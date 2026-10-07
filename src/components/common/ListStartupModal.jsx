import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Sparkles, Building2, DollarSign, Percent, Phone, Mail, 
  Send, FileText, CheckCircle2, AlertCircle, ArrowRight, ArrowLeft,
  HelpCircle, Users, Link2, ShieldCheck, Zap, PieChart, TrendingUp,
  Briefcase, Scale, Award, Layers, Sliders, Upload, Check, ChevronRight,
  FileUp, RefreshCw, Trash2, Paperclip
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

const FIELD_STEP_MAP = {
  companyName: 1,
  ticker: 1,
  tagline: 1,
  sector: 1,
  stage: 1,
  pitchDeckUrl: 1,
  businessModelType: 2,
  pricingStrategy: 2,
  cac: 2,
  ltv: 2,
  grossMargin: 2,
  currentRevenue: 2,
  monthlyExpenses: 2,
  cashBalance: 2,
  revenueGrowthRate: 2,
  projectedArr3Year: 2,
  foundersEquityPercent: 3,
  esopPoolPercent: 3,
  investorsEquityPercent: 3,
  fundingRequired: 3,
  equityOffered: 3,
  cin: 4,
  pan: 4,
  gstin: 4,
  founderName: 4,
  founderRole: 4,
  founderWhatsApp: 4,
  founderEmail: 4,
  founderContact: 4,
  taxComplianceStatus: 5,
  auditorName: 5,
  ipPatentsSummary: 5
};

export default function ListStartupModal({
  isOpen,
  onClose,
  onStartupListed,
  activeCompany = null,
  currentUser = null
}) {
  const [activeStepTab, setActiveStepTab] = useState(1);
  const [showWhyModal, setShowWhyModal] = useState(true);
  const [validationBanner, setValidationBanner] = useState(null);
  const [isDraggingDeck, setIsDraggingDeck] = useState(false);

  // Hidden File Input References
  const pitchDeckInputRef = useRef(null);
  const financialStatementsInputRef = useRef(null);
  const capTableInputRef = useRef(null);
  const companyDocsInputRef = useRef(null);

  // Derive sensible default founder information from activeCompany or currentUser
  const defaultFounderName = activeCompany?.founderName || (activeCompany?.founders && activeCompany?.founders[0]?.name) || currentUser?.fullName || 'Zeeshan Khan';
  const defaultFounderRole = (activeCompany?.founders && activeCompany?.founders[0]?.role) || 'Co-Founder & CEO';
  const defaultFounderEmail = activeCompany?.businessEmail || currentUser?.email || 'founder@teledu.io';
  const defaultFounderPhone = activeCompany?.businessPhone || currentUser?.phone || '+91 98201 44521';
  const defaultFounderLinkedIn = activeCompany?.founderLinkedIn || 'https://linkedin.com/in/founder-teledu';

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
    pitchDeckFileSize: '2.4 MB',
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
    founderName: defaultFounderName,
    founderRole: defaultFounderRole,
    founderWhatsApp: defaultFounderPhone,
    founderEmail: defaultFounderEmail,
    founderLinkedIn: defaultFounderLinkedIn,
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
  const hasStartedProfile = Boolean(formData.companyName.trim() && formData.ticker.trim());
  const checklistStatus = {
    companyProfile: Boolean(formData.companyName.trim() && formData.ticker.trim() && formData.tagline.trim()),
    pitchDeck: Boolean(hasStartedProfile && (formData.pitchDeckUploaded || formData.pitchDeckUrl.trim())),
    businessModel: Boolean(hasStartedProfile && formData.businessModelType && formData.grossMargin > 0),
    financialStatements: Boolean(hasStartedProfile && formData.currentRevenue > 0 && formData.financialStatementsFileName),
    financialProjections: Boolean(hasStartedProfile && formData.revenueGrowthRate > 0 && formData.projectedArr3Year > 0),
    capTable: Boolean(hasStartedProfile && formData.foundersEquityPercent > 0 && formData.capTableFileName),
    fundingAndUseOfFunds: Boolean(hasStartedProfile && formData.fundingRequired > 0 && formData.equityOffered > 0),
    companyDocuments: Boolean(hasStartedProfile && formData.cin && formData.companyDocsUploaded),
    founderKyc: Boolean(hasStartedProfile && formData.founderName.trim() && (formData.founderWhatsApp.trim() || formData.founderEmail.trim())),
    legalAndTaxDocs: Boolean(hasStartedProfile && formData.taxComplianceStatus && formData.legalTaxDocsUploaded),
    contractsAndIpDocs: Boolean(hasStartedProfile && formData.ipPatentsSummary && formData.contractsIpUploaded)
  };

  const completedCount = Object.values(checklistStatus).filter(Boolean).length;
  const readinessPercent = Math.round((completedCount / 11) * 100);

  const handleAutofillFromActive = () => {
    if (!activeCompany) return;
    setFormData(prev => ({
      ...prev,
      companyName: activeCompany.companyName || activeCompany.name || prev.companyName || 'Teledu Learning',
      ticker: (activeCompany.ticker || prev.ticker || 'TELEDU').toUpperCase(),
      sector: activeCompany.sector || prev.sector || 'EdTech & Education',
      stage: activeCompany.stage || prev.stage || 'Seed Round',
      tagline: activeCompany.tagline || activeCompany.productsServices || `${activeCompany.companyName || 'Teledu Learning'} vertical LMS and AI examination platform.`,
      fundingRequired: Number(activeCompany.fundingRequired) || prev.fundingRequired || 500000,
      valuation: Number(activeCompany.valuation || activeCompany.impliedValuation) || prev.valuation || 5000000,
      equityOffered: Number(activeCompany.equityOffered) || prev.equityOffered || 10,
      minInvestment: Number(activeCompany.minInvestment) || prev.minInvestment || 50000,
      currentRevenue: Number(activeCompany.currentRevenue || (activeCompany.monthlyRevenue ? activeCompany.monthlyRevenue * 12 : 342000)),
      revenueGrowthRate: Number(activeCompany.growthRate || activeCompany.revenueGrowthRate) || prev.revenueGrowthRate || 68,
      founderName: activeCompany.founderName || (activeCompany.founders && activeCompany.founders[0]?.name) || prev.founderName || 'Zeeshan Khan',
      founderRole: (activeCompany.founders && activeCompany.founders[0]?.role) || prev.founderRole || 'Co-Founder & CEO',
      founderEmail: activeCompany.businessEmail || prev.founderEmail || 'zeeshan@teledu.io',
      founderWhatsApp: activeCompany.businessPhone || prev.founderWhatsApp || '+91 98201 44521',
      founderLinkedIn: activeCompany.founderLinkedIn || 'https://linkedin.com/in/zeeshan-teledu',
      pitchDeckUrl: activeCompany.pitchDeckUrl || 'https://teledu.io/deck.pdf'
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
        if (Object.keys(next).length === 0) {
          setValidationBanner(null);
        }
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

  const processDeckFile = (file) => {
    if (!file) return;
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    const sizeStr = file.size > 1024 * 1024 ? `${sizeMb} MB` : `${Math.max(1, Math.round(file.size / 1024))} KB`;
    setFormData(prev => ({
      ...prev,
      pitchDeckFileName: file.name,
      pitchDeckFileSize: sizeStr,
      pitchDeckUploaded: true
    }));
    if (errors.pitchDeck) {
      setErrors(prev => {
        const next = { ...prev };
        delete next.pitchDeck;
        return next;
      });
    }
  };

  const handleDeckFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processDeckFile(file);
    }
  };

  const handleRemoveDeckFile = (e) => {
    e.stopPropagation();
    setFormData(prev => ({
      ...prev,
      pitchDeckFileName: '',
      pitchDeckFileSize: '',
      pitchDeckUploaded: false
    }));
    if (pitchDeckInputRef.current) {
      pitchDeckInputRef.current.value = '';
    }
  };

  const handleGenericFileUpload = (flagKey, nameKey, e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        [nameKey]: file.name,
        [flagKey]: true
      }));
    }
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

    if (Object.keys(err).length > 0) {
      const firstKey = Object.keys(err)[0];
      const targetStep = FIELD_STEP_MAP[firstKey] || 1;
      setActiveStepTab(targetStep);
      setValidationBanner(`Action Required in Step ${targetStep}: ${err[firstKey]}`);
      return false;
    }

    setValidationBanner(null);
    return true;
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (submitting) return;

    if (!validate()) {
      return;
    }

    setSubmitting(true);

    try {
      const cleanTicker = (formData.ticker.trim() || 'NEWCO').toUpperCase();
      const fundingReq = Number(formData.fundingRequired) || 500000;
      const val = Number(formData.valuation) || 5000000;
      const askPrice = 50.0;
      const fairPrice = Number((askPrice * 1.25).toFixed(1));

      const finalFounderName = formData.founderName.trim() || defaultFounderName || 'Founder & CEO';
      const finalFounderEmail = formData.founderEmail.trim() || defaultFounderEmail || `founder@${cleanTicker.toLowerCase()}.io`;
      const finalFounderWhatsApp = formData.founderWhatsApp.trim() || defaultFounderPhone || '+91 98201 44521';
      const finalFounderRole = formData.founderRole.trim() || defaultFounderRole || 'Co-Founder & CEO';

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
        equityOffered: Number(formData.equityOffered) || 10,
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
        recommendation: 'HIGH CONVICTION',
        recommendationColorHex: '#10B981',
        tagline: formData.tagline.trim(),
        founderName: finalFounderName,
        founderRole: finalFounderRole,
        founderWhatsApp: finalFounderWhatsApp,
        founderEmail: finalFounderEmail,
        founderLinkedIn: formData.founderLinkedIn.trim() || defaultFounderLinkedIn,
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
          founderKyc: { status: 'VERIFIED', label: `Verified Founder (${finalFounderName})` },
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
      }, 1200);
    } catch (submitErr) {
      console.error('Submit error:', submitErr);
      setSubmitting(false);
    }
  };

  const steps = [
    { 
      id: 1, 
      shortTitle: '1. Profile & Pitch', 
      title: 'Company Profile & Pitch Deck', 
      itemKeys: ['companyProfile', 'pitchDeck'], 
      itemCount: 2, 
      icon: Building2 
    },
    { 
      id: 2, 
      shortTitle: '2. Financials', 
      title: 'Business Model & Financials', 
      itemKeys: ['businessModel', 'financialStatements', 'financialProjections'], 
      itemCount: 3, 
      icon: TrendingUp 
    },
    { 
      id: 3, 
      shortTitle: '3. Cap Table & Ask', 
      title: 'Cap Table & Use of Funds', 
      itemKeys: ['capTable', 'fundingAndUseOfFunds'], 
      itemCount: 2, 
      icon: PieChart 
    },
    { 
      id: 4, 
      shortTitle: '4. Statutory & KYC', 
      title: 'Company Docs & Founder KYC', 
      itemKeys: ['companyDocuments', 'founderKyc'], 
      itemCount: 2, 
      icon: ShieldCheck 
    },
    { 
      id: 5, 
      shortTitle: '5. Legal & IP', 
      title: 'Legal, Tax & IP Filings', 
      itemKeys: ['legalAndTaxDocs', 'contractsAndIpDocs'], 
      itemCount: 2, 
      icon: Scale 
    }
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
                fontSize: '0.7rem',
                whiteSpace: 'nowrap',
                flexShrink: 0
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
          padding: '0.75rem 1.4rem',
          background: 'linear-gradient(180deg, rgba(11, 19, 43, 0.95) 0%, rgba(7, 13, 24, 0.95) 100%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, minmax(130px, 1fr))',
            gap: '0.6rem',
            minWidth: '660px'
          }}>
            {steps.map(step => {
              const isActive = activeStepTab === step.id;
              const StepIcon = step.icon;
              const stepHasError = Object.keys(errors).some(field => FIELD_STEP_MAP[field] === step.id);
              const completedCount = step.itemKeys.filter(k => checklistStatus[k]).length;
              const isStepComplete = completedCount === step.itemCount;

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => {
                    setActiveStepTab(step.id);
                    if (stepHasError && validationBanner) {
                      const stepErr = Object.keys(errors).find(f => FIELD_STEP_MAP[f] === step.id);
                      if (stepErr) setValidationBanner(`Action Required in Step ${step.id}: ${errors[stepErr]}`);
                    }
                  }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: '5px',
                    padding: '0.6rem 0.75rem',
                    borderRadius: '10px',
                    background: isActive
                      ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.16) 0%, rgba(6, 78, 59, 0.3) 100%)'
                      : stepHasError
                      ? 'rgba(239, 68, 68, 0.12)'
                      : isStepComplete
                      ? 'rgba(16, 185, 129, 0.04)'
                      : 'rgba(255, 255, 255, 0.025)',
                    border: isActive
                      ? '1px solid rgba(52, 211, 153, 0.55)'
                      : stepHasError
                      ? '1px solid rgba(239, 68, 68, 0.45)'
                      : isStepComplete
                      ? '1px solid rgba(16, 185, 129, 0.2)'
                      : '1px solid rgba(255, 255, 255, 0.06)',
                    boxShadow: isActive
                      ? '0 4px 14px rgba(16, 185, 129, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.08)'
                      : 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative'
                  }}
                >
                  {/* Top row: Icon / Step Number & Status tag */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}>
                      <span style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        background: isActive
                          ? '#10B981'
                          : stepHasError
                          ? '#EF4444'
                          : isStepComplete
                          ? 'rgba(16, 185, 129, 0.22)'
                          : 'rgba(255, 255, 255, 0.08)',
                        color: isActive
                          ? '#022c22'
                          : stepHasError
                          ? '#fff'
                          : isStepComplete
                          ? '#34D399'
                          : '#94A3B8'
                      }}>
                        {isStepComplete && !stepHasError ? '✓' : stepHasError ? '!' : step.id}
                      </span>
                      <StepIcon size={13} color={isActive ? '#34D399' : stepHasError ? '#F87171' : isStepComplete ? '#6EE7B7' : '#94A3B8'} />
                    </div>

                    <span style={{
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      color: stepHasError
                        ? '#F87171'
                        : isStepComplete
                        ? '#34D399'
                        : isActive
                        ? '#6EE7B7'
                        : '#64748B'
                    }}>
                      {stepHasError ? 'Fix Error' : isStepComplete ? 'Complete' : isActive ? 'Active' : `${completedCount}/${step.itemCount}`}
                    </span>
                  </div>

                  {/* Title */}
                  <div style={{
                    fontSize: '0.78rem',
                    fontWeight: isActive ? 800 : 600,
                    color: isActive ? '#FFFFFF' : stepHasError ? '#FCA5A5' : isStepComplete ? '#F1F5F9' : '#CBD5E1',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    width: '100%'
                  }}>
                    {step.shortTitle}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} style={{ overflowY: 'auto', padding: '1.6rem 1.8rem', display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
          
          {/* Validation Notice Banner */}
          {validationBanner && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                background: 'rgba(239, 68, 68, 0.14)',
                border: '1px solid rgba(239, 68, 68, 0.45)',
                color: '#FCA5A5',
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.8rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={16} color="#EF4444" style={{ flexShrink: 0 }} />
                <span style={{ fontWeight: 600 }}>{validationBanner}</span>
              </div>
              <button
                type="button"
                onClick={() => setValidationBanner(null)}
                style={{ background: 'none', border: 'none', color: '#FCA5A5', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <X size={14} />
              </button>
            </motion.div>
          )}

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
                    {errors.ticker && <span style={{ color: '#EF4444', fontSize: '0.72rem', marginTop: '2px', display: 'block' }}>{errors.ticker}</span>}
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
                  {errors.tagline && <span style={{ color: '#EF4444', fontSize: '0.72rem', marginTop: '2px', display: 'block' }}>{errors.tagline}</span>}
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

                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={pitchDeckInputRef}
                  accept=".pdf,.pptx,.ppt,.key,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                  onChange={handleDeckFileUpload}
                  style={{ display: 'none' }}
                />

                {/* Interactive Drag & Drop / File Card Container */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDraggingDeck(true); }}
                  onDragLeave={() => setIsDraggingDeck(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingDeck(false);
                    if (e.dataTransfer.files?.[0]) {
                      processDeckFile(e.dataTransfer.files[0]);
                    }
                  }}
                  onClick={() => pitchDeckInputRef.current?.click()}
                  style={{
                    padding: '1.2rem 1.4rem',
                    borderRadius: '12px',
                    background: isDraggingDeck
                      ? 'rgba(16, 185, 129, 0.12)'
                      : formData.pitchDeckFileName
                      ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(99, 102, 241, 0.04) 100%)'
                      : 'rgba(15, 23, 42, 0.6)',
                    border: isDraggingDeck
                      ? '2px dashed #10B981'
                      : formData.pitchDeckFileName
                      ? '1px solid rgba(16, 185, 129, 0.4)'
                      : '1.5px dashed rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.75rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    marginBottom: '1rem',
                    position: 'relative'
                  }}
                >
                  {formData.pitchDeckFileName ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: '0.8rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left' }}>
                        <div style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '10px',
                          background: 'rgba(16, 185, 129, 0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#34D399',
                          flexShrink: 0
                        }}>
                          <FileText size={22} />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#fff', wordBreak: 'break-all' }}>
                            {formData.pitchDeckFileName}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>{formData.pitchDeckFileSize || 'Attached Presentation Deck'}</span>
                            <span>•</span>
                            <span style={{ color: '#34D399', fontWeight: 700 }}>✓ Verified Document Attached</span>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            pitchDeckInputRef.current?.click();
                          }}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '0.45rem 0.85rem',
                            borderRadius: '7px',
                            background: 'rgba(16, 185, 129, 0.2)',
                            border: '1px solid rgba(16, 185, 129, 0.4)',
                            color: '#6EE7B7',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          <RefreshCw size={13} />
                          <span>Replace File</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoveDeckFile}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '0.45rem 0.65rem',
                            borderRadius: '7px',
                            background: 'rgba(239, 68, 68, 0.12)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            color: '#F87171',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          <Trash2 size={13} />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '12px',
                        background: 'rgba(16, 185, 129, 0.12)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#34D399'
                      }}>
                        <Upload size={22} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#fff', marginBottom: '3px' }}>
                          Upload Presentation Pitch Deck
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#94A3B8' }}>
                          Drag & drop your presentation file here, or click to <span style={{ color: '#34D399', fontWeight: 700 }}>browse device</span>
                        </div>
                      </div>
                      <div style={{
                        fontSize: '0.7rem',
                        color: '#64748B',
                        background: 'rgba(255, 255, 255, 0.04)',
                        padding: '0.25rem 0.7rem',
                        borderRadius: '999px',
                        border: '1px solid rgba(255, 255, 255, 0.08)'
                      }}>
                        Supports PDF, PowerPoint (.pptx), Keynote up to 50MB
                      </div>
                    </>
                  )}
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

                <input
                  type="file"
                  ref={financialStatementsInputRef}
                  accept=".pdf,.xlsx,.xls,.csv"
                  onChange={e => handleGenericFileUpload('financialStatementsAudited', 'financialStatementsFileName', e)}
                  style={{ display: 'none' }}
                />
                <div style={{ marginTop: '0.9rem', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.6rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={16} color="#818CF8" />
                    <span style={{ fontSize: '0.8rem', color: '#E2E8F0' }}>{formData.financialStatementsFileName || 'Audited Financial Statements (P&L, Balance Sheet)'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 700 }}>✓ Audited by CPA</span>
                    <button
                      type="button"
                      onClick={() => financialStatementsInputRef.current?.click()}
                      style={{
                        padding: '0.3rem 0.65rem',
                        borderRadius: '6px',
                        background: 'rgba(129, 140, 248, 0.15)',
                        border: '1px solid rgba(129, 140, 248, 0.35)',
                        color: '#A5B4FC',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Browse File
                    </button>
                  </div>
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

                <input
                  type="file"
                  ref={capTableInputRef}
                  accept=".csv,.xlsx,.xls,.pdf"
                  onChange={e => handleGenericFileUpload('capTableUploaded', 'capTableFileName', e)}
                  style={{ display: 'none' }}
                />
                <div style={{ marginTop: '0.9rem', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.6rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <PieChart size={16} color="#A78BFA" />
                    <span style={{ fontSize: '0.8rem', color: '#E2E8F0' }}>{formData.capTableFileName || 'Cap Table & ESOP Ledger (.csv, .xlsx)'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.72rem', color: '#34D399', fontWeight: 700 }}>✓ Fully Diluted Ledger Attached</span>
                    <button
                      type="button"
                      onClick={() => capTableInputRef.current?.click()}
                      style={{
                        padding: '0.3rem 0.65rem',
                        borderRadius: '6px',
                        background: 'rgba(167, 139, 250, 0.15)',
                        border: '1px solid rgba(167, 139, 250, 0.35)',
                        color: '#C4B5FD',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Browse File
                    </button>
                  </div>
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
                      style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'rgba(15, 23, 42, 0.8)', border: errors.fundingRequired ? '1px solid #EF4444' : '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }}
                    />
                    {errors.fundingRequired && <span style={{ color: '#EF4444', fontSize: '0.72rem', marginTop: '2px', display: 'block' }}>{errors.fundingRequired}</span>}
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#CBD5E1', marginBottom: '4px' }}>Equity Offered (%) *</label>
                    <input
                      type="number"
                      step="0.5"
                      value={formData.equityOffered}
                      onChange={e => handleInputChange('equityOffered', e.target.value)}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'rgba(15, 23, 42, 0.8)', border: errors.equityOffered ? '1px solid #EF4444' : '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }}
                    />
                    {errors.equityOffered && <span style={{ color: '#EF4444', fontSize: '0.72rem', marginTop: '2px', display: 'block' }}>{errors.equityOffered}</span>}
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

                <input
                  type="file"
                  ref={companyDocsInputRef}
                  accept=".pdf,.zip,.doc,.docx"
                  onChange={e => handleGenericFileUpload('companyDocsUploaded', 'companyDocsFileName', e)}
                  style={{ display: 'none' }}
                />
                <div style={{ marginTop: '0.9rem', padding: '0.8rem', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.6rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Layers size={16} color="#34D399" />
                    <span style={{ fontSize: '0.8rem', color: '#fff' }}>{formData.companyDocsFileName || 'Incorporation COI, MOA, AOA & Dossier (.pdf)'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.72rem', color: '#34D399', fontWeight: 700 }}>✓ Statutory Dossier Uploaded</span>
                    <button
                      type="button"
                      onClick={() => companyDocsInputRef.current?.click()}
                      style={{
                        padding: '0.3rem 0.65rem',
                        borderRadius: '6px',
                        background: 'rgba(16, 185, 129, 0.18)',
                        border: '1px solid rgba(16, 185, 129, 0.4)',
                        color: '#6EE7B7',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Browse File
                    </button>
                  </div>
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
                    {errors.founderName && <span style={{ color: '#EF4444', fontSize: '0.72rem', marginTop: '2px', display: 'block' }}>{errors.founderName}</span>}
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
                      style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'rgba(15, 23, 42, 0.8)', border: errors.founderContact ? '1px solid #EF4444' : '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '8px', color: '#6EE7B7', fontWeight: 700, fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#CBD5E1', marginBottom: '4px' }}>Direct Founder Email *</label>
                    <input
                      type="email"
                      placeholder="founder@teledu.io"
                      value={formData.founderEmail}
                      onChange={e => handleInputChange('founderEmail', e.target.value)}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'rgba(15, 23, 42, 0.8)', border: errors.founderContact ? '1px solid #EF4444' : '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }}
                    />
                    {errors.founderContact && <span style={{ color: '#EF4444', fontSize: '0.72rem', marginTop: '2px', display: 'block' }}>{errors.founderContact}</span>}
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
                type="button"
                onClick={handleSubmit}
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
