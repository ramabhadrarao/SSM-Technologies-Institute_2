import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Video, 
  Image, 
  Link as LinkIcon,
  Download,
  Eye,
  ExternalLink,
  Lock,
  Loader
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { apiClient } from '../../lib/api';
import Card from '../UI/Card';
import Button from '../UI/Button';

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
  instructor?: {
    user?: {
      firstName?: string;
      lastName?: string;
    };
  };
}

interface MaterialsTabProps {
  courseId: string;
}

const MaterialsTab: React.FC<MaterialsTabProps> = ({ courseId }) => {
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [groupedMaterials, setGroupedMaterials] = useState<{
    documents: CourseMaterial[];
    videos: CourseMaterial[];
    images: CourseMaterial[];
    links: CourseMaterial[];
  }>({
    documents: [],
    videos: [],
    images: [],
    links: []
  });

  useEffect(() => {
    if (courseId) {
      fetchMaterials();
    }
  }, [courseId]);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getCourseMaterials(courseId);
      const materialsData = Array.isArray(response) ? response : (response.data || []);
      
      // Sort materials by order and then by creation date
      const sortedMaterials = materialsData.sort((a: CourseMaterial, b: CourseMaterial) => {
        if (a.order !== b.order) {
          return a.order - b.order;
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      setMaterials(sortedMaterials);
      
      // Group materials by type
      const grouped = {
        documents: sortedMaterials.filter((m: CourseMaterial) => m.type === 'document'),
        videos: sortedMaterials.filter((m: CourseMaterial) => m.type === 'video'),
        images: sortedMaterials.filter((m: CourseMaterial) => m.type === 'image'),
        links: sortedMaterials.filter((m: CourseMaterial) => m.type === 'link')
      };
      
      setGroupedMaterials(grouped);
    } catch (error: any) {
      console.error('Error fetching materials:', error);
      if (error.message?.includes('403')) {
        toast.error('You need to be enrolled to access course materials');
      } else if (!error.message?.includes('404')) {
        toast.error('Failed to load course materials');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleViewMaterial = async (material: CourseMaterial) => {
    try {
      setDownloading(material._id);
      const response = await apiClient.downloadCourseMaterial(material._id);
      
      if (response) {
        if (response.type === 'link' || response.type === 'video') {
          window.open(response.url, '_blank');
        } else if (response.type === 'file' && response.url) {
          // For files, open in a new tab or trigger download
          window.open(response.url, '_blank');
        }
      }
      
      // Refresh to update view/download counts
      setTimeout(() => fetchMaterials(), 1000);
    } catch (error) {
      console.error('Error viewing material:', error);
      toast.error('Failed to open material');
    } finally {
      setDownloading(null);
    }
  };

  const getFileIcon = (type: string) => {
    switch(type) {
      case 'video':
        return <Video className="w-5 h-5 text-red-500" />;
      case 'image':
        return <Image className="w-5 h-5 text-green-500" />;
      case 'link':
        return <LinkIcon className="w-5 h-5 text-blue-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const MaterialCard = ({ material }: { material: CourseMaterial }) => (
    <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleViewMaterial(material)}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-1">
          {getFileIcon(material.type)}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900 truncate">{material.title}</h4>
          {material.description && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{material.description}</p>
          )}
          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
            {material.fileName && (
              <span className="truncate" title={material.fileName}>
                {material.fileName}
              </span>
            )}
            {material.fileSize && (
              <span>{formatFileSize(material.fileSize)}</span>
            )}
            {material.type === 'video' && material.externalUrl && (
              <span className="flex items-center">
                YouTube <ExternalLink className="w-3 h-3 ml-1" />
              </span>
            )}
            {material.type === 'link' && (
              <span className="flex items-center">
                External <ExternalLink className="w-3 h-3 ml-1" />
              </span>
            )}
          </div>
          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
            <span>Added: {formatDate(material.createdAt)}</span>
            {material.downloadCount > 0 && (
              <span className="flex items-center">
                <Download className="w-3 h-3 mr-1" />
                {material.downloadCount}
              </span>
            )}
            {material.viewCount > 0 && (
              <span className="flex items-center">
                <Eye className="w-3 h-3 mr-1" />
                {material.viewCount}
              </span>
            )}
          </div>
        </div>
        <div className="flex-shrink-0">
          {downloading === material._id ? (
            <Loader className="w-5 h-5 text-blue-600 animate-spin" />
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                handleViewMaterial(material);
              }}
            >
              {material.type === 'link' || material.type === 'video' ? (
                <Eye className="w-4 h-4" />
              ) : (
                <Download className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Loading course materials...</p>
      </div>
    );
  }

  if (materials.length === 0) {
    return (
      <Card className="p-12 text-center">
        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Materials Available Yet</h3>
        <p className="text-gray-600">
          Course materials will be available here once your instructor uploads them.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Materials</h2>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <Lock className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-blue-800 font-medium">
                Exclusive Content for Enrolled Students
              </p>
              <p className="text-sm text-blue-700 mt-1">
                These materials are only accessible because you're enrolled in this course. 
                Downloads are tracked for copyright protection.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* All Materials View */}
      {materials.length <= 6 ? (
        <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
          {materials.map((material) => (
            <MaterialCard key={material._id} material={material} />
          ))}
        </div>
      ) : (
        /* Grouped View for Many Materials */
        <div className="space-y-8">
          {/* Documents Section */}
          {groupedMaterials.documents.length > 0 && (
            <div>
              <div className="flex items-center mb-4">
                <FileText className="w-5 h-5 text-gray-500 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Documents ({groupedMaterials.documents.length})
                </h3>
              </div>
              <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
                {groupedMaterials.documents.map((material) => (
                  <MaterialCard key={material._id} material={material} />
                ))}
              </div>
            </div>
          )}

          {/* Videos Section */}
          {groupedMaterials.videos.length > 0 && (
            <div>
              <div className="flex items-center mb-4">
                <Video className="w-5 h-5 text-red-500 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Videos ({groupedMaterials.videos.length})
                </h3>
              </div>
              <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
                {groupedMaterials.videos.map((material) => (
                  <MaterialCard key={material._id} material={material} />
                ))}
              </div>
            </div>
          )}

          {/* Images Section */}
          {groupedMaterials.images.length > 0 && (
            <div>
              <div className="flex items-center mb-4">
                <Image className="w-5 h-5 text-green-500 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Images ({groupedMaterials.images.length})
                </h3>
              </div>
              <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                {groupedMaterials.images.map((material) => (
                  <MaterialCard key={material._id} material={material} />
                ))}
              </div>
            </div>
          )}

          {/* External Links Section */}
          {groupedMaterials.links.length > 0 && (
            <div>
              <div className="flex items-center mb-4">
                <LinkIcon className="w-5 h-5 text-blue-500 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">
                  External Resources ({groupedMaterials.links.length})
                </h3>
              </div>
              <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
                {groupedMaterials.links.map((material) => (
                  <MaterialCard key={material._id} material={material} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Summary Stats */}
      <Card className="p-6 bg-gray-50">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Material Summary</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{materials.length}</div>
            <div className="text-xs text-gray-600">Total Materials</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{groupedMaterials.documents.length}</div>
            <div className="text-xs text-gray-600">Documents</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{groupedMaterials.videos.length}</div>
            <div className="text-xs text-gray-600">Videos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{groupedMaterials.links.length}</div>
            <div className="text-xs text-gray-600">Resources</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MaterialsTab;