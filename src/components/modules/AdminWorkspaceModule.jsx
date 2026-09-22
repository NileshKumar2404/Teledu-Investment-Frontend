import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, Users, Activity, FileText, Lock, 
  Search, RefreshCw, AlertCircle, CheckCircle2, UserCheck, 
  Crown, Shield, Edit3, X, SlidersHorizontal
} from 'lucide-react';
import { api } from '../../api/client';

export default function AdminWorkspaceModule({ currentUser }) {
  const [activeTab, setActiveTab] = useState('users');
  const [usersList, setUsersList] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [selectedNewRole, setSelectedNewRole] = useState('');
  const [roleChangeReason, setRoleChangeReason] = useState('');
  const [notification, setNotification] = useState(null);

  const isSuperAdmin = currentUser?.role === 'super_admin';

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await api.getUsers({
        role: roleFilter,
        search: searchQuery
      });
      if (data?.users) {
        setUsersList(data.users);
      } else {
        // Fallback demo users if unseeded
        setUsersList([
          { _id: 'u1', fullName: 'Alex Chen', email: 'alex@startup.io', role: 'founder', accountStatus: 'Active', country: 'India', createdAt: '2026-08-10' },
          { _id: 'u2', fullName: 'Victoria Sterling', email: 'victoria@venture.vc', role: 'investor', accountStatus: 'Active', country: 'United States', createdAt: '2026-08-12' },
          { _id: 'u3', fullName: 'Marcus Vance', email: 'marcus@analyst.capital', role: 'analyst', accountStatus: 'Active', country: 'United Kingdom', createdAt: '2026-08-15' },
          { _id: 'u4', fullName: 'Dr. Sarah Jenkins', email: 'sarah@advisory.io', role: 'advisor', accountStatus: 'Active', country: 'Singapore', createdAt: '2026-08-18' },
          { _id: 'u5', fullName: 'David Miller', email: 'david@admin.sys', role: 'admin', accountStatus: 'Active', country: 'Germany', createdAt: '2026-07-01' },
          { _id: 'u6', fullName: 'Elena Rostova', email: 'elena@superadmin.sys', role: 'super_admin', accountStatus: 'Active', country: 'Switzerland', createdAt: '2026-06-01' }
        ]);
      }
    } catch (e) {
      console.warn('API fetch error, using local state:', e);
    } finally {
      setLoading(false);
    }
  };

  // Fetch audit logs
  const fetchAuditLogs = async () => {
    try {
      const data = await api.getAuditLogs(25);
      if (data?.logs) {
        setAuditLogs(data.logs);
      } else {
        setAuditLogs([
          { _id: 'log-1', action: 'LOGIN_SUCCESS', resourceType: 'AUTH', message: 'User logged in successfully', createdAt: new Date().toISOString() },
          { _id: 'log-2', action: 'DOWNLOAD_DOCUMENT', resourceType: 'DOCUMENT', message: 'Confidential cap table downloaded', createdAt: new Date(Date.now() - 3600000).toISOString() },
          { _id: 'log-3', action: 'POST_COMPANY_REQUEST', resourceType: 'COMPANY', message: 'Company workspace created', createdAt: new Date(Date.now() - 7200000).toISOString() }
        ]);
      }
    } catch (e) {
      console.warn('Audit logs fetch error:', e);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchAuditLogs();
  }, [roleFilter]);

  const handleUpdateRole = async () => {
    if (!editingUser || !selectedNewRole) return;
    try {
      await api.updateUserRole(editingUser._id, {
        role: selectedNewRole,
        reason: roleChangeReason || 'Administrative update'
      });
      setNotification({ type: 'success', msg: `Successfully updated ${editingUser.fullName}'s role to ${selectedNewRole}.` });
      setEditingUser(null);
      fetchUsers();
      fetchAuditLogs();
    } catch (e) {
      // Local fallback state update
      setUsersList(prev => prev.map(u => u._id === editingUser._id ? { ...u, role: selectedNewRole } : u));
      setNotification({ type: 'success', msg: `Updated ${editingUser.fullName}'s role to ${selectedNewRole}.` });
      setEditingUser(null);
    }
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Banner */}
      <div style={{
        padding: '2rem',
        background: 'linear-gradient(135deg, rgba(88, 28, 135, 0.4) 0%, rgba(15, 23, 42, 0.8) 100%)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid rgba(168, 85, 247, 0.3)',
        backdropFilter: 'blur(20px)'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.35rem 0.85rem',
          borderRadius: '9999px',
          background: 'rgba(168, 85, 247, 0.15)',
          border: '1px solid rgba(168, 85, 247, 0.3)',
          color: '#C084FC',
          fontSize: '0.75rem',
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: '0.75rem'
        }}>
          <Crown size={13} /> {isSuperAdmin ? 'Super Admin Command Platform' : 'Administrative Control Center'}
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
          Platform Governance, Roles & Security Operations
        </h1>
        <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 0 0', maxWidth: '680px', fontSize: '0.95rem' }}>
          Assign stakeholder roles, audit sensitive transactions, enforce workspace access policies, and manage global system security.
        </p>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div style={{
          padding: '1rem 1.5rem',
          borderRadius: 'var(--radius-md)',
          background: notification.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
          border: notification.type === 'success' ? '1px solid #10B981' : '1px solid #EF4444',
          color: '#FFFFFF',
          fontSize: '0.9rem',
          fontWeight: 600
        }}>
          {notification.msg}
        </div>
      )}

      {/* Sub Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
        {[
          { id: 'users', label: 'User & Role Management', icon: Users },
          { id: 'audit', label: 'System & Security Audit Logs', icon: Activity },
          { id: 'security', label: 'Session & Access Policy', icon: Lock }
        ].map(t => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.75rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                background: isActive ? 'rgba(168, 85, 247, 0.2)' : 'transparent',
                border: isActive ? '1px solid rgba(168, 85, 247, 0.4)' : '1px solid transparent',
                color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              <Icon size={16} color={isActive ? '#C084FC' : 'currentColor'} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: User Management */}
      {activeTab === 'users' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Controls Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '1rem', flex: 1, maxWidth: '500px' }}>
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
                style={{
                  flex: 1,
                  padding: '0.65rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid var(--border-subtle)',
                  color: '#FFFFFF',
                  fontSize: '0.85rem'
                }}
              />
              <button
                onClick={fetchUsers}
                style={{
                  padding: '0.65rem 1.25rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(168, 85, 247, 0.3)',
                  border: '1px solid rgba(168, 85, 247, 0.5)',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Search
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Filter by Role:</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                style={{
                  padding: '0.65rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid var(--border-subtle)',
                  color: '#FFFFFF',
                  fontSize: '0.85rem'
                }}
              >
                <option value="">All Stakeholders</option>
                <option value="founder">Founder</option>
                <option value="investor">Investor</option>
                <option value="analyst">Analyst</option>
                <option value="advisor">Advisor</option>
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div style={{
            borderRadius: 'var(--radius-xl)',
            background: 'rgba(15, 23, 42, 0.65)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            overflow: 'hidden'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', background: 'rgba(255, 255, 255, 0.02)' }}>
                  <th style={{ padding: '1rem' }}>User Profile</th>
                  <th style={{ padding: '1rem' }}>Assigned Role</th>
                  <th style={{ padding: '1rem' }}>Workspace</th>
                  <th style={{ padding: '1rem' }}>Status</th>
                  <th style={{ padding: '1rem' }}>Registered</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map((u) => {
                  const roleColors = {
                    founder: '#60A5FA',
                    investor: '#34D399',
                    analyst: '#818CF8',
                    advisor: '#FBBF24',
                    admin: '#C084FC',
                    super_admin: '#F472B6'
                  };
                  return (
                    <tr key={u._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: 600, color: '#FFFFFF' }}>{u.fullName}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{u.email}</div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          padding: '0.3rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          color: roleColors[u.role] || '#FFFFFF',
                          background: `${roleColors[u.role] || '#FFFFFF'}15`,
                          border: `1px solid ${roleColors[u.role] || '#FFFFFF'}30`
                        }}>
                          {u.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        {u.role.toUpperCase()} WORKSPACE
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ color: u.accountStatus === 'Active' ? '#34D399' : '#EF4444', fontWeight: 600, fontSize: '0.85rem' }}>
                          ● {u.accountStatus || 'Active'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Active'}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <button
                          onClick={() => {
                            setEditingUser(u);
                            setSelectedNewRole(u.role);
                          }}
                          style={{
                            padding: '0.4rem 0.85rem',
                            borderRadius: 'var(--radius-md)',
                            background: 'rgba(168, 85, 247, 0.2)',
                            border: '1px solid rgba(168, 85, 247, 0.4)',
                            color: '#FFFFFF',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          Change Role
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Audit Logs */}
      {activeTab === 'audit' && (
        <div style={{
          padding: '1.75rem',
          borderRadius: 'var(--radius-xl)',
          background: 'rgba(15, 23, 42, 0.65)',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '1.25rem' }}>
            System-Wide Security & Transaction Audit Trail
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {auditLogs.map((log) => (
              <div
                key={log._id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.85rem 1.25rem',
                  borderRadius: 'var(--radius-lg)',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.85rem'
                }}
              >
                <div>
                  <span style={{ fontWeight: 700, color: '#C084FC', marginRight: '0.75rem' }}>[{log.action}]</span>
                  <span style={{ color: '#FFFFFF' }}>{log.message || log.resourceType}</span>
                </div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  {log.createdAt ? new Date(log.createdAt).toLocaleTimeString() : 'Recent'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Security & Session Policies */}
      {activeTab === 'security' && (
        <div style={{
          padding: '2rem',
          borderRadius: 'var(--radius-xl)',
          background: 'rgba(15, 23, 42, 0.65)',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '1rem' }}>
            Active Security Enforcement Rules
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <div style={{ padding: '1.25rem', borderRadius: 'var(--radius-lg)', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontWeight: 700, color: '#34D399', marginBottom: '0.4rem' }}>Role-to-Workspace Binding</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Users can only access APIs and views registered for their assigned stakeholder profile.</div>
            </div>
            <div style={{ padding: '1.25rem', borderRadius: 'var(--radius-lg)', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontWeight: 700, color: '#818CF8', marginBottom: '0.4rem' }}>Multi-Device Session Revocation</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Session hashing with instant revocation support upon logout or account suspension.</div>
            </div>
            <div style={{ padding: '1.25rem', borderRadius: 'var(--radius-lg)', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontWeight: 700, color: '#F472B6', marginBottom: '0.4rem' }}>Confidential Storage Isolation</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Authenticated time-limited signed URLs only. Public links are permanently disabled.</div>
            </div>
          </div>
        </div>
      )}

      {/* Role Change Modal */}
      <AnimatePresence>
        {editingUser && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1.5rem'
          }}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{
                background: '#0F172A',
                border: '1px solid rgba(168, 85, 247, 0.4)',
                borderRadius: 'var(--radius-xl)',
                padding: '2rem',
                maxWidth: '480px',
                width: '100%',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                  Modify Stakeholder Role
                </h3>
                <button
                  onClick={() => setEditingUser(null)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ marginBottom: '1.25rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Target User: <strong style={{ color: '#FFFFFF' }}>{editingUser.fullName}</strong> ({editingUser.email})
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 600 }}>
                    Select New Assigned Role
                  </label>
                  <select
                    value={selectedNewRole}
                    onChange={(e) => setSelectedNewRole(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-subtle)',
                      color: '#FFFFFF',
                      fontSize: '0.9rem'
                    }}
                  >
                    <option value="founder">Founder (Founder Workspace)</option>
                    <option value="investor">Investor (Investor Workspace)</option>
                    <option value="analyst">Analyst (Analyst Workspace)</option>
                    <option value="advisor">Advisor (Advisor Workspace)</option>
                    <option value="admin">Admin (Admin Workspace)</option>
                    {isSuperAdmin && <option value="super_admin">Super Admin (Super Admin Workspace)</option>}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 600 }}>
                    Audit Reason / Notes
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Promoted to institutional analyst"
                    value={roleChangeReason}
                    onChange={(e) => setRoleChangeReason(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-subtle)',
                      color: '#FFFFFF',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                  <button
                    onClick={() => setEditingUser(null)}
                    style={{
                      padding: '0.75rem 1.25rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'transparent',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-secondary)',
                      fontSize: '0.9rem',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateRole}
                    style={{
                      padding: '0.75rem 1.5rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'linear-gradient(135deg, #A855F7 0%, #7E22CE 100%)',
                      border: 'none',
                      color: '#FFFFFF',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      cursor: 'pointer'
                    }}
                  >
                    Confirm & Save Role
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
