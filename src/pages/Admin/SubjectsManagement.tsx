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
  FileText,
  CheckCircle,
  XCircle,
  Upload,
  Download,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Clock,
  List,
  Image,
  Video,
  Link as LinkIcon,
  File
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../lib/api';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

interface Subject {
  _id: string;
  name: string;
  description: string;
  imageUrl?: string;
  course?: {
    _id: string;
    name: string;
    fees: number;
    duration: string;
  };
  syllabus: Array<{
    topic: string;
    duration?: string;
    description?: string;
  }>;
  materials: Array<{
    _id: string;
    title: string;
    type: 'pdf' | 'video' | 'link' | 'document';
    url: string;
    uploadedAt: string;
  }>;
  isActive: boolean;
  syllabusCount: number;
  materialsCount: number;
  createdAt: string;
}

interface SubjectFormData {
  name: string;
  description: string;
  course: string;
  syllabus: Array<{
    topic: string;
    duration: string;
    description: string;
  }>;
  isActive: boolean;
}

interface MaterialFormData {
  title: string;
  type: 'pdf' | 'video' | 'link' | 'document';
  description: string;
}

const AdminSubjectsManagement: React.FC = () => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSubjects, setTotalSubjects] = useState(0);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [selectedSubjectForMaterial, setSelectedSubjectForMaterial] = useState<Subject | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [subjectStats, setSubjectStats] = useState<any>(null);
  const [availableCourses, setAvailableCourses] = useState<any[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [materialFile, setMaterialFile] = useState<File | null>(null);
  const [subjectFormData, setSubjectFormData] = useState<SubjectFormData>({
    name: '',
    description: '',
    course: '',
    syllabus: [],
    isActive: true
  });
  const [materialFormData, setMaterialFormData] = useState<MaterialFormData>({
    title: '',
    type: 'pdf',
    description: ''
  });
  const [newSyllabusItem, setNewSyllabusItem] = useState({
    topic: '',
    duration: '',
    description: ''
  });

  useEffect(() => {
    fetchSubjects();
    fetchSubjectStats();
    fetchAvailableCourses();
  }, [currentPage, selectedCourse, selectedStatus, searchQuery]);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        search: searchQuery || undefined,
        course: selectedCourse !== 'all' ? selectedCourse : undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc' as const
      };

      const response = await apiClient.getAdminSubjects(params);
      setSubjects(response.subjects || []);
      setTotalPages(response.pagination?.pages || 1);
      setTotalSubjects(response.pagination?.total || 0);
    } catch (error: any) {
      console.error('Error fetching subjects:', error);
      toast.error('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjectStats = async () => {
    try {
      const stats = await apiClient.getSubjectStats();
      setSubjectStats(stats);
    } catch (error) {
      console.error('Error fetching subject stats:', error);
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

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading('create');
      
      const formData = new FormData();
      formData.append('name', subjectFormData.name);
      formData.append('description', subjectFormData.description);
      formData.append('course', subjectFormData.course);
      formData.append('syllabus', JSON.stringify(subjectFormData.syllabus));
      formData.append('isActive', subjectFormData.isActive.toString());
      
      if (imageFile) {
        formData.append('image', imageFile);
      }

      await apiClient.createAdminSubject(formData);
      toast.success('Subject created successfully');
      setShowSubjectModal(false);
      resetSubjectForm();
      fetchSubjects();
      fetchSubjectStats();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create subject');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubject) return;

    try {
      setActionLoading('update');
      
      const formData = new FormData();
      formData.append('name', subjectFormData.name);
      formData.append('description', subjectFormData.description);
      formData.append('course', subjectFormData.course);
      formData.append('syllabus', JSON.stringify(subjectFormData.syllabus));
      formData.append('isActive', subjectFormData.isActive.toString());
      
      if (imageFile) {
        formData.append('image', imageFile);
      }

      await apiClient.updateAdminSubject(editingSubject._id, formData);
      toast.success('Subject updated successfully');
      setShowSubjectModal(false);
      setEditingSubject(null);
      resetSubjectForm();
      fetchSubjects();
      fetchSubjectStats();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update subject');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteSubject = async (subjectId: string) => {
    if (!window.confirm('Are you sure you want to delete this subject?')) {
      return;
    }

    try {
      setActionLoading(subjectId);
      await apiClient.deleteAdminSubject(subjectId);
      toast.success('Subject deleted successfully');
      fetchSubjects();
      fetchSubjectStats();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete subject');
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkActions = async (action: 'activate' | 'deactivate' | 'delete') => {
    if (selectedSubjects.length === 0) {
      toast.error('Please select subjects first');
      return;
    }

    const actionText = action === 'activate' ? 'activate' : action === 'deactivate' ? 'deactivate' : 'delete';
    if (!window.confirm(`Are you sure you want to ${actionText} ${selectedSubjects.length} subject(s)?`)) {
      return;
    }

    try {
      setActionLoading('bulk');
      await apiClient.bulkUpdateSubjects(selectedSubjects, action);
      toast.success(`Subjects ${actionText}d successfully`);
      setSelectedSubjects([]);
      fetchSubjects();
      fetchSubjectStats();
    } catch (error: any) {
      toast.error(error.message || `Failed to ${actionText} subjects`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubjectForMaterial) return;

    try {
      setActionLoading('material');
      
      const formData = new FormData();
      formData.append('title', materialFormData.title);
      formData.append('type', materialFormData.type);
      formData.append('description', materialFormData.description);
      
      if (materialFile) {
        formData.append('file', materialFile);
      }

      await apiClient.addSubjectMaterial(selectedSubjectForMaterial._id, formData);
      toast.success('Material added successfully');
      setShowMaterialModal(false);
      setSelectedSubjectForMaterial(null);
      resetMaterialForm();
      fetchSubjects();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add material');
    } finally {
      setActionLoading(null);
    }
  };

  const openEditModal = (subject: Subject) => {
    setEditingSubject(subject);
    setSubjectFormData({
      name: subject.name,
      description: subject.description,
      course: subject.course?._id || '',
      syllabus: subject.syllabus || [],
      isActive: subject.isActive
    });
    setShowSubjectModal(true);
  };

  const openMaterialModal = (subject: Subject) => {
    setSelectedSubjectForMaterial(subject);
    setShowMaterialModal(true);
  };

  const resetSubjectForm = () => {
    setSubjectFormData({
      name: '',
      description: '',
      course: '',
      syllabus: [],
      isActive: true
    });
    setImageFile(null);
    setNewSyllabusItem({ topic: '', duration: '', description: '' });
  };

  const resetMaterialForm = () => {
    setMaterialFormData({
      title: '',
      type: 'pdf',
      description: ''
    });
    setMaterialFile(null);
  };

  const addSyllabusItem = () => {
    if (newSyllabusItem.topic.trim()) {
      setSubjectFormData({
        ...subjectFormData,
        syllabus: [...subjectFormData.syllabus, { ...newSyllabusItem }]
      });
      setNewSyllabusItem({ topic: '', duration: '', description: '' });
    }
  };

  const removeSyllabusItem = (index: number) => {
    setSubjectFormData({
      ...subjectFormData,
      syllabus: subjectFormData.syllabus.filter((_, i) => i !== index)
    });
  };

  const updateSyllabusItem = (index: number, field: string, value: string) => {
    const newSyllabus = [...subjectFormData.syllabus];
    newSyllabus[index] = { ...newSyllabus[index], [field]: value };
    setSubjectFormData({ ...subjectFormData, syllabus: newSyllabus });
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

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-4 h-4 text-red-500" />;
      case 'video':
        return <Video className="w-4 h-4 text-green-500" />;
      case 'link':
        return <LinkIcon className="w-4 h-4 text-blue-500" />;
      case 'document':
        return <File className="w-4 h-4 text-gray-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading && currentPage === 1) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading subjects...</p>
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
                <h1 className="text-2xl font-bold text-gray-900">Subject Management</h1>
                <p className="text-gray-600">Manage course subjects and learning materials</p>
              </div>
            </div>
            <Button
              onClick={() => {
                setEditingSubject(null);
                resetSubjectForm();
                setShowSubjectModal(true);
              }}
              className="flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Subject
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {subjectStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Subjects</p>
                  <p className="text-2xl font-bold text-gray-900">{subjectStats.totalSubjects}</p>
                </div>
                <BookOpen className="w-8 h-8 text-blue-500" />
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Subjects</p>
                  <p className="text-2xl font-bold text-green-600">{subjectStats.activeSubjects}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">With Course</p>
                  <p className="text-2xl font-bold text-purple-600">{subjectStats.subjectsWithCourse}</p>
                </div>
                <List className="w-8 h-8 text-purple-500" />
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Topics</p>
                  <p className="text-2xl font-bold text-orange-600">{Math.round(subjectStats.avgSyllabusLength)}</p>
                </div>
                <FileText className="w-8 h-8 text-orange-500" />
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
                  placeholder="Search subjects..."
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
                <option value="">No Course Assigned</option>
                {availableCourses.map(course => (
                  <option key={course._id} value={course._id}>
                    {course.name}
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

            {selectedSubjects.length > 0 && (
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleBulkActions('activate')}
                  loading={actionLoading === 'bulk'}
                >
                  Activate ({selectedSubjects.length})
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkActions('deactivate')}
                  loading={actionLoading === 'bulk'}
                >
                  Deactivate ({selectedSubjects.length})
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleBulkActions('delete')}
                  loading={actionLoading === 'bulk'}
                >
                  Delete ({selectedSubjects.length})
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Subjects Table */}
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
                          checked={selectedSubjects.length === subjects.length && subjects.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedSubjects(subjects.map(s => s._id));
                            } else {
                              setSelectedSubjects([]);
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subject
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Course
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Content
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {subjects.map((subject) => (
                      <tr key={subject._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedSubjects.includes(subject._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedSubjects([...selectedSubjects, subject._id]);
                              } else {
                                setSelectedSubjects(selectedSubjects.filter(id => id !== subject._id));
                              }
                            }}
                            className="rounded border-gray-300"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12">
                              {subject.imageUrl ? (
                                <img
                                  src={subject.imageUrl}
                                  alt={subject.name}
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
                                {subject.name}
                              </div>
                              <div className="text-sm text-gray-500 line-clamp-1">
                                {subject.description}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {subject.course ? (
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {subject.course.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {subject.course.duration}
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500 italic">No course assigned</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <List className="w-4 h-4 mr-1" />
                              {subject.syllabusCount} topics
                            </div>
                            <div className="flex items-center">
                              <FileText className="w-4 h-4 mr-1" />
                              {subject.materialsCount} materials
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(subject.isActive)}`}>
                            {subject.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {formatDate(subject.createdAt)}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => openEditModal(subject)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Edit Subject"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openMaterialModal(subject)}
                              className="text-green-600 hover:text-green-900"
                              title="Add Material"
                            >
                              <Upload className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteSubject(subject._id)}
                              disabled={actionLoading === subject._id}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50"
                              title="Delete Subject"
                            >
                              {actionLoading === subject._id ? (
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
                          {Math.min(currentPage * 10, totalSubjects)}
                        </span>
                        {' '}of{' '}
                        <span className="font-medium">{totalSubjects}</span>
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

      {/* Subject Form Modal - Updated with proper scrolling */}
      {showSubjectModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl my-8 flex flex-col max-h-[90vh]">
            {/* Fixed Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
              <h3 className="text-lg font-medium text-gray-900">
                {editingSubject ? 'Edit Subject' : 'Add New Subject'}
              </h3>
            </div>
            
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              <form onSubmit={editingSubject ? handleUpdateSubject : handleCreateSubject} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subject Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={subjectFormData.name}
                      onChange={(e) => setSubjectFormData({...subjectFormData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter subject name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Course
                    </label>
                    <select
                      value={subjectFormData.course}
                      onChange={(e) => setSubjectFormData({...subjectFormData, course: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">No Course (Standalone Subject)</option>
                      {availableCourses.map(course => (
                        <option key={course._id} value={course._id}>
                          {course.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={subjectFormData.description}
                    onChange={(e) => setSubjectFormData({...subjectFormData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter subject description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject Image
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

                {/* Syllabus Management */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Syllabus Topics
                  </label>
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    {/* Add New Topic Form */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 border border-gray-200 rounded-lg mb-4 bg-white">
                      <input
                        type="text"
                        value={newSyllabusItem.topic}
                        onChange={(e) => setNewSyllabusItem({...newSyllabusItem, topic: e.target.value})}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Topic name"
                      />
                      <input
                        type="text"
                        value={newSyllabusItem.duration}
                        onChange={(e) => setNewSyllabusItem({...newSyllabusItem, duration: e.target.value})}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Duration (e.g., 2 hours)"
                      />
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={newSyllabusItem.description}
                          onChange={(e) => setNewSyllabusItem({...newSyllabusItem, description: e.target.value})}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="Description (optional)"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addSyllabusItem}
                          disabled={!newSyllabusItem.topic.trim()}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Existing Topics */}
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {subjectFormData.syllabus.map((item, index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 border border-gray-200 rounded-lg bg-white">
                          <div>
                            <span className="text-xs text-gray-500 font-medium">Topic {index + 1}</span>
                            <input
                              type="text"
                              value={item.topic}
                              onChange={(e) => updateSyllabusItem(index, 'topic', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mt-1"
                              placeholder="Topic name"
                            />
                          </div>
                          <div>
                            <span className="text-xs text-gray-500 font-medium">Duration</span>
                            <input
                              type="text"
                              value={item.duration}
                              onChange={(e) => updateSyllabusItem(index, 'duration', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mt-1"
                              placeholder="Duration"
                            />
                          </div>
                          <div>
                            <span className="text-xs text-gray-500 font-medium">Description</span>
                            <div className="flex items-end space-x-2 mt-1">
                              <input
                                type="text"
                                value={item.description}
                                onChange={(e) => updateSyllabusItem(index, 'description', e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="Description"
                              />
                              <button
                                type="button"
                                onClick={() => removeSyllabusItem(index)}
                                className="text-red-600 hover:text-red-800 p-2"
                                title="Remove topic"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                      {subjectFormData.syllabus.length === 0 && (
                        <p className="text-sm text-gray-500 text-center py-8">No syllabus topics added yet. Use the form above to add topics.</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={subjectFormData.isActive}
                    onChange={(e) => setSubjectFormData({...subjectFormData, isActive: e.target.checked})}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                    Subject is active and visible to students
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
                  setShowSubjectModal(false);
                  setEditingSubject(null);
                  resetSubjectForm();
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                onClick={editingSubject ? handleUpdateSubject : handleCreateSubject}
                loading={actionLoading === 'create' || actionLoading === 'update'}
              >
                {editingSubject ? 'Update Subject' : 'Create Subject'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Material Form Modal - Updated with proper scrolling */}
      {showMaterialModal && selectedSubjectForMaterial && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md my-8 flex flex-col max-h-[90vh]">
            {/* Fixed Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
              <h3 className="text-lg font-medium text-gray-900">
                Add Material to {selectedSubjectForMaterial.name}
              </h3>
            </div>
            
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              <form onSubmit={handleAddMaterial} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Material Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={materialFormData.title}
                    onChange={(e) => setMaterialFormData({...materialFormData, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter material title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Material Type *
                  </label>
                  <select
                    required
                    value={materialFormData.type}
                    onChange={(e) => setMaterialFormData({...materialFormData, type: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="pdf">PDF Document</option>
                    <option value="video">Video</option>
                    <option value="document">Document</option>
                    <option value="link">External Link</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={materialFormData.description}
                    onChange={(e) => setMaterialFormData({...materialFormData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter material description"
                  />
                </div>

                {materialFormData.type !== 'link' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Upload File *
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-gray-400 transition-colors">
                      <input
                        type="file"
                        required
                        onChange={(e) => setMaterialFile(e.target.files?.[0] || null)}
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        accept={
                          materialFormData.type === 'pdf' ? '.pdf' :
                          materialFormData.type === 'video' ? 'video/*' :
                          '.pdf,.doc,.docx,.txt'
                        }
                      />
                      {materialFile && (
                        <p className="mt-2 text-sm text-green-600">
                          Selected: {materialFile.name}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </form>
            </div>
            
            {/* Fixed Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3 flex-shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowMaterialModal(false);
                  setSelectedSubjectForMaterial(null);
                  resetMaterialForm();
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                onClick={handleAddMaterial}
                loading={actionLoading === 'material'}
              >
                Add Material
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSubjectsManagement;