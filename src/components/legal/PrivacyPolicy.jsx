import React from 'react';
import { ArrowLeft, Shield, Lock, FileText, CheckCircle2 } from 'lucide-react';
import { TaktLogo } from '../brand/TaktLogo';

export default function PrivacyPolicy({ onBack }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-800 dark:text-[#ededed] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-[#121214] border border-slate-200 dark:border-[#222225] rounded-3xl p-6 sm:p-12 shadow-xl">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#222225] pb-6 mb-8">
          <a href="/" onClick={(e) => { if (onBack) { e.preventDefault(); onBack(); } }} className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-[#a1a1aa] hover:text-slate-900 dark:hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Takt</span>
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
        <p className="text-xs text-slate-400 dark:text-[#71717a] mb-8">
          Effective Date: October 13, 2026 &bull; Last Updated: October 13, 2026
        </p>

        <div className="prose prose-slate dark:prose-invert max-w-none text-sm space-y-6 text-slate-600 dark:text-[#a1a1aa] leading-relaxed">
          <p>
            Welcome to <strong className="text-slate-900 dark:text-white">Takt</strong> (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;), hosted at{' '}
            <a href="https://takt.harisarshad.site/" className="text-rose-600 dark:text-rose-400 underline font-medium">https://takt.harisarshad.site/</a>. Takt is a productivity and task execution workspace created and maintained by <strong className="text-slate-900 dark:text-white">Haris Arshad</strong>. We value your privacy and are committed to protecting your personal data.
          </p>

          <h2 className="text-lg font-bold text-slate-900 dark:text-white pt-4 border-t border-slate-100 dark:border-[#222225]">
            1. Information We Collect
          </h2>
          <p>We collect only the minimal data strictly necessary to operate the application:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <strong className="text-slate-800 dark:text-slate-200">Authentication &amp; Account Information:</strong> When you register or log in using Google OAuth 2.0 or email credentials, we receive your basic public profile information: Full Name, Email Address, Avatar Profile Picture, and a unique user identifier.
            </li>
            <li>
              <strong className="text-slate-800 dark:text-slate-200">User-Generated Workspace Data:</strong> Task titles, descriptions, due dates, ETAs, deadlines, priorities, tags, subtasks, personal scratchpad notes, and comments that you create.
            </li>
            <li>
              <strong className="text-slate-800 dark:text-slate-200">Local Preferences:</strong> Interface preferences like dark/light theme, view layouts (board/list), and temporary offline workspace data stored locally in your browser.
            </li>
          </ul>

          <h2 className="text-lg font-bold text-slate-900 dark:text-white pt-4 border-t border-slate-100 dark:border-[#222225]">
            2. How We Use Your Information
          </h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>To authenticate your identity and grant access to your private workspace.</li>
            <li>To store, synchronize, and display your tasks and comments across devices via real-time database updates.</li>
            <li>To enforce strict Row-Level Security (RLS) policies ensuring only you can access or modify your records.</li>
          </ul>

          <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-[#1f1519] border border-rose-200/80 dark:border-rose-900/40 text-xs text-rose-900 dark:text-rose-200">
            <strong className="font-bold">Google User Data Compliance (Limited Use Requirements):</strong> Takt’s use and transfer to any other app of information received from Google APIs adheres to the{' '}
            <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="underline font-semibold">
              Google API Services User Data Policy
            </a>
            , including the Limited Use requirements. We do <strong>NOT</strong> sell Google user data, share it with advertising networks, or use it to train generalized AI/ML models.
          </div>

          <h2 className="text-lg font-bold text-slate-900 dark:text-white pt-4 border-t border-slate-100 dark:border-[#222225]">
            3. Data Sharing &amp; Third Parties
          </h2>
          <p>
            We do not sell, rent, or trade your personal data. We utilize reputable infrastructure providers strictly for hosting and authentication:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Google Identity Services (OAuth 2.0):</strong> For secure single sign-on authentication.</li>
            <li><strong>Supabase:</strong> As our cloud PostgreSQL backend with encrypted connections (SSL/TLS) and Row-Level Security.</li>
          </ul>

          <h2 className="text-lg font-bold text-slate-900 dark:text-white pt-4 border-t border-slate-100 dark:border-[#222225]">
            4. User Rights &amp; Data Deletion
          </h2>
          <p>
            You have full control over your data. You may delete individual tasks or notes directly inside the application at any time.
          </p>
          <p>
            To request permanent deletion of your account and all associated cloud data, please email <a href="mailto:harisengr73@gmail.com" className="text-rose-600 dark:text-rose-400 underline font-medium">harisengr73@gmail.com</a>. All records will be permanently purged within 7 business days. You can also revoke Takt's access at any time via your <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" className="underline">Google Account Permissions</a>.
          </p>

          <h2 className="text-lg font-bold text-slate-900 dark:text-white pt-4 border-t border-slate-100 dark:border-[#222225]">
            5. Contact Information
          </h2>
          <p>For any questions or privacy inquiries:</p>
          <ul className="list-none space-y-1 pl-0">
            <li><strong>Developer:</strong> Haris Arshad</li>
            <li><strong>Application:</strong> Takt (<a href="https://takt.harisarshad.site/" className="underline">https://takt.harisarshad.site/</a>)</li>
            <li><strong>Email:</strong> <a href="mailto:harisengr73@gmail.com" className="text-rose-600 dark:text-rose-400 underline font-medium">harisengr73@gmail.com</a></li>
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
