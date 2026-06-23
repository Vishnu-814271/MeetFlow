import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  KeyRound, Sparkles, User, Phone, Mail,
  ArrowRight, ArrowLeft, Copy, Check, Loader2, AlertCircle,
  Plus, LogIn, X, Users, MapPin
} from 'lucide-react';
import { useCreateEventWithOrganizer, useEventByCode, useAiGenerateEvent } from '../services/hooks';
import confetti from 'canvas-confetti';

export const EVENT_TYPE_CONFIGS: Record<string, {
  label: string;
  badgeLabel: string;
  groupFieldName: string;
  groupPlaceholder: string;
  registrationSubtitle: string;
  inviteHelper: string;
}> = {
  ALUMNI: {
    label: 'Alumni Reunion',
    badgeLabel: 'Alumni Network',
    groupFieldName: 'Batch / Group',
    groupPlaceholder: 'e.g. Batch of 2018',
    registrationSubtitle: 'Register to coordinate with other alumni participants.',
    inviteHelper: 'Share the access code with your alumni group.',
  },
  COMMUNITY: {
    label: 'Community Gathering',
    badgeLabel: 'Community Event',
    groupFieldName: 'Interest Group / Chapter',
    groupPlaceholder: 'e.g. Hyderabad Chapter',
    registrationSubtitle: 'Register to coordinate with other community members.',
    inviteHelper: 'Share the access code with your community.',
  },
  INSTITUTION: {
    label: 'Institutional Event',
    badgeLabel: 'Academic / Institution',
    groupFieldName: 'Department / Affiliation',
    groupPlaceholder: 'e.g. Computer Science Dept',
    registrationSubtitle: 'Register to coordinate with other institutional attendees.',
    inviteHelper: 'Share the access code with your colleagues/students.',
  },
  ORGANIZER: {
    label: 'Professional Event',
    badgeLabel: 'Organizer Event',
    groupFieldName: 'Company / Organization',
    groupPlaceholder: 'e.g. TechCorp Solutions',
    registrationSubtitle: 'Register to coordinate with other participants.',
    inviteHelper: 'Share the access code with your event participants.',
  },
};

// ─── Scoped CSS ───────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800;900&display=swap');

  .mfp-root {
    font-family: 'Poppins', sans-serif;
    min-height: 100vh;
    background: radial-gradient(circle at 50% 50%, #ffffff 0%, #f1f5f9 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    position: relative;
  }

  .mfp-grid {
    position: absolute;
    inset: 0;
    background-image: linear-gradient(rgba(249, 115, 22, 0.04) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(56, 189, 248, 0.04) 1px, transparent 1px);
    background-size: 40px 40px;
    background-position: center center;
    pointer-events: none;
    mask-image: radial-gradient(circle at center, black, transparent 75%);
    -webkit-mask-image: radial-gradient(circle at center, black, transparent 75%);
  }

  /* ── Continuous rolling wave — infinite loop ───────────────────── */
  @keyframes mfp-roll-wave {
    0%    { transform: translateY(0)     rotateZ(0deg);   color: #1e293b; }
    15%   { transform: translateY(-22px) rotateZ(-12deg); color: #38bdf8; }
    30%   { transform: translateY(5px)   rotateZ(5deg);   color: #f97316; }
    45%   { transform: translateY(0)     rotateZ(0deg);   color: #1e293b; }
    100%  { transform: translateY(0)     rotateZ(0deg);   color: #1e293b; }
  }

  .mfp-char {
    display: inline-block;
    color: #1e293b;
    /* duration = wave-speed * num-chars; delay staggers each char through the cycle */
    animation: mfp-roll-wave 2s ease-in-out infinite;
    transform-origin: bottom center;
    will-change: transform, color;
  }

  .mfp-title-wrap {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    align-items: baseline;
    gap: 0 20px;
    line-height: 1.1;
  }

  .mfp-word {
    display: inline-block;
    white-space: nowrap;
  }

  /* ── Year shimmer ──────────────────────────────────────────────── */
  @keyframes mfp-shimmer {
    0%   { background-position: 0% center; }
    100% { background-position: 200% center; }
  }
  .mfp-year {
    background: linear-gradient(90deg, #38bdf8, #f97316, #38bdf8);
    background-size: 200% auto;
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: mfp-shimmer 2.5s linear infinite;
    display: block;
  }

  /* ── Floating orbs ─────────────────────────────────────────────── */
  @keyframes mfp-float {
    0%, 100% { transform: translateY(0); }
    50%       { transform: translateY(-20px); }
  }
  .mfp-orb {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
    animation: mfp-float var(--d, 6s) ease-in-out infinite;
    animation-delay: var(--dl, 0s);
  }

  /* ── Stars ─────────────────────────────────────────────────────── */
  @keyframes mfp-twinkle {
    0%, 100% { opacity: 0.1; }
    50%       { opacity: 0.8; }
  }
  .mfp-star {
    position: absolute;
    border-radius: 50%;
    background: #38bdf8;
    animation: mfp-twinkle var(--d, 3s) ease-in-out infinite;
    animation-delay: var(--dl, 0s);
  }

  /* ── Buttons ───────────────────────────────────────────────────── */
  .mfp-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 16px 32px;
    border-radius: 16px;
    font-family: 'Poppins', sans-serif;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    border: none;
    transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
    position: relative;
    overflow: hidden;
    min-width: 170px;
    white-space: nowrap;
  }
  .mfp-btn:hover { transform: translateY(-4px); }
  .mfp-btn-create {
    background: linear-gradient(135deg, #f97316, #ea580c);
    color: #fff;
    box-shadow: 0 8px 30px rgba(249, 115, 22, 0.2);
  }
  .mfp-btn-create:hover { 
    box-shadow: 0 14px 40px rgba(249, 115, 22, 0.35);
    background: linear-gradient(135deg, #fb923c, #f97316);
  }
  .mfp-btn-join {
    background: rgba(255, 255, 255, 0.8);
    color: #f97316;
    border: 2px solid rgba(249, 115, 22, 0.3);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    backdrop-filter: blur(12px);
  }
  .mfp-btn-join:hover {
    background: rgba(249, 115, 22, 0.08);
    border-color: rgba(249, 115, 22, 0.6);
    color: #ea580c;
  }

  /* ── Badge ─────────────────────────────────────────────────────── */
  @keyframes mfp-pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(249,115,22,0.2); }
    50%       { box-shadow: 0 0 0 8px rgba(249,115,22,0); }
  }
  .mfp-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 18px;
    border-radius: 999px;
    background: rgba(249,115,22,0.08);
    border: 1px solid rgba(249,115,22,0.25);
    color: #f97316;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    animation: mfp-pulse 3s ease-in-out infinite;
  }

  /* ── Modal ─────────────────────────────────────────────────────── */
  @keyframes mfp-backdrop-in { from { opacity:0; } to { opacity:1; } }
  @keyframes mfp-modal-in {
    from { opacity:0; transform: translateY(24px) scale(0.96); }
    to   { opacity:1; transform: translateY(0)    scale(1); }
  }
  .mfp-backdrop {
    position: fixed; inset: 0; z-index: 9999;
    display: flex; align-items: center; justify-content: center; padding: 16px;
    background: rgba(255,255,255,0.45);
    backdrop-filter: blur(8px);
    animation: mfp-backdrop-in 0.2s ease forwards;
  }
  .mfp-modal-card {
    width: 100%; max-width: 440px;
    border-radius: 24px;
    overflow: auto; max-height: 90vh;
    background: #ffffff;
    border: 1px solid rgba(226,232,240,1);
    box-shadow: 0 20px 50px rgba(15,23,42,0.15);
    animation: mfp-modal-in 0.3s cubic-bezier(0.34,1.4,0.64,1) forwards;
    font-family: 'Poppins', sans-serif;
  }

  /* ── Inputs ─────────────────────────────────────────────────────── */
  .mfp-input {
    width: 100%;
    background: #ffffff;
    border: 1.5px solid rgba(226,232,240,1);
    border-radius: 12px;
    color: #0f172a;
    font-size: 13px;
    font-family: 'Poppins', sans-serif;
    padding: 10px 14px;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .mfp-input::placeholder { color: rgba(100,116,139,0.55); }
  .mfp-input:focus {
    outline: none;
    border-color: #38bdf8;
    box-shadow: 0 0 0 3px rgba(56,189,248,0.15);
  }
  .mfp-input option { background: #ffffff; color: #0f172a; }

  /* ── Icon input wrap ─────────────────────────────────────────────── */
  .mfp-iw { position: relative; }
  .mfp-iw .mfp-ico {
    position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
    color: rgba(100,116,139,0.6); pointer-events: none;
  }
  .mfp-iw .mfp-input { padding-left: 38px; }

  /* ── Step bar ─────────────────────────────────────────────────── */
  .mfp-step { height: 3px; border-radius: 4px; flex: 1; transition: background 0.4s ease; }
  .mfp-step.active { background: linear-gradient(90deg,#f97316,#38bdf8); }
  .mfp-step.inactive { background: rgba(226,232,240,0.8); }

  /* ── Error banner ─────────────────────────────────────────────── */
  .mfp-error {
    display: flex; align-items: flex-start; gap: 8px;
    padding: 10px 14px; border-radius: 12px; margin-bottom: 14px;
    background: rgba(239,68,68,0.05); border: 1px solid rgba(239,68,68,0.2);
    color: #ef4444; font-size: 12px; font-weight: 500;
  }

  /* ── Success pop ───────────────────────────────────────────────── */
  @keyframes mfp-success {
    from { opacity:0; transform: scale(0.85); }
    to   { opacity:1; transform: scale(1); }
  }
  .mfp-success-wrap { animation: mfp-success 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards; }

  /* ── Nav close btn ─────────────────────────────────────────────── */
  .mfp-close-btn {
    width: 32px; height: 32px; border-radius: 10px;
    border: none; cursor: pointer; display: flex; align-items: center; justify-content: center;
    background: rgba(226,232,240,0.7); color: rgba(100,116,139,0.8);
    transition: background 0.2s;
  }
  .mfp-close-btn:hover { background: rgba(239,68,68,0.1); color: #ef4444; }

  /* ── Divider ───────────────────────────────────────────────────── */
  .mfp-divider { height: 1px; background: rgba(226,232,240,0.8); margin: 12px 0; }

  /* ── Form action buttons ───────────────────────────────────────── */
  .mfp-form-btn-primary {
    width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;
    padding: 12px 20px; border-radius: 14px; border: none; cursor: pointer;
    background: linear-gradient(135deg,#f97316,#ea580c); color: #fff;
    font-family: 'Poppins', sans-serif; font-size: 13px; font-weight: 700;
    box-shadow: 0 4px 20px rgba(249,115,22,0.2);
    transition: opacity 0.2s, transform 0.2s;
  }
  .mfp-form-btn-primary:hover { transform: translateY(-1px); }
  .mfp-form-btn-primary:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }

  .mfp-form-btn-back {
    display: flex; align-items: center; gap: 6px;
    padding: 10px 16px; border-radius: 12px; border: 1px solid rgba(226,232,240,0.8);
    cursor: pointer; background: rgba(241,245,249,0.7);
    color: #64748b; font-family: 'Poppins', sans-serif; font-size: 12px; font-weight: 700;
    transition: background 0.2s;
  }
  .mfp-form-btn-back:hover { background: rgba(226,232,240,0.25); }

  /* ── Info card ─────────────────────────────────────────────────── */
  .mfp-info-card {
    background: rgba(241,245,249,0.8); border: 1px solid rgba(226,232,240,0.8);
    border-radius: 16px; padding: 16px;
  }

  /* ── Code display ─────────────────────────────────────────────── */
  .mfp-code-display {
    font-family: 'Courier New', monospace;
    font-size: 26px; font-weight: 900;
    color: #f97316; letter-spacing: 0.15em;
  }

  /* ── Copy row ──────────────────────────────────────────────────── */
  .mfp-copy-row {
    display: flex; align-items: center; gap: 8px;
    padding: 8px 12px; border-radius: 10px;
    background: rgba(241,245,249,0.8); border: 1px solid rgba(226,232,240,0.8);
  }
  .mfp-copy-btn {
    flex-shrink: 0; padding: 6px; border-radius: 8px; border: none;
    cursor: pointer; background: rgba(249,115,22,0.1); color: #f97316;
    display: flex; align-items: center; transition: background 0.2s;
  }
  .mfp-copy-btn:hover { background: rgba(249,115,22,0.2); }
`;

// ─── RollingTitle — continuous infinite wave ──────────────────────────────────
const RollingTitle: React.FC<{ text: string }> = ({ text }) => {
  const words = text.split(' ');
  // Count chars excluding spaces for equal wave distribution
  const totalChars = text.replace(/ /g, '').length;
  // Animation duration per letter (must match CSS)
  const WAVE_DUR = 2;      // seconds — matches animation-duration in CSS
  const WAVE_SPREAD = 1.5; // seconds — total time for wave to sweep all letters

  let charIdx = 0;
  return (
    <div className="mfp-title-wrap">
      {words.map((word, wi) => {
        const wordStart = charIdx;
        charIdx += word.length;
        return (
          <span key={wi} className="mfp-word">
            {word.split('').map((ch, ci) => {
              const globalIdx = wordStart + ci;
              // Negative delay: wave is already in progress at t=0, no waiting
              const delay = -WAVE_SPREAD + (globalIdx / Math.max(totalChars - 1, 1)) * WAVE_SPREAD;
              return (
                <span
                  key={ci}
                  className="mfp-char"
                  style={{
                    animationDelay: `${delay.toFixed(3)}s`,
                    animationDuration: `${WAVE_DUR}s`,
                  }}
                >
                  {ch}
                </span>
              );
            })}
          </span>
        );
      })}
    </div>
  );
};


// ─── Label helper ─────────────────────────────────────────────────────────────
const Lbl: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{
    fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
    color: 'rgba(100,116,139,0.85)', marginBottom: 6
  }}>
    {children}
  </div>
);

// ─── Modal type ───────────────────────────────────────────────────────────────
type ModalMode = 'none' | 'join' | 'create';

// ═════════════════════════════════════════════════════════════════════════════
export const PortalPage: React.FC = () => {
  const navigate = useNavigate();
  const createMutation = useCreateEventWithOrganizer();
  const lookupMutation = useEventByCode();
  const aiGenerateMutation = useAiGenerateEvent();
  const year = new Date().getFullYear();

  const handleAiGenerate = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) {
      setError('Please describe your event first.');
      return;
    }
    setError('');
    setAiMessage('AI is designing your event...');
    aiGenerateMutation.mutate(aiPrompt.trim(), {
      onSuccess: (data: any) => {
        setAiMessage('✨ AI has successfully configured your event details below!');
        if (data.eventName) setEventName(data.eventName);
        if (data.eventType) setEventType(data.eventType);
        if (data.description) setDescription(data.description);
        if (data.featuresConfig) setFeaturesConfig(typeof data.featuresConfig === 'string' ? data.featuresConfig : JSON.stringify(data.featuresConfig));
        if (data.registrationSchema) setRegistrationSchema(typeof data.registrationSchema === 'string' ? data.registrationSchema : JSON.stringify(data.registrationSchema));
        if (data.rolesSchema) setRolesSchema(typeof data.rolesSchema === 'string' ? data.rolesSchema : JSON.stringify(data.rolesSchema));
        if (data.dashboardSchema) setDashboardSchema(typeof data.dashboardSchema === 'string' ? data.dashboardSchema : JSON.stringify(data.dashboardSchema));
      },
      onError: (err: any) => {
        setAiMessage('');
        setError(err.response?.data?.error || 'AI generation failed. Please try manual setup.');
      }
    });
  };

  // Modal
  const [modal, setModal] = useState<ModalMode>('none');
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [success, setSuccess] = useState<{ code: string; slug: string; name: string; eventType: string } | null>(null);

  // Join form
  const [joinCode, setJoinCode] = useState('');

  // Create – step 1
  const [eventName, setEventName] = useState('');
  const [createEventCode, setCreateEventCode] = useState('');
  const [eventType, setEventType] = useState('ORGANIZER');
  const [description, setDescription] = useState('');
  const [venueName, setVenueName] = useState('');
  const [venueAddress, setVenueAddress] = useState('');
  const venueMap = '';
  const [startDt, setStartDt] = useState('');
  const [endDt, setEndDt] = useState('');

  // SaaS Dynamic config
  const [aiPrompt, setAiPrompt] = useState('');
  const [featuresConfig, setFeaturesConfig] = useState('{"travel":true,"carpool":true,"announcements":true,"chat":true,"gallery":true,"polls":true,"attendance":true}');
  const [registrationSchema, setRegistrationSchema] = useState('[{"name":"affiliation","label":"Affiliation / Company","type":"text","placeholder":"e.g. Stanford University or Google","required":false}]');
  const [rolesSchema, setRolesSchema] = useState('["organizer","participant","driver"]');
  const [dashboardSchema, setDashboardSchema] = useState('["total_registered","confirmed","maybe","not_attending","reached_venue","en_route"]');
  const [aiMessage, setAiMessage] = useState('');

  // Create – step 2
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [batch, setBatch] = useState('');
  const [city, setCity] = useState('Hyderabad');
  const cities = ['Hyderabad', 'Bangalore', 'Chennai', 'Pune', 'Delhi', 'Mumbai', 'Kolkata', 'Kochi'];

  // Escape key
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  const open = (m: ModalMode) => { setModal(m); setStep(1); setError(''); setSuccess(null); setJoinCode(''); setCreateEventCode(''); };
  const close = () => { setModal('none'); setError(''); setSuccess(null); setStep(1); };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    if (!joinCode.trim()) { setError('Enter a valid event code.'); return; }
    lookupMutation.mutate(joinCode.trim(), {
      onSuccess: (ev: any) => {
        localStorage.setItem('meetflow_last_active_slug', ev.eventSlug);
        localStorage.setItem('meetflow_last_active_name', ev.eventName);
        close();
        navigate(`/event/${ev.eventSlug}/join?code=${ev.eventCode}`);
      },
      onError: (err: any) => setError(err.response?.data?.error || 'Invalid event code. Please try again.'),
    });
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    if (step === 1) {
      if (!eventName.trim() || !venueName.trim() || !startDt || !endDt) {
        setError('Please fill all required fields (*).');
        return;
      }
      setStep(2); return;
    }
    if (!fullName.trim() || !mobile.trim()) { setError('Name and mobile are required.'); return; }
    createMutation.mutate(
      {
        event: {
          eventName,
          eventType,
          eventCode: createEventCode,
          description,
          venueName,
          venueAddress,
          venueGoogleMapUrl: venueMap,
          startDatetime: startDt,
          endDatetime: endDt,
          featuresConfig,
          registrationSchema,
          rolesSchema,
          dashboardSchema
        },
        organizer: { fullName, mobileNumber: mobile, email, batchOrGroup: batch, currentCity: city }
      },
      {
        onSuccess: (d: any) => {
          confetti({ particleCount: 220, spread: 100, origin: { y: 0.55 }, colors: ['#1d4ed8', '#38bdf8', '#fff', '#93c5fd'] });
          localStorage.setItem(`meetflow_user_${d.event.eventSlug}`, JSON.stringify(d.organizer));
          localStorage.setItem('meetflow_last_active_slug', d.event.eventSlug);
          localStorage.setItem('meetflow_last_active_name', d.event.eventName);
          setSuccess({ code: d.event.eventCode, slug: d.event.eventSlug, name: d.event.eventName, eventType: d.event.eventType });
        },
        onError: (err: any) => setError(err.response?.data?.error || 'Failed to create event.'),
      }
    );
  };

  const copyLink = () => {
    if (!success) return;
    navigator.clipboard.writeText(`${window.location.origin}/event/${success.slug}/join?code=${success.code}`);
    setCopied(true); setTimeout(() => setCopied(false), 2500);
  };

  // ──────────────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{CSS}</style>

      {/* ── Root page ── */}
      <div className="mfp-root">
        <div className="mfp-grid" />

        {/* Decorative orbs */}
        <div className="mfp-orb" style={{
          '--d': '7s', '--dl': '0s', top: '5%', left: '8%', width: 280, height: 280,
          background: 'radial-gradient(circle,rgba(249,115,22,0.18) 0%,transparent 70%)', filter: 'blur(48px)'
        } as any} />
        <div className="mfp-orb" style={{
          '--d': '9s', '--dl': '2s', bottom: '8%', right: '6%', width: 340, height: 340,
          background: 'radial-gradient(circle,rgba(56,189,248,0.18) 0%,transparent 70%)', filter: 'blur(55px)'
        } as any} />
        <div className="mfp-orb" style={{
          '--d': '11s', '--dl': '1.5s', top: '60%', left: '3%', width: 200, height: 200,
          background: 'radial-gradient(circle,rgba(255,255,255,0.06) 0%,transparent 70%)', filter: 'blur(36px)'
        } as any} />

        {/* Stars */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          {Array.from({ length: 65 }).map((_, i) => (
            <div key={i} className="mfp-star" style={{
              '--d': `${2 + Math.random() * 4}s`,
              '--dl': `${Math.random() * 6}s`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${1 + Math.random() * 2}px`,
              height: `${1 + Math.random() * 2}px`,
            } as any} />
          ))}
        </div>

        {/* ── Centre content ── */}
        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '40px 24px', maxWidth: 680, width: '100%' }}>

          {/* Badge */}
          <div className="mfp-badge" style={{ marginBottom: 28 }}>
            <Sparkles style={{ width: 12, height: 12 }} />
            Event Platform &nbsp;·&nbsp; {year}
          </div>

          {/* ── TITLE: visible white text, horizontally rolling ── */}
          <div style={{
            marginBottom: 8, fontSize: 'clamp(2.2rem,7vw,5rem)', fontWeight: 900,
            lineHeight: 1.05, color: '#ffffff', letterSpacing: '-0.02em'
          }}>
            <RollingTitle text="MEET-FLOW" />
          </div>

          {/* ── YEAR: bright shimmer ── */}
          <div className="mfp-year" style={{
            fontSize: 'clamp(1.8rem,5vw,4rem)', fontWeight: 900,
            letterSpacing: '0.1em', marginBottom: 20,
          }}>
            {year}
          </div>

          {/* Tagline */}
          <p style={{
            fontSize: 14, color: '#94a3b8', fontWeight: 500, lineHeight: 1.7,
            marginBottom: 48, maxWidth: 420, margin: '0 auto 48px'
          }}>
            Coordinate travel plans, find carpool partners, and connect with fellow participants — beautifully.
          </p>

          {/* ── BUTTONS ── */}
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button id="btn-create-meetup" className="mfp-btn mfp-btn-create" onClick={() => open('create')}>
              <Plus style={{ width: 18, height: 18 }} strokeWidth={2.5} />
              Create Event
            </button>
            <button id="btn-join-meetup" className="mfp-btn mfp-btn-join" onClick={() => open('join')}>
              <LogIn style={{ width: 18, height: 18 }} strokeWidth={2.5} />
              Join Event
            </button>
          </div>

          <p style={{ marginTop: 52, fontSize: 11, color: 'rgba(71,85,105,0.6)', fontWeight: 500 }}>
            Powered by <span style={{ color: 'rgba(100,116,139,0.5)' }}>MEET-FLOW</span>
          </p>
        </div>
      </div>

      {/* ═══════════════════════════════ MODAL ════════════════════════════════ */}
      {modal !== 'none' && (
        <div className="mfp-backdrop" onClick={e => { if (e.target === e.currentTarget) close(); }}>
          <div className="mfp-modal-card">

            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '20px 22px 16px', borderBottom: '1px solid rgba(226,232,240,0.8)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)'
                }}>
                  {modal === 'join'
                    ? <KeyRound style={{ width: 16, height: 16, color: '#f97316' }} />
                    : <Plus style={{ width: 16, height: 16, color: '#f97316' }} />}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>
                    {modal === 'join' ? 'Join a Meetup' : 'Create a Meetup'}
                  </div>
                  {modal === 'create' && !success &&
                    <div style={{ fontSize: 10, color: 'rgba(100,116,139,0.7)', fontWeight: 600 }}>Step {step} of 2</div>}
                </div>
              </div>
              <button className="mfp-close-btn" onClick={close}>
                <X style={{ width: 15, height: 15 }} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '18px 22px 22px' }}>

              {/* Error */}
              {error && (
                <div className="mfp-error">
                  <AlertCircle style={{ width: 15, height: 15, flexShrink: 0, marginTop: 1 }} />
                  {error}
                </div>
              )}

              {/* ══ JOIN FORM ══ */}
              {modal === 'join' && (
                <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <Lbl>Event Access Code</Lbl>
                    <div className="mfp-iw">
                      <KeyRound className="mfp-ico" style={{ width: 15, height: 15 }} />
                      <input type="text" value={joinCode}
                        onChange={e => setJoinCode(e.target.value.toUpperCase())}
                        placeholder="e.g. NLP2026" maxLength={10} autoFocus required
                        className="mfp-input"
                        style={{ paddingLeft: 38, fontFamily: 'monospace', letterSpacing: '0.14em', fontSize: 15 }} />
                    </div>
                    <p style={{ fontSize: 10, color: 'rgba(100,116,139,0.55)', marginTop: 5 }}>
                      Get this code from the event organizer.
                    </p>
                  </div>
                  <button type="submit" disabled={lookupMutation.isPending} className="mfp-form-btn-primary">
                    {lookupMutation.isPending
                      ? <Loader2 style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} />
                      : <><LogIn style={{ width: 16, height: 16 }} /> Join Event</>}
                  </button>
                </form>
              )}

              {/* ══ CREATE FORM ══ */}
              {modal === 'create' && !success && (
                <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {/* Step bar */}
                  <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
                    {[1, 2].map(n => (
                      <div key={n} className={`mfp-step ${step >= n ? 'active' : 'inactive'}`} />
                    ))}
                  </div>

                  {step === 1 ? (
                    <>
                      {/* AI-Powered Event Architect Section */}
                      <div style={{
                        background: 'rgba(56,189,248,0.06)',
                        border: '1px dashed rgba(56,189,248,0.25)',
                        borderRadius: '16px',
                        padding: '14px',
                        marginBottom: '12px'
                      }}>
                        <Lbl>✨ AI-Powered Event Architect</Lbl>
                        <textarea
                          value={aiPrompt}
                          onChange={e => setAiPrompt(e.target.value)}
                          placeholder="Describe your event (e.g. 'Create a hackathon for 100 students in Bangalore with schedule, chat, and GitHub fields')"
                          rows={2}
                          className="mfp-input"
                          style={{ resize: 'none', fontSize: '11px', marginBottom: '8px', background: '#ffffff' }}
                        />
                        <button
                          type="button"
                          onClick={handleAiGenerate}
                          disabled={aiGenerateMutation.isPending}
                          className="mfp-form-btn-primary"
                          style={{
                            padding: '8px 12px',
                            fontSize: '11px',
                            borderRadius: '8px',
                            width: 'auto',
                            boxShadow: 'none',
                            background: 'linear-gradient(135deg, #0369a1, #0284c7)'
                          }}
                        >
                          {aiGenerateMutation.isPending ? 'Designing...' : 'Generate Setup with AI'}
                        </button>
                        {aiMessage && (
                          <p style={{ fontSize: '10px', color: '#38bdf8', marginTop: '6px', fontWeight: 600 }}>
                            {aiMessage}
                          </p>
                        )}
                      </div>

                      <div>
                        <Lbl>Event Name *</Lbl>
                        <input type="text" value={eventName} onChange={e => setEventName(e.target.value)}
                          placeholder="e.g. Summer Reunion 2026" required autoFocus className="mfp-input" />
                      </div>
                      <div>
                        <Lbl>Event Access Code (Optional)</Lbl>
                        <input type="text" value={createEventCode} onChange={e => setCreateEventCode(e.target.value.toUpperCase())}
                          placeholder="e.g. MYEVENT2026 (Leave empty to auto-generate)" className="mfp-input" style={{ letterSpacing: '0.08em' }} />
                        <p style={{ fontSize: 9, color: 'rgba(100,116,139,0.55)', marginTop: 4 }}>
                          Choose a custom access code for attendees, or leave empty for a random code.
                        </p>
                      </div>
                      <div>
                        <Lbl>Event Type *</Lbl>
                        <select value={eventType} onChange={e => setEventType(e.target.value)} className="mfp-input" style={{ fontSize: 12 }}>
                          <option value="ALUMNI">Alumni Reunion / Meetup</option>
                          <option value="COMMUNITY">Community / Interest Group Gathering</option>
                          <option value="INSTITUTION">School / College / University Event</option>
                          <option value="ORGANIZER">Professional / Organizer Event (General)</option>
                        </select>
                      </div>
                      <div>
                        <Lbl>Description</Lbl>
                        <textarea value={description} onChange={e => setDescription(e.target.value)}
                          placeholder="What's this meetup about?" rows={2}
                          className="mfp-input" style={{ resize: 'none' }} />
                      </div>
                      <div>
                        <Lbl>Venue Name *</Lbl>
                        <div className="mfp-iw">
                          <MapPin className="mfp-ico" style={{ width: 14, height: 14 }} />
                          <input type="text" value={venueName} onChange={e => setVenueName(e.target.value)}
                            placeholder="Hotel / Hall name" required className="mfp-input" style={{ paddingLeft: 36 }} />
                        </div>
                      </div>
                      <div>
                        <Lbl>Venue Address</Lbl>
                        <input type="text" value={venueAddress} onChange={e => setVenueAddress(e.target.value)}
                          placeholder="Full street address" className="mfp-input" />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <div>
                          <Lbl>Start *</Lbl>
                          <input type="datetime-local" value={startDt} onChange={e => setStartDt(e.target.value)}
                            onClick={(e) => e.currentTarget.showPicker()}
                            required className="mfp-input" style={{ colorScheme: 'light', fontSize: 11 }} />
                        </div>
                        <div>
                          <Lbl>End *</Lbl>
                          <input type="datetime-local" value={endDt} onChange={e => setEndDt(e.target.value)}
                            onClick={(e) => e.currentTarget.showPicker()}
                            required className="mfp-input" style={{ colorScheme: 'light', fontSize: 11 }} />
                        </div>
                      </div>
                      <button type="submit" className="mfp-form-btn-primary">
                        Organizer Details <ArrowRight style={{ width: 15, height: 15 }} />
                      </button>
                    </>
                  ) : (
                    <>
                      <p style={{ fontSize: 11, color: 'rgba(100,116,139,0.65)', marginBottom: 2 }}>
                        You'll be auto-registered as the event organizer.
                      </p>
                      <div>
                        <Lbl>Your Full Name *</Lbl>
                        <div className="mfp-iw">
                          <User className="mfp-ico" style={{ width: 14, height: 14 }} />
                          <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                            placeholder="Full name" required autoFocus className="mfp-input" style={{ paddingLeft: 36 }} />
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <div>
                          <Lbl>Mobile *</Lbl>
                          <div className="mfp-iw">
                            <Phone className="mfp-ico" style={{ width: 13, height: 13 }} />
                            <input type="tel" value={mobile} onChange={e => setMobile(e.target.value)}
                              placeholder="+91..." required className="mfp-input" style={{ paddingLeft: 34, fontSize: 12 }} />
                          </div>
                        </div>
                        <div>
                          <Lbl>Email</Lbl>
                          <div className="mfp-iw">
                            <Mail className="mfp-ico" style={{ width: 13, height: 13 }} />
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                              placeholder="you@..." className="mfp-input" style={{ paddingLeft: 34, fontSize: 12 }} />
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <div>
                          <Lbl>Batch / Group</Lbl>
                          <div className="mfp-iw">
                            <Users className="mfp-ico" style={{ width: 13, height: 13 }} />
                            <input type="text" value={batch} onChange={e => setBatch(e.target.value)}
                              placeholder="Batch of 2018" className="mfp-input" style={{ paddingLeft: 34, fontSize: 12 }} />
                          </div>
                        </div>
                        <div>
                          <Lbl>City</Lbl>
                          <select value={city} onChange={e => setCity(e.target.value)}
                            className="mfp-input" style={{ fontSize: 12 }}>
                            {cities.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                        <button type="button" className="mfp-form-btn-back"
                          onClick={() => { setStep(1); setError(''); }}>
                          <ArrowLeft style={{ width: 13, height: 13 }} /> Back
                        </button>
                        <button type="submit" disabled={createMutation.isPending}
                          className="mfp-form-btn-primary" style={{ flex: 1 }}>
                          {createMutation.isPending
                            ? <Loader2 style={{ width: 15, height: 15, animation: 'spin 1s linear infinite' }} />
                            : <><Sparkles style={{ width: 15, height: 15 }} /> Create Event</>}
                        </button>
                      </div>
                    </>
                  )}
                </form>
              )}

              {/* ══ SUCCESS ══ */}
              {modal === 'create' && success && (
                <div className="mfp-success-wrap" style={{ display: 'flex', flexDirection: 'column', gap: 18, textAlign: 'center' }}>
                  <div style={{
                    width: 60, height: 60, margin: '0 auto', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(16,185,129,0.12)', border: '2px solid rgba(16,185,129,0.35)'
                  }}>
                    <Sparkles style={{ width: 28, height: 28, color: '#34d399' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', marginBottom: 4 }}>Event Created! 🎉</div>
                    <div style={{ fontSize: 12, color: 'rgba(100,116,139,0.8)' }}>
                      {EVENT_TYPE_CONFIGS[success.eventType]?.inviteHelper || EVENT_TYPE_CONFIGS.ORGANIZER.inviteHelper}
                    </div>
                  </div>
                  <div className="mfp-info-card" style={{ textAlign: 'left' }}>
                    <div style={{ marginBottom: 12 }}>
                      <Lbl>Event</Lbl>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{success.name}</div>
                    </div>
                    <div className="mfp-divider" />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                      <div>
                        <Lbl>Access Code</Lbl>
                        <div className="mfp-code-display">{success.code}</div>
                      </div>
                      <div>
                        <Lbl>Event URL</Lbl>
                        <div style={{ fontSize: 11, color: 'rgba(100,116,139,0.75)', marginTop: 4, wordBreak: 'break-all' }}>
                          /event/{success.slug}
                        </div>
                      </div>
                    </div>
                    <div className="mfp-divider" />
                    <Lbl>Shareable Link</Lbl>
                    <div className="mfp-copy-row" style={{ marginTop: 8 }}>
                      <span style={{
                        flex: 1, fontSize: 10, fontFamily: 'monospace', color: 'rgba(100,116,139,0.7)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                      }}>
                        {`${window.location.origin}/event/${success.slug}/join?code=${success.code}`}
                      </span>
                      <button className="mfp-copy-btn" onClick={copyLink} title="Copy link">
                        {copied
                          ? <Check style={{ width: 13, height: 13, color: '#34d399' }} />
                          : <Copy style={{ width: 13, height: 13 }} />}
                      </button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button className="mfp-form-btn-back" onClick={close}>Close</button>
                    <button className="mfp-form-btn-primary" style={{ flex: 1 }}
                      onClick={() => { close(); navigate(`/event/${success.slug}`); }}>
                      Go to Dashboard <ArrowRight style={{ width: 15, height: 15 }} />
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PortalPage;
