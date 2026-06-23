import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMessages, useCreateMessage, useDeleteMessage, useParticipants } from '../services/hooks';
import ProtectedRoute from '../components/ProtectedRoute';
import { 
  MessageSquare, 
  Send, 
  Trash2, 
  Volume2, 
  AlertTriangle, 
  Loader2 
} from 'lucide-react';

export const MessagesPageContent: React.FC = () => {
  const { event, currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';

  // Queries
  const { data: messages = [], isLoading: loadingMessages } = useMessages(event?.id || '');
  const { data: participants = [] } = useParticipants(event?.id || '');
  const createMessageMutation = useCreateMessage();
  const deleteMessageMutation = useDeleteMessage();

  const getPosterName = (postedById: string) => {
    const participant = participants.find(p => p.id === postedById);
    if (!participant) return 'Unknown Participant';
    return participant.showName ? participant.fullName : 'Anonymous';
  };

  // UI state
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>(initialCategory);
  const [messageText, setMessageText] = useState('');
  const [category, setCategory] = useState(initialCategory !== 'all' && ['General', 'Travel', 'Carpool', 'Announcement'].includes(initialCategory) ? initialCategory : 'General'); // General, Travel, Carpool, Announcement
  const [showAnnouncementWarning, setShowAnnouncementWarning] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const categories = ["General", "Travel", "Carpool", "Announcement"];

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!messageText.trim()) {
      setError('Message text cannot be empty.');
      return;
    }

    if (category === 'Announcement') {
      setShowAnnouncementWarning(true);
    } else {
      submitMessage();
    }
  };

  const submitMessage = () => {
    setShowAnnouncementWarning(false);
    setSubmitting(true);

    createMessageMutation.mutate(
      {
        eventId: event!.id,
        postedBy: currentUser!.id,
        messageText: messageText.trim(),
        category,
        visibilityType: 'public',
        targetCity: '',
        targetCarpoolGroupId: ''
      },
      {
        onSuccess: () => {
          setMessageText('');
          setCategory('General');
          setSuccess('Message posted successfully!');
          setSubmitting(false);
          setTimeout(() => setSuccess(''), 2500);
        },
        onError: (err: any) => {
          setError(err.response?.data?.error || err.message || 'Failed to post message.');
          setSubmitting(false);
        }
      }
    );
  };

  const handleDelete = (messageId: string) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      deleteMessageMutation.mutate({ id: messageId, eventId: event!.id });
    }
  };

  // Filter messages
  const filteredMessages = messages.filter(m => {
    if (selectedCategoryTab === 'all') return true;
    return m.category.toLowerCase() === selectedCategoryTab.toLowerCase();
  });

  const getCategoryBadgeClass = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'announcement':
        return 'bg-primary/15 text-primary border-primary/20';
      case 'travel':
        return 'bg-secondary/15 text-secondary border-secondary/20';
      case 'carpool':
        return 'bg-secondary/15 text-secondary border-secondary/20';
      default:
        return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
    }
  };

  if (loadingMessages) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="mt-4 text-xs text-muted-foreground font-semibold">Loading messages feed...</p>
      </div>
    );
  }

  const announcements = messages.filter(m => m.category.toLowerCase() === 'announcement');

  return (
    <div className="space-y-6 pb-12 relative">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">Meetup Chat & Broadcasts</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Post coordination queries, travel news, or check critical announcements.</p>
        </div>
      </div>

      {/* Grid container for desktop layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:items-start">
        
        {/* Left Column (8 cols): Create Post, Tabs and Messages list */}
        <div className="lg:col-span-8 space-y-5">
          {/* Post Message Box */}
          <div className="bg-card border border-border rounded-3xl p-5 shadow-sm glass transition-all hover:shadow-md">
            {success && (
              <div className="text-xs text-secondary bg-secondary/10 border border-secondary/20 p-2.5 rounded-lg font-bold mb-3 animate-pulse">
                {success}
              </div>
            )}
            {error && (
              <div className="text-xs text-destructive bg-destructive/10 p-2.5 rounded-lg font-bold mb-3">
                {error}
              </div>
            )}

            <form onSubmit={handlePostSubmit} className="space-y-3.5">
              <div className="flex items-center justify-between text-xs">
                <div className="w-1/2 max-w-[200px]">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg p-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>Category: {c}</option>
                    ))}
                  </select>
                </div>
                <span className="text-xs text-muted-foreground font-semibold">
                  Posting as <span className="text-foreground font-bold">{currentUser?.fullName}</span>
                </span>
              </div>

              <div className="relative">
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="What's happening? Ask for travel coordinates, departures, etc..."
                  rows={3}
                  maxLength={400}
                  className="w-full bg-background border border-border rounded-xl p-3.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-muted-foreground/35 resize-none pr-12 transition-all duration-200"
                  required
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="absolute bottom-3 right-3 p-2 bg-primary text-primary-foreground hover:bg-primary/95 rounded-lg transition-all duration-200 shadow-sm disabled:opacity-50 active:scale-95"
                  title="Post Message"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </form>
          </div>

          {/* Message Filter Tabs */}
          <div className="flex border-b border-border text-xs font-bold overflow-x-auto no-scrollbar scroll-smooth">
            <button
              onClick={() => setSelectedCategoryTab('all')}
              className={`py-2.5 px-4 border-b-2 whitespace-nowrap transition-colors ${
                selectedCategoryTab === 'all' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              All Messages
            </button>
            <button
              onClick={() => setSelectedCategoryTab('Announcement')}
              className={`py-2.5 px-4 border-b-2 whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
                selectedCategoryTab === 'Announcement' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Announcements</span>
            </button>
            <button
              onClick={() => setSelectedCategoryTab('General')}
              className={`py-2.5 px-4 border-b-2 whitespace-nowrap transition-colors ${
                selectedCategoryTab === 'General' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              General
            </button>
            <button
              onClick={() => setSelectedCategoryTab('Travel')}
              className={`py-2.5 px-4 border-b-2 whitespace-nowrap transition-colors ${
                selectedCategoryTab === 'Travel' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Travel
            </button>
            <button
              onClick={() => setSelectedCategoryTab('Carpool')}
              className={`py-2.5 px-4 border-b-2 whitespace-nowrap transition-colors ${
                selectedCategoryTab === 'Carpool' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Carpool
            </button>
          </div>

          {/* Message Cards List */}
          <div className="space-y-4">
            {filteredMessages.length > 0 ? (
              filteredMessages.map(m => {
                const isOwner = m.postedBy === currentUser?.id;
                const isAnnouncement = m.category.toLowerCase() === 'announcement';
                const posterName = getPosterName(m.postedBy);

                return (
                  <div 
                    key={m.id} 
                    className={`bg-card border rounded-2xl p-4 shadow-sm transition-all duration-300 relative interactive-card ${
                      isAnnouncement ? 'border-primary/20 bg-primary/5 dark:border-primary/20 dark:bg-primary/5' : 'border-border'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2.5">
                        <div className={`w-8.5 h-8.5 rounded-full flex items-center justify-center font-bold text-xs uppercase shadow-sm ${
                          isAnnouncement ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'
                        }`}>
                          {posterName.charAt(0) || 'M'}
                        </div>
                        <div>
                          <p className="font-bold text-foreground">{posterName}</p>
                          <p className="text-[9px] text-muted-foreground mt-0.5">
                            {m.createdAt ? new Date(m.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Just now'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className={`px-2.5 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider shadow-sm ${getCategoryBadgeClass(m.category)}`}>
                          {m.category}
                        </span>
                        {isOwner && (
                          <button
                            onClick={() => handleDelete(m.id)}
                            className="p-1.5 hover:bg-primary/15 rounded-lg text-muted-foreground hover:text-primary transition-colors shadow-sm"
                            title="Delete Message"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Message Body */}
                    <p className="text-xs text-foreground mt-3 leading-relaxed whitespace-pre-wrap">
                      {m.messageText}
                    </p>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center bg-card border border-border rounded-3xl">
                <MessageSquare className="w-8 h-8 text-muted-foreground/60 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-foreground">No messages posted</h4>
                <p className="text-xs text-muted-foreground mt-0.5">Select another filter or post a message above to start coordination chatting.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (4 cols): Sticky announcements panel on desktop */}
        <div className="lg:col-span-4 lg:sticky lg:top-24">
          <div className="bg-card border border-primary/20 rounded-3xl p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/40 flex flex-col max-h-[500px]">
            <h3 className="text-sm font-bold text-primary flex items-center space-x-2 mb-4">
              <Volume2 className="w-4.5 h-4.5 text-primary animate-glow rounded-full shrink-0" />
              <span className="text-primary font-extrabold uppercase text-xs tracking-wider">Critical Announcements</span>
            </h3>
            
            <div className="overflow-y-auto divide-y divide-border/60 pr-1 no-scrollbar flex-1 space-y-4">
              {announcements.length > 0 ? (
                announcements.map(m => {
                  const posterName = getPosterName(m.postedBy);
                  return (
                    <div key={m.id} className="pt-3.5 first:pt-0 text-xs">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-foreground">{posterName}</p>
                        <span className="text-[9px] text-muted-foreground">
                          {m.createdAt ? new Date(m.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Just now'}
                        </span>
                      </div>
                      <p className="text-[11px] text-foreground mt-1.5 leading-relaxed bg-primary/5 dark:bg-primary/10 p-2.5 rounded-xl border border-primary/10 italic">
                        &ldquo;{m.messageText}&rdquo;
                      </p>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-muted-foreground py-6 text-center">No critical announcements posted yet.</p>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Announcement Broadcast Modal Overlay Warning */}
      {showAnnouncementWarning && (
        <div className="fixed inset-0 bg-background/80 glass z-[100] flex items-center justify-center p-4">
          <div className="bg-card border border-primary/30 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-2 text-primary">
              <AlertTriangle className="w-6 h-6 animate-bounce" />
              <h3 className="text-base font-bold text-foreground">Broadcast Announcement?</h3>
            </div>
            
            <p className="text-xs text-muted-foreground leading-relaxed">
              Announcements will broadcast to **all members** of the meetup. Please reserve announcements for critical updates (e.g. location shifts, timings, emergency notices).
            </p>

            <div className="p-3 bg-primary/5 border border-primary/10 rounded-2xl text-[11px] text-primary leading-normal italic">
              &ldquo;{messageText}&rdquo;
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setShowAnnouncementWarning(false)}
                className="flex-1 py-2 border border-border hover:bg-muted text-xs font-bold rounded-xl text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitMessage}
                className="flex-1 py-2 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-xl shadow-md transition-colors"
              >
                Yes, Broadcast
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const MessagesPage: React.FC = () => (
  <ProtectedRoute>
    <MessagesPageContent />
  </ProtectedRoute>
);

export default MessagesPage;
