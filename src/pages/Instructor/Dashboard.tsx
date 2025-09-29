// src/pages/Instructor/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Users, 
  Calendar, 
  Star, 
  TrendingUp, 
  Clock,
  Award,
  MessageSquare,
  BarChart3,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../lib/api';
import Card from '../../components/UI/Card';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

interface InstructorDashboardData {
  instructor: {
    name: string;
    designation: string;
    experience: number;
    rating: number;
    totalStudents: number;
  };
  stats: {
    totalCourses: number;
    totalBatches: number;
    totalStudents: number;
    avgRating: number;
  };
  courses: Array<{
    id: string;
    name: string;
    enrollments: number;
    rating: number;
    reviewsCount: number;
  }>;
  upcomingClasses: Array<{
    id: string;
    course: string;
    batch: string;
    date: string;
    time: string;
    duration: string;
    studentsCount: number;
  }>;
  batches: Array<{
    id: string;
    name: string;
    course: string;
    studentsCount: number;
    scheduleCount: number;
  }>;
}

const InstructorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [instructorData, setInstructorData] = useState<InstructorDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInstructorData();
  }, []);

  const fetchInstructorData = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getInstructorDashboard();
      setInstructorData(data);
    } catch (error: any) {
      console.error('Error fetching instructor dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!instructorData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Failed to load dashboard data</p>
          <button 
            onClick={fetchInstructorData}
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
      title: 'My Courses',
      value: instructorData.stats.totalCourses,
      icon: <BookOpen className="w-6 h-6" />,
      color: 'bg-blue-500'
    },
    {
      title: 'Active Batches',
      value: instructorData.stats.totalBatches,
      icon: <Users className="w-6 h-6" />,
      color: 'bg-green-500'
    },
    {
      title: 'Total Students',
      value: instructorData.stats.totalStudents,
      icon: <Users className="w-6 h-6" />,
      color: 'bg-purple-500'
    },
    {
      title: 'Average Rating',
      value: instructorData.stats.avgRating.toFixed(1),
      icon: <Star className="w-6 h-6" />,
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Instructor Dashboard</h1>
              <p className="text-gray-600">Welcome back, {instructorData.instructor.name}!</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={fetchInstructorData}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Refresh
              </button>
              <div className="text-sm text-gray-500">
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-500 mr-1" />
                  {instructorData.instructor.rating.toFixed(1)} Rating
                </div>
              </div>
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
                </div>
                <div className={`${stat.color} text-white p-3 rounded-lg`}>
                  {stat.icon}
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* My Courses */}
          <div className="lg:col-span-2">
            <Card className="p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">My Courses</h2>
                <Link
                  to="/instructor/courses"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View All
                </Link>
              </div>
              {instructorData.courses.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">You don't have any courses assigned yet.</p>
                  <Link
                    to="/instructor/courses/create"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800"
                  >
                    Create Course <ExternalLink className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
{instructorData.courses.map((course) => (
                    <div key={course.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{course.name}</h3>
                          <p className="text-sm text-gray-600">{course.enrollments} students enrolled</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-500 mr-1" />
                            <span className="text-sm text-gray-700">{course.rating.toFixed(1)}</span>
                          </div>
                          <span className="text-sm text-gray-500">({course.reviewsCount} reviews)</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            {course.enrollments} enrolled
                          </div>
                          <div className="flex items-center">
                            <MessageSquare className="w-4 h-4 mr-1" />
                            {course.reviewsCount} reviews
                          </div>
                        </div>
                        <Link
                          to={`/instructor/courses/${course.id}`}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                        >
                          Manage <ChevronRight className="w-4 h-4 ml-1" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* My Batches */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">My Batches</h2>
                <Link
                  to="/instructor/batches"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View All
                </Link>
              </div>
              {instructorData.batches.length === 0 ? (
                <p className="text-gray-600 text-center py-4">No active batches assigned.</p>
              ) : (
                <div className="space-y-4">
                  {instructorData.batches.map((batch) => (
                    <div key={batch.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">{batch.name}</h4>
                        <p className="text-sm text-gray-600">{batch.course}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                          <span>{batch.studentsCount} students</span>
                          <span>{batch.scheduleCount} classes/week</span>
                        </div>
                      </div>
                      <Link
                        to={`/instructor/batches/${batch.id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Manage
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Summary */}
            <Card className="p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">{instructorData.instructor.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{instructorData.instructor.designation}</p>
                <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">{instructorData.instructor.experience}</span> years exp.
                  </div>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-500 mr-1" />
                    <span className="font-medium">{instructorData.instructor.rating.toFixed(1)}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Teaching {instructorData.instructor.totalStudents} students
                </p>
              </div>
            </Card>

            {/* Upcoming Classes */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Classes</h3>
              {instructorData.upcomingClasses.length === 0 ? (
                <p className="text-gray-600 text-sm">No upcoming classes scheduled.</p>
              ) : (
                <div className="space-y-3">
                  {instructorData.upcomingClasses.slice(0, 5).map((classItem) => (
                    <div key={classItem.id} className="border-l-4 border-green-500 pl-4">
                      <h4 className="font-medium text-gray-900 text-sm">{classItem.course}</h4>
                      <p className="text-xs text-gray-600">{classItem.batch}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-gray-500">
                          {formatDate(classItem.date)} at {classItem.time}
                        </p>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          {classItem.studentsCount} students
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">{classItem.duration}</p>
                    </div>
                  ))}
                  {instructorData.upcomingClasses.length > 5 && (
                    <Link
                      to="/instructor/schedule"
                      className="block text-center text-sm text-blue-600 hover:text-blue-800 pt-2 border-t"
                    >
                      View all classes →
                    </Link>
                  )}
                </div>
              )}
            </Card>

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Link
                  to="/instructor/courses/create"
                  className="flex items-center w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Create New Course
                </Link>
                <Link
                  to="/instructor/batches/create"
                  className="flex items-center w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Create New Batch
                </Link>
                <Link
                  to="/instructor/schedule"
                  className="flex items-center w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  View Schedule
                </Link>
                <Link
                  to="/instructor/students"
                  className="flex items-center w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Manage Students
                </Link>
                <Link
                  to="/instructor/reports"
                  className="flex items-center w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Reports
                </Link>
              </div>
            </Card>

            {/* Performance Overview */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Overview</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Course Rating</span>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-500 mr-1" />
                    <span className="font-medium">{instructorData.stats.avgRating.toFixed(1)}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Enrollments</span>
                  <span className="font-medium text-blue-600">
                    {instructorData.courses.reduce((acc, course) => acc + course.enrollments, 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active Batches</span>
                  <span className="font-medium text-green-600">{instructorData.stats.totalBatches}</span>
                </div>
                <div className="pt-3 border-t">
                  <Link
                    to="/instructor/analytics"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                  >
                    View Detailed Analytics <TrendingUp className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;