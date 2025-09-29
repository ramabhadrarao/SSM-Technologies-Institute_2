// src/pages/Admin/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  BookOpen, 
  GraduationCap, 
  TrendingUp, 
  Calendar,
  MessageSquare,
  Star,
  Activity,
  UserCheck,
  UserX,
  Settings,
  BarChart3,
  FileText,
  IndianRupee,
  UserCog
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../lib/api';
import Card from '../../components/UI/Card';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

interface AdminDashboardData {
  stats: {
    totalStudents: number;
    totalInstructors: number;
    totalCourses: number;
    activeBatches: number;
    totalEnrollments: number;
    pendingMessages: number;
    totalUsers: number;
    totalRevenue: number;
    avgCourseRating: number;
  };
  recentActivities: Array<{
    id: string;
    user: string;
    action: string;
    time: string;
    type: string;
  }>;
  monthlyGrowth: {
    students: number;
    instructors: number;
    courses: number;
    revenue: number;
  };
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getAdminDashboard();
      setDashboardData(data);
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    }
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Failed to load dashboard data</p>
          <button 
            onClick={fetchDashboardData}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const quickStats = [
    {
      title: 'Total Students',
      value: dashboardData.stats.totalStudents,
      icon: <Users className="w-8 h-8" />,
      color: 'bg-blue-500',
      change: `+${dashboardData.monthlyGrowth.students}%`
    },
    {
      title: 'Total Instructors',
      value: dashboardData.stats.totalInstructors,
      icon: <UserCheck className="w-8 h-8" />,
      color: 'bg-green-500',
      change: `+${dashboardData.monthlyGrowth.instructors}%`
    },
    {
      title: 'Active Courses',
      value: dashboardData.stats.totalCourses,
      icon: <BookOpen className="w-8 h-8" />,
      color: 'bg-purple-500',
      change: `+${dashboardData.monthlyGrowth.courses}%`
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(dashboardData.stats.totalRevenue),
      icon: <IndianRupee className="w-8 h-8" />,
      color: 'bg-orange-500',
      change: `+${dashboardData.monthlyGrowth.revenue}%`
    }
  ];

  const quickActions = [
    {
      title: 'Manage Users',
      description: 'View and manage student & instructor accounts',
      icon: <Users className="w-6 h-6" />,
      href: '/admin/users',
      color: 'bg-blue-50 text-blue-600',
      count: dashboardData.stats.totalUsers
    },
    {
      title: 'Course Management',
      description: 'Add, edit, or remove courses',
      icon: <BookOpen className="w-6 h-6" />,
      href: '/admin/courses',
      color: 'bg-green-50 text-green-600',
      count: dashboardData.stats.totalCourses
    },
    {
      title: 'Team Management',
      description: 'Manage leadership team members',
      icon: <UserCog className="w-6 h-6" />,
      href: '/admin/team',
      color: 'bg-teal-50 text-teal-600'
    },
    {
      title: 'Subject Management',
      description: 'Manage course subjects and materials',
      icon: <FileText className="w-6 h-6" />,
      href: '/admin/subjects',
      color: 'bg-yellow-50 text-yellow-600'
    },
    {
      title: 'Batch Scheduling',
      description: 'Manage class schedules and batches',
      icon: <Calendar className="w-6 h-6" />,
      href: '/admin/batches',
      color: 'bg-purple-50 text-purple-600',
      count: dashboardData.stats.activeBatches
    },
    {
      title: 'Messages & Support',
      description: 'Handle student inquiries and support',
      icon: <MessageSquare className="w-6 h-6" />,
      href: '/admin/messages',
      color: 'bg-orange-50 text-orange-600',
      count: dashboardData.stats.pendingMessages
    },
    {
      title: 'Reports & Analytics',
      description: 'View detailed reports and analytics',
      icon: <BarChart3 className="w-6 h-6" />,
      href: '/admin/reports',
      color: 'bg-indigo-50 text-indigo-600'
    },
    {
      title: 'System Settings',
      description: 'Configure system preferences',
      icon: <Settings className="w-6 h-6" />,
      href: '/admin/settings',
      color: 'bg-gray-50 text-gray-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.firstName}! Here's what's happening.</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={fetchDashboardData}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Refresh Data
              </button>
              <span className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => (
            <Card key={index} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-green-600 mt-1">{stat.change} from last month</p>
                </div>
                <div className={`${stat.color} text-white p-3 rounded-lg`}>
                  {stat.icon}
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickActions.map((action, index) => (
                  <Link
                    key={index}
                    to={action.href}
                    className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className={`${action.color} p-2 rounded-lg`}>
                          {action.icon}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{action.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                        </div>
                      </div>
                      {action.count !== undefined && (
                        <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded-full">
                          {action.count}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          </div>

          {/* Recent Activities */}
          <div>
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Recent Activities</h2>
              <div className="space-y-4">
                {dashboardData.recentActivities.slice(0, 8).map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Activity className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">{activity.user}</span> {activity.action}
                      </p>
                      <p className="text-xs text-gray-500">{getTimeAgo(activity.time)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                to="/admin/activities"
                className="block text-center text-sm text-blue-600 hover:text-blue-800 mt-4 pt-4 border-t"
              >
                View all activities →
              </Link>
            </Card>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Total Enrollments</h3>
              <GraduationCap className="w-6 h-6 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-blue-600">{dashboardData.stats.totalEnrollments}</p>
            <p className="text-sm text-gray-600 mt-2">Across all courses</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Pending Messages</h3>
              <MessageSquare className="w-6 h-6 text-orange-500" />
            </div>
            <p className="text-3xl font-bold text-orange-600">{dashboardData.stats.pendingMessages}</p>
            <Link to="/admin/messages" className="text-sm text-orange-600 hover:text-orange-800 mt-2 inline-block">
              View messages →
            </Link>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Average Rating</h3>
              <Star className="w-6 h-6 text-yellow-500" />
            </div>
            <p className="text-3xl font-bold text-yellow-600">{dashboardData.stats.avgCourseRating}</p>
            <p className="text-sm text-gray-600 mt-2">Course rating average</p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;