export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <nav className="sticky top-0 z-50 bg-zinc-950/95 backdrop-blur border-b border-zinc-800/60">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <a href="/" className="font-mono text-lg font-bold text-amber-400">
            MVR<span className="text-zinc-500">share</span>
          </a>
          <a href="/" className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors">← Back</a>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <p className="text-xs font-mono text-amber-400 tracking-widest mb-2">// legal</p>
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-zinc-500 text-sm mb-10">Last updated: January 1, 2025 · GDPR compliant</p>

        <div className="prose prose-invert max-w-none space-y-8 text-zinc-300 leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-zinc-100 mb-3">1. Who We Are</h2>
            <p>
              MVRshare ("we", "us", "our") operates the platform available at mvrshare.com, an open-source
              community for lighting designers to share MVR files, GDTF patches, and 3D scenes.
            </p>
            <p className="mt-3">
              For any privacy-related enquiries, you may contact us at:{' '}
              <span className="text-amber-400">privacy@mvrshare.com</span>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-100 mb-3">2. Data We Collect</h2>
            <p>We collect the following categories of personal data:</p>

            <h3 className="text-base font-semibold text-zinc-200 mt-4 mb-2">2.1 Account data</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Email address</li>
              <li>Username, first name, last name (if provided)</li>
              <li>Profile photo (if uploaded or synced via OAuth)</li>
              <li>Location and website URL (optional, if provided)</li>
              <li>Software preferences (optional)</li>
            </ul>

            <h3 className="text-base font-semibold text-zinc-200 mt-4 mb-2">2.2 Authentication data</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>OAuth tokens from GitHub, Google, Discord, or Facebook (used only for authentication)</li>
              <li>Session identifiers and login timestamps</li>
            </ul>

            <h3 className="text-base font-semibold text-zinc-200 mt-4 mb-2">2.3 Content data</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Files uploaded by you (MVR, GDTF, 3D scenes, etc.)</li>
              <li>Comments, forum posts, and other user-generated content</li>
            </ul>

            <h3 className="text-base font-semibold text-zinc-200 mt-4 mb-2">2.4 Usage data</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Download counts and file interaction statistics (anonymized)</li>
              <li>General navigation data collected via our hosting provider (Vercel)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-100 mb-3">3. How We Use Your Data</h2>
            <p>We process your personal data for the following purposes and on the following legal bases:</p>
            <div className="mt-3 space-y-3">
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                <p className="text-zinc-200 font-medium">Account operation</p>
                <p className="text-sm mt-1">To create and manage your account, authenticate your identity, and provide access to Platform features. <span className="text-amber-400">Legal basis: Contract performance.</span></p>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                <p className="text-zinc-200 font-medium">Platform communications</p>
                <p className="text-sm mt-1">To send essential account notifications (security alerts, password resets, service updates). <span className="text-amber-400">Legal basis: Legitimate interest / Contract performance.</span></p>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                <p className="text-zinc-200 font-medium">Newsletter and marketing</p>
                <p className="text-sm mt-1">To send you the MVRshare newsletter and community updates, only if you have explicitly opted in. <span className="text-amber-400">Legal basis: Consent (freely given, specific, and withdrawable at any time).</span></p>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                <p className="text-zinc-200 font-medium">Platform improvement</p>
                <p className="text-sm mt-1">To understand how the Platform is used and improve our services, using anonymized and aggregated data only. <span className="text-amber-400">Legal basis: Legitimate interest.</span></p>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                <p className="text-zinc-200 font-medium">Legal compliance</p>
                <p className="text-sm mt-1">To comply with applicable legal obligations, including responding to lawful requests from authorities. <span className="text-amber-400">Legal basis: Legal obligation.</span></p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-100 mb-3">4. Data Sharing</h2>
            <p>We do not sell your personal data. We may share data with the following trusted service providers, solely for the purpose of operating the Platform:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li><strong className="text-zinc-200">Supabase</strong> — database, authentication, and file storage provider. Data is stored on servers within the EU (EU West region).</li>
              <li><strong className="text-zinc-200">Vercel</strong> — frontend hosting and deployment infrastructure.</li>
              <li><strong className="text-zinc-200">OAuth providers</strong> (GitHub, Google, Discord, Facebook) — used only for authentication. We do not receive or store your full profile from these providers beyond what is necessary to create your account.</li>
            </ul>
            <p className="mt-3">All third-party providers are required to process your data in accordance with applicable data protection laws.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-100 mb-3">5. Data Retention</h2>
            <p>
              We retain your personal data for as long as your account is active. If you delete your account,
              your personal data will be permanently removed within 30 days, except where retention is required
              by law or for legitimate operational reasons (e.g. resolving disputes).
            </p>
            <p className="mt-3">
              Files you have uploaded may remain on the Platform after account deletion unless you explicitly
              request their removal. Please contact us at <span className="text-amber-400">privacy@mvrshare.com</span>{' '}
              to request file deletion alongside account deletion.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-100 mb-3">6. Your Rights (GDPR)</h2>
            <p>Under the General Data Protection Regulation (GDPR), you have the following rights:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li><strong className="text-zinc-200">Right of access</strong> — You may request a copy of the personal data we hold about you.</li>
              <li><strong className="text-zinc-200">Right to rectification</strong> — You may correct inaccurate or incomplete data via your account settings.</li>
              <li><strong className="text-zinc-200">Right to erasure</strong> — You may request deletion of your personal data ("right to be forgotten").</li>
              <li><strong className="text-zinc-200">Right to restriction</strong> — You may request that we limit how we use your data in certain circumstances.</li>
              <li><strong className="text-zinc-200">Right to data portability</strong> — You may request your data in a structured, machine-readable format.</li>
              <li><strong className="text-zinc-200">Right to object</strong> — You may object to processing based on legitimate interest or for direct marketing purposes.</li>
              <li><strong className="text-zinc-200">Right to withdraw consent</strong> — Where processing is based on consent (e.g. newsletter), you may withdraw it at any time without affecting the lawfulness of prior processing.</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, contact us at{' '}
              <span className="text-amber-400">privacy@mvrshare.com</span>. We will respond within 30 days.
              You also have the right to lodge a complaint with your local data protection authority.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-100 mb-3">7. Cookies</h2>
            <p>
              MVRshare uses only strictly necessary cookies for session management and authentication.
              We do not use tracking cookies, advertising cookies, or third-party analytics cookies.
              No cookie consent banner is required for strictly necessary cookies under the ePrivacy Directive.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-100 mb-3">8. Security</h2>
            <p>
              We implement appropriate technical and organisational measures to protect your personal data
              against unauthorised access, loss, or disclosure. These include encrypted data storage via
              Supabase, HTTPS-only connections, and row-level security policies on all database tables.
              However, no system is entirely secure and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-100 mb-3">9. Children's Privacy</h2>
            <p>
              MVRshare is not intended for users under the age of 16. We do not knowingly collect personal
              data from children. If we become aware that a user is under 16, we will delete their account
              and associated data promptly.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-100 mb-3">10. Changes to this Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify registered users of
              significant changes via email. The "Last updated" date at the top of this page will always
              reflect the most recent version.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-100 mb-3">11. Contact</h2>
            <p>
              For any privacy-related questions or to exercise your rights:{' '}
              <span className="text-amber-400">privacy@mvrshare.com</span>
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}
