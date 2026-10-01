// 25 Core Marketing KPIs & Indexes for Venture-Scale Startups

export const MARKETING_CATEGORIES = [
  "All",
  "Cost & Spend",
  "Acquisition & Reach",
  "Conversion & Funnel",
  "Retention & Value",
  "Efficiency & ROI"
];

export const MARKETING_TERMS = [
  {
    n: 1,
    short: "CAC",
    full: "Customer Acquisition Cost",
    category: "Cost & Spend",
    definition: "Total sales and marketing expenditure divided by the number of new customers acquired over a given period.",
    formula: "CAC = Total Sales & Marketing Spend / New Customers Acquired",
    example: "If you spend $50,000 on ads, sales salaries, and software in Q1 and acquire 100 customers, your CAC is $500."
  },
  {
    n: 2,
    short: "LTV",
    full: "Customer Lifetime Value",
    category: "Retention & Value",
    definition: "The total gross profit or revenue a company anticipates earning from a single customer relationship over its entire duration.",
    formula: "LTV = (ARPU × Gross Margin %) / Churn Rate",
    example: "With $100/mo ARPU, 80% gross margin, and 2% monthly churn: LTV = ($100 × 0.80) / 0.02 = $4,000."
  },
  {
    n: 3,
    short: "LTV:CAC",
    full: "Lifetime Value to CAC Ratio",
    category: "Efficiency & ROI",
    definition: "The golden ratio of unit economics comparing value generated per user against the acquisition expense. Venture standard target is ≥ 3.0x.",
    formula: "LTV:CAC = Customer Lifetime Value / Customer Acquisition Cost",
    example: "An LTV of $3,600 with a CAC of $900 yields an LTV:CAC of 4.0x (highly attractive to Series A VCs)."
  },
  {
    n: 4,
    short: "CAC Payback",
    full: "CAC Payback Period",
    category: "Cost & Spend",
    definition: "The number of months required for a newly acquired customer to generate enough gross profit to recoup their acquisition cost.",
    formula: "Payback (Months) = CAC / (Monthly ARPU × Gross Margin %)",
    example: "A $1,200 CAC with $150/mo revenue at 80% margin takes 10 months to break even."
  },
  {
    n: 5,
    short: "ROAS",
    full: "Return on Ad Spend",
    category: "Efficiency & ROI",
    definition: "Direct revenue generated for every dollar invested in paid advertising channels.",
    formula: "ROAS = Revenue from Ad Campaign / Ad Spend",
    example: "Spending $10,000 on LinkedIn Ads to generate $42,000 in pipeline ARR yields a 4.2x ROAS."
  },
  {
    n: 6,
    short: "MER",
    full: "Marketing Efficiency Ratio (Blended ROAS)",
    category: "Efficiency & ROI",
    definition: "High-level metric showing total top-line company revenue generated per total marketing dollar spent across all channels.",
    formula: "MER = Total Revenue / Total Marketing Expenditure",
    example: "$250,000 monthly revenue divided by $50,000 total marketing spend equals an MER of 5.0x."
  },
  {
    n: 7,
    short: "CPA",
    full: "Cost Per Acquisition / Action",
    category: "Cost & Spend",
    definition: "Average ad expenditure required to generate a specific downstream conversion action (lead, signup, or checkout).",
    formula: "CPA = Campaign Ad Spend / Total Conversions",
    example: "$5,000 spent driving 250 trial signups results in a $20 CPA per trial user."
  },
  {
    n: 8,
    short: "CPC",
    full: "Cost Per Click",
    category: "Acquisition & Reach",
    definition: "Actual cost incurred each time an intent-driven user clicks on a sponsored link or digital advertisement.",
    formula: "CPC = Total Ad Spend / Total Clicks Delivered",
    example: "$2,400 spent on Google Search Ads producing 1,200 clicks equals a $2.00 CPC."
  },
  {
    n: 9,
    short: "CPM",
    full: "Cost Per Mille (Thousand Impressions)",
    category: "Acquisition & Reach",
    definition: "Standard programmatic media pricing metric measuring the cost of serving 1,000 ad impressions.",
    formula: "CPM = (Total Ad Spend / Impressions) × 1,000",
    example: "$1,500 spent on Meta Awareness Ads delivering 100,000 impressions equals a $15 CPM."
  },
  {
    n: 10,
    short: "CTR",
    full: "Click-Through Rate",
    category: "Conversion & Funnel",
    definition: "Percentage of individuals who click on a call-to-action or link after viewing the impression.",
    formula: "CTR (%) = (Total Clicks / Total Impressions) × 100",
    example: "2,500 clicks out of 100,000 email newsletter opens equals a 2.5% CTR."
  },
  {
    n: 11,
    short: "CVR",
    full: "Conversion Rate",
    category: "Conversion & Funnel",
    definition: "The percentage of website or landing page visitors who complete the desired conversion event.",
    formula: "CVR (%) = (Total Goal Conversions / Total Unique Visitors) × 100",
    example: "480 trial signups out of 12,000 unique landing page visits yields a 4.0% CVR."
  },
  {
    n: 12,
    short: "K-Factor",
    full: "Virality Coefficient",
    category: "Acquisition & Reach",
    definition: "Measures viral product growth: the average number of new users each existing user invites and successfully converts.",
    formula: "K = Invites Sent per User × Conversion Rate of Invites",
    example: "Each user sends 5 invites with a 25% acceptance rate: K = 5 × 0.25 = 1.25 (> 1.0 means exponential organic growth)."
  },
  {
    n: 13,
    short: "Blended CAC",
    full: "Fully Loaded Blended CAC",
    category: "Cost & Spend",
    definition: "Acquisition cost that factors in all marketing and sales overhead (salaries, agency retainers, tools, and ads) across all channels.",
    formula: "Blended CAC = (All S&M Costs + Salaries + Agency Fees) / Total New Customers",
    example: "Total S&M overhead of $80,000 yielding 160 customers equals a $500 Blended CAC."
  },
  {
    n: 14,
    short: "Paid CAC",
    full: "Paid Customer Acquisition Cost",
    category: "Cost & Spend",
    definition: "CAC calculated solely on paid performance media spend divided exclusively by paid channel customer acquisitions.",
    formula: "Paid CAC = Direct Paid Media Ad Spend / Customers from Paid Channels",
    example: "$30,000 ad spend bringing 50 customers directly attributed to ads = $600 Paid CAC."
  },
  {
    n: 15,
    short: "Organic:Paid",
    full: "Organic to Paid Traffic Ratio",
    category: "Acquisition & Reach",
    definition: "Proportion of inbound organic, direct, and referral discovery relative to paid acquisition traffic.",
    formula: "Organic:Paid = Total Organic Visits / Total Paid Traffic Visits",
    example: "60,000 monthly organic visits vs 20,000 paid ad clicks represents a 3:1 organic leverage ratio."
  },
  {
    n: 16,
    short: "MQL to SQL",
    full: "Marketing Qualified to Sales Qualified Lead Rate",
    category: "Conversion & Funnel",
    definition: "Percentage of marketing leads that pass commercial qualification criteria to become active pipeline opportunities.",
    formula: "MQL to SQL (%) = (Qualified SQLs / Inbound MQLs) × 100",
    example: "120 sales-accepted leads from 400 marketing-generated leads gives a 30% qualification rate."
  },
  {
    n: 17,
    short: "SQL to Win",
    full: "Opportunity Close Win Rate",
    category: "Conversion & Funnel",
    definition: "Proportion of sales-qualified opportunities that result in an executed customer contract.",
    formula: "Win Rate (%) = (Closed Won Deals / Total Qualified Opportunities) × 100",
    example: "25 closed-won enterprise software contracts out of 100 SQL opportunities equals a 25% win rate."
  },
  {
    n: 18,
    short: "ARPU",
    full: "Average Revenue Per User / Account",
    category: "Retention & Value",
    definition: "The mean recurring revenue generated per subscribed user or active commercial account per month or year.",
    formula: "ARPU = Total Monthly Recurring Revenue / Total Active Accounts",
    example: "$60,000 MRR across 300 active software accounts yields an ARPU of $200/mo."
  },
  {
    n: 19,
    short: "Customer Churn",
    full: "Customer Logo Churn Rate",
    category: "Retention & Value",
    definition: "The percentage of customers that cancel or do not renew their subscriptions over a given billing period.",
    formula: "Churn (%) = (Lost Customers during Period / Customers at Start) × 100",
    example: "Losing 4 accounts out of 200 during a month yields a 2.0% monthly logo churn."
  },
  {
    n: 20,
    short: "NRR",
    full: "Net Revenue Retention",
    category: "Retention & Value",
    definition: "Percentage of recurring revenue retained from existing customers including expansions, upsells, and downgrades/churn.",
    formula: "NRR (%) = [(Starting MRR + Expansion - Contraction - Churn) / Starting MRR] × 100",
    example: "$100k starting MRR + $20k upsells - $5k churn = $115k, representing 115% NRR (top-decile SaaS benchmark)."
  },
  {
    n: 21,
    short: "Burn Multiple",
    full: "Growth Burn Multiple",
    category: "Efficiency & ROI",
    definition: "Efficiency index measuring how much capital a startup burns to generate each dollar of Net New Annual Recurring Revenue.",
    formula: "Burn Multiple = Net Cash Burn / Net New ARR Added",
    example: "Burning $1.2M in a year to generate $1.5M in net new ARR yields an outstanding 0.8x Burn Multiple."
  },
  {
    n: 22,
    short: "CTOR",
    full: "Click-to-Open Rate",
    category: "Conversion & Funnel",
    definition: "Measures email content effectiveness: percentage of unique opens that resulted in a click on an embedded link.",
    formula: "CTOR (%) = (Unique Clicks / Unique Opens) × 100",
    example: "600 clicks out of 3,000 opens represents a 20% CTOR."
  },
  {
    n: 23,
    short: "SOV",
    full: "Share of Voice",
    category: "Acquisition & Reach",
    definition: "Percentage of total industry mentions, organic search impressions, and social brand conversations captured by your brand vs competitors.",
    formula: "SOV (%) = (Your Brand Mentions or Ad Impressions / Total Market Mentions) × 100",
    example: "Capturing 3,500 mentions out of 10,000 total market conversations represents a 35% Share of Voice."
  },
  {
    n: 24,
    short: "VCT",
    full: "Viral Cycle Time",
    category: "Acquisition & Reach",
    definition: "The elapsed time between a user signing up, inviting peers, and those new peers completing registration.",
    formula: "VCT = Days required for an invite loop to complete",
    example: "A cycle time of 2 days accelerates user growth exponentially faster than a 14-day cycle with identical K-factor."
  },
  {
    n: 25,
    short: "Brand Search Growth",
    full: "Brand Search Velocity",
    category: "Acquisition & Reach",
    definition: "Month-over-month growth rate of prospective users explicitly typing your company name into search engines.",
    formula: "Growth (%) = [(This Month Brand Searches - Last Month) / Last Month] × 100",
    example: "Growing from 2,000 to 3,200 monthly branded Google queries represents a 60% brand search expansion."
  }
];
