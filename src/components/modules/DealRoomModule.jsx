import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Compass, TrendingUp, DollarSign, ShieldAlert, Sparkles, 
  Bookmark, CheckCircle2, ChevronRight, Award, FileText, 
  Users, Layers, ArrowUpRight, Search, SlidersHorizontal, Eye
} from 'lucide-react';
import { api } from '../../api/client';
import { DEAL_ROOM_COMPANIES } from '../../data/investmentData';

export default function DealRoomModule({ onSelectCompany }) {
  const [companies, setCompanies] = useState(DEAL_ROOM_COMPANIES);
  const [searchQuery, setSearchQuery] = useState('');
  const [sectorFilter, setSectorFilter] = useState('ALL');
  const [selectedCompany, setSelectedCompany] = useState(DEAL_ROOM_COMPANIES[0]);
  const [watchlistToast, setWatchlistToast] = useState(null);

  useEffect(() => {
    async function loadDeals() {
      try {
        const data = await api.getCompanies();
        if (data && data.length > 0) {
          setCompanies(data);
          setSelectedCompany(data[0]);
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

        {/* Quick Stats */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{
            padding: '1rem 1.4rem',
            borderRadius: 'var(--radius-lg)',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-subtle)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10B981' }}>{companies.length}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Vetted Deals</div>
          </div>
          <div style={{
            padding: '1rem 1.4rem',
            borderRadius: 'var(--radius-lg)',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-subtle)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#818CF8' }}>$27.3M</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Aggregate Pipeline</div>
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
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(320px, 1fr) minmax(360px, 1.4fr)',
        gap: '1.8rem',
        alignItems: 'start'
      }}>
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
                  boxShadow: isSelected ? '0 10px 25px -5px rgba(99, 102, 241, 0.25)' : 'none'
                }}
              >
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

                {/* Card Footer */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Health Score: <strong style={{ color: '#FBBF24' }}>{comp.healthScore}/100</strong>
                  </span>

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
                    Watchlist
                  </button>
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

              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <button
                  onClick={() => handleAddToWatchlist(selectedCompany)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '0.6rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <Bookmark size={16} />
                  Save to Pipeline
                </button>
                <button
                  onClick={() => {
                    if (onSelectCompany) onSelectCompany(selectedCompany.ticker);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '0.6rem 1.2rem',
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

            {/* 10-Dimension Completeness Radar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Investment Readiness Radar
                </h4>
                <span style={{ fontSize: '0.8rem', color: '#10B981', fontWeight: 700 }}>
                  {selectedCompany.completeness?.overall || 88}% Complete
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {[
                  { label: 'Statutory KYC & CIN', value: selectedCompany.completeness?.kyc || 90 },
                  { label: 'Financial Statements & DCF', value: selectedCompany.completeness?.financials || 95 },
                  { label: 'Funding & Round Parameters', value: selectedCompany.completeness?.funding || 100 },
                  { label: 'Virtual Data Room Documents', value: selectedCompany.completeness?.documents || 80 },
                ].map((item) => (
                  <div key={item.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.2rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{item.label}</span>
                      <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{item.value}%</span>
                    </div>
                    <div style={{ height: '6px', borderRadius: 'var(--radius-pill)', background: 'rgba(255, 255, 255, 0.06)', overflow: 'hidden' }}>
                      <div style={{ width: `${item.value}%`, height: '100%', background: '#6366F1' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
