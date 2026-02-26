import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { SEO } from "@/components/SEO";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-slate-50">
      <SEO 
        title="Privacy Policy - 5T Elite Talent Platform"
        description="Read the privacy policy for 5T Elite Talent Platform. Learn how we collect, use, and protect your personal information."
        keywords="privacy policy, data protection, personal information"
        url="/privacy"
      />
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-slate-900 mb-8">Privacy Policy</h1>
        
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">1. Information We Collect</h2>
            <p className="text-slate-600 leading-relaxed">
              We collect information that you provide directly to us, including your name, email address, phone number, and other contact information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">2. How We Use Your Information</h2>
            <p className="text-slate-600 leading-relaxed">
              We use the information we collect to provide, maintain, and improve our services, to communicate with you, and to protect our users.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">3. Information Sharing</h2>
            <p className="text-slate-600 leading-relaxed">
              We do not share your personal information with third parties except as described in this Privacy Policy or with your consent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">4. Data Security</h2>
            <p className="text-slate-600 leading-relaxed">
              We take reasonable measures to help protect your personal information from loss, theft, misuse, unauthorized access, disclosure, alteration, and destruction.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">5. Your Rights</h2>
            <p className="text-slate-600 leading-relaxed">
              You have the right to access, update, or delete your personal information at any time. You can do this through your account settings or by contacting us.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">6. Contact Us</h2>
            <p className="text-slate-600 leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us at privacy@5telite.org
            </p>
          </section>

          <p className="text-sm text-slate-500 mt-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
