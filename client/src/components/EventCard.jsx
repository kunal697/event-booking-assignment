import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import CategoryIcon from './CategoryIcon';

export default function EventCard({ event, user }) {
  const navigate = useNavigate();
  const isEventFull = event.currentAttendees >= event.maxAttendees;
  const isUserAttending = user && event.attendees?.some(
    attendee => attendee._id === user._id || attendee === user._id
  );
  const eventDate = new Date(event.eventDate);
  const isPastEvent = eventDate < new Date();
  const availableSpots = event.maxAttendees - event.currentAttendees;

  const handleRegister = (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    navigate(`/event/${event._id}`);
  };

  return (
    <div className="group bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300">
      {/* Image Container */}
      <div className="relative h-48 overflow-hidden">
        <img 
           src={event.image || '/default-event.jpg'} 
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        
        {/* Event Status */}
        <div className="absolute top-4 left-4 flex gap-2">
          {isUserAttending && (
            <span className="px-3 py-1 bg-green-500 text-white text-sm font-medium rounded-full">
              Registered
            </span>
          )}
          {isEventFull && !isUserAttending && (
            <span className="px-3 py-1 bg-red-500 text-white text-sm font-medium rounded-full">
              Sold Out
            </span>
          )}
          {isPastEvent && (
            <span className="px-3 py-1 bg-gray-500 text-white text-sm font-medium rounded-full">
              Event Ended
            </span>
          )}
        </div>

        {/* Category */}
        <div className="absolute top-4 right-4">
          <div className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full flex items-center gap-2">
            <CategoryIcon category={event.category} className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium capitalize">{event.category}</span>
          </div>
        </div>

        {/* Date Badge */}
        <div className="absolute bottom-4 left-4 text-white">
          <div className="text-2xl font-bold">
            {format(eventDate, 'd')}
          </div>
          <div className="text-sm font-medium uppercase">
            {format(eventDate, 'MMM yyyy')}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
          {event.title}
        </h3>

        <div className="space-y-3 mb-4">
          <div className="flex items-center text-gray-600">
            <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm">{event.eventTime}</span>
          </div>

          <div className="flex items-center text-gray-600">
            <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-sm line-clamp-1">{event.location}</span>
          </div>

          {/* Capacity Indicator */}
          <div className="pt-2">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Capacity</span>
              <span className="font-medium text-gray-900">
                {event.currentAttendees}/{event.maxAttendees}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className={`h-1.5 rounded-full transition-all ${
                  isEventFull 
                    ? 'bg-red-500' 
                    : event.currentAttendees > (event.maxAttendees * 0.8) 
                      ? 'bg-yellow-500' 
                      : 'bg-green-500'
                }`}
                style={{ width: `${(event.currentAttendees / event.maxAttendees) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {event.attendees?.slice(0, 3).map((attendee, index) => (
                <div 
                  key={index}
                  className="w-8 h-8 rounded-full bg-gray-100 ring-2 ring-white flex items-center justify-center text-gray-600 text-sm font-medium"
                >
                  {typeof attendee === 'object' ? attendee.name[0].toUpperCase() : '?'}
                </div>
              ))}
            </div>
            {event.attendees?.length > 3 && (
              <span className="text-sm text-gray-500">
                +{event.attendees.length - 3} more
              </span>
            )}
          </div>

          <button
            onClick={handleRegister}
            disabled={isEventFull || isUserAttending || isPastEvent}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              isUserAttending
                ? 'bg-green-50 text-green-600'
                : isEventFull || isPastEvent
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-primary text-white hover:bg-primary-dark'
            }`}
          >
            {isUserAttending 
              ? 'Registered' 
              : isEventFull 
                ? 'Sold Out' 
                : isPastEvent 
                  ? 'Event Ended' 
                  : availableSpots <= 10 
                    ? `${availableSpots} spots left` 
                    : 'Register Now'}
          </button>
        </div>
      </div>
    </div>
  );
} 
