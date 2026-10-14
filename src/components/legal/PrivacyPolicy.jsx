import React from 'react';
import { ArrowLeft, Shield, Lock, FileText, CheckCircle2, Mail, ExternalLink, Database, Trash2, KeyRound, AlertTriangle, Eye, Server, RefreshCw } from 'lucide-react';
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
          <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#1c1c20] border border-slate-200 dark:border-[#28282e]">Application: Takt (Auratask)</span>
          <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#1c1c20] border border-slate-200 dark:border-[#28282e]">Homepage: https://takt.harisarshad.site/</span>
          <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#1c1c20] border border-slate-200 dark:border-[#28282e]">Policy URL: https://takt.harisarshad.site/privacy</span>
          <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#1c1c20] border border-slate-200 dark:border-[#28282e]">Developer: Haris Arshad</span>
          <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#1c1c20] border border-slate-200 dark:border-[#28282e]">Effective: October 14, 2026</span>
          <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#1c1c20] border border-slate-200 dark:border-[#28282e]">Last Updated: October 14, 2026</span>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none text-sm space-y-6 text-slate-600 dark:text-[#a1a1aa] leading-relaxed">
          <p>
            This Privacy Policy applies to the <strong className="text-slate-900 dark:text-white">Takt</strong> web application (registered and identified in Google Cloud Console as <strong className="text-slate-900 dark:text-white">Auratask</strong> / <strong className="text-slate-900 dark:text-white">Takt Workspace</strong>, collectively referred to as &ldquo;Takt&rdquo;, &ldquo;Auratask&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;, or &ldquo;the Service&rdquo;), accessible at{' '}
            <a href="https://takt.harisarshad.site/" className="text-rose-600 dark:text-rose-400 underline font-medium">https://takt.harisarshad.site/</a>. Takt is developed, owned, and operated by independent software engineer <strong className="text-slate-900 dark:text-white">Haris Arshad</strong>.
          </p>
          <p>
            Takt is a high-velocity personal and team task command center, Kanban cadence workspace, 7-day horizon daily planner, meeting scratchpad, and Pomodoro focus manager. We are committed to complete transparency regarding the collection, processing, storage, protection, and disclosure of your personal data, particularly information obtained via <strong>Google Identity Services (Google OAuth 2.0)</strong>.
          </p>

          {/* SECTION 1 */}
          <h2 className="text-lg font-bold text-slate-900 dark:text-white pt-4 border-t border-slate-100 dark:border-[#222225] flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-rose-500" />
            <span>1. What Google User Data is Accessed by Our Application</span>
          </h2>
          <p>
            When you elect to sign in to Takt using Google Single Sign-On (SSO) or link your Google Account, our application accesses standard identity claims provided by Google Identity Services. We access only non-sensitive identity data strictly necessary to authenticate your account and provision your isolated cloud workspace:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Your Name:</strong> Your full display name, given name, and family name linked to your Google Account.</li>
            <li><strong>Your Email Address:</strong> The primary verified email address associated with your Google Account.</li>
            <li><strong>Your Profile Picture / Avatar URL:</strong> The public HTTPS image URL pointing to your Google profile picture.</li>
            <li><strong>Unique Google Subject Identifier (Subject ID / <code>sub</code> claim):</strong> A permanent, unique alphanumeric identifier issued by Google to distinguish your account across login sessions.</li>
            <li><strong>OAuth Token Metadata:</strong> Expiration timestamps and authentication token lifecycles issued by Google during OAuth handshake.</li>
          </ul>

          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mt-2">
            Requested OAuth 2.0 Scopes:
          </p>
          <div className="overflow-x-auto my-3">
            <table className="w-full text-left text-xs border border-slate-200 dark:border-[#28282e] rounded-xl overflow-hidden">
              <thead className="bg-slate-100 dark:bg-[#1c1c20] text-slate-800 dark:text-slate-200 font-bold">
                <tr>
                  <th className="p-3 border-b border-slate-200 dark:border-[#28282e]">OAuth Scope</th>
                  <th className="p-3 border-b border-slate-200 dark:border-[#28282e]">Data Received</th>
                  <th className="p-3 border-b border-slate-200 dark:border-[#28282e]">Specific Purpose &amp; Feature Dependency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-[#28282e]">
                <tr>
                  <td className="p-3 font-mono">openid</td>
                  <td className="p-3 font-medium">Unique Google User ID (<code>sub</code>)</td>
                  <td className="p-3">To establish a secure, unique account key in our database to isolate your workspace records.</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono">.../userinfo.email</td>
                  <td className="p-3 font-medium">Verified Email Address</td>
                  <td className="p-3">To identify your account, send critical account security notices, and prevent duplicate account creation.</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono">.../userinfo.profile</td>
                  <td className="p-3 font-medium">Display Name &amp; Profile Picture URL</td>
                  <td className="p-3">To display your name in the workspace header, account dropdown, and your avatar beside task comments.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-[#16161a] border border-slate-200 dark:border-white/[0.08] text-xs font-medium">
            <strong className="text-slate-900 dark:text-white">Zero Sensitive Access Guarantee:</strong> Takt does <strong>NOT</strong> request, access, inspect, or store any sensitive or restricted Google user data such as Google Drive files, Gmail messages or threads, Google Calendar entries, contacts, location, browsing history, or payment/financial credentials.
          </div>

          {/* SECTION 2 */}
          <h2 className="text-lg font-bold text-slate-900 dark:text-white pt-4 border-t border-slate-100 dark:border-[#222225] flex items-center gap-2">
            <Database className="w-5 h-5 text-rose-500" />
            <span>2. Other User-Created &amp; Technical Information Collected</span>
          </h2>
          <p>
            To provide full task command center and focus tracking functionality, Takt collects and stores the following categories of information that you author or transmit while using the application:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Tasks &amp; Metadata:</strong> Task titles, descriptions, due dates, scheduled times, estimated duration / ETAs, priority levels (P1 Urgent to P4 Low), custom section/swimlane assignments (Inbox, In Progress, In Review, Completed), tags, and completion status.</li>
            <li><strong>Subtask Checklists:</strong> Checklist items, subtask titles, inline edit history, and completion states.</li>
            <li><strong>Comments &amp; Activity Discussions:</strong> Messages, timestamps, updates, and soft-deleted comment audit records attached to tasks.</li>
            <li><strong>Meeting Scratchpad Notes:</strong> Markdown notes, meeting memos, and action items authored in the private Scratchpad drawer.</li>
            <li><strong>Pomodoro Focus Metrics:</strong> Focus sessions initiated, focused minutes logged, and session completion records.</li>
            <li><strong>Technical &amp; Telemetry Data:</strong> IP address, browser user-agent string, device operating system, language preferences, and server access timestamps.</li>
            <li><strong>Browser Local Storage:</strong> Client-side preferences such as dark/light UI mode (<code>takt_theme</code>), active view layout (<code>board</code>, <code>calendar</code>, <code>list</code>), collapsed swimlane states (<code>takt_collapsed_sections</code>), and local offline task queues.</li>
          </ul>

          {/* SECTION 3 */}
          <h2 className="text-lg font-bold text-slate-900 dark:text-white pt-4 border-t border-slate-100 dark:border-[#222225] flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-rose-500" />
            <span>3. How Our Application Uses Google User Data &amp; Information</span>
          </h2>
          <p>
            We will use your data to provide you with the services you requested. Specifically, we use your Google user data and workspace information solely for:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Authentication &amp; Session Management:</strong> To verify your identity via Google OAuth 2.0, establish an authenticated JSON Web Token (JWT) session, and eliminate the need for separate passwords.</li>
            <li><strong>Row-Level Security (RLS) Enforcement:</strong> To cryptographically restrict database queries in our PostgreSQL cloud database so that only your verified Google user ID (<code>auth.uid() = user_id</code>) can read, create, update, or delete your tasks and notes.</li>
            <li><strong>Workspace Personalization:</strong> To display your name and profile avatar in the navigation header, user settings dropdown, task comments, and activity audit trails.</li>
            <li><strong>Cross-Device Real-Time Synchronization:</strong> To sync your tasks, checklists, notes, and Pomodoro focus timers across your mobile devices, laptops, and web browsers in real time via Supabase Realtime WebSockets.</li>
            <li><strong>Platform Stability &amp; Support:</strong> To troubleshoot user-reported issues and maintain application uptime and security.</li>
          </ul>
          <p className="text-xs">
            <strong>Strict Limitation of Use:</strong> We use Google user data <strong>ONLY</strong> for providing or improving our application&rsquo;s core functionality. We do <strong>NOT</strong> use Google user data for reasons other than providing or improving your application&rsquo;s functionality. We do not use your data for advertising, marketing, profiling, or training generalized artificial intelligence (AI) / machine learning (ML) models.
          </p>

          {/* SECTION 4 */}
          <h2 className="text-lg font-bold text-slate-900 dark:text-white pt-4 border-t border-slate-100 dark:border-[#222225] flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-500" />
            <span>4. Explicit Negative Data Practices (What We NEVER Do)</span>
          </h2>
          <p>To ensure uncompromising user privacy and complete compliance with Google Trust &amp; Safety standards, we uphold the following strict prohibitions:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>NO Selling or Renting:</strong> We do <strong>NOT</strong> sell, rent, lease, monetize, or trade your Google user data or personal information to third parties, data brokers, or marketing aggregators under any circumstances.</li>
            <li><strong>NO Advertising or Retargeting:</strong> We do <strong>NOT</strong> use Google user data or task contents to serve advertisements, display targeted ads, or build marketing profiles. Takt is completely free of third-party advertisements and tracking scripts.</li>
            <li><strong>NO Generalized AI / ML Model Training:</strong> We do <strong>NOT</strong> transfer or feed your Google user data, task notes, or comments into generalized machine learning models, neural networks, or Large Language Models (LLMs).</li>
            <li><strong>NO Cross-Site Tracking:</strong> We do <strong>NOT</strong> track your activity across third-party websites or share browsing behavior with data analytics brokers.</li>
            <li><strong>NO Human Reading of Private Content:</strong> No human employee, contractor, or developer reads your private task descriptions, notes, or comments unless: (a) you have provided explicit written consent during a technical support ticket, or (b) we are compelled to comply with a valid court order or statutory requirement.</li>
          </ul>

          {/* SECTION 5 */}
          <h2 className="text-lg font-bold text-slate-900 dark:text-white pt-4 border-t border-slate-100 dark:border-[#222225] flex items-center gap-2">
            <Server className="w-5 h-5 text-rose-500" />
            <span>5. With Whom We Share, Transfer, or Disclose Google User Data</span>
          </h2>
          <p>
            We will not sell your data to third parties, but we may share it with our partners who help us provide our services.
          </p>
          <p>
            <strong>We do not transfer or disclose your information to third parties for purposes other than the ones provided.</strong> We do not transfer Google user data to third parties for reasons other than providing or improving our application&rsquo;s functionality. We disclose data solely to the following vetted, industry-standard infrastructure sub-processors strictly required to operate Takt:
          </p>
          <div className="overflow-x-auto my-3">
            <table className="w-full text-left text-xs border border-slate-200 dark:border-[#28282e] rounded-xl overflow-hidden">
              <thead className="bg-slate-100 dark:bg-[#1c1c20] text-slate-800 dark:text-slate-200 font-bold">
                <tr>
                  <th className="p-3 border-b border-slate-200 dark:border-[#28282e]">Sub-processor</th>
                  <th className="p-3 border-b border-slate-200 dark:border-[#28282e]">Location</th>
                  <th className="p-3 border-b border-slate-200 dark:border-[#28282e]">Service Provided</th>
                  <th className="p-3 border-b border-slate-200 dark:border-[#28282e]">Data Transferred</th>
                  <th className="p-3 border-b border-slate-200 dark:border-[#28282e]">Security Certifications</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-[#28282e]">
                <tr>
                  <td className="p-3 font-semibold">Google LLC</td>
                  <td className="p-3">USA</td>
                  <td className="p-3">Identity Services / OAuth 2.0 authentication</td>
                  <td className="p-3">OAuth tokens, verification requests</td>
                  <td className="p-3">ISO 27001, SOC 2 / SOC 3</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">Supabase Inc.</td>
                  <td className="p-3">USA (AWS us-east-1)</td>
                  <td className="p-3">PostgreSQL database, authentication &amp; realtime sync</td>
                  <td className="p-3">User ID, email, avatar URL, encrypted tasks &amp; notes</td>
                  <td className="p-3">SOC 2 Type II, AES-256 at rest</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">Cloudflare Inc.</td>
                  <td className="p-3">USA / Global</td>
                  <td className="p-3">Global edge CDN, DDoS mitigation &amp; SSL/TLS termination</td>
                  <td className="p-3">Encrypted HTTP/HTTPS traffic</td>
                  <td className="p-3">SOC 2 Type II, ISO 27001, PCI DSS</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* SECTION 6 */}
          <h2 className="text-lg font-bold text-slate-900 dark:text-white pt-4 border-t border-slate-100 dark:border-[#222225] flex items-center gap-2">
            <Lock className="w-5 h-5 text-rose-500" />
            <span>6. Data Protection Mechanisms for Sensitive Data</span>
          </h2>
          <p>
            Security procedures are in place to protect the confidentiality of your data. We use encryption to protect your information and apply industry best practices across all software layers:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Encryption in Transit:</strong> All communication between your browser and our servers is protected using modern TLS 1.3 encryption over HTTPS. Plaintext HTTP traffic is rejected and automatically upgraded.</li>
            <li><strong>Encryption at Rest:</strong> All stored database records, user profiles, and tasks are encrypted at rest using industry-standard AES-256 encryption via our cloud database provider (Supabase).</li>
            <li><strong>Row-Level Security (RLS):</strong> Cryptographic isolation ensures that only your authenticated Google user ID (<code>auth.uid() = user_id</code>) can access or edit your records.</li>
            <li><strong>Security Headers:</strong> We enforce Strict-Transport-Security (HSTS), Content-Security-Policy (CSP), nosniff, and frame-ancestors protections.</li>
          </ul>

          {/* SECTION 7 */}
          <h2 className="text-lg font-bold text-slate-900 dark:text-white pt-4 border-t border-slate-100 dark:border-[#222225] flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-rose-500" />
            <span>7. Disclosures About Data Retention and Deletion</span>
          </h2>
          <p>
            We retain your user data and Google user data only for as long as your account is active and as necessary to fulfill the services provided.
          </p>
          <p>You maintain complete ownership and control over your data:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>In-App Immediate Deletion:</strong> You can delete any individual task, note, comment, or checklist item at any time using the delete icon inside the app interface.
            </li>
            <li>
              <strong>Permanent Account &amp; Data Deletion Request:</strong> Send an email from your registered address to{' '}
              <a href="mailto:harisengr73@gmail.com" className="text-rose-600 dark:text-rose-400 font-bold underline">harisengr73@gmail.com</a> with the subject <em>&ldquo;Takt Data Deletion Request&rdquo;</em>. All your tasks, notes, comments, and authentication records will be permanently purged within <strong>7 business days</strong>.
            </li>
            <li>
              <strong>Revoke Google Access:</strong> You can disconnect Takt from your Google account at any time by visiting the{' '}
              <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" className="text-rose-600 dark:text-rose-400 underline font-semibold">Google Account Permissions Center</a>.
            </li>
          </ul>

          {/* SECTION 8: VERBATIM LIMITED USE DISCLOSURE */}
          <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-[#1f1519] border border-rose-200/80 dark:border-rose-900/40 text-xs text-rose-900 dark:text-rose-200 space-y-2 my-6">
            <strong className="font-bold text-sm block">8. Google API Services User Data Policy Compliance (Limited Use Disclosure):</strong>
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
              <li>We do <strong>NOT</strong> allow humans to read your private data unless you have given explicit prior consent for technical support, or where required by applicable law.</li>
            </ul>
          </div>

          {/* SECTION 9 */}
          <h2 className="text-lg font-bold text-slate-900 dark:text-white pt-4 border-t border-slate-100 dark:border-[#222225]">
            9. User Rights &amp; Regulatory Compliance (GDPR &amp; CCPA)
          </h2>
          <p>Depending on your location, you have statutory rights regarding your personal data:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Right to Access (GDPR Article 15):</strong> You have the right to request a complete copy of the personal data we hold about you.</li>
            <li><strong>Right to Rectification (GDPR Article 16):</strong> You can correct inaccurate or incomplete data directly inside your profile or task cards.</li>
            <li><strong>Right to Erasure (GDPR Article 17):</strong> You can demand permanent deletion of your data (&ldquo;Right to be Forgotten&rdquo;) as described in Section 7.</li>
            <li><strong>Right to Data Portability (GDPR Article 20):</strong> You may request an export of your tasks and workspace data in a structured, machine-readable format (JSON).</li>
            <li><strong>California Consumer Privacy Act (CCPA / CPRA):</strong> California residents have the right to know what personal information is collected, request its deletion, and be free from discrimination. We do not sell or share personal information as defined under the CCPA.</li>
            <li><strong>Children&rsquo;s Online Privacy Protection Act (COPPA):</strong> Takt is not directed to children under 13 (or under 16 in certain jurisdictions). We do not knowingly collect personal information from children.</li>
          </ul>

          {/* SECTION 10 */}
          <h2 className="text-lg font-bold text-slate-900 dark:text-white pt-4 border-t border-slate-100 dark:border-[#222225]">
            10. Policy Updates &amp; User Notification
          </h2>
          <p>
            We are committed to notifying users if we change how our application uses Google user data. Any changes will be posted with an updated date on this page, accompanied by a prominent notice on our homepage prior to changes taking effect.
          </p>

          {/* SECTION 11 */}
          <h2 className="text-lg font-bold text-slate-900 dark:text-white pt-4 border-t border-slate-100 dark:border-[#222225]">
            11. Developer, Application &amp; Organization Information
          </h2>
          <ul className="list-none space-y-1.5 pl-0 text-xs">
            <li><strong>Application Name:</strong> Takt (registered in Google Cloud as <strong>Auratask</strong> / <strong>Takt Workspace</strong>)</li>
            <li><strong>Homepage URL:</strong> <a href="https://takt.harisarshad.site/" className="underline">https://takt.harisarshad.site/</a></li>
            <li><strong>Privacy Policy URL:</strong> <a href="https://takt.harisarshad.site/privacy" className="underline">https://takt.harisarshad.site/privacy</a></li>
            <li><strong>Terms of Service URL:</strong> <a href="https://takt.harisarshad.site/terms" className="underline">https://takt.harisarshad.site/terms</a></li>
            <li><strong>Developer &amp; Organization:</strong> Haris Arshad</li>
            <li><strong>Contact Email:</strong> <a href="mailto:harisengr73@gmail.com" className="text-rose-600 dark:text-rose-400 underline font-semibold">harisengr73@gmail.com</a></li>
            <li><strong>Location:</strong> Pakistan</li>
            <li><strong>Response Time Guarantee:</strong> We respond to all privacy, security, and deletion requests within <strong>48 business hours</strong>.</li>
          </ul>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-100 dark:border-[#222225] flex items-center justify-between text-xs text-slate-400">
          <div>&copy; {new Date().getFullYear()} Takt (Auratask) by Haris Arshad. All rights reserved.</div>
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
