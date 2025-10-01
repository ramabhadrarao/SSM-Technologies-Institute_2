// src/pages/SubjectDetails.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  BookOpen, 
  Clock, 
  PlayCircle, 
  FileText, 
  Download,
  ExternalLink,
  List,
  Calendar,
  User,
  ChevronRight,
  Image as ImageIcon,
  AlertCircle
} from 'lucide-react';
import { apiClient } from '../lib/api';
import { Subject } from '../types';
import Card from '../components/UI/Card';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { toast } from 'react-hot-toast';

const SubjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    console.log('SubjectDetails useEffect triggered with id:', id);
    if (id) {
      fetchSubjectDetails(id);
    }
  }, [id]);

  const fetchSubjectDetails = async (subjectId: string) => {
    try {
      console.log('Fetching subject details for ID:', subjectId);
      setLoading(true);
      const response = await apiClient.getSubject(subjectId);
      console.log('API response:', response);
      if (response.success) {
        console.log('Subject data received:', response.data);
        setSubject(response.data);
      } else {
        console.error('API returned success: false', response);
        toast.error('Failed to load subject details');
        navigate('/subjects');
      }
    } catch (error) {
      console.error('Error fetching subject details:', error);
      toast.error('Failed to load subject details');
      navigate('/subjects');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <PlayCircle className="w-5 h-5 text-red-500" />;
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-600" />;
      case 'link':
        return <ExternalLink className="w-5 h-5 text-blue-500" />;
      case 'document':
        return <FileText className="w-5 h-5 text-green-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const handleMaterialClick = (material: any) => {
    if (material.type === 'link') {
      window.open(material.url, '_blank');
    } else {
      // For files, trigger download
      const link = document.createElement('a');
      link.href = material.url;
      link.download = material.title;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading subject details...</p>
        </div>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Subject Not Found</h2>
          <p className="text-gray-600 mb-6">The subject you're looking for doesn't exist or has been removed.</p>
          <Link
            to="/subjects"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Subjects
          </Link>
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
                to="/subjects"
                className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Subjects
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{subject.name}</h1>
                {subject.course && (
                  <p className="text-lg text-gray-600 mt-1">
                    Part of <span className="font-medium text-blue-600">{subject.course.name}</span> course
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Subject Image and Description */}
            <Card className="p-6">
              <div className="space-y-6">
                {/* Subject Image */}
                {subject.imageUrl && !imageError ? (
                  <div className="relative">
                    <img
                      src={subject.imageUrl}
                      alt={subject.name}
                      className="w-full h-64 object-cover rounded-lg shadow-md"
                      onError={() => setImageError(true)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg" />
                  </div>
                ) : (
                  <div className="w-full h-64 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <ImageIcon className="w-16 h-16 text-blue-400 mx-auto mb-2" />
                      <p className="text-blue-600 font-medium">{subject.name}</p>
                    </div>
                  </div>
                )}

                {/* Description */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Subject</h2>
                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-700 leading-relaxed text-lg">
                      {subject.description}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Syllabus */}
            {subject.syllabus && subject.syllabus.length > 0 && (
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <List className="w-6 h-6 text-blue-600" />
                  <h2 className="text-2xl font-bold text-gray-900">Course Syllabus</h2>
                  <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                    {subject.syllabus.length} topics
                  </span>
                </div>
                <div className="space-y-4">
                  {subject.syllabus.map((item, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="bg-blue-600 text-white text-sm font-bold px-2.5 py-1 rounded-full min-w-[2rem] text-center">
                              {index + 1}
                            </span>
                            <h3 className="text-lg font-semibold text-gray-900">{item.topic}</h3>
                          </div>
                          {item.description && (
                            <p className="text-gray-600 ml-11 mb-2">{item.description}</p>
                          )}
                          {item.duration && (
                            <div className="flex items-center gap-2 ml-11">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-500">{item.duration}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Learning Materials */}
            {subject.materials && subject.materials.length > 0 && (
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Download className="w-6 h-6 text-green-600" />
                  <h2 className="text-2xl font-bold text-gray-900">Learning Materials</h2>
                  <span className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                    {subject.materials.length} files
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {subject.materials.map((material, index) => (
                    <div
                      key={material._id || index}
                      onClick={() => handleMaterialClick(material)}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
                    >
                      <div className="flex items-start gap-3">
                        {getFileIcon(material.type)}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                            {material.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500 capitalize bg-gray-100 px-2 py-1 rounded">
                              {material.type}
                            </span>
                            {material.uploadedAt && (
                              <span className="text-xs text-gray-400">
                                {formatDate(material.uploadedAt)}
                              </span>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Subject Info */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Subject Information</h3>
              <div className="space-y-4">
                {subject.course && (
                  <div className="flex items-start gap-3">
                    <BookOpen className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Course</p>
                      <p className="font-medium text-gray-900">{subject.course.name}</p>
                      {subject.course.description && (
                        <p className="text-sm text-gray-600 mt-1">{subject.course.description}</p>
                      )}
                    </div>
                  </div>
                )}

                {subject.syllabus && subject.syllabus.length > 0 && (
                  <div className="flex items-start gap-3">
                    <List className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Topics Covered</p>
                      <p className="font-medium text-gray-900">{subject.syllabus.length} topics</p>
                    </div>
                  </div>
                )}

                {subject.materials && subject.materials.length > 0 && (
                  <div className="flex items-start gap-3">
                    <Download className="w-5 h-5 text-purple-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Learning Materials</p>
                      <p className="font-medium text-gray-900">{subject.materials.length} files</p>
                    </div>
                  </div>
                )}

                {subject.createdAt && (
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-gray-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Added</p>
                      <p className="font-medium text-gray-900">{formatDate(subject.createdAt)}</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Course Details (if available) */}
            {subject.course && (subject.course.fees || subject.course.duration) && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Details</h3>
                <div className="space-y-3">
                  {subject.course.fees && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Course Fee</span>
                      <span className="font-semibold text-green-600">₹{subject.course.fees.toLocaleString()}</span>
                    </div>
                  )}
                  {subject.course.duration && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Duration</span>
                      <span className="font-semibold text-gray-900">{subject.course.duration}</span>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  to="/subjects"
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <List className="w-4 h-4 mr-2" />
                  Browse All Subjects
                </Link>
                {subject.course && (
                  <Link
                    to="/courses"
                    className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    View All Courses
                  </Link>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubjectDetails;