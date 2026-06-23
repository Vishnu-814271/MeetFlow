import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, BarChart2, Car, MessageSquare, User, Layers, Map } from 'lucide-react';
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
        <NavLink to={`/event/${slug}`} end className={({ isActive }: { isActive: boolean }) => isActive ? activeClass : inactiveClass}>
          <Home className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Home</span>
        </NavLink>
        {isOrganizer && (
          <NavLink to={`/event/${slug}/dashboard`} className={({ isActive }: { isActive: boolean }) => isActive ? activeClass : inactiveClass}>
            <BarChart2 className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Dashboard</span>
          </NavLink>
        )}
        {features.carpool && (
          <NavLink to={`/event/${slug}/carpool`} className={({ isActive }: { isActive: boolean }) => isActive ? activeClass : inactiveClass}>
            <Car className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Carpool</span>
          </NavLink>
        )}
        <NavLink to={`/event/${slug}/tracker-map`} className={({ isActive }: { isActive: boolean }) => isActive ? activeClass : inactiveClass}>
          <Map className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Map & Tracker</span>
        </NavLink>
        {(features.announcements || features.chat) && (
          <NavLink to={`/event/${slug}/messages`} className={({ isActive }: { isActive: boolean }) => isActive ? activeClass : inactiveClass}>
            <MessageSquare className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Messages</span>
          </NavLink>
        )}
        <NavLink to={`/event/${slug}/settings`} className={({ isActive }: { isActive: boolean }) => isActive ? activeClass : inactiveClass}>
          <User className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Profile</span>
        </NavLink>
      </div>

      {/* Desktop Left Sidebar Navbar */}
      <header className="hidden md:flex fixed top-0 bottom-0 left-0 w-64 bg-white border-r border-border z-50 flex-col py-6 px-5 justify-between shadow-sm">
        <div className="space-y-8">
          <NavLink to={`/event/${slug}`} className="flex items-center space-x-2.5 font-black text-2xl text-foreground tracking-tight">
            <Layers className="w-6 h-6 rotate-45 text-orange-500 animate-pulse-slow" />
            <span>MEET-FLOW</span>
          </NavLink>
          
          <nav className="flex flex-col space-y-2 text-sm font-semibold">
            <NavLink 
              to={`/event/${slug}`} 
              end 
              className={({ isActive }: { isActive: boolean }) => 
                `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold shadow-lg shadow-orange-500/25 scale-[1.02]" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`
              }
            >
              <Home className="w-4.5 h-4.5" />
              <span>Home</span>
            </NavLink>
            
            {isOrganizer && (
              <NavLink 
                to={`/event/${slug}/dashboard`} 
                className={({ isActive }: { isActive: boolean }) => 
                  `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive 
                      ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold shadow-lg shadow-orange-500/25 scale-[1.02]" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
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
                className={({ isActive }: { isActive: boolean }) => 
                  `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive 
                      ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold shadow-lg shadow-orange-500/25 scale-[1.02]" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`
                }
              >
                <Car className="w-4.5 h-4.5" />
                <span>Carpool Board</span>
              </NavLink>
            )}

            <NavLink 
              to={`/event/${slug}/tracker-map`} 
              className={({ isActive }: { isActive: boolean }) => 
                `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold shadow-lg shadow-orange-500/25 scale-[1.02]" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`
              }
            >
              <Map className="w-4.5 h-4.5" />
              <span>Map & Tracker</span>
            </NavLink>
            
            {(features.announcements || features.chat) && (
              <NavLink 
                to={`/event/${slug}/messages`} 
                className={({ isActive }: { isActive: boolean }) => 
                  `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive 
                      ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold shadow-lg shadow-orange-500/25 scale-[1.02]" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`
                }
              >
                <MessageSquare className="w-4.5 h-4.5" />
                <span>Message Board</span>
              </NavLink>
            )}
            
            <NavLink 
              to={`/event/${slug}/settings`} 
              className={({ isActive }: { isActive: boolean }) => 
                `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold shadow-lg shadow-orange-500/25 scale-[1.02]" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`
              }
            >
              <User className="w-4.5 h-4.5" />
              <span>My Profile</span>
            </NavLink>
          </nav>
        </div>
        
        <div className="text-[10px] text-muted-foreground border-t border-border pt-4 px-2">
          <p className="font-semibold text-foreground/80">{event?.eventName || "MEET-FLOW Event"}</p>
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
