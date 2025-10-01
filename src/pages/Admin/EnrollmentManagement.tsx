import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { 
  Users, 
  BookOpen, 
  Search, 
  Filter, 
  ChevronDown, 
  Edit3, 
  Eye,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import Button from '../../components/UI/Button';
import { apiClient } from '../../lib/api';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

interface Course {
  _id: string;
  name: string;
  description: string;
  fees: number;
  // Discount fields
  discountPercentage?: number;
  isDiscountActive?: boolean;
  discountStartDate?: string;
  discountEndDate?: string;
  isDiscountValid?: boolean;
  discountedPrice?: number;
  effectivePrice?: number;
  discountAmount?: number;
}

interface Student {
  _id: string;
  user: User;
}

interface Enrollment {
  _id: string;
  student: Student;
  course: Course;
  enrolledAt: string;
  status: 'active' | 'completed' | 'suspended' | 'dropped';
  progress: number;
  completedSubjects: string[];
  completedAt?: string;
  statusHistory?: Array<{
    status: string;
    changedAt: string;
    changedBy: string;
    reason: string;
  }>;
}

interface PaginationData {
  current: number;
  pages: number;
  total: number;
  limit: number;
}

const EnrollmentManagement: React.FC = () => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationData>({
    current: 1,
    pages: 1,
    total: 0,
    limit: 10
  });

  // Stats
  const [stats, setStats] = useState({
    active: 0,
    completed: 0,
    suspended: 0,
    dropped: 0
  });

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');
  const [courses, setCourses] = useState<Course[]>([]);

  // Modals
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusReason, setStatusReason] = useState('');

  const statusOptions = [
    { value: 'active', label: 'Active', color: 'text-green-600', bgColor: 'bg-green-100', icon: CheckCircle },
    { value: 'completed', label: 'Completed', color: 'text-blue-600', bgColor: 'bg-blue-100', icon: CheckCircle },
    { value: 'suspended', label: 'Suspended', color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: Clock },
    { value: 'dropped', label: 'Dropped', color: 'text-red-600', bgColor: 'bg-red-100', icon: XCircle }
  ];

  const getStatusConfig = (status: string) => {
    return statusOptions.find(option => option.value === status) || statusOptions[0];
  };

  const fetchEnrollments = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      
      const response = await apiClient.getAdminEnrollments({
        page,
        limit: pagination.limit,
        ...(search && { search }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(courseFilter !== 'all' && { courseId: courseFilter })
      });

      console.log('Enrollments response:', response); // Debug log

      let enrollmentsData = [];
      let paginationData = {
        current: page,
        pages: 1,
        total: 0,
        limit: 10
      };

      // Handle API response structure: { success: true, data: { enrollments: [...], pagination: {...} } }
      if (response && response.success && response.data) {
        enrollmentsData = response.data.enrollments || [];
        paginationData = response.data.pagination || paginationData;
      } else if (response && response.data && response.data.enrollments) {
        enrollmentsData = response.data.enrollments || [];
        paginationData = response.data.pagination || paginationData;
      } else if (response && response.enrollments) {
        enrollmentsData = response.enrollments || [];
        paginationData = response.pagination || paginationData;
      } else if (Array.isArray(response)) {
        enrollmentsData = response;
        paginationData = {
          current: page,
          pages: 1,
          total: response.length,
          limit: 10
        };
      } else {
        console.warn('Unexpected response structure:', response);
        enrollmentsData = [];
      }

      console.log('Processed enrollments data:', enrollmentsData); // Debug log

      setEnrollments(enrollmentsData);
      setPagination(paginationData);

      // Calculate statistics from the enrollments data
      const enrollmentStats = {
        active: 0,
        completed: 0,
        suspended: 0,
        dropped: 0
      };

      enrollmentsData.forEach((enrollment: Enrollment) => {
        if (enrollment && enrollment.status && enrollment.status in enrollmentStats) {
          enrollmentStats[enrollment.status as keyof typeof enrollmentStats]++;
        }
      });

      console.log('Calculated stats:', enrollmentStats); // Debug log
      setStats(enrollmentStats);

    } catch (error: any) {
      console.error('Fetch enrollments error:', error);
      toast.error(error.message || 'Failed to fetch enrollments');
      setEnrollments([]);
      setPagination({
        current: 1,
        pages: 1,
        total: 0,
        limit: 10
      });
      setStats({
        active: 0,
        completed: 0,
        suspended: 0,
        dropped: 0
      });
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, courseFilter, pagination.limit]);

  const fetchCourses = useCallback(async () => {
    try {
      const response = await apiClient.getAdminCourses({ limit: 100 });
      console.log('Courses response:', response); // Debug log
      
      if (response && response.data && response.data.courses) {
        setCourses(response.data.courses);
      } else if (response && response.courses) {
        setCourses(response.courses);
      } else {
        setCourses([]);
      }
    } catch (error) {
      console.error('Fetch courses error:', error);
      toast.error('Failed to fetch courses');
      setCourses([]);
    }
  }, []);

  const handleStatusChange = async () => {
    if (!selectedEnrollment || !newStatus) return;

    try {
      setActionLoading('status');
      await apiClient.updateEnrollmentStatus(selectedEnrollment._id, newStatus, statusReason);

      toast.success('Enrollment status updated successfully');
      setShowStatusModal(false);
      setSelectedEnrollment(null);
      setNewStatus('');
      setStatusReason('');
      fetchEnrollments(pagination.current);
    } catch (error: any) {
      console.error('Update status error:', error);
      toast.error(error.message || 'Failed to update enrollment status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSearch = () => {
    fetchEnrollments(1);
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > pagination.pages) return;
    fetchEnrollments(page);
  };

  // Initial fetch
  useEffect(() => {
    fetchEnrollments();
    fetchCourses();
  }, []);

  // Filter changes
  useEffect(() => {
    fetchEnrollments(1);
  }, [statusFilter, courseFilter]);

  // Debounced search
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (search || search === '') {
        fetchEnrollments(1);
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [search]);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
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
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Enrollment Management</h1>
              <p className="text-gray-600">Manage student enrollments and their status</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {statusOptions.map((status) => {
            const count = stats[status.value as keyof typeof stats] || 0;
            const StatusIcon = status.icon;
            return (
              <div key={status.value} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className={`${status.bgColor} p-3 rounded-lg`}>
                    <StatusIcon className={`h-6 w-6 ${status.color}`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{status.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{count}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search students or courses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              {statusOptions.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>

            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">All Courses</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.name}
                </option>
              ))}
            </select>

            <Button onClick={handleSearch} className="flex items-center">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </div>

        {/* Enrollments Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Student Enrollments ({pagination.total})
            </h3>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : enrollments.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No enrollments found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {search || statusFilter !== 'all' || courseFilter !== 'all' 
                  ? 'No student enrollments match your current filters.'
                  : 'No student enrollments yet.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Progress
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Enrolled Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {enrollments.map((enrollment) => {
                    const statusConfig = getStatusConfig(enrollment.status);
                    const StatusIcon = statusConfig.icon;
                    
                    return (
                      <tr key={enrollment._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {enrollment.student?.user?.firstName || 'Unknown'} {enrollment.student?.user?.lastName || ''}
                            </div>
                            <div className="text-sm text-gray-500">
                              {enrollment.student?.user?.email || 'No email'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {enrollment.course?.name || 'Unknown Course'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {enrollment.course?.isDiscountValid && enrollment.course?.effectivePrice ? (
                              <div className="flex items-center space-x-2">
                                <span className="text-green-600 font-medium">
                                  ₹{enrollment.course.effectivePrice.toLocaleString()}
                                </span>
                                <span className="line-through text-xs">
                                  ₹{enrollment.course.fees?.toLocaleString() || '0'}
                                </span>
                                <span className="bg-red-100 text-red-800 text-xs px-1 py-0.5 rounded">
                                  {enrollment.course.discountPercentage}% OFF
                                </span>
                              </div>
                            ) : (
                              <span>₹{enrollment.course?.fees?.toLocaleString() || '0'}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color}`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${enrollment.progress || 0}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600">{enrollment.progress || 0}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(enrollment.enrolledAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedEnrollment(enrollment);
                                setShowDetailsModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedEnrollment(enrollment);
                                setNewStatus(enrollment.status);
                                setShowStatusModal(true);
                              }}
                              className="text-green-600 hover:text-green-900"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(pagination.current - 1)}
                  disabled={pagination.current === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(pagination.current + 1)}
                  disabled={pagination.current === pagination.pages}
                >
                  Next
                </Button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing{' '}
                    <span className="font-medium">
                      {enrollments.length > 0 ? (pagination.current - 1) * pagination.limit + 1 : 0}
                    </span>{' '}
                    to{' '}
                    <span className="font-medium">
                      {Math.min(pagination.current * pagination.limit, pagination.total)}
                    </span>{' '}
                    of{' '}
                    <span className="font-medium">{pagination.total}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => handlePageChange(pagination.current - 1)}
                      disabled={pagination.current === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                        pagination.current === 1
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      Previous
                    </button>
                    {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === pagination.current
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => handlePageChange(pagination.current + 1)}
                      disabled={pagination.current === pagination.pages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                        pagination.current === pagination.pages
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Status Change Modal */}
        {showStatusModal && selectedEnrollment && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Change Enrollment Status
                </h3>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">
                    Student: {selectedEnrollment.student?.user?.firstName || 'Unknown'} {selectedEnrollment.student?.user?.lastName || ''}
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    Course: {selectedEnrollment.course?.name || 'Unknown Course'}
                  </p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    {statusOptions.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason (Optional)
                  </label>
                  <textarea
                    value={statusReason}
                    onChange={(e) => setStatusReason(e.target.value)}
                    rows={3}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter reason for status change..."
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowStatusModal(false);
                      setSelectedEnrollment(null);
                      setNewStatus('');
                      setStatusReason('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleStatusChange}
                    loading={actionLoading === 'status'}
                  >
                    Update Status
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Details Modal */}
        {showDetailsModal && selectedEnrollment && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-2/3 max-w-4xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Enrollment Details
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Student Information</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Name:</span> {selectedEnrollment.student?.user?.firstName || 'Unknown'} {selectedEnrollment.student?.user?.lastName || ''}</p>
                      <p><span className="font-medium">Email:</span> {selectedEnrollment.student?.user?.email || 'No email'}</p>
                      {selectedEnrollment.student?.user?.phone && (
                        <p><span className="font-medium">Phone:</span> {selectedEnrollment.student.user.phone}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Course Information</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Name:</span> {selectedEnrollment.course?.name || 'Unknown'}</p>
                      <p><span className="font-medium">Fees:</span> 
                        {selectedEnrollment.course?.isDiscountValid && selectedEnrollment.course?.effectivePrice ? (
                          <span className="ml-1">
                            <span className="text-green-600 font-medium">
                              ₹{selectedEnrollment.course.effectivePrice.toLocaleString()}
                            </span>
                            <span className="text-gray-500 line-through text-xs ml-2">
                              ₹{selectedEnrollment.course.fees?.toLocaleString() || '0'}
                            </span>
                            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded ml-2">
                              {selectedEnrollment.course.discountPercentage}% OFF
                            </span>
                          </span>
                        ) : (
                          <span className="ml-1">₹{selectedEnrollment.course?.fees?.toLocaleString() || '0'}</span>
                        )}
                      </p>
                      <p><span className="font-medium">Description:</span> {selectedEnrollment.course?.description || 'No description'}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Enrollment Status</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Current Status:</span> 
                        <span className={`ml-2 px-2 py-1 rounded text-xs ${getStatusConfig(selectedEnrollment.status).bgColor} ${getStatusConfig(selectedEnrollment.status).color}`}>
                          {getStatusConfig(selectedEnrollment.status).label}
                        </span>
                      </p>
                      <p><span className="font-medium">Progress:</span> {selectedEnrollment.progress || 0}%</p>
                      <p><span className="font-medium">Enrolled Date:</span> {formatDate(selectedEnrollment.enrolledAt)}</p>
                      {selectedEnrollment.completedAt && (
                        <p><span className="font-medium">Completed Date:</span> {formatDate(selectedEnrollment.completedAt)}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Progress Details</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Completed Subjects:</span> {selectedEnrollment.completedSubjects?.length || 0}</p>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${selectedEnrollment.progress || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedEnrollment.statusHistory && selectedEnrollment.statusHistory.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium text-gray-900 mb-2">Status History</h4>
                    <div className="max-h-40 overflow-y-auto">
                      <div className="space-y-2">
                        {selectedEnrollment.statusHistory.map((history, index) => (
                          <div key={index} className="text-sm border-l-2 border-gray-200 pl-3">
                            <p><span className="font-medium">Status:</span> {history.status}</p>
                            <p><span className="font-medium">Date:</span> {formatDate(history.changedAt)}</p>
                            {history.reason && <p><span className="font-medium">Reason:</span> {history.reason}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end mt-6">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowDetailsModal(false);
                      setSelectedEnrollment(null);
                    }}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnrollmentManagement;