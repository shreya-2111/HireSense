import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useRecruitment } from '../context/RecruitmentContext';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useRecruitment();

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }
    setError('');
    login(email, password);
    navigate('/');
  };

  const handleDemoLogin = () => {
    login('sarah.lin@hiresense.internal', 'demo123');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans text-slate-800">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand Treatment */}
        <div className="inline-flex items-center gap-2.5 mb-2">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-sm">
            <span className="text-lg tracking-tight font-black">H</span>
          </div>
          <div className="text-left">
            <span className="text-xl font-bold text-slate-900 tracking-tight block leading-tight">HireSense</span>
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Recruitment Suite</span>
          </div>
        </div>
        <h2 className="mt-4 text-2xl font-bold text-slate-900 tracking-tight">
          Welcome back
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">
          Sign in to access your candidate pipelines and screening queues.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-2xl sm:px-10 space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="block w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
                <a href="#forgot" onClick={(e) => { e.preventDefault(); alert("In demo mode, please use 1-click Demo Login or any password."); }} className="text-xs text-blue-600 hover:underline">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full rounded-lg border border-slate-300 pl-9 pr-10 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-xs text-slate-600">
                Keep me signed in on this device
              </label>
            </div>

            <Button type="submit" variant="primary" className="w-full justify-center py-2.5">
              Sign In
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-400 font-semibold tracking-wider">
                Or Quick Test
              </span>
            </div>
          </div>

          {/* 1-Click Recruiter Demo Sign-in */}
          <Button
            type="button"
            variant="outline"
            onClick={handleDemoLogin}
            className="w-full justify-center py-2.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100"
          >
            <ShieldCheck className="w-4 h-4 text-blue-600 mr-2" />
            Sign in as Demo Recruiter (Sarah Lin)
          </Button>

          <p className="text-center text-xs text-slate-500 pt-2">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
