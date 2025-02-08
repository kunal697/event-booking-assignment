import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../UserContext';
import { format } from 'date-fns';

export default function MyEvents() {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [eventData, setEventData] = useState({
    events: [],
    stats: {
      total: 0,
      upcoming: 0,
      completed: 0,
      totalAttendees: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchEvents();
  }, [user, navigate]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/users/events');
      setEventData(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      await axios.delete(`/api/events/${eventId}`);
      await fetchEvents(); // Refresh the full list after deletion
    } catch (error) {
      alert('Failed to delete event');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Events</h1>
            <p className="text-gray-600 mt-1">
              Managing {eventData.stats.total} events ({eventData.stats.upcoming} upcoming)
            </p>
          </div>
          <Link
            to="/create-event"
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Create New Event
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-4xl font-bold text-primary mb-2">
              {eventData.stats.total}
            </div>
            <div className="text-gray-600">Total Events</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-4xl font-bold text-green-600 mb-2">
              {eventData.stats.upcoming}
            </div>
            <div className="text-gray-600">Upcoming Events</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {eventData.stats.completed}
            </div>
            <div className="text-gray-600">Past Events</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {eventData.stats.totalAttendees}
            </div>
            <div className="text-gray-600">Total Attendees</div>
          </div>
        </div>

        {error ? (
          <div className="text-center py-12 text-red-600">{error}</div>
        ) : eventData.events.length === 0 ? (
          <div className="text-center py-12">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No events created yet</h3>
            <p className="text-gray-500 mb-6">Get started by creating your first event</p>
            <Link
              to="/create-event"
              className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Event
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {eventData.events.map(event => (
              <div key={event._id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="relative h-48">
                  <img 
                    src={event.image || '/default-event.jpg'} 
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <div className="text-lg font-bold">{format(new Date(event.eventDate), 'MMM d, yyyy')}</div>
                    <div className="text-sm">{event.eventTime}</div>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      event.stats.status === 'completed'
                        ? 'bg-gray-100 text-gray-600'
                        : 'bg-green-100 text-green-600'
                    }`}>
                      {event.stats.status === 'completed' ? 'Past Event' : 'Upcoming'}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      event.stats.isFull
                        ? 'bg-red-100 text-red-600'
                        : 'bg-green-100 text-green-600'
                    }`}>
                      {event.stats.totalAttendees}/{event.maxAttendees} Attendees
                    </span>
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium capitalize">
                      {event.category}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
                  
                  <div className="flex items-center text-gray-600 mb-4">
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-sm">{event.location}</span>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      to={`/event/${event._id}`}
                      className="flex-1 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-center"
                    >
                      View Details
                    </Link>
                    <button
                      onClick={() => handleDeleteEvent(event._id)}
                      className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 