import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

export default function Terms() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-slate-900 mb-8">Terms of Service</h1>
        
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-slate-600 leading-relaxed">
              By accessing and using the 5Telite Talent Platform, you accept and agree to be bound by the terms and provision of this agreement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">2. Use of Platform</h2>
            <p className="text-slate-600 leading-relaxed">
              You agree to use the platform only for lawful purposes and in accordance with these Terms of Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">3. User Accounts</h2>
            <p className="text-slate-600 leading-relaxed">
              You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">4. Intellectual Property</h2>
            <p className="text-slate-600 leading-relaxed">
              The content, organization, graphics, design, and other matters related to the platform are protected under applicable copyrights and other proprietary laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">5. Contact Information</h2>
            <p className="text-slate-600 leading-relaxed">
              If you have any questions about these Terms of Service, please contact us at support@5telite.org
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

