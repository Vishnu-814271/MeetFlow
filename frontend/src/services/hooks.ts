import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './api';

// Types
export interface Event {
  id: string;
  eventName: string;
  eventType: string;
  organizationId?: string;
  featuresConfig?: string;
  registrationSchema?: string;
  rolesSchema?: string;
  dashboardSchema?: string;
  eventSlug: string;
  eventCode: string;
  description: string;
  venueName: string;
  venueAddress: string;
  venueGoogleMapUrl: string;
  startDatetime: string;
  endDatetime: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Participant {
  id: string;
  eventId: string;
  fullName: string;
  mobileNumber: string;
  email: string;
  batchOrGroup: string;
  currentCity: string;
  attendanceStatus: string;
  profileStatus: string;
  showName: boolean;
  showPhone: boolean;
  showEmail: boolean;
  showTravelDetails: boolean;
  allowContact: boolean;
  customFieldsData?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TravelPlan {
  id?: string;
  eventId: string;
  participantId: string;
  originCity: string;
  originArea: string;
  googleMapsLink: string;
  travelMode: string;
  departureDate: string;
  departureTime: string;
  expectedArrivalDate: string;
  expectedArrivalTime: string;
  returnDate: string;
  returnTime: string;
  peopleCount: number;
  luggageCount: number;
  travelNote: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CarpoolMemberInfo {
  participantId: string;
  fullName: string;
  mobileNumber: string;
  email: string;
  role: string;
  joinedAt: string;
  status: string;
  showPhone: boolean;
  showEmail: boolean;
}

export interface CarpoolGroupDetails {
  id: string;
  eventId: string;
  title: string;
  originCity: string;
  originArea: string;
  driverParticipantId: string;
  driverName: string;
  driverPhone: string;
  vehicleType: string;
  departureDate: string;
  departureTime: string;
  seatsAvailable: number;
  seatsTaken: number;
  pickupNotes: string;
  status: string;
  createdBy: string;
  members: CarpoolMemberInfo[];
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  eventId: string;
  postedBy: string;
  messageText: string;
  category: string;
  visibilityType: string;
  targetCity: string;
  targetCarpoolGroupId: string;
  isPinned: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StatusUpdate {
  id?: string;
  eventId: string;
  participantId: string;
  status: string;
  markedBy: string;
  note: string;
  createdAt?: string;
}

export interface PendingParticipant {
  id: string;
  fullName: string;
  currentCity: string;
  mobileNumber: string;
  email: string;
  showPhone: boolean;
  showEmail: boolean;
}

export interface DashboardData {
  attendanceSummary: {
    totalRegistered: number;
    confirmed: number;
    maybe: number;
    notAttending: number;
    notResponded: number;
    reachedVenue: number;
    enRoute: number;
  };
  citySummary: Record<string, number>;
  travelModeSummary: Record<string, number>;
  arrivalTimeline: Record<string, string[]>;
  pendingResponses: PendingParticipant[];
}

// 1. Event Hooks
export const useEvent = (slug: string) => {
  return useQuery<Event, Error>({
    queryKey: ['event', slug],
    queryFn: async () => {
      const response = await api.get(`/events/${slug}`);
      return response.data;
    },
    enabled: !!slug,
  });
};

// 2. Participant Hooks
export const useParticipants = (eventId: string) => {
  return useQuery<Participant[], Error>({
    queryKey: ['participants', eventId],
    queryFn: async () => {
      const response = await api.get(`/events/${eventId}/participants`);
      return response.data;
    },
    enabled: !!eventId,
  });
};

export const useParticipant = (id: string) => {
  return useQuery<Participant, Error>({
    queryKey: ['participant', id],
    queryFn: async () => {
      const response = await api.get(`/participants/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();
  return useMutation<Participant, Error, Omit<Participant, 'id' | 'createdAt' | 'updatedAt'>>({
    mutationFn: async (newParticipant) => {
      const response = await api.post('/participants', newParticipant);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['participants', data.eventId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', data.eventId] });
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation<Participant, Error, { id: string; data: Partial<Participant> }>({
    mutationFn: async ({ id, data }) => {
      const response = await api.put(`/participants/${id}`, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['participant', data.id] });
      queryClient.invalidateQueries({ queryKey: ['participants', data.eventId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', data.eventId] });
    },
  });
};

export const useVerifyParticipant = () => {
  return useMutation<Participant, Error, { eventCode: string; mobileNumber: string }>({
    mutationFn: async (credentials) => {
      const response = await api.post('/participants/verify', credentials);
      return response.data;
    },
  });
};

// 3. Travel Plan Hooks
export const useTravelPlan = (participantId: string) => {
  return useQuery<TravelPlan, Error>({
    queryKey: ['travel-plan', participantId],
    queryFn: async () => {
      const response = await api.get(`/travel-plans/participant/${participantId}`);
      return response.data;
    },
    enabled: !!participantId,
    retry: false, // Don't retry since 404 is a valid case (no travel plan submitted yet)
  });
};

export const useTravelPlans = (eventId: string) => {
  return useQuery<TravelPlan[], Error>({
    queryKey: ['travel-plans', eventId],
    queryFn: async () => {
      const response = await api.get(`/events/${eventId}/travel-plans`);
      return response.data;
    },
    enabled: !!eventId,
  });
};

export const useSaveTravelPlan = () => {
  const queryClient = useQueryClient();
  return useMutation<TravelPlan, Error, TravelPlan>({
    mutationFn: async (plan) => {
      const response = await api.post('/travel-plans', plan);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['travel-plan', data.participantId] });
      queryClient.invalidateQueries({ queryKey: ['travel-plans', data.eventId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', data.eventId] });
      queryClient.invalidateQueries({ queryKey: ['participants', data.eventId] });
    },
  });
};

// 4. Carpool Hooks
export const useCarpoolGroups = (eventId: string) => {
  return useQuery<CarpoolGroupDetails[], Error>({
    queryKey: ['carpool-groups', eventId],
    queryFn: async () => {
      const response = await api.get(`/events/${eventId}/carpool-groups`);
      return response.data;
    },
    enabled: !!eventId,
  });
};

export const useCarpoolSuggestions = (eventId: string, participantId: string) => {
  return useQuery<CarpoolGroupDetails[], Error>({
    queryKey: ['carpool-suggestions', eventId, participantId],
    queryFn: async () => {
      const response = await api.get(`/events/${eventId}/carpool-suggestions`, {
        params: { participantId },
      });
      return response.data;
    },
    enabled: !!eventId && !!participantId,
  });
};

export const useCreateCarpoolGroup = () => {
  const queryClient = useQueryClient();
  return useMutation<CarpoolGroupDetails, Error, Omit<CarpoolGroupDetails, 'id' | 'driverName' | 'driverPhone' | 'seatsTaken' | 'members' | 'createdAt' | 'updatedAt'>>({
    mutationFn: async (group) => {
      const response = await api.post('/carpool-groups', group);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['carpool-groups', data.eventId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', data.eventId] });
    },
  });
};

export const useJoinCarpool = () => {
  const queryClient = useQueryClient();
  return useMutation<CarpoolGroupDetails, Error, { groupId: string; participantId: string }>({
    mutationFn: async ({ groupId, participantId }) => {
      const response = await api.post(`/carpool-groups/${groupId}/join`, { participantId });
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['carpool-groups', data.eventId] });
      queryClient.invalidateQueries({ queryKey: ['carpool-suggestions', data.eventId, variables.participantId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', data.eventId] });
    },
  });
};

export const useLeaveCarpool = () => {
  const queryClient = useQueryClient();
  return useMutation<CarpoolGroupDetails, Error, { groupId: string; participantId: string }>({
    mutationFn: async ({ groupId, participantId }) => {
      const response = await api.post(`/carpool-groups/${groupId}/leave`, { participantId });
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['carpool-groups', data.eventId] });
      queryClient.invalidateQueries({ queryKey: ['carpool-suggestions', data.eventId, variables.participantId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', data.eventId] });
    },
  });
};

// 5. Message Hooks
export const useMessages = (eventId: string) => {
  return useQuery<Message[], Error>({
    queryKey: ['messages', eventId],
    queryFn: async () => {
      const response = await api.get(`/events/${eventId}/messages`);
      return response.data;
    },
    enabled: !!eventId,
  });
};

export const useCreateMessage = () => {
  const queryClient = useQueryClient();
  return useMutation<Message, Error, Omit<Message, 'id' | 'isPinned' | 'isDeleted' | 'createdAt' | 'updatedAt'>>({
    mutationFn: async (message) => {
      const response = await api.post('/messages', message);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['messages', data.eventId] });
    },
  });
};

export const useDeleteMessage = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { id: string; eventId: string }>({
    mutationFn: async ({ id }) => {
      await api.delete(`/messages/${id}`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.eventId] });
    },
  });
};

// 6. Status Tracker Hooks
export const useStatusUpdates = (eventId: string) => {
  return useQuery<StatusUpdate[], Error>({
    queryKey: ['status-updates', eventId],
    queryFn: async () => {
      const response = await api.get(`/events/${eventId}/status-updates`);
      return response.data;
    },
    enabled: !!eventId,
  });
};

export const useSaveStatusUpdate = () => {
  const queryClient = useQueryClient();
  return useMutation<StatusUpdate, Error, StatusUpdate>({
    mutationFn: async (update) => {
      const response = await api.post('/status-updates', update);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['status-updates', data.eventId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', data.eventId] });
      queryClient.invalidateQueries({ queryKey: ['participants', data.eventId] });
    },
  });
};

// 7. Dashboard Hook
export const useDashboard = (eventId: string) => {
  return useQuery<DashboardData, Error>({
    queryKey: ['dashboard', eventId],
    queryFn: async () => {
      const response = await api.get(`/events/${eventId}/dashboard`);
      return response.data;
    },
    enabled: !!eventId,
  });
};

export interface CreateEventRequest {
  event: Partial<Event>;
  organizer: Partial<Participant>;
}

export interface CreateEventResponse {
  event: Event;
  organizer: Participant;
}

export const useCreateEventWithOrganizer = () => {
  return useMutation<CreateEventResponse, Error, CreateEventRequest>({
    mutationFn: async (requestBody) => {
      const response = await api.post('/events/with-organizer', requestBody);
      return response.data;
    },
  });
};

export const useEventByCode = () => {
  return useMutation<Event, Error, string>({
    mutationFn: async (code) => {
      const response = await api.get(`/events/code/${code}`);
      return response.data;
    },
  });
};

export const useAiGenerateEvent = () => {
  return useMutation<any, Error, string>({
    mutationFn: async (prompt) => {
      const response = await api.post('/events/ai-generate', { prompt });
      return response.data;
    },
  });
};

