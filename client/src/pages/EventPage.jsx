import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { UserContext } from '../UserContext';
import CategoryIcon from '../components/CategoryIcon';

export default function EventPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [booking, setBooking] = useState(false);
  const [showAttendees, setShowAttendees] = useState(false);
  const [attendees, setAttendees] = useState([]);
  const [attendeeStats, setAttendeeStats] = useState(null);
  const [loadingAttendees, setLoadingAttendees] = useState(false);

  useEffect(() => {
    fetchEvent();
  }, [id]);

  useEffect(() => {
    if (event?._id) {
      fetchAttendees();
    }
  }, [event?._id]);

  const fetchEvent = async () => {
    try {
      const response = await axios.get(`/api/events/${id}`);
      setEvent(response.data);
      if (response.data._id) {
        const attendeesResponse = await axios.get(`/api/events/${response.data._id}/attendees`);
        setAttendees(attendeesResponse.data.attendees);
        setAttendeeStats(attendeesResponse.data.stats);
      }
    } catch (error) {
      setError('Failed to fetch event details');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendees = async () => {
    try {
      setLoadingAttendees(true);
      const response = await axios.get(`/api/events/${id}/attendees`);
      setAttendees(response.data.attendees);
      setAttendeeStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching attendees:', error);
    } finally {
      setLoadingAttendees(false);
    }
  };

  const handleBookTicket = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setBooking(true);
      await axios.post('/api/tickets/tickets', { 
        eventId: id 
      });
      await fetchAttendees(); // Refresh attendees after booking
      navigate('/tickets');
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to book ticket';
      alert(errorMessage);
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h2>
          <p className="text-gray-600">{error || 'Event not found'}</p>
        </div>
      </div>
    );
  }
  console.log(event.image);

  const isEventFull = event.currentAttendees >= event.maxAttendees;
  const isUserAttending = user && event.attendees?.some(
    attendee => attendee._id === user._id || attendee === user._id
  );
  const eventDate = new Date(event.eventDate);
  const isPastEvent = eventDate < new Date();
  const availableSpots = event.maxAttendees - event.currentAttendees;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
     
      <div className="relative h-96 bg-gray-900">
      <img 
<<<<<<< HEAD
     src={event.image || '/default-event.jpg'} 
=======
    src={event.image || '/default-event.jpg'} 
>>>>>>> 4820cad8332c1e09c527534e458f727880e89e12
    alt={event.title}
    className="w-full h-full max-h-96 object-contain"
  />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/75 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-white/10 text-white rounded-full text-sm font-medium backdrop-blur-sm capitalize">
                {event.category}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                isPastEvent ? 'bg-gray-100 text-gray-600' : 'bg-green-50 text-green-600'
              }`}>
                {isPastEvent ? 'Past Event' : 'Upcoming'}
              </span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">{event.title}</h1>
            <div className="flex items-center gap-4 text-white/80">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{format(eventDate, 'MMMM dd, yyyy')}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{event.eventTime}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2">
            {/* Event Stats Cards */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="text-4xl font-bold text-primary mb-2">
                  {attendeeStats?.current || 0}
                </div>
                <div className="text-gray-600">Current Attendees</div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {attendeeStats?.available || 0}
                </div>
                <div className="text-gray-600">Available Spots</div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {attendeeStats?.maximum || 0}
                </div>
                <div className="text-gray-600">Total Capacity</div>
              </div>
            </div>

            {/* About Section */}
            <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">About this event</h2>
              <p className="text-gray-600 whitespace-pre-wrap">{event.description}</p>
            </div>

            {/* Attendees Section */}
            <div className="bg-white rounded-xl shadow-sm p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Attendees</h2>
                <div className="flex items-center gap-2">
                  <div className="w-full bg-gray-200 rounded-full h-2 w-32">
                    <div 
                      className="bg-primary rounded-full h-2" 
                      style={{ 
                        width: `${((attendeeStats?.current || 0) / (attendeeStats?.maximum || 1)) * 100}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm text-gray-600">
                    {Math.round(((attendeeStats?.current || 0) / (attendeeStats?.maximum || 1)) * 100)}%
                  </span>
                </div>
              </div>

              {loadingAttendees ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
                </div>
              ) : attendees.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No attendees yet. Be the first to join!
                </div>
              ) : (
                <div className="space-y-4">
                  {attendees.map((attendee) => (
                    <div key={attendee.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-lg">
                        {attendee.name[0].toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{attendee.name}</h3>
                        <p className="text-sm text-gray-500">
                          Joined {format(new Date(attendee.joinedAt), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      {attendee.id === event.owner && (
                        <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
                          Organizer
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-2 text-gray-600">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{event.location}</span>
                </div>

                <div className="flex items-center gap-2 text-gray-600">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <div>
                    <span className="block">{availableSpots} spots left</span>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-primary rounded-full h-2" 
                        style={{ width: `${(event.currentAttendees / event.maxAttendees) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {event.owner && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Organized by {event.owner.name}</span>
                  </div>
                )}
              </div>

              <button
                onClick={handleBookTicket}
                disabled={!user || isEventFull || isUserAttending || booking || isPastEvent}
                className={`w-full py-3 rounded-lg font-medium ${
                  !user
                    ? 'bg-primary text-white hover:bg-primary-dark'
                    : isEventFull
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : isUserAttending
                        ? 'bg-green-50 text-green-600 cursor-not-allowed'
                        : isPastEvent
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-primary text-white hover:bg-primary-dark'
                }`}
              >
                {!user 
                  ? 'Login to Book' 
                  : isEventFull 
                    ? 'Event Full' 
                    : isUserAttending 
                      ? 'Already Attending' 
                      : isPastEvent
                        ? 'Event Ended'
                        : booking 
                          ? 'Booking...' 
                          : 'Book Now (Free)'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
