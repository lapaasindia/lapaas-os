import React, { useState } from 'react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';

interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface RegisterResponse {
  success: boolean;
  data: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    createdAt: string;
  };
}

export const Register: React.FC = () => {
  const [formData, setFormData] = useState<RegisterFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFirstNameChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      firstName: value,
    }));
  };

  const handleLastNameChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      lastName: value,
    }));
  };

  const handleEmailChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      email: value,
    }));
  };

  const handlePasswordChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      password: value,
    }));
  };

  const handleConfirmPasswordChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      confirmPassword: value,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.firstName.trim()) {
      setError('First name is required');
      return false;
    }
    if (!formData.lastName.trim()) {
      setError('Last name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data: RegisterResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.data?.email || 'Registration failed');
      }

      setSuccess(true);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
      });

      // Redirect to login
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4 transition-colors duration-300">

      <Card className="w-full max-w-md shadow-lg">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Account</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Join Lapaas OS today</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-800 dark:text-red-400 font-medium">Registration Failed</p>
              <p className="text-red-700 dark:text-red-300 text-sm mt-1">{error}</p>
            </div>
          )}

          {/* Success Alert */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-green-800 dark:text-green-400 font-medium">Registration Successful</p>
              <p className="text-green-700 dark:text-green-300 text-sm mt-1">Redirecting to login...</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* First Name */}
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                First Name
              </label>
              <Input
                id="firstName"
                type="text"
                placeholder="John"
                value={formData.firstName}
                onChange={handleFirstNameChange}
                disabled={loading}
              />
            </div>

            {/* Last Name */}
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Last Name
              </label>
              <Input
                id="lastName"
                type="text"
                placeholder="Doe"
                value={formData.lastName}
                onChange={handleLastNameChange}
                disabled={loading}
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleEmailChange}
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handlePasswordChange}
                disabled={loading}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">At least 8 characters</p>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleConfirmPasswordChange}
                disabled={loading}
              />
            </div>

            {/* Terms */}
            <div className="flex items-start">
              <input
                type="checkbox"
                className="w-4 h-4 text-indigo-600 border-gray-300 dark:border-gray-600 rounded mt-1"
                defaultChecked
              />
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                I agree to the{' '}
                <a href="#" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium">
                  Privacy Policy
                </a>
              </span>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={loading}
              className="mt-6"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-800 text-gray-400">Or continue with</span>
            </div>
          </div>

          {/* Social Login */}
          <div>
            <Button variant="secondary" fullWidth disabled={loading}>
              Continue with Google
            </Button>
          </div>

          {/* Sign In Link */}
          <p className="text-center text-gray-600 dark:text-gray-400 text-sm mt-6">
            Already have an account?{' '}
            <a href="/login" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium">
              Sign in
            </a>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Register;
