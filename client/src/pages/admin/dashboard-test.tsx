import { useAuth } from "@/hooks/useAuth";

export default function AdminDashboardTest() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard Test</h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
          <p><strong>Is Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
          <p><strong>User Role:</strong> {user?.role || 'None'}</p>
          <p><strong>User Email:</strong> {user?.email || 'None'}</p>
          <p><strong>User Name:</strong> {user?.firstName} {user?.lastName}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Test Content</h2>
          <p>If you can see this page, the basic admin dashboard routing is working.</p>
          <p>The issue might be with the complex dashboard component or its dependencies.</p>
        </div>
      </div>
    </div>
  );
}
