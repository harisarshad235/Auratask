import React, { useState, useEffect } from 'react';
import {
  X, Lock, KeyRound, Eye, EyeOff, Check, AlertCircle, CheckCircle2,
  RefreshCw, Mail, ShieldCheck, ArrowRight
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import { sanitizeString } from '../utils/security';

export default function ChangePasswordModal({
  isOpen,
  onClose,
  session,
  showToast
}) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetEmailLoading, setResetEmailLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const userEmail = session?.user?.email || '';

  // Reset form on open/close
  useEffect(() => {
    if (isOpen) {
      setNewPassword('');
      setConfirmPassword('');
      setErrorMsg(null);
      setSuccessMsg(null);
      setLoading(false);
      setResetEmailLoading(false);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Validation rules
  const hasMinLength = newPassword.length >= 8;
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const isFormValid = hasMinLength && passwordsMatch;

  // Handle in-app password update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!hasMinLength) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }

    if (!passwordsMatch) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setSuccessMsg('Your password has been changed successfully!');
      if (showToast) {
        showToast('Password updated successfully!');
      }

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Password update error:', err);
      setErrorMsg(err.message || 'Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle send password reset email
  const handleSendResetEmail = async () => {
    if (!userEmail) {
      setErrorMsg('No email address found for this account.');
      return;
    }

    setResetEmailLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const cleanEmail = sanitizeString(userEmail, 254).toLowerCase();
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: `${window.location.origin}/`
      });

      if (error) throw error;

      setSuccessMsg(`A secure password reset email has been sent to ${userEmail}. Please check your inbox.`);
      if (showToast) {
        showToast('Password reset link sent to your email');
      }
    } catch (err) {
      console.error('Send reset email error:', err);
      setErrorMsg(err.message || 'Failed to send password reset email.');
    } finally {
      setResetEmailLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-[#121622] border border-slate-200 dark:border-white/[0.12] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* --- HEADER --- */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200/60 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-xs">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white leading-tight">
                Change Password
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 truncate max-w-[220px] sm:max-w-[280px]">
                {userEmail || 'Account Security Settings'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* --- FORM BODY --- */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Alerts */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400 text-xs flex items-start gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{successMsg}</span>
            </div>
          )}

          {/* New Password Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
              New Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400 dark:text-zinc-500" />
              <input
                type={showNewPassword ? 'text' : 'password'}
                required
                minLength={8}
                placeholder="At least 8 characters..."
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoFocus
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-[#090b11] border border-slate-200 dark:border-white/[0.1] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 font-medium transition-all"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-3 text-slate-400 dark:text-zinc-400 hover:text-slate-600 dark:hover:text-white"
                title={showNewPassword ? 'Hide password' : 'Show password'}
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm New Password Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400 dark:text-zinc-500" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                minLength={8}
                placeholder="Re-enter your new password..."
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-[#090b11] border border-slate-200 dark:border-white/[0.1] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 font-medium transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3 text-slate-400 dark:text-zinc-400 hover:text-slate-600 dark:hover:text-white"
                title={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Password Requirements Micro-Checklist */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/[0.06] space-y-1.5 text-[11px]">
            <div className={`flex items-center gap-2 ${hasMinLength ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-500 dark:text-zinc-400'}`}>
              <Check className={`w-3.5 h-3.5 ${hasMinLength ? 'stroke-[3]' : 'opacity-40'}`} />
              <span>Minimum 8 characters</span>
            </div>
            <div className={`flex items-center gap-2 ${passwordsMatch ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-500 dark:text-zinc-400'}`}>
              <Check className={`w-3.5 h-3.5 ${passwordsMatch ? 'stroke-[3]' : 'opacity-40'}`} />
              <span>Passwords match</span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !isFormValid}
            className="w-full py-3 bg-gradient-to-r from-rose-600 via-rose-500 to-indigo-600 hover:opacity-95 active:scale-[0.99] text-white font-bold text-xs rounded-xl shadow-md shadow-rose-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Update Password</span>
              </>
            )}
          </button>
        </form>

        {/* --- FOOTER: OR SEND EMAIL RESET LINK --- */}
        <div className="px-6 py-4 bg-slate-50/70 dark:bg-[#0c0f17] border-t border-slate-100 dark:border-white/[0.08] flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-zinc-400">Prefer an email link?</span>
          <button
            type="button"
            onClick={handleSendResetEmail}
            disabled={resetEmailLoading}
            className="text-rose-600 dark:text-rose-400 font-bold hover:underline flex items-center gap-1 disabled:opacity-50"
          >
            {resetEmailLoading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <>
                <Mail className="w-3.5 h-3.5" />
                <span>Email me a reset link</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
