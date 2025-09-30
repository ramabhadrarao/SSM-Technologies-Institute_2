import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Upload, 
  Eye, 
  EyeOff, 
  Star, 
  StarOff,
  GripVertical,
  Image as ImageIcon,
  Save,
  X
} from 'lucide-react';
import { apiClient } from '../../lib/api';

interface Slider {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  buttonText: string;
  buttonLink: string;
  order: number;
  isActive: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

const SlidersManagement: React.FC = () => {
  const [sliders, setSliders] = useState<Slider[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSlider, setEditingSlider] = useState<Slider | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    buttonText: 'Learn More',
    buttonLink: '#',
    order: 0,
    isActive: true,
    isDefault: false
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSliders();
  }, []);

  const fetchSliders = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/sliders');
      setSliders(response);
    } catch (error) {
      console.error('Error fetching sliders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      buttonText: 'Learn More',
      buttonLink: '#',
      order: sliders.length,
      isActive: true,
      isDefault: false
    });
    setSelectedFile(null);
    setPreviewUrl('');
    setEditingSlider(null);
    setShowForm(false);
  };

  const handleEdit = (slider: Slider) => {
    setEditingSlider(slider);
    setFormData({
      title: slider.title,
      description: slider.description,
      buttonText: slider.buttonText,
      buttonLink: slider.buttonLink,
      order: slider.order,
      isActive: slider.isActive,
      isDefault: slider.isDefault
    });
    setPreviewUrl(slider.imageUrl ? `http://localhost:3001${slider.imageUrl}` : '');
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('buttonText', formData.buttonText);
      formDataToSend.append('buttonLink', formData.buttonLink);
      formDataToSend.append('order', formData.order.toString());
      formDataToSend.append('isActive', formData.isActive.toString());
      formDataToSend.append('isDefault', formData.isDefault.toString());

      if (selectedFile) {
        formDataToSend.append('image', selectedFile);
      }

      if (editingSlider) {
        await apiClient.put(`/sliders/${editingSlider._id}`, formDataToSend);
      } else {
        await apiClient.post('/sliders', formDataToSend);
      }

      await fetchSliders();
      resetForm();
    } catch (error) {
      console.error('Error saving slider:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this slider?')) {
      try {
        await apiClient.delete(`/sliders/${id}`);
        await fetchSliders();
      } catch (error) {
        console.error('Error deleting slider:', error);
      }
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const formData = new FormData();
      formData.append('isActive', (!isActive).toString());
      
      await apiClient.put(`/sliders/${id}`, formData);
      await fetchSliders();
    } catch (error) {
      console.error('Error toggling slider status:', error);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await apiClient.patch(`/sliders/${id}/default`);
      await fetchSliders();
    } catch (error) {
      console.error('Error setting default slider:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Slider Management</h1>
              <p className="text-gray-600">Manage hero slider images and content</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Slider
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Slider Form Modal */}
          {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {editingSlider ? 'Edit Slider' : 'Add New Slider'}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slider Image *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 relative">
                  {previewUrl ? (
                    <div className="relative">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);
                          setPreviewUrl('');
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Click to upload image</p>
                      <p className="text-xs text-gray-400">Recommended: 1920x500px, Max: 5MB</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Button Text and Link */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Button Text
                  </label>
                  <input
                    type="text"
                    value={formData.buttonText}
                    onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Button Link
                  </label>
                  <input
                    type="text"
                    value={formData.buttonLink}
                    onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Checkboxes */}
              <div className="flex space-x-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="mr-2"
                  />
                  Active
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                    className="mr-2"
                  />
                  Set as Default
                </label>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !formData.title || !formData.description || (!selectedFile && !editingSlider)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
                >
                  {submitting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {editingSlider ? 'Update' : 'Create'} Slider
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

          {/* Sliders List */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Current Sliders ({sliders.length})</h2>
              
              {sliders.length === 0 ? (
                <div className="text-center py-8">
                  <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No sliders found. Create your first slider!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sliders.map((slider) => (
                <div
                  key={slider._id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start space-x-4">
                    {/* Drag Handle */}
                    <div className="flex-shrink-0 mt-2">
                      <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
                    </div>

                    {/* Image Preview */}
                    <div className="flex-shrink-0">
                      {slider.imageUrl ? (
                        <img
                          src={`http://localhost:3001${slider.imageUrl}`}
                          alt={slider.title}
                          className="w-24 h-16 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-24 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 truncate">
                            {slider.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {slider.description}
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span>Order: {slider.order}</span>
                            <span>Button: {slider.buttonText}</span>
                            <span>Link: {slider.buttonLink}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2">
                          {/* Default Badge */}
                          {slider.isDefault && (
                            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                              Default
                            </span>
                          )}

                          {/* Status Badge */}
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            slider.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {slider.isActive ? 'Active' : 'Inactive'}
                          </span>

                          {/* Action Buttons */}
                          <button
                            onClick={() => handleToggleActive(slider._id, slider.isActive)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                            title={slider.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {slider.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>

                          <button
                            onClick={() => handleSetDefault(slider._id)}
                            className={`p-1 ${slider.isDefault ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`}
                            title="Set as Default"
                          >
                            {slider.isDefault ? <Star className="w-4 h-4 fill-current" /> : <StarOff className="w-4 h-4" />}
                          </button>

                          <button
                            onClick={() => handleEdit(slider)}
                            className="p-1 text-gray-400 hover:text-blue-600"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDelete(slider._id)}
                            className="p-1 text-gray-400 hover:text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                   ))}
                 </div>
               )}
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SlidersManagement;