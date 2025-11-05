import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import AdminNavbar from "@/components/layout/admin-navbar";
import AdminSidebar from "@/components/layout/admin-sidebar";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Calendar, 
  FileText, 
  Download,
  Filter,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle
} from "lucide-react";

// Mock data for charts - in production, this would come from API
const revenueData = [
  { month: 'Jan', revenue: 45620, bookings: 23, contracts: 18 },
  { month: 'Feb', revenue: 52300, bookings: 28, contracts: 22 },
  { month: 'Mar', revenue: 48900, bookings: 25, contracts: 20 },
  { month: 'Apr', revenue: 61200, bookings: 32, contracts: 28 },
  { month: 'May', revenue: 58700, bookings: 30, contracts: 25 },
  { month: 'Jun', revenue: 67400, bookings: 35, contracts: 31 },
];

const talentPerformanceData = [
  { name: 'Sarah Johnson', bookings: 12, revenue: 18500, rating: 4.9 },
  { name: 'Mike Chen', bookings: 8, revenue: 14200, rating: 4.8 },
  { name: 'Emma Davis', bookings: 10, revenue: 16800, rating: 4.7 },
  { name: 'Alex Rodriguez', bookings: 6, revenue: 9600, rating: 4.9 },
  { name: 'Lisa Wang', bookings: 9, revenue: 15300, rating: 4.8 },
];

const bookingStatusData = [
  { name: 'Completed', value: 156, color: '#10b981' },
  { name: 'In Progress', value: 43, color: '#3b82f6' },
  { name: 'Pending', value: 28, color: '#f59e0b' },
  { name: 'Cancelled', value: 12, color: '#ef4444' },
];

const categoryData = [
  { category: 'Fashion', bookings: 45, revenue: 67500 },
  { category: 'Commercial', bookings: 38, revenue: 52600 },
  { category: 'Film/TV', bookings: 32, revenue: 89200 },
  { category: 'Events', bookings: 28, revenue: 35400 },
  { category: 'Print', bookings: 25, revenue: 31800 },
];

export default function AdminReports() {
  const { isAuthenticated, user } = useAuth();
  const [timeRange, setTimeRange] = useState("6months");
  const [reportType, setReportType] = useState("overview");

  const handleExportReport = () => {
    // Generate CSV data
    const csvData = [];
    
    // Add header
    csvData.push(['5Telite Talent Platform - Analytics Report']);
    csvData.push(['Generated:', new Date().toLocaleString()]);
    csvData.push(['Time Range:', timeRange]);
    csvData.push([]);
    
    // Revenue Data
    csvData.push(['Revenue Trends']);
    csvData.push(['Month', 'Revenue', 'Bookings', 'Contracts']);
    revenueData.forEach(item => {
      csvData.push([item.month, `$${item.revenue}`, item.bookings, item.contracts]);
    });
    csvData.push([]);
    
    // Talent Performance
    csvData.push(['Top Performing Talents']);
    csvData.push(['Name', 'Bookings', 'Revenue', 'Rating']);
    talentPerformanceData.forEach(item => {
      csvData.push([item.name, item.bookings, `$${item.revenue}`, item.rating]);
    });
    csvData.push([]);
    
    // Booking Status
    csvData.push(['Booking Status Distribution']);
    csvData.push(['Status', 'Count']);
    bookingStatusData.forEach(item => {
      csvData.push([item.name, item.value]);
    });
    csvData.push([]);
    
    // Category Performance
    csvData.push(['Performance by Category']);
    csvData.push(['Category', 'Bookings', 'Revenue']);
    categoryData.forEach(item => {
      csvData.push([item.category, item.bookings, `$${item.revenue}`]);
    });
    
    // Convert to CSV string
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `5telite-analytics-report-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Fetch dashboard stats for real data
  const { data: dashboardStats } = useQuery({
    queryKey: ["/api/admin/dashboard-stats"],
    enabled: isAuthenticated && user?.role === 'admin',
    retry: false,
  });

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Access Denied</h1>
          <p className="text-slate-600">You need admin privileges to access reports.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNavbar />
      
      <div className="flex">
        <AdminSidebar />
        
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                  <BarChart3 className="h-8 w-8 text-blue-600" />
                  Reports & Analytics
                </h1>
                <p className="text-slate-600 mt-2">Comprehensive business insights and performance metrics</p>
              </div>
              
              <div className="flex items-center gap-4">
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1month">Last Month</SelectItem>
                    <SelectItem value="3months">Last 3 Months</SelectItem>
                    <SelectItem value="6months">Last 6 Months</SelectItem>
                    <SelectItem value="1year">Last Year</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline" onClick={handleExportReport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </div>

            {/* Key Metrics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Total Revenue</p>
                      <p className="text-3xl font-bold text-slate-900">$334,120</p>
                      <p className="text-sm text-green-600 flex items-center mt-1">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        +12.5% from last period
                      </p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-full">
                      <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Total Bookings</p>
                      <p className="text-3xl font-bold text-slate-900">173</p>
                      <p className="text-sm text-blue-600 flex items-center mt-1">
                        <Activity className="h-4 w-4 mr-1" />
                        +8.2% from last period
                      </p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-full">
                      <Calendar className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Active Talents</p>
                      <p className="text-3xl font-bold text-slate-900">47</p>
                      <p className="text-sm text-purple-600 flex items-center mt-1">
                        <Users className="h-4 w-4 mr-1" />
                        +3 new this month
                      </p>
                    </div>
                    <div className="bg-purple-100 p-3 rounded-full">
                      <Users className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Contracts Signed</p>
                      <p className="text-3xl font-bold text-slate-900">144</p>
                      <p className="text-sm text-amber-600 flex items-center mt-1">
                        <FileText className="h-4 w-4 mr-1" />
                        83% completion rate
                      </p>
                    </div>
                    <div className="bg-amber-100 p-3 rounded-full">
                      <FileText className="h-6 w-6 text-amber-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Analytics Tabs */}
            <Tabs defaultValue="revenue" className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="revenue">Revenue</TabsTrigger>
                <TabsTrigger value="bookings">Bookings</TabsTrigger>
                <TabsTrigger value="talents">Talents</TabsTrigger>
                <TabsTrigger value="categories">Categories</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
              </TabsList>

              {/* Revenue Analytics */}
              <TabsContent value="revenue" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Revenue Trends</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={revenueData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
                          <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Monthly Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {revenueData.slice(-3).map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <div>
                              <p className="font-medium">{item.month}</p>
                              <p className="text-sm text-slate-600">{item.bookings} bookings</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-green-600">${item.revenue.toLocaleString()}</p>
                              <p className="text-sm text-slate-600">{item.contracts} contracts</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Bookings Analytics */}
              <TabsContent value="bookings" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Booking Status Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={bookingStatusData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {bookingStatusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Booking Metrics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="bg-green-100 p-2 rounded-full">
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <p className="font-medium">Success Rate</p>
                              <p className="text-sm text-slate-600">Completed bookings</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-green-600">87.3%</p>
                            <Badge className="bg-green-100 text-green-800">Excellent</Badge>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="bg-blue-100 p-2 rounded-full">
                              <Clock className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium">Average Duration</p>
                              <p className="text-sm text-slate-600">From inquiry to completion</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-blue-600">14.5</p>
                            <p className="text-sm text-slate-600">days</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="bg-amber-100 p-2 rounded-full">
                              <AlertTriangle className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                              <p className="font-medium">Cancellation Rate</p>
                              <p className="text-sm text-slate-600">Cancelled bookings</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-amber-600">5.1%</p>
                            <Badge className="bg-amber-100 text-amber-800">Good</Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Talent Analytics */}
              <TabsContent value="talents" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Top Performing Talents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={talentPerformanceData} layout="horizontal">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={100} />
                        <Tooltip formatter={(value, name) => [
                          name === 'revenue' ? `$${value.toLocaleString()}` : value,
                          name === 'revenue' ? 'Revenue' : 'Bookings'
                        ]} />
                        <Legend />
                        <Bar dataKey="bookings" fill="#3b82f6" name="Bookings" />
                        <Bar dataKey="revenue" fill="#10b981" name="Revenue" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Categories Analytics */}
              <TabsContent value="categories" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Performance by Category</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={categoryData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip />
                        <Legend />
                        <Bar yAxisId="left" dataKey="bookings" fill="#3b82f6" name="Bookings" />
                        <Bar yAxisId="right" dataKey="revenue" fill="#10b981" name="Revenue ($)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Performance Analytics */}
              <TabsContent value="performance" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Platform Health</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Response Time</span>
                          <span className="text-sm font-bold text-green-600">Fast (1.2s)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{width: '85%'}}></div>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">User Satisfaction</span>
                          <span className="text-sm font-bold text-blue-600">4.8/5.0</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{width: '96%'}}></div>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Contract Completion</span>
                          <span className="text-sm font-bold text-purple-600">91.2%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-purple-500 h-2 rounded-full" style={{width: '91%'}}></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="text-sm font-medium">Contract signed</p>
                            <p className="text-xs text-slate-600">Fashion shoot with Sarah J.</p>
                          </div>
                          <span className="text-xs text-slate-500 ml-auto">2h ago</span>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                          <Users className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="text-sm font-medium">New talent approved</p>
                            <p className="text-xs text-slate-600">Alex Rodriguez joined</p>
                          </div>
                          <span className="text-xs text-slate-500 ml-auto">4h ago</span>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
                          <Calendar className="h-5 w-5 text-amber-600" />
                          <div>
                            <p className="text-sm font-medium">Booking inquiry</p>
                            <p className="text-xs text-slate-600">Commercial shoot request</p>
                          </div>
                          <span className="text-xs text-slate-500 ml-auto">6h ago</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
