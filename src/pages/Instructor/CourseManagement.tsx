import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import { 
  Upload, 
  FileText, 
  Video, 
  Image, 
  Download, 
  Trash2, 
  Edit3, 
  Eye,
  Plus,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { apiClient } from '../../lib/api';

interface CourseMaterial {
  _id: string;
  title: string;
  description: string;
  type: 'document' | 'video' | 'image' | 'link';
  fileUrl?: string;
  externalUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  downloadCount: number;
  viewCount: number;
  order: number;
  isActive: boolean;
  createdAt: string;
}

interface Course {
  _id: string;
  name: string;
  description: string;
  enrollments: number;
}

const InstructorCourseManagement: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    type: 'document' as 'document' | 'video' | 'image' | 'link',
    externalUrl: '',
    file: null as File | null
  });

  useEffect(() => {
    if (courseId) {
      fetchCourseDetails();
      fetchMaterials();
    }
  }, [courseId]);

  const fetchCourseDetails = async () => {
    try {
      const response = await apiClient.getCourse(courseId!);
      setCourse(response.data);
    } catch (error: any) {
      console.error('Error fetching course:', error);
      toast.error('Failed to load course details');
      navigate('/instructor/dashboard');
    }
  };

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/materials/course/${courseId}`);
      setMaterials(response.data || []);
    } catch (error: any) {
      console.error('Error fetching materials:', error);
      if (error.response?.status !== 404) {
        toast.error('Failed to load course materials');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!uploadForm.title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    if (uploadForm.type === 'link' || uploadForm.type === 'video') {
      if (!uploadForm.externalUrl.trim()) {
        toast.error(uploadForm.type === 'video' ? 'Please enter a YouTube URL' : 'Please enter a URL');
        return;
      }
    }

    if (uploadForm.type !== 'link' && uploadForm.type !== 'video' && !uploadForm.file) {
      toast.error('Please select a file');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('title', uploadForm.title);
      formData.append('description', uploadForm.description);
      formData.append('type', uploadForm.type);
      
      if (uploadForm.type === 'link' || uploadForm.type === 'video') {
        formData.append('externalUrl', uploadForm.externalUrl);
      } else if (uploadForm.file) {
        formData.append('file', uploadForm.file);
      }

      if (editingMaterial) {
        await apiClient.put(`/materials/${editingMaterial._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Material updated successfully');
      } else {
        await apiClient.post(`/materials/course/${courseId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Material uploaded successfully');
      }

      setShowUploadModal(false);
      setEditingMaterial(null);
      resetUploadForm();
      fetchMaterials();
    } catch (error: any) {
      console.error('Error uploading material:', error);
      toast.error(error.response?.data?.message || 'Failed to upload material');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMaterial = async (materialId: string) => {
    if (!confirm('Are you sure you want to delete this material?')) {
      return;
    }

    try {
      await apiClient.delete(`/materials/${materialId}`);
      toast.success('Material deleted successfully');
      fetchMaterials();
    } catch (error: any) {
      console.error('Error deleting material:', error);
      toast.error('Failed to delete material');
    }
  };

  const handleEditMaterial = (material: CourseMaterial) => {
    setEditingMaterial(material);
    setUploadForm({
      title: material.title,
      description: material.description,
      type: material.type,
      externalUrl: material.externalUrl || '',
      file: null
    });
    setShowUploadModal(true);
  };

  const resetUploadForm = () => {
    setUploadForm({
      title: '',
      description: '',
      type: 'document',
      externalUrl: '',
      file: null
    });
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileIcon = (type: string, mimeType?: string) => {
    if (type === 'video') return <Video className="w-5 h-5 text-red-500" />;
    if (type === 'image') return <Image className="w-5 h-5 text-green-500" />;
    if (type === 'link') return <Eye className="w-5 h-5 text-blue-500" />;
    return <FileText className="w-5 h-5 text-gray-500" />;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course materials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Button
              variant="outline"
              onClick={() => navigate('/instructor/dashboard')}
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Course Materials</h1>
              {course && (
                <div className="mt-2">
                  <h2 className="text-xl text-gray-600">{course.name}</h2>
                  <p className="text-sm text-gray-500">{course.enrollments} students enrolled</p>
                </div>
              )}
            </div>
            
            <Button
              onClick={() => {
                setEditingMaterial(null);
                resetUploadForm();
                setShowUploadModal(true);
              }}
              className="flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Material
            </Button>
          </div>
        </div>

        {/* Materials List */}
        <Card className="p-6">
          {materials.length === 0 ? (
            <div className="text-center py-12">
              <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No materials uploaded yet</h3>
              <p className="text-gray-600 mb-6">
                Start by uploading course materials for your students to access.
              </p>
              <Button
                onClick={() => {
                  setEditingMaterial(null);
                  resetUploadForm();
                  setShowUploadModal(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Upload First Material
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {materials.map((material) => (
                <div
                  key={material._id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {getFileIcon(material.type, material.mimeType)}
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{material.title}</h3>
                        {material.description && (
                          <p className="text-sm text-gray-600 mt-1">{material.description}</p>
                        )}
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>Type: {material.type}</span>
                          {material.fileName && <span>File: {material.fileName}</span>}
                          {material.fileSize && <span>Size: {formatFileSize(material.fileSize)}</span>}
                          <span>Downloads: {material.downloadCount}</span>
                          <span>Views: {material.viewCount}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditMaterial(material)}
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteMaterial(material._id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4">
                {editingMaterial ? 'Edit Material' : 'Upload New Material'}
              </h3>
              
              <form onSubmit={handleFileUpload} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={uploadForm.title || ''}
                    onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter material title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={uploadForm.description || ''}
                    onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Enter material description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type *
                  </label>
                  <select
                    value={uploadForm.type}
                    onChange={(e) => setUploadForm({ ...uploadForm, type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="document">Document</option>
                    <option value="video">Video (YouTube Link)</option>
                    <option value="image">Image</option>
                    <option value="link">External Link</option>
                  </select>
                </div>

                {uploadForm.type === 'link' || uploadForm.type === 'video' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {uploadForm.type === 'video' ? 'YouTube URL *' : 'URL *'}
                    </label>
                    <input
                      type="url"
                      value={uploadForm.externalUrl || ''}
                      onChange={(e) => setUploadForm({ ...uploadForm, externalUrl: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={uploadForm.type === 'video' ? 'https://www.youtube.com/watch?v=...' : 'https://example.com'}
                      required
                    />
                    {uploadForm.type === 'video' && (
                      <p className="text-xs text-gray-500 mt-1">
                        Enter a YouTube video URL
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      File {!editingMaterial && '*'}
                    </label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files?.[0] || null })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      accept={
                        uploadForm.type === 'image' ? 'image/*' :
                        '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt'
                      }
                      required={!editingMaterial}
                    />
                    {editingMaterial && (
                      <p className="text-xs text-gray-500 mt-1">
                        Leave empty to keep current file
                      </p>
                    )}
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowUploadModal(false);
                      setEditingMaterial(null);
                      resetUploadForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={uploading}
                  >
                    {uploading ? 'Uploading...' : editingMaterial ? 'Update' : 'Upload'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructorCourseManagement;