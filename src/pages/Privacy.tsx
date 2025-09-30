import React from 'react';
import { useSettings } from '../hooks/useSettings';

const Privacy: React.FC = () => {
  const { generalSettings, allSettings, loading } = useSettings();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Information We Collect</h2>
              <p className="text-gray-700 mb-4">
                At {loading ? 'SSM Technologies Institute' : generalSettings?.siteName || 'SSM Technologies Institute'}, we collect information you provide directly to us, such as when you:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Create an account or register for courses</li>
                <li>Submit contact forms or communicate with us</li>
                <li>Upload documents, resumes, or other materials</li>
                <li>Participate in surveys or feedback forms</li>
                <li>Subscribe to our newsletters or updates</li>
              </ul>
              
              <h3 className="text-xl font-medium text-gray-900 mb-3">Types of Information:</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li><strong>Personal Information:</strong> Name, email address, phone number, address</li>
                <li><strong>Educational Information:</strong> Course enrollments, progress, certificates</li>
                <li><strong>Technical Information:</strong> IP address, browser type, device information</li>
                <li><strong>Usage Information:</strong> Pages visited, time spent, interactions with content</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. How We Use Your Information</h2>
              <p className="text-gray-700 mb-4">We use the information we collect to:</p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Provide, maintain, and improve our educational services</li>
                <li>Process course enrollments and track your progress</li>
                <li>Communicate with you about courses, updates, and support</li>
                <li>Send you newsletters and promotional materials (with your consent)</li>
                <li>Analyze usage patterns to improve our platform</li>
                <li>Ensure security and prevent fraud</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Information Sharing and Disclosure</h2>
              <p className="text-gray-700 mb-4">
                We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except in the following circumstances:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li><strong>Service Providers:</strong> We may share information with trusted third-party service providers who assist us in operating our platform</li>
                <li><strong>Legal Requirements:</strong> We may disclose information when required by law or to protect our rights and safety</li>
                <li><strong>Business Transfers:</strong> In the event of a merger or acquisition, your information may be transferred</li>
                <li><strong>Consent:</strong> We may share information with your explicit consent</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Data Security</h2>
              <p className="text-gray-700 mb-4">
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Encryption of sensitive data in transit and at rest</li>
                <li>Regular security assessments and updates</li>
                <li>Access controls and authentication measures</li>
                <li>Employee training on data protection practices</li>
                {allSettings?.security && (
                  <>
                    {allSettings.security.enableTwoFactorAuth && (
                      <li>Two-factor authentication for enhanced account security</li>
                    )}
                    <li>Session timeout after {loading ? '60 minutes' : Math.floor((allSettings.security.sessionTimeout || 3600) / 60)} minutes of inactivity</li>
                    <li>Account lockout protection after {loading ? '5' : allSettings.security.maxLoginAttempts || 5} failed login attempts</li>
                    <li>Minimum password length requirement of {loading ? '6' : allSettings.security.passwordMinLength || 6} characters</li>
                    {allSettings.security.requirePasswordChange && (
                      <li>Regular password updates every {loading ? '90' : allSettings.security.passwordChangeInterval || 90} days</li>
                    )}
                  </>
                )}
              </ul>
              
              {allSettings?.backup && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Data Backup and Recovery</h4>
                  <p className="text-blue-800 text-sm">
                    {allSettings.backup.enableAutoBackup ? (
                      <>
                        We maintain {allSettings.backup.backupFrequency} automated backups of your data, 
                        retained for {allSettings.backup.backupRetention} days to ensure data recovery capabilities 
                        in case of system failures.
                      </>
                    ) : (
                      'We maintain regular backups of your data to ensure recovery capabilities in case of system failures.'
                    )}
                  </p>
                </div>
              )}
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Your Rights and Choices</h2>
              <p className="text-gray-700 mb-4">You have the following rights regarding your personal information:</p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li><strong>Access:</strong> Request access to your personal information</li>
                <li><strong>Correction:</strong> Request correction of inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                <li><strong>Portability:</strong> Request a copy of your data in a portable format</li>
                <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
                <li><strong>Restriction:</strong> Request restriction of processing in certain circumstances</li>
              </ul>
              
              {allSettings?.notifications && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">Communication Preferences</h4>
                  <p className="text-green-800 text-sm mb-2">
                    We respect your communication preferences. You can control the following types of notifications:
                  </p>
                  <ul className="text-green-800 text-sm list-disc pl-4">
                    {allSettings.notifications.enableEmailNotifications && (
                      <li>Email notifications for important updates and communications</li>
                    )}
                    {allSettings.notifications.enableSMSNotifications && (
                      <li>SMS notifications for urgent alerts and reminders</li>
                    )}
                    {allSettings.notifications.enablePushNotifications && (
                      <li>Push notifications through our mobile application</li>
                    )}
                    {allSettings.notifications.notifyOnEnrollment && (
                      <li>Course enrollment confirmations and updates</li>
                    )}
                    {allSettings.notifications.notifyOnClassSchedule && (
                      <li>Class schedule changes and reminders</li>
                    )}
                    {allSettings.notifications.notifyOnAssignmentDue && (
                      <li>Assignment due date reminders</li>
                    )}
                  </ul>
                </div>
              )}
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Cookies and Tracking Technologies</h2>
              <p className="text-gray-700 mb-4">
                We use cookies and similar tracking technologies to enhance your experience on our platform. These technologies help us:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Remember your preferences and settings</li>
                <li>Analyze site traffic and usage patterns</li>
                <li>Provide personalized content and recommendations</li>
                <li>Ensure security and prevent fraud</li>
              </ul>
              <p className="text-gray-700 mb-4">
                You can control cookie settings through your browser preferences.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Children's Privacy</h2>
              <p className="text-gray-700 mb-4">
                Our services are not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected such information, we will take steps to delete it promptly.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. International Data Transfers</h2>
              <p className="text-gray-700 mb-4">
                Your information may be transferred to and processed in countries other than your own. We ensure that such transfers comply with applicable data protection laws and implement appropriate safeguards.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Changes to This Privacy Policy</h2>
              <p className="text-gray-700 mb-4">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Contact Us</h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>Email:</strong> {loading ? 'info@ssmtech.com' : generalSettings?.contactEmail || 'info@ssmtech.com'}
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
                      <strong>Privacy-related inquiries:</strong> {allSettings.email.fromEmail}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;