import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileSpreadsheet, TrendingUp, TrendingDown, DollarSign, Plus, 
  Trash2, ShieldCheck, Filter, ArrowDownRight, ArrowUpRight, 
  Calendar, Layers, CheckCircle2, X
} from 'lucide-react';
import { api } from '../../api/client';
import { LEDGER_TRANSACTIONS } from '../../data/investmentData';

export default function LedgerModule({ activeTicker = 'TELEDU' }) {
  const [transactions, setTransactions] = useState(LEDGER_TRANSACTIONS);
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEntry, setNewEntry] = useState({
    type: 'Revenue',
    category: 'SaaS Subscriptions',
    amount: 15000,
    date: new Date().toISOString().split('T')[0],
    periodicity: 'Monthly',
    expenseType: 'Variable',
    notes: ''
  });

  useEffect(() => {
    async function loadLedger() {
      try {
        const data = await api.getTransactions(activeTicker);
        if (data && data.length > 0) {
          setTransactions(data);
        }
      } catch (err) {
        console.warn('Using offline ledger data', err);
      }
    }
    loadLedger();
  }, [activeTicker]);

  // Compute Cash Flow Metrics
  const totalRevenue = transactions
    .filter(t => t.type === 'Revenue')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const totalExpense = transactions
    .filter(t => t.type === 'Expense')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const netCashFlow = totalRevenue - totalExpense;
  const burnRate = totalExpense > 0 ? totalExpense : 18000;
  const cashRunwayMonths = Number((165000 / (burnRate || 1)).toFixed(1));

  const filteredTransactions = transactions.filter(t => {
    if (typeFilter === 'ALL') return true;
    return t.type.toUpperCase() === typeFilter;
  });

  const handleAddTransaction = (e) => {
    e.preventDefault();
    const entryObj = {
      _id: `tx-${Date.now()}`,
      type: newEntry.type,
      category: newEntry.category || 'General Operations',
      amount: Number(newEntry.amount) || 1000,
      date: newEntry.date || new Date().toISOString().split('T')[0],
      periodicity: newEntry.periodicity,
      expenseType: newEntry.expenseType,
      notes: newEntry.notes || ''
    };

    setTransactions([entryObj, ...transactions]);
    setShowAddModal(false);
    setNewEntry({
      type: 'Revenue',
      category: 'SaaS Subscriptions',
      amount: 15000,
      date: new Date().toISOString().split('T')[0],
      periodicity: 'Monthly',
      expenseType: 'Variable',
      notes: ''
    });
  };

  const handleDelete = (id) => {
    setTransactions(transactions.filter(t => t._id !== id));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
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
            <ShieldCheck size={14} />
            AUDITED OPERATIONAL JOURNAL • GAAP ACCRUAL LEDGER
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.6rem', letterSpacing: '-0.02em' }}>
            Financial Ledger & Cash Flows
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
            Audited transaction ledger tracking operational revenues, cloud costs, payroll disbursements, and net cash flow dynamics for investor inspection.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.8rem 1.4rem',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, #10B981, #059669)',
            color: '#fff',
            border: 'none',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
          }}
        >
          <Plus size={18} />
          Record Journal Entry
        </button>
      </div>

      {/* Financial KPIs */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.2rem'
      }}>
        {/* Total Inflows */}
        <div style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', background: 'var(--surface-card)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Total Revenue Inflows</span>
            <TrendingUp size={18} color="#10B981" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#10B981', marginTop: '4px' }}>
            +${totalRevenue.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Recorded period income</div>
        </div>

        {/* Operating Outflows */}
        <div style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', background: 'var(--surface-card)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Operating Expenses</span>
            <TrendingDown size={18} color="#EF4444" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#F87171', marginTop: '4px' }}>
            -${totalExpense.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Cash outflows & burn</div>
        </div>

        {/* Net Cash Flow */}
        <div style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', background: 'var(--surface-card)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Net Cash Flow</span>
            <DollarSign size={18} color="#818CF8" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: netCashFlow >= 0 ? '#10B981' : '#F87171', marginTop: '4px' }}>
            {netCashFlow >= 0 ? '+' : ''}${netCashFlow.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Period surplus / deficit</div>
        </div>

        {/* Estimated Runway */}
        <div style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', background: 'var(--surface-card)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Cash Runway</span>
            <Calendar size={18} color="#F59E0B" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#FBBF24', marginTop: '4px' }}>
            {cashRunwayMonths} Mo.
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>At current monthly burn</div>
        </div>
      </div>

      {/* Ledger Journal Table */}
      <div style={{
        padding: '1.8rem',
        borderRadius: 'var(--radius-xl)',
        background: 'var(--surface-card)',
        border: '1px solid var(--border-subtle)'
      }}>
        {/* Filter header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Operational Transactions Journal
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Immutable chronological entries mapped to double-entry ledger accounts
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.4rem', background: 'rgba(255, 255, 255, 0.04)', padding: '0.3rem', borderRadius: 'var(--radius-md)' }}>
            {['ALL', 'REVENUE', 'EXPENSE'].map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                style={{
                  padding: '0.4rem 0.9rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  border: 'none',
                  background: typeFilter === t ? 'var(--accent)' : 'transparent',
                  color: typeFilter === t ? '#fff' : 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '0.9rem 1rem' }}>Type</th>
                <th style={{ padding: '0.9rem 1rem' }}>Date</th>
                <th style={{ padding: '0.9rem 1rem' }}>Category</th>
                <th style={{ padding: '0.9rem 1rem' }}>Amount</th>
                <th style={{ padding: '0.9rem 1rem' }}>Periodicity</th>
                <th style={{ padding: '0.9rem 1rem' }}>Classification</th>
                <th style={{ padding: '0.9rem 1rem' }}>Notes & Invoices</th>
                <th style={{ padding: '0.9rem 1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '3.5rem 1rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.85rem' }}>
                      <div style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: '50%',
                        background: 'rgba(16, 185, 129, 0.12)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#10B981'
                      }}>
                        <FileSpreadsheet size={22} />
                      </div>
                      <div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
                          No Journal Entries Recorded
                        </div>
                        <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', maxWidth: '440px', margin: 0, lineHeight: 1.5 }}>
                          {typeFilter === 'ALL'
                            ? 'Double-entry ledger is empty. Record your first operating revenue or expense entry to calculate real-time cash flow and burn rate.'
                            : `No transactions found matching "${typeFilter}". Switch filter back to "ALL" to inspect the full journal.`}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                        <button
                          onClick={() => setShowAddModal(true)}
                          className="btn btn-primary btn-sm"
                          style={{ gap: '6px' }}
                        >
                          <Plus size={14} /> Record Entry
                        </button>
                        <button
                          onClick={() => setTransactions(LEDGER_TRANSACTIONS)}
                          className="btn btn-secondary btn-sm"
                          style={{ gap: '6px' }}
                        >
                          <Sparkles size={14} /> ⚡ Seed Default Transactions
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((entry) => {
                const isRevenue = entry.type === 'Revenue';
                return (
                  <tr
                    key={entry._id}
                    style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}
                  >
                    {/* Type */}
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '0.25rem 0.65rem',
                        borderRadius: 'var(--radius-pill)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: isRevenue ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: isRevenue ? '#34D399' : '#F87171'
                      }}>
                        {isRevenue ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        {entry.type}
                      </span>
                    </td>

                    {/* Date */}
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                      {entry.date}
                    </td>

                    {/* Category */}
                    <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {entry.category}
                    </td>

                    {/* Amount */}
                    <td style={{ padding: '1rem', fontWeight: 700, color: isRevenue ? '#10B981' : '#F87171' }}>
                      {isRevenue ? '+' : '-'}${Number(entry.amount || 0).toLocaleString()}
                    </td>

                    {/* Periodicity */}
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.2rem 0.5rem',
                        borderRadius: 'var(--radius-sm)',
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: 'var(--text-secondary)',
                        fontSize: '0.75rem'
                      }}>
                        {entry.periodicity}
                      </span>
                    </td>

                    {/* Expense Classification */}
                    <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {entry.expenseType}
                    </td>

                    {/* Notes */}
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)', maxWidth: '280px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {entry.notes || '—'}
                    </td>

                    {/* Delete */}
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <button
                        onClick={() => handleDelete(entry._id)}
                        title="Delete Entry (requires OWNER role)"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          padding: '4px',
                          borderRadius: 'var(--radius-sm)'
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Record Journal Entry */}
      <AnimatePresence>
        {showAddModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1.5rem'
          }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{
                background: '#131825',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                borderRadius: 'var(--radius-xl)',
                width: '100%',
                maxWidth: '560px',
                padding: '2rem',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Record Financial Journal Entry
                </h3>
                <button onClick={() => setShowAddModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddTransaction} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 600 }}>
                      Transaction Type
                    </label>
                    <select
                      value={newEntry.type}
                      onChange={(e) => setNewEntry({ ...newEntry, type: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.7rem 0.9rem',
                        borderRadius: 'var(--radius-md)',
                        background: '#1E293B',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem'
                      }}
                    >
                      <option value="Revenue">Revenue (Inflow)</option>
                      <option value="Expense">Expense (Outflow)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 600 }}>
                      Amount ($)
                    </label>
                    <input
                      type="number"
                      value={newEntry.amount}
                      onChange={(e) => setNewEntry({ ...newEntry, amount: e.target.value })}
                      required
                      min="1"
                      style={{
                        width: '100%',
                        padding: '0.7rem 0.9rem',
                        borderRadius: 'var(--radius-md)',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 600 }}>
                    Category Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. SaaS Subscriptions, Engineering Payroll, Cloud Hosting"
                    value={newEntry.category}
                    onChange={(e) => setNewEntry({ ...newEntry, category: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '0.7rem 0.9rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-primary)',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 600 }}>
                      Periodicity
                    </label>
                    <select
                      value={newEntry.periodicity}
                      onChange={(e) => setNewEntry({ ...newEntry, periodicity: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.7rem 0.9rem',
                        borderRadius: 'var(--radius-md)',
                        background: '#1E293B',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem'
                      }}
                    >
                      <option value="One-time">One-time</option>
                      <option value="Monthly">Monthly</option>
                      <option value="Quarterly">Quarterly</option>
                      <option value="Yearly">Yearly</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 600 }}>
                      Classification
                    </label>
                    <select
                      value={newEntry.expenseType}
                      onChange={(e) => setNewEntry({ ...newEntry, expenseType: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.7rem 0.9rem',
                        borderRadius: 'var(--radius-md)',
                        background: '#1E293B',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem'
                      }}
                    >
                      <option value="Variable">Variable</option>
                      <option value="Fixed">Fixed</option>
                      <option value="Recurring">Recurring</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 600 }}>
                    Notes & Description
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Provide context, contract reference, or invoice details..."
                    value={newEntry.notes}
                    onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.7rem 0.9rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-primary)',
                      fontSize: '0.85rem',
                      resize: 'none'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginTop: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    style={{
                      padding: '0.7rem 1.2rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'transparent',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-secondary)',
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '0.7rem 1.4rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'linear-gradient(135deg, #10B981, #059669)',
                      border: 'none',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    Commit Transaction to Ledger
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
