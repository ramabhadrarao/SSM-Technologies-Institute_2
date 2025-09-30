import React from 'react';
import { useSettings } from '../hooks/useSettings';

const Terms: React.FC = () => {
  const { generalSettings, allSettings, loading } = useSettings();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 mb-4">
                By accessing and using the services provided by {loading ? 'SSM Technologies Institute' : generalSettings?.siteName || 'SSM Technologies Institute'} ("we," "us," or "our"), you accept and agree to be bound by the terms and provision of this agreement.
              </p>
              <p className="text-gray-700 mb-4">
                If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
              <p className="text-gray-700 mb-4">
                We provide online educational services including but not limited to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Online courses and training programs</li>
                <li>Educational materials and resources</li>
                <li>Student progress tracking and certification</li>
                <li>Instructor-led sessions and support</li>
                <li>Community forums and discussion platforms</li>
                <li>Career guidance and placement assistance</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts and Registration</h2>
              <p className="text-gray-700 mb-4">
                To access certain features of our service, you must register for an account. When you register, you agree to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and update your information to keep it accurate</li>
                <li>Keep your password secure and confidential</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized use</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. User Conduct and Responsibilities</h2>
              <p className="text-gray-700 mb-4">You agree not to use the service to:</p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on intellectual property rights</li>
                <li>Upload malicious code or harmful content</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Share false or misleading information</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Use the service for commercial purposes without permission</li>
                <li>Interfere with the proper functioning of the service</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Course Enrollment and Payment</h2>
              <h3 className="text-xl font-medium text-gray-900 mb-3">Enrollment:</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Course enrollment is subject to availability</li>
                <li>We reserve the right to cancel or reschedule courses</li>
                <li>Prerequisites must be met before enrollment</li>
                <li>Age restrictions may apply to certain courses</li>
                {allSettings?.courses && (
                  <>
                    {allSettings.courses.maxStudentsPerClass && (
                      <li>Maximum students per class: {allSettings.courses.maxStudentsPerClass}</li>
                    )}
                    {allSettings.courses.allowSelfEnrollment && (
                      <li>Self-enrollment is available for eligible courses</li>
                    )}
                    {allSettings.courses.requireApproval && (
                      <li>Instructor approval may be required for certain courses</li>
                    )}
                  </>
                )}
              </ul>
              
              <h3 className="text-xl font-medium text-gray-900 mb-3">Payment and Refunds:</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Payment is required at the time of enrollment</li>
                <li>Refunds are subject to our refund policy</li>
                <li>Prices are subject to change without notice</li>
                <li>Additional fees may apply for certain services</li>
                {allSettings?.payments && (
                  <>
                    {allSettings.payments.currency && (
                      <li>All payments are processed in {allSettings.payments.currency}</li>
                    )}
                    {allSettings.payments.taxRate && (
                      <li>Tax rate of {allSettings.payments.taxRate}% applies to applicable transactions</li>
                    )}
                    {allSettings.payments.allowPartialPayments && (
                      <li>Partial payments may be available for certain courses</li>
                    )}
                    {allSettings.payments.refundPolicy && (
                      <li>Refund policy: {allSettings.payments.refundPolicy}</li>
                    )}
                  </>
                )}
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Intellectual Property Rights</h2>
              <p className="text-gray-700 mb-4">
                All content, materials, and resources provided through our service are protected by intellectual property laws. This includes:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Course materials, videos, and documentation</li>
                <li>Software, applications, and source code</li>
                <li>Trademarks, logos, and branding</li>
                <li>Website design and user interface</li>
              </ul>
              <p className="text-gray-700 mb-4">
                You may not reproduce, distribute, or create derivative works without our express written permission.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Privacy and Data Protection</h2>
              <p className="text-gray-700 mb-4">
                Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference.
              </p>
              <p className="text-gray-700 mb-4">
                By using our service, you consent to the collection and use of your information as described in our Privacy Policy.
              </p>
              
              {allSettings?.security && (
                <div className="bg-blue-50 p-4 rounded-lg mt-4">
                  <h3 className="text-lg font-medium text-blue-900 mb-2">Security Measures</h3>
                  <ul className="list-disc pl-6 text-blue-800 text-sm">
                    {allSettings.security.enableTwoFactor && (
                      <li>Two-factor authentication is available for enhanced account security</li>
                    )}
                    {allSettings.security.sessionTimeout && (
                      <li>Sessions automatically expire after {allSettings.security.sessionTimeout} minutes of inactivity</li>
                    )}
                    {allSettings.security.maxLoginAttempts && (
                      <li>Account lockout after {allSettings.security.maxLoginAttempts} failed login attempts</li>
                    )}
                    {allSettings.security.passwordMinLength && (
                      <li>Passwords must be at least {allSettings.security.passwordMinLength} characters long</li>
                    )}
                    {allSettings.security.requireSpecialChars && (
                      <li>Passwords must include special characters for enhanced security</li>
                    )}
                  </ul>
                </div>
              )}
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Service Availability and Modifications</h2>
              <p className="text-gray-700 mb-4">
                We strive to provide reliable service, but we cannot guarantee:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Uninterrupted or error-free service</li>
                <li>Compatibility with all devices or browsers</li>
                <li>Availability of specific features or content</li>
              </ul>
              <p className="text-gray-700 mb-4">
                We reserve the right to modify, suspend, or discontinue any part of our service at any time.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Disclaimers and Limitation of Liability</h2>
              <p className="text-gray-700 mb-4">
                Our service is provided "as is" without warranties of any kind. We disclaim all warranties, express or implied, including but not limited to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Merchantability and fitness for a particular purpose</li>
                <li>Non-infringement of third-party rights</li>
                <li>Accuracy or completeness of content</li>
                <li>Achievement of specific learning outcomes</li>
              </ul>
              <p className="text-gray-700 mb-4">
                Our liability is limited to the maximum extent permitted by law.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Indemnification</h2>
              <p className="text-gray-700 mb-4">
                You agree to indemnify and hold us harmless from any claims, damages, or expenses arising from:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Your use of our service</li>
                <li>Your violation of these Terms</li>
                <li>Your infringement of any third-party rights</li>
                <li>Any content you submit or share</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Termination</h2>
              <p className="text-gray-700 mb-4">
                We may terminate or suspend your account and access to our service at any time, with or without cause, including for:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Violation of these Terms</li>
                <li>Fraudulent or illegal activity</li>
                <li>Non-payment of fees</li>
                <li>Inactive accounts</li>
              </ul>
              <p className="text-gray-700 mb-4">
                You may terminate your account at any time by contacting us.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Governing Law and Dispute Resolution</h2>
              <p className="text-gray-700 mb-4">
                These Terms are governed by and construed in accordance with applicable laws. Any disputes arising from these Terms or your use of our service will be resolved through:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Good faith negotiation</li>
                <li>Mediation, if necessary</li>
                <li>Binding arbitration as a last resort</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Changes to Terms</h2>
              <p className="text-gray-700 mb-4">
                We reserve the right to modify these Terms at any time. We will notify users of material changes by:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Posting updated Terms on our website</li>
                <li>Sending email notifications to registered users</li>
                <li>Displaying prominent notices on our platform</li>
              </ul>
              <p className="text-gray-700 mb-4">
                Continued use of our service after changes constitutes acceptance of the new Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Contact Information</h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>Email:</strong> {loading ? 'legal@ssmtech.com' : generalSettings?.contactEmail || 'legal@ssmtech.com'}
                </p>
                <p className="text-gray-700">
                  <strong>Phone:</strong> {loading ? '+1 (555) 123-4567' : generalSettings?.contactPhone || '+1 (555) 123-4567'}
                </p>
                <p className="text-gray-700">
                  <strong>Address:</strong><br />
                  {loading ? (
                    <span className="animate-pulse">Loading address...</span>
                  ) : (
                    generalSettings?.address ? (
                      generalSettings.address.split('\n').map((line, index) => (
                        <span key={index}>
                          {line}
                          {index < generalSettings.address.split('\n').length - 1 && <br />}
                        </span>
                      ))
                    ) : (
                      <>
                        123 Education Street<br />
                        Knowledge City, KC 12345<br />
                        India
                      </>
                    )
                  )}
                </p>
                
                {allSettings?.email && allSettings.email.fromEmail && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-gray-600 text-sm">
                      <strong>Legal inquiries:</strong> {allSettings.email.fromEmail}
                    </p>
                    {allSettings.email.fromName && (
                      <p className="text-gray-600 text-sm">
                        <strong>Official correspondence from:</strong> {allSettings.email.fromName}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </section>

            <div className="border-t pt-6 mt-8">
              <p className="text-sm text-gray-500">
                By using our service, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;