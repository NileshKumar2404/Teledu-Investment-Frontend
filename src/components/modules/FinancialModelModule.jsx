import React, { useState, useMemo, useEffect } from 'react';
import { 
  TrendingUp, DollarSign, Calendar, AlertCircle, RefreshCw, 
  Layers, ShieldCheck, Zap, Activity, Info, BarChart3, ChevronRight, 
  Sliders, ArrowUpRight, ArrowDownRight, Download, Check, Sparkles, 
  Filter, HelpCircle, Eye, Play, Award, PieChart, ShieldAlert
} from 'lucide-react';
import { api } from '../../api/client';

export default function FinancialModelModule({ company = {} }) {
  // Horizon and View Mode: 'runway24' | 'dcf5yr' | 'montecarlo' | 'sensitivity'
  const [activeView, setActiveView] = useState('runway24');

  // Core Operating & Financial Assumptions
  const [params, setParams] = useState({
    startingCash: company.cashAvailable || 250000,
    startingMrr: company.currentRevenue ? Math.round(company.currentRevenue / 12) : 28000,
    monthlyGrowthRate: 9.5, // % base monthly compounding
    grossMargin: company.grossMargin || 75, // %
    monthlyFixedCosts: company.monthlyBurn || 24000, // $/mo base operating burn
    wacc: 13.5, // % Weighted Average Cost of Capital
    terminalGrowthRate: 3.0, // % Perpetual terminal growth
    taxRate: 25, // % Corporate tax rate
    sharesOutstanding: 100000, // Total common/preferred shares
    volatility: 18, // % ML Stochastic volatility
    seasonalityStrength: 8, // % Cyclical amplitude
  });

  // Toggleable Real-World Shock Events & Capital Milestones
  const [milestones, setMilestones] = useState({
    seedRound: true,       // +$500k at Month 3
    marketingPush: true,   // -$60k cash at M5 (dip), compounds future revenue
    hiringExpansion: true, // Key engineering & executive hires at M6
    enterpriseDeal: true,  // +$120k upfront cash at M9
    techCapex: false,      // -$45k server / infrastructure outlay at M14
    churnShock: false      // Macro advertising or customer churn shock
  });

  // Interactive Hover State on Chart
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [exportedToast, setExportedToast] = useState(false);

  // Sync params if company changes
  useEffect(() => {
    if (company && company.ticker) {
      setParams(prev => ({
        ...prev,
        startingCash: company.cashAvailable || prev.startingCash,
        startingMrr: company.currentRevenue ? Math.round(company.currentRevenue / 12) : prev.startingMrr,
        monthlyFixedCosts: company.monthlyBurn || prev.monthlyFixedCosts,
        grossMargin: company.grossMargin || prev.grossMargin,
      }));
    }
  }, [company?.ticker]);

  // =========================================================================
  // 1. HORIZON A: 24-MONTH OPERATIONAL RUNWAY WITH REALISTIC DIPS & PEAKS
  // =========================================================================
  const runwayData = useMemo(() => {
    const months = [];
    let currentCash = params.startingCash;
    let currentMrr = params.startingMrr;
    let fixedBurn = params.monthlyFixedCosts;
    let arLag = 0; // Accounts receivable collections lag buffer

    let lowestCash = currentCash;
    let lowestCashMonth = 1;
    let breakevenMonth = null;

    for (let m = 1; m <= 24; m++) {
      // 1. Natural Growth Decay with Seasonality Cycles (Q1 dip, Q2 ramp, Q4 surge)
      const baseGrowth = (params.monthlyGrowthRate * Math.max(0.4, 1 - (m - 1) * 0.022)) / 100;
      const seasonalFactor = 1 + ((params.seasonalityStrength / 100) * Math.sin(((m - 2) * Math.PI) / 6));
      
      currentMrr = m === 1 ? currentMrr : currentMrr * (1 + baseGrowth * seasonalFactor);

      // 2. Shock Event Injections (Ups & Dips)
      let oneTimeCashDelta = 0;
      let eventNotice = null;
      let isDip = false;
      let isPeak = false;

      // Seed Funding Round (Month 3: Major Cash Surge)
      if (m === 3 && milestones.seedRound) {
        const seedAmount = company.fundingRequired || 500000;
        oneTimeCashDelta += seedAmount;
        eventNotice = `+$${(seedAmount / 1000).toFixed(0)}k Seed Tranche`;
        isPeak = true;
      }

      // Q2 Marketing Sprint (Month 5: Sharp Cash Dip -> Compounding MRR Lift)
      if (m === 5 && milestones.marketingPush) {
        oneTimeCashDelta -= 65000;
        currentMrr += 9200; // Customer acquisition bump
        eventNotice = `-$65k Marketing Dip (Acquisition Sprint)`;
        isDip = true;
      }

      // Executive & Engineering Hiring Wave (Month 6: Step-Up in Fixed Burn)
      if (m === 6 && milestones.hiringExpansion) {
        fixedBurn += 14000;
        oneTimeCashDelta -= 20000; // Recruitment & signing fees
        eventNotice = `Team Expansion (+ $14k/mo Burn)`;
        isDip = true;
      }

      // Enterprise Deal Close (Month 9: Upfront Cash Inflow)
      if (m === 9 && milestones.enterpriseDeal) {
        oneTimeCashDelta += 135000;
        currentMrr += 18000;
        eventNotice = `+$135k Enterprise Deal (Annual Upfront)`;
        isPeak = true;
      }

      // Cloud Infrastructure & CapEx (Month 14: Capital Expenditure Dip)
      if (m === 14 && milestones.techCapex) {
        oneTimeCashDelta -= 48000;
        eventNotice = `-$48k Cloud Infra & Hardware CapEx`;
        isDip = true;
      }

      // Churn / Ad Inflation Shock (Month 11: Revenue Dips)
      if (m === 11 && milestones.churnShock) {
        currentMrr *= 0.88; // 12% revenue contraction
        eventNotice = `Macro Shock: -12% Churn Hit`;
        isDip = true;
      }

      // 3. Financial Statements & Cash Flow Calculations
      const monthlyRevenue = Math.round(currentMrr);
      const grossProfit = Math.round(monthlyRevenue * (params.grossMargin / 100));
      const totalOpEx = Math.round(fixedBurn + (monthlyRevenue * 0.08)); // Fixed + 8% variable hosting/support
      const netOperatingIncome = grossProfit - totalOpEx;

      // Working capital lag: 15% of revenue collected in following month
      const collections = Math.round((monthlyRevenue * 0.85) + arLag);
      arLag = monthlyRevenue * 0.15;

      const monthlyNetCashFlow = collections - totalOpEx + oneTimeCashDelta;
      currentCash += monthlyNetCashFlow;

      // Track Cash Trough (J-Curve Lowest Point)
      if (currentCash < lowestCash) {
        lowestCash = currentCash;
        lowestCashMonth = m;
      }

      // Check Breakeven Point
      if (netOperatingIncome >= 0 && breakevenMonth === null) {
        breakevenMonth = m;
      }

      months.push({
        month: m,
        label: `M${m}`,
        revenue: monthlyRevenue,
        grossProfit,
        opEx: totalOpEx,
        netIncome: netOperatingIncome,
        cashBalance: Math.round(currentCash),
        netCashFlow: monthlyNetCashFlow,
        eventNotice,
        isDip,
        isPeak
      });
    }

    return {
      months,
      lowestCash: Math.round(lowestCash),
      lowestCashMonth,
      breakevenMonth,
      endingCash: months[months.length - 1].cashBalance,
      runwayDepletedMonth: months.find(m => m.cashBalance <= 0)?.month || null
    };
  }, [params, milestones, company?.fundingRequired]);

  // =========================================================================
  // 2. HORIZON B: 5-YEAR INSTITUTIONAL DCF & FREE CASH FLOW TO FIRM (FCFF)
  // =========================================================================
  const dcfModel = useMemo(() => {
    const y1Rev = runwayData.months.slice(0, 12).reduce((s, r) => s + r.revenue, 0);

    // Realistic venture hyper-growth scaling curve
    const growthRates = [0, 0.65, 0.45, 0.32, 0.22]; // Y1 baseline, Y2 (+65%), Y3 (+45%), Y4 (+32%), Y5 (+22%)
    const grossMargins = [params.grossMargin, params.grossMargin + 2, params.grossMargin + 4, params.grossMargin + 5, params.grossMargin + 6];

    const years = [];
    let prevRev = y1Rev;
    let cumulativePvFcff = 0;

    for (let t = 1; t <= 5; t++) {
      const yearRevenue = t === 1 ? prevRev : Math.round(prevRev * (1 + growthRates[t - 1]));
      prevRev = yearRevenue;

      const gm = Math.min(84, grossMargins[t - 1]) / 100;
      const grossProfit = Math.round(yearRevenue * gm);

      // Operating leverage: S&M and R&D % of revenue decays as startup scales
      const smRate = Math.max(0.20, 0.42 - (t - 1) * 0.05);
      const rdRate = Math.max(0.14, 0.26 - (t - 1) * 0.03);
      const gaRate = Math.max(0.07, 0.12 - (t - 1) * 0.015);

      const opEx = Math.round(yearRevenue * (smRate + rdRate + gaRate));
      const ebit = grossProfit - opEx;
      const taxes = Math.max(0, Math.round(ebit * (params.taxRate / 100)));
      const nopat = ebit - taxes;

      const da = Math.round(yearRevenue * 0.035); // D&A addback
      const capEx = Math.round(yearRevenue * 0.045); // Capital expenditures
      const changeNwc = Math.round(yearRevenue * 0.03); // Working capital reserve

      // Unlevered Free Cash Flow to Firm (FCFF)
      const fcff = nopat + da - capEx - changeNwc;

      // Mid-Year Discount Factor: 1 / (1 + WACC)^(t - 0.5)
      const discountFactor = 1 / Math.pow(1 + params.wacc / 100, t - 0.5);
      const pvFcff = Math.round(fcff * discountFactor);
      cumulativePvFcff += pvFcff;

      years.push({
        year: t,
        yearLabel: `Year ${t}`,
        revenue: yearRevenue,
        revenueGrowth: t === 1 ? Math.round(company.revenueGrowthRate || 68) : Math.round(growthRates[t - 1] * 100),
        grossProfit,
        grossMargin: Math.round(gm * 100),
        opEx,
        ebit,
        ebitda: ebit + da,
        taxes,
        nopat,
        da,
        capEx,
        changeNwc,
        fcff,
        discountFactor: Number(discountFactor.toFixed(3)),
        pvFcff
      });
    }

    // Terminal Value Calculation (Gordon Growth Model)
    const y5Fcff = years[4].fcff;
    const g = params.terminalGrowthRate / 100;
    const waccDec = params.wacc / 100;
    const terminalSpread = Math.max(0.03, waccDec - g);

    const terminalValue = (y5Fcff * (1 + g)) / terminalSpread;
    const pvTerminalValue = terminalValue / Math.pow(1 + waccDec, 5);

    // Exit Multiple Cross-Check (14x Year 5 EBITDA)
    const y5Ebitda = years[4].ebitda;
    const exitMultipleEv = (y5Ebitda * 14) / Math.pow(1 + waccDec, 5);

    // Enterprise Value & Equity Value Waterfall
    const enterpriseValue = Math.round(cumulativePvFcff + pvTerminalValue);
    const netDebt = 0; // Net cash positive startup
    const equityValue = Math.round(enterpriseValue + params.startingCash - netDebt);

    const fairSharePrice = Number((equityValue / params.sharesOutstanding).toFixed(2));
    const currentPrice = company.currentSharePrice || 50.0;
    const upside = Number((((fairSharePrice - currentPrice) / currentPrice) * 100).toFixed(1));

    return {
      years,
      cumulativePvFcff,
      terminalValue: Math.round(terminalValue),
      pvTerminalValue: Math.round(pvTerminalValue),
      exitMultipleEv: Math.round(exitMultipleEv),
      enterpriseValue,
      equityValue,
      fairSharePrice,
      currentPrice,
      upside,
      terminalValuePercent: Math.round((pvTerminalValue / enterpriseValue) * 100)
    };
  }, [runwayData, params, company?.revenueGrowthRate, company?.currentSharePrice]);

  // =========================================================================
  // 3. HORIZON C: MACHINE LEARNING MONTE CARLO STOCHASTIC SIMULATION (1,000 RUNS)
  // =========================================================================
  const monteCarloData = useMemo(() => {
    const months = 24;
    const runs = 500; // 500 stochastic simulation paths
    const vol = (params.volatility / 100) / Math.sqrt(12); // Monthly volatility
    const drift = (params.monthlyGrowthRate / 100) - 0.5 * Math.pow(vol, 2);

    // Matrix: simulations[month][run]
    const monthlySims = Array.from({ length: months }, () => []);

    for (let r = 0; r < runs; r++) {
      let simMrr = params.startingMrr;
      for (let m = 0; m < months; m++) {
        // Box-Muller normal distribution random variate
        const u1 = Math.max(1e-6, Math.random());
        const u2 = Math.random();
        const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);

        // Geometric Brownian Motion step
        simMrr = simMrr * Math.exp(drift + vol * z);
        monthlySims[m].push(Math.round(simMrr));
      }
    }

    // Extract Percentiles for Confidence Envelopes
    const result = monthlySims.map((arr, m) => {
      arr.sort((a, b) => a - b);
      const p10 = arr[Math.floor(runs * 0.10)]; // Bear Case (10th percentile)
      const p25 = arr[Math.floor(runs * 0.25)];
      const p50 = arr[Math.floor(runs * 0.50)]; // Median Base Case
      const p75 = arr[Math.floor(runs * 0.75)];
      const p90 = arr[Math.floor(runs * 0.90)]; // Bull Case (90th percentile)
      const baseExpected = runwayData.months[m]?.revenue || p50;

      return {
        month: m + 1,
        label: `M${m + 1}`,
        p10,
        p25,
        p50,
        p75,
        p90,
        baseExpected
      };
    });

    return result;
  }, [params, runwayData]);

  // =========================================================================
  // 4. HORIZON D: 2D WACC & TERMINAL GROWTH SENSITIVITY MATRIX HEATMAP
  // =========================================================================
  const sensitivityMatrix = useMemo(() => {
    const waccValues = [10.5, 12.0, 13.5, 15.0, 16.5]; // Discount rates
    const gValues = [2.0, 2.5, 3.0, 3.5, 4.0];         // Terminal growth rates

    const y5Fcff = dcfModel.years[4].fcff;
    const baseCumulativePv = dcfModel.cumulativePvFcff;

    const rows = waccValues.map(w => {
      const cols = gValues.map(gVal => {
        const spread = Math.max(0.02, (w / 100) - (gVal / 100));
        const tv = (y5Fcff * (1 + gVal / 100)) / spread;
        const pvTv = tv / Math.pow(1 + w / 100, 5);
        const ev = Math.round(baseCumulativePv + pvTv);
        const eqVal = ev + params.startingCash;
        const sharePrice = Number((eqVal / params.sharesOutstanding).toFixed(2));
        const upside = Number((((sharePrice - dcfModel.currentPrice) / dcfModel.currentPrice) * 100).toFixed(1));

        return {
          wacc: w,
          growth: gVal,
          ev,
          sharePrice,
          upside,
          isCurrent: w === params.wacc && gVal === params.terminalGrowthRate
        };
      });
      return { wacc: w, cols };
    });

    return { waccValues, gValues, rows };
  }, [dcfModel, params.startingCash, params.sharesOutstanding, params.wacc, params.terminalGrowthRate]);

  // =========================================================================
  // EXPORT TO CSV FUNCTION
  // =========================================================================
  const handleExportCsv = () => {
    const headers = ["Year", "Revenue ($)", "Growth (%)", "Gross Profit ($)", "EBITDA ($)", "EBIT ($)", "NOPAT ($)", "CapEx ($)", "FCFF ($)", "PV of FCFF ($)"];
    const rows = dcfModel.years.map(y => [
      y.yearLabel,
      y.revenue,
      `${y.revenueGrowth}%`,
      y.grossProfit,
      y.ebitda,
      y.ebit,
      y.nopat,
      y.capEx,
      y.fcff,
      y.pvFcff
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + 
      [headers.join(","), ...rows.map(r => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${company.ticker || "DEAL"}_5Yr_DCF_Model.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportedToast(true);
    setTimeout(() => setExportedToast(false), 3000);
  };

  // =========================================================================
  // SVG CHART COORDINATES & SCALING
  // =========================================================================
  const svgWidth = 840;
  const svgHeight = 260;
  const padL = 60;
  const padR = 30;
  const padT = 30;
  const padB = 40;
  const plotW = svgWidth - padL - padR;
  const plotH = svgHeight - padT - padB;

  // Scales for 24-Month Runway Chart
  const runwayMaxVal = Math.max(
    ...runwayData.months.map(m => Math.max(m.revenue, m.cashBalance)),
    100000
  );
  const runwayMinVal = Math.min(
    0,
    ...runwayData.months.map(m => Math.min(m.revenue, m.cashBalance))
  );
  const runwayRange = runwayMaxVal - runwayMinVal || 1;

  const getRunwayX = (idx) => padL + (idx / 23) * plotW;
  const getRunwayY = (val) => padT + plotH - ((val - runwayMinVal) / runwayRange) * plotH;

  const pointsRev = runwayData.months.map((m, idx) => `${getRunwayX(idx)},${getRunwayY(m.revenue)}`).join(' ');
  const pointsCash = runwayData.months.map((m, idx) => `${getRunwayX(idx)},${getRunwayY(m.cashBalance)}`).join(' ');

  // Scales for Monte Carlo Fan Chart
  const mcMax = Math.max(...monteCarloData.map(d => d.p90), 100000);
  const mcMin = Math.min(...monteCarloData.map(d => d.p10), 0);
  const mcRange = mcMax - mcMin || 1;
  const getMcX = (idx) => padL + (idx / 23) * plotW;
  const getMcY = (val) => padT + plotH - ((val - mcMin) / mcRange) * plotH;

  const areaP90P10 = [
    ...monteCarloData.map((d, i) => `${getMcX(i)},${getMcY(d.p90)}`),
    ...monteCarloData.slice().reverse().map((d, i) => `${getMcX(23 - i)},${getMcY(d.p10)}`)
  ].join(' ');

  const areaP75P25 = [
    ...monteCarloData.map((d, i) => `${getMcX(i)},${getMcY(d.p75)}`),
    ...monteCarloData.slice().reverse().map((d, i) => `${getMcX(23 - i)},${getMcY(d.p25)}`)
  ].join(' ');

  const pointsP50 = monteCarloData.map((d, i) => `${getMcX(i)},${getMcY(d.p50)}`).join(' ');
  const pointsExpected = monteCarloData.map((d, i) => `${getMcX(i)},${getMcY(d.baseExpected)}`).join(' ');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem', position: 'relative' }}>
      {/* Toast Notification */}
      {exportedToast && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          padding: '0.8rem 1.4rem',
          borderRadius: '0.65rem',
          background: '#10B981',
          color: '#041d14',
          fontWeight: 800,
          fontSize: '0.86rem',
          boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Check size={16} /> 5-Year DCF Financial Schedule exported to CSV!
        </div>
      )}

      {/* Header Banner */}
      <div className="glass-card" style={{
        padding: '1.6rem 2rem',
        borderRadius: '1.2rem',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(16, 185, 129, 0.08) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.25)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.2rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.4rem' }}>
            <span style={{
              padding: '0.2rem 0.6rem',
              borderRadius: '999px',
              background: '#6366F1',
              color: '#fff',
              fontSize: '0.72rem',
              fontWeight: 800,
              letterSpacing: '0.04em'
            }}>
              ML VALUATION & DCF ENGINE
            </span>
            <span style={{ fontSize: '0.8rem', color: '#A5B4FC', fontWeight: 600 }}>
              Active Company: {company.companyName || 'Teledu Learning'} ({company.ticker || 'TELEDU'})
            </span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>
            Institutional 5-Yr DCF & Stochastic Financial Forecaster
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: '6px 0 0 0', maxWidth: '720px' }}>
            Enterprise valuation derived from Unlevered Free Cash Flows (FCFF), Capital Asset Pricing (CAPM WACC), realistic working capital dips, and 500-iteration Monte Carlo confidence envelopes.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          <button
            onClick={handleExportCsv}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.65rem 1.1rem',
              borderRadius: '0.65rem',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#fff',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <Download size={14} /> Export CSV Model
          </button>
        </div>
      </div>

      {/* Primary KPI Ribbon (Key Financial Milestones) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        {/* DCF Enterprise Value */}
        <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '3px solid #6366F1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 800 }}>DCF ENTERPRISE VALUE</span>
            <Award size={14} color="#818CF8" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff', marginTop: '0.35rem' }}>
            ${(dcfModel.enterpriseValue / 1000000).toFixed(2)}M
          </div>
          <div style={{ fontSize: '0.74rem', color: '#A5B4FC', marginTop: '4px' }}>
            WACC: {params.wacc}% • g: {params.terminalGrowthRate}%
          </div>
        </div>

        {/* Fair Share Price & Implied Upside */}
        <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '3px solid #10B981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 800 }}>IMPLIED SHARE PRICE</span>
            <TrendingUp size={14} color="#34D399" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#34D399', marginTop: '0.35rem' }}>
            ${dcfModel.fairSharePrice}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#6EE7B7', fontWeight: 700, marginTop: '4px' }}>
            +{dcfModel.upside}% vs Asking (${dcfModel.currentPrice})
          </div>
        </div>

        {/* Cash Trough & J-Curve Valley (The Dip) */}
        <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '3px solid #F43F5E' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 800 }}>DEEPEST CASH TROUGH (DIP)</span>
            <ShieldAlert size={14} color="#F43F5E" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: runwayData.lowestCash >= 0 ? '#FBBF24' : '#F43F5E', marginTop: '0.35rem' }}>
            ${(runwayData.lowestCash).toLocaleString()}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Reached at Month {runwayData.lowestCashMonth} (J-Curve Valley)
          </div>
        </div>

        {/* Operating Breakeven Point */}
        <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '3px solid #38BDF8' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 800 }}>OPERATING BREAKEVEN</span>
            <Zap size={14} color="#38BDF8" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#38BDF8', marginTop: '0.35rem' }}>
            {runwayData.breakevenMonth ? `Month ${runwayData.breakevenMonth}` : 'Post M24'}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Ending Cash (M24): ${(runwayData.endingCash / 1000).toFixed(0)}k
          </div>
        </div>
      </div>

      {/* Main Analysis Stage: Tab Switcher & Multi-Perspective Charts */}
      <div className="glass-card" style={{ padding: '1.8rem', borderRadius: '1.2rem' }}>
        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          paddingBottom: '1rem',
          marginBottom: '1.4rem'
        }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {[
              { id: 'runway24', label: '24-Mo Runway (Dips & Peaks)', icon: Activity },
              { id: 'dcf5yr', label: '5-Year DCF & FCFF Waterfall', icon: BarChart3 },
              { id: 'montecarlo', label: 'ML Monte Carlo Simulation', icon: Sparkles },
              { id: 'sensitivity', label: 'WACC Sensitivity Heatmap', icon: Layers }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeView === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveView(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '0.55rem 1rem',
                    borderRadius: '0.6rem',
                    background: isActive ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(16, 185, 129, 0.15))' : 'rgba(255, 255, 255, 0.03)',
                    border: isActive ? '1px solid #818CF8' : '1px solid rgba(255, 255, 255, 0.06)',
                    color: isActive ? '#fff' : 'var(--text-secondary)',
                    fontWeight: isActive ? 800 : 600,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Icon size={14} color={isActive ? '#818CF8' : 'currentColor'} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Quick Legend Indicators */}
          <div style={{ display: 'flex', gap: '1.2rem', fontSize: '0.76rem', fontWeight: 700 }}>
            {activeView === 'runway24' && (
              <>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#6366F1' }}>
                  <span style={{ width: '10px', height: '3px', background: '#6366F1', borderRadius: '2px' }} />
                  Monthly Revenue
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#10B981' }}>
                  <span style={{ width: '10px', height: '3px', background: '#10B981', borderRadius: '2px' }} />
                  Cash Balance (J-Curve)
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#F43F5E' }}>
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#F43F5E' }} />
                  Capital Dip
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#38BDF8' }}>
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#38BDF8' }} />
                  Funding Surge
                </span>
              </>
            )}

            {activeView === 'montecarlo' && (
              <>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#34D399' }}>
                  <span style={{ width: '10px', height: '3px', background: '#34D399', borderRadius: '2px' }} />
                  P90 Bull Path
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#818CF8' }}>
                  <span style={{ width: '10px', height: '3px', background: '#818CF8', borderRadius: '2px' }} />
                  P50 Median Base
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#F87171' }}>
                  <span style={{ width: '10px', height: '3px', background: '#F87171', borderRadius: '2px' }} />
                  P10 Bear Path
                </span>
              </>
            )}
          </div>
        </div>

        {/* VIEW 1: 24-MONTH RUNWAY WITH DIPS, VALLEYS & MILESTONES */}
        {activeView === 'runway24' && (
          <div>
            {/* Event Injector Ribbon */}
            <div style={{
              padding: '0.85rem 1.1rem',
              borderRadius: '0.75rem',
              background: 'rgba(0, 0, 0, 0.35)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              marginBottom: '1.2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.8rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: '#A5B4FC', fontWeight: 800 }}>
                <Zap size={14} color="#FBBF24" />
                SIMULATE REAL-WORLD OPERATING EVENTS & SHOCKS:
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {[
                  { key: 'seedRound', label: '+$500k Seed Tranche (M3)', type: 'peak' },
                  { key: 'marketingPush', label: '-$65k Marketing Dip (M5)', type: 'dip' },
                  { key: 'hiringExpansion', label: 'Hiring Wave (M6)', type: 'dip' },
                  { key: 'enterpriseDeal', label: '+$135k Enterprise Deal (M9)', type: 'peak' },
                  { key: 'techCapex', label: '-$48k Cloud Infra CapEx (M14)', type: 'dip' },
                  { key: 'churnShock', label: '-12% Macro Churn (M11)', type: 'dip' }
                ].map(item => {
                  const isChecked = milestones[item.key];
                  return (
                    <button
                      key={item.key}
                      onClick={() => setMilestones({ ...milestones, [item.key]: !isChecked })}
                      style={{
                        padding: '0.3rem 0.65rem',
                        borderRadius: '0.45rem',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        border: isChecked 
                          ? (item.type === 'peak' ? '1px solid #10B981' : '1px solid #F43F5E')
                          : '1px solid rgba(255, 255, 255, 0.1)',
                        background: isChecked 
                          ? (item.type === 'peak' ? 'rgba(16, 185, 129, 0.18)' : 'rgba(244, 63, 94, 0.18)')
                          : 'rgba(255, 255, 255, 0.03)',
                        color: isChecked 
                          ? (item.type === 'peak' ? '#34D399' : '#FDA4AF')
                          : 'var(--text-muted)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <span style={{
                        width: '5px',
                        height: '5px',
                        borderRadius: '50%',
                        background: isChecked ? (item.type === 'peak' ? '#10B981' : '#F43F5E') : '#666'
                      }} />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interactive SVG Chart */}
            <div style={{ position: 'relative', overflowX: 'auto' }}>
              <svg 
                viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
                style={{ width: '100%', height: 'auto', minWidth: '680px', display: 'block' }}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                {/* Background Grid Lines */}
                {[0, 0.25, 0.5, 0.75, 1].map(r => {
                  const y = padT + r * plotH;
                  const val = Math.round(runwayMaxVal - r * runwayRange);
                  return (
                    <g key={r}>
                      <line x1={padL} y1={y} x2={padL + plotW} y2={y} stroke="rgba(255, 255, 255, 0.05)" strokeDasharray="3" />
                      <text x={padL - 10} y={y + 4} fill="var(--text-muted)" fontSize="9" textAnchor="end" fontFamily="monospace">
                        ${(val / 1000).toFixed(0)}k
                      </text>
                    </g>
                  );
                })}

                {/* Zero Reference Line */}
                {runwayMinVal < 0 && (
                  <line 
                    x1={padL} y1={getRunwayY(0)} 
                    x2={padL + plotW} y2={getRunwayY(0)} 
                    stroke="rgba(244, 63, 94, 0.5)" strokeWidth="1.5" strokeDasharray="4" 
                  />
                )}

                {/* Polylines for Revenue & Cash */}
                <polyline fill="none" stroke="#6366F1" strokeWidth="2.5" points={pointsRev} strokeLinecap="round" />
                <polyline fill="none" stroke="#10B981" strokeWidth="3" points={pointsCash} strokeLinecap="round" />

                {/* Interactive Data Points and Shock Markers */}
                {runwayData.months.map((m, idx) => {
                  const x = getRunwayX(idx);
                  const yCash = getRunwayY(m.cashBalance);
                  const isLowest = idx + 1 === runwayData.lowestCashMonth;
                  const isBreakeven = idx + 1 === runwayData.breakevenMonth;

                  return (
                    <g key={m.month}>
                      {/* X-Axis Tick Label */}
                      <text x={x} y={svgHeight - 12} fill={m.month % 2 === 0 ? "var(--text-secondary)" : "var(--text-muted)"} fontSize="9" textAnchor="middle">
                        M{m.month}
                      </text>

                      {/* Event Shock Badge Markers */}
                      {m.eventNotice && (
                        <g>
                          <line x1={x} y1={yCash} x2={x} y2={m.isPeak ? yCash - 22 : yCash + 22} stroke={m.isPeak ? "#38BDF8" : "#F43F5E"} strokeWidth="1" strokeDasharray="2" />
                          <circle cx={x} cy={yCash} r="5" fill={m.isPeak ? "#38BDF8" : "#F43F5E"} stroke="#fff" strokeWidth="1.5" />
                        </g>
                      )}

                      {/* Lowest Point (J-Curve Trough) Marker */}
                      {isLowest && (
                        <g>
                          <circle cx={x} cy={yCash} r="6" fill="#F43F5E" stroke="#fff" strokeWidth="2" />
                          <text x={x} y={yCash + 18} fill="#FDA4AF" fontSize="9" fontWeight="800" textAnchor="middle">
                            Trough
                          </text>
                        </g>
                      )}

                      {/* Breakeven Marker */}
                      {isBreakeven && (
                        <g>
                          <circle cx={x} cy={yCash} r="6" fill="#38BDF8" stroke="#fff" strokeWidth="2" />
                          <text x={x} y={yCash - 12} fill="#38BDF8" fontSize="9" fontWeight="800" textAnchor="middle">
                            Breakeven
                          </text>
                        </g>
                      )}

                      {/* Invisible Hover Target */}
                      <rect 
                        x={x - (plotW / 48)} y={padT} 
                        width={plotW / 24} height={plotH} 
                        fill="transparent" 
                        cursor="pointer"
                        onMouseEnter={() => setHoveredPoint(m)}
                      />
                    </g>
                  );
                })}
              </svg>

              {/* Hover Tooltip Overlay */}
              {hoveredPoint && (
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  right: '20px',
                  padding: '0.8rem 1rem',
                  borderRadius: '0.65rem',
                  background: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(12px)',
                  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
                  fontSize: '0.78rem',
                  zIndex: 20
                }}>
                  <div style={{ fontWeight: 800, color: '#fff', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '4px', marginBottom: '6px' }}>
                    {hoveredPoint.label} Performance Telemetry
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Revenue: </span>
                      <strong style={{ color: '#818CF8' }}>${hoveredPoint.revenue.toLocaleString()}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Cash: </span>
                      <strong style={{ color: '#34D399' }}>${hoveredPoint.cashBalance.toLocaleString()}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>OpEx: </span>
                      <strong style={{ color: '#FDA4AF' }}>${hoveredPoint.opEx.toLocaleString()}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Net Margin: </span>
                      <strong style={{ color: hoveredPoint.netIncome >= 0 ? '#34D399' : '#F43F5E' }}>
                        ${hoveredPoint.netIncome.toLocaleString()}
                      </strong>
                    </div>
                  </div>
                  {hoveredPoint.eventNotice && (
                    <div style={{ marginTop: '6px', paddingTop: '4px', borderTop: '1px dashed rgba(255, 255, 255, 0.1)', color: hoveredPoint.isPeak ? '#38BDF8' : '#FDA4AF', fontWeight: 700 }}>
                      ⚡ Event: {hoveredPoint.eventNotice}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 2: 5-YEAR INSTITUTIONAL DCF WATERFALL */}
        {activeView === 'dcf5yr' && (
          <div>
            <div className="fm-dcf-year-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.8rem', marginBottom: '1.4rem' }}>
              {dcfModel.years.map(y => (
                <div key={y.year} style={{
                  padding: '1rem',
                  borderRadius: '0.75rem',
                  background: 'rgba(255, 255, 255, 0.025)',
                  border: '1px solid rgba(255, 255, 255, 0.08)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 800, color: '#A5B4FC' }}>
                    <span>{y.yearLabel}</span>
                    <span style={{ color: '#34D399' }}>+{y.revenueGrowth}%</span>
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#fff', marginTop: '4px' }}>
                    ${(y.revenue / 1000).toFixed(0)}k Rev
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    EBITDA: ${(y.ebitda / 1000).toFixed(0)}k
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#10B981', fontWeight: 700, marginTop: '4px' }}>
                    FCFF: ${(y.fcff / 1000).toFixed(0)}k
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '3px' }}>
                    PV @ {params.wacc}%: ${(y.pvFcff / 1000).toFixed(0)}k
                  </div>
                </div>
              ))}
            </div>

            {/* Valuation Bridge Breakdown */}
            <div style={{
              padding: '1.2rem',
              borderRadius: '0.75rem',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(16, 185, 129, 0.08) 100%)',
              border: '1px solid rgba(99, 102, 241, 0.2)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              fontSize: '0.82rem'
            }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>5-Year Cumulative PV(FCFF):</span>
                <div style={{ fontWeight: 800, color: '#fff', fontSize: '1rem', marginTop: '2px' }}>
                  ${(dcfModel.cumulativePvFcff / 1000000).toFixed(2)}M
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>PV of Terminal Value (g={params.terminalGrowthRate}%):</span>
                <div style={{ fontWeight: 800, color: '#fff', fontSize: '1rem', marginTop: '2px' }}>
                  ${(dcfModel.pvTerminalValue / 1000000).toFixed(2)}M ({dcfModel.terminalValuePercent}% of EV)
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Exit Multiple Check (14x EBITDA):</span>
                <div style={{ fontWeight: 800, color: '#A5B4FC', fontSize: '1rem', marginTop: '2px' }}>
                  ${(dcfModel.exitMultipleEv / 1000000).toFixed(2)}M EV
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Current Asking Price vs Fair:</span>
                <div style={{ fontWeight: 800, color: '#34D399', fontSize: '1rem', marginTop: '2px' }}>
                  ${dcfModel.currentPrice} vs ${dcfModel.fairSharePrice} (+{dcfModel.upside}%)
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: ML MONTE CARLO STOCHASTIC PROBABILITY FAN CHART */}
        {activeView === 'montecarlo' && (
          <div>
            <div style={{ marginBottom: '1rem', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
              Stochastic GBM simulation running 500 paths with {params.volatility}% annualized volatility. Shaded fan ribbons depict P10 Bear, P50 Median, and P90 Bull revenue confidence envelopes.
            </div>

            <div style={{ position: 'relative', overflowX: 'auto' }}>
              <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ width: '100%', height: 'auto', minWidth: '680px', display: 'block' }}>
                {/* Background Grid */}
                {[0, 0.25, 0.5, 0.75, 1].map(r => {
                  const y = padT + r * plotH;
                  const val = Math.round(mcMax - r * mcRange);
                  return (
                    <g key={r}>
                      <line x1={padL} y1={y} x2={padL + plotW} y2={y} stroke="rgba(255, 255, 255, 0.05)" strokeDasharray="3" />
                      <text x={padL - 10} y={y + 4} fill="var(--text-muted)" fontSize="9" textAnchor="end" fontFamily="monospace">
                        ${(val / 1000).toFixed(0)}k
                      </text>
                    </g>
                  );
                })}

                {/* Shaded 90% Probability Ribbon (P90 to P10) */}
                <polygon points={areaP90P10} fill="rgba(99, 102, 241, 0.12)" stroke="rgba(99, 102, 241, 0.25)" strokeWidth="0.5" />
                {/* Shaded 50% Interquartile Ribbon (P75 to P25) */}
                <polygon points={areaP75P25} fill="rgba(16, 185, 129, 0.18)" stroke="rgba(16, 185, 129, 0.3)" strokeWidth="0.5" />

                {/* P50 Median Line */}
                <polyline fill="none" stroke="#818CF8" strokeWidth="2.5" points={pointsP50} strokeLinecap="round" />
                {/* Expected Baseline Line */}
                <polyline fill="none" stroke="#34D399" strokeWidth="2" strokeDasharray="4" points={pointsExpected} strokeLinecap="round" />

                {/* X-Axis Ticks */}
                {monteCarloData.map((d, i) => (
                  <text key={d.month} x={getMcX(i)} y={svgHeight - 12} fill="var(--text-muted)" fontSize="9" textAnchor="middle">
                    M{d.month}
                  </text>
                ))}
              </svg>
            </div>
          </div>
        )}

        {/* VIEW 4: WACC & TERMINAL SENSITIVITY HEATMAP MATRIX */}
        {activeView === 'sensitivity' && (
          <div>
            <div style={{ marginBottom: '1rem', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
              2-Dimensional Sensitivity Matrix evaluating Enterprise Valuation ($M) across varying Weighted Average Cost of Capital (WACC) and Terminal Growth Rates (g).
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '0.84rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(255, 255, 255, 0.04)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.8rem', border: '1px solid rgba(255, 255, 255, 0.08)' }}>WACC \ Growth</th>
                    {sensitivityMatrix.gValues.map(g => (
                      <th key={g} style={{ padding: '0.8rem', border: '1px solid rgba(255, 255, 255, 0.08)', color: '#A5B4FC' }}>
                        g = {g}%
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sensitivityMatrix.rows.map(row => (
                    <tr key={row.wacc}>
                      <td style={{ padding: '0.8rem', fontWeight: 800, color: '#CBD5E1', border: '1px solid rgba(255, 255, 255, 0.08)', background: 'rgba(255, 255, 255, 0.02)' }}>
                        {row.wacc}%
                      </td>
                      {row.cols.map(col => {
                        const isHigher = col.sharePrice >= dcfModel.currentPrice;
                        return (
                          <td 
                            key={col.growth} 
                            style={{
                              padding: '0.8rem',
                              border: col.isCurrent ? '2px solid #818CF8' : '1px solid rgba(255, 255, 255, 0.08)',
                              background: col.isCurrent 
                                ? 'rgba(99, 102, 241, 0.25)' 
                                : (isHigher ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.08)'),
                              fontWeight: col.isCurrent ? 900 : 700,
                              color: isHigher ? '#34D399' : '#FDA4AF'
                            }}
                          >
                            <div>${(col.ev / 1000000).toFixed(2)}M</div>
                            <div style={{ fontSize: '0.7rem', color: isHigher ? '#6EE7B7' : '#F43F5E' }}>
                              ${col.sharePrice} ({col.upside >= 0 ? `+${col.upside}%` : `${col.upside}%`})
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Complete Audited Financial Schedule (5-Year Forecast Table) */}
      <div className="glass-card" style={{ padding: '1.6rem', borderRadius: '1.2rem', overflowX: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#fff' }}>
              5-Year DCF Financial Schedule & FCFF Waterfall
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '3px 0 0 0' }}>
              Institutional financial statement projection: Revenue $\rightarrow$ NOPAT $\rightarrow$ Free Cash Flow to Firm (FCFF).
            </p>
          </div>
          <button
            onClick={handleExportCsv}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.45rem 0.85rem',
              borderRadius: '0.5rem',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#fff',
              fontSize: '0.76rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <Download size={13} /> Export CSV
          </button>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '0.82rem' }}>
          <thead>
            <tr style={{ background: 'rgba(255, 255, 255, 0.04)', color: 'var(--text-muted)' }}>
              <th style={{ textAlign: 'left', padding: '0.75rem 1rem' }}>Line Item ($ USD)</th>
              {dcfModel.years.map(y => (
                <th key={y.year} style={{ padding: '0.75rem 1rem', color: '#A5B4FC' }}>
                  {y.yearLabel}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { label: 'Total Revenue', key: 'revenue', isBold: true, color: '#fff' },
              { label: 'YoY Revenue Growth', key: 'revenueGrowth', format: v => `+${v}%`, color: '#34D399' },
              { label: 'Gross Profit', key: 'grossProfit', color: '#CBD5E1' },
              { label: 'Gross Margin %', key: 'grossMargin', format: v => `${v}%`, color: 'var(--text-muted)' },
              { label: 'Operating Expenses (OpEx)', key: 'opEx', color: '#FDA4AF' },
              { label: 'EBITDA', key: 'ebitda', isBold: true, color: '#818CF8' },
              { label: 'Operating Income (EBIT)', key: 'ebit', color: '#CBD5E1' },
              { label: 'Income Taxes (25%)', key: 'taxes', color: 'var(--text-muted)' },
              { label: 'NOPAT (Net Operating Profit After Tax)', key: 'nopat', isBold: true, color: '#fff' },
              { label: '(+) Depreciation & Amortization (D&A)', key: 'da', color: 'var(--text-muted)' },
              { label: '(-) Capital Expenditures (CapEx)', key: 'capEx', color: '#FDA4AF' },
              { label: '(-) Change in Net Working Capital (ΔNWC)', key: 'changeNwc', color: 'var(--text-muted)' },
              { label: '(=) Unlevered Free Cash Flow (FCFF)', key: 'fcff', isBold: true, color: '#10B981', highlight: true },
              { label: 'Discount Factor (Mid-Year)', key: 'discountFactor', color: 'var(--text-muted)' },
              { label: 'Present Value of FCFF', key: 'pvFcff', isBold: true, color: '#34D399' }
            ].map((row, idx) => (
              <tr 
                key={row.label} 
                style={{
                  background: row.highlight ? 'rgba(16, 185, 129, 0.08)' : (idx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.015)'),
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                }}
              >
                <td style={{ textAlign: 'left', padding: '0.65rem 1rem', fontWeight: row.isBold ? 800 : 500, color: row.color || 'var(--text-primary)' }}>
                  {row.label}
                </td>
                {dcfModel.years.map(y => {
                  const val = y[row.key];
                  const formatted = row.format ? row.format(val) : (typeof val === 'number' ? `$${val.toLocaleString()}` : val);
                  return (
                    <td key={y.year} style={{ padding: '0.65rem 1rem', fontWeight: row.isBold ? 800 : 500, color: row.color || 'var(--text-primary)' }}>
                      {formatted}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Interactive Financial & ML Assumption Sliders */}
      <div className="glass-card" style={{ padding: '1.6rem', borderRadius: '1.2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.2rem' }}>
          <Sliders size={18} color="#818CF8" />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: '#fff' }}>
            Model Inputs & Sensitivity Levers
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.2rem' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.4rem' }}>
              <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>WACC Discount Rate</span>
              <strong style={{ color: '#818CF8' }}>{params.wacc}%</strong>
            </div>
            <input
              type="range" min="8" max="22" step="0.5"
              value={params.wacc}
              onChange={e => setParams({ ...params, wacc: Number(e.target.value) })}
              style={{ width: '100%', accentColor: '#6366F1' }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.4rem' }}>
              <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>Terminal Growth (g)</span>
              <strong style={{ color: '#10B981' }}>{params.terminalGrowthRate}%</strong>
            </div>
            <input
              type="range" min="1.5" max="5.0" step="0.1"
              value={params.terminalGrowthRate}
              onChange={e => setParams({ ...params, terminalGrowthRate: Number(e.target.value) })}
              style={{ width: '100%', accentColor: '#10B981' }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.4rem' }}>
              <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>Monthly Growth Rate</span>
              <strong style={{ color: '#fff' }}>{params.monthlyGrowthRate}%/mo</strong>
            </div>
            <input
              type="range" min="4" max="25" step="0.5"
              value={params.monthlyGrowthRate}
              onChange={e => setParams({ ...params, monthlyGrowthRate: Number(e.target.value) })}
              style={{ width: '100%', accentColor: '#38BDF8' }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.4rem' }}>
              <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>Gross Margin</span>
              <strong style={{ color: '#34D399' }}>{params.grossMargin}%</strong>
            </div>
            <input
              type="range" min="40" max="92" step="1"
              value={params.grossMargin}
              onChange={e => setParams({ ...params, grossMargin: Number(e.target.value) })}
              style={{ width: '100%', accentColor: '#10B981' }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.4rem' }}>
              <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>ML Volatility (σ)</span>
              <strong style={{ color: '#FBBF24' }}>{params.volatility}%</strong>
            </div>
            <input
              type="range" min="5" max="40" step="1"
              value={params.volatility}
              onChange={e => setParams({ ...params, volatility: Number(e.target.value) })}
              style={{ width: '100%', accentColor: '#FBBF24' }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.4rem' }}>
              <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>Monthly Fixed Burn</span>
              <strong style={{ color: '#FDA4AF' }}>${params.monthlyFixedCosts.toLocaleString()}</strong>
            </div>
            <input
              type="range" min="10000" max="80000" step="1000"
              value={params.monthlyFixedCosts}
              onChange={e => setParams({ ...params, monthlyFixedCosts: Number(e.target.value) })}
              style={{ width: '100%', accentColor: '#F43F5E' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
