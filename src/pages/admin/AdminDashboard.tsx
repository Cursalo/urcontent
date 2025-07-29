import React, { useState, useEffect } from 'react';
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { UserInfoCard } from "@/components/dashboard/UserInfoCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
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
  Cell,
  ComposedChart
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
  Activity,
  Settings,
  FileText,
  Shield,
  Eye,
  Ban,
  UserCheck,
  Search,
  Filter,
  Download,
  RefreshCw,
  MoreVertical,
  Edit,
  Trash2,
  Globe,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Building,
  Zap,
  Database,
  Server,
  Wifi,
  HardDrive,
  Cpu,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  Percent,
  Calculator,
  CreditCard,
  Headphones,
  HelpCircle,
  MessageSquare,
  BookOpen,
  Plus,
  X
} from "lucide-react";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [userFilter, setUserFilter] = useState('all');
  const [collabFilter, setCollabFilter] = useState('all');
  const [dateRange, setDateRange] = useState('30d');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedCollab, setSelectedCollab] = useState<any>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Enhanced platform stats with comprehensive data
  const platformStats = [
    { title: "Total Users", value: "25,847", icon: Users, trend: { value: "12.5%", isPositive: true }, description: "Active users this month", subStats: { creators: "18,240", businesses: "6,987", admins: "620" } },
    { title: "Revenue", value: "$2,485,320", icon: DollarSign, trend: { value: "18.2%", isPositive: true }, description: "Platform commission this month", subStats: { gross: "$16,568,800", commission: "$2,485,320", rate: "15%" } },
    { title: "Collaborations", value: "8,847", icon: MessageCircle, trend: { value: "25.3%", isPositive: true }, description: "Completed this month", subStats: { active: "2,340", completed: "6,507", pending: "890" } },
    { title: "Success Rate", value: "96.8%", icon: Star, trend: { value: "2.1%", isPositive: true }, description: "Project completion rate", subStats: { onTime: "94.2%", quality: "98.5%", satisfaction: "97.3%" } },
    { title: "Platform Health", value: "99.9%", icon: Activity, trend: { value: "0.1%", isPositive: true }, description: "System uptime", subStats: { api: "99.98%", db: "99.95%", cdn: "99.99%" } },
    { title: "Support Tickets", value: "234", icon: Headphones, trend: { value: "-8.4%", isPositive: true }, description: "Open tickets", subStats: { new: "45", pending: "123", resolved: "66" } }
  ];

  // Enhanced data sets for comprehensive analytics
  const userGrowthData = [
    { month: 'Jan', creators: 2400, businesses: 850, admins: 45, total: 3295, retention: 94.2, churn: 5.8 },
    { month: 'Feb', creators: 2750, businesses: 1020, admins: 52, total: 3822, retention: 95.1, churn: 4.9 },
    { month: 'Mar', creators: 3180, businesses: 1280, admins: 58, total: 4518, retention: 96.3, churn: 3.7 },
    { month: 'Apr', creators: 3620, businesses: 1580, admins: 65, total: 5265, retention: 97.1, churn: 2.9 },
    { month: 'May', creators: 4200, businesses: 1890, admins: 72, total: 6162, retention: 97.8, churn: 2.2 },
    { month: 'Jun', creators: 4850, businesses: 2120, admins: 78, total: 7048, retention: 98.2, churn: 1.8 },
    { month: 'Jul', creators: 5420, businesses: 2380, admins: 85, total: 7885, retention: 98.5, churn: 1.5 }
  ];

  const revenueData = [
    { month: 'Jan', grossRevenue: 1250000, platformRevenue: 187500, payouts: 1062500, disputes: 2500, refunds: 12000 },
    { month: 'Feb', grossRevenue: 1450000, platformRevenue: 217500, payouts: 1232500, disputes: 1800, refunds: 9500 },
    { month: 'Mar', grossRevenue: 1680000, platformRevenue: 252000, payouts: 1428000, disputes: 2200, refunds: 11000 },
    { month: 'Apr', grossRevenue: 1950000, platformRevenue: 292500, payouts: 1657500, disputes: 1900, refunds: 8500 },
    { month: 'May', grossRevenue: 2250000, platformRevenue: 337500, payouts: 1912500, disputes: 1600, refunds: 7200 },
    { month: 'Jun', grossRevenue: 2600000, platformRevenue: 390000, payouts: 2210000, disputes: 1400, refunds: 6800 },
    { month: 'Jul', grossRevenue: 2850000, platformRevenue: 427500, payouts: 2422500, disputes: 1200, refunds: 5900 }
  ];

  const categoryData = [
    { name: 'Restaurants', value: 28, color: '#FF6B6B', collaborations: 2847, avgValue: 2850, growth: 12.5 },
    { name: 'Fitness', value: 22, color: '#4ECDC4', collaborations: 2234, avgValue: 3200, growth: 18.3 },
    { name: 'Fashion', value: 18, color: '#45B7D1', collaborations: 1829, avgValue: 4100, growth: 25.7 },
    { name: 'Tech', value: 15, color: '#96CEB4', collaborations: 1523, avgValue: 5200, growth: 32.1 },
    { name: 'Beauty', value: 8, color: '#FECA57', collaborations: 813, avgValue: 2950, growth: 15.8 },
    { name: 'Travel', value: 5, color: '#A8E6CF', collaborations: 508, avgValue: 3800, growth: 22.4 },
    { name: 'Others', value: 4, color: '#DDA0DD', collaborations: 406, avgValue: 2100, growth: 8.9 }
  ];

  // Comprehensive user data with enhanced fields
  const allUsers = [
    { id: 1, name: "María García", email: "maria@example.com", role: "creator", status: "active", joinDate: "2024-01-15", avatar: "MG", location: "Madrid, Spain", followers: 145000, collaborations: 23, rating: 4.9, verified: true, revenue: 45200, lastActive: "2 hours ago" },
    { id: 2, name: "Café Central", email: "info@cafecentral.com", role: "business", status: "active", joinDate: "2024-01-14", avatar: "CC", location: "Barcelona, Spain", employees: 25, campaigns: 12, rating: 4.7, verified: true, spent: 28500, lastActive: "1 day ago" },
    { id: 3, name: "Fitness Pro", email: "contact@fitnesspro.com", role: "business", status: "pending", joinDate: "2024-01-13", avatar: "FP", location: "Valencia, Spain", employees: 8, campaigns: 3, rating: 4.2, verified: false, spent: 8900, lastActive: "3 days ago" },
    { id: 4, name: "Julia Content", email: "julia@creator.com", role: "creator", status: "active", joinDate: "2024-01-12", avatar: "JC", location: "Sevilla, Spain", followers: 89000, collaborations: 18, rating: 4.8, verified: true, revenue: 32100, lastActive: "30 min ago" },
    { id: 5, name: "TechStore", email: "hello@techstore.com", role: "business", status: "active", joinDate: "2024-01-11", avatar: "TS", location: "Bilbao, Spain", employees: 15, campaigns: 8, rating: 4.5, verified: true, spent: 18700, lastActive: "4 hours ago" },
    { id: 6, name: "Ana Fitness", email: "ana@fitness.com", role: "creator", status: "suspended", joinDate: "2024-01-10", avatar: "AF", location: "Málaga, Spain", followers: 67000, collaborations: 15, rating: 3.9, verified: false, revenue: 22800, lastActive: "1 week ago" },
    { id: 7, name: "Restaurante Sol", email: "sol@restaurant.com", role: "business", status: "active", joinDate: "2024-01-09", avatar: "RS", location: "Granada, Spain", employees: 12, campaigns: 6, rating: 4.6, verified: true, spent: 15200, lastActive: "2 days ago" },
    { id: 8, name: "Carlos Tech", email: "carlos@tech.com", role: "creator", status: "active", joinDate: "2024-01-08", avatar: "CT", location: "Zaragoza, Spain", followers: 120000, collaborations: 31, rating: 4.9, verified: true, revenue: 58900, lastActive: "1 hour ago" },
    { id: 9, name: "Beauty Salon", email: "info@beauty.com", role: "business", status: "pending", joinDate: "2024-01-07", avatar: "BS", location: "Santander, Spain", employees: 6, campaigns: 2, rating: 4.0, verified: false, spent: 4500, lastActive: "5 days ago" },
    { id: 10, name: "Laura Fashion", email: "laura@fashion.com", role: "creator", status: "active", joinDate: "2024-01-06", avatar: "LF", location: "Palma, Spain", followers: 98000, collaborations: 26, rating: 4.7, verified: true, revenue: 41600, lastActive: "3 hours ago" },
    { id: 11, name: "Admin Sarah", email: "sarah@urcontent.com", role: "admin", status: "active", joinDate: "2023-12-15", avatar: "AS", location: "Madrid, Spain", permissions: "super_admin", lastLogin: "now", actionsToday: 23, verified: true, department: "Operations" },
    { id: 12, name: "Moderator Luis", email: "luis@urcontent.com", role: "admin", status: "active", joinDate: "2024-01-01", avatar: "ML", location: "Barcelona, Spain", permissions: "moderator", lastLogin: "2 hours ago", actionsToday: 15, verified: true, department: "Content" }
  ];

  // Enhanced status configuration
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: "Active", className: "bg-green-100 text-green-800 border-green-200" },
      pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
      completed: { label: "Completed", className: "bg-blue-100 text-blue-800 border-blue-200" },
      in_progress: { label: "In Progress", className: "bg-purple-100 text-purple-800 border-purple-200" },
      suspended: { label: "Suspended", className: "bg-red-100 text-red-800 border-red-200" },
      disputed: { label: "Disputed", className: "bg-orange-100 text-orange-800 border-orange-200" },
      rejected: { label: "Rejected", className: "bg-gray-100 text-gray-800 border-gray-200" },
      verified: { label: "Verified", className: "bg-emerald-100 text-emerald-800 border-emerald-200" }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant="outline" className={config.className}>{config.label}</Badge>;
  };

  // Filter functions
  const filteredUsers = allUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = userFilter === 'all' || user.role === userFilter || user.status === userFilter;
    return matchesSearch && matchesFilter;
  });

  const getRoleIcon = (role: string) => {
    return role === 'creator' ? <Camera className="w-4 h-4" /> : 
           role === 'admin' ? <Crown className="w-4 h-4" /> : 
           <Store className="w-4 h-4" />;
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setRefreshing(false);
  };

  const handleUserAction = (action: string, userId: number) => {
    console.log(`${action} user:`, userId);
    // Implement actual user actions here
  };

  const handleExportData = (type: string) => {
    console.log(`Exporting ${type} data`);
    // Implement export functionality
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Header with Actions */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Crown className="w-8 h-8 text-yellow-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600">Comprehensive platform management and analytics</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </Button>
              <Button 
                size="sm" 
                onClick={() => handleExportData('overview')}
                className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* User Info Card */}
        <div className="mb-8">
          <UserInfoCard />
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          {platformStats.map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 border-l-purple-500">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
                      <stat.icon className="w-5 h-5 text-purple-600" />
                    </div>
                    <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
                  </div>
                  <div className={`flex items-center space-x-1 text-sm ${
                    stat.trend.isPositive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.trend.isPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                    <span>{stat.trend.value}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-xs text-gray-500">{stat.description}</div>
                  {stat.subStats && (
                    <div className="pt-2 border-t border-gray-100">
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        {Object.entries(stat.subStats).map(([key, value]) => (
                          <div key={key} className="text-center">
                            <div className="font-medium text-gray-900">{value}</div>
                            <div className="text-gray-500 capitalize">{key}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <LineChartIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="support" className="flex items-center space-x-2">
              <Headphones className="w-4 h-4" />
              <span className="hidden sm:inline">Support</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Growth Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>User Growth & Retention</span>
                  </CardTitle>
                  <CardDescription>Monthly user registration trends and retention rates</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <ComposedChart data={userGrowthData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="users" orientation="left" />
                      <YAxis yAxisId="retention" orientation="right" />
                      <Tooltip />
                      <Area yAxisId="users" type="monotone" dataKey="creators" stackId="1" stroke="#E91E63" fill="#E91E63" fillOpacity={0.6} />
                      <Area yAxisId="users" type="monotone" dataKey="businesses" stackId="1" stroke="#3F51B5" fill="#3F51B5" fillOpacity={0.6} />
                      <Area yAxisId="users" type="monotone" dataKey="admins" stackId="1" stroke="#FF9800" fill="#FF9800" fillOpacity={0.6} />
                      <Line yAxisId="retention" type="monotone" dataKey="retention" stroke="#4CAF50" strokeWidth={3} dot={{ r: 4 }} />
                    </ComposedChart>
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
                  <CardDescription>Platform revenue, commissions, and financial health</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <ComposedChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`€${value.toLocaleString()}`, '']} />
                      <Bar dataKey="grossRevenue" fill="#4CAF50" fillOpacity={0.8} />
                      <Line type="monotone" dataKey="platformRevenue" stroke="#FF9800" strokeWidth={3} />
                      <Line type="monotone" dataKey="disputes" stroke="#F44336" strokeWidth={2} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Industry Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PieChartIcon className="w-5 h-5" />
                  <span>Industry Distribution</span>
                </CardTitle>
                <CardDescription>Collaboration breakdown by category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                      labelLine={false}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name, props) => [
                      `${value}% (${props.payload.collaborations} collabs)`,
                      name
                    ]} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Management Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="w-5 h-5" />
                      <span>User Management</span>
                    </CardTitle>
                    <CardDescription>Manage all platform users, verify accounts, and handle user actions</CardDescription>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <Search className="w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-64"
                      />
                    </div>
                    <Select value={userFilter} onValueChange={setUserFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="creator">Creators</SelectItem>
                        <SelectItem value="business">Businesses</SelectItem>
                        <SelectItem value="admin">Admins</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={() => handleExportData('users')} variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Performance</TableHead>
                      <TableHead>Last Active</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.slice(0, 10).map((user) => (
                      <TableRow key={user.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-10 h-10">
                              <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium">
                                {user.avatar}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center space-x-2">
                                <p className="font-medium">{user.name}</p>
                                {user.verified && <CheckCircle className="w-4 h-4 text-green-500" />}
                              </div>
                              <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getRoleIcon(user.role)}
                            <span className="capitalize">{user.role}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(user.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">{user.location}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {user.role === 'creator' ? (
                            <div className="space-y-1">
                              <div className="text-sm font-medium">{user.followers?.toLocaleString()} followers</div>
                              <div className="text-xs text-gray-500">{user.collaborations} collabs • ⭐ {user.rating}</div>
                            </div>
                          ) : user.role === 'business' ? (
                            <div className="space-y-1">
                              <div className="text-sm font-medium">{user.campaigns} campaigns</div>
                              <div className="text-xs text-gray-500">€{user.spent?.toLocaleString()} spent • ⭐ {user.rating}</div>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <div className="text-sm font-medium">{user.actionsToday} actions today</div>
                              <div className="text-xs text-gray-500">{user.department}</div>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">{user.lastActive}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => { setSelectedUser(user); setShowUserModal(true); }}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleUserAction('verify', user.id)}>
                              <UserCheck className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleUserAction('suspend', user.id)}>
                              <Ban className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Breakdown</CardTitle>
                  <CardDescription>Detailed financial analytics</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={categoryData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value, name) => [
                        name === 'avgValue' ? `€${value}` : value,
                        name === 'avgValue' ? 'Avg Value' : 'Collaborations'
                      ]} />
                      <Bar dataKey="collaborations" fill="#3F51B5" />
                      <Bar dataKey="avgValue" fill="#4CAF50" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Growth Trends</CardTitle>
                  <CardDescription>Category growth over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={categoryData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value}%`, 'Growth Rate']} />
                      <Bar dataKey="growth" fill="#FF9800" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Support Tab */}
          <TabsContent value="support" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Headphones className="w-5 h-5" />
                  <span>Support Dashboard</span>
                </CardTitle>
                <CardDescription>Customer support metrics and ticket management</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Headphones className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Support System Active</h3>
                  <p className="text-gray-600 mb-4">All support channels are operational and responding to user inquiries.</p>
                  <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">98%</div>
                      <div className="text-sm text-gray-500">Response Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">2.4h</div>
                      <div className="text-sm text-gray-500">Avg Response</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">4.8</div>
                      <div className="text-sm text-gray-500">Satisfaction</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* User Detail Modal */}
        <Dialog open={showUserModal && selectedUser !== null} onOpenChange={setShowUserModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium">
                    {selectedUser?.avatar}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center space-x-2">
                    <span>{selectedUser?.name}</span>
                    {selectedUser?.verified && <CheckCircle className="w-5 h-5 text-green-500" />}
                  </div>
                  <div className="text-sm text-gray-500">{selectedUser?.email}</div>
                </div>
              </DialogTitle>
              <DialogDescription>
                Complete user profile and platform activity details
              </DialogDescription>
            </DialogHeader>
            
            {selectedUser && (
              <div className="space-y-6">
                {/* User Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {selectedUser.role === 'creator' ? selectedUser.followers?.toLocaleString() : 
                       selectedUser.role === 'business' ? selectedUser.campaigns :
                       selectedUser.actionsToday}
                    </div>
                    <div className="text-sm text-blue-700">
                      {selectedUser.role === 'creator' ? 'Followers' : 
                       selectedUser.role === 'business' ? 'Campaigns' : 
                       'Actions Today'}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {selectedUser.role === 'creator' ? selectedUser.collaborations : 
                       selectedUser.role === 'business' ? `€${selectedUser.spent?.toLocaleString()}` :
                       selectedUser.department}
                    </div>
                    <div className="text-sm text-green-700">
                      {selectedUser.role === 'creator' ? 'Collaborations' : 
                       selectedUser.role === 'business' ? 'Total Spent' : 
                       'Department'}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      ⭐ {selectedUser.rating || 'N/A'}
                    </div>
                    <div className="text-sm text-yellow-700">Rating</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {selectedUser.role === 'creator' ? `€${selectedUser.revenue?.toLocaleString()}` : 
                       selectedUser.role === 'business' ? selectedUser.employees : 
                       selectedUser.permissions}
                    </div>
                    <div className="text-sm text-purple-700">
                      {selectedUser.role === 'creator' ? 'Revenue' : 
                       selectedUser.role === 'business' ? 'Employees' : 
                       'Permissions'}
                    </div>
                  </div>
                </div>

                {/* User Actions */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium">User Actions</h3>
                    <p className="text-sm text-gray-600">Manage user account and permissions</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant={selectedUser.verified ? "outline" : "default"}
                      size="sm"
                      onClick={() => handleUserAction('verify', selectedUser.id)}
                    >
                      <UserCheck className="w-4 h-4 mr-2" />
                      {selectedUser.verified ? 'Verified' : 'Verify'}
                    </Button>
                    <Button 
                      variant={selectedUser.status === 'suspended' ? "default" : "destructive"}
                      size="sm"
                      onClick={() => handleUserAction(selectedUser.status === 'suspended' ? 'unsuspend' : 'suspend', selectedUser.id)}
                    >
                      {selectedUser.status === 'suspended' ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Reactivate
                        </>
                      ) : (
                        <>
                          <Ban className="w-4 h-4 mr-2" />
                          Suspend
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Additional Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-3">Account Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">User ID:</span>
                        <span className="font-mono">{selectedUser.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Join Date:</span>
                        <span>{selectedUser.joinDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last Active:</span>
                        <span>{selectedUser.lastActive}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Location:</span>
                        <span>{selectedUser.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        {getStatusBadge(selectedUser.status)}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-3">Platform Activity</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Profile Completion:</span>
                        <span className="font-medium">95%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Compliance Score:</span>
                        <span className="font-medium text-green-600">Excellent</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Support Tickets:</span>
                        <span>2 resolved</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Referrals:</span>
                        <span>5 users</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminDashboard;