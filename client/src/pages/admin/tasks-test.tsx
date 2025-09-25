import { useAuth } from "@/hooks/useAuth";
import AdminSidebar from "@/components/layout/admin-sidebar";
import AdminNavbar from "@/components/layout/admin-navbar";

export default function AdminTasksTest() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return <div>Access Denied</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNavbar />
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 p-6">
          <h1 className="text-2xl font-bold">Task Management Test</h1>
          <p>This is a test page to see if the component loads.</p>
        </div>
      </div>
    </div>
  );
}
