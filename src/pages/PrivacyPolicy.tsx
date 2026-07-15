import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import logoSrc from '@/assets/NEU-logo_RGB_main-color.png';
import { AppFooter } from '@/components/AppFooter';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background page-transition">
      <header className="border-b border-border/60 sticky top-0 z-10 bg-background/80 backdrop-blur-xl">
        <div className="container-wide py-4">
          <div className="flex items-center gap-3">
            <img src={logoSrc} alt="NeutralPath 2030" className="h-9 w-auto object-contain" />
          </div>
        </div>
      </header>

      <main className="py-12 md:py-20">
        <div className="container-narrow">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-8 gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          <article className="prose prose-sm max-w-none">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">
              <span className="bg-gradient-to-r from-brand-primary to-brand-secondary text-transparent bg-clip-text">
                Privacy Policy
              </span>
            </h1>
            <p className="text-muted-foreground mb-8 text-sm">
              Last updated: March 2026
            </p>

            <section className="space-y-8">
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-3">1. Introduction</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  The Governance Model Canvas ("the App") is a web-based tool developed within the EU co-funded
                  NEUTRALPATH project. This Privacy Policy explains how we collect, use, and protect your personal
                  data when you use our application. We are committed to safeguarding your privacy and ensuring
                  compliance with the General Data Protection Regulation (GDPR) and other applicable data protection
                  laws.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-foreground mb-3">2. Data We Collect</h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  We collect the following types of data:
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                  <li>
                    <strong className="text-foreground">Project Data:</strong> Project names, governance canvas
                    content, and template selections you create within the application.
                  </li>
                  <li>
                    <strong className="text-foreground">Access Codes:</strong> Unique codes generated for each
                    project to enable sharing and collaboration.
                  </li>
                  <li>
                    <strong className="text-foreground">Email Addresses:</strong> When you use the sharing
                    functionality to send your project via email, the recipient's email address is processed to
                    deliver the invitation.
                  </li>
                  <li>
                    <strong className="text-foreground">Usage Data:</strong> Basic interaction data such as access
                    code attempt logs (IP address and timestamp) for security and rate-limiting purposes.
                  </li>
                </ul>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-foreground mb-3">3. Local Storage and Cookies</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  The App uses <strong className="text-foreground">browser local storage</strong> (not cookies) to
                  store user preferences such as onboarding tutorial completion status. This data remains on your
                  device and is not transmitted to our servers. We do not use tracking cookies or third-party
                  analytics services.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-foreground mb-3">4. How We Use Your Data</h2>
                <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                  <li>To create, store, and retrieve your governance model projects.</li>
                  <li>To generate and validate project access codes for collaboration.</li>
                  <li>To send project sharing emails on your behalf.</li>
                  <li>To export your canvas as PDF documents.</li>
                  <li>To prevent abuse through rate limiting of access code attempts.</li>
                </ul>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-foreground mb-3">5. Data Storage and Security</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Your data is stored securely using industry-standard cloud infrastructure with encrypted
                  connections (TLS/SSL). Access to project data is controlled through unique access codes and
                  Row-Level Security policies that ensure only authorised users can view or modify their projects.
                  We implement appropriate technical and organisational measures to protect your data against
                  unauthorised access, alteration, disclosure, or destruction.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-foreground mb-3">6. Data Sharing</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We do not sell, trade, or otherwise transfer your personal data to third parties. Data may be
                  shared only in the following circumstances:
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground mt-3">
                  <li>When you explicitly share a project via email with a collaborator.</li>
                  <li>With cloud service providers who process data on our behalf under strict data processing agreements.</li>
                  <li>When required by law or to protect our legal rights.</li>
                </ul>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-foreground mb-3">7. Data Retention</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Project data is retained for as long as the project exists in the system. Access code attempt
                  logs are periodically cleaned up for security purposes. You may request deletion of your project
                  data at any time by contacting us.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-foreground mb-3">8. Your Rights</h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  Under GDPR, you have the right to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Access the personal data we hold about you.</li>
                  <li>Request correction of inaccurate data.</li>
                  <li>Request deletion of your data.</li>
                  <li>Object to or restrict the processing of your data.</li>
                  <li>Data portability — receive your data in a structured, machine-readable format.</li>
                </ul>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-foreground mb-3">9. Children's Privacy</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  The App is not intended for use by children under the age of 16. We do not knowingly collect
                  personal data from children.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-foreground mb-3">10. Changes to This Policy</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We may update this Privacy Policy from time to time. Any changes will be reflected on this page
                  with an updated revision date. We encourage you to review this policy periodically.
                </p>
              </div>

              <div className="rounded-2xl border border-border/60 bg-card p-6 mt-8">
                <h2 className="text-lg font-semibold text-foreground mb-3">11. Contact Us</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  If you have any questions about this Privacy Policy or wish to exercise your data protection
                  rights, please contact us at:
                </p>
                <div className="mt-4 space-y-1 text-sm">
                  <p className="text-foreground font-medium">NEUTRALPATH Project</p>
                  <p className="text-muted-foreground">
                    Website:{' '}
                    <a
                      href="https://neutralpath.eu/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-primary hover:underline"
                    >
                      neutralpath.eu
                    </a>
                  </p>
                </div>
              </div>
            </section>
          </article>
        </div>
      </main>

      <AppFooter />
    </div>
  );
};

export default PrivacyPolicy;
