import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import EventCard from '../components/EventCard';
import { CATEGORIES } from '../constants';
import CategoryIcon from '../components/CategoryIcon';
import { UserContext } from '../UserContext';

export default function BrowseEvents() {
  const { user } = useContext(UserContext);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: 'all',
    search: '',
    sort: 'date',
    status: 'all'
  });

  useEffect(() => {
    fetchEvents();
  }, [filters]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.category !== 'all') {
        params.append('category', filters.category);
      }
      if (filters.search) {
        params.append('search', filters.search);
      }
      params.append('sort', filters.sort);

      const response = await axios.get(`/api/events?${params.toString()}`);
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search events..."
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
            </div>
            <div className="flex gap-4">
              <select
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              >
                <option value="all">All Categories</option>
                {Object.values(CATEGORIES).map(category => (
                  <option key={category} value={category} className="capitalize">
                    {category}
                  </option>
                ))}
              </select>
              <select
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="all">All Status</option>
                <option value="upcoming">Upcoming</option>
                <option value="past">Past</option>
              </select>
              <select
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                value={filters.sort}
                onChange={(e) => setFilters(prev => ({ ...prev, sort: e.target.value }))}
              >
                <option value="date">Date</option>
                <option value="popularity">Popularity</option>
                <option value="price">Price</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
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
        ) : error ? (
          <div className="text-center py-12 text-red-600">{error}</div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-900">No events found</h3>
            <p className="text-gray-500 mt-2">Try adjusting your filters</p>
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
  );
}