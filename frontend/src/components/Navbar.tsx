import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, BarChart2, Car, MessageSquare, User, Layers } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  slug: string;
}

export const Navbar: React.FC<NavbarProps> = ({ slug }) => {
  const { event, currentUser, isLoggedIn } = useAuth();
  const isOrganizer = isLoggedIn && currentUser && event && currentUser.id === event.createdBy;

  const features = React.useMemo(() => {
    if (!event?.featuresConfig) {
      return { travel: true, carpool: true, announcements: true, chat: true, gallery: true, polls: true, attendance: true };
    }
    try {
      return typeof event.featuresConfig === 'string' ? JSON.parse(event.featuresConfig) : event.featuresConfig;
    } catch (e) {
      return { travel: true, carpool: true, announcements: true, chat: true, gallery: true, polls: true, attendance: true };
    }
  }, [event?.featuresConfig]);

  const activeClass = "text-primary flex flex-col items-center justify-center w-full h-full";
  const inactiveClass = "text-muted-foreground hover:text-foreground flex flex-col items-center justify-center w-full h-full transition-colors";

  return (
    <>
      {/* Mobile Sticky Bottom Navbar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-background/80 border-t border-border glass z-50 flex items-center justify-around">
        <NavLink to={`/event/${slug}`} end className={({ isActive }) => isActive ? activeClass : inactiveClass}>
          <Home className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Home</span>
        </NavLink>
        {isOrganizer && (
          <NavLink to={`/event/${slug}/dashboard`} className={({ isActive }) => isActive ? activeClass : inactiveClass}>
            <BarChart2 className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Dashboard</span>
          </NavLink>
        )}
        {features.carpool && (
          <NavLink to={`/event/${slug}/carpool`} className={({ isActive }) => isActive ? activeClass : inactiveClass}>
            <Car className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Carpool</span>
          </NavLink>
        )}
        {(features.announcements || features.chat) && (
          <NavLink to={`/event/${slug}/messages`} className={({ isActive }) => isActive ? activeClass : inactiveClass}>
            <MessageSquare className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Messages</span>
          </NavLink>
        )}
        <NavLink to={`/event/${slug}/settings`} className={({ isActive }) => isActive ? activeClass : inactiveClass}>
          <User className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Profile</span>
        </NavLink>
      </div>

      {/* Desktop Left Sidebar Navbar */}
      <header className="hidden md:flex fixed top-0 bottom-0 left-0 w-64 bg-[#0a0f1d] border-r border-slate-800/60 z-50 flex-col py-6 px-5 justify-between shadow-lg">
        <div className="space-y-8">
          <NavLink to={`/event/${slug}`} className="flex items-center space-x-2.5 font-black text-2xl text-white tracking-tight">
            <Layers className="w-6 h-6 rotate-45 text-primary animate-pulse-slow" />
            <span>MEET-FLOW</span>
          </NavLink>
          
          <nav className="flex flex-col space-y-2 text-sm font-semibold">
            <NavLink 
              to={`/event/${slug}`} 
              end 
              className={({ isActive }) => 
                `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                    : "text-slate-400 hover:text-white hover:bg-slate-800/40"
                }`
              }
            >
              <Home className="w-4.5 h-4.5" />
              <span>Home</span>
            </NavLink>
            
            {isOrganizer && (
              <NavLink 
                to={`/event/${slug}/dashboard`} 
                className={({ isActive }) => 
                  `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                      : "text-slate-400 hover:text-white hover:bg-slate-800/40"
                  }`
                }
              >
                <BarChart2 className="w-4.5 h-4.5" />
                <span>Dashboard</span>
              </NavLink>
            )}
            
            {features.carpool && (
              <NavLink 
                to={`/event/${slug}/carpool`} 
                className={({ isActive }) => 
                  `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                      : "text-slate-400 hover:text-white hover:bg-slate-800/40"
                  }`
                }
              >
                <Car className="w-4.5 h-4.5" />
                <span>Carpool Board</span>
              </NavLink>
            )}
            
            {(features.announcements || features.chat) && (
              <NavLink 
                to={`/event/${slug}/messages`} 
                className={({ isActive }) => 
                  `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                      : "text-slate-400 hover:text-white hover:bg-slate-800/40"
                  }`
                }
              >
                <MessageSquare className="w-4.5 h-4.5" />
                <span>Message Board</span>
              </NavLink>
            )}
            
            <NavLink 
              to={`/event/${slug}/settings`} 
              className={({ isActive }) => 
                `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                    : "text-slate-400 hover:text-white hover:bg-slate-800/40"
                }`
              }
            >
              <User className="w-4.5 h-4.5" />
              <span>My Profile</span>
            </NavLink>
          </nav>
        </div>
        
        <div className="text-[10px] text-slate-500 border-t border-slate-800 pt-4 px-2">
          <p className="font-semibold text-slate-400">{event?.eventName || "MEET-FLOW Event"}</p>
          <p className="mt-0.5">
            {event?.startDatetime ? new Date(event.startDatetime).toLocaleDateString(undefined, {month: 'short', day: 'numeric'}) : "July 11"}
            {event?.endDatetime ? " – " + new Date(event.endDatetime).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'}) : "12, 2026"}
          </p>
        </div>
      </header>
    </>
  );
};
export default Navbar;
