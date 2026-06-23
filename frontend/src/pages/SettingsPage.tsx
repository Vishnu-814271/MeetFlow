import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  useUpdateProfile, 
  useSaveStatusUpdate, 
  useStatusUpdates 
} from '../services/hooks';
import ProtectedRoute from '../components/ProtectedRoute';
import { 
  User, 
  Shield, 
  Activity, 
  Save, 
  Loader2, 
  LogOut, 
  CheckCircle, 
  Compass, 
  Lock,
  Clock
} from 'lucide-react';

export const SettingsPageContent: React.FC = () => {
  const { event, currentUser, logout, setCurrentUser, eventSlug } = useAuth();
  const navigate = useNavigate();

  // Mutations
  const updateProfileMutation = useUpdateProfile();
  const saveStatusMutation = useSaveStatusUpdate();

  // Queries (for logging history)
  const { data: allStatusUpdates = [], refetch: refetchStatus } = useStatusUpdates(event?.id || '');

  // UI state
  const [activeTab, setActiveTab] = useState<'profile' | 'privacy' | 'status'>('profile');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Profile Form state
  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [batchOrGroup, setBatchOrGroup] = useState(currentUser?.batchOrGroup || '');
  const [currentCity, setCurrentCity] = useState(currentUser?.currentCity || '');
  const [attendanceStatus, setAttendanceStatus] = useState(currentUser?.attendanceStatus || 'attending');

  // Privacy Form state
  const [showName, setShowName] = useState(currentUser?.showName ?? true);
  const [showPhone, setShowPhone] = useState(currentUser?.showPhone ?? false);
  const [showEmail, setShowEmail] = useState(currentUser?.showEmail ?? false);
  const [showTravelDetails, setShowTravelDetails] = useState(currentUser?.showTravelDetails ?? true);
  const [allowContact, setAllowContact] = useState(currentUser?.allowContact ?? true);

  // Status Form state
  const [tripStatus, setTripStatus] = useState('en_route'); // en_route, reached_venue, left_venue
  const [statusNote, setStatusNote] = useState('');

  // Sync state if currentUser changes
  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.fullName);
      setEmail(currentUser.email || '');
      setBatchOrGroup(currentUser.batchOrGroup || '');
      setCurrentCity(currentUser.currentCity || '');
      setAttendanceStatus(currentUser.attendanceStatus || 'attending');

      setShowName(currentUser.showName);
      setShowPhone(currentUser.showPhone);
      setShowEmail(currentUser.showEmail);
      setShowTravelDetails(currentUser.showTravelDetails);
      setAllowContact(currentUser.allowContact);
    }
  }, [currentUser]);

  // Filter updates for current participant
  const myStatusHistory = allStatusUpdates
    .filter(su => su.participantId === currentUser?.id)
    .sort((a, b) => {
      const d1 = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const d2 = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return d2 - d1; // latest first
    });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!fullName.trim()) {
      setError('Name is required.');
      setLoading(false);
      return;
    }

    updateProfileMutation.mutate(
      {
        id: currentUser!.id,
        data: {
          ...currentUser,
          fullName: fullName.trim(),
          email: email.trim(),
          batchOrGroup: batchOrGroup.trim(),
          currentCity,
          attendanceStatus,
          showName,
          showPhone,
          showEmail,
          showTravelDetails,
          allowContact
        }
      },
      {
        onSuccess: (data) => {
          setCurrentUser(data);
          setSuccess('Profile details saved!');
          setLoading(false);
          setTimeout(() => setSuccess(''), 2000);
        },
        onError: (err: any) => {
          setError(err.response?.data?.error || err.message || 'Failed to update profile.');
          setLoading(false);
        }
      }
    );
  };

  const handleSavePrivacy = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    updateProfileMutation.mutate(
      {
        id: currentUser!.id,
        data: {
          ...currentUser,
          fullName: fullName.trim(),
          email: email.trim(),
          batchOrGroup: batchOrGroup.trim(),
          currentCity,
          attendanceStatus,
          showName,
          showPhone,
          showEmail,
          showTravelDetails,
          allowContact
        }
      },
      {
        onSuccess: (data) => {
          setCurrentUser(data);
          setSuccess('Privacy configurations saved!');
          setLoading(false);
          setTimeout(() => setSuccess(''), 2000);
        },
        onError: (err: any) => {
          setError(err.response?.data?.error || err.message || 'Failed to update privacy.');
          setLoading(false);
        }
      }
    );
  };

  const handlePostStatus = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    saveStatusMutation.mutate(
      {
        eventId: event!.id,
        participantId: currentUser!.id,
        status: tripStatus,
        markedBy: currentUser!.fullName,
        note: statusNote.trim()
      },
      {
        onSuccess: () => {
          setStatusNote('');
          setSuccess('Travel status update logged!');
          setLoading(false);
          refetchStatus();
          setTimeout(() => setSuccess(''), 2000);
        },
        onError: (err: any) => {
          setError(err.response?.data?.error || err.message || 'Failed to post status update.');
          setLoading(false);
        }
      }
    );
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'reached_venue':
        return 'Reached Venue';
      case 'en_route':
        return 'En Route';
      case 'left_venue':
        return 'Left Venue';
      case 'registered':
        return 'Registered';
      default:
        return status;
    }
  };

  const cities = ["Hyderabad", "Bangalore", "Chennai", "Pune", "Delhi", "Mumbai", "Kolkata", "Kochi"];

  return (
    <div className="space-y-5 pb-8">
      {/* Title & Signout */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-foreground">My Profile Settings</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Manage privacy variables, details, and report trip progress.</p>
        </div>
        <button 
          onClick={() => {
            logout();
            navigate(`/event/${eventSlug}`);
          }}
          className="flex items-center space-x-1.5 px-3 py-1.5 border border-border hover:bg-muted text-xs font-bold rounded-xl text-foreground transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-card border border-border p-1 rounded-2xl text-xs font-bold">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center space-x-1.5 ${
            activeTab === 'profile' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Profile Details</span>
        </button>
        <button
          onClick={() => setActiveTab('privacy')}
          className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center space-x-1.5 ${
            activeTab === 'privacy' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Privacy & Toggles</span>
        </button>
        <button
          onClick={() => setActiveTab('status')}
          className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center space-x-1.5 ${
            activeTab === 'status' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Trip Status</span>
        </button>
      </div>

      {/* Notifications */}
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

      {/* Tab Panels */}
      {activeTab === 'profile' && (
        <div className="card p-5 bg-card border border-border rounded-3xl shadow-sm glass">
          <h3 className="text-sm font-bold text-foreground mb-4 flex items-center space-x-1.5">
            <User className="w-4 h-4 text-primary" />
            <span>Edit Profile Data</span>
          </h3>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-background border border-border rounded-lg p-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Mobile Number (Non-Editable)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground/40"><Lock className="w-3.5 h-3.5" /></span>
                <input
                  type="text"
                  value={currentUser?.mobileNumber || ''}
                  disabled
                  className="w-full pl-9 pr-3 py-2 bg-muted/40 border border-border rounded-lg text-xs text-muted-foreground/60 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-background border border-border rounded-lg p-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Origin City</label>
                <select
                  value={currentCity}
                  onChange={(e) => setCurrentCity(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg p-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {cities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Cohort Batch / Group</label>
                <input
                  type="text"
                  value={batchOrGroup}
                  onChange={(e) => setBatchOrGroup(e.target.value)}
                  placeholder="e.g. Batch 2024"
                  className="w-full bg-background border border-border rounded-lg p-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Meetup Attendance</label>
              <select
                value={attendanceStatus}
                onChange={(e) => setAttendanceStatus(e.target.value)}
                className="w-full bg-background border border-border rounded-lg p-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="attending">Attending (Confirmed)</option>
                <option value="maybe">Maybe (Not Sure)</option>
                <option value="not_attending">Not Attending</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-primary text-primary-foreground font-bold rounded-xl text-xs hover:bg-primary/95 transition-colors flex items-center justify-center space-x-1"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>Save Profile Changes</span>
            </button>
          </form>
        </div>
      )}

      {activeTab === 'privacy' && (
        <div className="card p-5 bg-card border border-border rounded-3xl shadow-sm glass">
          <h3 className="text-sm font-bold text-foreground mb-4 flex items-center space-x-1.5">
            <Shield className="w-4 h-4 text-primary" />
            <span>Configure Directory Privacy Toggles</span>
          </h3>

          <p className="text-xs text-muted-foreground leading-normal mb-4 bg-muted/20 border border-border/40 p-2.5 rounded-2xl">
            MEET-FLOW respects your privacy settings. Toggles below control which details are published to other participants in the search directory and data downloads.
          </p>

          <form onSubmit={handleSavePrivacy} className="space-y-4">
            <div className="space-y-3.5">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showName}
                  onChange={(e) => setShowName(e.target.checked)}
                  className="mt-0.5 rounded text-primary border-border focus:ring-primary"
                />
                <div>
                  <span className="text-xs font-bold text-foreground block">Display Full Name</span>
                  <span className="text-[10px] text-muted-foreground">If unchecked, your profile is listed as &ldquo;Anonymous&rdquo; in directory searches.</span>
                </div>
              </label>

              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showPhone}
                  onChange={(e) => setShowPhone(e.target.checked)}
                  className="mt-0.5 rounded text-primary border-border focus:ring-primary"
                />
                <div>
                  <span className="text-xs font-bold text-foreground block">Display Mobile Number</span>
                  <span className="text-[10px] text-muted-foreground">Allows cohort members to see your phone number in list modules.</span>
                </div>
              </label>

              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showEmail}
                  onChange={(e) => setShowEmail(e.target.checked)}
                  className="mt-0.5 rounded text-primary border-border focus:ring-primary"
                />
                <div>
                  <span className="text-xs font-bold text-foreground block">Display Email Address</span>
                  <span className="text-[10px] text-muted-foreground">Shows email address for general correspondence.</span>
                </div>
              </label>

              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showTravelDetails}
                  onChange={(e) => setShowTravelDetails(e.target.checked)}
                  className="mt-0.5 rounded text-primary border-border focus:ring-primary"
                />
                <div>
                  <span className="text-xs font-bold text-foreground block">Show Outgoing & Return Travel Details</span>
                  <span className="text-[10px] text-muted-foreground">If unchecked, departures, transit mode, and maps are locked.</span>
                </div>
              </label>

              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowContact}
                  onChange={(e) => setAllowContact(e.target.checked)}
                  className="mt-0.5 rounded text-primary border-border focus:ring-primary"
                />
                <div>
                  <span className="text-xs font-bold text-foreground block">Allow Quick WhatsApp Chat Initiations</span>
                  <span className="text-[10px] text-muted-foreground">Adds a direct &ldquo;Chat WhatsApp&rdquo; link next to your directory listing.</span>
                </div>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-primary text-primary-foreground font-bold rounded-xl text-xs hover:bg-primary/95 transition-colors flex items-center justify-center space-x-1 mt-6"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>Save Privacy Preferences</span>
            </button>
          </form>
        </div>
      )}

      {activeTab === 'status' && (
        <div className="space-y-4">
          <div className="card p-5 bg-card border border-border rounded-3xl shadow-sm glass">
            <h3 className="text-sm font-bold text-foreground mb-3 flex items-center space-x-1.5">
              <Activity className="w-4 h-4 text-primary" />
              <span>Log Trip Transit Status</span>
            </h3>

            <form onSubmit={handlePostStatus} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Current Transit Stage</label>
                <select
                  value={tripStatus}
                  onChange={(e) => setTripStatus(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg p-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="en_route">En Route (Currently Traveling)</option>
                  <option value="reached_venue">Reached Venue (At retreat center)</option>
                  <option value="left_venue">Left Venue (Returning Home)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Optional note (e.g. location/updates)</label>
                <input
                  type="text"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="e.g. Stuck in highway bypass traffic, or Boarded flight"
                  className="w-full bg-background border border-border rounded-lg p-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/30"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-primary text-primary-foreground font-bold rounded-xl text-xs hover:bg-primary/95 transition-colors flex items-center justify-center space-x-1"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Compass className="w-3.5 h-3.5" />}
                <span>Log Progress Status</span>
              </button>
            </form>
          </div>

          {/* Log History */}
          <div className="card p-5 bg-card border border-border rounded-3xl shadow-sm">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wide mb-3 flex items-center space-x-1.5">
              <Clock className="w-4 h-4 text-primary" />
              <span>Status Update History</span>
            </h3>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1 no-scrollbar divide-y divide-border/60">
              {myStatusHistory.length > 0 ? (
                myStatusHistory.map((sh, idx) => (
                  <div key={sh.id || idx} className="pt-2.5 first:pt-0 text-xs">
                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-foreground capitalize">{getStatusText(sh.status)}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {sh.createdAt ? new Date(sh.createdAt).toLocaleString([], { hour: '2-digit', minute: '2-digit', dateStyle: 'short' }) : 'Just now'}
                      </span>
                    </div>
                    {sh.note && (
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-normal italic">&ldquo;{sh.note}&rdquo;</p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground text-center py-4">No progress states logged yet.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const SettingsPage: React.FC = () => (
  <ProtectedRoute>
    <SettingsPageContent />
  </ProtectedRoute>
);

export default SettingsPage;
