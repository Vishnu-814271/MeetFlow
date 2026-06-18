import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Loader2, UserPlus, KeyRound, Phone } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isLoggedIn, login, eventSlug } = useAuth();
  const navigate = useNavigate();
  
  const [code, setCode] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isLoggedIn) {
    return <>{children}</>;
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!code || !phone) {
      setError('Both Event Code and Mobile Number are required.');
      setLoading(false);
      return;
    }

    try {
      await login(code.trim(), phone.trim());
    } catch (err: any) {
      setError(err.message || 'Verification failed. Check code and number.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto py-12">
      <div className="card p-6 bg-card border border-border rounded-2xl shadow-xl glass">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Verify Event Access</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Please enter the event details to coordinate with the cohort.
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label htmlFor="event-code" className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
              Event Code
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground">
                <KeyRound className="w-4 h-4" />
              </span>
              <input
                id="event-code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. NLP2026"
                className="w-full pl-10 pr-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-muted-foreground/50"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="mobile-number" className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
              Mobile Number
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground">
                <Phone className="w-4 h-4" />
              </span>
              <input
                id="mobile-number"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +919876543210"
                className="w-full pl-10 pr-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-muted-foreground/50"
                required
              />
            </div>
          </div>

          {error && (
            <div className="text-xs text-destructive bg-destructive/10 p-2.5 rounded-lg font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-primary text-primary-foreground font-semibold rounded-lg text-sm shadow hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <span>Verify & Enter Dashboard</span>
            )}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground font-semibold">New Participant?</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate(`/event/${eventSlug}/join`)}
          className="w-full py-2 px-4 border border-border bg-transparent text-foreground hover:bg-muted font-semibold rounded-lg text-sm transition-colors flex items-center justify-center space-x-2"
        >
          <UserPlus className="w-4 h-4" />
          <span>Register as Participant</span>
        </button>
      </div>
    </div>
  );
};

export default ProtectedRoute;
