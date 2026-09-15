import React, { useState } from 'react';
import { X, Mail, Lock, Eye, EyeOff, CheckCircle2, ArrowRight, KeyRound, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { authService } from '../../services/authService';

export function ForgotPasswordModal({ isOpen, onClose, initialEmail = '', onPasswordResetSuccess }) {
  const [step, setStep] = useState(1); // 1: Email, 2: New Password, 3: Success
  const [email, setEmail] = useState(initialEmail);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Sync initial email when modal opens
  React.useEffect(() => {
    if (isOpen) {
      if (initialEmail) setEmail(initialEmail);
      setStep(1);
      setError('');
      setSuccessMsg('');
      setNewPassword('');
      setConfirmPassword('');
    }
  }, [isOpen, initialEmail]);

  if (!isOpen) return null;

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your work email address.');
      return;
    }
    try {
      setIsLoading(true);
      setError('');
      await authService.forgotPassword(email.trim());
      setSuccessMsg(`Account verified for ${email.trim()}. Enter your new password below.`);
      setStep(2);
    } catch (err) {
      setError(err.message || 'No registered recruiter account found with this email.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword.trim() || !confirmPassword.trim()) {
      setError('Please fill in both password fields.');
      return;
    }
    if (newPassword.trim().length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword.trim() !== confirmPassword.trim()) {
      setError('Passwords do not match. Please re-check.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      await authService.resetPassword(email.trim(), newPassword.trim());
      setStep(3);
    } catch (err) {
      setError(err.message || 'Failed to update password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinish = () => {
    if (onPasswordResetSuccess) {
      onPasswordResetSuccess(email.trim(), newPassword.trim());
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden transition-all transform"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {step === 1 && 'Forgot Password'}
                {step === 2 && 'Set New Password'}
                {step === 3 && 'Password Reset Complete'}
              </h3>
              <p className="text-xs text-slate-500">
                {step === 1 && 'Verify your registered recruiter email'}
                {step === 2 && 'Create a strong new password for your account'}
                {step === 3 && 'Your password has been securely updated'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700 font-medium">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleVerifyEmail} className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Enter your work email address to reset your password and regain access to HireSense.
              </p>

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
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="block w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="w-1/2 justify-center"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isLoading}
                  className="w-1/2 justify-center"
                >
                  {isLoading ? 'Checking...' : 'Continue'}
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              {successMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2 text-xs text-emerald-800 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{successMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoFocus
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
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

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-type new password"
                    className="block w-full rounded-lg border border-slate-300 pl-9 pr-10 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="w-1/2 justify-center"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isLoading}
                  className="w-1/2 justify-center"
                >
                  {isLoading ? 'Updating...' : 'Save Password'}
                </Button>
              </div>
            </form>
          )}

          {step === 3 && (
            <div className="text-center py-3 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Password Reset Successful!
                </h4>
                <p className="text-xs text-slate-600 mt-1 max-w-xs mx-auto">
                  Your password for <strong className="text-slate-800">{email}</strong> has been updated. You can now sign in immediately.
                </p>
              </div>

              <Button
                variant="primary"
                onClick={handleFinish}
                className="w-full justify-center py-2.5 shadow-sm"
              >
                Sign In With New Password
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
