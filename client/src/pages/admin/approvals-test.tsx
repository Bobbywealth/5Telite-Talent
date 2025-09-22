import AdminNavbar from "@/components/layout/admin-navbar";
import AdminSidebar from "@/components/layout/admin-sidebar";

export default function AdminApprovalsTest() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex">
      <AdminSidebar />
      <div className="flex-1">
        <AdminNavbar />
        
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-8">
          <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
              Admin Approvals - Test Page
            </h1>
            <p className="text-base md:text-lg text-slate-600 mt-4">
              This is a test page to verify routing is working.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
