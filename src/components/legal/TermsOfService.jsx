import React from 'react';
import { ArrowLeft, FileText, CheckCircle2 } from 'lucide-react';
import { TaktLogo } from '../brand/TaktLogo';

export default function TermsOfService({ onBack }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090b11] text-slate-800 dark:text-zinc-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-[#0e121b] border border-slate-200 dark:border-white/[0.1] rounded-3xl p-6 sm:p-12 shadow-xl">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.08] pb-6 mb-8">
          <a href="/" onClick={(e) => { if (onBack) { e.preventDefault(); onBack(); } }} className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Takt</span>
          </a>
          <TaktLogo className="h-7 w-auto" href="/" />
        </div>

        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-rose-50 dark:bg-[#2a1215] text-rose-600 dark:text-rose-400">
            <FileText className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Terms of Service
          </h1>
        </div>
        <p className="text-xs text-slate-400 dark:text-[#71717a] mb-8">
          Effective Date: October 13, 2026 &bull; Last Updated: October 13, 2026
        </p>

        <div className="prose prose-slate dark:prose-invert max-w-none text-sm space-y-6 text-slate-600 dark:text-[#a1a1aa] leading-relaxed">
          <p>
            Please read these Terms of Service (&ldquo;Terms&rdquo;) carefully before using the <strong className="text-slate-900 dark:text-white">Takt</strong> web application hosted at{' '}
            <a href="https://takt.harisarshad.site/" className="text-rose-600 dark:text-rose-400 underline font-medium">https://takt.harisarshad.site/</a> (&ldquo;Service&rdquo;), operated by <strong className="text-slate-900 dark:text-white">Haris Arshad</strong> (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;).
          </p>
          <p>
            By accessing or using Takt, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use the Service.
          </p>

          <h2 className="text-lg font-bold text-slate-900 dark:text-white pt-4 border-t border-slate-100 dark:border-[#222225]">
            1. Description of the Service
          </h2>
          <p>
            Takt is a personal productivity, task execution cadence, and focus workspace designed to assist users in tracking tasks, organizing workflows, managing Pomodoro sessions, and taking private meeting notes.
          </p>

          <h2 className="text-lg font-bold text-slate-900 dark:text-white pt-4 border-t border-slate-100 dark:border-[#222225]">
            2. User Accounts &amp; Authentication
          </h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>To synchronize data across multiple devices, you may register or log in using Google OAuth 2.0 or email credentials.</li>
            <li>You are responsible for safeguarding your account access and for all actions that occur under your account.</li>
            <li>You must provide accurate and lawful information when creating an account.</li>
          </ul>

          <h2 className="text-lg font-bold text-slate-900 dark:text-white pt-4 border-t border-slate-100 dark:border-[#222225]">
            3. Ownership of User Content
          </h2>
          <p>
            You retain 100% intellectual property ownership of all tasks, notes, comments, and data you create within Takt. We do not claim any rights over your content.
          </p>
          <p>
            We will never sell, analyze, or distribute your private tasks or notes to third-party marketing companies.
          </p>

          <h2 className="text-lg font-bold text-slate-900 dark:text-white pt-4 border-t border-slate-100 dark:border-[#222225]">
            4. Acceptable Use
          </h2>
          <p>You agree not to:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Interfere with or compromise the security or integrity of our servers or database infrastructure.</li>
            <li>Attempt to access another user's private data or circumvent Row-Level Security policies.</li>
            <li>Use the service for any unlawful purpose or in violation of applicable laws.</li>
          </ul>

          <h2 className="text-lg font-bold text-slate-900 dark:text-white pt-4 border-t border-slate-100 dark:border-[#222225]">
            5. Disclaimer &amp; Limitation of Liability
          </h2>
          <p>
            The Service is provided &ldquo;AS IS&rdquo; and &ldquo;AS AVAILABLE&rdquo; without warranties of any kind. Under no circumstances shall the developer or Takt be liable for any indirect, incidental, or consequential damages resulting from data loss, server downtime, or service interruption.
          </p>

          <h2 className="text-lg font-bold text-slate-900 dark:text-white pt-4 border-t border-slate-100 dark:border-[#222225]">
            6. Contact
          </h2>
          <p>For questions regarding these Terms, contact:</p>
          <ul className="list-none space-y-1 pl-0">
            <li><strong>Developer:</strong> Haris Arshad</li>
            <li><strong>Application:</strong> Takt (<a href="https://takt.harisarshad.site/" className="underline">https://takt.harisarshad.site/</a>)</li>
            <li><strong>Email:</strong> <a href="mailto:harisengr73@gmail.com" className="text-rose-600 dark:text-rose-400 underline font-medium">harisengr73@gmail.com</a></li>
          </ul>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-100 dark:border-[#222225] flex items-center justify-between text-xs text-slate-400">
          <div>&copy; {new Date().getFullYear()} Takt by Haris Arshad. All rights reserved.</div>
          <div className="flex gap-4">
            <a href="/privacy" className="hover:text-slate-600 dark:hover:text-white transition-colors">Privacy Policy</a>
            <a href="https://takt.harisarshad.site/" className="hover:text-slate-600 dark:hover:text-white transition-colors">Home</a>
          </div>
        </div>
      </div>
    </div>
  );
}
