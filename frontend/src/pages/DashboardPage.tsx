import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useDashboard } from '../services/hooks';
import { Users, CheckCircle, MapPin, Compass, Clock, ShieldAlert, ArrowRight, UserCheck, MessageCircle, Mail, FileSpreadsheet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { event, eventSlug, currentUser, isLoggedIn } = useAuth();
  const { data: metrics, isLoading, error } = useDashboard(event?.id || '');
  const navigate = useNavigate();

  const isOrganizer = isLoggedIn && currentUser && event && currentUser.id === event.createdBy;

  React.useEffect(() => {
    if (!isLoading) {
      if (!isLoggedIn) {
        navigate(`/event/${eventSlug}/join`);
      } else if (!isOrganizer) {
        navigate(`/event/${eventSlug}`);
      }
    }
  }, [isLoggedIn, isOrganizer, isLoading, eventSlug, navigate]);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-12 bg-background">
        <Clock className="w-8 h-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground font-medium text-sm">Computing dashboard aggregations...</p>
      </div>
    );
  }

  if (!isLoggedIn || !isOrganizer || !metrics) {
    return null;
  }
  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
        <ShieldAlert className="w-12 h-12 text-destructive mb-3" />
        <h3 className="text-lg font-bold text-foreground">Failed to Load Dashboard</h3>
        <p className="text-sm text-muted-foreground max-w-sm mt-1">
          {error?.message || 'Could not fetch dashboard metrics. Please reload.'}
        </p>
      </div>
    );
  }

  const { attendanceSummary, citySummary, travelModeSummary, arrivalTimeline, pendingResponses } = metrics;

  const handleCityClick = (city: string) => {
    // Navigate to participants page with city filter query param
    navigate(`/event/${eventSlug}/participants?city=${encodeURIComponent(city)}`);
  };

  const getPercentage = (count: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((count / total) * 100);
  };

  const travelModesLabels: Record<string, string> = {
    own_car: "Own Car",
    need_carpool: "Needs Carpool",
    train: "Train",
    bus: "Bus",
    flight: "Flight",
    taxi: "Taxi / Cab",
    not_decided: "Not Decided"
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">Community Travel Dashboard</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Real-time status updates and arrival logs for 56 attendees.</p>
        </div>
        <button
          onClick={() => navigate(`/event/${eventSlug}/export`)}
          className="px-4 py-2 border border-border bg-card hover:bg-muted hover:border-muted-foreground/30 text-xs font-bold rounded-xl text-foreground flex items-center justify-center space-x-1.5 shrink-0 transition-all duration-200 shadow-sm active:scale-95"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Export Center</span>
        </button>
      </div>

      {/* 2. Metric Summary Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:border-primary/40 relative overflow-hidden flex flex-col justify-between group">
          <div className="absolute right-0 bottom-0 w-16 h-16 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-colors"></div>
          <div className="flex items-center justify-between text-muted-foreground mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Total Cohort</span>
            <Users className="w-4.5 h-4.5 text-primary shrink-0 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <h3 className="text-3xl font-extrabold text-foreground tracking-tight">{attendanceSummary.totalRegistered}</h3>
            <p className="text-[10px] text-muted-foreground mt-1">Registered members</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:border-emerald-500/40 relative overflow-hidden flex flex-col justify-between group">
          <div className="absolute right-0 bottom-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-colors"></div>
          <div className="flex items-center justify-between text-muted-foreground mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Confirmed</span>
            <CheckCircle className="w-4.5 h-4.5 text-emerald-500 shrink-0 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <h3 className="text-3xl font-extrabold text-foreground tracking-tight">{attendanceSummary.confirmed}</h3>
            <p className="text-[10px] text-muted-foreground mt-1">Ready to travel</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:border-amber-500/40 relative overflow-hidden flex flex-col justify-between group">
          <div className="absolute right-0 bottom-0 w-16 h-16 bg-amber-500/5 rounded-full blur-xl group-hover:bg-amber-500/10 transition-colors"></div>
          <div className="flex items-center justify-between text-muted-foreground mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">En Route</span>
            <Compass className="w-4.5 h-4.5 text-amber-500 shrink-0 animate-pulse-slow group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <h3 className="text-3xl font-extrabold text-foreground tracking-tight">{attendanceSummary.enRoute}</h3>
            <p className="text-[10px] text-muted-foreground mt-1">Currently travelling</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:border-teal-500/40 relative overflow-hidden flex flex-col justify-between group">
          <div className="absolute right-0 bottom-0 w-16 h-16 bg-teal-500/5 rounded-full blur-xl group-hover:bg-teal-500/10 transition-colors"></div>
          <div className="flex items-center justify-between text-muted-foreground mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Reached</span>
            <UserCheck className="w-4.5 h-4.5 text-teal-600 shrink-0 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <h3 className="text-3xl font-extrabold text-foreground tracking-tight">{attendanceSummary.reachedVenue}</h3>
            <p className="text-[10px] text-muted-foreground mt-1">At retreat center</p>
          </div>
        </div>
      </div>

      {/* Split Layout Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:items-start">
        
        {/* Left column (8 cols): Cities, travel modes breakup, timeline */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* City Summary Card */}
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm transition-all duration-300 hover:shadow-md">
              <h2 className="text-sm font-bold text-foreground flex items-center space-x-2 mb-4">
                <span className="w-1 h-3.5 bg-primary rounded-full"></span>
                <MapPin className="w-4 h-4 text-primary" />
                <span>Origin Cities Summary</span>
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(citySummary).length > 0 ? (
                  Object.entries(citySummary).map(([city, count]) => (
                    <button
                      key={city}
                      onClick={() => handleCityClick(city)}
                      className="flex items-center justify-between p-3 border border-border hover:border-primary/45 hover:bg-primary/5 rounded-xl transition-all duration-200 text-left active:scale-[0.98]"
                    >
                      <span className="text-xs font-bold text-foreground">{city}</span>
                      <span className="px-2.5 py-0.5 bg-primary/10 text-primary font-extrabold rounded-md text-xs">
                        {count}
                      </span>
                    </button>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground col-span-2 py-4 text-center">No city details registered yet.</p>
                )}
              </div>
            </div>

            {/* Travel Mode Summary Card */}
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-3 transition-all duration-300 hover:shadow-md">
              <h2 className="text-sm font-bold text-foreground flex items-center space-x-2">
                <span className="w-1 h-3.5 bg-primary rounded-full"></span>
                <Compass className="w-4 h-4 text-primary" />
                <span>Travel Mode Breakup</span>
              </h2>

              <div className="space-y-3 pt-2">
                {Object.entries(travelModesLabels).map(([mode, label]) => {
                  const count = travelModeSummary[mode] || 0;
                  const totalTravel = Object.values(travelModeSummary).reduce((a, b) => a + b, 0) || 1;
                  const percent = getPercentage(count, totalTravel);
                  
                  if (count === 0) return null; // Only show modes in use

                  return (
                    <div key={mode} className="text-xs">
                      <div className="flex items-center justify-between font-semibold mb-1 text-muted-foreground">
                        <span className="text-foreground">{label}</span>
                        <span>{count} ({percent}%)</span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all duration-500" 
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
                {Object.values(travelModeSummary).reduce((a, b) => a + b, 0) === 0 && (
                  <p className="text-xs text-muted-foreground py-4 text-center">No travel modes submitted yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* Arrival Timeline Group Card */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm transition-all duration-300 hover:shadow-md">
            <h2 className="text-sm font-bold text-foreground flex items-center space-x-2 mb-4">
              <span className="w-1 h-3.5 bg-primary rounded-full"></span>
              <Clock className="w-4 h-4 text-primary" />
              <span>Expected Arrival Timeline</span>
            </h2>

            <div className="space-y-4">
              {Object.entries(arrivalTimeline).map(([group, names]) => {
                if (names.length === 0) return null; // Hide empty slots

                return (
                  <div key={group} className="border-b border-border/50 pb-3 last:border-b-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-foreground">{group}</h4>
                      <span className="px-2.5 py-0.5 bg-muted text-muted-foreground rounded-md text-[10px] font-bold">
                        {names.length} {names.length === 1 ? 'person' : 'people'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                      {names.join(', ')}
                    </p>
                  </div>
                );
              })}
              {Object.entries(arrivalTimeline).every(([_, names]) => names.length === 0) && (
                <p className="text-xs text-muted-foreground py-4 text-center">No schedules submitted.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right column (4 cols): Pending Travel Responses (Sticky on desktop viewports) */}
        <div className="lg:col-span-4 lg:sticky lg:top-24">
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-amber-500/20 flex flex-col max-h-[500px]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-foreground flex items-center space-x-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-500" />
                <span>Pending responses ({pendingResponses.length})</span>
              </h2>
              <button 
                onClick={() => navigate(`/event/${eventSlug}/participants`)}
                className="text-xs text-primary font-bold hover:underline flex items-center"
              >
                <span>View Directory</span>
                <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
              </button>
            </div>

            <div className="overflow-y-auto divide-y divide-border/60 pr-1 no-scrollbar flex-1">
              {pendingResponses.length > 0 ? (
                pendingResponses.map((p) => (
                  <div key={p.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0 text-xs">
                    <div>
                      <p className="font-bold text-foreground">{p.fullName}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{p.currentCity || "Unknown City"}</p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {p.showPhone && p.mobileNumber !== '[Hidden]' ? (
                        <a 
                          href={`https://wa.me/${p.mobileNumber.replace('+', '')}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500/20 transition-all duration-200"
                          title="Contact on WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
                      ) : (
                        <span className="p-2 bg-muted text-muted-foreground/30 rounded-lg cursor-not-allowed">
                          <MessageCircle className="w-4 h-4" />
                        </span>
                      )}

                      {p.showEmail && p.email !== '[Hidden]' ? (
                        <a 
                          href={`mailto:${p.email}`}
                          className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-all duration-200"
                          title="Send Email"
                        >
                          <Mail className="w-4 h-4" />
                        </a>
                      ) : (
                        <span className="p-2 bg-muted text-muted-foreground/30 rounded-lg cursor-not-allowed">
                          <Mail className="w-4 h-4" />
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground py-6 text-center">Perfect! All participants have submitted travel plans.</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardPage;
