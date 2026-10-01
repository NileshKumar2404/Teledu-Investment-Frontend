import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Compass, TrendingUp, DollarSign, ShieldAlert, Sparkles, 
  Bookmark, CheckCircle2, ChevronRight, Award, FileText, 
  Users, Layers, ArrowUpRight, Search, SlidersHorizontal, Eye,
  MessageSquare, Video, Calendar, PhoneCall, Plus, Phone, Mail,
  Zap, ExternalLink, Send, ArrowRight, Check, Briefcase, Scale, PieChart, Sliders, ShieldCheck
} from 'lucide-react';
import { api } from '../../api/client';
import { DEAL_ROOM_COMPANIES, STARTUP_INVESTMENT_CHECKLIST_TEMPLATE } from '../../data/investmentData';
import FounderConnectModal from '../common/FounderConnectModal';
import ListStartupModal from '../common/ListStartupModal';
import ExpressInterestModal from '../common/ExpressInterestModal';

export default function DealRoomModule({ onSelectCompany, activeCompany = null }) {
  // Load default companies merged with custom companies listed by founders
  const [companies, setCompanies] = useState(() => {
    let custom = [];
    try {
      const saved = localStorage.getItem('siq_deal_room_custom_companies');
      if (saved) custom = JSON.parse(saved);
    } catch (e) {}
    const customTickers = new Set(custom.map(c => c.ticker?.toUpperCase()));
    const defaults = DEAL_ROOM_COMPANIES.filter(c => !customTickers.has(c.ticker?.toUpperCase()));
    return [...custom, ...defaults];
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [sectorFilter, setSectorFilter] = useState('ALL');
  const [selectedCompany, setSelectedCompany] = useState(() => {
    let custom = [];
    try {
      const saved = localStorage.getItem('siq_deal_room_custom_companies');
      if (saved) custom = JSON.parse(saved);
    } catch (e) {}
    return custom.length > 0 ? custom[0] : DEAL_ROOM_COMPANIES[0];
  });
  const [watchlistToast, setWatchlistToast] = useState(null);

  // Modals State
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [isExpressModalOpen, setIsExpressModalOpen] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [connectModalTab, setConnectModalTab] = useState('chat'); // 'chat' | 'video' | 'schedule'
  const [scheduledMeetings, setScheduledMeetings] = useState({});
  const [inboundLeadCount, setInboundLeadCount] = useState(0);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('siq_scheduled_meetings') || '{}');
      setScheduledMeetings(saved);
    } catch (e) {}
  }, []);

  // Update inbound lead counts when selected company changes
  useEffect(() => {
    if (!selectedCompany?.ticker) return;
    try {
      const key = `siq_inbound_interests_${selectedCompany.ticker.toUpperCase()}`;
      const leads = JSON.parse(localStorage.getItem(key) || '[]');
      setInboundLeadCount(leads.length);
    } catch (e) {}
  }, [selectedCompany]);

  const handleOpenConnect = (tab = 'chat', comp = null) => {
    if (comp) {
      setSelectedCompany(comp);
    }
    setConnectModalTab(tab);
    setIsConnectModalOpen(true);
  };

  const handleOpenExpressInterest = (comp = null) => {
    if (comp) {
      setSelectedCompany(comp);
    }
    setIsExpressModalOpen(true);
  };

  const handleStartupListed = (newComp) => {
    setCompanies(prev => {
      const filtered = prev.filter(c => c.ticker.toUpperCase() !== newComp.ticker.toUpperCase());
      return [newComp, ...filtered];
    });
    setSelectedCompany(newComp);
    setWatchlistToast(`🚀 "${newComp.companyName} (${newComp.ticker})" is now live in the Deal Room! Direct investor contact enabled.`);
    setTimeout(() => setWatchlistToast(null), 5000);
  };

  const handleInterestSubmitted = (lead) => {
    setInboundLeadCount(prev => prev + 1);
    setCompanies(prev => prev.map(c => {
      if (c.ticker.toUpperCase() === selectedCompany.ticker.toUpperCase()) {
        return {
          ...c,
          inboundInquiriesCount: (c.inboundInquiriesCount || 0) + 1,
          softCommittedAmount: (c.softCommittedAmount || 0) + lead.checkSize
        };
      }
      return c;
    }));
    setWatchlistToast(`Check interest of $${lead.checkSize.toLocaleString()} logged for ${selectedCompany.companyName}!`);
    setTimeout(() => setWatchlistToast(null), 4000);
  };

  useEffect(() => {
    async function loadDeals() {
      try {
        const data = await api.getCompanies();
        if (data && data.length > 0) {
          setCompanies(prev => {
            let custom = [];
            try {
              const saved = localStorage.getItem('siq_deal_room_custom_companies');
              if (saved) custom = JSON.parse(saved);
            } catch (e) {}
            const customTickers = new Set(custom.map(c => c.ticker?.toUpperCase()));
            const backendFiltered = data.filter(c => !customTickers.has(c.ticker?.toUpperCase()));
            return [...custom, ...backendFiltered];
          });
        }
      } catch (err) {
        console.warn('Using offline deal room data', err);
      }
    }
    loadDeals();
  }, []);

  const sectors = ['ALL', 'EdTech & Education', 'Enterprise AI & Cloud', 'HealthTech & Diagnostics', 'Supply Chain & Logistics'];

  const filteredCompanies = companies.filter(c => {
    const matchesSearch = c.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.sector.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSector = sectorFilter === 'ALL' || c.sector === sectorFilter;
    return matchesSearch && matchesSector;
  });

  const handleAddToWatchlist = (comp) => {
    api.addToWatchlist(comp.ticker, 'Added from Deal Room');
    setWatchlistToast(`${comp.companyName} (${comp.ticker}) added to your Diligence Watchlist!`);
    setTimeout(() => setWatchlistToast(null), 3500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Toast Alert */}
      <AnimatePresence>
        {watchlistToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              zIndex: 2000,
              background: '#10B981',
              color: '#fff',
              padding: '0.8rem 1.4rem',
              borderRadius: 'var(--radius-md)',
              fontWeight: 700,
              fontSize: '0.85rem',
              boxShadow: '0 10px 25px rgba(16, 185, 129, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <CheckCircle2 size={16} />
            {watchlistToast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '1.5rem',
        padding: '2rem',
        borderRadius: 'var(--radius-xl)',
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(99, 102, 241, 0.12) 50%, rgba(15, 23, 42, 0.6) 100%)',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{ maxWidth: '640px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.85rem',
            borderRadius: 'var(--radius-pill)',
            background: 'rgba(16, 185, 129, 0.2)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            color: '#6EE7B7',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.05em',
            marginBottom: '0.8rem'
          }}>
            <Sparkles size={14} />
            INSTITUTIONAL DEAL FLOW • SYNDICATE & DIRECT ALLOCATION
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.6rem', letterSpacing: '-0.02em' }}>
            Deal Room & Startup Discovery
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
            Browse verified, investment-ready startups evaluated by our Institutional DCF Engine, Health Score algorithm, and 10-dimension completeness radar.
          </p>
        </div>

        {/* Founder Call to Action & Deal Flow Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', alignItems: 'flex-end' }}>
          <button
            id="list-startup-dealroom-btn"
            onClick={() => setIsListModalOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '0.8rem 1.4rem',
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              fontWeight: 800,
              fontSize: '0.88rem',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(16, 185, 129, 0.45)',
              transition: 'all 0.2s ease',
              letterSpacing: '0.01em'
            }}
          >
            <Plus size={18} strokeWidth={2.8} />
            <span>List Your Startup / Raise Capital</span>
            <span style={{
              fontSize: '0.7rem',
              background: 'rgba(255, 255, 255, 0.25)',
              padding: '0.15rem 0.5rem',
              borderRadius: '999px',
              fontWeight: 800,
              color: '#fff'
            }}>
              Get Funded
            </span>
          </button>

          {/* Quick Stats */}
          <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
            <div style={{
              padding: '0.75rem 1.2rem',
              borderRadius: 'var(--radius-lg)',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#10B981' }}>{companies.length}</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Vetted Deals</div>
            </div>
            <div style={{
              padding: '0.75rem 1.2rem',
              borderRadius: 'var(--radius-lg)',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#818CF8' }}>$27.3M</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Aggregate Pipeline</div>
            </div>
            <div style={{
              padding: '0.75rem 1.2rem',
              borderRadius: 'var(--radius-lg)',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#34D399' }}>240+</div>
              <div style={{ fontSize: '0.68rem', color: '#A7F3D0' }}>Active Angels & VCs</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        padding: '1rem 1.4rem',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--surface-card)',
        border: '1px solid var(--border-subtle)'
      }}>
        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: '1', minWidth: '240px' }}>
          <Search size={18} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search by company name, ticker, or sector..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          />
        </div>

        {/* Sector Tabs */}
        <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '2px' }}>
          {sectors.map((s) => (
            <button
              key={s}
              onClick={() => setSectorFilter(s)}
              style={{
                padding: '0.35rem 0.8rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem',
                fontWeight: 600,
                border: 'none',
                background: sectorFilter === s ? 'var(--accent)' : 'rgba(255, 255, 255, 0.05)',
                color: sectorFilter === s ? '#fff' : 'var(--text-muted)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Deals Grid & Spotlight Layout */}
      <div className="dealroom-split-grid">
        {/* Left Column: Deal Cards Catalog */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredCompanies.map((comp) => {
            const isSelected = selectedCompany?.ticker === comp.ticker;
            return (
              <div
                key={comp.ticker}
                onClick={() => setSelectedCompany(comp)}
                style={{
                  padding: '1.4rem',
                  borderRadius: 'var(--radius-lg)',
                  background: isSelected ? 'rgba(99, 102, 241, 0.12)' : 'var(--surface-card)',
                  border: isSelected ? '1.5px solid #818CF8' : '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isSelected ? '0 10px 25px -5px rgba(99, 102, 241, 0.25)' : 'none',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {comp.isCustomListing && (
                  <div style={{
                    position: 'absolute',
                    top: '0',
                    right: '0',
                    background: 'linear-gradient(135deg, #10B981, #059669)',
                    color: '#fff',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    padding: '0.2rem 0.8rem',
                    borderBottomLeftRadius: '8px',
                    letterSpacing: '0.04em'
                  }}>
                    ⚡ NEW LISTING • FOUNDER DIRECT
                  </div>
                )}

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 700 }}>
                      {comp.ticker} • {comp.stage}
                    </span>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                      {comp.companyName}
                    </h3>
                  </div>

                  {/* Recommendation Pill */}
                  <span style={{
                    padding: '0.25rem 0.65rem',
                    borderRadius: 'var(--radius-pill)',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    background: comp.recommendationColorHex ? `${comp.recommendationColorHex}25` : 'rgba(16, 185, 129, 0.2)',
                    color: comp.recommendationColorHex || '#10B981',
                    border: `1px solid ${comp.recommendationColorHex || '#10B981'}50`
                  }}>
                    {comp.recommendation}
                  </span>
                </div>

                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
                  {comp.tagline}
                </p>

                {/* Key Metrics Strip */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '0.6rem',
                  padding: '0.8rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  fontSize: '0.75rem',
                  textAlign: 'center'
                }}>
                  <div>
                    <div style={{ color: 'var(--text-muted)' }}>Target Raise</div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                      ${(comp.fundingRequired || 0).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-muted)' }}>Valuation</div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                      ${((comp.valuation || 0) / 1000000).toFixed(1)}M
                    </div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-muted)' }}>Price Upside</div>
                    <div style={{ fontWeight: 700, color: '#10B981', marginTop: '2px' }}>
                      +{comp.priceUpsidePercent}%
                    </div>
                  </div>
                </div>

                {/* Soft-Commitment Progress Meter */}
                {comp.fundingRequired > 0 && (
                  <div style={{ marginTop: '0.8rem' }}>
                    {(() => {
                      const softAmount = comp.softCommittedAmount || Math.round(comp.fundingRequired * 0.45);
                      const pct = Math.min(100, Math.round((softAmount / comp.fundingRequired) * 100));
                      return (
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '3px' }}>
                            <span style={{ color: '#34D399', fontWeight: 700 }}>
                              🔥 ${softAmount.toLocaleString()} Soft-Committed
                            </span>
                            <span style={{ color: 'var(--text-muted)' }}>
                              {pct}% of ${(comp.fundingRequired).toLocaleString()}
                            </span>
                          </div>
                          <div style={{ height: '4px', borderRadius: '999px', background: 'rgba(255, 255, 255, 0.08)', overflow: 'hidden' }}>
                            <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #10B981, #34D399)' }} />
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Card Footer with Direct Channels */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', flexWrap: 'wrap', gap: '6px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Health Score: <strong style={{ color: '#FBBF24' }}>{comp.healthScore}/100</strong>
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {comp.founderWhatsApp && (
                      <a
                        href={`https://wa.me/${comp.founderWhatsApp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${comp.founderName}, I'm reviewing ${comp.companyName} on StartupIQ Deal Room.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                          background: 'rgba(37, 211, 102, 0.15)',
                          border: '1px solid rgba(37, 211, 102, 0.35)',
                          color: '#25D366',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '0.28rem 0.55rem',
                          borderRadius: 'var(--radius-sm)',
                          textDecoration: 'none'
                        }}
                        title={`WhatsApp chat with ${comp.founderName}`}
                      >
                        <Phone size={11} /> WhatsApp
                      </a>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenExpressInterest(comp);
                      }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.25))',
                        border: '1px solid rgba(16, 185, 129, 0.4)',
                        color: '#34D399',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        padding: '0.28rem 0.55rem',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer'
                      }}
                      title="Express Check Interest / Submit Soft Commitment"
                    >
                      <DollarSign size={11} /> Check
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenConnect('chat', comp);
                      }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: 'rgba(16, 185, 129, 0.12)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        color: '#34D399',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '0.28rem 0.55rem',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer'
                      }}
                      title={`Talk with ${comp.founderName || 'Founder'}`}
                    >
                      <MessageSquare size={11} /> Talk
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToWatchlist(comp);
                      }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--accent)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      <Bookmark size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Selected Company Institutional Valuation Dossier */}
        {selectedCompany && (
          <div style={{
            padding: '2rem',
            borderRadius: 'var(--radius-xl)',
            background: 'var(--surface-card)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.8rem',
            position: 'sticky',
            top: '20px'
          }}>
            {/* Dossier Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                  <span style={{
                    padding: '0.2rem 0.6rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--accent)',
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: '0.75rem'
                  }}>
                    {selectedCompany.ticker}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {selectedCompany.sector} • Founded by {selectedCompany.founderName}
                  </span>
                </div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {selectedCompany.companyName}
                </h2>
              </div>

              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <button
                  id="express-interest-header-btn"
                  onClick={() => handleOpenExpressInterest(selectedCompany)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '0.6rem 1.1rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'linear-gradient(135deg, #10B981, #059669)',
                    border: 'none',
                    color: '#fff',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.45)',
                    transition: 'all 0.2s ease'
                  }}
                  title="Express Check Interest / Submit Allocation"
                >
                  <DollarSign size={15} />
                  Express Interest ($)
                </button>

                <button
                  id="connect-founder-btn"
                  onClick={() => handleOpenConnect('chat')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '7px',
                    padding: '0.6rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.22), rgba(5, 150, 105, 0.35))',
                    border: '1px solid #10B981',
                    color: '#34D399',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 0 16px rgba(16, 185, 129, 0.25)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#10B981',
                    boxShadow: '0 0 8px #10B981'
                  }} />
                  <MessageSquare size={15} />
                  Connect with Founder
                </button>

                <button
                  id="quick-video-btn"
                  onClick={() => handleOpenConnect('video')}
                  title="Instant 1-Click Video Call (Google Meet / Zoom)"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '0.6rem 0.9rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(59, 130, 246, 0.14)',
                    border: '1px solid rgba(59, 130, 246, 0.35)',
                    color: '#60A5FA',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <Video size={15} />
                  Video Call
                </button>

                <button
                  id="schedule-call-btn"
                  onClick={() => handleOpenConnect('schedule')}
                  title="Schedule Diligence Deep-Dive or Term Sheet Meeting"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '0.6rem 0.9rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(139, 92, 246, 0.14)',
                    border: '1px solid rgba(139, 92, 246, 0.35)',
                    color: '#A78BFA',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <Calendar size={15} />
                  Schedule
                </button>

                <button
                  onClick={() => handleAddToWatchlist(selectedCompany)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '0.6rem 0.9rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <Bookmark size={15} />
                  Save
                </button>

                <button
                  onClick={() => {
                    if (onSelectCompany) onSelectCompany(selectedCompany.ticker);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '0.6rem 1.1rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'linear-gradient(135deg, #10B981, #059669)',
                    color: '#fff',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                  }}
                >
                  Cap Table & Ledger <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* DIRECT FOUNDER CONTACT CHANNELS & ALLOCATION HUB */}
            <div style={{
              padding: '1.25rem 1.4rem',
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(99, 102, 241, 0.08) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #10B981, #3B82F6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: '1rem',
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
                  }}>
                    {selectedCompany.founderName ? selectedCompany.founderName.charAt(0) : 'F'}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {selectedCompany.founderName || 'Founder & CEO'}
                      </span>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '999px',
                        background: 'rgba(16, 185, 129, 0.2)',
                        border: '1px solid rgba(16, 185, 129, 0.4)',
                        color: '#34D399',
                        fontSize: '0.68rem',
                        fontWeight: 700
                      }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 6px #10B981' }} />
                        Verified Founder Line
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {selectedCompany.founderRole || 'Founder & CEO'} • Direct Contact Enabled
                    </div>
                  </div>
                </div>

                {/* Direct Action Badges (WhatsApp & Direct Mail) */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {selectedCompany.founderWhatsApp ? (
                    <a
                      href={`https://wa.me/${selectedCompany.founderWhatsApp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${selectedCompany.founderName}, I'm reviewing ${selectedCompany.companyName} on StartupIQ Deal Room ($${(selectedCompany.fundingRequired || 0).toLocaleString()} round). I would like to discuss participating.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '0.55rem 0.95rem',
                        borderRadius: 'var(--radius-md)',
                        background: '#25D366',
                        color: '#000',
                        fontWeight: 800,
                        fontSize: '0.78rem',
                        textDecoration: 'none',
                        boxShadow: '0 4px 12px rgba(37, 211, 102, 0.35)'
                      }}
                    >
                      <Phone size={13} strokeWidth={2.6} />
                      <span>WhatsApp Founder ({selectedCompany.founderWhatsApp})</span>
                    </a>
                  ) : null}

                  {selectedCompany.founderEmail ? (
                    <a
                      href={`mailto:${selectedCompany.founderEmail}?subject=${encodeURIComponent(`Investment Interest in ${selectedCompany.companyName} (${selectedCompany.ticker})`)}&body=${encodeURIComponent(`Hello ${selectedCompany.founderName},\n\nI am reviewing your ${selectedCompany.stage || 'active'} round on StartupIQ Deal Room. We would like to schedule a 20-minute diligence call.\n\nBest regards,\nAccredited Investor`)}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '0.55rem 0.9rem',
                        borderRadius: 'var(--radius-md)',
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '0.78rem',
                        textDecoration: 'none'
                      }}
                    >
                      <Mail size={13} />
                      <span>Direct Email</span>
                    </a>
                  ) : null}

                  {selectedCompany.pitchDeckUrl ? (
                    <a
                      href={selectedCompany.pitchDeckUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '0.55rem 0.85rem',
                        borderRadius: 'var(--radius-md)',
                        background: 'rgba(99, 102, 241, 0.15)',
                        border: '1px solid rgba(129, 140, 248, 0.35)',
                        color: '#A5B4FC',
                        fontWeight: 700,
                        fontSize: '0.78rem',
                        textDecoration: 'none'
                      }}
                    >
                      <FileText size={13} /> Pitch Deck
                    </a>
                  ) : null}
                </div>
              </div>

              {/* Round Momentum & Syndicate Soft-Commitment Gauge */}
              {selectedCompany.fundingRequired > 0 && (
                <div style={{
                  padding: '0.8rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}>
                  {(() => {
                    const softAmount = selectedCompany.softCommittedAmount || Math.round(selectedCompany.fundingRequired * 0.45);
                    const pct = Math.min(100, Math.round((softAmount / selectedCompany.fundingRequired) * 100));
                    const leads = selectedCompany.inboundInquiriesCount || inboundLeadCount || 3;
                    return (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
                          <span style={{ color: '#34D399', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                            <Zap size={14} /> ${softAmount.toLocaleString()} Soft-Committed ({pct}% of ${(selectedCompany.fundingRequired).toLocaleString()} Ask)
                          </span>
                          <span style={{ color: '#A5B4FC', fontWeight: 700 }}>
                            🔥 {leads} Accredited Investors Inquired
                          </span>
                        </div>
                        <div style={{ height: '6px', borderRadius: '999px', background: 'rgba(255, 255, 255, 0.08)', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #10B981 0%, #34D399 70%, #60A5FA 100%)' }} />
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Founder Presence & Scheduled Meeting Banner */}
            {(() => {
              const activeBooking = scheduledMeetings[selectedCompany.ticker];
              return (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1.1rem',
                  borderRadius: 'var(--radius-md)',
                  background: activeBooking 
                    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.16), rgba(5, 150, 105, 0.08))' 
                    : 'rgba(255, 255, 255, 0.03)',
                  border: activeBooking 
                    ? '1px solid rgba(16, 185, 129, 0.38)' 
                    : '1px solid var(--border-subtle)',
                  flexWrap: 'wrap',
                  gap: '0.8rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #3B82F6, #10B981)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontWeight: 800,
                      fontSize: '0.85rem'
                    }}>
                      {selectedCompany.founderName ? selectedCompany.founderName.charAt(0) : 'F'}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                          {selectedCompany.founderName}
                        </span>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '999px',
                          background: 'rgba(16, 185, 129, 0.15)',
                          color: '#34D399',
                          fontSize: '0.7rem',
                          fontWeight: 700
                        }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 6px #10B981' }} />
                          Founder Active • AI Twin Online
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {activeBooking 
                          ? `📅 Diligence Call Booked: ${activeBooking.dateLabel || activeBooking.date} at ${activeBooking.time} (${activeBooking.platform === 'zoom' ? 'Zoom' : 'Google Meet'})`
                          : 'Institutional founder line: Verified Founder Profile • Instant response available'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {activeBooking ? (
                      <a
                        href={activeBooking.meetingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '0.45rem 0.85rem',
                          borderRadius: 'var(--radius-sm)',
                          background: '#10B981',
                          color: '#041d14',
                          fontWeight: 800,
                          fontSize: '0.75rem',
                          textDecoration: 'none',
                          boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                        }}
                      >
                        <Video size={13} /> Join Call Room
                      </a>
                    ) : null}
                    <button
                      onClick={() => handleOpenConnect('chat')}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '0.45rem 0.85rem',
                        borderRadius: 'var(--radius-sm)',
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: 'var(--text-primary)',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        cursor: 'pointer'
                      }}
                    >
                      <MessageSquare size={13} /> Open Deal Room Chat
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* DCF Valuation Matrix Card */}
            <div style={{
              padding: '1.5rem',
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(16, 185, 129, 0.06) 100%)',
              border: '1px solid rgba(99, 102, 241, 0.25)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Award size={18} color="#818CF8" />
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Institutional DCF Engine Valuation
                  </span>
                </div>
                <span style={{
                  padding: '0.2rem 0.6rem',
                  borderRadius: 'var(--radius-pill)',
                  background: selectedCompany.recommendationColorHex ? `${selectedCompany.recommendationColorHex}25` : 'rgba(16, 185, 129, 0.2)',
                  color: selectedCompany.recommendationColorHex || '#10B981',
                  fontSize: '0.75rem',
                  fontWeight: 800
                }}>
                  {selectedCompany.recommendation}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>DCF Enterprise Value</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                    ${((selectedCompany.dcfEnterpriseValue || 0) / 1000000).toFixed(2)}M
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Fair Share Price</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#10B981', marginTop: '2px' }}>
                    ${selectedCompany.fairSharePrice || 58.5}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Current Asking Price</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                    ${selectedCompany.currentSharePrice || 50.0}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '1rem', paddingTop: '0.8rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Implied Price Upside:</span>
                <span style={{ color: '#34D399', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <ArrowUpRight size={14} />
                  +{selectedCompany.priceUpsidePercent}% Potential Appreciation
                </span>
              </div>
            </div>

            {/* Funding Round Parameters */}
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.8rem' }}>
                Active Round Terms
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.8rem', fontSize: '0.85rem' }}>
                <div style={{ padding: '0.8rem', borderRadius: 'var(--radius-md)', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Equity Offered</div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>{selectedCompany.equityOffered}%</div>
                </div>
                <div style={{ padding: '0.8rem', borderRadius: 'var(--radius-md)', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Minimum Check Size</div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>${(selectedCompany.minInvestment || 0).toLocaleString()}</div>
                </div>
                <div style={{ padding: '0.8rem', borderRadius: 'var(--radius-md)', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Annual Revenue Run-Rate</div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>${(selectedCompany.currentRevenue || 0).toLocaleString()}</div>
                </div>
                <div style={{ padding: '0.8rem', borderRadius: 'var(--radius-md)', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>YoY Revenue Growth</div>
                  <div style={{ fontWeight: 700, color: '#10B981', marginTop: '2px' }}>+{selectedCompany.revenueGrowthRate}%</div>
                </div>
              </div>
            </div>

            {/* STARTUP INVESTMENT CHECKLIST — 11-POINT INSTITUTIONAL DUE DILIGENCE */}
            <div style={{
              padding: '1.4rem',
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(16, 185, 129, 0.05) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.28)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.1rem'
            }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.8rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                    <ShieldCheck size={18} color="#34D399" />
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                      Startup Investment Checklist
                    </h4>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Institutional diligence package verifying business, economics, governance, and compliance.
                  </div>
                </div>

                <span style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: 'var(--radius-pill)',
                  background: 'rgba(16, 185, 129, 0.2)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  color: '#34D399',
                  fontSize: '0.78rem',
                  fontWeight: 800
                }}>
                  {selectedCompany.completeness?.overall || 95}% Diligence Ready
                </span>
              </div>

              {/* Why Investors Need This Banner */}
              <div style={{
                padding: '0.75rem 0.9rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255, 255, 255, 0.03)',
                borderLeft: '3px solid #10B981',
                fontSize: '0.75rem',
                color: '#CBD5E1',
                lineHeight: 1.45
              }}>
                <strong style={{ color: '#34D399' }}>Investor Verification Standard:</strong> The investor needs to understand what the startup does, whether it can make money, who owns it, how the investment will be used, and whether the company is legally and financially genuine.
              </div>

              {/* Use of Funds Allocation Breakdown Widget */}
              {selectedCompany.useOfFunds && (
                <div style={{
                  padding: '0.9rem 1.1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(15, 23, 42, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.06)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#fff' }}>
                      💰 Use of Funds Breakdown (${(selectedCompany.fundingRequired || 0).toLocaleString()} Ask):
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 700 }}>
                      100% Capital Allocated
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.6rem', textAlign: 'center' }}>
                    {[
                      { label: 'Product & R&D', pct: selectedCompany.useOfFunds.rnd || 40, color: '#3B82F6' },
                      { label: 'Marketing & GTM', pct: selectedCompany.useOfFunds.marketing || 30, color: '#10B981' },
                      { label: 'Talent & Hiring', pct: selectedCompany.useOfFunds.hiring || 20, color: '#8B5CF6' },
                      { label: 'Working Capital', pct: selectedCompany.useOfFunds.operations || 10, color: '#F59E0B' }
                    ].map(cat => (
                      <div key={cat.label} style={{ padding: '0.5rem', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.03)' }}>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{cat.label}</div>
                        <div style={{ fontSize: '0.92rem', fontWeight: 800, color: cat.color, marginTop: '2px' }}>{cat.pct}%</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                          ${Math.round(((selectedCompany.fundingRequired || 0) * cat.pct) / 100).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 11 Checklist Items Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.65rem' }}>
                {STARTUP_INVESTMENT_CHECKLIST_TEMPLATE.map(item => {
                  const itemData = selectedCompany.investmentChecklist?.[item.id] || { status: 'VERIFIED', label: item.shortDesc };
                  return (
                    <div
                      key={item.id}
                      style={{
                        padding: '0.65rem 0.8rem',
                        borderRadius: 'var(--radius-sm)',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.6rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: 'rgba(16, 185, 129, 0.15)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#10B981',
                          flexShrink: 0
                        }}>
                          <Check size={12} strokeWidth={3} />
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.label}
                          </div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {itemData.label || item.shortDesc}
                          </div>
                        </div>
                      </div>

                      <span style={{
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        padding: '0.15rem 0.45rem',
                        borderRadius: '4px',
                        background: 'rgba(16, 185, 129, 0.15)',
                        color: '#34D399',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        flexShrink: 0
                      }}>
                        {itemData.status || 'VERIFIED'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Founder Direct Connect Hub (Chat, 1-Click Video Call & Diligence Scheduler) */}
      <FounderConnectModal
        isOpen={isConnectModalOpen}
        onClose={() => {
          setIsConnectModalOpen(false);
          try {
            const saved = JSON.parse(localStorage.getItem('siq_scheduled_meetings') || '{}');
            setScheduledMeetings(saved);
          } catch (e) {}
        }}
        company={selectedCompany}
        currentUser={{ fullName: 'Victoria Sterling (General Partner)' }}
        initialTab={connectModalTab}
      />

      {/* Founder Pitch & Capital Raise Modal ("List Your Startup") */}
      <ListStartupModal
        isOpen={isListModalOpen}
        onClose={() => setIsListModalOpen(false)}
        onStartupListed={handleStartupListed}
        activeCompany={activeCompany}
      />

      {/* Investor Express Check Interest & Soft Commitment Modal */}
      <ExpressInterestModal
        isOpen={isExpressModalOpen}
        onClose={() => setIsExpressModalOpen(false)}
        company={selectedCompany}
        currentUser={{ fullName: 'Victoria Sterling (General Partner)' }}
        onInterestSubmitted={handleInterestSubmitted}
      />
    </div>
  );
}
