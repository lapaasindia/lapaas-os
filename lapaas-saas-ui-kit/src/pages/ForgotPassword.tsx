import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { validateEmail } from '../utils/validation';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset email');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dark">
      <div className="min-h-screen bg-gradient-to-br from-gray-950 to-gray-900 transition-colors duration-300">
        {/* Header */}
        <header className="border-b border-gray-800 bg-gray-900 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <div className="text-2xl font-bold text-indigo-400">L</div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
          <div className="w-full max-w-md">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
              {/* Back Button */}
              <Link
                to="/login"
                className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:underline mb-6"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Login
              </Link>

              {/* Icon */}
              <div className="flex justify-center mb-6">
                {success ? (
                  <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-400" />
                ) : (
                  <Mail className="h-16 w-16 text-indigo-600 dark:text-indigo-400" />
                )}
              </div>

              {/* Title */}
              <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
                {success ? 'Check Your Email' : 'Reset Your Password'}
              </h1>

              {/* Description */}
              <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
                {success
                  ? "We've sent a password reset link to your email. Check your inbox and follow the instructions."
                  : "Enter your email address and we'll send you a link to reset your password."}
              </p>

              {!success && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Error Alert */}
                  {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start">
                      <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                      <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
                    </div>
                  )}

                  {/* Email Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-medium py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </form>
              )}

              {success && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Didn't receive the email? Check your spam folder or{' '}
                    <button
                      onClick={() => {
                        setSuccess(false);
                        setEmail('');
                      }}
                      className="text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      try again
                    </button>
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
