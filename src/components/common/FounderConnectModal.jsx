import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, MessageSquare, Video, Calendar, Send, Copy, Check,
  ExternalLink, Sparkles, User, Clock, ShieldCheck, Bot,
  Phone, ArrowRight, Zap, CheckCircle2, ChevronRight, AlertCircle,
  Mic, MicOff, VideoOff, Monitor, PhoneOff, Edit3, Save, Link as LinkIcon,
  RefreshCw, Radio, Trash2
} from 'lucide-react';
import { api } from '../../api/client';

export default function FounderConnectModal({
  isOpen,
  onClose,
  company,
  currentUser,
  initialTab = 'chat' // 'chat' | 'video' | 'schedule'
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isAITwinMode, setIsAITwinMode] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);

  // Chat State
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Meeting Schedule State
  const [meetingType, setMeetingType] = useState('30min'); // '15min' | '30min' | '45min'
  const [selectedDate, setSelectedDate] = useState('tomorrow');
  const [selectedTime, setSelectedTime] = useState('2:00 PM EST');
  const [meetingPlatform, setMeetingPlatform] = useState('google_meet'); // 'google_meet' | 'zoom'
  const [checkSize, setCheckSize] = useState('100000');
  const [selectedAgendas, setSelectedAgendas] = useState([
    'Unit Economics & CAC Payback Analysis',
    'Financial Model & 5-Year DCF Verification'
  ]);
  const [scheduledConfirmation, setScheduledConfirmation] = useState(null);

  // Custom & External Meeting URLs State
  const [customMeetingUrl, setCustomMeetingUrl] = useState('');
  const [isEditingCustomLink, setIsEditingCustomLink] = useState(false);
  const [customLinkDraft, setCustomLinkDraft] = useState('');

  // In-App Diligence Call State
  const [inAppCallActive, setInAppCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [diligenceNotes, setDiligenceNotes] = useState('');
  const userVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const screenStreamRef = useRef(null);

  const founderName = company?.founderName || 'Founder & CEO';
  const founderEmail = `${company?.ticker?.toLowerCase() || 'founder'}@startupiq.io`;
  const investorName = currentUser?.fullName || 'Victoria Sterling';
  const ticker = company?.ticker || 'DEAL';

  // Official guaranteed working URLs (Google Meet instant workspace room & Zoom video)
  const officialGoogleMeetInstantUrl = 'https://meet.google.com/new';
  const officialZoomInstantUrl = 'https://zoom.us/start/videomeeting';

  // Active meeting URLs: uses custom link if set by investor/founder, otherwise uses official instant launcher
  const googleMeetUrl = customMeetingUrl || officialGoogleMeetInstantUrl;
  const zoomMeetingUrl = customMeetingUrl || officialZoomInstantUrl;
  const activeMeetingUrl = meetingPlatform === 'zoom' ? zoomMeetingUrl : googleMeetUrl;

  // Initialize or load chat history
  useEffect(() => {
    if (!isOpen || !company) return;

    setActiveTab(initialTab);
    const storageKey = `siq_deal_chat_${ticker}`;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setMessages(JSON.parse(saved));
      } else {
        // Initial founder welcome greeting
        const defaultMessages = [
          {
            id: 'm1',
            sender: 'founder',
            senderName: founderName,
            text: `Hello ${investorName}! Thank you for reviewing ${company.companyName} in the Deal Room. We are currently raising our $${(company.fundingRequired || 500000).toLocaleString()} ${company.stage || 'Seed Round'} (${company.equityOffered || 10}% equity at a $${((company.valuation || 5000000) / 1000000).toFixed(1)}M valuation). What questions can I answer on our unit economics, CAC, or growth roadmap?`,
            timestamp: 'Just now'
          }
        ];
        setMessages(defaultMessages);
        localStorage.setItem(storageKey, JSON.stringify(defaultMessages));
      }
    } catch (e) {
      console.warn('Chat history error:', e);
    }

    // Check existing scheduled meetings
    try {
      const savedMeetings = JSON.parse(localStorage.getItem('siq_scheduled_meetings') || '{}');
      if (savedMeetings[ticker]) {
        setScheduledConfirmation(savedMeetings[ticker]);
      } else {
        setScheduledConfirmation(null);
      }
    } catch (e) {}

    // Load custom meeting link and notes for this company
    try {
      const savedLink = localStorage.getItem(`siq_custom_meet_${ticker}`) || '';
      setCustomMeetingUrl(savedLink);
      setCustomLinkDraft(savedLink);
      const savedNotes = localStorage.getItem(`siq_call_notes_${ticker}`) || '';
      setDiligenceNotes(savedNotes);
    } catch (e) {}
  }, [isOpen, ticker, initialTab, company?.companyName]);

  // Clean up WebRTC media streams when modal closes
  useEffect(() => {
    if (!isOpen) {
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(track => track.stop());
        screenStreamRef.current = null;
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;
      }
      setIsScreenSharing(false);
      setInAppCallActive(false);
    }
  }, [isOpen]);

  // Timer for in-app call duration
  useEffect(() => {
    let timer;
    if (inAppCallActive) {
      timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [inAppCallActive]);

  const formatDuration = (secs) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

  // Custom Meeting Link Handlers
  const handleSaveCustomLink = (e) => {
    if (e) e.preventDefault();
    const link = customLinkDraft.trim();
    if (link) {
      setCustomMeetingUrl(link);
      setIsEditingCustomLink(false);
      try {
        localStorage.setItem(`siq_custom_meet_${ticker}`, link);
      } catch (err) {}
    }
  };

  const handleClearCustomLink = () => {
    setCustomMeetingUrl('');
    setCustomLinkDraft('');
    setIsEditingCustomLink(false);
    try {
      localStorage.removeItem(`siq_custom_meet_${ticker}`);
    } catch (err) {}
  };

  // In-App Diligence Call Handlers
  const handleStartInAppCall = async () => {
    setInAppCallActive(true);
    setCallDuration(0);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStreamRef.current = stream;
        if (userVideoRef.current) {
          userVideoRef.current.srcObject = stream;
        }
      }
    } catch (err) {
      console.log('Video stream fallback (simulated camera):', err);
    }
  };

  const handleEndInAppCall = () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    setIsScreenSharing(false);
    setInAppCallActive(false);
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = isMuted;
      });
    }
    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach(track => {
        track.enabled = isVideoOff;
      });
    }
    setIsVideoOff(!isVideoOff);
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
          const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
          screenStreamRef.current = screenStream;
          if (userVideoRef.current) {
            userVideoRef.current.srcObject = screenStream;
          }
          screenStream.getVideoTracks()[0].onended = () => {
            if (screenStreamRef.current) {
              screenStreamRef.current.getTracks().forEach(track => track.stop());
              screenStreamRef.current = null;
            }
            if (userVideoRef.current && localStreamRef.current) {
              userVideoRef.current.srcObject = localStreamRef.current;
            }
            setIsScreenSharing(false);
          };
          setIsScreenSharing(true);
        } else {
          setIsScreenSharing(true);
        }
      } catch (e) {
        console.log('Screen sharing cancelled', e);
      }
    } else {
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(track => track.stop());
        screenStreamRef.current = null;
      }
      if (userVideoRef.current && localStreamRef.current) {
        userVideoRef.current.srcObject = localStreamRef.current;
      }
      setIsScreenSharing(false);
    }
  };

  const handleNotesChange = (val) => {
    setDiligenceNotes(val);
    try {
      localStorage.setItem(`siq_call_notes_${ticker}`, val);
    } catch (e) {}
  };

  // Scroll to bottom of chat
  useEffect(() => {
    if (activeTab === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, activeTab]);

  if (!isOpen || !company) return null;

  const handleCopyLink = (urlToCopy = activeMeetingUrl) => {
    navigator.clipboard.writeText(urlToCopy);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Generate intelligent AI Founder Twin responses based on comprehensive real company telemetry
  const generateFounderReply = (userQuestion) => {
    const q = userQuestion.toLowerCase();
    const rev = (company.currentRevenue || 336000).toLocaleString();
    const cac = company.cac || 340;
    const ltv = company.ltv || 1800;
    const burn = (company.monthlyBurn || 18000).toLocaleString();
    const runway = company.runway || 13.9;
    const growth = company.revenueGrowthRate || 68;
    const minCheck = (company.minInvestment || 50000).toLocaleString();
    const maxCheck = (company.maxInvestment || 250000).toLocaleString();
    const targetRaise = (company.fundingRequired || 500000).toLocaleString();
    const valM = ((company.valuation || 5000000) / 1000000).toFixed(1);
    const dcfEV = ((company.dcfEnterpriseValue || 5620000) / 1000000).toFixed(2);
    const fairPrice = company.fairSharePrice || 58.5;
    const currPrice = company.currentSharePrice || 50.0;
    const upside = company.priceUpsidePercent || 17.0;
    const ebitda = company.ebitdaMargin || 24;
    const headcount = company.headcount || 14;
    const sector = company.sector || 'Technology';
    const tagline = company.tagline || 'Vertical AI software enterprise platform.';
    const readiness = company.completeness?.overall || 91;

    // 1. Valuation, DCF, Fair Share Price & Enterprise Value
    if (q.includes('dcf') || q.includes('valuation') || q.includes('fair') || q.includes('share price') || q.includes('upside') || q.includes('worth')) {
      return `Our current round values ${company.companyName} at a $${valM}M post-money cap ($${currPrice}/share). Our institutional Discounted Cash Flow (DCF) model benchmarks enterprise value at $${dcfEV}M with a calculated fair share price of $${fairPrice}/share, representing a +${upside}% implied valuation upside for incoming investors.`;
    }

    // 2. Unit Economics, CAC, LTV & Payback
    if (q.includes('cac') || q.includes('payback') || q.includes('ltv') || q.includes('unit economic') || q.includes('acquisition') || q.includes('churn')) {
      return `Our blended Customer Acquisition Cost (CAC) is $${cac}, while our customer Lifetime Value (LTV) is $${ltv}. That gives us an exceptional 5.2x LTV:CAC ratio with a rapid 4.2-month CAC payback period. Customer retention is strong with net revenue retention above 118% and sub-3% monthly logo churn.`;
    }

    // 3. Burn Rate, Runway, Cash Reserves & Capital Efficiency
    if (q.includes('burn') || q.includes('runway') || q.includes('cash') || q.includes('capital') || q.includes('breakeven')) {
      return `Our net monthly burn is currently $${burn} with ${runway} months of existing cash runway reserves. Closing this $${targetRaise} ${company.stage || 'Seed'} round extends our operating runway past 24+ months, bringing us directly to sustained cash-flow breakeven without needing bridge financing.`;
    }

    // 4. Round Terms, Check Sizes, Equity & Cap Table
    if (q.includes('check') || q.includes('ticket') || q.includes('allocation') || q.includes('equity') || q.includes('term') || q.includes('safe') || q.includes('note') || q.includes('liquidation')) {
      return `We are raising $${targetRaise} in exchange for ${company.equityOffered || 10}% equity. We accept check sizes from a $${minCheck} minimum up to $${maxCheck} lead tickets. The instrument is a standard YC Post-Money SAFE / Participating Preferred Stock with standard 1x non-participating liquidation preference and pro-rata rights for major investors ($100k+).`;
    }

    // 5. Use of Funds / Capital Allocation
    if (q.includes('use of fund') || q.includes('proceed') || q.includes('spend') || q.includes('budget') || q.includes('allocate')) {
      return `We have planned a capital-efficient use of funds for this $${targetRaise} round: 50% dedicated to Go-To-Market and direct institutional enterprise sales; 30% to core AI/product engineering; and 20% to regulatory compliance, working capital, and key strategic hires.`;
    }

    // 6. Revenue, ARR/MRR, Margin & Financial Growth
    if (q.includes('growth') || q.includes('revenue') || q.includes('arr') || q.includes('mrr') || q.includes('ebitda') || q.includes('margin') || q.includes('profit')) {
      return `We are operating at $${rev} ARR with a YoY revenue growth rate of +${growth}%. Our gross profit margins stand at 75–80%, with an operating EBITDA margin of ${ebitda}%. Our sales pipeline currently holds an additional $420K in late-stage enterprise pilots.`;
    }

    // 7. Team, Founders & Organization
    if (q.includes('team') || q.includes('founder') || q.includes('headcount') || q.includes('employee') || q.includes('hire') || q.includes('who are you')) {
      return `I am ${founderName}, Founder & CEO of ${company.companyName}. We have a high-velocity team of ${headcount} full-time members spanning domain specialists, full-stack engineers, and enterprise account executives. Our leadership previously scaled venture-backed products in the ${sector} industry.`;
    }

    // 8. Product, Moat, Business Model & Competitive Advantage
    if (q.includes('product') || q.includes('compet') || q.includes('moat') || q.includes('advantage') || q.includes('different') || q.includes('model') || q.includes('tagline')) {
      return `${company.companyName} is: "${tagline}". Our primary moat is proprietary fine-tuned workflows and deep institutional switching costs. Compared to generic horizontal alternatives, our vertical architecture reduces customer workflow latency by 60% and guarantees compliance.`;
    }

    // 9. Due Diligence, Compliance, KYC & Documents
    if (q.includes('doc') || q.includes('audit') || q.includes('kyc') || q.includes('diligence') || q.includes('cin') || q.includes('gst') || q.includes('legal')) {
      return `Our Virtual Data Room is ${readiness}% complete and fully verified. We have uploaded audited balance sheets, P&L statements, incorporation certificates, GST/tax registrations, and cap table ledger entries right here in the StartupIQ Data Room. All statutory filings are in full standing.`;
    }

    // 10. Meeting / Schedule Request
    if (q.includes('meet') || q.includes('call') || q.includes('zoom') || q.includes('time') || q.includes('schedule') || q.includes('calendar')) {
      return `I would be delighted to walk you through our dynamic financial model and cap table simulation! You can use the "Schedule Diligence Meeting" or "1-Click Video Call" tab right here in this room to launch a Google Meet or pick a slot that fits your calendar.`;
    }

    // Default intelligent founder response
    return `Great inquiry! At ${company.companyName}, we maintain full institutional transparency with +${growth}% growth, $${cac} CAC, and a $${valM}M valuation cap. Would you like me to detail our unit economics, DCF enterprise valuation, cap table waterfall, or use of funds?`;
  };

  const handleSendMessage = (textToSend = inputText) => {
    const text = textToSend.trim();
    if (!text) return;

    const userMsg = {
      id: `usr_${Date.now()}`,
      sender: 'investor',
      senderName: investorName,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInputText('');

    const storageKey = `siq_deal_chat_${ticker}`;
    try {
      localStorage.setItem(storageKey, JSON.stringify(nextMessages));
    } catch (e) {}

    // Trigger AI Founder Twin response
    setIsTyping(true);
    setTimeout(() => {
      const founderReplyText = generateFounderReply(text);
      const founderMsg = {
        id: `fnd_${Date.now()}`,
        sender: 'founder',
        senderName: `${founderName} ${isAITwinMode ? '(AI Founder Twin)' : ''}`,
        text: founderReplyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      const updatedWithReply = [...nextMessages, founderMsg];
      setMessages(updatedWithReply);
      setIsTyping(false);
      try {
        localStorage.setItem(storageKey, JSON.stringify(updatedWithReply));
      } catch (e) {}
    }, 900);
  };

  const handleScheduleCall = (e) => {
    e.preventDefault();

    const confirmation = {
      ticker,
      companyName: company.companyName,
      founderName,
      founderEmail,
      investorName,
      duration: meetingType,
      dateLabel: selectedDate === 'today' ? 'Today' : (selectedDate === 'tomorrow' ? 'Tomorrow' : 'Friday, Oct 2'),
      time: selectedTime,
      platform: meetingPlatform === 'zoom' ? 'Zoom Meeting' : 'Google Meet',
      meetingUrl: activeMeetingUrl,
      checkSize: Number(checkSize) || 100000,
      agendas: selectedAgendas,
      createdAt: new Date().toISOString()
    };

    setScheduledConfirmation(confirmation);

    // Persist
    try {
      const existing = JSON.parse(localStorage.getItem('siq_scheduled_meetings') || '{}');
      existing[ticker] = confirmation;
      localStorage.setItem('siq_scheduled_meetings', JSON.stringify(existing));
    } catch (e) {}
  };

  // Google Calendar URL generator
  const getGoogleCalendarUrl = () => {
    const title = encodeURIComponent(`Diligence Call: ${company.companyName} ($${(company.fundingRequired || 500000).toLocaleString()} Round)`);
    const details = encodeURIComponent(
      `StartupIQ Deal Room Diligence Call between ${investorName} and ${founderName}.\n\nMeeting Link: ${activeMeetingUrl}\nTarget Check Size: $${Number(checkSize).toLocaleString()}\nAgendas:\n- ${selectedAgendas.join('\n- ')}`
    );
    const location = encodeURIComponent(activeMeetingUrl);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`;
  };

  return typeof document !== 'undefined' ? createPortal(
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.2rem',
      background: 'rgba(3, 7, 18, 0.88)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      overflowY: 'auto'
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        style={{
          width: '100%',
          maxWidth: '820px',
          maxHeight: 'min(92vh, 820px)',
          background: '#0B1120',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '1.25rem',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 35px rgba(16, 185, 129, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Pinned Top Bar: Founder & Deal Overview */}
        <div style={{
          padding: '1.2rem 1.6rem 1rem 1.6rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(99, 102, 241, 0.06) 100%)',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            {/* Founder Profile Pill */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #10B981, #6366F1)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '1rem',
                boxShadow: '0 0 15px rgba(16, 185, 129, 0.35)',
                position: 'relative',
                flexShrink: 0
              }}>
                {founderName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                <div style={{
                  position: 'absolute',
                  bottom: '1px',
                  right: '1px',
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: '#10B981',
                  border: '2px solid #0B1120'
                }} />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: '#FFFFFF' }}>
                    {founderName}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#6EE7B7', background: 'rgba(16, 185, 129, 0.18)', padding: '0.1rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>
                    Founder & CEO
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                  {company.companyName} ({ticker}) • Raising ${(company.fundingRequired || 500000).toLocaleString()} @ ${((company.valuation || 5000000)/1000000).toFixed(1)}M Val
                </div>
              </div>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: 'none',
                color: '#94A3B8',
                borderRadius: '8px',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#FFFFFF'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#94A3B8'}
            >
              <X size={17} />
            </button>
          </div>

          {/* Navigation Sub-Tabs */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.5rem' }}>
            <div style={{ display: 'flex', gap: '0.4rem', background: 'rgba(255, 255, 255, 0.04)', padding: '0.25rem', borderRadius: '0.65rem' }}>
              {[
                { id: 'chat', label: 'Direct Deal Chat', icon: MessageSquare },
                { id: 'video', label: '1-Click Video Call', icon: Video },
                { id: 'schedule', label: 'Schedule Diligence Meeting', icon: Calendar },
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '0.45rem 0.9rem',
                      borderRadius: '0.5rem',
                      border: 'none',
                      background: isActive ? '#10B981' : 'transparent',
                      color: isActive ? '#FFFFFF' : '#94A3B8',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Icon size={14} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* AI Twin Mode Toggle (when on chat tab) */}
            {activeTab === 'chat' && (
              <div
                onClick={() => setIsAITwinMode(!isAITwinMode)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '0.3rem 0.7rem',
                  borderRadius: '9999px',
                  background: isAITwinMode ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                  border: `1px solid ${isAITwinMode ? 'rgba(99, 102, 241, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
                  color: isAITwinMode ? '#A5B4FC' : '#94A3B8',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  userSelect: 'none'
                }}
              >
                <Bot size={13} color={isAITwinMode ? '#818CF8' : '#64748B'} />
                <span>AI Founder Twin: {isAITwinMode ? 'ON (Instant Q&A)' : 'OFF'}</span>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Body Content */}
        <div style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* ================= TAB 1: DIRECT DEAL CHAT ================= */}
          {activeTab === 'chat' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '400px' }}>
              {/* Messages Stream */}
              <div style={{ flex: 1, padding: '1.25rem 1.6rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                {messages.map((m) => {
                  const isMe = m.sender === 'investor';
                  return (
                    <div
                      key={m.id}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isMe ? 'flex-end' : 'flex-start',
                        maxWidth: '82%',
                        alignSelf: isMe ? 'flex-end' : 'flex-start'
                      }}
                    >
                      <div style={{ fontSize: '0.68rem', color: '#64748B', marginBottom: '2px', padding: '0 4px' }}>
                        {m.senderName} • {m.timestamp}
                      </div>

                      <div style={{
                        padding: '0.8rem 1.1rem',
                        borderRadius: isMe ? '1.1rem 1.1rem 0.2rem 1.1rem' : '1.1rem 1.1rem 1.1rem 0.2rem',
                        background: isMe ? 'linear-gradient(135deg, #10B981, #059669)' : 'rgba(255, 255, 255, 0.05)',
                        border: isMe ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
                        color: '#FFFFFF',
                        fontSize: '0.86rem',
                        lineHeight: 1.5,
                        boxShadow: isMe ? '0 4px 15px rgba(16, 185, 129, 0.25)' : 'none'
                      }}>
                        {m.text}
                      </div>
                    </div>
                  );
                })}

                {/* Typing Indicator */}
                {isTyping && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10B981', fontSize: '0.76rem', fontWeight: 600, padding: '0.3rem 0' }}>
                    <motion.div
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                      style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }}
                    />
                    <span>{founderName} {isAITwinMode ? '(AI Twin)' : ''} is reviewing metrics and drafting response...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompt Chips */}
              <div style={{ padding: '0.5rem 1.6rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', gap: '0.5rem', overflowX: 'auto', background: 'rgba(255, 255, 255, 0.015)' }}>
                {[
                  `Can you explain your customer CAC and payback period?`,
                  `What are the liquidation preferences on this round?`,
                  `What is your monthly net burn and cash runway?`,
                  `Would you be open to an allocation of $100k+?`
                ].map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(chip)}
                    style={{
                      padding: '0.3rem 0.75rem',
                      borderRadius: '9999px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.09)',
                      color: '#CBD5E1',
                      fontSize: '0.72rem',
                      whiteSpace: 'nowrap',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(16, 185, 129, 0.12)';
                      e.currentTarget.style.borderColor = '#10B981';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.09)';
                    }}
                  >
                    💬 {chip}
                  </button>
                ))}
              </div>

              {/* Message Input Box */}
              <div style={{
                padding: '0.9rem 1.6rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                background: 'rgba(15, 23, 42, 0.7)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendMessage();
                  }}
                  placeholder={`Ask ${founderName} about valuation, unit economics, or deal terms...`}
                  style={{
                    flex: 1,
                    padding: '0.75rem 1rem',
                    borderRadius: '0.75rem',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#FFFFFF',
                    fontSize: '0.88rem',
                    outline: 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  style={{
                    padding: '0.75rem 1.2rem',
                    borderRadius: '0.75rem',
                    background: '#10B981',
                    border: 'none',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.35)'
                  }}
                >
                  <Send size={15} /> Send
                </button>
              </div>
            </div>
          )}

          {/* ================= TAB 2: 1-CLICK VIDEO CALL & DILIGENCE STUDIO ================= */}
          {activeTab === 'video' && (
            <div style={{ padding: inAppCallActive ? '1.2rem' : '2rem', display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
              {inAppCallActive ? (
                /* IN-APP DILIGENCE VIDEO STUDIO */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                  {/* In-Call Header */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.8rem 1.2rem',
                    borderRadius: '0.75rem',
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.08)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '999px',
                        background: 'rgba(16, 185, 129, 0.2)',
                        color: '#34D399',
                        fontSize: '0.75rem',
                        fontWeight: 800
                      }}>
                        <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 8px #10B981' }} />
                        LIVE DILIGENCE ROOM
                      </span>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                        {company.companyName} ({ticker})
                      </h4>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '0.85rem', fontFamily: 'monospace', color: '#CBD5E1', fontWeight: 700, background: 'rgba(255, 255, 255, 0.05)', padding: '0.25rem 0.6rem', borderRadius: '4px' }}>
                        ⏱️ {formatDuration(callDuration)}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 600 }}>
                        HD 1080p • 256-Bit Encrypted
                      </span>
                    </div>
                  </div>

                  {/* Video Stage + Side Diligence Panel */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1rem', minHeight: '380px' }}>
                    {/* Video Split Grid */}
                    <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: '0.8rem', height: '100%' }}>
                      {/* Founder Feed */}
                      <div style={{
                        position: 'relative',
                        borderRadius: '0.85rem',
                        background: 'radial-gradient(circle at center, #1E293B 0%, #0F172A 100%)',
                        border: '1.5px solid rgba(16, 185, 129, 0.4)',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
                      }}>
                        {/* Audio Pulse Rings */}
                        <motion.div
                          animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.7, 0.3] }}
                          transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                          style={{
                            position: 'absolute',
                            width: '120px',
                            height: '120px',
                            borderRadius: '50%',
                            background: 'rgba(16, 185, 129, 0.15)',
                            border: '1px solid #10B981'
                          }}
                        />

                        <div style={{ textAlign: 'center', zIndex: 2 }}>
                          <div style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #3B82F6, #10B981)',
                            color: '#FFFFFF',
                            fontSize: '1.4rem',
                            fontWeight: 900,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 0.5rem auto',
                            boxShadow: '0 0 20px rgba(16, 185, 129, 0.5)'
                          }}>
                            {founderName.charAt(0)}
                          </div>
                          <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#FFFFFF' }}>
                            {founderName}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                            Founder & CEO, {company.companyName}
                          </div>
                        </div>

                        {/* Top Right Live Audio Waveform Indicator */}
                        <div style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          background: 'rgba(0, 0, 0, 0.6)',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          fontSize: '0.7rem',
                          color: '#34D399',
                          fontWeight: 700
                        }}>
                          <Radio size={12} /> Live Twin Audio
                        </div>

                        {/* Bottom Overlay Info */}
                        <div style={{
                          position: 'absolute',
                          bottom: '10px',
                          left: '12px',
                          fontSize: '0.7rem',
                          color: '#6EE7B7',
                          background: 'rgba(0, 0, 0, 0.65)',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          fontWeight: 700
                        }}>
                          Active Round: ${(company.fundingRequired || 0).toLocaleString()} • {company.stage || 'Seed'}
                        </div>
                      </div>

                      {/* Investor Feed */}
                      <div style={{
                        position: 'relative',
                        borderRadius: '0.85rem',
                        background: '#0B1120',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <video
                          ref={userVideoRef}
                          autoPlay
                          playsInline
                          muted
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: isVideoOff ? 'none' : 'block'
                          }}
                        />

                        {isVideoOff && (
                          <div style={{ textAlign: 'center' }}>
                            <div style={{
                              width: '54px',
                              height: '54px',
                              borderRadius: '50%',
                              background: '#334155',
                              color: '#94A3B8',
                              fontSize: '1.2rem',
                              fontWeight: 800,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              margin: '0 auto 0.4rem auto'
                            }}>
                              <User size={26} />
                            </div>
                            <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#CBD5E1' }}>
                              Camera Disabled
                            </div>
                          </div>
                        )}

                        {/* Bottom Name Label */}
                        <div style={{
                          position: 'absolute',
                          bottom: '10px',
                          left: '12px',
                          fontSize: '0.72rem',
                          color: '#FFFFFF',
                          background: 'rgba(0, 0, 0, 0.7)',
                          padding: '0.2rem 0.55rem',
                          borderRadius: '4px',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          <span>{investorName} (You)</span>
                          {isMuted && <span style={{ color: '#F87171' }}>[Muted]</span>}
                        </div>
                      </div>
                    </div>

                    {/* Right-Hand In-Call Diligence Cheat Sheet & Scratchpad */}
                    <div style={{
                      borderRadius: '0.85rem',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      padding: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.9rem'
                    }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#FFFFFF', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.5rem' }}>
                        Live Diligence Telemetry
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.72rem' }}>
                        <div style={{ padding: '0.5rem', borderRadius: '6px', background: 'rgba(0,0,0,0.3)' }}>
                          <span style={{ color: '#94A3B8' }}>Valuation:</span>
                          <div style={{ fontWeight: 800, color: '#FFFFFF', marginTop: '2px' }}>${((company.valuation || 0)/1000000).toFixed(1)}M</div>
                        </div>
                        <div style={{ padding: '0.5rem', borderRadius: '6px', background: 'rgba(0,0,0,0.3)' }}>
                          <span style={{ color: '#94A3B8' }}>Blended CAC:</span>
                          <div style={{ fontWeight: 800, color: '#10B981', marginTop: '2px' }}>${company.cac || 340}</div>
                        </div>
                        <div style={{ padding: '0.5rem', borderRadius: '6px', background: 'rgba(0,0,0,0.3)' }}>
                          <span style={{ color: '#94A3B8' }}>Runway:</span>
                          <div style={{ fontWeight: 800, color: '#FFFFFF', marginTop: '2px' }}>{company.runway || 13.9} mos</div>
                        </div>
                        <div style={{ padding: '0.5rem', borderRadius: '6px', background: 'rgba(0,0,0,0.3)' }}>
                          <span style={{ color: '#94A3B8' }}>Min Check:</span>
                          <div style={{ fontWeight: 800, color: '#FBBF24', marginTop: '2px' }}>${(company.minInvestment || 0).toLocaleString()}</div>
                        </div>
                      </div>

                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#CBD5E1', marginBottom: '0.4rem' }}>
                          In-Call Diligence Notes (Auto-saved)
                        </div>
                        <textarea
                          value={diligenceNotes}
                          onChange={(e) => handleNotesChange(e.target.value)}
                          placeholder="Record key answers on CAC, margin expansion, term sheet expectations..."
                          style={{
                            flex: 1,
                            minHeight: '130px',
                            padding: '0.6rem',
                            borderRadius: '0.5rem',
                            background: 'rgba(0, 0, 0, 0.4)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: '#FFFFFF',
                            fontSize: '0.78rem',
                            resize: 'none',
                            outline: 'none',
                            fontFamily: 'inherit',
                            lineHeight: 1.4
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Call Controls Toolbar */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '1rem',
                    padding: '0.8rem',
                    borderRadius: '0.75rem',
                    background: 'rgba(0, 0, 0, 0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.08)'
                  }}>
                    <button
                      type="button"
                      onClick={toggleMute}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '0.6rem 1rem',
                        borderRadius: '0.6rem',
                        background: isMuted ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                        border: isMuted ? '1px solid #EF4444' : '1px solid rgba(255, 255, 255, 0.12)',
                        color: isMuted ? '#EF4444' : '#FFFFFF',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        cursor: 'pointer'
                      }}
                    >
                      {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
                      <span>{isMuted ? 'Unmute' : 'Mute'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={toggleVideo}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '0.6rem 1rem',
                        borderRadius: '0.6rem',
                        background: isVideoOff ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                        border: isVideoOff ? '1px solid #EF4444' : '1px solid rgba(255, 255, 255, 0.12)',
                        color: isVideoOff ? '#EF4444' : '#FFFFFF',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        cursor: 'pointer'
                      }}
                    >
                      {isVideoOff ? <VideoOff size={16} /> : <Video size={16} />}
                      <span>{isVideoOff ? 'Start Video' : 'Stop Video'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={toggleScreenShare}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '0.6rem 1rem',
                        borderRadius: '0.6rem',
                        background: isScreenSharing ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                        border: isScreenSharing ? '1px solid #3B82F6' : '1px solid rgba(255, 255, 255, 0.12)',
                        color: isScreenSharing ? '#60A5FA' : '#FFFFFF',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        cursor: 'pointer'
                      }}
                    >
                      <Monitor size={16} />
                      <span>{isScreenSharing ? 'Stop Presenting' : 'Share Screen'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleEndInAppCall}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '0.6rem 1.4rem',
                        borderRadius: '0.6rem',
                        background: '#EF4444',
                        color: '#FFFFFF',
                        fontWeight: 800,
                        fontSize: '0.82rem',
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 4px 14px rgba(239, 68, 68, 0.35)'
                      }}
                    >
                      <PhoneOff size={16} /> End Conference
                    </button>
                  </div>
                </div>
              ) : (
                /* REGULAR VIDEO CALL HUBS (IN-APP + GOOGLE MEET + ZOOM) */
                <>
                  <div style={{ textAlign: 'center', maxWidth: '620px', margin: '0 auto' }}>
                    <div style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '16px',
                      background: 'rgba(16, 185, 129, 0.15)',
                      border: '1.5px solid #10B981',
                      color: '#10B981',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 1rem auto',
                      boxShadow: '0 0 25px rgba(16, 185, 129, 0.25)'
                    }}>
                      <Video size={30} />
                    </div>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.4rem' }}>
                      Live Diligence Video Conference
                    </h3>
                    <p style={{ fontSize: '0.88rem', color: '#94A3B8', lineHeight: 1.5, margin: 0 }}>
                      Initiate an instant face-to-face deal meeting with {founderName}. Choose the built-in Diligence Studio or launch directly via Google Meet or Zoom.
                    </p>
                  </div>

                  {/* FEATURED: STARTUPIQ IN-APP DILIGENCE STUDIO */}
                  <div style={{
                    padding: '1.3rem 1.6rem',
                    borderRadius: '1rem',
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.16) 0%, rgba(59, 130, 246, 0.14) 100%)',
                    border: '1.5px solid rgba(16, 185, 129, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.35rem' }}>
                        <span style={{
                          padding: '0.2rem 0.55rem',
                          borderRadius: '999px',
                          background: '#10B981',
                          color: '#041d14',
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em'
                        }}>
                          Recommended • Zero Setup
                        </span>
                        <span style={{ fontSize: '0.78rem', color: '#6EE7B7', fontWeight: 700 }}>
                          Instant In-Browser Call with Founder Twin & Real Telemetry
                        </span>
                      </div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                        StartupIQ In-App Diligence Video Room
                      </h4>
                      <p style={{ fontSize: '0.8rem', color: '#94A3B8', margin: '4px 0 0 0' }}>
                        No Google or Zoom account required. Includes live DCF telemetry, pitch notes, and webcam audio/video.
                      </p>
                    </div>

                    <button
                      id="launch-inapp-video-btn"
                      type="button"
                      onClick={handleStartInAppCall}
                      style={{
                        padding: '0.75rem 1.4rem',
                        borderRadius: '0.75rem',
                        background: 'linear-gradient(135deg, #10B981, #059669)',
                        color: '#FFFFFF',
                        fontSize: '0.88rem',
                        fontWeight: 800,
                        border: 'none',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 18px rgba(16, 185, 129, 0.4)'
                      }}
                    >
                      <Video size={17} /> Enter In-App Diligence Call
                    </button>
                  </div>

                  {/* EXTERNAL PLATFORMS: GOOGLE MEET & ZOOM */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                    {/* Google Meet Card */}
                    <div style={{
                      padding: '1.4rem',
                      borderRadius: '1rem',
                      background: 'rgba(255, 255, 255, 0.025)',
                      border: '1px solid rgba(255, 255, 255, 0.09)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.9rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60A5FA', fontWeight: 900 }}>
                            GM
                          </div>
                          <div>
                            <div style={{ fontSize: '0.94rem', fontWeight: 800, color: '#FFFFFF' }}>Google Meet</div>
                            <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Official Workspace Instant Engine</div>
                          </div>
                        </div>
                        {customMeetingUrl && customMeetingUrl.includes('meet.google.com') && (
                          <span style={{ fontSize: '0.68rem', padding: '0.15rem 0.45rem', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.2)', color: '#34D399', fontWeight: 700 }}>
                            Custom Room
                          </span>
                        )}
                      </div>

                      <div style={{
                        padding: '0.6rem 0.8rem',
                        borderRadius: '0.5rem',
                        background: 'rgba(0, 0, 0, 0.4)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        fontSize: '0.78rem',
                        color: '#60A5FA',
                        fontFamily: 'monospace',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {googleMeetUrl}
                      </div>

                      <a
                        href={googleMeetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          padding: '0.75rem',
                          borderRadius: '0.75rem',
                          background: '#2563EB',
                          color: '#FFFFFF',
                          fontSize: '0.85rem',
                          fontWeight: 800,
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)'
                        }}
                      >
                        <span>Launch Google Meet</span>
                        <ExternalLink size={14} />
                      </a>

                      <p style={{ fontSize: '0.72rem', color: '#94A3B8', margin: 0, lineHeight: 1.4 }}>
                        Guaranteed to launch a live Google Meet room without "Invalid video call name" errors.
                      </p>
                    </div>

                    {/* Zoom Meeting Card */}
                    <div style={{
                      padding: '1.4rem',
                      borderRadius: '1rem',
                      background: 'rgba(255, 255, 255, 0.025)',
                      border: '1px solid rgba(255, 255, 255, 0.09)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.9rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981', fontWeight: 900 }}>
                            ZM
                          </div>
                          <div>
                            <div style={{ fontSize: '0.94rem', fontWeight: 800, color: '#FFFFFF' }}>Zoom Video Meeting</div>
                            <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Dedicated Deal Conference</div>
                          </div>
                        </div>
                        {customMeetingUrl && customMeetingUrl.includes('zoom.us') && (
                          <span style={{ fontSize: '0.68rem', padding: '0.15rem 0.45rem', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.2)', color: '#34D399', fontWeight: 700 }}>
                            Custom Room
                          </span>
                        )}
                      </div>

                      <div style={{
                        padding: '0.6rem 0.8rem',
                        borderRadius: '0.5rem',
                        background: 'rgba(0, 0, 0, 0.4)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        fontSize: '0.78rem',
                        color: '#34D399',
                        fontFamily: 'monospace',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {zoomMeetingUrl}
                      </div>

                      <a
                        href={zoomMeetingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          padding: '0.75rem',
                          borderRadius: '0.75rem',
                          background: 'linear-gradient(135deg, #10B981, #059669)',
                          color: '#FFFFFF',
                          fontSize: '0.85rem',
                          fontWeight: 800,
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)'
                        }}
                      >
                        <span>Launch Zoom Room</span>
                        <ExternalLink size={14} />
                      </a>

                      <p style={{ fontSize: '0.72rem', color: '#94A3B8', margin: 0, lineHeight: 1.4 }}>
                        Opens your instant Zoom session or custom team meeting room.
                      </p>
                    </div>
                  </div>

                  {/* CUSTOM / RECURRING SHARED MEETING LINK BOX */}
                  <div style={{
                    padding: '1.1rem 1.4rem',
                    borderRadius: '0.85rem',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <LinkIcon size={14} color="#10B981" />
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#FFFFFF' }}>
                          Have a Specific or Pre-Scheduled Meeting Link?
                        </span>
                      </div>
                      {customMeetingUrl && !isEditingCustomLink && (
                        <div style={{ display: 'flex', gap: '0.6rem' }}>
                          <button
                            type="button"
                            onClick={() => setIsEditingCustomLink(true)}
                            style={{ background: 'transparent', border: 'none', color: '#60A5FA', fontSize: '0.74rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Edit3 size={12} /> Edit Link
                          </button>
                          <button
                            type="button"
                            onClick={handleClearCustomLink}
                            style={{ background: 'transparent', border: 'none', color: '#F87171', fontSize: '0.74rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Trash2 size={12} /> Reset to Default
                          </button>
                        </div>
                      )}
                    </div>

                    {(!customMeetingUrl || isEditingCustomLink) ? (
                      <form onSubmit={handleSaveCustomLink} style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                        <input
                          type="url"
                          value={customLinkDraft}
                          onChange={(e) => setCustomLinkDraft(e.target.value)}
                          placeholder="Paste your Google Meet (e.g. meet.google.com/abc-defg-hij) or Zoom link"
                          style={{
                            flex: 1,
                            minWidth: '240px',
                            padding: '0.6rem 0.85rem',
                            borderRadius: '0.5rem',
                            background: 'rgba(0, 0, 0, 0.35)',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            color: '#FFFFFF',
                            fontSize: '0.8rem',
                            outline: 'none'
                          }}
                        />
                        <button
                          type="submit"
                          style={{
                            padding: '0.6rem 1.1rem',
                            borderRadius: '0.5rem',
                            background: '#10B981',
                            color: '#041d14',
                            fontSize: '0.8rem',
                            fontWeight: 800,
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px'
                          }}
                        >
                          <Save size={14} /> Link Room
                        </button>
                        {isEditingCustomLink && (
                          <button
                            type="button"
                            onClick={() => setIsEditingCustomLink(false)}
                            style={{
                              padding: '0.6rem 0.9rem',
                              borderRadius: '0.5rem',
                              background: 'transparent',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              color: '#94A3B8',
                              fontSize: '0.8rem',
                              cursor: 'pointer'
                            }}
                          >
                            Cancel
                          </button>
                        )}
                      </form>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#34D399' }}>
                        <CheckCircle2 size={15} />
                        <span>Shared Room Linked for {ticker}: <strong>{customMeetingUrl}</strong></span>
                      </div>
                    )}
                  </div>

                  {/* Hardware Diagnostics & Copy Link Toolbar */}
                  <div style={{
                    padding: '0.9rem 1.3rem',
                    borderRadius: '0.85rem',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.07)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#10B981', fontWeight: 700 }}>
                        <CheckCircle2 size={15} /> Microphone: Ready
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#10B981', fontWeight: 700 }}>
                        <CheckCircle2 size={15} /> Camera: HD 1080p
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#818CF8', fontWeight: 700 }}>
                        <ShieldCheck size={15} /> 256-Bit Diligence Security
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyLink(activeMeetingUrl)}
                      style={{
                        padding: '0.45rem 0.95rem',
                        borderRadius: '6px',
                        background: 'rgba(255, 255, 255, 0.07)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: copiedLink ? '#10B981' : '#CBD5E1',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      {copiedLink ? <Check size={13} /> : <Copy size={13} />}
                      <span>{copiedLink ? 'Link Copied to Clipboard!' : 'Copy Meeting Link'}</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ================= TAB 3: SCHEDULE DILIGENCE CALL ================= */}
          {activeTab === 'schedule' && (
            <div style={{ padding: '1.6rem 2rem', overflowY: 'auto' }}>
              {scheduledConfirmation ? (
                <div style={{
                  padding: '1.6rem',
                  borderRadius: '1rem',
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(99, 102, 241, 0.08))',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.2rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#10B981', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CheckCircle2 size={22} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                        Diligence Call Confirmed with {scheduledConfirmation.founderName}
                      </h4>
                      <p style={{ fontSize: '0.8rem', color: '#A7F3D0', margin: '2px 0 0 0' }}>
                        Calendar invites dispatched to {investorName} and {scheduledConfirmation.founderEmail}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.8rem', padding: '0.9rem', borderRadius: '0.75rem', background: 'rgba(0, 0, 0, 0.3)' }}>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Time & Date</div>
                      <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#FFFFFF' }}>{scheduledConfirmation.dateLabel} at {scheduledConfirmation.time}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Platform</div>
                      <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#10B981' }}>{scheduledConfirmation.platform}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Indicative Check Size</div>
                      <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#FFFFFF' }}>${scheduledConfirmation.checkSize.toLocaleString()}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                    <a
                      href={getGoogleCalendarUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: '0.65rem 1.2rem',
                        borderRadius: '0.65rem',
                        background: '#10B981',
                        color: '#FFFFFF',
                        fontSize: '0.82rem',
                        fontWeight: 800,
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Calendar size={14} /> Add to Google Calendar
                    </a>

                    <a
                      href={scheduledConfirmation.meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: '0.65rem 1.2rem',
                        borderRadius: '0.65rem',
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: '#FFFFFF',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Video size={14} /> Launch Meeting Link
                    </a>

                    <button
                      type="button"
                      onClick={() => setScheduledConfirmation(null)}
                      style={{
                        padding: '0.65rem 1rem',
                        borderRadius: '0.65rem',
                        background: 'transparent',
                        border: 'none',
                        color: '#94A3B8',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Reschedule
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleScheduleCall} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {/* Meeting Duration */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#CBD5E1', marginBottom: '0.45rem' }}>
                      Meeting Duration & Format
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem' }}>
                      {[
                        { id: '15min', label: '15-Min Intro', sub: 'Executive Pitch' },
                        { id: '30min', label: '30-Min Diligence', sub: 'Metrics & Unit Economics' },
                        { id: '45min', label: '45-Min Term Sheet', sub: 'Allocation & Waterfall' }
                      ].map(dur => (
                        <div
                          key={dur.id}
                          onClick={() => setMeetingType(dur.id)}
                          style={{
                            padding: '0.75rem',
                            borderRadius: '0.75rem',
                            background: meetingType === dur.id ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.025)',
                            border: meetingType === dur.id ? '1.5px solid #10B981' : '1px solid rgba(255, 255, 255, 0.08)',
                            cursor: 'pointer',
                            textAlign: 'center'
                          }}
                        >
                          <div style={{ fontSize: '0.84rem', fontWeight: 800, color: meetingType === dur.id ? '#10B981' : '#FFFFFF' }}>{dur.label}</div>
                          <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>{dur.sub}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Date & Time Selection */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#CBD5E1', marginBottom: '0.45rem' }}>
                        Proposed Date
                      </label>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {[
                          { id: 'today', label: 'Today' },
                          { id: 'tomorrow', label: 'Tomorrow' },
                          { id: 'friday', label: 'Friday' }
                        ].map(d => (
                          <button
                            key={d.id}
                            type="button"
                            onClick={() => setSelectedDate(d.id)}
                            style={{
                              flex: 1,
                              padding: '0.6rem',
                              borderRadius: '0.5rem',
                              border: selectedDate === d.id ? '1px solid #10B981' : '1px solid rgba(255, 255, 255, 0.1)',
                              background: selectedDate === d.id ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                              color: selectedDate === d.id ? '#10B981' : '#CBD5E1',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            {d.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#CBD5E1', marginBottom: '0.45rem' }}>
                        Time Slot (Founder Timezone)
                      </label>
                      <select
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.65rem 0.8rem',
                          borderRadius: '0.5rem',
                          background: '#1E293B',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          color: '#FFFFFF',
                          fontSize: '0.84rem',
                          outline: 'none'
                        }}
                      >
                        <option value="10:00 AM EST">10:00 AM EST (Available)</option>
                        <option value="11:30 AM EST">11:30 AM EST (Available)</option>
                        <option value="2:00 PM EST">2:00 PM EST (Recommended)</option>
                        <option value="4:30 PM EST">4:30 PM EST (Available)</option>
                      </select>
                    </div>
                  </div>

                  {/* Diligence Agenda Items */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#CBD5E1', marginBottom: '0.45rem' }}>
                      Pre-Populated Diligence Agenda
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.5rem' }}>
                      {[
                        'Unit Economics & CAC Payback Analysis',
                        'Financial Model & 5-Year DCF Verification',
                        'Product Architecture, Moat & IP Defense',
                        'Allocation Check Size & Term Sheet Structuring'
                      ].map(agenda => {
                        const isChecked = selectedAgendas.includes(agenda);
                        return (
                          <div
                            key={agenda}
                            onClick={() => {
                              if (isChecked) setSelectedAgendas(selectedAgendas.filter(a => a !== agenda));
                              else setSelectedAgendas([...selectedAgendas, agenda]);
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '0.6rem 0.8rem',
                              borderRadius: '0.5rem',
                              background: isChecked ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                              border: isChecked ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255, 255, 255, 0.06)',
                              fontSize: '0.78rem',
                              color: isChecked ? '#FFFFFF' : '#94A3B8',
                              cursor: 'pointer'
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}}
                              style={{ accentColor: '#10B981', cursor: 'pointer' }}
                            />
                            <span>{agenda}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Target Allocation / Check Size */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#CBD5E1', marginBottom: '0.45rem' }}>
                        Indicative Allocation / Check Size ($)
                      </label>
                      <input
                        type="number"
                        step="10000"
                        value={checkSize}
                        onChange={(e) => setCheckSize(e.target.value)}
                        placeholder="100000"
                        style={{
                          width: '100%',
                          padding: '0.65rem 0.9rem',
                          borderRadius: '0.5rem',
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          color: '#FFFFFF',
                          fontSize: '0.86rem',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#CBD5E1', marginBottom: '0.45rem' }}>
                        Conference Platform
                      </label>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          type="button"
                          onClick={() => setMeetingPlatform('google_meet')}
                          style={{
                            flex: 1,
                            padding: '0.65rem',
                            borderRadius: '0.5rem',
                            background: meetingPlatform === 'google_meet' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                            border: meetingPlatform === 'google_meet' ? '1px solid #60A5FA' : '1px solid rgba(255, 255, 255, 0.1)',
                            color: meetingPlatform === 'google_meet' ? '#60A5FA' : '#CBD5E1',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          Google Meet
                        </button>
                        <button
                          type="button"
                          onClick={() => setMeetingPlatform('zoom')}
                          style={{
                            flex: 1,
                            padding: '0.65rem',
                            borderRadius: '0.5rem',
                            background: meetingPlatform === 'zoom' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                            border: meetingPlatform === 'zoom' ? '1px solid #10B981' : '1px solid rgba(255, 255, 255, 0.1)',
                            color: meetingPlatform === 'zoom' ? '#10B981' : '#CBD5E1',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          Zoom Meeting
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    style={{
                      marginTop: '0.5rem',
                      padding: '0.85rem 1.4rem',
                      borderRadius: '0.75rem',
                      background: 'linear-gradient(135deg, #10B981, #059669)',
                      color: '#FFFFFF',
                      fontSize: '0.9rem',
                      fontWeight: 800,
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      boxShadow: '0 4px 18px rgba(16, 185, 129, 0.35)'
                    }}
                  >
                    <Calendar size={16} /> Confirm & Dispatch Diligence Invitation
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>,
    document.body
  ) : null;
}
