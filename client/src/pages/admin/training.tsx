import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import AdminNavbar from "@/components/layout/admin-navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Users, 
  Calendar, 
  FileText, 
  ClipboardList, 
  Settings, 
  Bell,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  Info
} from "lucide-react";

export default function AdminTraining() {
  const { isAuthenticated, user } = useAuth();
  const [activeSection, setActiveSection] = useState("overview");

  if (!isAuthenticated || user?.role !== 'admin') {
    window.location.href = '/api/login';
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-4 flex items-center">
            <BookOpen className="w-8 h-8 mr-3 text-blue-600" />
            Admin Training Guide
          </h1>
          <p className="text-lg text-slate-600">
            Complete step-by-step guide to managing your 5T Elite Talent Platform
          </p>
        </div>

        <Tabs value={activeSection} onValueChange={setActiveSection} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="talents">Talents</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="contracts">Contracts</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Info className="w-5 h-5 mr-2 text-blue-600" />
                  Platform Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-slate max-w-none">
                <h3>Welcome to Your 5T Elite Talent Platform</h3>
                <p>
                  As an administrator, you have complete control over the talent booking ecosystem. 
                  This platform helps you manage talent, bookings, contracts, and tasks efficiently.
                </p>
                
                <h4>Key Responsibilities:</h4>
                <ul>
                  <li><strong>Talent Management:</strong> Approve new talent applications, manage profiles</li>
                  <li><strong>Booking Coordination:</strong> Create bookings, manage client requests</li>
                  <li><strong>Contract Administration:</strong> Generate and track contract signatures</li>
                  <li><strong>Task Management:</strong> Assign and monitor project tasks</li>
                  <li><strong>Platform Oversight:</strong> Monitor system health and user activity</li>
                </ul>

                <h4>Navigation Structure:</h4>
                <div className="grid grid-cols-2 gap-4 not-prose">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h5 className="font-semibold text-blue-900 mb-2">Core Functions</h5>
                    <ul className="text-sm space-y-1">
                      <li>• Dashboard - Overview & Stats</li>
                      <li>• Manage Talents - Talent approval & profiles</li>
                      <li>• Manage Bookings - Booking creation & management</li>
                      <li>• Contracts - Contract generation & tracking</li>
                    </ul>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h5 className="font-semibold text-green-900 mb-2">Support Functions</h5>
                    <ul className="text-sm space-y-1">
                      <li>• Task Management - Project coordination</li>
                      <li>• View Directory - Public talent view</li>
                      <li>• Settings - Platform configuration</li>
                      <li>• Notifications - Real-time updates</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2 text-purple-600" />
                  Admin Dashboard Guide
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-slate max-w-none">
                <h3>Dashboard Overview</h3>
                <p>Your dashboard provides real-time insights into platform activity and performance.</p>

                <h4>📊 Key Metrics</h4>
                <div className="bg-slate-50 p-4 rounded-lg not-prose">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Total Talents:</strong> Number of registered talents
                    </div>
                    <div>
                      <strong>Total Bookings:</strong> All booking requests in system
                    </div>
                    <div>
                      <strong>Active Bookings:</strong> Bookings in progress or confirmed
                    </div>
                    <div>
                      <strong>Pending Approvals:</strong> Talent applications awaiting review
                    </div>
                  </div>
                </div>

                <h4>🎯 Quick Actions</h4>
                <ol>
                  <li><strong>View Talents:</strong> Click to see all talent applications and profiles</li>
                  <li><strong>Manage Bookings:</strong> Access booking creation and management</li>
                  <li><strong>Create Tasks:</strong> Assign tasks to talents or for specific bookings</li>
                  <li><strong>View Directory:</strong> See the public talent directory as clients see it</li>
                </ol>

                <h4>🔔 Notifications</h4>
                <p>
                  The notification bell (top-right) shows:
                </p>
                <ul>
                  <li>New talent applications requiring approval</li>
                  <li>Booking requests from clients</li>
                  <li>Contract signatures completed</li>
                  <li>Task updates and completions</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Talents Tab */}
          <TabsContent value="talents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2 text-green-600" />
                  Talent Management Guide
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-slate max-w-none">
                <h3>Managing Talent Applications</h3>
                
                <h4>📝 Approval Process</h4>
                <ol>
                  <li><strong>Navigate:</strong> Go to "Manage Talents" from dashboard or sidebar</li>
                  <li><strong>Review Applications:</strong> Look for talents with "Pending" status</li>
                  <li><strong>View Profile:</strong> Click "View Details" to see full talent profile</li>
                  <li><strong>Check Information:</strong>
                    <ul>
                      <li>Stage name and bio</li>
                      <li>Categories and skills</li>
                      <li>Experience level</li>
                      <li>Measurements and photos</li>
                      <li>Contact information</li>
                    </ul>
                  </li>
                  <li><strong>Make Decision:</strong> Click "Approve" or "Reject"</li>
                  <li><strong>Notification:</strong> Talent receives email about approval status</li>
                </ol>

                <div className="bg-green-50 p-4 rounded-lg not-prose">
                  <h5 className="font-semibold text-green-800 mb-2">✅ Approval Criteria</h5>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Complete profile with professional bio</li>
                    <li>• Clear, professional photos</li>
                    <li>• Relevant skills and experience</li>
                    <li>• Accurate contact information</li>
                    <li>• Appropriate categories selected</li>
                  </ul>
                </div>

                <h4>🔍 Search & Filter</h4>
                <ul>
                  <li><strong>Search Bar:</strong> Find talents by name, skills, or location</li>
                  <li><strong>Status Filter:</strong> Filter by Pending, Approved, or Rejected</li>
                  <li><strong>Category Filter:</strong> Filter by talent categories (Commercial, Fashion, etc.)</li>
                  <li><strong>Location Filter:</strong> Find talents in specific cities</li>
                </ul>

                <h4>👤 Creating New Talent Profiles</h4>
                <ol>
                  <li>Click "Add New Talent" button</li>
                  <li>Fill in basic information (name, email, etc.)</li>
                  <li>System generates temporary password</li>
                  <li>Talent receives welcome email with login credentials</li>
                  <li>Talent completes their profile</li>
                  <li>You approve the completed profile</li>
                </ol>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                  Booking Management Guide
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-slate max-w-none">
                <h3>Complete Booking Workflow</h3>

                <h4>📅 Creating New Bookings</h4>
                <ol>
                  <li><strong>Access:</strong> Go to "Manage Bookings" from dashboard</li>
                  <li><strong>Click:</strong> "Create Booking Request" button</li>
                  <li><strong>Fill Details:</strong>
                    <ul>
                      <li>Project title and description</li>
                      <li>Start and end dates</li>
                      <li>Location (studio, city, etc.)</li>
                      <li>Budget/rate information</li>
                      <li>Special requirements</li>
                    </ul>
                  </li>
                  <li><strong>Save:</strong> Click "Create Booking Request"</li>
                  <li><strong>Status:</strong> Booking starts as "Inquiry"</li>
                </ol>

                <h4>🎯 Sending Talent Requests</h4>
                <ol>
                  <li><strong>Select Booking:</strong> Find the booking you created</li>
                  <li><strong>Click:</strong> "Send Requests" button</li>
                  <li><strong>Choose Talents:</strong> Select which talents to send requests to</li>
                  <li><strong>Send:</strong> Click "Send Requests to Selected Talents"</li>
                  <li><strong>Notification:</strong> Talents receive emails and in-app notifications</li>
                </ol>

                <h4>📋 Managing Responses</h4>
                <div className="bg-blue-50 p-4 rounded-lg not-prose">
                  <h5 className="font-semibold text-blue-800 mb-2">Talent Response Options</h5>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• <strong>Accept:</strong> Talent is interested and available</li>
                    <li>• <strong>Decline:</strong> Talent cannot participate</li>
                    <li>• <strong>Message:</strong> Talent can include notes with response</li>
                  </ul>
                </div>

                <h4>⚡ Booking Status Flow</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose">
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h5 className="font-semibold mb-2">Status Progression:</h5>
                    <ol className="text-sm space-y-1">
                      <li>1. <Badge variant="secondary">Inquiry</Badge> - Initial request</li>
                      <li>2. <Badge variant="outline">Proposed</Badge> - Terms proposed</li>
                      <li>3. <Badge variant="default">Contract Sent</Badge> - Contract generated</li>
                      <li>4. <Badge className="bg-green-100 text-green-800">Signed</Badge> - Contract signed</li>
                      <li>5. <Badge className="bg-blue-100 text-blue-800">Paid</Badge> - Payment processed</li>
                      <li>6. <Badge className="bg-purple-100 text-purple-800">Completed</Badge> - Project finished</li>
                    </ol>
                  </div>
                  <div className="bg-amber-50 p-4 rounded-lg">
                    <h5 className="font-semibold mb-2">Your Actions:</h5>
                    <ul className="text-sm space-y-1">
                      <li>• Review talent responses</li>
                      <li>• Update booking status</li>
                      <li>• Generate contracts</li>
                      <li>• Monitor progress</li>
                      <li>• Handle payments</li>
                    </ul>
                  </div>
                </div>

                <h4>🔄 Updating Booking Status</h4>
                <ol>
                  <li>Find the booking in your list</li>
                  <li>Click the "⋯" menu button</li>
                  <li>Select "Update Status"</li>
                  <li>Choose appropriate status based on progress</li>
                  <li>System sends notifications to relevant parties</li>
                </ol>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contracts Tab */}
          <TabsContent value="contracts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-purple-600" />
                  Contract Management Guide
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-slate max-w-none">
                <h3>Contract Creation & Management</h3>

                <h4>📄 Creating Contracts</h4>
                <ol>
                  <li><strong>Prerequisites:</strong> Must have a booking with accepted talents</li>
                  <li><strong>Navigate:</strong> Go to "Contracts" from admin menu</li>
                  <li><strong>Create:</strong> Click "Create Contract" button</li>
                  <li><strong>Select Booking:</strong> Choose from bookings with accepted talents</li>
                  <li><strong>Select Talent:</strong> Choose which talent to create contract for</li>
                  <li><strong>Generate:</strong> Click "Create Contract"</li>
                  <li><strong>Automatic:</strong> System generates contract with booking details</li>
                  <li><strong>Notification:</strong> Talent receives email and in-app notification</li>
                </ol>

                <div className="bg-purple-50 p-4 rounded-lg not-prose">
                  <h5 className="font-semibold text-purple-800 mb-2">📋 Contract Information Included</h5>
                  <div className="grid grid-cols-2 gap-4 text-sm text-purple-700">
                    <div>
                      <ul className="space-y-1">
                        <li>• Project title and description</li>
                        <li>• Talent and client information</li>
                        <li>• Dates and location</li>
                        <li>• Rate and payment terms</li>
                      </ul>
                    </div>
                    <div>
                      <ul className="space-y-1">
                        <li>• Usage rights and territory</li>
                        <li>• Deliverables and requirements</li>
                        <li>• Cancellation policy</li>
                        <li>• Signature requirements</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <h4>✍️ Contract Signing Process</h4>
                <ol>
                  <li><strong>Talent Notification:</strong> Talent receives contract via email</li>
                  <li><strong>Review Period:</strong> Talent reviews contract terms</li>
                  <li><strong>Digital Signature:</strong> Talent signs using digital signature capture</li>
                  <li><strong>Completion:</strong> You receive notification when signed</li>
                  <li><strong>Status Update:</strong> Contract status changes to "Signed"</li>
                  <li><strong>Booking Update:</strong> Booking status advances to "Signed"</li>
                </ol>

                <h4>📊 Contract Tabs</h4>
                <ul>
                  <li><strong>Active Contracts:</strong> Contracts awaiting signature (Draft, Sent)</li>
                  <li><strong>Completed:</strong> Fully signed contracts</li>
                  <li><strong>All Contracts:</strong> Complete contract history</li>
                </ul>

                <h4>🔍 Monitoring Signatures</h4>
                <ul>
                  <li>View signature status for each party</li>
                  <li>See who has signed and when</li>
                  <li>Track due dates and send reminders</li>
                  <li>Download completed contracts</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ClipboardList className="w-5 h-5 mr-2 text-orange-600" />
                  Task Management Guide
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-slate max-w-none">
                <h3>Project Task Coordination</h3>

                <h4>➕ Creating Tasks</h4>
                <ol>
                  <li><strong>Access:</strong> Go to "Task Management" from admin menu</li>
                  <li><strong>Create:</strong> Click "Create Task" button</li>
                  <li><strong>Fill Details:</strong>
                    <ul>
                      <li><strong>Title:</strong> Clear, descriptive task name</li>
                      <li><strong>Description:</strong> Detailed instructions</li>
                      <li><strong>Scope:</strong> Choose task type:
                        <ul>
                          <li><em>General:</em> Standalone administrative task</li>
                          <li><em>Booking Related:</em> Task tied to specific booking</li>
                          <li><em>Talent Specific:</em> Task about particular talent</li>
                        </ul>
                      </li>
                      <li><strong>Assignee:</strong> Who should complete the task</li>
                      <li><strong>Due Date:</strong> When task should be completed</li>
                    </ul>
                  </li>
                  <li><strong>Save:</strong> Click "Create Task"</li>
                  <li><strong>Notification:</strong> Assignee receives email and in-app notification</li>
                </ol>

                <h4>📋 Kanban Board View</h4>
                <div className="grid grid-cols-4 gap-4 not-prose">
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <h5 className="font-semibold text-gray-700">To Do</h5>
                    <p className="text-xs text-gray-600">New tasks</p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg text-center">
                    <h5 className="font-semibold text-blue-700">In Progress</h5>
                    <p className="text-xs text-blue-600">Active work</p>
                  </div>
                  <div className="bg-red-50 p-3 rounded-lg text-center">
                    <h5 className="font-semibold text-red-700">Blocked</h5>
                    <p className="text-xs text-red-600">Needs attention</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg text-center">
                    <h5 className="font-semibold text-green-700">Done</h5>
                    <p className="text-xs text-green-600">Completed</p>
                  </div>
                </div>

                <h4>⚙️ Task Actions</h4>
                <ul>
                  <li><strong>View Details:</strong> Click task to see full information</li>
                  <li><strong>Update Status:</strong> Use dropdown to change task status</li>
                  <li><strong>Drag & Drop:</strong> Move tasks between columns in Kanban view</li>
                  <li><strong>Edit:</strong> Modify task details and assignments</li>
                  <li><strong>Delete:</strong> Remove tasks (with confirmation)</li>
                </ul>

                <h4>🔍 Filtering & Search</h4>
                <ul>
                  <li><strong>Search:</strong> Find tasks by title, description, or assignee</li>
                  <li><strong>Status Filter:</strong> Show only tasks with specific status</li>
                  <li><strong>Assignee Filter:</strong> View tasks for specific people</li>
                  <li><strong>Scope Filter:</strong> Filter by task type (general, booking, talent)</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-slate-600" />
                  Platform Settings Guide
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-slate max-w-none">
                <h3>Platform Configuration</h3>

                <h4>🔧 Admin Settings</h4>
                <ol>
                  <li><strong>Access:</strong> Click your profile → "Admin Settings"</li>
                  <li><strong>Platform Settings:</strong>
                    <ul>
                      <li><strong>Site Name:</strong> Platform branding</li>
                      <li><strong>Description:</strong> Platform description</li>
                      <li><strong>Email Notifications:</strong> Enable/disable system emails</li>
                    </ul>
                  </li>
                  <li><strong>Booking Settings:</strong>
                    <ul>
                      <li><strong>Auto-approve:</strong> Automatically approve certain bookings</li>
                      <li><strong>Client Approval:</strong> Require client approval for bookings</li>
                      <li><strong>Max Booking Days:</strong> Maximum advance booking period</li>
                    </ul>
                  </li>
                  <li><strong>Policies:</strong>
                    <ul>
                      <li><strong>Cancellation Policy:</strong> Terms for booking cancellations</li>
                      <li><strong>Payment Terms:</strong> Payment deadlines and conditions</li>
                    </ul>
                  </li>
                </ol>

                <h4>🔔 Notification Management</h4>
                <div className="bg-blue-50 p-4 rounded-lg not-prose">
                  <h5 className="font-semibold text-blue-800 mb-2">Email Notification Types</h5>
                  <div className="grid grid-cols-2 gap-4 text-sm text-blue-700">
                    <div>
                      <ul className="space-y-1">
                        <li>• New talent applications</li>
                        <li>• Booking requests</li>
                        <li>• Contract signatures</li>
                        <li>• Task assignments</li>
                      </ul>
                    </div>
                    <div>
                      <ul className="space-y-1">
                        <li>• Payment confirmations</li>
                        <li>• Project completions</li>
                        <li>• System announcements</li>
                        <li>• Error alerts</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <h4>👥 User Management</h4>
                <ul>
                  <li><strong>Create Users:</strong> Add new admin, talent, or client accounts</li>
                  <li><strong>Role Management:</strong> Change user roles as needed</li>
                  <li><strong>Account Status:</strong> Activate, suspend, or manage user accounts</li>
                  <li><strong>Password Resets:</strong> Help users with login issues</li>
                </ul>

                <h4>🎨 Display Preferences</h4>
                <ul>
                  <li><strong>Theme:</strong> Light or dark mode</li>
                  <li><strong>Language:</strong> Platform language settings</li>
                  <li><strong>Timezone:</strong> Display times in your timezone</li>
                  <li><strong>Currency:</strong> Default currency for rates and payments</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Best Practices Card */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                Best Practices & Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 not-prose">
                <div className="space-y-4">
                  <h4 className="text-green-800 font-semibold">✅ Do's</h4>
                  <ul className="text-sm space-y-2">
                    <li>• Review talent profiles thoroughly before approval</li>
                    <li>• Respond to booking requests within 24 hours</li>
                    <li>• Keep contract terms clear and specific</li>
                    <li>• Use tasks to track project milestones</li>
                    <li>• Monitor notifications regularly</li>
                    <li>• Update booking statuses promptly</li>
                    <li>• Maintain professional communication</li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="text-red-800 font-semibold">❌ Don'ts</h4>
                  <ul className="text-sm space-y-2">
                    <li>• Don't approve incomplete talent profiles</li>
                    <li>• Don't create contracts without confirmed bookings</li>
                    <li>• Don't delete tasks with important information</li>
                    <li>• Don't change booking status without client confirmation</li>
                    <li>• Don't ignore overdue contracts</li>
                    <li>• Don't modify signed contracts</li>
                    <li>• Don't share sensitive talent information</li>
                  </ul>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg mt-6 not-prose">
                <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Important Notes</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Always backup important data before making changes</li>
                  <li>• Talent rates are private - only visible to you and the talent</li>
                  <li>• Contracts are legally binding once signed</li>
                  <li>• Keep track of payment deadlines</li>
                  <li>• Monitor task deadlines to ensure project success</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </Tabs>
      </div>
    </div>
  );
}
