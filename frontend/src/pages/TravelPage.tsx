import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTravelPlan, useSaveTravelPlan } from '../services/hooks';
import ProtectedRoute from '../components/ProtectedRoute';
import { Compass, MapPin, Loader2, Save, ArrowLeft, Users, Briefcase } from 'lucide-react';

export const TravelPageContent: React.FC = () => {
  const { event, currentUser, eventSlug } = useAuth();
  const navigate = useNavigate();
  
  // Queries
  const { data: existingPlan, isLoading: loadingPlan } = useTravelPlan(currentUser?.id || '');
  const savePlanMutation = useSaveTravelPlan();

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Form Fields
  const [originCity, setOriginCity] = useState('Hyderabad');
  const [originArea, setOriginArea] = useState('');
  const [googleMapsLink, setGoogleMapsLink] = useState('');
  const [travelMode, setTravelMode] = useState('need_carpool');
  const [departureDate, setDepartureDate] = useState('2026-07-11');
  const [departureTime, setDepartureTime] = useState('06:00 AM');
  const [expectedArrivalDate, setExpectedArrivalDate] = useState('2026-07-11');
  const [expectedArrivalTime, setExpectedArrivalTime] = useState('09:00 AM');
  const [returnDate, setReturnDate] = useState('2026-07-12');
  const [returnTime, setReturnTime] = useState('04:00 PM');
  const [peopleCount, setPeopleCount] = useState(1);
  const [luggageCount, setLuggageCount] = useState(1);
  const [travelNote, setTravelNote] = useState('');

  const cities = ["Hyderabad", "Bangalore", "Chennai", "Pune", "Delhi", "Mumbai", "Kolkata", "Kochi"];
  const modes = [
    { value: 'own_car', label: 'Own Car (I am driving)' },
    { value: 'need_carpool', label: 'Need Carpool (Passenger)' },
    { value: 'train', label: 'Train' },
    { value: 'bus', label: 'Bus' },
    { value: 'flight', label: 'Flight' },
    { value: 'taxi', label: 'Taxi / Cab' },
    { value: 'not_decided', label: 'Not Decided yet' }
  ];

  // Load existing plan if available
  useEffect(() => {
    if (existingPlan) {
      setOriginCity(existingPlan.originCity || 'Hyderabad');
      setOriginArea(existingPlan.originArea || '');
      setGoogleMapsLink(existingPlan.googleMapsLink || '');
      setTravelMode(existingPlan.travelMode || 'need_carpool');
      setDepartureDate(existingPlan.departureDate || '2026-07-11');
      setDepartureTime(existingPlan.departureTime || '06:00 AM');
      setExpectedArrivalDate(existingPlan.expectedArrivalDate || '2026-07-11');
      setExpectedArrivalTime(existingPlan.expectedArrivalTime || '09:00 AM');
      setReturnDate(existingPlan.returnDate || '2026-07-12');
      setReturnTime(existingPlan.returnTime || '04:00 PM');
      setPeopleCount(existingPlan.peopleCount || 1);
      setLuggageCount(existingPlan.luggageCount || 1);
      setTravelNote(existingPlan.travelNote || '');
    }
  }, [existingPlan]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!originCity) {
      setError('Origin City is required.');
      setLoading(false);
      return;
    }

    savePlanMutation.mutate(
      {
        id: existingPlan?.id, // include if updating
        eventId: event!.id,
        participantId: currentUser!.id,
        originCity,
        originArea,
        googleMapsLink,
        travelMode,
        departureDate,
        departureTime,
        expectedArrivalDate,
        expectedArrivalTime,
        returnDate,
        returnTime,
        peopleCount,
        luggageCount,
        travelNote,
      },
      {
        onSuccess: () => {
          setSuccess('Travel plan saved successfully!');
          setLoading(false);
          // Redirect logic: if carpooling, go directly to carpool board
          setTimeout(() => {
            if (travelMode === 'need_carpool' || travelMode === 'own_car') {
              navigate(`/event/${eventSlug}/carpool`);
            } else {
              navigate(`/event/${eventSlug}`);
            }
          }, 1500);
        },
        onError: (err: any) => {
          setError(err.response?.data?.error || err.message || 'Failed to save travel plan.');
          setLoading(false);
        },
      }
    );
  };

  if (loadingPlan) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground text-sm font-semibold">Retrieving travel plan profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-8">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <button 
          onClick={() => navigate(`/event/${eventSlug}`)}
          className="p-1.5 border border-border hover:bg-muted rounded-lg text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-black text-foreground">Submit Travel Plan</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Let others know how and when you are reaching the venue.</p>
        </div>
      </div>

      <div className="card p-5 bg-card border border-border rounded-3xl shadow-sm glass">
        {success && (
          <div className="text-xs text-secondary bg-secondary/10 border border-secondary/20 p-3 rounded-lg font-bold mb-4">
            {success} Redirecting...
          </div>
        )}
        {error && (
          <div className="text-xs text-destructive bg-destructive/10 p-3 rounded-lg font-bold mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                Origin City
              </label>
              <select
                value={originCity}
                onChange={(e) => setOriginCity(e.target.value)}
                className="w-full bg-background border border-border rounded-lg p-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {cities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                Locality / Pickup Area
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground"><MapPin className="w-3.5 h-3.5" /></span>
                <input
                  type="text"
                  value={originArea}
                  onChange={(e) => setOriginArea(e.target.value)}
                  placeholder="e.g. Kondapur, Whitefield"
                  className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/30"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
              Travel Mode
            </label>
            <select
              value={travelMode}
              onChange={(e) => setTravelMode(e.target.value)}
              className="w-full bg-background border border-border rounded-lg p-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {modes.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>

          {/* Conditional Departure & Arrival Fields (Only if not decided yet is NOT active) */}
          {travelMode !== 'not_decided' && (
            <>
              <div className="border-t border-border/60 pt-4 mt-4 space-y-4">
                <h3 className="text-xs font-bold text-foreground flex items-center space-x-1">
                  <Compass className="w-3.5 h-3.5 text-primary" />
                  <span>Outgoing Journey Details</span>
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                      Departure Date
                    </label>
                    <input
                      type="date"
                      value={departureDate}
                      onChange={(e) => setDepartureDate(e.target.value)}
                      className="w-full bg-background border border-border rounded-lg p-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                      Departure Time
                    </label>
                    <input
                      type="text"
                      value={departureTime}
                      onChange={(e) => setDepartureTime(e.target.value)}
                      placeholder="e.g. 06:00 AM"
                      className="w-full bg-background border border-border rounded-lg p-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                      Expected Arrival Date
                    </label>
                    <input
                      type="date"
                      value={expectedArrivalDate}
                      onChange={(e) => setExpectedArrivalDate(e.target.value)}
                      className="w-full bg-background border border-border rounded-lg p-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                      Expected Arrival Time
                    </label>
                    <input
                      type="text"
                      value={expectedArrivalTime}
                      onChange={(e) => setExpectedArrivalTime(e.target.value)}
                      placeholder="e.g. 09:00 AM"
                      className="w-full bg-background border border-border rounded-lg p-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-border/60 pt-4 mt-4 space-y-4">
                <h3 className="text-xs font-bold text-foreground flex items-center space-x-1">
                  <Compass className="w-3.5 h-3.5 text-primary rotate-180" />
                  <span>Return Journey Details</span>
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                      Return Date
                    </label>
                    <input
                      type="date"
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                      className="w-full bg-background border border-border rounded-lg p-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                      Return Time
                    </label>
                    <input
                      type="text"
                      value={returnTime}
                      onChange={(e) => setReturnTime(e.target.value)}
                      placeholder="e.g. 04:00 PM"
                      className="w-full bg-background border border-border rounded-lg p-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-border/60 pt-4 mt-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                    Number of Travellers
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground"><Users className="w-3.5 h-3.5" /></span>
                    <input
                      type="number"
                      min="1"
                      value={peopleCount}
                      onChange={(e) => setPeopleCount(parseInt(e.target.value) || 1)}
                      className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                    Luggage Count (bags)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground"><Briefcase className="w-3.5 h-3.5" /></span>
                    <input
                      type="number"
                      min="0"
                      value={luggageCount}
                      onChange={(e) => setLuggageCount(parseInt(e.target.value) || 0)}
                      className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
              Google Maps Location Link (Optional)
            </label>
            <input
              type="url"
              value={googleMapsLink}
              onChange={(e) => setGoogleMapsLink(e.target.value)}
              placeholder="e.g. https://maps.app.goo.gl/..."
              className="w-full bg-background border border-border rounded-lg p-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/30"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
              Travel Note / Preferences
            </label>
            <textarea
              value={travelNote}
              onChange={(e) => setTravelNote(e.target.value)}
              placeholder="Add any details like preferred boarding points, pickup directions, stops, etc."
              rows={3}
              className="w-full bg-background border border-border rounded-lg p-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/30"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-primary text-primary-foreground font-semibold rounded-lg text-sm shadow hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center space-x-2 mt-6"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Travel Plan</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export const TravelPage: React.FC = () => (
  <ProtectedRoute>
    <TravelPageContent />
  </ProtectedRoute>
);

export default TravelPage;
