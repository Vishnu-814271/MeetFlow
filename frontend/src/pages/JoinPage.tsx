import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRegister } from '../services/hooks';
import { EVENT_TYPE_CONFIGS } from './PortalPage';
import { KeyRound, User, Phone, Mail, MapPin, Users, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import confetti from 'canvas-confetti';

export const JoinPageContent: React.FC = () => {
  const { event, eventLoading, setCurrentUser, eventSlug, login } = useAuth();
  const eventConfig = event?.eventType ? (EVENT_TYPE_CONFIGS[event.eventType] || EVENT_TYPE_CONFIGS.ORGANIZER) : EVENT_TYPE_CONFIGS.ORGANIZER;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const codeParam = searchParams.get('code') || '';
  const registerMutation = useRegister();

  const [isLoginMode, setIsLoginMode] = useState(false);
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Form Fields
  const [eventCode, setEventCode] = useState(codeParam);
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [batchOrGroup, setBatchOrGroup] = useState('');
  const [currentCity, setCurrentCity] = useState('Hyderabad');
  const [attendanceStatus, setAttendanceStatus] = useState('confirmed');

  // Dynamic config fields
  const [dynamicValues, setDynamicValues] = useState<Record<string, string>>({});
  const regSchema = React.useMemo(() => {
    if (!event?.registrationSchema) return [];
    try {
      return JSON.parse(event.registrationSchema);
    } catch (e) {
      console.error("Failed to parse registration schema", e);
      return [];
    }
  }, [event?.registrationSchema]);

  const handleDynamicChange = (fieldName: string, value: string) => {
    setDynamicValues(prev => ({ ...prev, [fieldName]: value }));
  };

  // Privacy Fields
  const [showName, setShowName] = useState(true);
  const [showPhone, setShowPhone] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [showTravelDetails, setShowTravelDetails] = useState(true);
  const [allowContact, setAllowContact] = useState(true);

  const cities = ["Hyderabad", "Bangalore", "Chennai", "Pune", "Delhi", "Mumbai", "Kolkata", "Kochi"];

  if (eventLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col bg-background p-6">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground text-sm font-semibold">Loading registration details...</p>
      </div>
    );
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(eventCode.trim(), mobileNumber.trim());
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      navigate(`/event/${eventSlug}`);
    } catch (err: any) {
      setError(err.message || 'Access code or mobile number is invalid.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (eventCode.trim() !== event?.eventCode) {
      setError(`Invalid Event Access Code. Hint: Check your invitation.`);
      return;
    }

    if (!fullName.trim() || !mobileNumber.trim()) {
      setError('Full Name and Mobile Number are required.');
      return;
    }

    setLoading(true);

    let finalBatchOrGroup = batchOrGroup;
    if (regSchema && regSchema.length > 0) {
      const firstField = regSchema[0].name;
      finalBatchOrGroup = dynamicValues[firstField] || '';
    }

    registerMutation.mutate(
      {
        eventId: event!.id,
        fullName: fullName.trim(),
        mobileNumber: mobileNumber.trim(),
        email: email.trim(),
        batchOrGroup: finalBatchOrGroup.trim(),
        currentCity,
        attendanceStatus,
        profileStatus: 'completed',
        showName,
        showPhone,
        showEmail,
        showTravelDetails,
        allowContact,
        customFieldsData: JSON.stringify(dynamicValues),
      },
      {
        onSuccess: (data) => {
          setCurrentUser(data);
          confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
          navigate(`/event/${eventSlug}/travel`); // Direct them to travel form next!
        },
        onError: (err: any) => {
          setError(err.response?.data?.error || err.message || 'Registration failed.');
          setLoading(false);
        },
      }
    );
  };

  const nextStep = () => {
    if (step === 1) {
      if (eventCode.trim() !== event?.eventCode) {
        setError(`Invalid Event Access Code.`);
        return;
      }
      if (!fullName.trim()) {
        setError('Full Name is required.');
        return;
      }
      if (!mobileNumber.trim()) {
        setError('Mobile Number is required for verification.');
        return;
      }
      setError('');
      setStep(2);
    }
  };

  if (isLoginMode) {
    return (
      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto py-8">
        <div className="card p-6 bg-card border border-border rounded-2xl shadow-xl glass">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-foreground">Sign In</h2>
            <p className="text-xs text-muted-foreground mt-1">Access your travel plans and dashboard.</p>
          </div>

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Event Access Code</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground"><KeyRound className="w-4 h-4" /></span>
                <input
                  type="text"
                  value={eventCode}
                  onChange={(e) => setEventCode(e.target.value)}
                  placeholder="e.g. NLP2026"
                  className="w-full pl-10 pr-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-muted-foreground/50"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Verified Mobile Number</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground"><Phone className="w-4 h-4" /></span>
                <input
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="e.g. +919876543210"
                  className="w-full pl-10 pr-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-muted-foreground/50"
                  required
                />
              </div>
            </div>

            {error && <div className="text-xs text-destructive bg-destructive/10 p-2.5 rounded-lg font-medium">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-primary text-primary-foreground font-semibold rounded-lg text-sm shadow hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors flex items-center justify-center space-x-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Verify Details</span>}
            </button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Not registered yet?{' '}
            <button onClick={() => { setIsLoginMode(false); setError(''); }} className="text-primary font-semibold hover:underline">
              Register here
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col justify-center max-w-md mx-auto py-6">
      <div className="card p-6 bg-card border border-border rounded-3xl shadow-xl glass">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-foreground">Participant Registration</h2>
          <p className="text-xs text-muted-foreground mt-1">Join the community travel coordination dashboard.</p>
        </div>

        {/* Form Steps Indicator */}
        <div className="flex items-center justify-center space-x-4 mb-6 text-xs font-semibold text-muted-foreground">
          <span className={`px-2.5 py-1 rounded-full ${step === 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>1. Details</span>
          <span className="w-8 border-t border-border"></span>
          <span className={`px-2.5 py-1 rounded-full ${step === 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>2. Privacy</span>
        </div>

        {error && <div className="text-xs text-destructive bg-destructive/10 p-2.5 rounded-lg font-medium mb-4">{error}</div>}

        <form onSubmit={handleRegister} className="space-y-4">
          {step === 1 ? (
            <>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Event Access Code</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground"><KeyRound className="w-4 h-4" /></span>
                  <input
                    type="text"
                    value={eventCode}
                    onChange={(e) => setEventCode(e.target.value)}
                    placeholder="e.g. NLP2026"
                    className="w-full pl-10 pr-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-muted-foreground/50"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Full Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground"><User className="w-4 h-4" /></span>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full pl-10 pr-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-muted-foreground/50"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Mobile Number</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground"><Phone className="w-4 h-4" /></span>
                    <input
                      type="tel"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      placeholder="e.g. +919876543210"
                      className="w-full pl-10 pr-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-muted-foreground/50"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Email (Optional)</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground"><Mail className="w-4 h-4" /></span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@email.com"
                      className="w-full pl-10 pr-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-muted-foreground/50"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {regSchema && regSchema.length > 0 ? (
                  regSchema.map((field: any) => (
                    <div key={field.name} className="col-span-2 md:col-span-1">
                      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                        {field.label} {field.required && '*'}
                      </label>
                      <div className="relative">
                        {field.type === 'select' ? (
                          <select
                            value={dynamicValues[field.name] || ''}
                            onChange={(e) => handleDynamicChange(field.name, e.target.value)}
                            required={field.required}
                            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                          >
                            <option value="">{field.placeholder || 'Select option'}</option>
                            {field.options?.map((opt: string) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={field.type === 'number' ? 'number' : 'text'}
                            value={dynamicValues[field.name] || ''}
                            onChange={(e) => handleDynamicChange(field.name, e.target.value)}
                            placeholder={field.placeholder}
                            required={field.required}
                            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-muted-foreground/50"
                          />
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">{eventConfig.groupFieldName}</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground"><Users className="w-4 h-4" /></span>
                      <input
                        type="text"
                        value={batchOrGroup}
                        onChange={(e) => setBatchOrGroup(e.target.value)}
                        placeholder={eventConfig.groupPlaceholder}
                        className="w-full pl-10 pr-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-muted-foreground/50"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Current City</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground"><MapPin className="w-4 h-4" /></span>
                    <select
                      value={currentCity}
                      onChange={(e) => setCurrentCity(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    >
                      {cities.map((city) => <option key={city} value={city}>{city}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Are you attending?</label>
                <div className="grid grid-cols-3 gap-2">
                  {['confirmed', 'maybe', 'not_attending'].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setAttendanceStatus(status)}
                      className={`py-2 px-3 border rounded-lg text-xs font-bold transition-all capitalize ${
                        attendanceStatus === status
                          ? 'bg-primary border-primary text-primary-foreground shadow-sm'
                          : 'bg-background border-border text-foreground hover:bg-muted'
                      }`}
                    >
                      {status.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={nextStep}
                className="w-full py-2 px-4 bg-primary text-primary-foreground font-semibold rounded-lg text-sm shadow hover:bg-primary/90 flex items-center justify-center space-x-2 transition-colors mt-6"
              >
                <span>Continue to Privacy Choices</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              {/* Privacy Toggles */}
              <div className="space-y-4 bg-muted/20 p-4 border border-border rounded-2xl">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider mb-3">Visibility Settings</h3>
                
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-foreground">Show Name publicly</label>
                    <p className="text-[10px] text-muted-foreground">Allows other participants to see you in list.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={showName}
                    onChange={(e) => setShowName(e.target.checked)}
                    className="w-4 h-4 accent-primary"
                  />
                </div>

                <div className="flex items-center justify-between border-t border-border/50 pt-3">
                  <div>
                    <label className="text-xs font-bold text-foreground">Show Mobile Number</label>
                    <p className="text-[10px] text-muted-foreground">Allow others to see your phone number.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={showPhone}
                    onChange={(e) => setShowPhone(e.target.checked)}
                    className="w-4 h-4 accent-primary"
                  />
                </div>

                <div className="flex items-center justify-between border-t border-border/50 pt-3">
                  <div>
                    <label className="text-xs font-bold text-foreground">Show Email Address</label>
                    <p className="text-[10px] text-muted-foreground">Allow others to see your email details.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={showEmail}
                    onChange={(e) => setShowEmail(e.target.checked)}
                    className="w-4 h-4 accent-primary"
                  />
                </div>

                <div className="flex items-center justify-between border-t border-border/50 pt-3">
                  <div>
                    <label className="text-xs font-bold text-foreground">Show Travel Details</label>
                    <p className="text-[10px] text-muted-foreground">Make your route and timings visible.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={showTravelDetails}
                    onChange={(e) => setShowTravelDetails(e.target.checked)}
                    className="w-4 h-4 accent-primary"
                  />
                </div>

                <div className="flex items-center justify-between border-t border-border/50 pt-3">
                  <div>
                    <label className="text-xs font-bold text-foreground">Allow Contact Requests</label>
                    <p className="text-[10px] text-muted-foreground">Enables direct in-app message chat trigger links.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={allowContact}
                    onChange={(e) => setAllowContact(e.target.checked)}
                    className="w-4 h-4 accent-primary"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-2 px-4 border border-border bg-transparent text-foreground hover:bg-muted font-semibold rounded-lg text-sm transition-colors flex items-center justify-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 px-4 bg-primary text-primary-foreground font-semibold rounded-lg text-sm shadow hover:bg-primary/90 focus:outline-none disabled:opacity-50 transition-colors flex items-center justify-center space-x-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Confirm Register</span>}
                </button>
              </div>
            </>
          )}
        </form>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Already registered?{' '}
          <button onClick={() => { setIsLoginMode(true); setError(''); }} className="text-primary font-semibold hover:underline">
            Sign In here
          </button>
        </p>
      </div>
    </div>
  );
};

import { useParams } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';

export const JoinPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const eventSlug = slug || 'nlp-meetup-2026';

  return (
    <AuthProvider slug={eventSlug}>
      <JoinPageContent />
    </AuthProvider>
  );
};

export default JoinPage;
