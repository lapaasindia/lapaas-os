import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle, CheckCircle, Eye, EyeOff, Rocket, Shield, Clock, Users } from 'lucide-react';
import { useUser } from '../contexts/UserContext';

interface LoginFormData {
  email: string;
  password: string;
}

export default function Login() {
  const navigate = useNavigate();
  const { login } = useUser();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(formData.email, formData.password);
      setSuccess(true);
      
      setTimeout(() => {
        navigate('/founder-os');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dark min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-900/20 via-emerald-900/10 to-slate-900 p-12 flex-col justify-between relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-72 h-72 bg-green-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-500 rounded-full blur-3xl"></div>
        </div>
        
        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">F</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Founder OS</h1>
              <p className="text-sm text-green-400">Your Productivity Command Center</p>
            </div>
          </div>
        </div>
        
        {/* Features */}
        <div className="relative z-10 space-y-8">
          <h2 className="text-3xl font-bold text-white leading-tight">
            Take Control of Your Week.<br/>
            <span className="text-green-400">Build What Matters.</span>
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-gray-300">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="font-medium text-white">Smart Time-Blocking</p>
                <p className="text-sm text-gray-400">Plan your week with intelligent scheduling</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-gray-300">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="font-medium text-white">Meeting OS</p>
                <p className="text-sm text-gray-400">Run effective meetings with agendas & decisions</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-gray-300">
              <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <p className="font-medium text-white">Interruption Firewall</p>
                <p className="text-sm text-gray-400">Protect your focus time from distractions</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="relative z-10">
          <p className="text-gray-500 text-sm">
            Trusted by founders and leaders worldwide
          </p>
        </div>
      </div>
      
      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">F</span>
              </div>
              <div className="text-left">
                <h1 className="text-xl font-bold text-white">Founder OS</h1>
                <p className="text-xs text-green-400">Productivity Command Center</p>
              </div>
            </div>
          </div>
          
          {/* Card */}
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
            {/* Header */}
            <div className="mb-8 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 mb-4 shadow-lg shadow-green-500/25">
                <Rocket className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
              <p className="text-gray-400">Sign in to your Founder OS account</p>
            </div>

            {/* Alerts */}
            {error && (
              <div className="flex items-center gap-3 p-4 mb-6 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-3 p-4 mb-6 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">Login successful! Redirecting...</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="email"
                    placeholder="you@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={loading}
                    required
                    className="w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    disabled={loading}
                    required
                    className="w-full pl-12 pr-12 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Remember me & Forgot password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    defaultChecked 
                    className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-green-500 focus:ring-green-500/50"
                  />
                  <span className="text-sm text-gray-400">Remember me</span>
                </label>
                <a href="/forgot-password" className="text-sm text-green-400 hover:text-green-300 transition-colors">
                  Forgot password?
                </a>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-xl shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all duration-200 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-slate-800/50 text-gray-500">or continue with</span>
              </div>
            </div>

            {/* Social Login */}
            <button 
              type="button"
              disabled={loading}
              className="w-full py-3 px-4 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 text-white font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            {/* Sign up link */}
            <p className="text-center text-gray-400 mt-6">
              Don't have an account?{' '}
              <a href="/register" className="text-green-400 hover:text-green-300 font-medium transition-colors">
                Sign up for free
              </a>
            </p>
          </div>
          
          {/* Demo Login */}
          <div className="mt-6 p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl">
            <p className="text-center text-gray-500 text-sm mb-3">Quick Demo Access</p>
            <button
              type="button"
              onClick={() => {
                setFormData({ email: 'admin@lapaas.com', password: 'LapaasAdmin@2025!Secure' });
              }}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 text-gray-300 text-sm font-medium rounded-lg transition-all duration-200"
            >
              🚀 Fill Demo Credentials
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
