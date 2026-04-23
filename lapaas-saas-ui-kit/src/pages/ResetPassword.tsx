import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, AlertCircle, CheckCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      setError('Invalid or missing reset token. Please request a new password reset link.');
    }
  }, [searchParams]);

  const validatePassword = () => {
    if (!newPassword) {
      setError('Password is required');
      return false;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validatePassword()) {
      return;
    }

    if (!token) {
      setError('Invalid reset token. Please request a new password reset link.');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/v1/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setSuccess(true);
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
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
                  <Lock className="h-16 w-16 text-indigo-600 dark:text-indigo-400" />
                )}
              </div>

              {/* Title */}
              <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
                {success ? 'Password Reset Successful' : 'Reset Your Password'}
              </h1>

              {/* Description */}
              <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
                {success
                  ? 'Your password has been reset successfully. Redirecting to login...'
                  : 'Enter your new password below.'}
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

                  {/* New Password Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password (min 8 characters)"
                        className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  {/* Password Requirements */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <p className="text-sm text-blue-700 dark:text-blue-200 font-medium mb-2">
                      Password Requirements:
                    </p>
                    <ul className="text-sm text-blue-600 dark:text-blue-300 space-y-1">
                      <li className="flex items-center">
                        <span className={newPassword.length >= 8 ? 'text-green-600 dark:text-green-400' : ''}>
                          • At least 8 characters
                        </span>
                      </li>
                      <li className="flex items-center">
                        <span className={newPassword === confirmPassword && newPassword ? 'text-green-600 dark:text-green-400' : ''}>
                          • Passwords match
                        </span>
                      </li>
                    </ul>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading || !token}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-medium py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Resetting Password...' : 'Reset Password'}
                  </button>
                </form>
              )}

              {success && (
                <div className="space-y-4">
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <p className="text-sm text-green-700 dark:text-green-200">
                      ✅ Your password has been reset successfully!
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-300 mt-2">
                      You will be redirected to the login page in a few seconds...
                    </p>
                  </div>
                  <Link
                    to="/login"
                    className="block w-full text-center bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-medium py-2 rounded-lg transition-colors"
                  >
                    Go to Login Now
                  </Link>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
