import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  UserPlus,
  UserMinus,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../lib/api';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

interface Batch {
  _id: string;
  name: string;
  course: {
    _id: string;
    name: string;
    fees: number;
    duration: string;
  };
  instructor: {
    _id: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
    designation: string;
  };
  schedule: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    subject?: string;
  }>;
  maxStudents: number;
  enrolledStudents: Array<{
    student: string;
    enrolledAt: string;
    status: 'active' | 'inactive' | 'completed';
  }>;
  startDate: string;
  endDate: string;
  isActive: boolean;
  currentEnrollment: number;
  completionRate: number;
  upcomingClasses: number;
  createdAt: string;
}

interface BatchFormData {
  name: string;
  course: string;
  instructor: string;
  maxStudents: string;
  startDate: string;
  endDate: string;
  schedule: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    subject?: string;
  }>;
  isActive: boolean;
}

const AdminBatchesManagement: React.FC = () => {
  const { user } = useAuth();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedInstructor, setSelectedInstructor] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBatches, setTotalBatches] = useState(0);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [batchStats, setBatchStats] = useState<any>(null);
  const [availableCourses, setAvailableCourses] = useState<any[]>([]);
  const [availableInstructors, setAvailableInstructors] = useState<any[]>([]);
  const [batchFormData, setBatchFormData] = useState<BatchFormData>({
    name: '',
    course: '',
    instructor: '',
    maxStudents: '30',
    startDate: '',
    endDate: '',
    schedule: [],
    isActive: true
  });

  const daysOfWeek = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ];

  useEffect(() => {
    fetchBatches();
    fetchBatchStats();
    fetchAvailableCourses();
    fetchAvailableInstructors();
  }, [currentPage, selectedCourse, selectedInstructor, selectedStatus, searchQuery]);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        search: searchQuery || undefined,
        course: selectedCourse !== 'all' ? selectedCourse : undefined,
        instructor: selectedInstructor !== 'all' ? selectedInstructor : undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc' as const
      };

      const response = await apiClient.getAdminBatches(params);
      setBatches(response.batches || []);
      setTotalPages(response.pagination?.pages || 1);
      setTotalBatches(response.pagination?.total || 0);
    } catch (error: any) {
      console.error('Error fetching batches:', error);
      toast.error('Failed to load batches');
    } finally {
      setLoading(false);
    }
  };

  const fetchBatchStats = async () => {
    try {
      const stats = await apiClient.getBatchStats();
      setBatchStats(stats);
    } catch (error) {
      console.error('Error fetching batch stats:', error);
    }
  };

  const fetchAvailableCourses = async () => {
    try {
      const response = await apiClient.getAdminCourses({ limit: 100 });
      setAvailableCourses(response.courses || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchAvailableInstructors = async () => {
    try {
      const instructors = await apiClient.getAvailableInstructors();
      setAvailableInstructors(instructors);
    } catch (error) {
      console.error('Error fetching instructors:', error);
    }
  };

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading('create');
      
      const batchData = {
        ...batchFormData,
        maxStudents: parseInt(batchFormData.maxStudents)
      };

      await apiClient.createAdminBatch(batchData);
      toast.success('Batch created successfully');
      setShowBatchModal(false);
      resetForm();
      fetchBatches();
      fetchBatchStats();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create batch');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBatch) return;

    try {
      setActionLoading('update');
      
      const batchData = {
        ...batchFormData,
        maxStudents: parseInt(batchFormData.maxStudents)
      };

      await apiClient.updateAdminBatch(editingBatch._id, batchData);
      toast.success('Batch updated successfully');
      setShowBatchModal(false);
      setEditingBatch(null);
      resetForm();
      fetchBatches();
      fetchBatchStats();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update batch');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteBatch = async (batchId: string) => {
    if (!window.confirm('Are you sure you want to delete this batch?')) {
      return;
    }

    try {
      setActionLoading(batchId);
      await apiClient.deleteAdminBatch(batchId);
      toast.success('Batch deleted successfully');
      fetchBatches();
      fetchBatchStats();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete batch');
    } finally {
      setActionLoading(null);
    }
  };

  const openEditModal = (batch: Batch) => {
    setEditingBatch(batch);
    setBatchFormData({
      name: batch.name,
      course: batch.course._id,
      instructor: batch.instructor._id,
      maxStudents: batch.maxStudents.toString(),
      startDate: batch.startDate.split('T')[0],
      endDate: batch.endDate.split('T')[0],
      schedule: batch.schedule || [],
      isActive: batch.isActive
    });
    setShowBatchModal(true);
  };

  const resetForm = () => {
    setBatchFormData({
      name: '',
      course: '',
      instructor: '',
      maxStudents: '30',
      startDate: '',
      endDate: '',
      schedule: [],
      isActive: true
    });
  };

  const addScheduleItem = () => {
    setBatchFormData({
      ...batchFormData,
      schedule: [
        ...batchFormData.schedule,
        {
          dayOfWeek: 1,
          startTime: '09:00',
          endTime: '12:00'
        }
      ]
    });
  };

  const updateScheduleItem = (index: number, field: string, value: any) => {
    const newSchedule = [...batchFormData.schedule];
    newSchedule[index] = { ...newSchedule[index], [field]: value };
    setBatchFormData({ ...batchFormData, schedule: newSchedule });
  };

  const removeScheduleItem = (index: number) => {
    setBatchFormData({
      ...batchFormData,
      schedule: batchFormData.schedule.filter((_, i) => i !== index)
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  if (loading && currentPage === 1) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading batches...</p>
        </div>
      </div>
    );
  }

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
                <h1 className="text-2xl font-bold text-gray-900">Batch Management</h1>
                <p className="text-gray-600">Manage class schedules and batches</p>
              </div>
            </div>
            <Button
              onClick={() => {
                setEditingBatch(null);
                resetForm();
                setShowBatchModal(true);
              }}
              className="flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Batch
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {batchStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Batches</p>
                  <p className="text-2xl font-bold text-gray-900">{batchStats.totalBatches}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Batches</p>
                  <p className="text-2xl font-bold text-green-600">{batchStats.activeBatches}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold text-purple-600">{batchStats.totalStudentsInBatches}</p>
                </div>
                <GraduationCap className="w-8 h-8 text-purple-500" />
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Upcoming Classes</p>
                  <p className="text-2xl font-bold text-orange-600">{batchStats.upcomingClasses}</p>
                </div>
                <Calendar className="w-8 h-8 text-orange-500" />
              </div>
            </Card>
          </div>
        )}

        {/* Filters and Search */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search batches..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full lg:w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Courses</option>
                {availableCourses.map(course => (
                  <option key={course._id} value={course._id}>
                    {course.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedInstructor}
                onChange={(e) => setSelectedInstructor(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Instructors</option>
                {availableInstructors.map(instructor => (
                  <option key={instructor._id} value={instructor._id}>
                    {instructor.user.firstName} {instructor.user.lastName}
                  </option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Batches Table */}
        <Card className="overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Batch
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Course
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Instructor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Students
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Schedule
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {batches.map((batch) => (
                      <tr key={batch._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {batch.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatDate(batch.startDate)} - {formatDate(batch.endDate)}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {batch.course.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {batch.course.duration}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {batch.instructor.user.firstName} {batch.instructor.user.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {batch.instructor.designation}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <Users className="w-4 h-4 text-gray-400 mr-1" />
                            <span className="text-sm text-gray-900">
                              {batch.currentEnrollment}/{batch.maxStudents}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                            <div
                              className="bg-blue-600 h-1 rounded-full"
                              style={{ width: `${(batch.currentEnrollment / batch.maxStudents) * 100}%` }}
                            ></div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {batch.schedule.length} classes/week
                          </div>
                          <div className="text-sm text-gray-500">
                            {batch.upcomingClasses} upcoming
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(batch.isActive)}`}>
                            {batch.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => openEditModal(batch)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Edit Batch"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteBatch(batch._id)}
                              disabled={actionLoading === batch._id}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50"
                              title="Delete Batch"
                            >
                              {actionLoading === batch._id ? (
                                <LoadingSpinner size="sm" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing{' '}
                        <span className="font-medium">{((currentPage - 1) * 10) + 1}</span>
                        {' '}to{' '}
                        <span className="font-medium">
                          {Math.min(currentPage * 10, totalBatches)}
                        </span>
                        {' '}of{' '}
                        <span className="font-medium">{totalBatches}</span>
                        {' '}results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="rounded-r-none"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        
                        {[...Array(Math.min(5, totalPages))].map((_, index) => {
                          const pageNumber = currentPage <= 3 
                            ? index + 1
                            : currentPage >= totalPages - 2
                            ? totalPages - 4 + index
                            : currentPage - 2 + index;
                          
                          if (pageNumber < 1 || pageNumber > totalPages) return null;
                          
                          return (
                            <Button
                              key={pageNumber}
                              variant={currentPage === pageNumber ? "primary" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(pageNumber)}
                              className="rounded-none"
                            >
                              {pageNumber}
                            </Button>
                          );
                        })}
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className="rounded-l-none"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
      </div>

      {/* Batch Form Modal */}
      {showBatchModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-90vh overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {editingBatch ? 'Edit Batch' : 'Add New Batch'}
              </h3>
            </div>
            
            <form onSubmit={editingBatch ? handleUpdateBatch : handleCreateBatch} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Batch Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={batchFormData.name}
                    onChange={(e) => setBatchFormData({...batchFormData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter batch name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Students *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="100"
                    value={batchFormData.maxStudents}
                    onChange={(e) => setBatchFormData({...batchFormData, maxStudents: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Maximum students"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course *
                  </label>
                  <select
                    required
                    value={batchFormData.course}
                    onChange={(e) => setBatchFormData({...batchFormData, course: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Course</option>
                    {availableCourses.map(course => (
                      <option key={course._id} value={course._id}>
                        {course.name} - ₹{course.fees?.toLocaleString('en-IN')}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Instructor *
                  </label>
                  <select
                    required
                    value={batchFormData.instructor}
                    onChange={(e) => setBatchFormData({...batchFormData, instructor: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Instructor</option>
                    {availableInstructors.map(instructor => (
                      <option key={instructor._id} value={instructor._id}>
                        {instructor.user.firstName} {instructor.user.lastName} - {instructor.designation}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={batchFormData.startDate}
                    onChange={(e) => setBatchFormData({...batchFormData, startDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={batchFormData.endDate}
                    onChange={(e) => setBatchFormData({...batchFormData, endDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Schedule */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Class Schedule
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addScheduleItem}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Schedule
                  </Button>
                </div>
                <div className="space-y-3">
                  {batchFormData.schedule.map((scheduleItem, index) => (
                    <div key={index} className="grid grid-cols-4 gap-3 p-3 border border-gray-200 rounded-lg">
                      <select
                        value={scheduleItem.dayOfWeek}
                        onChange={(e) => updateScheduleItem(index, 'dayOfWeek', parseInt(e.target.value))}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        {daysOfWeek.map((day, dayIndex) => (
                          <option key={dayIndex} value={dayIndex}>
                            {day}
                          </option>
                        ))}
                      </select>
                      <input
                        type="time"
                        value={scheduleItem.startTime}
                        onChange={(e) => updateScheduleItem(index, 'startTime', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="time"
                        value={scheduleItem.endTime}
                        onChange={(e) => updateScheduleItem(index, 'endTime', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => removeScheduleItem(index)}
                        className="text-red-600 hover:text-red-800 flex items-center justify-center"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={batchFormData.isActive}
                  onChange={(e) => setBatchFormData({...batchFormData, isActive: e.target.checked})}
                  className="rounded border-gray-300"
                />
                <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                  Batch is active
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowBatchModal(false);
                    setEditingBatch(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={actionLoading === 'create' || actionLoading === 'update'}
                >
                  {editingBatch ? 'Update Batch' : 'Create Batch'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBatchesManagement;