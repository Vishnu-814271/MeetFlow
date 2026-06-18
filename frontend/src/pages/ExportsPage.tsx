import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ProtectedRoute from '../components/ProtectedRoute';
import { 
  Download, 
  ArrowLeft, 
  Users, 
  Compass, 
  Car, 
  AlertCircle, 
  Loader2, 
  CheckCircle 
} from 'lucide-react';

export const ExportsPageContent: React.FC = () => {
  const { event, eventSlug, currentUser, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const isOrganizer = isLoggedIn && currentUser && event && currentUser.id === event.createdBy;

  React.useEffect(() => {
    if (!isLoggedIn) {
      navigate(`/event/${eventSlug}/join`);
    } else if (!isOrganizer) {
      navigate(`/event/${eventSlug}`);
    }
  }, [isLoggedIn, isOrganizer, eventSlug, navigate]);

  // Loading states
  const [downloading, setDownloading] = useState<'participants' | 'travel' | 'carpools' | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isLoggedIn || !isOrganizer) {
    return null;
  }

  const triggerDownload = async (type: 'participants' | 'travel' | 'carpools', filename: string) => {
    setError('');
    setSuccess('');
    setDownloading(type);

    try {
      const response = await api.get(`/events/${event!.id}/export/${type}`, {
        responseType: 'blob',
      });
      
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setSuccess(`${filename} downloaded successfully!`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(`Failed to download ${filename}. Server returned error.`);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="space-y-5 pb-8">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <button 
          onClick={() => navigate(`/event/${eventSlug}/dashboard`)}
          className="p-1.5 border border-border hover:bg-muted rounded-lg text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-black text-foreground">Export Data Center</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Download offline coordination sheets in CSV formats.</p>
        </div>
      </div>

      {/* Info Warning Banner */}
      <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 rounded-2xl flex items-start space-x-2 text-xs">
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Privacy Masking Enabled</p>
          <p className="text-[11px] opacity-90 mt-0.5">
            Exported CSV files strictly respect each participant's privacy settings. Phone numbers and email coordinates of members who disabled sharing are masked as `[Hidden]`.
          </p>
        </div>
      </div>

      {/* Success/Error Alerts */}
      {success && (
        <div className="text-xs text-emerald-600 bg-emerald-500/10 p-3 rounded-xl font-bold flex items-center space-x-1.5">
          <CheckCircle className="w-4 h-4 text-emerald-500" />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="text-xs text-destructive bg-destructive/10 p-3 rounded-xl font-bold">
          {error}
        </div>
      )}

      {/* Grid of export options */}
      <div className="grid grid-cols-1 gap-4">
        {/* 1. Participants List */}
        <div className="card p-5 bg-card border border-border rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-primary/30 transition-all">
          <div className="flex items-start space-x-3.5">
            <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Participant Directory CSV</h3>
              <p className="text-xs text-muted-foreground mt-0.5 leading-normal max-w-sm">
                Full list of registered meetup participants, origin cities, cohort batches, and verified contact status details.
              </p>
            </div>
          </div>

          <button
            onClick={() => triggerDownload('participants', 'nlp_meetup_participants.csv')}
            disabled={downloading !== null}
            className="px-4 py-2 bg-primary text-primary-foreground font-bold rounded-xl text-xs hover:bg-primary/95 disabled:opacity-50 transition-colors flex items-center justify-center space-x-1.5 shrink-0"
          >
            {downloading === 'participants' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>Download CSV</span>
          </button>
        </div>

        {/* 2. Travel Plans List */}
        <div className="card p-5 bg-card border border-border rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-primary/30 transition-all">
          <div className="flex items-start space-x-3.5">
            <div className="w-10 h-10 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Travel Summary CSV</h3>
              <p className="text-xs text-muted-foreground mt-0.5 leading-normal max-w-sm">
                Departure plans, arrival timetables, expected reach schedules, passenger volume logs, and travel notes.
              </p>
            </div>
          </div>

          <button
            onClick={() => triggerDownload('travel', 'nlp_meetup_travel_plans.csv')}
            disabled={downloading !== null}
            className="px-4 py-2 bg-primary text-primary-foreground font-bold rounded-xl text-xs hover:bg-primary/95 disabled:opacity-50 transition-colors flex items-center justify-center space-x-1.5 shrink-0"
          >
            {downloading === 'travel' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>Download CSV</span>
          </button>
        </div>

        {/* 3. Carpools List */}
        <div className="card p-5 bg-card border border-border rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-primary/30 transition-all">
          <div className="flex items-start space-x-3.5">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 shrink-0">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Carpool Clusters CSV</h3>
              <p className="text-xs text-muted-foreground mt-0.5 leading-normal max-w-sm">
                Active carpools list containing driver schedules, vehicle seat availability thresholds, and list of joined passengers.
              </p>
            </div>
          </div>

          <button
            onClick={() => triggerDownload('carpools', 'nlp_meetup_carpool_groups.csv')}
            disabled={downloading !== null}
            className="px-4 py-2 bg-primary text-primary-foreground font-bold rounded-xl text-xs hover:bg-primary/95 disabled:opacity-50 transition-colors flex items-center justify-center space-x-1.5 shrink-0"
          >
            {downloading === 'carpools' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>Download CSV</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export const ExportsPage: React.FC = () => (
  <ProtectedRoute>
    <ExportsPageContent />
  </ProtectedRoute>
);

export default ExportsPage;
