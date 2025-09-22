import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import AdminNavbar from "@/components/layout/admin-navbar";
import AdminSidebar from "@/components/layout/admin-sidebar";
import { 
  BookOpen, 
  Users, 
  Calendar, 
  FileText, 
  CheckSquare, 
  Settings,
  Home,
  UserPlus,
  ClipboardCheck,
  Bell,
  DollarSign,
  Mail,
  Shield
} from "lucide-react";

export default function AdminTraining() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <AdminNavbar />
      
      <div className="flex">
        <AdminSidebar />
        
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <BookOpen className="h-8 w-8 text-blue-600" />
                Admin Training Guide
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Complete guide to managing the 5T Elite Talent Platform
              </p>
            </div>

            {/* Training Content */}
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="talents">Talents</TabsTrigger>
                <TabsTrigger value="bookings">Bookings</TabsTrigger>
                <TabsTrigger value="contracts">Contracts</TabsTrigger>
                <TabsTrigger value="tasks">Tasks</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Home className="h-5 w-5" />
                      Platform Overview
                    </CardTitle>
                    <CardDescription>Understanding the 5T Elite Talent Platform</CardDescription>
                  </CardHeader>
                  <CardContent className="prose prose-slate max-w-none">
                    <div className="space-y-6">
                      <section>
                        <h3 className="text-lg font-semibold mb-3">Welcome to 5T Elite Talent Platform</h3>
                        <p className="text-slate-600 dark:text-slate-400 mb-4">
                          As an administrator, you have complete control over the platform. Your role includes managing talents, 
                          overseeing bookings, handling contracts, and ensuring smooth operations.
                        </p>
                      </section>

                      <section>
                        <h3 className="text-lg font-semibold mb-3">Key Responsibilities</h3>
                        <ul className="list-disc pl-6 space-y-2 text-slate-600 dark:text-slate-400">
                          <li><strong>Talent Management:</strong> Review and approve new talent applications, manage talent profiles</li>
                          <li><strong>Booking Oversight:</strong> Monitor booking requests, facilitate client-talent connections</li>
                          <li><strong>Contract Administration:</strong> Create and manage contracts between clients and talents</li>
                          <li><strong>Task Assignment:</strong> Create and assign tasks to talents for specific bookings</li>
                          <li><strong>Platform Configuration:</strong> Manage settings, categories, and platform preferences</li>
                        </ul>
                      </section>

                      <section>
                        <h3 className="text-lg font-semibold mb-3">Navigation Guide</h3>
                        <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
                          <p className="font-medium mb-2">Main Navigation Areas:</p>
                          <ul className="space-y-2 text-sm">
                            <li>• <strong>Top Navigation Bar:</strong> Quick access to notifications and user menu</li>
                            <li>• <strong>Left Sidebar:</strong> Main navigation menu with all platform sections</li>
                            <li>• <strong>Main Content Area:</strong> Where you'll perform most actions</li>
                          </ul>
                        </div>
                      </section>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Dashboard Tab */}
              <TabsContent value="dashboard" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Home className="h-5 w-5" />
                      Dashboard Management
                    </CardTitle>
                    <CardDescription>Your command center for platform operations</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <section>
                      <h3 className="text-lg font-semibold mb-3">Dashboard Overview</h3>
                      <p className="text-slate-600 dark:text-slate-400 mb-4">
                        The dashboard provides a real-time overview of platform activity and key metrics.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">Key Metrics Explained</h3>
                      <div className="space-y-4">
                        <div className="border-l-4 border-blue-500 pl-4">
                          <h4 className="font-medium">Active Talents</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Shows the number of approved talents currently active on the platform.
                          </p>
                        </div>
                        
                        <div className="border-l-4 border-green-500 pl-4">
                          <h4 className="font-medium">Active Bookings</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Displays bookings in progress (inquiry, proposed, contract_sent, signed, invoiced, paid statuses).
                          </p>
                        </div>
                        
                        <div className="border-l-4 border-purple-500 pl-4">
                          <h4 className="font-medium">Pending Reviews</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Number of talent applications awaiting your approval.
                          </p>
                        </div>
                        
                        <div className="border-l-4 border-amber-500 pl-4">
                          <h4 className="font-medium">Revenue This Month</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Total revenue from completed bookings in the current month.
                          </p>
                        </div>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">Quick Actions</h3>
                      <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
                        <p className="font-medium mb-2">From the dashboard, you can:</p>
                        <ul className="space-y-1 text-sm">
                          <li>• Click "Manage Talents" to review talent applications</li>
                          <li>• Click "View Bookings" to see all booking requests</li>
                          <li>• Click "Task Manager" to create and assign tasks</li>
                        </ul>
                      </div>
                    </section>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Talents Tab */}
              <TabsContent value="talents" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Talent Management
                    </CardTitle>
                    <CardDescription>Managing talent profiles and applications</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <section>
                      <h3 className="text-lg font-semibold mb-3">Talent Review Process</h3>
                      <ol className="list-decimal pl-6 space-y-3 text-slate-600 dark:text-slate-400">
                        <li>
                          <strong>Navigate to Talents Page:</strong> Click "Manage Talents" from sidebar or dashboard
                        </li>
                        <li>
                          <strong>Review Applications:</strong> Look for talents with "Under Review" status
                        </li>
                        <li>
                          <strong>View Profile Details:</strong> Click on a talent card to see their full profile including:
                          <ul className="list-disc pl-6 mt-2">
                            <li>Personal information and stage name</li>
                            <li>Categories and skills</li>
                            <li>Physical measurements and characteristics</li>
                            <li>Portfolio images and experience</li>
                            <li>Social media links</li>
                          </ul>
                        </li>
                        <li>
                          <strong>Make a Decision:</strong>
                          <ul className="list-disc pl-6 mt-2">
                            <li><Badge className="bg-green-100 text-green-800">Approve</Badge> - Talent becomes visible to clients</li>
                            <li><Badge className="bg-red-100 text-red-800">Reject</Badge> - Talent application is declined</li>
                          </ul>
                        </li>
                      </ol>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">Managing Existing Talents</h3>
                      <div className="space-y-3">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                          <h4 className="font-medium mb-2">Editing Talent Information</h4>
                          <p className="text-sm">You can update talent profiles by clicking "Edit" on their profile page. 
                          This includes updating their categories, rates, and availability.</p>
                        </div>
                        
                        <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
                          <h4 className="font-medium mb-2">Deactivating Talents</h4>
                          <p className="text-sm">If a talent is no longer available or violates platform policies, 
                          you can deactivate their profile to hide them from client searches.</p>
                        </div>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">Best Practices</h3>
                      <ul className="list-disc pl-6 space-y-2 text-slate-600 dark:text-slate-400">
                        <li>Review new applications within 24-48 hours</li>
                        <li>Verify talent information and portfolio quality</li>
                        <li>Ensure profile completeness before approval</li>
                        <li>Communicate clearly when requesting additional information</li>
                      </ul>
                    </section>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Bookings Tab */}
              <TabsContent value="bookings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Booking Management
                    </CardTitle>
                    <CardDescription>Overseeing the booking workflow from inquiry to completion</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <section>
                      <h3 className="text-lg font-semibold mb-3">Booking Workflow Stages</h3>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <Badge className="bg-blue-100 text-blue-800 mt-1">1. Inquiry</Badge>
                          <div>
                            <p className="font-medium">Initial client interest</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              Client has submitted a booking request. Review details and match with appropriate talents.
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <Badge className="bg-purple-100 text-purple-800 mt-1">2. Proposed</Badge>
                          <div>
                            <p className="font-medium">Talent selection phase</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              You've proposed specific talents to the client. Await client confirmation.
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <Badge className="bg-amber-100 text-amber-800 mt-1">3. Contract Sent</Badge>
                          <div>
                            <p className="font-medium">Legal documentation</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              Contract has been generated and sent to talent for signature.
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <Badge className="bg-green-100 text-green-800 mt-1">4. Signed</Badge>
                          <div>
                            <p className="font-medium">Booking confirmed</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              Contract signed by all parties. Booking is legally confirmed.
                            </p>
                          </div>
                        </div>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">Managing Booking Requests</h3>
                      <ol className="list-decimal pl-6 space-y-3 text-slate-600 dark:text-slate-400">
                        <li>
                          <strong>Review New Inquiries:</strong> Check "Booking Requests" page daily
                        </li>
                        <li>
                          <strong>Assess Requirements:</strong> Understand client needs, budget, and timeline
                        </li>
                        <li>
                          <strong>Match Talents:</strong> 
                          <ul className="list-disc pl-6 mt-2">
                            <li>Use filters to find suitable talents</li>
                            <li>Consider availability, skills, and rates</li>
                            <li>Select multiple options when possible</li>
                          </ul>
                        </li>
                        <li>
                          <strong>Send Proposals:</strong> Present talent options to the client
                        </li>
                        <li>
                          <strong>Create Contracts:</strong> Once client approves, generate contracts
                        </li>
                        <li>
                          <strong>Monitor Progress:</strong> Track booking through to completion
                        </li>
                      </ol>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">Important Actions</h3>
                      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                        <h4 className="font-medium mb-2 text-red-800 dark:text-red-200">Handling Cancellations</h4>
                        <p className="text-sm">If a booking needs to be cancelled, update the status immediately and notify all parties. 
                        Document the reason for cancellation for future reference.</p>
                      </div>
                    </section>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Contracts Tab */}
              <TabsContent value="contracts" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Contract Management
                    </CardTitle>
                    <CardDescription>Creating and managing legal agreements</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <section>
                      <h3 className="text-lg font-semibold mb-3">Creating Contracts</h3>
                      <ol className="list-decimal pl-6 space-y-3 text-slate-600 dark:text-slate-400">
                        <li>
                          <strong>Navigate to Contracts:</strong> Click "Contracts" in the sidebar
                        </li>
                        <li>
                          <strong>Click "Create Contract":</strong> Opens the contract creation dialog
                        </li>
                        <li>
                          <strong>Select Booking:</strong> Choose from confirmed bookings that need contracts
                        </li>
                        <li>
                          <strong>Select Talent:</strong> Pick the specific talent for this contract
                        </li>
                        <li>
                          <strong>Create & Send:</strong> System automatically:
                          <ul className="list-disc pl-6 mt-2">
                            <li>Generates contract with booking details</li>
                            <li>Sends email notification to talent</li>
                            <li>Creates signature request</li>
                            <li>Sets 7-day expiration deadline</li>
                          </ul>
                        </li>
                      </ol>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">Contract Organization</h3>
                      <div className="space-y-3">
                        <div className="border-l-4 border-blue-500 pl-4">
                          <h4 className="font-medium">Active Contracts Tab</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Shows contracts awaiting signatures (draft or sent status)
                          </p>
                        </div>
                        
                        <div className="border-l-4 border-green-500 pl-4">
                          <h4 className="font-medium">Completed Tab</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Displays fully signed contracts
                          </p>
                        </div>
                        
                        <div className="border-l-4 border-purple-500 pl-4">
                          <h4 className="font-medium">All Contracts Tab</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Complete contract history including expired/cancelled
                          </p>
                        </div>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">Contract Details Include</h3>
                      <ul className="list-disc pl-6 space-y-2 text-slate-600 dark:text-slate-400">
                        <li>Booking information and project details</li>
                        <li>Talent and client contact information</li>
                        <li>Rates and payment terms</li>
                        <li>Usage rights and deliverables</li>
                        <li>Terms and conditions</li>
                        <li>Digital signature fields</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">Monitoring Signatures</h3>
                      <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
                        <p className="text-sm">Regularly check the "Active Contracts" tab for pending signatures. 
                        Follow up with talents if contracts are approaching expiration. The system shows signature 
                        progress (e.g., "1/2 signatures completed").</p>
                      </div>
                    </section>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tasks Tab */}
              <TabsContent value="tasks" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckSquare className="h-5 w-5" />
                      Task Management
                    </CardTitle>
                    <CardDescription>Creating and assigning tasks to talents</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <section>
                      <h3 className="text-lg font-semibold mb-3">Creating Tasks</h3>
                      <ol className="list-decimal pl-6 space-y-3 text-slate-600 dark:text-slate-400">
                        <li>
                          <strong>Navigate to Tasks:</strong> Click "Task Manager" in sidebar
                        </li>
                        <li>
                          <strong>Click "Create Task":</strong> Opens the task creation form
                        </li>
                        <li>
                          <strong>Fill Task Details:</strong>
                          <ul className="list-disc pl-6 mt-2">
                            <li><strong>Title:</strong> Clear, descriptive task name</li>
                            <li><strong>Description:</strong> Detailed instructions and expectations</li>
                            <li><strong>Scope:</strong> Choose from:
                              <ul className="list-circle pl-6">
                                <li>Booking - Task related to specific booking</li>
                                <li>Talent - General task for talent</li>
                                <li>General - Platform-wide task</li>
                              </ul>
                            </li>
                            <li><strong>Due Date:</strong> Task deadline</li>
                            <li><strong>Priority:</strong> Low, Medium, High, or Urgent</li>
                          </ul>
                        </li>
                        <li>
                          <strong>Assign to Talent:</strong> Select specific talent or multiple talents
                        </li>
                        <li>
                          <strong>Link to Booking:</strong> If applicable, connect to related booking
                        </li>
                      </ol>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">Task Priorities</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                          <Badge className="bg-gray-500 text-white mb-2">Low</Badge>
                          <p className="text-sm">Non-urgent, can be completed when convenient</p>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
                          <Badge className="bg-blue-500 text-white mb-2">Medium</Badge>
                          <p className="text-sm">Standard priority, complete within deadline</p>
                        </div>
                        <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded">
                          <Badge className="bg-amber-500 text-white mb-2">High</Badge>
                          <p className="text-sm">Important task, prioritize completion</p>
                        </div>
                        <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded">
                          <Badge className="bg-red-500 text-white mb-2">Urgent</Badge>
                          <p className="text-sm">Immediate attention required</p>
                        </div>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">Managing Tasks</h3>
                      <ul className="list-disc pl-6 space-y-2 text-slate-600 dark:text-slate-400">
                        <li><strong>View Task Status:</strong> Monitor pending, in-progress, and completed tasks</li>
                        <li><strong>Update Tasks:</strong> Edit task details or reassign as needed</li>
                        <li><strong>Delete Tasks:</strong> Remove tasks that are no longer relevant</li>
                        <li><strong>Track Completion:</strong> Talents mark tasks complete when finished</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">Task Notifications</h3>
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                        <p className="text-sm">When you create a task, the assigned talent receives:
                        <ul className="list-disc pl-6 mt-2">
                          <li>Email notification with task details</li>
                          <li>In-app notification (bell icon)</li>
                          <li>Task appears in their dashboard</li>
                        </ul>
                        </p>
                      </div>
                    </section>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Additional Resources */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium flex items-center gap-2 mb-2">
                      <Settings className="h-4 w-4" />
                      Settings Configuration
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Access platform settings to configure categories, email templates, and system preferences.
                    </p>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium flex items-center gap-2 mb-2">
                      <Bell className="h-4 w-4" />
                      Notifications
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Monitor the notification bell for important updates and system alerts.
                    </p>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium flex items-center gap-2 mb-2">
                      <Mail className="h-4 w-4" />
                      Email Communications
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      System automatically sends emails for bookings, contracts, and task assignments.
                    </p>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium flex items-center gap-2 mb-2">
                      <Shield className="h-4 w-4" />
                      Security Best Practices
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Regularly review user activities and maintain secure access credentials.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Reference */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Reference Guide</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-lg">
                  <h4 className="font-medium mb-4">Daily Admin Checklist</h4>
                  <div className="space-y-2 text-sm">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span>Review new talent applications</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span>Check pending booking requests</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span>Monitor active contract signatures</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span>Review overdue tasks</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span>Check system notifications</span>
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
