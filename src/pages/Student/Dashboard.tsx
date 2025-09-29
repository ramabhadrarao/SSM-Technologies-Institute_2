// src/pages/Student/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Calendar, 
  Award, 
  Clock, 
  TrendingUp, 
  PlayCircle,
  FileText,
  Users,
  CheckCircle,
  AlertCircle,
  Star,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../lib/api';
import Card from '../../components/UI/Card';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

interface StudentDashboardData {
  enrolledCourses: Array<{
    id: string;
    name: string;
    progress: number;
    instructor: string;
    nextClass: string | null;
    status: string;
  }>;
  upcomingClasses: Array<{
    id: string;
    course: string;
    topic: string;
    date: string;
    time: string;
    duration: string;
    instructor: string;
    meetingLink: string;
  }>;
  assignments: Array<{
    id: number;
    title: string;
    course: string;
    dueDate: string;
    status: string;
    submitted: boolean;
    grade?: string;
  }>;
  progress: {
    overallProgress: number;
    completedCourses: number;
    inProgressCourses: number;
    certificatesEarned: number;
  };
  stats: {
    totalCourses: number;
    completedCourses: number;
    inProgressCourses: number;
    attendanceRate: number;
  };
}

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [studentData, setStudentData] = useState<StudentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getStudentDashboard();
      setStudentData(data);
    } catch (error: any) {
      console.error('Error fetching student dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysUntilDue = (dueDateString: string) => {
    const dueDate = new Date(dueDateString);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    if (diffDays < 0) return `Overdue by ${Math.abs(diffDays)} days`;
    return `Due in ${diffDays} days`;
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

  if (!studentData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Failed to load dashboard data</p>
          <button 
            onClick={fetchStudentData}
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
      title: 'Courses Enrolled',
      value: studentData.stats.totalCourses,
      icon: <BookOpen className="w-6 h-6" />,
      color: 'bg-blue-500'
    },
    {
      title: 'Completed Courses',
      value: studentData.stats.completedCourses,
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'bg-green-500'
    },
    {
      title: 'Certificates Earned',
      value: studentData.progress.certificatesEarned,
      icon: <Award className="w-6 h-6" />,
      color: 'bg-purple-500'
    },
    {
      title: 'Overall Progress',
      value: `${studentData.progress.overallProgress}%`,
      icon: <TrendingUp className="w-6 h-6" />,
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
              <h1 className="text-2xl font-bold text-gray-900">My Learning Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.firstName}! Continue your learning journey.</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={fetchStudentData}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Refresh
              </button>
              <span className="text-sm text-gray-500">
                Progress: {studentData.progress.overallProgress}%
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
              <h2 className="text-lg font-semibold text-gray-900 mb-6">My Courses</h2>
              {studentData.enrolledCourses.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">You haven't enrolled in any courses yet.</p>
                  <Link
                    to="/courses"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800"
                  >
                    Browse Courses <ExternalLink className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {studentData.enrolledCourses.map((course) => (
                    <div key={course.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{course.name}</h3>
                          <p className="text-sm text-gray-600">Instructor: {course.instructor}</p>
                          {course.nextClass && (
                            <p className="text-sm text-blue-600">Next class: {formatDate(course.nextClass)}</p>
                          )}
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(course.status)}`}>
                          {course.status}
                        </span>
                      </div>
                      
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{course.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${course.progress}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <Link
                          to={`/courses/${course.id}`}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Continue Learning
                        </Link>
                        {course.status === 'completed' && (
                          <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                            View Certificate
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Assignments */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Recent Assignments</h2>
              {studentData.assignments.length === 0 ? (
                <p className="text-gray-600 text-center py-4">No assignments available.</p>
              ) : (
                <div className="space-y-4">
                  {studentData.assignments.slice(0, 5).map((assignment) => (
                    <div key={assignment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">{assignment.title}</h4>
                        <p className="text-sm text-gray-600">{assignment.course}</p>
                        <p className={`text-xs ${
                          assignment.status === 'graded' ? 'text-green-600' : 
                          getDaysUntilDue(assignment.dueDate).includes('Overdue') ? 'text-red-600' : 'text-yellow-600'
                        }`}>
                          {assignment.status === 'graded' ? 
                            `Graded: ${assignment.grade || 'N/A'}` : 
                            getDaysUntilDue(assignment.dueDate)
                          }
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {assignment.status === 'graded' ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : assignment.submitted ? (
                          <Clock className="w-5 h-5 text-yellow-500" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Classes */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Classes</h3>
              {studentData.upcomingClasses.length === 0 ? (
                <p className="text-gray-600 text-sm">No upcoming classes scheduled.</p>
              ) : (
                <div className="space-y-3">
                  {studentData.upcomingClasses.slice(0, 3).map((classItem) => (
                    <div key={classItem.id} className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-medium text-gray-900 text-sm">{classItem.course}</h4>
                      <p className="text-xs text-gray-600">{classItem.topic}</p>
                      <p className="text-xs text-gray-500">
                        {formatDate(classItem.date)} at {classItem.time}
                      </p>
                      <p className="text-xs text-gray-500">{classItem.duration}</p>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Learning Progress */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Progress</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Overall Progress</span>
                    <span>{studentData.progress.overallProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${studentData.progress.overallProgress}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-green-600">{studentData.stats.completedCourses}</p>
                    <p className="text-xs text-gray-600">Completed</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{studentData.stats.inProgressCourses}</p>
                    <p className="text-xs text-gray-600">In Progress</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Link
                  to="/courses"
                  className="block w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  Browse New Courses
                </Link>
                <Link
                  to="/student/assignments"
                  className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  View All Assignments
                </Link>
                <Link
                  to="/student/certificates"
                  className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  My Certificates
                </Link>
                <Link
                  to="/contact"
                  className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Get Support
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;