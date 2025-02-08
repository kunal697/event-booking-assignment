import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

export default function TicketPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await axios.get('/api/tickets/tickets');
      setTickets(response.data);
    } catch (error) {
      setError('Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelTicket = async (ticketId) => {
    try {
      await axios.post(`/api/tickets/${ticketId}/cancel`);
      fetchTickets(); // Refresh tickets after cancellation
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to cancel ticket');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading tickets...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Tickets</h1>

        {tickets.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <h3 className="text-xl font-medium text-gray-900 mb-2">No tickets found</h3>
            <p className="text-gray-600 mb-6">You haven't booked any tickets yet.</p>
            <Link 
              to="/events" 
              className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark"
            >
              Browse Events
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tickets.map(ticket => (
              <div key={ticket._id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <img 
                  src={ticket.event.image || '/default-event.jpg'} 
                  alt={ticket.event.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {ticket.event.title}
                  </h3>
                  <div className="space-y-2 text-gray-600 mb-6">
                    <p>
                      <span className="font-medium">Date:</span>{' '}
                      {format(new Date(ticket.event.eventDate), 'MMMM dd, yyyy')}
                    </p>
                    <p>
                      <span className="font-medium">Time:</span>{' '}
                      {ticket.event.eventTime}
                    </p>
                    <p>
                      <span className="font-medium">Location:</span>{' '}
                      {ticket.event.location}
                    </p>
                    <p>
                      <span className="font-medium">Ticket Number:</span>{' '}
                      {ticket.ticketNumber}
                    </p>
                  </div>

                  {ticket.status === 'active' && (
                    <button
                      onClick={() => handleCancelTicket(ticket._id)}
                      className="w-full px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                    >
                      Cancel Ticket
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
