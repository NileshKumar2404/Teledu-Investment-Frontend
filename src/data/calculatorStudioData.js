// Practical Business Calculators Data (Extracted & Adapted from StartupIQ.html)

export const CALCULATOR_CATEGORIES = [
  'All',
  'Unit Economics',
  'Cash & Runway',
  'Revenue & Scale',
  'Market & Valuation',
  'Retention & Growth'
];

export const BUSINESS_CALCULATORS = [
  {
    id: 'cac',
    name: 'Customer Acquisition Cost (CAC)',
    badge: 'Core Metric',
    category: 'Unit Economics',
    formula: 'CAC = Total Sales & Marketing Spend / New Customers Acquired',
    interpretation: 'Measures how much capital is required to acquire a single paying customer. Low CAC relative to customer value is the foundation of scalable growth.',
    benchmark: 'Healthy benchmark: LTV should be at least 3× CAC, with payback within 12 months.',
    unit: '$',
    fields: [
      { id: 'spend', label: 'Sales & Marketing Acquisition Spend ($)', placeholder: '12000', default: 12000 },
      { id: 'customers', label: 'New Customers Acquired (This Period)', placeholder: '100', default: 100 }
    ],
    compute: (v) => {
      const spend = Number(v.spend) || 0;
      const customers = Number(v.customers) || 0;
      if (customers <= 0) return null;
      return {
        value: `$${(spend / customers).toFixed(2)}`,
        raw: spend / customers,
        unit: 'per new customer'
      };
    },
    advanced: [
      {
        name: 'Fully-Loaded CAC',
        desc: 'Includes ad spend, team salaries, marketing agency fees, MarTech subscriptions, and allocated overhead.',
        formula: '(AdSpend + Salaries + Agency + MarTech + Overhead) / New Paid Customers',
        inputs: [
          { id: 'ads', label: 'Paid Ad Spend ($)', default: 5000 },
          { id: 'salaries', label: 'Team Salaries ($)', default: 4500 },
          { id: 'agency', label: 'Agency Fees ($)', default: 1500 },
          { id: 'martech', label: 'MarTech SaaS ($)', default: 500 },
          { id: 'overhead', label: 'Overhead ($)', default: 500 },
          { id: 'newPaid', label: 'New Paid Customers', default: 100 }
        ],
        calc: (v) => {
          const total = (Number(v.ads)||0) + (Number(v.salaries)||0) + (Number(v.agency)||0) + (Number(v.martech)||0) + (Number(v.overhead)||0);
          const cust = Number(v.newPaid) || 1;
          return `$${(total / cust).toFixed(2)} / customer`;
        }
      },
      {
        name: 'CAC Payback Period',
        desc: 'The number of months required for a customer to generate enough gross margin to repay their acquisition cost.',
        formula: 'CAC / (ARPU × Gross Margin %)',
        inputs: [
          { id: 'cacVal', label: 'Acquisition Cost CAC ($)', default: 120 },
          { id: 'arpu', label: 'Monthly ARPU ($)', default: 120 },
          { id: 'gm', label: 'Gross Margin (%)', default: 78 }
        ],
        calc: (v) => {
          const monthlyMargin = (Number(v.arpu)||0) * ((Number(v.gm)||0) / 100);
          if (monthlyMargin <= 0) return '—';
          const months = (Number(v.cacVal)||0) / monthlyMargin;
          return `${months.toFixed(1)} months`;
        }
      }
    ]
  },
  {
    id: 'ltv',
    name: 'Customer Lifetime Value (LTV)',
    badge: 'Core Metric',
    category: 'Unit Economics',
    formula: 'LTV = (Average Revenue per User × Gross Margin %) / Churn Rate %',
    interpretation: 'Predicts the total net gross profit that a single customer account will generate over the entirety of their relationship with your business.',
    benchmark: 'Elite B2B SaaS targets > 3.0× LTV:CAC. Consumer subscriptions target > 2.5×.',
    unit: '$',
    fields: [
      { id: 'avgRevenue', label: 'Avg Monthly Revenue / User (ARPU $)', placeholder: '120', default: 120 },
      { id: 'grossMargin', label: 'Gross Margin (%)', placeholder: '78', companyKey: 'grossMargin', default: 78 },
      { id: 'churn', label: 'Gross Monthly Churn (%)', placeholder: '2.4', companyKey: 'churnRate', default: 2.4 }
    ],
    compute: (v) => {
      const rev = Number(v.avgRevenue) || 0;
      const gm = (Number(v.grossMargin) || 78) / 100;
      const churn = (Number(v.churn) || 2.4) / 100;
      if (churn <= 0) return null;
      const ltv = (rev * gm) / churn;
      return {
        value: `$${Math.round(ltv).toLocaleString()}`,
        raw: ltv,
        unit: 'per customer'
      };
    },
    advanced: [
      {
        name: 'NPV-Discounted LTV',
        desc: 'Calculates the net present value of future cash flows over an N-month horizon discounted at annual cost of capital.',
        formula: '∑ [ (ARPU × Gross Margin) / (1 + r)^t ] for t = 1 to N',
        inputs: [
          { id: 'arpu', label: 'Monthly ARPU ($)', default: 120 },
          { id: 'gm', label: 'Gross Margin (%)', default: 78 },
          { id: 'discount', label: 'Monthly Discount Rate (%)', default: 0.8 },
          { id: 'horizon', label: 'Time Horizon (Months)', default: 24 }
        ],
        calc: (v) => {
          const margin = (Number(v.arpu)||0) * ((Number(v.gm)||0) / 100);
          const r = (Number(v.discount)||0) / 100;
          const N = Math.min(Number(v.horizon)||24, 60);
          let sum = 0;
          for (let t = 1; t <= N; t++) {
            sum += margin / Math.pow(1 + r, t);
          }
          return `$${Math.round(sum).toLocaleString()}`;
        }
      },
      {
        name: 'True LTV : CAC Ratio',
        desc: 'The ultimate health barometer of unit-level viability and capital return.',
        formula: 'LTV / Fully-Loaded CAC',
        inputs: [
          { id: 'ltvInput', label: 'Calculated LTV ($)', default: 3900 },
          { id: 'cacInput', label: 'Calculated CAC ($)', default: 120 }
        ],
        calc: (v) => {
          const l = Number(v.ltvInput)||0;
          const c = Number(v.cacInput)||1;
          const ratio = (l / c).toFixed(2);
          return `${ratio}x (${ratio >= 3 ? 'Elite / Healthy' : 'Sub-optimal'})`;
        }
      }
    ]
  },
  {
    id: 'runway',
    name: 'Cash Runway',
    badge: 'Survival Indicator',
    category: 'Cash & Runway',
    formula: 'Runway = Available Cash / Net Burn (Monthly Burn - Monthly Revenue)',
    interpretation: 'The countdown clock until zero cash. When monthly revenue exceeds monthly burn, the startup is cash-flow positive.',
    benchmark: 'Safe: 12-18 months. Moderate: 6-12 months. Critical: < 6 months.',
    unit: 'Months',
    fields: [
      { id: 'cash', label: 'Current Available Cash ($)', placeholder: '240000', companyKey: 'cashAvailable', default: 240000 },
      { id: 'burn', label: 'Monthly Gross Burn ($)', placeholder: '18000', companyKey: 'monthlyBurn', default: 18000 },
      { id: 'revenue', label: 'Monthly Revenue / MRR ($)', placeholder: '28500', companyKey: 'monthlyRevenue', default: 28500 }
    ],
    compute: (v) => {
      const cash = Number(v.cash) || 0;
      const burn = Number(v.burn) || 0;
      const revenue = Number(v.revenue) || 0;
      const netBurn = burn - revenue;
      if (netBurn <= 0) {
        return {
          value: 'Profitable / Net Positive',
          raw: 999,
          unit: `+$${Math.abs(netBurn).toLocaleString()}/mo net surplus`
        };
      }
      const months = (cash / netBurn).toFixed(1);
      return {
        value: `${months} Months`,
        raw: Number(months),
        unit: Number(months) >= 12 ? 'Healthy Cushion' : Number(months) >= 6 ? 'Adequate Runway' : 'Urgent Capital Need'
      };
    },
    advanced: [
      {
        name: 'Gross Burn vs. Net Burn Runway',
        desc: 'Accounts for incoming recurring revenue offsetting fixed expenses.',
        formula: 'Cash / (Gross Expenses - Monthly Revenue)',
        inputs: [
          { id: 'cashBal', label: 'Cash Balance ($)', default: 165000 },
          { id: 'expenses', label: 'Total Monthly OPEX ($)', default: 45000 },
          { id: 'revenue', label: 'Monthly Revenue ($)', default: 27000 }
        ],
        calc: (v) => {
          const cash = Number(v.cashBal) || 0;
          const net = (Number(v.expenses) || 0) - (Number(v.revenue) || 0);
          if (net <= 0) return 'Cash-flow positive (Infinite runway)';
          return `${(cash / net).toFixed(1)} months remaining`;
        }
      }
    ]
  },
  {
    id: 'burn-rate',
    name: 'Monthly Burn Rate',
    badge: 'Cash Outflow',
    category: 'Cash & Runway',
    formula: 'Monthly Burn = Starting Cash Balance - Ending Cash Balance',
    interpretation: 'Measures the rate at which your company consumes venture capital and reserves to finance operations.',
    benchmark: 'Keep monthly burn under 10% of total funding until achieving product-market fit.',
    unit: '$',
    fields: [
      { id: 'startCash', label: 'Starting Cash Balance ($)', placeholder: '200000', default: 200000 },
      { id: 'endCash', label: 'Ending Cash Balance ($)', placeholder: '182000', default: 182000 }
    ],
    compute: (v) => {
      const s = Number(v.startCash) || 0;
      const e = Number(v.endCash) || 0;
      const burn = s - e;
      return {
        value: `$${burn.toLocaleString()} / mo`,
        raw: burn,
        unit: burn > 0 ? 'Net Outflow' : 'Net Cash Accumulation'
      };
    }
  },
  {
    id: 'arr-mrr',
    name: 'ARR & MRR Run-Rate',
    badge: 'Recurring Scale',
    category: 'Revenue & Scale',
    formula: 'ARR = MRR × 12  |  MRR = Paying Customers × ARPU',
    interpretation: 'The single most watched top-line valuation metric for subscription SaaS businesses and investors.',
    benchmark: 'Early-stage benchmark: 10-15% monthly compounding growth rate.',
    unit: '$',
    fields: [
      { id: 'mrr', label: 'Monthly Recurring Revenue MRR ($)', placeholder: '336000', companyKey: 'monthlyRevenue', default: 336000 }
    ],
    compute: (v) => {
      const mrr = Number(v.mrr) || 0;
      const arr = mrr * 12;
      return {
        value: `$${arr.toLocaleString()} ARR`,
        raw: arr,
        unit: `$${mrr.toLocaleString()} / month`
      };
    },
    advanced: [
      {
        name: 'Seat-Based MRR Calculator',
        desc: 'Calculates subscription revenue based on total subscribed enterprise seats and average price tier.',
        formula: 'Active Seats × Monthly License Price',
        inputs: [
          { id: 'seats', label: 'Total Active Seats', default: 240 },
          { id: 'price', label: 'Price per Seat / Mo ($)', default: 1400 }
        ],
        calc: (v) => {
          const mrr = (Number(v.seats)||0) * (Number(v.price)||0);
          return `$${mrr.toLocaleString()}/mo ($${(mrr * 12).toLocaleString()} ARR)`;
        }
      }
    ]
  },
  {
    id: 'churn-retention',
    name: 'Customer Churn & Retention Rate',
    badge: 'Cohort Health',
    category: 'Retention & Growth',
    formula: 'Churn Rate % = (Customers Lost / Start Customers) × 100  |  Retention = 100 - Churn',
    interpretation: 'Measures customer satisfaction and retention durability. High churn destroys customer compounding and creates a leaky bucket.',
    benchmark: 'Enterprise B2B: < 1% monthly (< 8% annual). SMB SaaS: < 3% monthly. B2C: < 5% monthly.',
    unit: '%',
    fields: [
      { id: 'lost', label: 'Customers Lost in Period', placeholder: '8', default: 8 },
      { id: 'start', label: 'Customers at Start of Period', placeholder: '240', companyKey: 'customers', default: 240 }
    ],
    compute: (v) => {
      const lost = Number(v.lost) || 0;
      const start = Number(v.start) || 1;
      const churn = (lost / start) * 100;
      const retention = 100 - churn;
      return {
        value: `${churn.toFixed(2)}% Churn`,
        raw: churn,
        unit: `${retention.toFixed(2)}% Retention Rate`
      };
    }
  },
  {
    id: 'gross-margin',
    name: 'Gross Margin Percentage',
    badge: 'Profitability',
    category: 'Unit Economics',
    formula: 'Gross Margin % = ((Total Revenue - COGS) / Total Revenue) × 100',
    interpretation: 'Percentage of revenue remaining after accounting for direct hosting, server, and customer onboarding costs before operating expenses.',
    benchmark: 'Pure SaaS: 75% - 85%. Marketplace: 60% - 70%. Hardware / E-commerce: 30% - 50%.',
    unit: '%',
    fields: [
      { id: 'revenue', label: 'Total Revenue ($)', placeholder: '336000', companyKey: 'monthlyRevenue', default: 336000 },
      { id: 'cogs', label: 'Cost of Goods Sold (COGS) ($)', placeholder: '94000', default: 94000 }
    ],
    compute: (v) => {
      const rev = Number(v.revenue) || 1;
      const cogs = Number(v.cogs) || 0;
      const gm = ((rev - cogs) / rev) * 100;
      return {
        value: `${gm.toFixed(1)}%`,
        raw: gm,
        unit: `$${(rev - cogs).toLocaleString()} Gross Profit`
      };
    }
  },
  {
    id: 'tam-sam-som',
    name: 'Market Sizing (TAM / SAM / SOM)',
    badge: 'Market Sizing',
    category: 'Market & Valuation',
    formula: 'TAM = Total Universe × ARPU  |  SAM = TAM × Reachable %  |  SOM = SAM × Target Share %',
    interpretation: 'Crucial for investor pitch decks to substantiate growth ceilings and venture capital returns.',
    benchmark: 'VCs typically expect TAM > $1 Billion to underwrite early-stage fund returners.',
    unit: '$',
    fields: [
      { id: 'tamUniverse', label: 'Total Potential Customers in Market', placeholder: '500000', default: 500000 },
      { id: 'arpu', label: 'Expected Annual Spend / Customer ($)', placeholder: '2400', default: 2400 },
      { id: 'samPct', label: 'Reachable Market % (SAM)', placeholder: '25', default: 25 },
      { id: 'somPct', label: 'Realistic 3-Yr Market Share % (SOM)', placeholder: '5', default: 5 }
    ],
    compute: (v) => {
      const tam = (Number(v.tamUniverse) || 0) * (Number(v.arpu) || 0);
      const sam = tam * ((Number(v.samPct) || 0) / 100);
      const som = sam * ((Number(v.somPct) || 0) / 100);
      const fmtM = n => n >= 1e9 ? `$${(n/1e9).toFixed(2)}B` : `$${(n/1e6).toFixed(1)}M`;
      return {
        value: `${fmtM(tam)} TAM`,
        raw: tam,
        unit: `SAM: ${fmtM(sam)}  •  SOM: ${fmtM(som)}`
      };
    }
  },
  {
    id: 'dilution-valuation',
    name: 'Cap Table Dilution & Pre/Post Money',
    badge: 'Cap Table',
    category: 'Market & Valuation',
    formula: 'Post-Money = Pre-Money + Investment  |  Dilution % = Investment / Post-Money',
    interpretation: 'Models equity percentage dilution when raising seed or series investment capital from venture angels or funds.',
    benchmark: 'Standard Seed dilution: 15% - 20%. Series A dilution: 20% - 25%.',
    unit: '%',
    fields: [
      { id: 'preMoney', label: 'Agreed Pre-Money Valuation ($)', placeholder: '5000000', default: 5000000 },
      { id: 'investment', label: 'Investment Round Amount ($)', placeholder: '1000000', default: 1000000 }
    ],
    compute: (v) => {
      const pre = Number(v.preMoney) || 0;
      const inv = Number(v.investment) || 0;
      const post = pre + inv;
      const dilution = post > 0 ? (inv / post) * 100 : 0;
      return {
        value: `${dilution.toFixed(1)}% Dilution`,
        raw: dilution,
        unit: `Post-Money Valuation: $${(post / 1e6).toFixed(2)}M`
      };
    }
  },
  {
    id: 'ebitda',
    name: 'EBITDA Operating Cash Flow',
    badge: 'Corporate Profit',
    category: 'Revenue & Scale',
    formula: 'EBITDA = Net Income + Interest + Taxes + Depreciation + Amortization',
    interpretation: 'Standard institutional measure of core operating cash profitability that ignores non-cash deductions and leverage capital structure.',
    benchmark: 'Scale-stage rule of 40: Growth Rate % + EBITDA Margin % should exceed 40%.',
    unit: '$',
    fields: [
      { id: 'netIncome', label: 'Net Income ($)', placeholder: '45000', default: 45000 },
      { id: 'interest', label: 'Interest Expense ($)', placeholder: '3000', default: 3000 },
      { id: 'taxes', label: 'Taxes ($)', placeholder: '12000', default: 12000 },
      { id: 'depr', label: 'Depreciation & Amortization ($)', placeholder: '8000', default: 8000 }
    ],
    compute: (v) => {
      const ebitda = (Number(v.netIncome)||0) + (Number(v.interest)||0) + (Number(v.taxes)||0) + (Number(v.depr)||0);
      return {
        value: `$${ebitda.toLocaleString()}`,
        raw: ebitda,
        unit: 'Operating earnings before financing & non-cash charges'
      };
    }
  },
  {
    id: 'conversion-rate',
    name: 'Funnel Conversion Rate',
    badge: 'Funnel Optimization',
    category: 'Retention & Growth',
    formula: 'Conversion Rate % = (Total Conversions / Total Unique Visitors) × 100',
    interpretation: 'Quantifies the efficiency of moving visitors through your marketing landing page or onboarding sign-up flow.',
    benchmark: 'B2B SaaS landing page benchmark: 2.5% - 5.0%. Free trial-to-paid: 15% - 25%.',
    unit: '%',
    fields: [
      { id: 'conversions', label: 'Completed Actions (Signups / Purchases)', placeholder: '450', default: 450 },
      { id: 'visitors', label: 'Total Unique Visitors / Trial Users', placeholder: '10000', default: 10000 }
    ],
    compute: (v) => {
      const conv = Number(v.conversions) || 0;
      const vis = Number(v.visitors) || 1;
      const rate = (conv / vis) * 100;
      return {
        value: `${rate.toFixed(2)}%`,
        raw: rate,
        unit: `${conv.toLocaleString()} out of ${vis.toLocaleString()} converted`
      };
    }
  },
  {
    id: 'nps',
    name: 'Net Promoter Score (NPS)',
    badge: 'Customer Love',
    category: 'Retention & Growth',
    formula: 'NPS = % Promoters (Score 9-10) − % Detractors (Score 0-6)',
    interpretation: 'Gold-standard benchmark of customer loyalty, satisfaction, and organic word-of-mouth referral power.',
    benchmark: 'NPS > 50 is excellent; NPS > 70 is world-class product love (Apple, Tesla tier).',
    unit: 'Score',
    fields: [
      { id: 'promoters', label: 'Promoters Count (Rating 9-10)', placeholder: '65', default: 65 },
      { id: 'passives', label: 'Passives Count (Rating 7-8)', placeholder: '25', default: 25 },
      { id: 'detractors', label: 'Detractors Count (Rating 0-6)', placeholder: '10', default: 10 }
    ],
    compute: (v) => {
      const p = Number(v.promoters) || 0;
      const pa = Number(v.passives) || 0;
      const d = Number(v.detractors) || 0;
      const total = p + pa + d;
      if (total === 0) return null;
      const nps = Math.round(((p - d) / total) * 100);
      return {
        value: `${nps > 0 ? '+' : ''}${nps}`,
        raw: nps,
        unit: nps >= 50 ? 'World-class Customer Love' : nps >= 20 ? 'Favorable Sentiment' : 'Needs Optimization'
      };
    }
  }
];
