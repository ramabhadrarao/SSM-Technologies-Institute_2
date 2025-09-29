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
  Upload,
  CheckCircle,
  XCircle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Award,
  Building
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../lib/api';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

interface TeamMember {
  _id: string;
  name: string;
  designation: string;
  bio: string;
  imageUrl?: string;
  socialLinks: {
    linkedin?: string;
    twitter?: string;
    email?: string;
  };
  order: number;
  isActive: boolean;
  department?: string;
  experience?: string;
  email?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

interface TeamStats {
  total: number;
  active: number;
  inactive: number;
  departments: number;
}

const TeamManagement: React.FC = () => {
  const { user } = useAuth();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamStats, setTeamStats] = useState<TeamStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [memberFormData, setMemberFormData] = useState({
    name: '',
    designation: '',
    bio: '',
    department: '',
    experience: '',
    email: '',
    phone: '',
    order: 0,
    isActive: true,
    socialLinks: {
      linkedin: '',
      twitter: '',
      email: ''
    }
  });

  useEffect(() => {
    fetchTeamMembers();
  }, [currentPage, searchTerm, statusFilter, departmentFilter]);

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getTeamMembers({
        page: currentPage,
        limit: 10,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(departmentFilter !== 'all' && { department: departmentFilter })
      });
      
      console.log('Team members response:', response);
      
      setTeamMembers(response.teamMembers || []);
      setTotalPages(response.pagination?.totalPages || response.pagination?.pages || 1);
      setTeamStats(response.stats);
    } catch (error: any) {
      console.error('Error fetching team members:', error);
      toast.error('Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading('create');
      
      const formData = new FormData();
      Object.entries(memberFormData).forEach(([key, value]) => {
        if (key === 'socialLinks') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value.toString());
        }
      });

      if (imageFile) {
        formData.append('image', imageFile);
      }

      await apiClient.createTeamMember(formData);

      toast.success('Team member created successfully');
      setShowTeamModal(false);
      resetForm();
      fetchTeamMembers();
    } catch (error: any) {
      console.error('Error creating team member:', error);
      toast.error(error.response?.data?.message || 'Failed to create team member');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    try {
      setActionLoading('update');
      
      const formData = new FormData();
      Object.entries(memberFormData).forEach(([key, value]) => {
        if (key === 'socialLinks') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value.toString());
        }
      });

      if (imageFile) {
        formData.append('image', imageFile);
      }

      await apiClient.updateTeamMember(editingMember._id, formData);

      toast.success('Team member updated successfully');
      setShowTeamModal(false);
      resetForm();
      fetchTeamMembers();
    } catch (error: any) {
      console.error('Error updating team member:', error);
      toast.error(error.response?.data?.message || 'Failed to update team member');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to delete this team member?')) return;

    try {
      setActionLoading(`delete-${memberId}`);
      await apiClient.deleteTeamMember(memberId);
      toast.success('Team member deleted successfully');
      fetchTeamMembers();
    } catch (error: any) {
      console.error('Error deleting team member:', error);
      toast.error('Failed to delete team member');
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedMembers.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedMembers.length} team members?`)) return;

    try {
      setActionLoading('bulk-delete');
      await apiClient.bulkDeleteTeamMembers(selectedMembers);
      toast.success(`${selectedMembers.length} team members deleted successfully`);
      setSelectedMembers([]);
      fetchTeamMembers();
    } catch (error: any) {
      console.error('Error bulk deleting team members:', error);
      toast.error('Failed to delete team members');
    } finally {
      setActionLoading(null);
    }
  };

  const resetForm = () => {
    setMemberFormData({
      name: '',
      designation: '',
      bio: '',
      department: '',
      experience: '',
      email: '',
      phone: '',
      order: 0,
      isActive: true,
      socialLinks: {
        linkedin: '',
        twitter: '',
        email: ''
      }
    });
    setImageFile(null);
    setImagePreview(null);
    setEditingMember(null);
  };

  const handleEditMember = (member: TeamMember) => {
    setEditingMember(member);
    setMemberFormData({
      name: member.name,
      designation: member.designation,
      bio: member.bio,
      department: member.department || '',
      experience: member.experience || '',
      email: member.email || '',
      phone: member.phone || '',
      order: member.order,
      isActive: member.isActive,
      socialLinks: {
        linkedin: member.socialLinks?.linkedin || '',
        twitter: member.socialLinks?.twitter || '',
        email: member.socialLinks?.email || ''
      }
    });
    setImagePreview(member.imageUrl || null);
    setShowTeamModal(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectMember = (memberId: string) => {
    setSelectedMembers(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSelectAll = () => {
    if (selectedMembers.length === teamMembers.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(teamMembers.map(member => member._id));
    }
  };

  if (loading && currentPage === 1) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading team members...</p>
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
                <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
                <p className="text-gray-600">Manage leadership team members and their profiles</p>
              </div>
            </div>
            <Button
              onClick={() => {
                resetForm();
                setShowTeamModal(true);
              }}
              className="flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Team Member
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {teamStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Members</p>
                  <p className="text-3xl font-bold text-gray-900">{teamStats.total}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Members</p>
                  <p className="text-3xl font-bold text-green-600">{teamStats.active}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Inactive Members</p>
                  <p className="text-3xl font-bold text-red-600">{teamStats.inactive}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Departments</p>
                  <p className="text-3xl font-bold text-purple-600">{teamStats.departments}</p>
                </div>
                <Building className="w-8 h-8 text-purple-500" />
              </div>
            </Card>
          </div>
        )}

        {/* Filters and Search */}
        <Card className="p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search team members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Departments</option>
                <option value="Leadership">Leadership</option>
                <option value="Academic">Academic</option>
                <option value="Administration">Administration</option>
                <option value="Technology">Technology</option>
                <option value="Marketing">Marketing</option>
              </select>
            </div>
          </div>
          
          {selectedMembers.length > 0 && (
            <div className="mt-4 flex items-center justify-between bg-blue-50 p-4 rounded-lg">
              <span className="text-blue-700">
                {selectedMembers.length} member(s) selected
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkDelete}
                loading={actionLoading === 'bulk-delete'}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Selected
              </Button>
            </div>
          )}
        </Card>

        {/* Team Members Table */}
        <Card>
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
                          checked={selectedMembers.length === teamMembers.length && teamMembers.length > 0}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Member
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Designation
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Department
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {teamMembers.map((member) => (
                      <tr key={member._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedMembers.includes(member._id)}
                            onChange={() => handleSelectMember(member._id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12">
                              {member.imageUrl ? (
                                <img
                                  className="h-12 w-12 rounded-full object-cover"
                                  src={member.imageUrl}
                                  alt={member.name}
                                />
                              ) : (
                                <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                                  <Users className="h-6 w-6 text-gray-600" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{member.name}</div>
                              <div className="text-sm text-gray-500">{member.experience}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{member.designation}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{member.department || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {member.email && (
                              <div className="flex items-center">
                                <Mail className="w-4 h-4 mr-1 text-gray-400" />
                                {member.email}
                              </div>
                            )}
                            {member.phone && (
                              <div className="flex items-center mt-1">
                                <Phone className="w-4 h-4 mr-1 text-gray-400" />
                                {member.phone}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            member.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {member.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {member.order}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditMember(member)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteMember(member._id)}
                              loading={actionLoading === `delete-${member._id}`}
                              className="text-red-600 border-red-300 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
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
                        Showing page <span className="font-medium">{currentPage}</span> of{' '}
                        <span className="font-medium">{totalPages}</span>
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

      {/* Team Member Form Modal */}
      {showTeamModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl my-8 flex flex-col max-h-[90vh]">
            {/* Fixed Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
              <h3 className="text-lg font-medium text-gray-900">
                {editingMember ? 'Edit Team Member' : 'Add New Team Member'}
              </h3>
            </div>
            
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              <form onSubmit={editingMember ? handleUpdateMember : handleCreateMember} className="p-6 space-y-6">
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profile Image
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {imagePreview ? (
                        <img
                          className="h-20 w-20 rounded-full object-cover"
                          src={imagePreview}
                          alt="Preview"
                        />
                      ) : (
                        <div className="h-20 w-20 rounded-full bg-gray-300 flex items-center justify-center">
                          <Users className="h-8 w-8 text-gray-600" />
                        </div>
                      )}
                    </div>
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Image
                      </label>
                    </div>
                  </div>
                </div>

                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={memberFormData.name}
                      onChange={(e) => setMemberFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Designation *
                    </label>
                    <input
                      type="text"
                      required
                      value={memberFormData.designation}
                      onChange={(e) => setMemberFormData(prev => ({ ...prev, designation: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department
                    </label>
                    <select
                      value={memberFormData.department}
                      onChange={(e) => setMemberFormData(prev => ({ ...prev, department: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Department</option>
                      <option value="Leadership">Leadership</option>
                      <option value="Academic">Academic</option>
                      <option value="Administration">Administration</option>
                      <option value="Technology">Technology</option>
                      <option value="Marketing">Marketing</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Experience
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., 10+ years in IT"
                      value={memberFormData.experience}
                      onChange={(e) => setMemberFormData(prev => ({ ...prev, experience: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={memberFormData.email}
                      onChange={(e) => setMemberFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={memberFormData.phone}
                      onChange={(e) => setMemberFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bio *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={memberFormData.bio}
                    onChange={(e) => setMemberFormData(prev => ({ ...prev, bio: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Brief description about the team member..."
                  />
                </div>

                {/* Social Links */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Social Links
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">LinkedIn</label>
                      <input
                        type="url"
                        placeholder="https://linkedin.com/in/..."
                        value={memberFormData.socialLinks.linkedin}
                        onChange={(e) => setMemberFormData(prev => ({
                          ...prev,
                          socialLinks: { ...prev.socialLinks, linkedin: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Twitter</label>
                      <input
                        type="url"
                        placeholder="https://twitter.com/..."
                        value={memberFormData.socialLinks.twitter}
                        onChange={(e) => setMemberFormData(prev => ({
                          ...prev,
                          socialLinks: { ...prev.socialLinks, twitter: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Email</label>
                      <input
                        type="email"
                        placeholder="contact@example.com"
                        value={memberFormData.socialLinks.email}
                        onChange={(e) => setMemberFormData(prev => ({
                          ...prev,
                          socialLinks: { ...prev.socialLinks, email: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Order and Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Display Order
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={memberFormData.order}
                      onChange={(e) => setMemberFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={memberFormData.isActive ? 'active' : 'inactive'}
                      onChange={(e) => setMemberFormData(prev => ({ ...prev, isActive: e.target.value === 'active' }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </form>
            </div>

            {/* Fixed Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3 flex-shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowTeamModal(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                onClick={editingMember ? handleUpdateMember : handleCreateMember}
                loading={actionLoading === 'create' || actionLoading === 'update'}
              >
                {editingMember ? 'Update Member' : 'Create Member'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManagement;