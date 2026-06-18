import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useParticipants, useTravelPlans, useStatusUpdates } from '../services/hooks';
import type { TravelPlan } from '../services/hooks';
import { Search, Filter, MapPin, Car, MessageCircle, Mail, ShieldAlert, Compass, UserCheck, Clock } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

export const DirectoryPage: React.FC = () => {
  const { event } = useAuth();
  const [searchParams] = useSearchParams();

  // Queries
  const { data: participants = [], isLoading: pLoading } = useParticipants(event?.id || '');
  const { data: travelPlans = [], isLoading: tLoading } = useTravelPlans(event?.id || '');
  const { data: statusUpdates = [], isLoading: sLoading } = useStatusUpdates(event?.id || '');

  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCity, setFilterCity] = useState(searchParams.get('city') || 'all');
  const [filterMode, setFilterMode] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCarpool, setFilterCarpool] = useState('all'); // all, needs, offers
  const [showFilters, setShowFilters] = useState(false);

  // Sync city filter if query param changes
  useEffect(() => {
    const cityParam = searchParams.get('city');
    if (cityParam) {
      setFilterCity(cityParam);
    }
  }, [searchParams]);

  if (pLoading || tLoading || sLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-12">
        <LoaderComponent />
      </div>
    );
  }

  // Maps for quick lookup
  const travelPlansMap = new Map<string, TravelPlan>();
  travelPlans.forEach(tp => travelPlansMap.set(tp.participantId, tp));

  // Sort updates by date ascending, so last processed is latest status
  const latestStatusMap = new Map<string, string>();
  const latestStatusTime = new Map<string, string>();
  [...statusUpdates].sort((a, b) => {
    const d1 = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const d2 = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return d1 - d2;
  }).forEach(su => {
    latestStatusMap.set(su.participantId, su.status);
    if (su.createdAt) {
      latestStatusTime.set(su.participantId, new Date(su.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }
  });

  // Extract unique cities for filter dropdown
  const cities = Array.from(new Set(participants
    .map(p => p.currentCity)
    .filter((c): c is string => !!c && c.trim() !== '')
  ));

  // Travel modes list
  const modes = [
    { value: 'own_car', label: 'Own Car' },
    { value: 'need_carpool', label: 'Needs Carpool' },
    { value: 'train', label: 'Train' },
    { value: 'bus', label: 'Bus' },
    { value: 'flight', label: 'Flight' },
    { value: 'taxi', label: 'Taxi' },
    { value: 'not_decided', label: 'Not Decided' }
  ];

  // Filter logic
  const filteredParticipants = participants.filter(p => {
    const tp = travelPlansMap.get(p.id);
    const status = latestStatusMap.get(p.id) || (p.attendanceStatus === 'not_attending' ? 'not_coming' : 'registered');

    // 1. Search term check
    const nameToMatch = p.showName ? p.fullName.toLowerCase() : 'anonymous';
    const searchMatch = nameToMatch.includes(searchTerm.toLowerCase()) || 
      (p.batchOrGroup && p.batchOrGroup.toLowerCase().includes(searchTerm.toLowerCase()));

    // 2. City filter
    const cityMatch = filterCity === 'all' || p.currentCity === filterCity;

    // 3. Travel mode filter
    const modeMatch = filterMode === 'all' || (tp && tp.travelMode === filterMode);

    // 4. Status filter
    const statusMatch = filterStatus === 'all' || status === filterStatus;

    // 5. Carpool filter (needs vs offers)
    let carpoolMatch = true;
    if (filterCarpool === 'needs') {
      carpoolMatch = !!(tp && tp.travelMode === 'need_carpool');
    } else if (filterCarpool === 'offers') {
      carpoolMatch = !!(tp && tp.travelMode === 'own_car');
    }

    return searchMatch && cityMatch && modeMatch && statusMatch && carpoolMatch;
  });

  return (
    <div className="space-y-4 pb-8">
      {/* Page Title */}
      <div>
        <h1 className="text-xl font-black text-foreground">Participant Directory</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Filter cohort registrations, routes, and status logs.</p>
      </div>

      {/* Search Bar & Filter Toggle */}
      <div className="flex items-center space-x-3">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, batch..."
            className="w-full pl-10 pr-3 py-2 bg-card border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/50"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`p-2 border rounded-xl transition-all ${
            showFilters || filterCity !== 'all' || filterMode !== 'all' || filterStatus !== 'all' || filterCarpool !== 'all'
              ? 'bg-primary/10 border-primary/30 text-primary'
              : 'bg-card border-border text-muted-foreground hover:text-foreground'
          }`}
          title="Filter results"
        >
          <Filter className="w-5 h-5" />
        </button>
      </div>

      {/* Expandable Filter Grid */}
      {showFilters && (
        <div className="p-4 bg-card border border-border rounded-2xl shadow-sm grid grid-cols-2 gap-3 animate-pulse-slow">
          <div>
            <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">City</label>
            <select
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
              className="w-full bg-background border border-border rounded-lg p-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">All Cities</option>
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Travel Mode</label>
            <select
              value={filterMode}
              onChange={(e) => setFilterMode(e.target.value)}
              className="w-full bg-background border border-border rounded-lg p-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">All Modes</option>
              {modes.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-background border border-border rounded-lg p-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">All Statuses</option>
              <option value="registered">Registered</option>
              <option value="travel_plan_submitted">Travel Plan Ok</option>
              <option value="en_route">En Route</option>
              <option value="reached_venue">Reached</option>
              <option value="left_venue">Left Venue</option>
              <option value="not_coming">Not Coming</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Carpooling</label>
            <select
              value={filterCarpool}
              onChange={(e) => setFilterCarpool(e.target.value)}
              className="w-full bg-background border border-border rounded-lg p-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">All Carpools</option>
              <option value="needs">Needs Carpool</option>
              <option value="offers">Offers Seat (Driver)</option>
            </select>
          </div>
        </div>
      )}

      {/* Directory Listings */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredParticipants.length > 0 ? (
          filteredParticipants.map(p => {
            const tp = travelPlansMap.get(p.id);
            const status = latestStatusMap.get(p.id) || (p.attendanceStatus === 'not_attending' ? 'not_coming' : 'registered');
            const statusTime = latestStatusTime.get(p.id);

            return (
              <div key={p.id} className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between interactive-card">
                
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3.5 mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary/10 to-indigo-500/10 text-primary border border-primary/20 rounded-full flex items-center justify-center font-black text-xs uppercase shrink-0">
                      {(p.showName ? p.fullName : "Anonymous").charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground flex items-center space-x-1.5 flex-wrap gap-y-1">
                        <span>{p.showName ? p.fullName : "Anonymous"}</span>
                        {p.attendanceStatus === 'not_attending' && (
                          <span className="px-1.5 py-0.5 bg-rose-500/10 text-rose-500 rounded text-[9px] font-bold">Not Coming</span>
                        )}
                      </h3>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {p.currentCity} {p.batchOrGroup ? `• ${p.batchOrGroup}` : ''}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex flex-col items-end shrink-0">
                    <StatusBadge status={status} />
                    {statusTime && (
                      <span className="text-[9px] text-muted-foreground mt-1">Logged {statusTime}</span>
                    )}
                  </div>
                </div>

                {/* Travel Info Section (respects showTravelDetails) */}
                {p.showTravelDetails && tp ? (
                  <div className="mt-1 bg-muted/30 border border-border/40 p-3 rounded-xl text-xs space-y-1.5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span className="flex items-center space-x-1">
                          <Car className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span className="font-bold text-foreground capitalize">{tp.travelMode.replace('_', ' ')}</span>
                        </span>
                        {tp.departureDate && (
                          <span className="text-[10px]">Dep: {tp.departureDate}</span>
                        )}
                      </div>
                      {tp.originArea && (
                        <p className="text-muted-foreground text-[11px] flex items-center space-x-1 mt-1.5">
                          <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
                          <span>Pickup: {tp.originArea}</span>
                        </p>
                      )}
                    </div>
                    {tp.travelNote && (
                      <p className="text-[11px] italic text-muted-foreground/80 mt-2 border-t border-border/20 pt-1.5">
                        &ldquo;{tp.travelNote}&rdquo;
                      </p>
                    )}
                  </div>
                ) : (
                  tp && (
                    <div className="mt-1 p-3 bg-muted/10 border border-dashed border-border rounded-xl text-center text-[10px] text-muted-foreground font-semibold flex-1 flex items-center justify-center min-h-[80px]">
                      Travel details are hidden by participant.
                    </div>
                  )
                )}

                {/* Contact Row */}
                <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-muted-foreground">
                    {!tp ? "No travel details submitted." : ""}
                  </span>

                  <div className="flex space-x-2 shrink-0">
                    {p.allowContact && p.showPhone && p.mobileNumber !== '[Hidden]' ? (
                      <a
                        href={`https://wa.me/${p.mobileNumber.replace('+', '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 rounded-lg font-bold text-[11px] hover:shadow-sm active:scale-95 transition-all flex items-center space-x-1"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Chat WhatsApp</span>
                      </a>
                    ) : (
                      <span className="px-3 py-1.5 bg-muted text-muted-foreground/40 rounded-lg text-[11px] cursor-not-allowed flex items-center space-x-1">
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Chat Restricted</span>
                      </span>
                    )}

                    {p.showEmail && p.email && p.email !== '[Hidden]' && (
                      <a
                        href={`mailto:${p.email}`}
                        className="p-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg hover:shadow-sm active:scale-95 transition-all"
                        title="Send Mail"
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>

              </div>
            );
          })
        ) : (
          <div className="p-8 text-center bg-card border border-border rounded-2xl shadow-sm col-span-full">
            <ShieldAlert className="w-8 h-8 text-muted-foreground/60 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-foreground">No matches found</h4>
            <p className="text-xs text-muted-foreground mt-0.5">Try clearing search terms or filter configurations.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Sub-components for badges & loaders
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const s = status.toLowerCase();
  switch (s) {
    case 'reached_venue':
      return (
        <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-full text-[10px] font-extrabold uppercase flex items-center space-x-1 shadow-sm">
          <UserCheck className="w-3 h-3 shrink-0 text-emerald-500" />
          <span>Reached</span>
        </span>
      );
    case 'en_route':
      return (
        <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-600 border border-amber-500/20 rounded-full text-[10px] font-extrabold uppercase flex items-center space-x-1 animate-glow shadow-sm">
          <Compass className="w-3 h-3 shrink-0 text-amber-500" />
          <span>En Route</span>
        </span>
      );
    case 'travel_plan_submitted':
      return (
        <span className="px-2.5 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-full text-[10px] font-extrabold uppercase shadow-sm">
          Plan OK
        </span>
      );
    case 'not_coming':
      return (
        <span className="px-2.5 py-0.5 bg-rose-500/10 text-rose-600 border border-rose-500/20 rounded-full text-[10px] font-extrabold uppercase shadow-sm">
          Not Coming
        </span>
      );
    case 'left_venue':
      return (
        <span className="px-2.5 py-0.5 bg-slate-500/10 text-slate-600 border border-slate-500/20 rounded-full text-[10px] font-extrabold uppercase shadow-sm">
          Left Venue
        </span>
      );
    default:
      return (
        <span className="px-2.5 py-0.5 bg-muted text-muted-foreground border border-border rounded-full text-[10px] font-extrabold uppercase shadow-sm">
          Registered
        </span>
      );
  }
};

const LoaderComponent: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-12">
    <Clock className="w-8 h-8 animate-spin text-primary" />
    <p className="mt-3 text-xs text-muted-foreground font-semibold">Loading participant directory...</p>
  </div>
);

export default DirectoryPage;
