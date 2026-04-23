import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';

export default function VerifyEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [verified, setVerified] = useState(false);

  const email = searchParams.get('email') || '';

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!code.trim()) {
      setError('Please enter the verification code');
      return;
    }

    try {
      setLoading(true);
      // TODO: Call verification API endpoint
      setMessage('Email verified successfully!');
      setVerified(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setLoading(true);
      // TODO: Call resend verification API endpoint
      setMessage('Verification code sent to your email');
    } catch (err: any) {
      setError(err.message || 'Failed to resend code');
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
              {/* Icon */}
              <div className="flex justify-center mb-6">
                {verified ? (
                  <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-400" />
                ) : (
                  <Mail className="h-16 w-16 text-indigo-600 dark:text-indigo-400" />
                )}
              </div>

              {/* Title */}
              <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
                {verified ? 'Email Verified' : 'Verify Your Email'}
              </h1>

              {/* Description */}
              <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
                {verified
                  ? 'Your email has been verified successfully. Redirecting to login...'
                  : `We've sent a verification code to ${email}`}
              </p>

              {!verified && (
                <form onSubmit={handleVerify} className="space-y-4">
                  {/* Error Alert */}
                  {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start">
                      <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                      <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
                    </div>
                  )}

                  {/* Success Alert */}
                  {message && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 mr-3 flex-shrink-0" />
                      <p className="text-sm text-green-700 dark:text-green-200">{message}</p>
                    </div>
                  )}

                  {/* Code Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Verification Code
                    </label>
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                    />
                  </div>

                  {/* Verify Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-medium py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Verifying...' : 'Verify Email'}
                  </button>

                  {/* Resend Link */}
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Didn't receive the code?{' '}
                      <button
                        type="button"
                        onClick={handleResend}
                        disabled={loading}
                        className="text-indigo-600 dark:text-indigo-400 hover:underline disabled:opacity-50"
                      >
                        Resend
                      </button>
                    </p>
                  </div>
                </form>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
