import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  useParticipants, 
  useTravelPlans, 
  useCarpoolGroups, 
  useStatusUpdates, 
  useSaveStatusUpdate 
} from '../services/hooks';
import ProtectedRoute from '../components/ProtectedRoute';
import { 
  Map as MapIcon, 
  Compass, 
  Car, 
  Clock, 
  Activity, 
  MapPin, 
  Plane, 
  FileText, 
  Loader2, 
  TrendingUp,
  UserCheck
} from 'lucide-react';

export const TrackerMapPageContent: React.FC = () => {
  const { event, currentUser, eventSlug } = useAuth();
  const navigate = useNavigate();

  // Tab State
  const [activeTab, setActiveTab] = useState<'map' | 'tracker'>('map');

  // Queries
  const { data: participants = [], isLoading: loadingP } = useParticipants(event?.id || '');
  const { data: travelPlans = [], isLoading: loadingT } = useTravelPlans(event?.id || '');
  const { data: carpools = [], isLoading: loadingC } = useCarpoolGroups(event?.id || '');
  const { data: statusUpdates = [], isLoading: loadingS, refetch: refetchStatus } = useStatusUpdates(event?.id || '');

  // Mutation
  const saveStatusMutation = useSaveStatusUpdate();

  // Status Form state
  const [newStatus, setNewStatus] = useState('en_route');
  const [statusNote, setStatusNote] = useState('');
  const [targetParticipantId, setTargetParticipantId] = useState(currentUser?.id || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Map Filter State
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);

  // Helper arrays & maps
  const travelPlansMap = React.useMemo(() => {
    const m = new Map<string, any>();
    travelPlans.forEach(tp => m.set(tp.participantId, tp));
    return m;
  }, [travelPlans]);

  const latestStatusMap = React.useMemo(() => {
    const m = new Map<string, string>();
    const timeMap = new Map<string, string>();
    const noteMap = new Map<string, string>();
    
    [...statusUpdates].sort((a, b) => {
      const d1 = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const d2 = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return d1 - d2; // Ascending order so last update processed is latest
    }).forEach(su => {
      m.set(su.participantId, su.status);
      if (su.createdAt) {
        timeMap.set(su.participantId, new Date(su.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
      noteMap.set(su.participantId, su.note);
    });
    return { status: m, time: timeMap, notes: noteMap };
  }, [statusUpdates]);

  const uniqueCities = React.useMemo(() => {
    const set = new Set<string>();
    participants.forEach(p => {
      if (p.currentCity) set.add(p.currentCity);
    });
    return Array.from(set);
  }, [participants]);

  // Calculate Auto Tracking Progress
  const trackingData = React.useMemo(() => {
    const now = new Date().getTime();
    
    return participants.map(p => {
      const tp = travelPlansMap.get(p.id);
      const status = latestStatusMap.status.get(p.id) || (p.attendanceStatus === 'not_attending' ? 'not_coming' : 'registered');
      const lastUpdateTime = latestStatusMap.time.get(p.id);
      const lastNote = latestStatusMap.notes.get(p.id);
      
      let progress = 0;
      let progressText = 'Scheduled';
      let elapsedText = '';
      
      if (status === 'reached_venue') {
        progress = 100;
        progressText = 'Reached Venue';
      } else if (status === 'left_venue') {
        progress = 100;
        progressText = 'Left Venue (Heading Home)';
      } else if (status === 'not_coming') {
        progress = 0;
        progressText = 'Cancelled';
      } else if (tp) {
        // Parse dates
        const departureDateStr = tp.departureDate || '2026-07-11';
        const departureTimeStr = tp.departureTime || '06:00 AM';
        const arrivalDateStr = tp.expectedArrivalDate || '2026-07-11';
        const arrivalTimeStr = tp.expectedArrivalTime || '09:00 AM';
        
        try {
          // Helper to combine date and time string
          const parseDateTime = (dStr: string, tStr: string) => {
            // Check if 12h clock
            const ampm = tStr.toUpperCase().includes('PM') ? 'PM' : 'AM';
            let [time, meridiem] = tStr.split(/\s+/);
            if (!meridiem) meridiem = ampm;
            let [hours, minutes] = (time || '00:00').split(':');
            let h = parseInt(hours) || 0;
            const m = parseInt(minutes) || 0;
            if (meridiem.toUpperCase() === 'PM' && h < 12) h += 12;
            if (meridiem.toUpperCase() === 'AM' && h === 12) h = 0;
            
            const [year, month, day] = dStr.split('-');
            return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), h, m).getTime();
          };
          
          const depTime = parseDateTime(departureDateStr, departureTimeStr);
          const arrTime = parseDateTime(arrivalDateStr, arrivalTimeStr);
          
          const totalDuration = arrTime - depTime;
          
          if (now < depTime) {
            progress = 0;
            progressText = 'Departing soon';
          } else if (now >= arrTime) {
            progress = 95;
            progressText = 'Arrival overdue (Pending verification)';
          } else if (totalDuration > 0) {
            const elapsed = now - depTime;
            progress = Math.round((elapsed / totalDuration) * 100);
            if (progress > 95) progress = 95; // cap at 95% until verified as reached
            if (progress < 0) progress = 0;
            
            progressText = `En Route (${progress}%)`;
            const hoursLeft = Math.ceil((arrTime - now) / (1000 * 60 * 60));
            const minsLeft = Math.ceil(((arrTime - now) % (1000 * 60 * 60)) / (1000 * 60));
            elapsedText = hoursLeft > 1 ? `${hoursLeft} hrs remaining` : `${minsLeft} mins remaining`;
          }
        } catch (e) {
          progress = 0;
          progressText = 'Transit Pending';
        }
      }
      
      return {
        participant: p,
        travelPlan: tp,
        status,
        progress,
        progressText,
        elapsedText,
        lastUpdateTime,
        lastNote
      };
    });
  }, [participants, travelPlansMap, latestStatusMap]);

  // Handle status update logging
  const handleStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    const targetUser = participants.find(p => p.id === targetParticipantId);
    if (!targetUser) {
      setError('Please select a valid participant.');
      setSubmitting(false);
      return;
    }

    saveStatusMutation.mutate(
      {
        eventId: event!.id,
        participantId: targetParticipantId,
        status: newStatus,
        markedBy: currentUser?.fullName || 'System',
        note: statusNote.trim() || `Status updated to ${newStatus.replace('_', ' ')}`
      },
      {
        onSuccess: () => {
          setSuccess(`Logged transit status for ${targetUser.fullName}`);
          setStatusNote('');
          setSubmitting(false);
          refetchStatus();
          setTimeout(() => setSuccess(''), 2500);
        },
        onError: (err: any) => {
          setError(err.response?.data?.error || err.message || 'Failed to update status.');
          setSubmitting(false);
        }
      }
    );
  };

  if (loadingP || loadingT || loadingC || loadingS) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="mt-4 text-xs text-muted-foreground font-semibold">Generating interactive maps & tracker logs...</p>
      </div>
    );
  }

  // Pre-configured schematic SVG layout routes based on event venue and participants
  const defaultVenue = event?.venueName || "Venue Hall";
  const routesData = [
    { id: 'route-north', name: 'Northern ORR Highway Route', city: 'Hyderabad', color: '#f97316', path: 'M 100 120 L 250 150 L 400 200' },
    { id: 'route-west', name: 'Western Gachibowli Corridor', city: 'Hyderabad', color: '#38bdf8', path: 'M 120 280 L 260 240 L 400 200' },
    { id: 'route-airport', name: 'Airport Express Metro route', city: 'Hyderabad', color: '#64748b', path: 'M 220 360 L 320 280 L 400 200' },
    { id: 'route-intercity', name: 'Bangalore-Chennai National Highway', city: 'Bangalore', color: '#10b981', path: 'M 50 380 L 200 320 L 400 200' }
  ];

  const mapMarkers = [
    { name: 'Kondapur Pick-up Point', routeId: 'route-north', city: 'Hyderabad', cx: 100, cy: 120, count: 6 },
    { name: 'Gachibowli Carpool Hub', routeId: 'route-west', cx: 120, cy: 280, city: 'Hyderabad', count: 12 },
    { name: 'Airport Terminal 1 Pick-up', routeId: 'route-airport', cx: 220, cy: 360, city: 'Hyderabad', count: 4 },
    { name: 'National highway checkpoint', routeId: 'route-intercity', cx: 50, cy: 380, city: 'Bangalore', count: 5 },
    { name: defaultVenue, routeId: 'venue', cx: 400, cy: 200, city: 'All', count: participants.length }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-foreground tracking-tight">Route Map & Auto Tracking Tracker</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Visualize pickup coordinates, route lanes, and live transit logs.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border text-xs font-bold bg-white p-1 rounded-2xl border">
        <button
          onClick={() => setActiveTab('map')}
          className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center space-x-1.5 ${
            activeTab === 'map' ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <MapIcon className="w-4 h-4" />
          <span>Interactive Route Map</span>
        </button>
        <button
          onClick={() => setActiveTab('tracker')}
          className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center space-x-1.5 ${
            activeTab === 'tracker' ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Auto-Tracking Tracker</span>
        </button>
      </div>

      {activeTab === 'map' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Map display col */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white border border-border rounded-3xl p-5 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-foreground flex items-center space-x-2">
                  <Compass className="w-4.5 h-4.5 text-primary" />
                  <span>Interactive Route Planner Map</span>
                </h3>
                <div className="flex items-center space-x-2">
                  <select
                    value={selectedCity}
                    onChange={(e) => {
                      setSelectedCity(e.target.value);
                      setSelectedRoute(null);
                    }}
                    className="bg-slate-50 border border-border rounded-lg px-2.5 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="All">All Origin Cities</option>
                    {uniqueCities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Schematic SVG Map */}
              <div className="w-full bg-slate-50 border border-border/80 rounded-2xl flex items-center justify-center p-2 relative overflow-hidden" style={{ minHeight: '380px' }}>
                <svg viewBox="0 0 500 400" className="w-full max-w-[500px] h-auto drop-shadow-sm">
                  {/* Grid Lines */}
                  <defs>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(226, 232, 240, 0.4)" strokeWidth="1" />
                    </pattern>
                  </defs>
                  <rect width="500" height="400" fill="url(#grid)" rx="16" />

                  {/* Routes drawing */}
                  {routesData
                    .filter(r => selectedCity === 'All' || r.city === selectedCity)
                    .map(r => {
                      const isHighlighted = selectedRoute === r.id;
                      return (
                        <path
                          key={r.id}
                          d={r.path}
                          fill="none"
                          stroke={isHighlighted ? '#f97316' : '#94a3b8'}
                          strokeWidth={isHighlighted ? 4 : 2}
                          className="transition-all duration-300 cursor-pointer"
                          onClick={() => setSelectedRoute(selectedRoute === r.id ? null : r.id)}
                          opacity={selectedRoute && !isHighlighted ? 0.35 : 0.8}
                        />
                      );
                    })}

                  {/* Markers placement */}
                  {mapMarkers
                    .filter(m => selectedCity === 'All' || m.city === selectedCity || m.city === 'All')
                    .map((m, idx) => {
                      const isVenue = m.cx === 400 && m.cy === 200;
                      const isHighlighted = selectedRoute === m.routeId;
                      const isSelectedNode = selectedRoute && isHighlighted;
                      
                      return (
                        <g 
                          key={idx} 
                          transform={`translate(${m.cx}, ${m.cy})`}
                          className="cursor-pointer group"
                          onClick={() => m.routeId !== 'venue' && setSelectedRoute(selectedRoute === m.routeId ? null : m.routeId)}
                          opacity={selectedRoute && m.routeId !== 'venue' && !isHighlighted ? 0.4 : 1}
                        >
                          {/* Inner pulse */}
                          <circle 
                            r={isVenue ? 15 : 10} 
                            fill={isVenue ? '#f97316' : isSelectedNode ? '#38bdf8' : '#64748b'} 
                            className={`${(isVenue || isSelectedNode) ? 'animate-ping' : ''}`}
                            opacity="0.25"
                          />
                          {/* Circle marker */}
                          <circle 
                            r={isVenue ? 10 : 7} 
                            fill={isVenue ? '#f97316' : isSelectedNode ? '#38bdf8' : '#94a3b8'} 
                            stroke="#ffffff" 
                            strokeWidth="2" 
                          />
                          {/* Label tooltip */}
                          <text 
                            y="-14" 
                            textAnchor="middle" 
                            className="text-[10px] font-bold fill-slate-700 bg-white"
                          >
                            {m.name.split(' ')[0]}
                          </text>
                        </g>
                      );
                    })}
                </svg>

                {/* Legend Overlay */}
                <div className="absolute bottom-3 left-3 bg-white/95 border border-border p-3 rounded-xl text-[10px] space-y-1.5 shadow-sm">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary block"></span>
                    <span className="font-bold text-foreground">Venue: {defaultVenue}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-secondary block"></span>
                    <span className="text-muted-foreground">Highlighted Route Lane</span>
                  </div>
                  <div className="text-[9px] text-muted-foreground border-t border-border pt-1">
                    Click points/lines to view route details.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Details sidebar col */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white border border-border rounded-3xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-foreground flex items-center space-x-2 mb-3">
                <MapPin className="w-4.5 h-4.5 text-primary" />
                <span>Selected Pickup Destination</span>
              </h3>

              {selectedRoute ? (
                (() => {
                  const route = routesData.find(r => r.id === selectedRoute);
                  const marker = mapMarkers.find(m => m.routeId === selectedRoute);
                  const activeCarpools = carpools.filter(cg => cg.originArea.toLowerCase().includes(marker?.name.split(' ')[0].toLowerCase() || ''));
                  
                  return (
                    <div className="space-y-4 text-xs">
                      <div className="bg-slate-50 border border-border rounded-xl p-3">
                        <p className="font-bold text-foreground">{marker?.name}</p>
                        <p className="text-muted-foreground mt-0.5">{route?.name}</p>
                        <span className="inline-block mt-2 px-2.5 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-md font-bold text-[9px] uppercase tracking-wide">
                          City: {marker?.city}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <p className="font-bold text-foreground text-[10px] uppercase tracking-wider text-muted-foreground/80">Active Carpool Vehicles</p>
                        {activeCarpools.length > 0 ? (
                          activeCarpools.map(ac => (
                            <div key={ac.id} className="border border-border rounded-xl p-2.5 flex items-center justify-between hover:border-primary/30 transition-all">
                              <div>
                                <p className="font-bold text-foreground">{ac.title}</p>
                                <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center">
                                  <Car className="w-3 h-3 mr-0.5 text-primary" />
                                  <span>{ac.vehicleType}</span>
                                  <span className="mx-1">•</span>
                                  <span>Driver: {ac.driverName}</span>
                                </p>
                              </div>
                              <button 
                                onClick={() => navigate(`/event/${eventSlug}/carpool`)}
                                className="px-2 py-1 bg-secondary/10 hover:bg-secondary/20 text-secondary font-bold text-[10px] rounded-lg transition-colors"
                              >
                                Join
                              </button>
                            </div>
                          ))
                        ) : (
                          <p className="text-muted-foreground italic text-center py-3">No active carpools at this point yet.</p>
                        )}
                      </div>

                      <button
                        onClick={() => setSelectedRoute(null)}
                        className="w-full py-2 border border-border hover:bg-slate-50 text-[11px] font-bold rounded-xl text-foreground transition-all"
                      >
                        Reset Map Selection
                      </button>
                    </div>
                  );
                })()
              ) : (
                <div className="text-center py-8 text-xs text-muted-foreground space-y-2">
                  <Compass className="w-8 h-8 mx-auto text-muted-foreground/50 animate-pulse" />
                  <p className="font-bold">No pickup node selected.</p>
                  <p className="max-w-[200px] mx-auto leading-normal">Select a route or hub marker on the map to inspect pickup configurations.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-pulse-slow">
          {/* Tracking lists & dashboard metrics */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Auto Tracking Metrics splits */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white border border-border p-4 rounded-2xl flex flex-col justify-between">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total En Route</span>
                <div className="flex items-center space-x-2 mt-2">
                  <Clock className="w-5 h-5 text-primary animate-pulse" />
                  <h4 className="text-2xl font-black text-foreground">
                    {trackingData.filter(t => t.status === 'en_route').length}
                  </h4>
                </div>
              </div>

              <div className="bg-white border border-border p-4 rounded-2xl flex flex-col justify-between">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Reached</span>
                <div className="flex items-center space-x-2 mt-2">
                  <UserCheck className="w-5 h-5 text-secondary" />
                  <h4 className="text-2xl font-black text-foreground">
                    {trackingData.filter(t => t.status === 'reached_venue').length}
                  </h4>
                </div>
              </div>

              <div className="bg-white border border-border p-4 rounded-2xl flex flex-col justify-between">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">By Carpools</span>
                <div className="flex items-center space-x-2 mt-2">
                  <Car className="w-5 h-5 text-primary" />
                  <h4 className="text-2xl font-black text-foreground">
                    {trackingData.filter(t => t.travelPlan?.travelMode === 'need_carpool' || t.travelPlan?.travelMode === 'own_car').length}
                  </h4>
                </div>
              </div>

              <div className="bg-white border border-border p-4 rounded-2xl flex flex-col justify-between">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">By Flights/Trains</span>
                <div className="flex items-center space-x-2 mt-2">
                  <Plane className="w-5 h-5 text-secondary" />
                  <h4 className="text-2xl font-black text-foreground">
                    {trackingData.filter(t => t.travelPlan?.travelMode === 'flight' || t.travelPlan?.travelMode === 'train').length}
                  </h4>
                </div>
              </div>
            </div>

            {/* Live progress table */}
            <div className="bg-white border border-border rounded-3xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-foreground flex items-center space-x-2 mb-4">
                <TrendingUp className="w-4.5 h-4.5 text-primary" />
                <span>Auto-Calculated Real-Time Transit Progress</span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs divide-y divide-border">
                  <thead>
                    <tr className="text-muted-foreground font-bold uppercase text-[9px] tracking-wider">
                      <th className="pb-3">Participant</th>
                      <th className="pb-3">Origin / Mode</th>
                      <th className="pb-3">Timeframes</th>
                      <th className="pb-3">Live Progress</th>
                      <th className="pb-3 text-right">Stage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {trackingData.map(({ participant, travelPlan, status, progress, progressText, elapsedText }) => (
                      <tr key={participant.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 font-bold text-foreground">{participant.fullName}</td>
                        <td className="py-3.5 text-muted-foreground">
                          {participant.currentCity}
                          {travelPlan && (
                            <span className="block text-[10px] font-medium capitalize text-slate-400">
                              {travelPlan.travelMode.replace('_', ' ')}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 text-[11px]">
                          {travelPlan ? (
                            <>
                              <p className="font-semibold text-foreground">{travelPlan.departureTime}</p>
                              <p className="text-[10px] text-muted-foreground">ETA: {travelPlan.expectedArrivalTime}</p>
                            </>
                          ) : (
                            <span className="text-slate-400 italic">No schedules</span>
                          )}
                        </td>
                        <td className="py-3.5 w-1/3">
                          {travelPlan && status === 'en_route' ? (
                            <div className="space-y-1 pr-4">
                              <div className="flex justify-between text-[10px] font-bold text-slate-500">
                                <span>{progress}%</span>
                                <span>{elapsedText}</span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-primary transition-all duration-1000" 
                                  style={{ width: `${progress}%` }}
                                ></div>
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-400 font-semibold">{progressText}</span>
                          )}
                        </td>
                        <td className="py-3.5 text-right">
                          <span className={`px-2.5 py-0.5 rounded-full border text-[9px] font-bold uppercase shadow-sm ${
                            status === 'reached_venue' 
                              ? 'bg-secondary/10 text-secondary border-secondary/20' 
                              : status === 'en_route'
                              ? 'bg-primary/10 text-primary border-primary/20 animate-pulse'
                              : 'bg-slate-100 text-muted-foreground border-border'
                          }`}>
                            {status.replace('_', ' ')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Quick logger sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-border rounded-3xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-foreground flex items-center space-x-2 mb-3">
                <Clock className="w-4.5 h-4.5 text-primary" />
                <span>Transit Status Logger</span>
              </h3>

              {success && (
                <div className="text-xs text-secondary bg-secondary/10 border border-secondary/20 p-2.5 rounded-xl font-bold mb-3">
                  {success}
                </div>
              )}
              {error && (
                <div className="text-xs text-destructive bg-destructive/10 p-2.5 rounded-xl font-bold mb-3">
                  {error}
                </div>
              )}

              <form onSubmit={handleStatusSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Select Participant</label>
                  <select
                    value={targetParticipantId}
                    onChange={(e) => setTargetParticipantId(e.target.value)}
                    className="w-full bg-slate-50 border border-border rounded-lg p-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {participants.map(p => (
                      <option key={p.id} value={p.id}>{p.fullName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Status Action</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full bg-slate-50 border border-border rounded-lg p-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="en_route">En Route (Driving / Flying / Transit)</option>
                    <option value="reached_venue">Reached Venue (Verified arrival)</option>
                    <option value="left_venue">Left Venue (Heading Home)</option>
                    <option value="not_coming">Not Attending</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Tracking Note / Audit Log</label>
                  <input
                    type="text"
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    placeholder="e.g. Boarded cab, Checked in at desk"
                    className="w-full bg-slate-50 border border-border rounded-lg p-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/45"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 bg-primary text-white font-bold rounded-xl text-xs hover:bg-primary/95 transition-all flex items-center justify-center space-x-1.5 shadow active:scale-[0.98]"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Post Audit Log</span>}
                </button>
              </form>
            </div>

            {/* Live Audit Log */}
            <div className="bg-white border border-border rounded-3xl p-5 shadow-sm">
              <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-3 flex items-center space-x-2">
                <FileText className="w-4 h-4 text-primary" />
                <span>Verification Audit Trail</span>
              </h3>

              <div className="space-y-3.5 max-h-52 overflow-y-auto pr-1 no-scrollbar divide-y divide-border/60">
                {statusUpdates.length > 0 ? (
                  [...statusUpdates].reverse().map((su, idx) => {
                    const person = participants.find(p => p.id === su.participantId);
                    return (
                      <div key={su.id || idx} className="pt-2 first:pt-0 text-xs">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-foreground">{person?.fullName || "Participant"}</p>
                          <span className="text-[9px] text-muted-foreground">
                            {su.createdAt ? new Date(su.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          Logged: <span className="font-semibold capitalize text-foreground/80">{su.status.replace('_', ' ')}</span> by {su.markedBy}
                        </p>
                        <p className="text-[10px] text-slate-500 italic mt-1 bg-slate-50 p-1.5 rounded-lg border border-border/40">&ldquo;{su.note}&rdquo;</p>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-[10px] text-muted-foreground italic text-center py-4">No audit updates logged.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const TrackerMapPage: React.FC = () => (
  <ProtectedRoute>
    <TrackerMapPageContent />
  </ProtectedRoute>
);

export default TrackerMapPage;
