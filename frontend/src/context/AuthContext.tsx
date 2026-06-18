import React, { createContext, useContext, useState, useEffect } from 'react';
import { useEvent, useVerifyParticipant } from '../services/hooks';
import type { Event, Participant } from '../services/hooks';

interface AuthContextType {
  event: Event | undefined;
  eventLoading: boolean;
  eventSlug: string;
  currentUser: Participant | null;
  isLoggedIn: boolean;
  login: (eventCode: string, mobileNumber: string) => Promise<Participant>;
  setCurrentUser: (user: Participant | null) => void;
  logout: () => void;
  refetchEvent: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode; slug: string }> = ({ children, slug }) => {
  const [currentUser, setCurrentUserValue] = useState<Participant | null>(null);
  const { data: event, isLoading: eventLoading, refetch: refetchEvent } = useEvent(slug);
  const verifyMutation = useVerifyParticipant();

  // Load user from localStorage on init
  useEffect(() => {
    const cachedUser = localStorage.getItem(`meetflow_user_${slug}`);
    if (cachedUser) {
      try {
        setCurrentUserValue(JSON.parse(cachedUser));
      } catch (e) {
        localStorage.removeItem(`meetflow_user_${slug}`);
      }
    }
  }, [slug]);

  // Keep track of last active event for portal quick-access
  useEffect(() => {
    if (event && currentUser) {
      localStorage.setItem('meetflow_last_active_slug', slug);
      localStorage.setItem('meetflow_last_active_name', event.eventName);
    }
  }, [event, currentUser, slug]);

  const login = async (eventCode: string, mobileNumber: string): Promise<Participant> => {
    return new Promise((resolve, reject) => {
      verifyMutation.mutate(
        { eventCode, mobileNumber },
        {
          onSuccess: (data) => {
            // Check if correct event
            if (event && data.eventId !== event.id) {
              reject(new Error("This participant is registered for a different event."));
              return;
            }
            setCurrentUserValue(data);
            localStorage.setItem(`meetflow_user_${slug}`, JSON.stringify(data));
            resolve(data);
          },
          onError: (err: any) => {
            reject(new Error(err.response?.data?.error || err.message || "Verification failed. Check code & phone number."));
          },
        }
      );
    });
  };

  const setCurrentUser = (user: Participant | null) => {
    setCurrentUserValue(user);
    if (user) {
      localStorage.setItem(`meetflow_user_${slug}`, JSON.stringify(user));
    } else {
      localStorage.removeItem(`meetflow_user_${slug}`);
    }
  };

  const logout = () => {
    setCurrentUserValue(null);
    localStorage.removeItem(`meetflow_user_${slug}`);
  };

  return (
    <AuthContext.Provider
      value={{
        event,
        eventLoading,
        eventSlug: slug,
        currentUser,
        isLoggedIn: !!currentUser,
        login,
        setCurrentUser,
        logout,
        refetchEvent,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
