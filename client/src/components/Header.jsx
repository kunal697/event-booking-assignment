import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { UserContext } from '../UserContext';

export default function Header() {
  const { user } = useContext(UserContext);

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <svg className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16.5 6a3 3 0 00-3-3H6a3 3 0 00-3 3v7.5a3 3 0 003 3v-6A4.5 4.5 0 0110.5 6h6z" />
              <path d="M18 7.5a3 3 0 013 3V18a3 3 0 01-3 3h-7.5a3 3 0 01-3-3v-7.5a3 3 0 013-3H18z" />
            </svg>
            <span className="text-xl font-bold text-gray-900">EventBro</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-10 text-lg font-semibold ">
            <Link to="/" className="text-gray-600 hover:bg-gray-200 rounded-xl p-2 hover:text-primary">Home</Link>
            <Link to="/events" className="text-gray-600 hover:bg-gray-200 rounded-xl  p-2 hover:text-primary">Events</Link>
          </nav>

          {/* User Actions */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link 
                  to="/create-event"
                  className="hidden md:flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Create Event</span>
                </Link>
                <Link to="/tickets" className="text-gray-600 hover:text-primary">
                  My Tickets
                </Link>
                <Link 
                  to="/my-events" 
                  className="text-gray-600 hover:text-primary"
                >
                  My Events
                </Link>
                <div className="relative group">
                  <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50">
                    <div className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium">{user.name[0].toUpperCase()}</span>
                    </div>
                    <span className="hidden md:block text-gray-700">{user.name}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 hidden group-hover:block">
                    <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Profile</Link>
                    <Link to="/my-events" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">My Events</Link>
                    <Link to="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Settings</Link>
                    <hr className="my-1" />
                    <Link to="/logout" className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50">Logout</Link>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-gray-700 hover:text-primary"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="hidden md:block px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 