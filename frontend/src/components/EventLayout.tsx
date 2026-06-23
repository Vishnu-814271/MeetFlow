import React from 'react';
import { useParams, Outlet, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from '../context/AuthContext';
import Navbar from './Navbar';
import { Loader2, AlertCircle } from 'lucide-react';

const EventLayoutContent: React.FC = () => {
  const { event, eventLoading, eventSlug } = useAuth();

  if (eventLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground font-medium">Loading meetup details...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col bg-background p-6 text-center">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h1 className="text-2xl font-bold text-foreground">Meetup Event Not Found</h1>
        <p className="mt-2 text-muted-foreground max-w-md">
          The meetup event link you followed appears to be invalid or expired. Check the spelling or ask the event initiator for the correct private link.
        </p>
        <Link to="/" className="mt-6 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium shadow hover:bg-primary/90 transition-colors">
          Go to Homepage
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navbar (bottom on mobile, left sidebar on desktop) */}
      <Navbar slug={eventSlug} />
      
      {/* Layout wrapper to offset content from vertical fixed sidebar on desktop */}
      <div className="flex-1 flex flex-col md:pl-64 transition-all duration-300">
        {/* Main content container with desktop top-margin and mobile bottom-margin */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-6 md:px-8 pt-6 md:pt-10 pb-24 md:pb-10 flex flex-col">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export const EventLayout: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const eventSlug = slug || 'nlp-meetup-2026';

  return (
    <AuthProvider slug={eventSlug}>
      <EventLayoutContent />
    </AuthProvider>
  );
};

export default EventLayout;
