import React from 'react';
import { ArrowLeft, Shield, Lock, FileText, CheckCircle2, Mail, ExternalLink } from 'lucide-react';
import { TaktLogo } from '../brand/TaktLogo';

export default function PrivacyPolicy({ onBack }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-800 dark:text-[#ededed] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-[#121214] border border-slate-200 dark:border-[#222225] rounded-3xl p-6 sm:p-12 shadow-xl">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#222225] pb-6 mb-8">
          <a
            href="/"
            onClick={(e) => {
              if (onBack) {
                e.preventDefault();
                onBack();
              }
            }}
            className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-[#a1a1aa] hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Takt Homepage</span>
          </a>
          <TaktLogo className="h-7 w-auto" href="/" />
        </div>

        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-rose-50 dark:bg-[#2a1215] text-rose-600 dark:text-rose-400">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Privacy Policy
          </h1>
        </div>

        <div className="flex flex-wrap gap-2 text-[11px] font-semibold text-slate-500 dark:text-[#a1a1aa] mb-8">
          <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#1c1c20] border border-slate-200 dark:border-[#28282e]">App: Takt</span>
          <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#1c1c20] border border-slate-200 dark:border-[#28282e]">Domain: https://takt.harisarshad.site/</span>
          <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#1c1c20] border border-slate-200 dark:border-[#28282e]">Developer: Haris Arshad</span>
          <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#1c1c20] border border-slate-200 dark:border-[#28282e]">Effective: October 13, 2026</span>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none text-sm space-y-6 text-slate-600 dark:text-[#a1a1aa] leading-relaxed">
          <p>
            This Privacy Policy applies to the <strong className="text-slate-900 dark:text-white">Takt</strong> web application accessible at{' '}
            <a href="https://takt.harisarshad.site/" className="text-rose-600 dark:text-rose-400 underline font-medium">https://takt.harisarshad.site/</a>, developed, owned, and maintained by <strong className="text-slate-900 dark:text-white">Haris Arshad</strong>.
          </p>
          <p>
            Takt is a high-velocity personal and team task command center, Kanban cadence workspace, daily planner, and Pomodoro focus manager. This policy provides a comprehensive, transparent explanation of how our application accesses, collects, uses, stores, protects, and discloses user information, with specific focus on data obtained via <strong>Google Identity Services (Google OAuth 2.0)</strong>.
          </p>

          <h2 className="text-lg font-bold text-slate-900 dark:text-white pt-4 border-t border-slate-100 dark:border-[#222225]">
            1. What Data We Access &amp; Collect
          </h2>
          <p>We adhere to strict data minimization. We only collect data essential for providing task management and cross-device sync:</p>

          <div className="overflow-x-auto my-3">
            <table className="w-full text-left text-xs border border-slate-200 dark:border-[#28282e] rounded-xl overflow-hidden">
              <thead className="bg-slate-100 dark:bg-[#1c1c20] text-slate-800 dark:text-slate-200 font-bold">
                <tr>
                  <th className="p-3 border-b border-slate-200 dark:border-[#28282e]">OAuth Scope</th>
                  <th className="p-3 border-b border-slate-200 dark:border-[#28282e]">Data Received</th>
                  <th className="p-3 border-b border-slate-200 dark:border-[#28282e]">Specific Purpose</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-[#28282e]">
                <tr>
                  <td className="p-3 font-mono">openid</td>
                  <td className="p-3">Unique Google User ID</td>
                  <td className="p-3">To establish a secure, unique database key to isolate your workspace records.</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono">.../userinfo.email</td>
                  <td className="p-3">Email Address</td>
                  <td className="p-3">To identify your account, send security notices, and prevent duplicate accounts.</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono">.../userinfo.profile</td>
                  <td className="p-3">Display Name &amp; Profile Picture</td>
                  <td className="p-3">To display your name in the workspace header and your avatar on comments and task activities.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p>
            <strong>Zero Access to Sensitive Scopes:</strong> Takt does <strong>NOT</strong> request, access, read, or store any sensitive or restricted Google user data such as Google Drive files, Gmail messages, Google Calendar entries, contacts, browsing history, or payment credentials.
          </p>

          <h2 className="text-lg font-bold text-slate-900 dark:text-white pt-4 border-t border-slate-100 dark:border-[#222225]">
            2. Purpose Specification: How We Use Your Data
          </h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Authentication &amp; Account Access:</strong> To verify your identity, maintain your authenticated session, and grant access to your private workspace.</li>
            <li><strong>Cross-Device Task Synchronization:</strong> To sync your tasks, ETAs, deadlines, and comments in real-time across multiple computers and browsers using Supabase PostgreSQL.</li>
            <li><strong>Row-Level Security Enforcement:</strong> To cryptographically restrict database access so that only your authenticated Google user ID (<code>auth.uid() = user_id</code>) can query, update, or delete your tasks.</li>
          </ul>

          <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-[#1f1519] border border-rose-200/80 dark:border-rose-900/40 text-xs text-rose-900 dark:text-rose-200 space-y-2">
            <strong className="font-bold text-sm block">Mandatory Google Limited Use Compliance:</strong>
            <p>
              Takt’s use and transfer to any other app of information received from Google APIs will adhere to the{' '}
              <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="underline font-semibold">
                Google API Services User Data Policy
              </a>
              , including the <strong>Limited Use</strong> requirements.
            </p>
            <ul className="list-disc pl-4 space-y-1">
              <li>We do <strong>NOT</strong> use Google user data to serve advertisements or retarget users.</li>
              <li>We do <strong>NOT</strong> sell, rent, or monetize Google user data to third parties, data brokers, or marketing exchanges.</li>
              <li>We do <strong>NOT</strong> use Google user data to train generalized machine learning or artificial intelligence models.</li>
            </ul>
          </div>

          <h2 className="text-lg font-bold text-slate-900 dark:text-white pt-4 border-t border-slate-100 dark:border-[#222225]">
            3. Third-Party Infrastructure Providers
          </h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Google LLC (Google Identity Services):</strong> OAuth 2.0 authentication infrastructure.</li>
            <li><strong>Supabase Inc.:</strong> Cloud database with encrypted connections (SSL/TLS) and PostgreSQL Row-Level Security.</li>
            <li><strong>Cloudflare Inc.:</strong> DDoS protection, global CDN caching, and secure SSL/TLS termination.</li>
          </ul>

          <h2 className="text-lg font-bold text-slate-900 dark:text-white pt-4 border-t border-slate-100 dark:border-[#222225]">
            4. User Rights &amp; How to Delete Your Data
          </h2>
          <p>You maintain complete ownership and control over your data:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>In-App Task Deletion:</strong> You can delete any task, note, or comment at any time using the delete button inside the app interface.
            </li>
            <li>
              <strong>Permanent Account &amp; Data Deletion Request:</strong> Send an email from your registered address to{' '}
              <a href="mailto:harisengr73@gmail.com" className="text-rose-600 dark:text-rose-400 font-bold underline">harisengr73@gmail.com</a> with the subject <em>&ldquo;Takt Data Deletion Request&rdquo;</em>. All your tasks, notes, comments, and authentication records will be permanently purged within <strong>7 business days</strong>.
            </li>
            <li>
              <strong>Revoke Google Access:</strong> You can disconnect Takt at any time from your{' '}
              <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" className="text-rose-600 dark:text-rose-400 underline">Google Account Permissions</a>.
            </li>
          </ul>

          <h2 className="text-lg font-bold text-slate-900 dark:text-white pt-4 border-t border-slate-100 dark:border-[#222225]">
            5. Contact Information
          </h2>
          <ul className="list-none space-y-1 pl-0">
            <li><strong>Application:</strong> Takt (<a href="https://takt.harisarshad.site/" className="underline">https://takt.harisarshad.site/</a>)</li>
            <li><strong>Developer:</strong> Haris Arshad</li>
            <li><strong>Contact Email:</strong> <a href="mailto:harisengr73@gmail.com" className="text-rose-600 dark:text-rose-400 underline font-semibold">harisengr73@gmail.com</a></li>
          </ul>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-100 dark:border-[#222225] flex items-center justify-between text-xs text-slate-400">
          <div>&copy; {new Date().getFullYear()} Takt by Haris Arshad. All rights reserved.</div>
          <div className="flex gap-4">
            <a href="/terms" className="hover:text-slate-600 dark:hover:text-white transition-colors">Terms of Service</a>
            <a href="https://takt.harisarshad.site/" className="hover:text-slate-600 dark:hover:text-white transition-colors">Home</a>
          </div>
        </div>
      </div>
    </div>
  );
}
