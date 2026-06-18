import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  useCarpoolGroups, 
  useCarpoolSuggestions, 
  useCreateCarpoolGroup, 
  useJoinCarpool, 
  useLeaveCarpool 
} from '../services/hooks';
import ProtectedRoute from '../components/ProtectedRoute';
import { 
  Car, 
  Plus, 
  Users, 
  Calendar, 
  Clock, 
  MapPin, 
  MessageCircle, 
  Info, 
  X, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';

export const CarpoolPageContent: React.FC = () => {
  const { event, currentUser, eventSlug } = useAuth();
  const navigate = useNavigate();

  // Queries
  const { data: groups = [], isLoading: loadingGroups, refetch: refetchGroups } = useCarpoolGroups(event?.id || '');
  const { data: suggestions = [] } = useCarpoolSuggestions(event?.id || '', currentUser?.id || '');
  
  // Mutations
  const createGroupMutation = useCreateCarpoolGroup();
  const joinCarpoolMutation = useJoinCarpool();
  const leaveCarpoolMutation = useLeaveCarpool();

  // UI state
  const [activeTab, setActiveTab] = useState<'all' | 'suggestions'>('all');
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [originCity, setOriginCity] = useState(currentUser?.currentCity || 'Hyderabad');
  const [originArea, setOriginArea] = useState('');
  const [vehicleType, setVehicleType] = useState('Sedan');
  const [departureDate, setDepartureDate] = useState('2026-07-11');
  const [departureTime, setDepartureTime] = useState('06:00 AM');
  const [seatsAvailable, setSeatsAvailable] = useState(4);
  const [pickupNotes, setPickupNotes] = useState('');

  const cities = ["Hyderabad", "Bangalore", "Chennai", "Pune", "Delhi", "Mumbai", "Kolkata", "Kochi"];
  const vehicleTypes = ["Sedan", "SUV", "Hatchback", "EV", "Crossover"];

  const handleOfferRide = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    if (!title || !originArea) {
      setError('Group Title and Pickup Locality are required.');
      setSubmitting(false);
      return;
    }

    createGroupMutation.mutate(
      {
        eventId: event!.id,
        title,
        originCity,
        originArea,
        driverParticipantId: currentUser!.id,
        vehicleType,
        departureDate,
        departureTime,
        seatsAvailable,
        pickupNotes,
        status: 'active',
        createdBy: currentUser!.id
      },
      {
        onSuccess: () => {
          setSuccess('Carpool offer posted successfully!');
          setSubmitting(false);
          setShowOfferForm(false);
          // Clear form
          setTitle('');
          setOriginArea('');
          setPickupNotes('');
          refetchGroups();
        },
        onError: (err: any) => {
          setError(err.response?.data?.error || err.message || 'Failed to create carpool group.');
          setSubmitting(false);
        }
      }
    );
  };

  const handleJoin = (groupId: string) => {
    setError('');
    joinCarpoolMutation.mutate(
      { groupId, participantId: currentUser!.id },
      {
        onSuccess: () => {
          refetchGroups();
        },
        onError: (err: any) => {
          setError(err.response?.data?.error || err.message || 'Failed to join carpool group.');
        }
      }
    );
  };

  const handleLeave = (groupId: string) => {
    setError('');
    leaveCarpoolMutation.mutate(
      { groupId, participantId: currentUser!.id },
      {
        onSuccess: () => {
          refetchGroups();
        },
        onError: (err: any) => {
          setError(err.response?.data?.error || err.message || 'Failed to leave carpool group.');
        }
      }
    );
  };

  // Check if current user is in any carpool (either driver or passenger)
  const getUserCarpoolRole = (group: any) => {
    if (group.driverParticipantId === currentUser?.id) {
      return 'driver';
    }
    const isMember = group.members?.some((m: any) => m.participantId === currentUser?.id);
    if (isMember) {
      return 'passenger';
    }
    return null;
  };

  const isUserAlreadyCarpooling = groups.some(g => getUserCarpoolRole(g) !== null);

  if (loadingGroups) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="mt-4 text-xs text-muted-foreground font-semibold">Loading carpool board...</p>
      </div>
    );
  }

  const renderGroupCard = (group: any) => {
    const role = getUserCarpoolRole(group);
    const seatsRemaining = group.seatsAvailable - (group.members?.length || 0);
    const isFull = seatsRemaining <= 0;

    return (
      <div 
        key={group.id} 
        className={`bg-card border rounded-3xl p-5 shadow-sm transition-all duration-300 relative overflow-hidden flex flex-col justify-between interactive-card ${
          role ? 'border-primary/40 ring-1 ring-primary/10 shadow-md bg-gradient-to-br from-card via-card to-primary/5' : 'border-border'
        }`}
      >
        {role && (
          <div className="absolute top-0 right-0 px-3.5 py-1 bg-primary text-primary-foreground text-[10px] font-extrabold uppercase rounded-bl-xl tracking-wider shadow-sm">
            {role === 'driver' ? 'Your Ride (Driver)' : 'Joined'}
          </div>
        )}

        <div>
          {/* Group Header */}
          <div className="pr-16">
            <h3 className="text-sm font-bold text-foreground leading-snug group-hover:text-primary transition-colors">{group.title}</h3>
            <p className="text-[10px] text-muted-foreground mt-1 flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="font-bold text-foreground/80">{group.originCity}</span>
              <span className="text-muted-foreground/60">•</span>
              <span>{group.originArea}</span>
            </p>
          </div>

          {/* Journey Grid */}
          <div className="grid grid-cols-2 gap-3.5 my-4 bg-muted/30 border border-border/40 rounded-2xl p-3 text-xs">
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">Departure</span>
              <div className="flex items-center space-x-1.5 text-foreground font-semibold">
                <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>{group.departureDate}</span>
              </div>
              <div className="flex items-center space-x-1.5 text-muted-foreground text-[11px]">
                <Clock className="w-3 h-3 text-muted-foreground shrink-0" />
                <span>{group.departureTime}</span>
              </div>
            </div>

            <div className="space-y-1 border-l border-border/50 pl-3">
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">Vehicle Info</span>
              <div className="flex items-center space-x-1.5 text-foreground font-semibold capitalize">
                <Car className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>{group.vehicleType}</span>
              </div>
              <div className="text-[11px] font-semibold text-muted-foreground flex items-center space-x-1.5 mt-0.5">
                {seatsRemaining > 0 ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-emerald-500 font-bold">{seatsRemaining} seats left</span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    <span className="text-rose-500 font-bold">Full</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Driver Details */}
          <div className="flex items-center justify-between border-t border-border/40 pt-3 text-xs">
            <div className="flex items-center space-x-2.5">
              <div className="w-8.5 h-8.5 bg-gradient-to-br from-primary/10 to-indigo-500/10 text-primary border border-primary/20 rounded-full flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                {group.driverName?.charAt(0) || 'D'}
              </div>
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground">Driver / Initiator</p>
                <p className="font-bold text-foreground text-xs">{group.driverName}</p>
              </div>
            </div>

            {/* Quick Driver Contact if permission permits */}
            {group.driverPhone && group.driverPhone !== '[Hidden]' && (
              <a 
                href={`https://wa.me/${group.driverPhone.replace('+', '')}`}
                target="_blank"
                rel="noreferrer"
                className="p-2 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 rounded-xl transition-all duration-200 shadow-sm"
                title="Chat with Driver"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            )}
          </div>

          {/* Co-passengers list */}
          {group.members && group.members.length > 0 && (
            <div className="mt-3.5 border-t border-border/40 pt-3.5">
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide mb-2 flex items-center space-x-1.5">
                <Users className="w-3.5 h-3.5 text-primary" />
                <span>Co-passengers ({group.members.length})</span>
              </p>
              <div className="flex flex-wrap gap-1.5">
                {group.members.map((m: any) => (
                  <div 
                    key={m.participantId}
                    className="flex items-center space-x-1 px-2.5 py-1 bg-muted border border-border rounded-full text-xs hover:border-muted-foreground/35 transition-colors"
                  >
                    <span className="font-bold text-[11px] text-foreground/80">{m.fullName}</span>
                    {m.mobileNumber && m.mobileNumber !== '[Hidden]' && m.showPhone && (
                      <a 
                        href={`https://wa.me/${m.mobileNumber.replace('+', '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-500 hover:text-emerald-600 ml-0.5"
                      >
                        <MessageCircle className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {group.pickupNotes && (
            <div className="mt-3.5 bg-muted/20 p-2.5 border border-dashed border-border rounded-xl text-[11px] text-muted-foreground">
              <span className="font-bold text-foreground text-[10px] block mb-0.5">Pickup notes:</span>
              &ldquo;{group.pickupNotes}&rdquo;
            </div>
          )}
        </div>

        {/* Carpool Join/Leave Button */}
        <div className="mt-4 pt-3.5 border-t border-border/40 flex items-center justify-end">
          {role === 'driver' ? (
            <span className="text-[10px] text-primary font-extrabold bg-primary/15 px-2.5 py-1 rounded-lg">
              Manage from profile settings
            </span>
          ) : role === 'passenger' ? (
            <button
              onClick={() => handleLeave(group.id)}
              className="px-3.5 py-1.5 bg-rose-500/10 text-rose-600 border border-rose-500/20 hover:bg-rose-500/20 font-bold rounded-xl text-xs transition-colors flex items-center space-x-1.5"
            >
              <span>Leave Carpool Group</span>
            </button>
          ) : (
            <button
              onClick={() => handleJoin(group.id)}
              disabled={isFull || isUserAlreadyCarpooling}
              className="px-4 py-2 bg-primary text-primary-foreground font-bold rounded-xl text-xs hover:bg-primary/90 hover:shadow-md disabled:opacity-40 transition-colors flex items-center space-x-1.5 active:scale-95"
            >
              <span>Join Carpool</span>
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header title & offer ride trigger */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">Carpool Coordination Board</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Create, find, or join carpool clusters from common cities.</p>
        </div>
        <button
          onClick={() => setShowOfferForm(!showOfferForm)}
          className="px-4 py-2 bg-primary text-primary-foreground font-bold rounded-xl text-xs shadow hover:bg-primary/90 hover:shadow-lg active:scale-95 transition-all flex items-center justify-center space-x-1.5 self-start sm:self-auto shrink-0"
        >
          {showOfferForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{showOfferForm ? 'Close Form' : 'Offer Ride'}</span>
        </button>
      </div>

      {/* Offer Ride Form Card */}
      {showOfferForm && (
        <div className="card p-6 bg-card border border-primary/20 rounded-3xl shadow-lg glass animate-pulse-slow max-w-2xl">
          <h3 className="text-sm font-bold text-foreground mb-4 flex items-center space-x-2">
            <Car className="w-5 h-5 text-primary" />
            <span>Create Carpool Pool (Offer Ride)</span>
          </h3>

          {success && (
            <div className="text-xs text-emerald-600 bg-emerald-500/10 p-2.5 rounded-lg font-semibold mb-3">
              {success}
            </div>
          )}

          {error && (
            <div className="text-xs text-destructive bg-destructive/10 p-2.5 rounded-lg font-semibold mb-3">
              {error}
            </div>
          )}

          <form onSubmit={handleOfferRide} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Group / Carpool Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Ramesh's Morning SUV Express"
                className="w-full bg-background border border-border rounded-lg p-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-muted-foreground/30"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Origin City</label>
                <select
                  value={originCity}
                  onChange={(e) => setOriginCity(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg p-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {cities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Pickup Locality</label>
                <input
                  type="text"
                  value={originArea}
                  onChange={(e) => setOriginArea(e.target.value)}
                  placeholder="e.g. Gachibowli, Outer Ring Road"
                  className="w-full bg-background border border-border rounded-lg p-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/30"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Vehicle Type</label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg p-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {vehicleTypes.map(vt => <option key={vt} value={vt}>{vt}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Seats Offered</label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={seatsAvailable}
                  onChange={(e) => setSeatsAvailable(parseInt(e.target.value) || 4)}
                  className="w-full bg-background border border-border rounded-lg p-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Departure Date</label>
                <input
                  type="date"
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg p-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Departure Time</label>
                <input
                  type="text"
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                  placeholder="e.g. 06:30 AM"
                  className="w-full bg-background border border-border rounded-lg p-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Pickup Notes / Instructions</label>
              <textarea
                value={pickupNotes}
                onChange={(e) => setPickupNotes(e.target.value)}
                placeholder="Where to coordinate meeting? (e.g. near Gachibowli Metro Pillar 12)"
                rows={2}
                className="w-full bg-background border border-border rounded-lg p-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/30"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-primary text-primary-foreground font-bold rounded-xl text-xs hover:bg-primary/90 transition-colors flex items-center justify-center space-x-1.5 shadow active:scale-[0.98]"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Publish Carpool Offer</span>}
            </button>
          </form>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex-1 py-2.5 text-center text-xs font-bold border-b-2 transition-all duration-200 ${
            activeTab === 'all' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Active Carpools ({groups.length})
        </button>
        <button
          onClick={() => setActiveTab('suggestions')}
          className={`flex-1 py-2.5 text-center text-xs font-bold border-b-2 transition-all duration-200 ${
            activeTab === 'suggestions' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Suggested Matches ({suggestions.length})
        </button>
      </div>

      {/* Warnings / Notifications */}
      {isUserAlreadyCarpooling && (
        <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 rounded-2xl flex items-start space-x-2.5 text-xs">
          <Info className="w-4.5 h-4.5 shrink-0 mt-0.5 text-indigo-500" />
          <div>
            <p className="font-bold text-foreground">You are already coordinating in a carpool!</p>
            <p className="text-[11px] opacity-90 mt-0.5">You can only participate in one active pool at a time. Leave your existing group if you wish to switch.</p>
          </div>
        </div>
      )}

      {/* Main List Display */}
      <div>
        {activeTab === 'all' ? (
          groups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups.map(g => renderGroupCard(g))}
            </div>
          ) : (
            <div className="p-8 text-center bg-card border border-border rounded-3xl">
              <Car className="w-8 h-8 text-muted-foreground/60 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-foreground">No carpool groups available</h4>
              <p className="text-xs text-muted-foreground mt-0.5">Click &ldquo;Offer Ride&rdquo; to start the first carpool group for this meetup!</p>
            </div>
          )
        ) : (
          suggestions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {suggestions.map(g => renderGroupCard(g))}
            </div>
          ) : (
            <div className="p-8 text-center bg-card border border-border rounded-3xl max-w-xl mx-auto">
              <AlertCircle className="w-8 h-8 text-muted-foreground/60 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-foreground">No recommendations found</h4>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                Matches are suggested based on matching **Origin City** and travel window schedules. Submit your travel details first or offer a ride to seed group suggestions!
              </p>
              <button 
                onClick={() => navigate(`/event/${eventSlug}/travel`)}
                className="mt-4 px-3 py-1.5 border border-border hover:bg-muted hover:border-muted-foreground/30 text-xs font-bold rounded-xl text-foreground transition-all duration-200"
              >
                Go to Travel Submission
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export const CarpoolPage: React.FC = () => (
  <ProtectedRoute>
    <CarpoolPageContent />
  </ProtectedRoute>
);

export default CarpoolPage;
