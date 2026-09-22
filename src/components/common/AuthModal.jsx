import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Lock, Mail, User, Phone, Globe, Shield, Sparkles, 
  CheckCircle2, AlertCircle, ArrowRight, Briefcase, BarChart3,
  Compass, Crown
} from 'lucide-react';
import { api, setAuthToken, setStoredUser } from '../../api/client';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Login form state
  const [loginForm, setLoginForm] = useState({
    email: 'founder@startupiq.io',
    password: ''
  });

  // Register form state
  const [registerForm, setRegisterForm] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    country: 'United States'
  });

  if (!isOpen) return null;

  // Demo Stakeholder Personas
  const demoPersonas = [
    { name: 'Alex Chen', role: 'founder', email: 'founder@startupiq.io', title: 'Founder', icon: Sparkles, color: '#60A5FA' },
    { name: 'Victoria Sterling', role: 'investor', email: 'investor@startupiq.io', title: 'Investor', icon: Briefcase, color: '#34D399' },
    { name: 'Marcus Vance', role: 'analyst', email: 'analyst@startupiq.io', title: 'Analyst', icon: BarChart3, color: '#818CF8' },
    { name: 'Dr. Sarah Jenkins', role: 'advisor', email: 'advisor@startupiq.io', title: 'Advisor', icon: Compass, color: '#FBBF24' },
    { name: 'David Miller', role: 'admin', email: 'admin@startupiq.io', title: 'Admin', icon: Shield, color: '#C084FC' },
    { name: 'Elena Rostova', role: 'super_admin', email: 'superadmin@startupiq.io', title: 'Super Admin', icon: Crown, color: '#F472B6' }
  ];

  const handleSelectPersona = (persona) => {
    const dummyUser = {
      _id: `user-${persona.role}-demo`,
      fullName: persona.name,
      email: persona.email,
      role: persona.role,
      accountStatus: 'Active',
      verified: true,
      subscription: { plan: persona.role === 'super_admin' ? 'enterprise' : 'pro' }
    };

    const dummyToken = `demo-token-${persona.role}-${Date.now()}`;
    setAuthToken(dummyToken);
    setStoredUser(dummyUser);

    setSuccessMsg(`Authenticated as ${persona.title} (${persona.name}). Workspace locked to ${persona.title} OS.`);
    setTimeout(() => {
      onAuthSuccess(dummyUser);
      onClose();
    }, 400);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.auth.login({
        email: loginForm.email,
        password: loginForm.password
      });
      setSuccessMsg('Authentication successful. Welcome back!');
      setTimeout(() => {
        onAuthSuccess(res.user);
        onClose();
      }, 500);
    } catch (err) {
      setError(err.message || 'Failed to authenticate. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (registerForm.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.auth.register(registerForm);
      setSuccessMsg('Account registered successfully! Welcome to StartupIQ.');
      setTimeout(() => {
        onAuthSuccess(res.user);
        onClose();
      }, 500);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(5, 8, 18, 0.85)',
        backdropFilter: 'blur(16px)',
        padding: '1rem',
        overflowY: 'auto'
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 10 }}
          transition={{ duration: 0.25 }}
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '560px',
            background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.96) 0%, rgba(10, 15, 30, 0.98) 100%)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-2xl)',
            boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 40px rgba(99, 102, 241, 0.15)',
            padding: '2rem',
            color: 'var(--text-primary)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '1.25rem',
              right: '1.25rem',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-full)',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)',
              cursor: 'pointer'
            }}
          >
            <X size={16} />
          </button>

          {/* Modal Header */}
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-xl)',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2))',
              border: '1px solid rgba(129, 140, 248, 0.3)',
              color: '#818CF8',
              marginBottom: '0.75rem'
            }}>
              <Shield size={22} />
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 0.4rem 0', color: '#FFFFFF' }}>
              {mode === 'login' ? 'Authenticate Stakeholder Session' : 'Create Founder Workspace'}
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
              {mode === 'login' ? 'Sign in to access your role-locked operating environment.' : 'Launch an isolated venture intelligence cockpit.'}
            </p>
          </div>

          {/* Error / Success alerts */}
          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '0.75rem 1rem',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-md)',
              color: '#F87171',
              fontSize: '0.85rem',
              marginBottom: '1rem'
            }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '0.75rem 1rem',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 'var(--radius-md)',
              color: '#34D399',
              fontSize: '0.85rem',
              marginBottom: '1rem'
            }}>
              <CheckCircle2 size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Quick Stakeholder Demo Personas (Section 2 & 3 Compliance) */}
          <div style={{
            marginBottom: '1.5rem',
            padding: '1rem',
            borderRadius: 'var(--radius-lg)',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.06)'
          }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#A5B4FC', marginBottom: '0.75rem' }}>
              ⚡ 1-Click Role Login (Role-Isolated Workspaces)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              {demoPersonas.map((p) => {
                const Icon = p.icon;
                return (
                  <button
                    key={p.role}
                    type="button"
                    onClick={() => handleSelectPersona(p)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.55rem 0.75rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(15, 23, 42, 0.7)',
                      border: `1px solid ${p.color}30`,
                      color: '#FFFFFF',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Icon size={14} color={p.color} />
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.8rem', color: p.color }}>{p.title}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{p.name}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Standard Login / Register Form */}
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', fontWeight: 600 }}>
                  Account Email
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="email"
                    required
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    placeholder="name@company.com"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.9rem 0.65rem 2.4rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-subtle)',
                      color: '#FFFFFF',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', fontWeight: 600 }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="password"
                    required
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    placeholder="••••••••••••"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.9rem 0.65rem 2.4rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-subtle)',
                      color: '#FFFFFF',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                  border: 'none',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  marginTop: '0.5rem',
                  boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)'
                }}
              >
                {loading ? 'Authenticating...' : 'Sign In with Password'}
                <ArrowRight size={16} />
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem', fontWeight: 600 }}>
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={registerForm.fullName}
                  onChange={(e) => setRegisterForm({ ...registerForm, fullName: e.target.value })}
                  placeholder="e.g. Alex Vance"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.9rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-subtle)',
                    color: '#FFFFFF',
                    fontSize: '0.85rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem', fontWeight: 600 }}>
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                  placeholder="founder@venture.io"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.9rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-subtle)',
                    color: '#FFFFFF',
                    fontSize: '0.85rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem', fontWeight: 600 }}>
                  Create Password (min 8 chars)
                </label>
                <input
                  type="password"
                  required
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                  placeholder="••••••••••••"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.9rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-subtle)',
                    color: '#FFFFFF',
                    fontSize: '0.85rem'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  border: 'none',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  marginTop: '0.5rem'
                }}
              >
                {loading ? 'Creating Founder Account...' : 'Register Founder Account'}
                <ArrowRight size={16} />
              </button>
            </form>
          )}

          {/* Mode Switcher Footer */}
          <div style={{ textAlign: 'center', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            {mode === 'login' ? (
              <span>Don't have a Founder account? <button type="button" onClick={() => setMode('register')} style={{ background: 'transparent', border: 'none', color: '#818CF8', fontWeight: 700, cursor: 'pointer', padding: 0 }}>Create Founder Workspace</button></span>
            ) : (
              <span>Already have an account? <button type="button" onClick={() => setMode('login')} style={{ background: 'transparent', border: 'none', color: '#818CF8', fontWeight: 700, cursor: 'pointer', padding: 0 }}>Sign In</button></span>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
