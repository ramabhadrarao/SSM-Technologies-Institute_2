import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  BookOpen, 
  IndianRupee,
  Calendar,
  Download,
  Filter,
  ArrowLeft,
  PieChart,
  LineChart,
  Activity,
  Target,
  Award,
  Clock
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../lib/api';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

interface AnalyticsData {
  overview: {
    totalUsers: number;
    totalStudents: number;
    totalInstructors: number;
    totalCourses: number;
    totalBatches: number;
    totalRevenue: number;
  };
  growth: {
    users: Array<{ _id: any; count: number }>;
    enrollments: Array<{ _id: any; count: number }>;
    revenue: Array<{ _id: any; revenue: number }>;
  };
}

interface UserAnalytics {
  userTrends: Array<{
    _id: any;
    roles: Array<{ role: string; count: number }>;
    total: number;
  }>;
  userActivity: Array<{ _id: boolean; count: number }>;
  recentLogins: Array<{
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    lastLogin: string;
  }>;
}

interface CourseAnalytics {
  enrollmentTrends: Array<{
    _id: any;
    courses: Array<{ course: string; enrollments: number }>;
    totalEnrollments: number;
  }>;
  coursePerformance: Array<{
    name: string;
    fees: number;
    rating: number;
    enrollmentCount: number;
    revenue: number;
    reviewCount: number;
  }>;
  completionRates: Array<{
    _id: string;
    statuses: Array<{ status: string; count: number }>;
    total: number;
  }>;
}

interface FinancialAnalytics {
  revenueTrends: Array<{ _id: any; revenue: number; enrollments: number }>;
  revenueByCourse: Array<{ _id: string; revenue: number; enrollments: number; avgFee: number }>;
  paymentTrends: Array<{ _id: { month: number; year: number }; revenue: number; studentCount: number }>;
}

const AdminReportsAnalytics: React.FC = () => {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [period, setPeriod] = useState('monthly');
  
  // Analytics data states
  const [dashboardAnalytics, setDashboardAnalytics] = useState<AnalyticsData | null>(null);
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics | null>(null);
  const [courseAnalytics, setCourseAnalytics] = useState<CourseAnalytics | null>(null);
  const [financialAnalytics, setFinancialAnalytics] = useState<FinancialAnalytics | null>(null);
  const [instructorAnalytics, setInstructorAnalytics] = useState<any>(null);
  const [studentAnalytics, setStudentAnalytics] = useState<any>(null);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'users', label: 'Users', icon: <Users className="w-4 h-4" /> },
    { id: 'courses', label: 'Courses', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'financial', label: 'Financial', icon: <IndianRupee className="w-4 h-4" /> },
    { id: 'instructors', label: 'Instructors', icon: <Award className="w-4 h-4" /> },
    { id: 'students', label: 'Students', icon: <Target className="w-4 h-4" /> }
  ];

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedTab, dateRange, period]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      const params = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        period
      };

      switch (selectedTab) {
        case 'overview':
          const dashboardData = await apiClient.getDashboardAnalytics(params);
          setDashboardAnalytics(dashboardData);
          break;
        case 'users':
          const userData = await apiClient.getUserAnalytics(params);
          setUserAnalytics(userData);
          break;
        case 'courses':
          const courseData = await apiClient.getCourseAnalytics(params);
          setCourseAnalytics(courseData);
          break;
        case 'financial':
          const financialData = await apiClient.getFinancialAnalytics(params);
          setFinancialAnalytics(financialData);
          break;
        case 'instructors':
          const instructorData = await apiClient.getInstructorAnalytics();
          setInstructorAnalytics(instructorData);
          break;
        case 'students':
          const studentData = await apiClient.getStudentAnalytics();
          setStudentAnalytics(studentData);
          break;
      }
    } catch (error: any) {
      console.error('Error fetching analytics data:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (reportType: 'enrollment' | 'revenue' | 'performance' | 'attendance') => {
    try {
      setLoading(true);
      const reportData = {
        reportType,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        filters: {},
        groupBy: period,
        metrics: []
      };

      const response = await apiClient.generateCustomReport(reportData);
      toast.success('Report generated successfully');
      
      // Here you would typically download the report or show it in a new tab
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate report');
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/admin/dashboard"
                className="inline-flex items-center text-blue-600 hover:text-blue-800"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
                <p className="text-gray-600">View detailed reports and analytics</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
              <Button
                variant="outline"
                onClick={() => generateReport('enrollment')}
                className="flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Date Range Filter */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex items-center space-x-4">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div className="flex items-center space-x-2">
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <Button onClick={fetchAnalyticsData} variant="outline">
              Apply Filters
            </Button>
          </div>
        </Card>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                  selectedTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                <span className="ml-2">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="space-y-8">
            {selectedTab === 'overview' && dashboardAnalytics && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h2>
                
                {/* Overview Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Users</p>
                        <p className="text-3xl font-bold text-blue-600">{dashboardAnalytics.overview.totalUsers}</p>
                      </div>
                      <Users className="w-10 h-10 text-blue-500" />
                    </div>
                  </Card>
                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Revenue</p>
                        <p className="text-3xl font-bold text-green-600">{formatCurrency(dashboardAnalytics.overview.totalRevenue)}</p>
                      </div>
                      <IndianRupee className="w-10 h-10 text-green-500" />
                    </div>
                  </Card>
                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Active Courses</p>
                        <p className="text-3xl font-bold text-purple-600">{dashboardAnalytics.overview.totalCourses}</p>
                      </div>
                      <BookOpen className="w-10 h-10 text-purple-500" />
                    </div>
                  </Card>
                </div>

                {/* Growth Charts Placeholder */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h3>
                    <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <LineChart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600">User growth chart</p>
                        <p className="text-sm text-gray-500">{dashboardAnalytics.growth.users.length} data points</p>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Growth</h3>
                    <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600">Revenue growth chart</p>
                        <p className="text-sm text-gray-500">{dashboardAnalytics.growth.revenue.length} data points</p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {selectedTab === 'users' && userAnalytics && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">User Analytics</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">User Activity</h3>
                    <div className="space-y-4">
                      {userAnalytics.userActivity.map((activity, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-gray-600">
                            {activity._id ? 'Active Users' : 'Inactive Users'}
                          </span>
                          <span className="font-semibold text-gray-900">{activity.count}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                  
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Registration Trends</h3>
                    <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600">Registration trends chart</p>
                        <p className="text-sm text-gray-500">{userAnalytics.userTrends.length} periods</p>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Recent Logins */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent User Activity</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Login</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {userAnalytics.recentLogins.slice(0, 10).map((login, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {login.firstName} {login.lastName}
                                </div>
                                <div className="text-sm text-gray-500">{login.email}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                login.role === 'admin' ? 'bg-red-100 text-red-800' :
                                login.role === 'instructor' ? 'bg-blue-100 text-blue-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {login.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {formatDate(login.lastLogin)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )}

            {selectedTab === 'courses' && courseAnalytics && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Analytics</h2>
                
                {/* Course Performance */}
                <Card className="p-6 mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Performance</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Enrollments</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reviews</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {courseAnalytics.coursePerformance.map((course, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">{course.name}</div>
                              <div className="text-sm text-gray-500">₹{course.fees.toLocaleString('en-IN')}</div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">{course.enrollmentCount}</td>
                            <td className="px-6 py-4 text-sm font-medium text-green-600">
                              {formatCurrency(course.revenue)}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <span className="text-sm text-gray-900">{course.rating.toFixed(1)}</span>
                                <div className="flex ml-2">
                                  {[...Array(5)].map((_, i) => (
                                    <div
                                      key={i}
                                      className={`w-3 h-3 ${
                                        i < Math.floor(course.rating) ? 'text-yellow-400' : 'text-gray-300'
                                      }`}
                                    >
                                      ★
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">{course.reviewCount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>

                {/* Completion Rates */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Completion Rates</h3>
                  <div className="space-y-4">
                    {courseAnalytics.completionRates.map((course, index) => {
                      const completedCount = course.statuses.find(s => s.status === 'completed')?.count || 0;
                      const completionRate = (completedCount / course.total) * 100;
                      
                      return (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{course._id}</h4>
                            <span className="text-sm text-gray-600">{completionRate.toFixed(1)}% completion</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{ width: `${completionRate}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-sm text-gray-600 mt-2">
                            <span>Total: {course.total}</span>
                            <span>Completed: {completedCount}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </div>
            )}

            {selectedTab === 'financial' && financialAnalytics && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Financial Analytics</h2>
                
                {/* Revenue by Course */}
                <Card className="p-6 mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Course</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Enrollments</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Fee</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {financialAnalytics.revenueByCourse.map((course, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{course._id}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{course.enrollments}</td>
                            <td className="px-6 py-4 text-sm font-medium text-green-600">
                              {formatCurrency(course.revenue)}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              ₹{course.avgFee.toLocaleString('en-IN')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>

                {/* Revenue Trends */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trends</h3>
                  <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">Revenue trends chart</p>
                      <p className="text-sm text-gray-500">{financialAnalytics.revenueTrends.length} data points</p>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {selectedTab === 'instructors' && instructorAnalytics && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Instructor Analytics</h2>
                
                {/* Instructor Performance */}
                <Card className="p-6 mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Instructor Performance</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Instructor</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Courses</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Students</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {instructorAnalytics.instructorPerformance.map((instructor: any, index: number) => (
                          <tr key={index}>
                            <td className="px-6 py-4">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{instructor.name}</div>
                                <div className="text-sm text-gray-500">{instructor.designation}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">{instructor.courseCount}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{instructor.totalStudents}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <span className="text-sm text-gray-900">{instructor.rating.toFixed(1)}</span>
                                <div className="flex ml-2">
                                  {[...Array(5)].map((_, i) => (
                                    <div
                                      key={i}
                                      className={`w-3 h-3 ${
                                        i < Math.floor(instructor.rating) ? 'text-yellow-400' : 'text-gray-300'
                                      }`}
                                    >
                                      ★
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-green-600">
                              {formatCurrency(instructor.totalRevenue)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )}

            {selectedTab === 'students' && studentAnalytics && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Student Analytics</h2>
                
                {/* Progress Analytics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Progress</h3>
                    <div className="space-y-4">
                      {studentAnalytics.progressAnalytics.map((progress: any, index: number) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-gray-600 capitalize">{progress._id} Students</span>
                          <div className="text-right">
                            <span className="font-semibold text-gray-900">{progress.count}</span>
                            <div className="text-sm text-gray-500">
                              Avg: {progress.avgProgress.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                  
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Patterns</h3>
                    <div className="space-y-4">
                      {studentAnalytics.attendancePatterns.map((pattern: any, index: number) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-gray-600 capitalize">{pattern._id}</span>
                          <span className="font-semibold text-gray-900">{pattern.count}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>

                {/* Performance by Course */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance by Course</h3>
                  <div className="space-y-4">
                    {studentAnalytics.performanceByCourse.map((course: any, index: number) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{course._id}</h4>
                          <div className="flex items-center space-x-4 text-sm">
                            <span className="text-green-600">{course.completionRate.toFixed(1)}% completion</span>
                            <span className="text-red-600">{course.dropoutRate.toFixed(1)}% dropout</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                          <div>Total: {course.totalStudents}</div>
                          <div>Completed: {course.completedStudents}</div>
                          <div>Dropped: {course.droppedStudents}</div>
                        </div>
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{ width: `${course.completionRate}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {/* Report Generation */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate Custom Reports</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button
                  variant="outline"
                  onClick={() => generateReport('enrollment')}
                  className="flex items-center justify-center"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Enrollment Report
                </Button>
                <Button
                  variant="outline"
                  onClick={() => generateReport('revenue')}
                  className="flex items-center justify-center"
                >
                  <IndianRupee className="w-4 h-4 mr-2" />
                  Revenue Report
                </Button>
                <Button
                  variant="outline"
                  onClick={() => generateReport('performance')}
                  className="flex items-center justify-center"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Performance Report
                </Button>
                <Button
                  variant="outline"
                  onClick={() => generateReport('attendance')}
                  className="flex items-center justify-center"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Attendance Report
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReportsAnalytics;