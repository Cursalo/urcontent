import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Users,
  Store,
  TrendingUp,
  DollarSign,
  MessageCircle,
  Star,
  AlertTriangle,
  CheckCircle,
  Clock,
  Crown,
  Camera,
  Activity
} from "lucide-react";

const AdminDashboard = () => {
  // Mock data - replace with real API calls
  const platformStats = [
    { title: "Total Users", value: "12,847", icon: Users, trend: { value: "12.5%", isPositive: true }, description: "Active users this month" },
    { title: "Revenue", value: "$485,320", icon: DollarSign, trend: { value: "8.2%", isPositive: true }, description: "Platform commission this month" },
    { title: "Collaborations", value: "2,847", icon: MessageCircle, trend: { value: "15.3%", isPositive: true }, description: "Completed this month" },
    { title: "Success Rate", value: "98.2%", icon: Star, trend: { value: "0.8%", isPositive: true }, description: "Project completion rate" }
  ];

  const userGrowthData = [
    { month: 'Jan', creators: 1200, businesses: 450, total: 1650 },
    { month: 'Feb', creators: 1350, businesses: 520, total: 1870 },
    { month: 'Mar', creators: 1580, businesses: 680, total: 2260 },
    { month: 'Apr', creators: 1820, businesses: 780, total: 2600 },
    { month: 'May', creators: 2100, businesses: 890, total: 2990 },
    { month: 'Jun', creators: 2450, businesses: 1020, total: 3470 }
  ];

  const revenueData = [
    { month: 'Jan', revenue: 125000, commissions: 18750 },
    { month: 'Feb', revenue: 145000, commissions: 21750 },
    { month: 'Mar', revenue: 168000, commissions: 25200 },
    { month: 'Apr', revenue: 195000, commissions: 29250 },
    { month: 'May', revenue: 225000, commissions: 33750 },
    { month: 'Jun', revenue: 260000, commissions: 39000 }
  ];

  const categoryData = [
    { name: 'Restaurants', value: 35, color: '#FF6B6B' },
    { name: 'Fitness', value: 25, color: '#4ECDC4' },
    { name: 'Fashion', value: 20, color: '#45B7D1' },
    { name: 'Tech', value: 12, color: '#96CEB4' },
    { name: 'Others', value: 8, color: '#FECA57' }
  ];

  const recentUsers = [
    { id: 1, name: "María García", email: "maria@example.com", role: "creator", status: "active", joinDate: "2024-01-15", avatar: "MG" },
    { id: 2, name: "Café Central", email: "info@cafecentral.com", role: "business", status: "active", joinDate: "2024-01-14", avatar: "CC" },
    { id: 3, name: "Fitness Pro", email: "contact@fitnesspro.com", role: "business", status: "pending", joinDate: "2024-01-13", avatar: "FP" },
    { id: 4, name: "Julia Content", email: "julia@creator.com", role: "creator", status: "active", joinDate: "2024-01-12", avatar: "JC" },
    { id: 5, name: "TechStore", email: "hello@techstore.com", role: "business", status: "active", joinDate: "2024-01-11", avatar: "TS" }
  ];

  const recentCollaborations = [
    { id: 1, brand: "Café Central", creator: "María García", status: "completed", value: "$2,500", date: "2024-01-15" },
    { id: 2, brand: "Fitness Pro", creator: "Sofia Wellness", status: "in_progress", value: "$1,800", date: "2024-01-14" },
    { id: 3, brand: "TechStore", creator: "Tech Reviewer", status: "completed", value: "$3,200", date: "2024-01-13" },
    { id: 4, brand: "Fashion Brand", creator: "Style Guru", status: "pending", value: "$2,100", date: "2024-01-12" },
    { id: 5, brand: "Restaurant XYZ", creator: "Food Blogger", status: "completed", value: "$1,950", date: "2024-01-11" }
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: "Active", className: "bg-green-100 text-green-800" },
      pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
      completed: { label: "Completed", className: "bg-blue-100 text-blue-800" },
      in_progress: { label: "In Progress", className: "bg-purple-100 text-purple-800" },
      suspended: { label: "Suspended", className: "bg-red-100 text-red-800" }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getRoleIcon = (role: string) => {
    return role === 'creator' ? <Camera className="w-4 h-4" /> : <Store className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-2">
            <Crown className="w-6 h-6 text-yellow-600" />
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>
          <p className="text-gray-600">Platform overview and management tools</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {platformStats.map((stat, index) => (
            <StatsCard
              key={index}
              title={stat.title}
              value={stat.value}
              description={stat.description}
              icon={stat.icon}
              trend={stat.trend}
              className="hover:shadow-lg transition-shadow"
            />
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* User Growth Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>User Growth</span>
              </CardTitle>
              <CardDescription>Monthly user registration trends</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="creators" stackId="1" stroke="#E91E63" fill="#E91E63" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="businesses" stackId="1" stroke="#3F51B5" fill="#3F51B5" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5" />
                <span>Revenue Analytics</span>
              </CardTitle>
              <CardDescription>Platform revenue and commissions</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
                  <Line type="monotone" dataKey="revenue" stroke="#4CAF50" strokeWidth={3} />
                  <Line type="monotone" dataKey="commissions" stroke="#FF9800" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Industry Distribution & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Industry Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5" />
                <span>Industry Distribution</span>
              </CardTitle>
              <CardDescription>Collaboration breakdown by category</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>System Status</span>
              </CardTitle>
              <CardDescription>Platform health and performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-900">API Services</p>
                      <p className="text-sm text-green-700">All systems operational</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Activity className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-900">Database</p>
                      <p className="text-sm text-blue-700">Response time: 23ms</p>
                    </div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">Optimal</Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-yellow-600" />
                    <div>
                      <p className="font-medium text-yellow-900">Payment Processing</p>
                      <p className="text-sm text-yellow-700">Scheduled maintenance in 2 days</p>
                    </div>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800">Scheduled</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tables Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Users */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Recent Users</span>
                </div>
                <Button variant="outline" size="sm">View All</Button>
              </CardTitle>
              <CardDescription>Latest user registrations</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
                              {user.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{user.name}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          {getRoleIcon(user.role)}
                          <span className="capitalize text-sm">{user.role}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell className="text-sm text-gray-500">{user.joinDate}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Recent Collaborations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MessageCircle className="w-5 h-5" />
                  <span>Recent Collaborations</span>
                </div>
                <Button variant="outline" size="sm">View All</Button>
              </CardTitle>
              <CardDescription>Latest platform activity</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Collaboration</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentCollaborations.map((collab) => (
                    <TableRow key={collab.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{collab.brand}</p>
                          <p className="text-xs text-gray-500">with {collab.creator}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{collab.value}</TableCell>
                      <TableCell>{getStatusBadge(collab.status)}</TableCell>
                      <TableCell className="text-sm text-gray-500">{collab.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;