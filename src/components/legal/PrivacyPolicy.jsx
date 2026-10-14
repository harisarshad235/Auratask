import React from 'react';
import { ArrowLeft, Shield, Lock, FileText, CheckCircle2, Mail, ExternalLink, Database, Trash2, KeyRound } from 'lucide-react';
import { TaktLogo } from '../brand/TaktLogo';

export default function PrivacyPolicy({ onBack, onNavigate, isLoggedIn = false }) {
  const handleHomeClick = (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    if (onBack) {
      onBack();
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090b11] text-slate-800 dark:text-zinc-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-[#0e121b] border border-slate-200 dark:border-white/[0.1] rounded-3xl p-6 sm:p-12 shadow-xl">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.08] pb-6 mb-8">
          <a
            href="/"
            onClick={handleHomeClick}
            className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isLoggedIn ? 'Back to Workspace' : 'Back to Takt Homepage'}</span>
          </a>
          <TaktLogo className="h-7 w-auto" href="/" onClick={handleHomeClick} />
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
          <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#1c1c20] border border-slate-200 dark:border-[#28282e]">Application: Takt</span>
          <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#1c1c20] border border-slate-200 dark:border-[#28282e]">Homepage: https://takt.harisarshad.site/</span>
          <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#1c1c20] border border-slate-200 dark:border-[#28282e]">Policy URL: https://takt.harisarshad.site/privacy</span>
          <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#1c1c20] border border-slate-200 dark:border-[#28282e]">Developer: Haris Arshad</span>
          <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#1c1c20] border border-slate-200 dark:border-[#28282e]">Effective: October 13, 2026</span>
          <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#1c1c20] border border-slate-200 dark:border-[#28282e]">Last Updated: October 13, 2026</span>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none text-sm space-y-6 text-slate-600 dark:text-[#a1a1aa] leading-relaxed">
          <p>
            This Privacy Policy applies to the <strong className="text-slate-900 dark:text-white">Takt</strong> web application accessible at{' '}
            <a href="https://takt.harisarshad.site/" className="text-rose-600 dark:text-rose-400 underline font-medium">https://takt.harisarshad.site/</a>, developed, owned, and operated by independent software engineer <strong className="text-slate-900 dark:text-white">Haris Arshad</strong>.
          </p>
          <p>
            Takt is a high-velocity personal and team task command center, Kanban cadence workspace, daily planner, and Pomodoro focus manager. This policy provides a comprehensive, transparent explanation of how our application accesses, collects, uses, stores, protects, and discloses user information, with specific focus on data obtained via <strong>Google Identity Services (Google OAuth 2.0)</strong>.
          </p>

          {/* SECTION 1 */}
          <h2 className="text-lg font-bold text-slate-900 dark:text-white pt-4 border-t border-slate-100 dark:border-[#222225] flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-rose-500" />
            <span>1. What Google User Data is Accessed by Our Application</span>
          </h2>
          <p>
            Our application will access the data you have provided to us when you elect to sign in using Google Single Sign-On (SSO). We may collect, or process on behalf of our customers, the following categories of personal data when you use or interact with our products and services:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Your Name:</strong> Your full display name, given name, and family name from your Google profile.</li>
            <li><strong>Your Email Address:</strong> The primary email address linked to your Google account.</li>
            <li><strong>Your Profile Picture / Avatar URL:</strong> The URL link to your public Google account profile picture.</li>
            <li><strong>Unique Google User ID (Subject identifier):</strong> An alphanumeric identifier (<code>openid</code> / <code>sub</code> claim) provided by Google to distinguish your account.</li>
          </ul>

          <div className="overflow-x-auto my-3">
            <table className="w-full text-left text-xs border border-slate-200 dark:border-[#28282e] rounded-xl overflow-hidden">
              <thead className="bg-slate-100 dark:bg-[#1c1c20] text-slate-800 dark:text-slate-200 font-bold">
                <tr>
                  <th className="p-3 border-b border-slate-200 dark:border-[#28282e]">OAuth Scope</th>
                  <th className="p-3 border-b border-slate-200 dark:border-[#28282e]">Data Received</th>
                  <th className="p-3 border-b border-slate-200 dark:border-[#28282e]">Specific Purpose of Use</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-[#28282e]">
                <tr>
                  <td className="p-3 font-mono">openid</td>
                  <td className="p-3">Unique Google User ID</td>
                  <td className="p-3">To establish a secure, unique account key in our database to isolate your workspace records.</td>
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

          <p className="p-3.5 rounded-xl bg-slate-100 dark:bg-[#16161a] border border-slate-200 dark:border-white/[0.08] text-xs font-medium">
            <strong className="text-slate-900 dark:text-white">Zero Sensitive Access Guarantee:</strong> Takt does <strong>NOT</strong> request, access, read, or store any sensitive or restricted Google user data such as Google Drive files, Gmail messages, Google Calendar entries, contacts, location, or financial credentials.
          </p>

          {/* SECTION 2 */}
          <h2 className="text-lg font-bold text-slate-900 dark:text-white pt-4 border-t border-slate-100 dark:border-[#222225]">
            2. How Our Application Uses Google User Data
          </h2>
          <p>
            We will use your data to provide you with the services you requested. Specifically, we use your Google user data solely for:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Authentication &amp; Account Access:</strong> To verify your identity, maintain your secure authenticated session, and grant access to your private workspace.</li>
            <li><strong>Row-Level Security Enforcement:</strong> To cryptographically restrict database access so that only your authenticated Google user ID (<code>auth.uid() = user_id</code>) can query, update, or delete your tasks.</li>
            <li><strong>User Profile Presentation:</strong> To personalize your experience by displaying your name in the header and your avatar on task comments and activities.</li>
            <li><strong>Cross-Device Task Synchronization:</strong> To sync your tasks, ETAs, deadlines, checklists, and notes in real time across multiple computers and web browsers using Supabase PostgreSQL.</li>
          </ul>
          <p className="text-xs">
            <strong>Strict Limitation of Use:</strong> We use Google user data <strong>ONLY</strong> for providing or improving our application's core functionality. We do <strong>NOT</strong> use Google user data for reasons other than providing or improving our application's functionality. We do not use your data for advertising, marketing, profiling, or training artificial intelligence / machine learning models.
          </p>

          {/* SECTION 3 */}
          <h2 className="text-lg font-bold text-slate-900 dark:text-white pt-4 border-t border-slate-100 dark:border-[#222225]">
            3. With Whom We Share, Transfer, or Disclose Google User Data
          </h2>
          <p>
            We will not sell your data to third parties, but we may share it with our partners who help us provide our services.
          </p>
          <p>
            <strong>We do not transfer or disclose your information to third parties for purposes other than the ones provided.</strong> We do not sell, rent, monetize, or trade your Google user data to third parties, data brokers, or marketing intermediaries.
          </p>
          <p>
            We do not transfer Google user data to third parties for reasons other than providing or improving our application's functionality. We only share data with essential infrastructure providers strictly required to host and run Takt:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Google LLC (Google Identity Services):</strong> OAuth 2.0 authentication infrastructure and token verification.</li>
            <li><strong>Supabase Inc.:</strong> Managed cloud database and authentication service. Data is encrypted in transit and at rest with PostgreSQL Row-Level Security.</li>
            <li><strong>Cloudflare Inc.:</strong> DDoS protection, global edge caching, and secure SSL/TLS termination.</li>
          </ul>

          {/* SECTION 4 */}
          <h2 className="text-lg font-bold text-slate-900 dark:text-white pt-4 border-t border-slate-100 dark:border-[#222225] flex items-center gap-2">
            <Lock className="w-5 h-5 text-rose-500" />
            <span>4. Data Protection Mechanisms for Sensitive Data</span>
          </h2>
          <p>
            Security procedures are in place to protect the confidentiality of your data. We use encryption to protect your information:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Encryption in Transit:</strong> All communication between your browser and our servers is protected using TLS 1.3 encryption over HTTPS.</li>
            <li><strong>Encryption at Rest:</strong> All stored database records, user profiles, and tasks are encrypted at rest using industry-standard AES-256 encryption via Supabase.</li>
            <li><strong>Row-Level Security (RLS):</strong> Cryptographic isolation ensures that only your authenticated Google user ID (<code>auth.uid() = user_id</code>) can access or edit your records.</li>
            <li><strong>Security Headers:</strong> We enforce Strict-Transport-Security (HSTS), Content-Security-Policy (CSP), and nosniff protections.</li>
          </ul>

          {/* SECTION 5 */}
          <h2 className="text-lg font-bold text-slate-900 dark:text-white pt-4 border-t border-slate-100 dark:border-[#222225] flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-rose-500" />
            <span>5. Disclosures About Data Retention and Deletion</span>
          </h2>
          <p>
            We retain your user data and Google user data only for as long as your account is active and as necessary to fulfill the services provided.
          </p>
          <p>You maintain complete ownership and control over your data:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>In-App Immediate Deletion:</strong> You can delete any task, note, or comment at any time using the delete button inside the app interface.
            </li>
            <li>
              <strong>Permanent Account &amp; Data Deletion Request:</strong> Send an email from your registered address to{' '}
              <a href="mailto:harisengr73@gmail.com" className="text-rose-600 dark:text-rose-400 font-bold underline">harisengr73@gmail.com</a> with the subject <em>&ldquo;Takt Data Deletion Request&rdquo;</em>. All your tasks, notes, comments, and authentication records will be permanently purged within <strong>7 business days</strong>.
            </li>
            <li>
              <strong>Revoke Google Access:</strong> You can disconnect Takt at any time from your{' '}
              <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" className="text-rose-600 dark:text-rose-400 underline">Google Account Permissions Center</a>.
            </li>
          </ul>

          {/* SECTION 6 */}
          <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-[#1f1519] border border-rose-200/80 dark:border-rose-900/40 text-xs text-rose-900 dark:text-rose-200 space-y-2 my-6">
            <strong className="font-bold text-sm block">Google Limited Use Compliance Disclosure:</strong>
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

          {/* SECTION 7 */}
          <h2 className="text-lg font-bold text-slate-900 dark:text-white pt-4 border-t border-slate-100 dark:border-[#222225]">
            6. Policy Updates &amp; User Notification
          </h2>
          <p>
            We are committed to notifying users if we change how our application uses Google user data. Any changes will be posted with an updated date on this page, accompanied by a notice on our homepage.
          </p>

          {/* SECTION 8 */}
          <h2 className="text-lg font-bold text-slate-900 dark:text-white pt-4 border-t border-slate-100 dark:border-[#222225]">
            7. Developer, Application &amp; Organization Information
          </h2>
          <ul className="list-none space-y-1.5 pl-0 text-xs">
            <li><strong>Application Name:</strong> Takt (also referenced as Takt Workspace / Auratask)</li>
            <li><strong>Homepage URL:</strong> <a href="https://takt.harisarshad.site/" className="underline">https://takt.harisarshad.site/</a></li>
            <li><strong>Privacy Policy URL:</strong> <a href="https://takt.harisarshad.site/privacy" className="underline">https://takt.harisarshad.site/privacy</a></li>
            <li><strong>Developer &amp; Organization:</strong> Haris Arshad</li>
            <li><strong>Contact Email:</strong> <a href="mailto:harisengr73@gmail.com" className="text-rose-600 dark:text-rose-400 underline font-semibold">harisengr73@gmail.com</a></li>
          </ul>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-100 dark:border-[#222225] flex items-center justify-between text-xs text-slate-400">
          <div>&copy; {new Date().getFullYear()} Takt by Haris Arshad. All rights reserved.</div>
          <div className="flex gap-4">
            <a
              href="/terms"
              onClick={(e) => {
                if (onNavigate) {
                  e.preventDefault();
                  onNavigate('terms');
                }
              }}
              className="hover:text-slate-600 dark:hover:text-white transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="/"
              onClick={handleHomeClick}
              className="hover:text-slate-600 dark:hover:text-white transition-colors"
            >
              {isLoggedIn ? 'Workspace' : 'Home'}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
