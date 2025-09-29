import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Search, 
  Filter, 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  MoreVertical,
  CheckCircle,
  XCircle,
  Users,
  IndianRupee,
  Star,
  Calendar,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Upload,
  Download
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../lib/api';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

interface Course {
  _id: string;
  name: string;
  description: string;
  imageUrl?: string;
  videoUrl?: string;
  fees: number;
  duration: string;
  structure: string[];
  subjects: any[];
  instructor?: {
    _id: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
    designation: string;
  };
  isActive: boolean;
  enrollmentCount: number;
  rating: number;
  createdAt: string;
}

interface CourseFormData {
  name: string;
  description: string;
  fees: string;
  duration: string;
  structure: string[];
  subjects: string[];
  instructor: string;
  isActive: boolean;
}

const AdminCoursesManagement: React.FC = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInstructor, setSelectedInstructor] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCourses, setTotalCourses] = useState(0);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [courseStats, setCourseStats] = useState<any>(null);
  const [availableInstructors, setAvailableInstructors] = useState<any[]>([]);
  const [courseFormData, setCourseFormData] = useState<CourseFormData>({
    name: '',
    description: '',
    fees: '',
    duration: '',
    structure: [],
    subjects: [],
    instructor: '',
    isActive: true
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [newStructureItem, setNewStructureItem] = useState('');

  useEffect(() => {
    fetchCourses();
    fetchCourseStats();
    fetchAvailableInstructors();
  }, [currentPage, selectedInstructor, selectedStatus, searchQuery]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        search: searchQuery || undefined,
        instructor: selectedInstructor !== 'all' ? selectedInstructor : undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc' as const
      };

      const response = await apiClient.getAdminCourses(params);
      setCourses(response.courses || []);
      setTotalPages(response.pagination?.pages || 1);
      setTotalCourses(response.pagination?.total || 0);
    } catch (error: any) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseStats = async () => {
    try {
      const stats = await apiClient.getCourseStats();
      setCourseStats(stats);
    } catch (error) {
      console.error('Error fetching course stats:', error);
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

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading('create');
      
      const formData = new FormData();
      formData.append('name', courseFormData.name);
      formData.append('description', courseFormData.description);
      formData.append('fees', courseFormData.fees);
      formData.append('duration', courseFormData.duration);
      formData.append('structure', JSON.stringify(courseFormData.structure));
      formData.append('subjects', JSON.stringify(courseFormData.subjects));
      formData.append('instructor', courseFormData.instructor);
      formData.append('isActive', courseFormData.isActive.toString());
      
      if (imageFile) {
        formData.append('image', imageFile);
      }
      if (videoFile) {
        formData.append('video', videoFile);
      }

      await apiClient.createAdminCourse(formData);
      toast.success('Course created successfully');
      setShowCourseModal(false);
      resetForm();
      fetchCourses();
      fetchCourseStats();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create course');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;

    try {
      setActionLoading('update');
      
      const formData = new FormData();
      formData.append('name', courseFormData.name);
      formData.append('description', courseFormData.description);
      formData.append('fees', courseFormData.fees);
      formData.append('duration', courseFormData.duration);
      formData.append('structure', JSON.stringify(courseFormData.structure));
      formData.append('subjects', JSON.stringify(courseFormData.subjects));
      formData.append('instructor', courseFormData.instructor);
      formData.append('isActive', courseFormData.isActive.toString());
      
      if (imageFile) {
        formData.append('image', imageFile);
      }
      if (videoFile) {
        formData.append('video', videoFile);
      }

      await apiClient.updateAdminCourse(editingCourse._id, formData);
      toast.success('Course updated successfully');
      setShowCourseModal(false);
      setEditingCourse(null);
      resetForm();
      fetchCourses();
      fetchCourseStats();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update course');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!window.confirm('Are you sure you want to delete this course?')) {
      return;
    }

    try {
      setActionLoading(courseId);
      await apiClient.deleteAdminCourse(courseId);
      toast.success('Course deleted successfully');
      fetchCourses();
      fetchCourseStats();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete course');
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete') => {
    if (selectedCourses.length === 0) {
      toast.error('Please select courses first');
      return;
    }

    const actionText = action === 'activate' ? 'activate' : action === 'deactivate' ? 'deactivate' : 'delete';
    if (!window.confirm(`Are you sure you want to ${actionText} ${selectedCourses.length} course(s)?`)) {
      return;
    }

    try {
      setActionLoading('bulk');
      await apiClient.bulkUpdateCourses(selectedCourses, action);
      toast.success(`Courses ${actionText}d successfully`);
      setSelectedCourses([]);
      fetchCourses();
      fetchCourseStats();
    } catch (error: any) {
      toast.error(error.message || `Failed to ${actionText} courses`);
    } finally {
      setActionLoading(null);
    }
  };

  const openEditModal = (course: Course) => {
    setEditingCourse(course);
    setCourseFormData({
      name: course.name,
      description: course.description,
      fees: course.fees.toString(),
      duration: course.duration,
      structure: course.structure || [],
      subjects: course.subjects?.map(s => s._id) || [],
      instructor: course.instructor?._id || '',
      isActive: course.isActive
    });
    setShowCourseModal(true);
  };

  const resetForm = () => {
    setCourseFormData({
      name: '',
      description: '',
      fees: '',
      duration: '',
      structure: [],
      subjects: [],
      instructor: '',
      isActive: true
    });
    setImageFile(null);
    setVideoFile(null);
    setNewStructureItem('');
  };

  const addStructureItem = () => {
    if (newStructureItem.trim()) {
      setCourseFormData({
        ...courseFormData,
        structure: [...courseFormData.structure, newStructureItem.trim()]
      });
      setNewStructureItem('');
    }
  };

  const removeStructureItem = (index: number) => {
    setCourseFormData({
      ...courseFormData,
      structure: courseFormData.structure.filter((_, i) => i !== index)
    });
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && currentPage === 1) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading courses...</p>
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
                <h1 className="text-2xl font-bold text-gray-900">Course Management</h1>
                <p className="text-gray-600">Add, edit, or remove courses</p>
              </div>
            </div>
            <Button
              onClick={() => {
                setEditingCourse(null);
                resetForm();
                setShowCourseModal(true);
              }}
              className="flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Course
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {courseStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Courses</p>
                  <p className="text-2xl font-bold text-gray-900">{courseStats.totalCourses}</p>
                </div>
                <BookOpen className="w-8 h-8 text-blue-500" />
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Courses</p>
                  <p className="text-2xl font-bold text-green-600">{courseStats.activeCourses}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Enrollments</p>
                  <p className="text-2xl font-bold text-purple-600">{courseStats.totalEnrollments}</p>
                </div>
                <Users className="w-8 h-8 text-purple-500" />
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-orange-600">{formatCurrency(courseStats.totalRevenue)}</p>
                </div>
                <IndianRupee className="w-8 h-8 text-orange-500" />
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
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full lg:w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
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

            {selectedCourses.length > 0 && (
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleBulkAction('activate')}
                  loading={actionLoading === 'bulk'}
                >
                  Activate ({selectedCourses.length})
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('deactivate')}
                  loading={actionLoading === 'bulk'}
                >
                  Deactivate ({selectedCourses.length})
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleBulkAction('delete')}
                  loading={actionLoading === 'bulk'}
                >
                  Delete ({selectedCourses.length})
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Courses Table */}
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
                      <th className="px-6 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedCourses.length === courses.length && courses.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCourses(courses.map(c => c._id));
                            } else {
                              setSelectedCourses([]);
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Course
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Instructor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fees
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Enrollments
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
                    {courses.map((course) => (
                      <tr key={course._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedCourses.includes(course._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedCourses([...selectedCourses, course._id]);
                              } else {
                                setSelectedCourses(selectedCourses.filter(id => id !== course._id));
                              }
                            }}
                            className="rounded border-gray-300"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12">
                              {course.imageUrl ? (
                                <img
                                  src={course.imageUrl}
                                  alt={course.name}
                                  className="h-12 w-12 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                                  <BookOpen className="w-6 h-6 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {course.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {course.duration}
                              </div>
                              <div className="flex items-center mt-1">
                                <Star className="w-4 h-4 text-yellow-400 mr-1" />
                                <span className="text-sm text-gray-600">
                                  {course.rating.toFixed(1)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {course.instructor ? (
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {course.instructor.user.firstName} {course.instructor.user.lastName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {course.instructor.designation}
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">Not assigned</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-gray-900">
                            {formatCurrency(course.fees)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <Users className="w-4 h-4 text-gray-400 mr-1" />
                            <span className="text-sm text-gray-900">{course.enrollmentCount}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            course.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {course.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <Link
                              to={`/courses/${course._id}`}
                              className="text-blue-600 hover:text-blue-900"
                              title="View Course"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => openEditModal(course)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Edit Course"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCourse(course._id)}
                              disabled={actionLoading === course._id}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50"
                              title="Delete Course"
                            >
                              {actionLoading === course._id ? (
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
                          {Math.min(currentPage * 10, totalCourses)}
                        </span>
                        {' '}of{' '}
                        <span className="font-medium">{totalCourses}</span>
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

      {/* Course Form Modal - Updated with proper scrolling */}
      {showCourseModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl my-8 flex flex-col max-h-[90vh]">
            {/* Fixed Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
              <h3 className="text-lg font-medium text-gray-900">
                {editingCourse ? 'Edit Course' : 'Add New Course'}
              </h3>
            </div>
            
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              <form onSubmit={editingCourse ? handleUpdateCourse : handleCreateCourse} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Course Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={courseFormData.name}
                      onChange={(e) => setCourseFormData({...courseFormData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter course name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration *
                    </label>
                    <input
                      type="text"
                      required
                      value={courseFormData.duration}
                      onChange={(e) => setCourseFormData({...courseFormData, duration: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 3 months"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={courseFormData.description}
                    onChange={(e) => setCourseFormData({...courseFormData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter course description"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fees (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={courseFormData.fees}
                      onChange={(e) => setCourseFormData({...courseFormData, fees: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter course fees"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Instructor
                    </label>
                    <select
                      value={courseFormData.instructor}
                      onChange={(e) => setCourseFormData({...courseFormData, instructor: e.target.value})}
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

                {/* Course Structure */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Structure
                  </label>
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="space-y-2 max-h-40 overflow-y-auto mb-3">
                      {courseFormData.structure.map((item, index) => (
                        <div key={index} className="flex items-center space-x-2 bg-white p-2 rounded border">
                          <span className="text-sm text-gray-600 font-medium">{index + 1}.</span>
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => {
                              const newStructure = [...courseFormData.structure];
                              newStructure[index] = e.target.value;
                              setCourseFormData({...courseFormData, structure: newStructure});
                            }}
                            className="flex-1 px-3 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => removeStructureItem(index)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      {courseFormData.structure.length === 0 && (
                        <p className="text-sm text-gray-500 text-center py-4">No structure items added yet</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 border-t pt-3">
                      <input
                        type="text"
                        value={newStructureItem}
                        onChange={(e) => setNewStructureItem(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Add new structure item (e.g., Module 1: Introduction)"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addStructureItem();
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addStructureItem}
                        disabled={!newStructureItem.trim()}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  </div>
                </div>

                {/* File Uploads */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Course Image
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-gray-400 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      {imageFile && (
                        <p className="mt-2 text-sm text-green-600">
                          Selected: {imageFile.name}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Course Video
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-gray-400 transition-colors">
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      {videoFile && (
                        <p className="mt-2 text-sm text-green-600">
                          Selected: {videoFile.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={courseFormData.isActive}
                    onChange={(e) => setCourseFormData({...courseFormData, isActive: e.target.checked})}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                    Course is active and visible to students
                  </label>
                </div>
              </form>
            </div>
            
            {/* Fixed Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3 flex-shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCourseModal(false);
                  setEditingCourse(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                onClick={editingCourse ? handleUpdateCourse : handleCreateCourse}
                loading={actionLoading === 'create' || actionLoading === 'update'}
              >
                {editingCourse ? 'Update Course' : 'Create Course'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCoursesManagement;