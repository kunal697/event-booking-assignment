/* eslint-disable react/jsx-key */
import axios from "axios";
import { useEffect, useState, useContext } from "react"
import { Link } from "react-router-dom";
import { BsArrowRightShort } from "react-icons/bs";
import { BiLike } from "react-icons/bi";
import { UserContext } from "../UserContext";
import { format } from 'date-fns';
import EventCard from "../components/EventCard";
import { CATEGORIES } from '../constants';
import CategoryIcon from '../components/CategoryIcon';

export default function IndexPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(UserContext);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchEvents();
  }, [selectedCategory]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      params.append('sort', '-createdAt'); // Default sort by newest

      const response = await axios.get(`/api/events?${params.toString()}`);
      setEvents(response.data);
    } catch (error) {
      setError("Failed to fetch events");
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = selectedCategory === 'all' 
    ? events 
    : events.filter(event => event.category === selectedCategory);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  if (loading) {
    return <div className="text-center py-8">Loading events...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary to-primary-dark relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
        <div className="max-w-7xl mx-auto px-4 py-16 sm:py-24 relative">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
              Discover Amazing Events
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-100">
              Find and book tickets for concerts, sports events, theater shows, and more.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Link 
                to="/events" 
                className="px-8 py-3 bg-white text-primary font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Browse Events
              </Link>
              <Link 
                to="/create-event" 
                className="px-8 py-3 bg-primary-dark/20 text-white font-medium rounded-lg hover:bg-primary-dark/30 transition-colors border border-white/20"
              >
                Create Event
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Category filters */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <button
              onClick={() => handleCategorySelect('all')}
              className={`p-6 rounded-xl text-center transition-all group ${
                selectedCategory === 'all' 
                  ? 'bg-gradient-to-br from-primary to-primary-dark text-white shadow-lg shadow-primary/30'
                  : 'bg-white hover:bg-gray-50 text-gray-700 shadow-sm'
              }`}
            >
              <div className="flex flex-col items-center gap-3">
                <div className={`p-3 rounded-full ${
                  selectedCategory === 'all'
                    ? 'bg-white/10'
                    : 'bg-primary/5 group-hover:bg-primary/10'
                }`}>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </div>
                <span className="font-medium">All Events</span>
              </div>
            </button>
            {Object.values(CATEGORIES).map(category => (
              <button
                key={category}
                onClick={() => handleCategorySelect(category)}
                className={`p-6 rounded-xl text-center transition-all group ${
                  selectedCategory === category 
                    ? 'bg-gradient-to-br from-primary to-primary-dark text-white shadow-lg shadow-primary/30'
                    : 'bg-white hover:bg-gray-50 text-gray-700 shadow-sm'
                }`}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className={`p-3 rounded-full ${
                    selectedCategory === category
                      ? 'bg-white/10'
                      : 'bg-primary/5 group-hover:bg-primary/10'
                  }`}>
                    <CategoryIcon 
                      category={category} 
                      gradient={selectedCategory === category}
                    />
                  </div>
                  <span className="font-medium capitalize">{category}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Events Section */}
        <div>
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedCategory === 'all' ? 'All Events' : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Events`}
              </h2>
              <p className="text-gray-600 mt-1">
                {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'} available
              </p>
            </div>
          </div>

          {/* Events grid */}
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 rounded-xl aspect-[4/3] mb-4"></div>
                  <div className="bg-gray-200 h-4 rounded mb-2"></div>
                  <div className="bg-gray-200 h-4 w-2/3 rounded"></div>
                </div>
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
              <div className="w-24 h-24 mx-auto mb-6 text-gray-300">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">No events found</h3>
              <p className="text-gray-500 mt-2">
                {selectedCategory === 'all' 
                  ? 'Check back later for new events' 
                  : `No ${selectedCategory} events available right now`}
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredEvents.map(event => (
                <EventCard 
                  key={event._id} 
                  event={event}
                  user={user}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
  