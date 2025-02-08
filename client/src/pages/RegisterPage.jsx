/* eslint-disable no-empty */
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import FormInput from '../components/common/FormInput';
import Button from '../components/common/Button';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  async function registerUser(ev) {
    ev.preventDefault();
    setLoading(true);
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await axios.post('/api/users/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      navigate('/login');
    } catch (e) {
      setError(e.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-sm">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:text-primary-dark font-medium">
              Sign in
            </Link>
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={registerUser}>
          <FormInput
            label="Full Name"
            name="name"
            type="text"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <FormInput
            label="Email address"
            name="email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <FormInput
            label="Password"
            name="password"
            type="password"
            placeholder="Create a password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <FormInput
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create account'}
          </Button>

          <p className="text-xs text-center text-gray-600">
            By signing up, you agree to our{' '}
            <Link to="/terms" className="text-primary hover:text-primary-dark">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-primary hover:text-primary-dark">
              Privacy Policy
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
