import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../UserContext';
import FormInput from '../components/common/FormInput';
import Button from '../components/common/Button';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();

  async function handleLoginSubmit(ev) {
    ev.preventDefault();
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setError(null);
      setLoading(true);

      const { data } = await axios.post('/api/users/login', { 
        email, 
        password 
      });

      setUser(data);
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-sm">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Welcome back
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary hover:text-primary-dark font-medium">
              Sign up
            </Link>
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleLoginSubmit}>
          <FormInput
            label="Email address"
            type="email"
            value={email}
            onChange={ev => setEmail(ev.target.value)}
            disabled={loading}
            required
          />

          <FormInput
            label="Password"
            type="password"
            value={password}
            onChange={ev => setPassword(ev.target.value)}
            disabled={loading}
            required
          />

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
      </div>
    </div>
  );
}
