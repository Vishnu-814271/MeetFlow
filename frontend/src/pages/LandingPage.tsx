import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { EVENT_TYPE_CONFIGS } from './PortalPage';
import { Calendar, MapPin, User, MessageSquare, Compass, Car, LogOut, CheckCircle } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { event, currentUser, logout, isLoggedIn, eventSlug } = useAuth();
  const eventConfig = event?.eventType ? (EVENT_TYPE_CONFIGS[event.eventType] || EVENT_TYPE_CONFIGS.ALUMNI) : EVENT_TYPE_CONFIGS.ALUMNI;
  const navigate = useNavigate();
  const isOrganizer = isLoggedIn && currentUser && event && currentUser.id === event.createdBy;

  const handleAction = (route: string, requiresAuth: boolean = true) => {
    if (requiresAuth && !isLoggedIn) {
      navigate(`/event/${eventSlug}/join`);
    } else {
      navigate(`/event/${eventSlug}/${route}`);
    }
  };

  return (
    <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-12 lg:gap-8 lg:items-start pb-8">
      
      {/* Left Column: Event details, user status and actions */}
      <div className="lg:col-span-8 space-y-6">
        {/* Event Header Banner Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white rounded-3xl p-6 md:p-8 shadow-xl border border-slate-800 transition-all duration-300 hover:shadow-2xl hover:border-slate-700">
          <div className="absolute right-0 top-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute left-1/3 bottom-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl"></div>
          
          <span className="inline-block px-3 py-1 bg-primary/20 border border-primary/30 text-primary rounded-full text-xs font-semibold tracking-wide uppercase mb-3 animate-float">
            {eventConfig.label}
          </span>

          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight mb-3 bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
            {event?.eventName}
          </h1>
          <p className="text-slate-300 text-sm md:text-base max-w-xl mb-6 leading-relaxed">
            {event?.description}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-800/80 pt-6 text-sm">
            <div className="flex items-center space-x-3 text-slate-200">
              <Calendar className="w-5 h-5 text-primary shrink-0" />
              <div>
                <p className="font-semibold">July 11 – July 12, 2026</p>
                <p className="text-xs text-slate-400">Wraps by 3:00 PM</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-slate-200">
              <MapPin className="w-5 h-5 text-primary shrink-0" />
              <div>
                <p className="font-semibold">{event?.venueName}</p>
                {event?.venueGoogleMapUrl && (
                  <a 
                    href={event.venueGoogleMapUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-xs text-primary hover:underline hover:text-primary/80 transition-colors"
                  >
                    View Google Map
                  </a>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3 text-slate-200">
              <User className="w-5 h-5 text-primary shrink-0" />
              <div>
                <p className="font-semibold">Event Initiator</p>
                <p className="text-xs text-slate-400">Ramesh Prasad</p>
              </div>
            </div>
          </div>
        </div>

        {/* User Login Status Quick Card */}
        {isLoggedIn && currentUser ? (
          <div className="flex items-center justify-between p-5 bg-primary/5 border border-primary/20 rounded-2xl glass shadow-sm transition-all duration-300 hover:shadow-md">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-indigo-600 rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg shadow-sm">
                {currentUser.fullName.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-bold text-foreground flex items-center space-x-1.5">
                  <span>Welcome, {currentUser.fullName}</span>
                  <CheckCircle className="w-4 h-4 text-emerald-500 fill-emerald-500/10" />
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{currentUser.currentCity || "Profile Incomplete"}</p>
              </div>
            </div>
            <button 
              onClick={logout}
              className="flex items-center space-x-1.5 px-3 py-2 border border-border hover:bg-muted text-xs font-bold rounded-xl text-foreground hover:border-muted-foreground/30 transition-all duration-200 shadow-sm"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <div className="p-5 bg-muted/30 border border-border rounded-2xl flex flex-col md:flex-row items-center justify-between text-center md:text-left gap-4 shadow-sm transition-all hover:bg-muted/40">
            <div>
              <h3 className="text-sm font-bold text-foreground">Coordinate Travel & Carpools</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{eventConfig.registrationSubtitle}</p>
            </div>
            <button
              onClick={() => navigate(`/event/${eventSlug}/join`)}
              className="w-full md:w-auto px-5 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl text-sm shadow-md hover:bg-primary/90 hover:shadow-lg active:scale-95 transition-all"
            >
              Join Meetup Event
            </button>
          </div>
        )}

        {/* Grid of Main Navigation CTAs */}
        <div className={`grid grid-cols-2 ${isOrganizer ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-4 md:gap-5`}>
          <button
            onClick={() => handleAction('travel')}
            className="flex flex-col items-start p-5 bg-card border border-border rounded-2xl hover:border-primary/40 hover:shadow-lg hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 text-left group shadow-sm w-full"
          >
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-3.5 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors duration-200">
              {isLoggedIn ? "Update Travel Plan" : "Submit Travel Plan"}
            </h3>
            <p className="text-[11px] text-muted-foreground mt-1.5 leading-normal">
              Register departure schedules and origin cities.
            </p>
          </button>

          {isOrganizer && (
            <button
              onClick={() => handleAction('dashboard', false)}
              className="flex flex-col items-start p-5 bg-card border border-border rounded-2xl hover:border-indigo-500/40 hover:shadow-lg hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 text-left group shadow-sm w-full"
            >
              <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500 mb-3.5 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all duration-300">
                <Compass className="w-5 h-5 rotate-45" />
              </div>
              <h3 className="text-sm font-bold text-foreground group-hover:text-indigo-500 transition-colors duration-200">
                View Dashboard
              </h3>
              <p className="text-[11px] text-muted-foreground mt-1.5 leading-normal">
                Track en-route lists, city summaries, and missing responses.
              </p>
            </button>
          )}

          <button
            onClick={() => handleAction('carpool')}
            className="flex flex-col items-start p-5 bg-card border border-border rounded-2xl hover:border-emerald-500/40 hover:shadow-lg hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 text-left group shadow-sm w-full"
          >
            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 mb-3.5 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all duration-300">
              <Car className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-foreground group-hover:text-emerald-500 transition-colors duration-200">
              Carpool Board
            </h3>
            <p className="text-[11px] text-muted-foreground mt-1.5 leading-normal">
              Find nearby matches, offer empty seats, or join open groups.
            </p>
          </button>

          <button
            onClick={() => handleAction('messages')}
            className="flex flex-col items-start p-5 bg-card border border-border rounded-2xl hover:border-rose-500/40 hover:shadow-lg hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 text-left group shadow-sm w-full"
          >
            <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-500 mb-3.5 group-hover:scale-110 group-hover:bg-rose-500/20 transition-all duration-300">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-foreground group-hover:text-rose-500 transition-colors duration-200">
              Messages & News
            </h3>
            <p className="text-[11px] text-muted-foreground mt-1.5 leading-normal">
              Post questions, travel updates, or see general announcements.
            </p>
          </button>
        </div>
      </div>

      {/* Right Column: Event Agenda (Sticky on desktop viewports) */}
      <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
        <div className="bg-card border border-border rounded-3xl p-5 md:p-6 shadow-sm transition-all duration-300 hover:shadow-md">
          <h2 className="text-base font-bold text-foreground mb-4 flex items-center space-x-2">
            <span className="w-1.5 h-3 bg-primary rounded-full"></span>
            <span>Event Agenda</span>
          </h2>
          
          <div className="space-y-5">
            <div className="relative pl-6 border-l border-border transition-all duration-300 hover:border-primary/50 group">
              <div className="absolute -left-1.5 top-1.5 w-3 h-3 bg-primary rounded-full border-2 border-card group-hover:scale-125 transition-transform duration-200"></div>
              <p className="text-xs font-semibold text-primary">July 11 — 10:00 AM</p>
              <h4 className="text-sm font-bold text-foreground mt-0.5">Welcome Reception & Tea</h4>
              <p className="text-xs text-muted-foreground mt-1 leading-normal">Arrival registration, name board collection, and workspace setups.</p>
            </div>

            <div className="relative pl-6 border-l border-border transition-all duration-300 hover:border-primary/50 group">
              <div className="absolute -left-1.5 top-1.5 w-3 h-3 bg-muted-foreground/30 rounded-full border-2 border-card group-hover:scale-125 transition-transform duration-200"></div>
              <p className="text-xs font-semibold text-muted-foreground">July 11 — 11:30 AM</p>
              <h4 className="text-sm font-bold text-foreground mt-0.5">Keynote Speech & NLP Updates</h4>
              <p className="text-xs text-muted-foreground mt-1 leading-normal">Introductory address by Ramesh and panel presentation on NLP models.</p>
            </div>

            <div className="relative pl-6 border-l border-border transition-all duration-300 hover:border-primary/50 group">
              <div className="absolute -left-1.5 top-1.5 w-3 h-3 bg-muted-foreground/30 rounded-full border-2 border-card group-hover:scale-125 transition-transform duration-200"></div>
              <p className="text-xs font-semibold text-muted-foreground">July 11 — 07:00 PM</p>
              <h4 className="text-sm font-bold text-foreground mt-0.5">Cohort Networking Dinner</h4>
              <p className="text-xs text-muted-foreground mt-1 leading-normal">
                {event?.eventType === 'ALUMNI' || !event?.eventType
                  ? 'Open-air social dinner and alumni chapter launch presentations.'
                  : 'Open-air social dinner and collaborative networking sessions.'}
              </p>
            </div>

            <div className="relative pl-6 group">
              <div className="absolute -left-1.5 top-1.5 w-3 h-3 bg-primary rounded-full border-2 border-card group-hover:scale-125 transition-transform duration-200"></div>
              <p className="text-xs font-semibold text-primary">July 12 — 09:30 AM</p>
              <h4 className="text-sm font-bold text-foreground mt-0.5">Group Collaboration & Hackathon</h4>
              <p className="text-xs text-muted-foreground mt-1 leading-normal">Breakout rooms for domain sharing, ending by Closing tea at 2:30 PM.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
