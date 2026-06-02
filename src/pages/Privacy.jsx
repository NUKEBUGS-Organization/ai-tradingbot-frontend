import React from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const sectionClass = 'legal-section';
const h2Class = 'legal-h2';
const pClass = 'legal-p';
const ulClass = 'legal-ul';

export default function Privacy() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Header title="Privacy Policy" />
        <div className="page-content legal-page">
          <h1 className="legal-title">Privacy Policy</h1>
          <p className="legal-updated">Last updated: June 2026</p>

          <section className={sectionClass}>
            <h2 className={h2Class}>1. Information We Collect</h2>
            <p className={pClass}>We collect the following types of information when you use VCL4X Engine:</p>
            <ul className={ulClass}>
              <li><strong>Account information:</strong> Name, email address, and password (encrypted)</li>
              <li><strong>Payment information:</strong> Processed securely by Paddle — we do not store card details</li>
              <li><strong>Usage data:</strong> Platform features accessed, session duration, analytical preferences</li>
              <li><strong>Telegram data:</strong> Telegram user ID if you subscribe to our research channel</li>
              <li><strong>Technical data:</strong> IP address, browser type, device information for security purposes</li>
            </ul>
          </section>

          <section className={sectionClass}>
            <h2 className={h2Class}>2. How We Use Your Information</h2>
            <ul className={ulClass}>
              <li>To provide and maintain your Platform subscription and access</li>
              <li>To deliver market analytics and research alerts to your dashboard and Telegram</li>
              <li>To process payments and manage subscription billing</li>
              <li>To communicate important Platform updates and changes</li>
              <li>To improve Platform performance and analytical capabilities</li>
              <li>To comply with legal obligations and prevent fraud</li>
            </ul>
          </section>

          <section className={sectionClass}>
            <h2 className={h2Class}>3. Information We Do NOT Collect</h2>
            <ul className={ulClass}>
              <li>Broker account credentials or trading account access</li>
              <li>Bank account or financial account details</li>
              <li>Trade history from your personal broker accounts</li>
              <li>Any information that would allow us to access or trade your accounts</li>
            </ul>
          </section>

          <section className={sectionClass}>
            <h2 className={h2Class}>4. Data Sharing</h2>
            <p className={pClass}>
              We do not sell, rent, or trade your personal information to third parties. We share data only with:
            </p>
            <ul className={ulClass}>
              <li><strong>Paddle:</strong> Payment processing (subject to Paddle&apos;s Privacy Policy)</li>
              <li><strong>MongoDB Atlas:</strong> Secure cloud database storage</li>
              <li><strong>Telegram:</strong> Research alert delivery (only your Telegram ID)</li>
              <li><strong>Legal authorities:</strong> When required by law or court order</li>
            </ul>
          </section>

          <section className={sectionClass}>
            <h2 className={h2Class}>5. Data Security</h2>
            <p className={pClass}>
              We implement industry-standard security measures including SSL/TLS encryption, JWT authentication,
              bcrypt password hashing, and secure cloud infrastructure. However, no internet transmission is
              100% secure and we cannot guarantee absolute security.
            </p>
          </section>

          <section className={sectionClass}>
            <h2 className={h2Class}>6. Data Retention</h2>
            <p className={pClass}>
              We retain your account data for as long as your subscription is active. Upon account deletion,
              we remove your personal data within 30 days, except where retention is required by law.
              Analytical data that does not identify you personally may be retained for platform improvement.
            </p>
          </section>

          <section className={sectionClass}>
            <h2 className={h2Class}>7. Your Rights</h2>
            <p className={pClass}>Depending on your jurisdiction, you may have the right to:</p>
            <ul className={ulClass}>
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your personal data</li>
              <li>Object to processing of your data</li>
              <li>Request data portability</li>
              <li>Withdraw consent at any time</li>
            </ul>
            <p className={pClass}>
              To exercise these rights, contact us through the dashboard or Telegram community.
            </p>
          </section>

          <section className={sectionClass}>
            <h2 className={h2Class}>8. Cookies</h2>
            <p className={pClass}>
              We use essential cookies for authentication and session management. We do not use
              advertising or tracking cookies. You can control cookies through your browser settings,
              though disabling essential cookies may affect Platform functionality.
            </p>
          </section>

          <section className={sectionClass}>
            <h2 className={h2Class}>9. Children&apos;s Privacy</h2>
            <p className={pClass}>
              The Platform is not intended for users under 18 years of age. We do not knowingly collect
              personal information from minors. If you believe a minor has provided us with personal data,
              please contact us immediately.
            </p>
          </section>

          <section className={sectionClass}>
            <h2 className={h2Class}>10. Changes to This Policy</h2>
            <p className={pClass}>
              We may update this Privacy Policy periodically. We will notify you of material changes via
              email or platform notification. Continued use of the Platform after changes constitutes
              acceptance of the updated policy.
            </p>
          </section>

          <section className={sectionClass}>
            <h2 className={h2Class}>11. Contact Us</h2>
            <p className={pClass}>
              For privacy-related questions or to exercise your rights, contact us through the dashboard
              support system or via Telegram: @VCL4XAlphaAccess
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
