import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Video, 
  Image, 
  Download, 
  Eye,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import Card from '../UI/Card';
import Button from '../UI/Button';
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

interface MaterialsTabProps {
  courseId: string;
}

const MaterialsTab: React.FC<MaterialsTabProps> = ({ courseId }) => {
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    fetchMaterials();
  }, [courseId]);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/materials/course/${courseId}`);
      setMaterials(response.data.materials || []);
    } catch (error: any) {
      console.error('Error fetching materials:', error);
      if (error.response?.status !== 404) {
        toast.error('Failed to load course materials');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (materialId: string, fileName?: string) => {
    try {
      setDownloading(materialId);
      const response = await apiClient.get(`/materials/${materialId}/download`, {
        responseType: 'blob'
      });
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName || 'material');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Download started');
    } catch (error: any) {
      console.error('Error downloading material:', error);
      toast.error('Failed to download material');
    } finally {
      setDownloading(null);
    }
  };

  const handleView = async (materialId: string, url?: string, externalUrl?: string) => {
    try {
      // Increment view count
      await apiClient.post(`/materials/${materialId}/view`);
      
      // Open the material
      if (externalUrl) {
        window.open(externalUrl, '_blank');
      } else if (url) {
        window.open(url, '_blank');
      }
    } catch (error: any) {
      console.error('Error viewing material:', error);
      toast.error('Failed to open material');
    }
  };

  const getFileIcon = (type: string, mimeType?: string) => {
    if (type === 'video') return <Video className="w-6 h-6 text-red-500" />;
    if (type === 'image') return <Image className="w-6 h-6 text-green-500" />;
    if (type === 'link') return <ExternalLink className="w-6 h-6 text-blue-500" />;
    return <FileText className="w-6 h-6 text-gray-500" />;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading materials...</span>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Materials</h2>
      
      {materials.length === 0 ? (
        <Card className="p-8 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Materials Available</h3>
          <p className="text-gray-600">
            Your instructor hasn't uploaded any materials yet. Check back later!
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {materials
            .filter(material => material.isActive)
            .sort((a, b) => a.order - b.order)
            .map((material) => (
              <Card key={material._id} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    {getFileIcon(material.type, material.mimeType)}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {material.title}
                      </h3>
                      {material.description && (
                        <p className="text-gray-600 mb-3">{material.description}</p>
                      )}
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="capitalize">{material.type}</span>
                        {material.fileName && <span>{material.fileName}</span>}
                        {material.fileSize && <span>{formatFileSize(material.fileSize)}</span>}
                        <span>{material.downloadCount} downloads</span>
                        <span>{material.viewCount} views</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {material.type === 'link' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleView(material._id, undefined, material.externalUrl)}
                        className="flex items-center"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open Link
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleView(material._id, material.fileUrl)}
                          className="flex items-center"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(material._id, material.fileName)}
                          disabled={downloading === material._id}
                          className="flex items-center"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          {downloading === material._id ? 'Downloading...' : 'Download'}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ))}
        </div>
      )}
      
      {materials.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Course Materials Access</p>
              <p>
                These materials are exclusively available to enrolled students. 
                You can download and view them as many times as needed for your learning.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialsTab;