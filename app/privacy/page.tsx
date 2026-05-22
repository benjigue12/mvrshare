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
        <p className="text-zinc-500 text-sm mb-10">
          Last updated: January 1, 2025 · Designed to comply with the EU General Data Protection Regulation (GDPR)
        </p>

        <div className="prose prose-invert max-w-none space-y-8 text-zinc-300 leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-zinc-100 mb-3">1. Data Controller</h2>
            <p>
              The data controller responsible for your personal data is:
            </p>
            <div className="mt-3 bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-sm">
              <p className="text-zinc-200 font-medium">Benjamin Gueyte</p>
              <p className="text-zinc-400 mt-1">Mulhouse, France</p>
              <p className="text-zinc-400">
                Email: <span className="text-amber-400">privacy@mvrshare.com</span>
              </p>
              <p className="text-zinc-500 mt-2 text-xs">
                MVRshare is operated independently by Benjamin Gueyte and is not incorporated as a company.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-100 mb-3">2. Data We Collect</h2>

            <h3 className="text-base font-semibold text-zinc-200 mt-4 mb-2">2.1 Account data</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Email address</li>
              <li>Username, first name, last name (if provided)</li>
              <li>Profile photo (if uploaded directly or retrieved via OAuth at account creation)</li>
              <li>Location and website URL (optional, if provided in your profile)</li>
              <li>Software preferences (optional)</li>
            </ul>

            <h3 className="text-base font-semibold text-zinc-200 mt-4 mb-2">2.2 Authentication data</h3>
            <p>
              When you sign in using GitHub, Google, Discord, or Facebook, we receive only the authentication
              identifiers and basic profile information (name, email, avatar) necessary to create or
              authenticate your MVRshare account. Temporary OAuth tokens may be processed during
              authentication solely to verify your identity. We do not store long-term OAuth access tokens
              or use them to access your accounts on those platforms beyond the initial sign-in.
            </p>

            <h3 className="text-base font-semibold text-zinc-200 mt-4 mb-2">2.3 Content data</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Files uploaded by you (MVR, GDTF, 3D scenes, etc.)</li>
              <li>Comments, forum posts, and other user-generated content</li>
            </ul>

            <h3 className="text-base font-semibold text-zinc-200 mt-4 mb-2">2.4 Usage data</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Download counts and file interaction statistics (anonymized and aggregated)</li>
              <li>
                Basic server logs collected by our hosting provider (Vercel), including IP addresses
                and request metadata, retained for a limited period for security and operational purposes.
                We do not use Vercel Analytics or any behavioural tracking or profiling tools.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-100 mb-3">3. How We Use Your Data</h2>
            <div className="space-y-3">
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                <p className="text-zinc-200 font-medium">Account operation</p>
                <p className="text-sm mt-1">
                  To create and manage your account, authenticate your identity, and provide access to
                  Platform features.{' '}
                  <span className="text-amber-400">Legal basis: Contract performance (Art. 6(1)(b) GDPR).</span>
                </p>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                <p className="text-zinc-200 font-medium">Transactional communications</p>
                <p className="text-sm mt-1">
                  To send essential account notifications (security alerts, password resets, service updates).{' '}
                  <span className="text-amber-400">Legal basis: Contract performance / Legitimate interest (Art. 6(1)(b) and (f) GDPR).</span>
                </p>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                <p className="text-zinc-200 font-medium">Newsletter and marketing communications</p>
                <p className="text-sm mt-1">
                  To send the MVRshare newsletter and community updates, only if you have explicitly
                  opted in at registration or via your account settings.{' '}
                  <span className="text-amber-400">Legal basis: Consent (Art. 6(1)(a) GDPR) — freely given, specific, and withdrawable at any time.</span>
                </p>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                <p className="text-zinc-200 font-medium">Platform improvement</p>
                <p className="text-sm mt-1">
                  To understand how the Platform is used and improve our services, using anonymized and
                  aggregated data only.{' '}
                  <span className="text-amber-400">Legal basis: Legitimate interest (Art. 6(1)(f) GDPR).</span>
                </p>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                <p className="text-zinc-200 font-medium">Legal compliance</p>
                <p className="text-sm mt-1">
                  To comply with applicable legal obligations, including responding to lawful requests
                  from authorities.{' '}
                  <span className="text-amber-400">Legal basis: Legal obligation (Art. 6(1)(c) GDPR).</span>
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-100 mb-3">4. Public Content</h2>
            <p>
              Content you publish on the Platform — including uploaded files, profile information, comments,
              and forum posts — is publicly accessible and may be indexed by search engines. By publishing
              content, you acknowledge and accept this public visibility. The terms under which your files
              may be reused by others are governed by the license you select at upload and by our Terms
              and Conditions.
            </p>
            <p className="mt-3">
              You may remove your public content at any time via your account settings or by contacting us
              at <span className="text-amber-400">privacy@mvrshare.com</span>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-100 mb-3">5. Data Sharing</h2>
            <p>
              We do not sell your personal data. We share data only with the following trusted service
              providers, strictly for the purpose of operating the Platform:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>
                <strong className="text-zinc-200">Supabase</strong> — database, authentication, and file
                storage. Data is stored in the EU West region. Supabase processes data in accordance with
                GDPR and provides Standard Contractual Clauses where applicable.
              </li>
              <li>
                <strong className="text-zinc-200">Vercel</strong> — frontend hosting and deployment
                infrastructure. Vercel may process request metadata (IP addresses, headers) on servers
                globally as part of its CDN infrastructure, for security and performance purposes only.
              </li>
              <li>
                <strong className="text-zinc-200">OAuth providers</strong> (GitHub, Google, Discord,
                Facebook) — used solely for authentication at sign-in. We receive only the minimum
                profile information necessary to create your account and do not share your MVRshare
                data with these providers.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-100 mb-3">6. International Data Transfers</h2>
            <p>
              Some of our service providers (including Vercel, GitHub, Google, Discord, and Facebook) may
              process data outside the European Economic Area (EEA). Where such transfers occur, we rely
              on appropriate safeguards, including Standard Contractual Clauses (SCCs) as approved by the
              European Commission, to ensure your data receives an equivalent level of protection.
            </p>
            <p className="mt-3">
              Our primary database and file storage (Supabase) is hosted in the EU West region, minimising
              the transfer of your core personal data outside the EEA.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-100 mb-3">7. Data Retention</h2>
            <p>
              We retain your personal data for as long as your account is active. If you delete your account,
              your personal data will be deleted from active systems within 30 days and removed from backups
              according to our backup retention schedule, except where retention is required by applicable law.
            </p>
            <p className="mt-3">
              Uploaded files that have been publicly shared on the Platform may remain available after
              account deletion where necessary to preserve community content integrity, on the basis of
              our legitimate interest in maintaining a consistent shared resource. You may request the
              removal of your files at any time by contacting us at{' '}
              <span className="text-amber-400">privacy@mvrshare.com</span>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-100 mb-3">8. Your Rights (GDPR)</h2>
            <p>Under the GDPR, you have the following rights:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li><strong className="text-zinc-200">Right of access (Art. 15)</strong> — Request a copy of the personal data we hold about you.</li>
              <li><strong className="text-zinc-200">Right to rectification (Art. 16)</strong> — Correct inaccurate or incomplete data via your account settings or by contacting us.</li>
              <li><strong className="text-zinc-200">Right to erasure (Art. 17)</strong> — Request deletion of your personal data ("right to be forgotten"), subject to applicable exceptions.</li>
              <li><strong className="text-zinc-200">Right to restriction (Art. 18)</strong> — Request that we limit how we process your data in certain circumstances.</li>
              <li><strong className="text-zinc-200">Right to data portability (Art. 20)</strong> — Request your data in a structured, machine-readable format.</li>
              <li><strong className="text-zinc-200">Right to object (Art. 21)</strong> — Object to processing based on legitimate interest or for direct marketing purposes.</li>
              <li><strong className="text-zinc-200">Right to withdraw consent (Art. 7)</strong> — Where processing is based on consent (e.g. newsletter), withdraw it at any time without affecting the lawfulness of prior processing.</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, contact us at{' '}
              <span className="text-amber-400">privacy@mvrshare.com</span>. We will respond within 30 days.
              You also have the right to lodge a complaint with the French data protection authority (CNIL)
              at <span className="text-amber-400">cnil.fr</span>, or with the supervisory authority in
              your country of residence.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-100 mb-3">9. Cookies</h2>
            <p>
              MVRshare uses only strictly necessary cookies for session management and authentication.
              These cookies are essential for the Platform to function and do not require consent under
              the ePrivacy Directive. We do not use advertising cookies, behavioural tracking tools,
              or third-party analytics services.
            </p>
            <p className="mt-3">
              Vercel, as our hosting provider, may set technical cookies or collect request metadata
              (such as IP addresses) as part of its infrastructure operations. This data is used solely
              for security and performance purposes and is not used to profile or track users.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-100 mb-3">10. Security</h2>
            <p>
              We implement appropriate technical and organisational measures to protect your personal data,
              including encrypted data storage (Supabase), HTTPS-only connections, and row-level security
              policies on all database tables. However, no system is entirely secure and we cannot guarantee
              absolute security. In the event of a data breach affecting your rights and freedoms, we will
              notify you and the relevant supervisory authority as required by applicable law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-100 mb-3">11. Children's Privacy</h2>
            <p>
              MVRshare is not intended for users under the age of 16. We do not knowingly collect personal
              data from children. If we become aware that a user is under 16, we will delete their account
              and associated data promptly. If you believe a child has registered, please contact us at{' '}
              <span className="text-amber-400">privacy@mvrshare.com</span>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-100 mb-3">12. Changes to this Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify registered users of
              significant changes via email. The "Last updated" date at the top of this page will always
              reflect the most recent version.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-100 mb-3">13. Contact</h2>
            <p>
              For any privacy-related questions or to exercise your rights:{' '}
              <span className="text-amber-400">privacy@mvrshare.com</span>
            </p>
            <p className="mt-2 text-zinc-500 text-sm">
              MVRshare · Operated by Benjamin Gueyte · Mulhouse, France
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}
