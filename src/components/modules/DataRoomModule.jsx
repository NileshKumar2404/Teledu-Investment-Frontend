import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FolderLock, FileText, Download, ShieldCheck, Clock, Plus, 
  CheckCircle2, AlertCircle, FileCheck, Eye, X, Upload
} from 'lucide-react';
import { api } from '../../api/client';
import { DATA_ROOM_DOCUMENTS } from '../../data/investmentData';

export default function DataRoomModule({ activeTicker = 'TELEDU' }) {
  const [documents, setDocuments] = useState(DATA_ROOM_DOCUMENTS);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [downloadToast, setDownloadToast] = useState(null);
  const [newDoc, setNewDoc] = useState({
    name: '',
    category: 'PITCH_DECK',
    notes: ''
  });

  useEffect(() => {
    async function loadDocs() {
      try {
        const data = await api.getCompanyDocuments(activeTicker);
        if (data && data.length > 0) {
          setDocuments(data);
        }
      } catch (err) {
        console.warn('Using offline data room', err);
      }
    }
    loadDocs();
  }, [activeTicker]);

  const categories = ['ALL', 'PITCH_DECK', 'TERM_SHEET', 'BALANCE_SHEET', 'CERTIFICATE_OF_INCORPORATION', 'BUSINESS_PLAN'];

  const filteredDocs = documents.filter(doc => {
    if (categoryFilter === 'ALL') return true;
    return doc.category === categoryFilter;
  });

  const handleDownload = (docName) => {
    setDownloadToast(`Preparing secure download for ${docName}...`);
    setTimeout(() => setDownloadToast(null), 3000);
  };

  const handleUpload = (e) => {
    e.preventDefault();
    const docObj = {
      _id: `doc-${Date.now()}`,
      name: newDoc.name || 'Due_Diligence_Document.pdf',
      category: newDoc.category,
      categoryLabel: newDoc.category.replace(/_/g, ' '),
      size: '1.8 MB',
      uploadedAt: new Date().toISOString().split('T')[0],
      status: 'UNDER_REVIEW',
      verifiedBy: 'Pending Compliance Review',
      notes: newDoc.notes || 'Uploaded via Virtual Data Room'
    };

    setDocuments([docObj, ...documents]);
    setShowUploadModal(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Toast Alert */}
      <AnimatePresence>
        {downloadToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              zIndex: 2000,
              background: '#3B82F6',
              color: '#fff',
              padding: '0.8rem 1.4rem',
              borderRadius: 'var(--radius-md)',
              fontWeight: 700,
              fontSize: '0.85rem',
              boxShadow: '0 10px 25px rgba(59, 130, 246, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Download size={16} />
            {downloadToast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '1.5rem',
        padding: '2rem',
        borderRadius: 'var(--radius-xl)',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.12) 50%, rgba(15, 23, 42, 0.6) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{ maxWidth: '640px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.85rem',
            borderRadius: 'var(--radius-pill)',
            background: 'rgba(99, 102, 241, 0.2)',
            border: '1px solid rgba(99, 102, 241, 0.4)',
            color: '#C084FC',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.05em',
            marginBottom: '0.8rem'
          }}>
            <FolderLock size={14} />
            VIRTUAL DATA ROOM (VDR) • ENCRYPTED AUDIT VAULT
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.6rem', letterSpacing: '-0.02em' }}>
            Due Diligence Data Room
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
            Institutional depository for verified pitch decks, term sheets, audited balance sheets, tax filings, and statutory incorporation certificates.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.8rem 1.4rem',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
            color: '#fff',
            border: 'none',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(139, 92, 246, 0.4)'
          }}
        >
          <Upload size={18} />
          Upload Diligence Document
        </button>
      </div>

      {/* Filter Tabs */}
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
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
          Filter Document Slot:
        </div>

        <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto' }}>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              style={{
                padding: '0.35rem 0.8rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem',
                fontWeight: 600,
                border: 'none',
                background: categoryFilter === c ? 'var(--accent)' : 'rgba(255, 255, 255, 0.05)',
                color: categoryFilter === c ? '#fff' : 'var(--text-muted)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              {c.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Documents List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.2rem' }}>
        {filteredDocs.map((doc) => {
          const isVerified = doc.status === 'VERIFIED';
          return (
            <div
              key={doc._id}
              style={{
                padding: '1.6rem',
                borderRadius: 'var(--radius-xl)',
                background: 'var(--surface-card)',
                border: isVerified ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1.2rem'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(99, 102, 241, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#818CF8'
                  }}>
                    <FileText size={22} />
                  </div>

                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '0.25rem 0.65rem',
                    borderRadius: 'var(--radius-pill)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    background: isVerified ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    color: isVerified ? '#34D399' : '#FBBF24'
                  }}>
                    {isVerified ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                    {doc.status}
                  </span>
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 700 }}>
                  {doc.categoryLabel || doc.category}
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px', wordBreak: 'break-all' }}>
                  {doc.name}
                </h3>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Size: {doc.size} • Uploaded {doc.uploadedAt}
                </div>

                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.8rem', lineHeight: 1.5 }}>
                  {doc.notes}
                </p>
              </div>

              <div style={{
                paddingTop: '1rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Sign-off: <strong>{doc.verifiedBy}</strong>
                </span>

                <button
                  onClick={() => handleDownload(doc.name)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '0.45rem 0.9rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <Download size={14} />
                  Download
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Upload Document */}
      <AnimatePresence>
        {showUploadModal && (
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
                border: '1px solid rgba(139, 92, 246, 0.35)',
                borderRadius: 'var(--radius-xl)',
                width: '100%',
                maxWidth: '520px',
                padding: '2rem',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Upload Diligence Document
                </h3>
                <button onClick={() => setShowUploadModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 600 }}>
                    Document File Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Series_A_Term_Sheet_Signed.pdf"
                    value={newDoc.name}
                    onChange={(e) => setNewDoc({ ...newDoc, name: e.target.value })}
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

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 600 }}>
                    Slot Category
                  </label>
                  <select
                    value={newDoc.category}
                    onChange={(e) => setNewDoc({ ...newDoc, category: e.target.value })}
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
                    <option value="PITCH_DECK">Pitch Deck Presentation</option>
                    <option value="TERM_SHEET">Term Sheet / SAFE Note</option>
                    <option value="BALANCE_SHEET">Audited Financial Statements</option>
                    <option value="CERTIFICATE_OF_INCORPORATION">Certificate of Incorporation</option>
                    <option value="BUSINESS_PLAN">Cap Table Dilution Model</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 600 }}>
                    Verification Context / Notes
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Add brief description, version number, or counsel note..."
                    value={newDoc.notes}
                    onChange={(e) => setNewDoc({ ...newDoc, notes: e.target.value })}
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
                    onClick={() => setShowUploadModal(false)}
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
                      background: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
                      border: 'none',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    Upload into VDR
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
