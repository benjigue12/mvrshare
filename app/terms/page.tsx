export default function TermsPage() {
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
        <h1 className="text-3xl font-bold mb-2">Terms and Conditions</h1>
        <p className="text-zinc-500 text-sm mb-10">Last updated: January 1, 2025 · Effective date: January 1, 2025</p>

        <div className="prose prose-invert max-w-none space-y-8 text-zinc-300 leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-zinc-100 mb-3">1. Introduction and Acceptance</h2>
            <p>
              Welcome to MVRshare ("the Platform", "we", "our", "us"). MVRshare is an open-source community
              platform dedicated to the sharing of MVR files, GDTF patches, 3D scenes, and related assets
              within the professional lighting design community.
            </p>
            <p className="mt-3">
              MVRshare is operated by <strong className="text-zinc-200">Benjamin Gueyte</strong>, an individual
              based in Mulhouse, France. For any enquiries, please contact:{' '}
              <span className="text-amber-400">legal@mvrshare.com</span>
            </p>
            <p className="mt-3">
              By creating an account or accessing any part of the Platform, you ("User", "you") agree to be
              bound by these Terms and Conditions ("Terms"). If you do not agree with any part of these Terms,
              you must not use the Platform.
            </p>
            <p className="mt-3">
              We reserve the right to update these Terms at any time. Continued use of the Platform after
              changes constitutes acceptance of the revised Terms. We will notify registered users of
              significant changes via email.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-100 mb-3">2. Eligibility</h2>
            <p>By creating an account, you confirm that:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>You are at least 16 years of age.</li>
              <li>You have the legal capacity to enter into a binding agreement.</li>
              <li>You are not prohibited from using the Platform under applicable law.</li>
              <li>The information you provide during registration is accurate and complete.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-100 mb-3">3. Account Registration</h2>
            <p>
              To access certain features, you must create an account. You are responsible for maintaining
              the confidentiality of your login credentials and for all activity that occurs under your
              account. You must notify us immediately at{' '}
              <span className="text-amber-400">legal@mvrshare.com</span> of any unauthorized use of your account.
            </p>
            <p className="mt-3">
              We reserve the right to suspend or terminate accounts that violate these Terms, without prior
              notice and at our sole discretion.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-100 mb-3">4. Use of the Platform</h2>
            <p>
              You agree to use the Platform only for lawful purposes and in a manner that does not infringe
              the rights of others. You must not:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Post or share content that is illegal, harmful, threatening, abusive, defamatory, or obscene.</li>
              <li>Impersonate any person or entity or misrepresent your affiliation.</li>
              <li>Upload files containing malware, viruses, or malicious code.</li>
              <li>Attempt to gain unauthorized access to any part of the Platform or its infrastructure.</li>
              <li>Use automated tools to scrape, crawl, or harvest content without our express written consent.</li>
              <li>Engage in any activity that disrupts or interferes with the Platform's functionality.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-100 mb-3">5. Community Standards</h2>
            <p>
              MVRshare is a professional community. All interactions — including comments, forum posts, and
              messages — must remain respectful, constructive, and relevant to the lighting design field.
              The following conduct is strictly prohibited:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Harassment, bullying, or targeted abuse of other users.</li>
              <li>Discrimination based on race, gender, nationality, religion, sexual orientation, or disability.</li>
              <li>Spam, unsolicited advertising, or off-topic promotional content.</li>
              <li>Sharing false, misleading, or deliberately inaccurate technical information.</li>
              <li>Publishing personal information of others without their consent (doxxing).</li>
            </ul>
            <p className="mt-3">
              We reserve the right to remove any content that violates these standards and to suspend or
              permanently ban users who repeatedly breach community conduct rules.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-100 mb-3">6. Public Content and Visibility</h2>
            <p>
              Content you publish on the Platform — including uploaded files, profile information, comments,
              and forum posts — may be publicly accessible and potentially indexed by search engines.
              By publishing content, you acknowledge and accept this public visibility. If you wish to
              remove public content, you may do so at any time via your account settings or by contacting us.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-100 mb-3">7. File Upload and Content Policy</h2>
            <p>By uploading files or content to MVRshare, you confirm that:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>You are the original creator of the content, or you hold all necessary rights, licenses,
                and permissions to upload and share it.</li>
              <li>The content does not infringe any third-party intellectual property rights, including
                copyrights, trademarks, or patents.</li>
              <li>You have the right to grant MVRshare the license described in Section 8 below.</li>
              <li>The files do not contain confidential or proprietary information belonging to third parties
                (including clients, employers, or production companies) unless you have explicit authorization
                to share such information.</li>
              <li>GDTF and MVR files shared comply with the applicable open standards and do not embed
                proprietary data from third-party manufacturers beyond what is publicly licensed.</li>
            </ul>
            <p className="mt-3">
              MVRshare does not accept responsibility for content uploaded by users. We reserve the right to
              remove any file that we reasonably believe infringes intellectual property rights or violates
              these Terms, without prior notice.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-100 mb-3">8. Intellectual Property and License</h2>
            <p>
              <strong className="text-zinc-100">Your content:</strong> You retain full ownership of all
              files and content you upload to MVRshare. By uploading content, you grant MVRshare a worldwide,
              non-exclusive, royalty-free license to store, display, and distribute your content solely for
              the purpose of operating the Platform. This license does not grant us the right to sell your
              content or use it for commercial purposes outside of the Platform.
            </p>
            <p className="mt-3">
              <strong className="text-zinc-100">Licenses applied to shared files:</strong> When uploading a
              file, you may choose the license under which it is shared (e.g. CC0, CC BY, CC BY-SA, MIT).
              You are solely responsible for ensuring the selected license accurately reflects the rights
              you hold and intend to grant.
            </p>
            <p className="mt-3">
              <strong className="text-zinc-100">MVRshare Platform:</strong> The MVRshare codebase is
              open-source and released under the MIT License. The MVRshare name, logo, and branding are
              the property of Benjamin Gueyte and may not be used without prior written consent.
            </p>
            <p className="mt-3">
              <strong className="text-zinc-100">Reporting infringement:</strong> If you believe content on
              the Platform infringes your intellectual property rights, please contact us at{' '}
              <span className="text-amber-400">legal@mvrshare.com</span> with a detailed description and
              proof of ownership. We will investigate and take appropriate action promptly.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-100 mb-3">9. Communications and Newsletter</h2>
            <p>
              By creating an account on MVRshare, you agree to receive essential transactional emails
              related to your account (e.g. account confirmation, security alerts, service notifications).
              These communications are necessary for the operation of your account and cannot be opted out
              of while your account remains active.
            </p>
            <p className="mt-3">
              With your separate and explicit consent (provided via a dedicated checkbox at registration),
              we may also send you:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>The MVRshare newsletter, including platform updates, new features, and community highlights.</li>
              <li>Announcements about new files, featured designers, and community events.</li>
              <li>Occasional information about partnerships or products relevant to the lighting design industry.</li>
            </ul>
            <p className="mt-3">
              Marketing communications will only be sent if you have explicitly opted in. You may withdraw
              your consent and unsubscribe at any time by clicking the "Unsubscribe" link in any email,
              or by updating your preferences in your account settings. Withdrawal of consent will not
              affect the lawfulness of processing carried out before withdrawal.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-100 mb-3">10. Disclaimer and Limitation of Liability</h2>
            <p>
              The Platform is provided "as is" and "as available" without warranties of any kind, express
              or implied. We do not guarantee that the Platform will be uninterrupted, error-free, or secure.
            </p>
            <p className="mt-3">
              MVRshare is not liable for any direct, indirect, incidental, or consequential damages arising
              from your use of the Platform, including but not limited to loss of data, lost profits, or
              damages resulting from files downloaded from the Platform. You use downloaded files at your
              own risk and responsibility.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-100 mb-3">11. Termination</h2>
            <p>
              You may delete your account at any time by contacting us at{' '}
              <span className="text-amber-400">legal@mvrshare.com</span>. Upon account deletion, your
              personal data will be removed in accordance with our Privacy Policy.
            </p>
            <p className="mt-3">
              Uploaded files that have been publicly shared on the Platform may remain available after
              account deletion where necessary to preserve community content integrity, unless you
              explicitly request their removal prior to or at the time of account deletion.
            </p>
            <p className="mt-3">
              We reserve the right to terminate or suspend your account at any time, with or without notice,
              for conduct that violates these Terms or is otherwise harmful to the Platform, its users,
              or third parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-100 mb-3">12. Governing Law</h2>
            <p>
              These Terms are governed by and construed in accordance with French law and applicable
              European Union regulations. Any disputes arising under these Terms shall be subject to
              the exclusive jurisdiction of the competent courts of France.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-100 mb-3">13. Contact</h2>
            <p>
              For any questions regarding these Terms, please contact:{' '}
              <span className="text-amber-400">legal@mvrshare.com</span>
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
