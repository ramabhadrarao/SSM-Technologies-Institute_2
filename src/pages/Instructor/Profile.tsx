// src/pages/Instructor/Profile.tsx - Clean Fixed Version
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  User, Camera, Upload, Plus, Trash2, Save, ArrowLeft,
  GraduationCap, Award, Briefcase, Link as LinkIcon,
  CheckSquare, Square, Search, Mail, Phone, Code
} from 'lucide-react';
import { apiClient } from '../../lib/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

interface Skill {
  _id: string;
  name: string;
  description?: string;
  category: string;
  level: string;
}

interface Education {
  degree: string;
  institution: string;
  year: number;
  grade: string;
}

interface Certificate {
  name: string;
  url: string;
  issuedBy: string;
  issuedDate: string;
}

interface SocialLinks {
  linkedin: string;
  github: string;
  website: string;
  twitter: string;
}

const InstructorProfile: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Profile state
  const [profileData, setProfileData] = useState<any>(null);
  const [bio, setBio] = useState('');
  const [designation, setDesignation] = useState('');
  const [experience, setExperience] = useState(0);
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({
    linkedin: '',
    github: '',
    website: '',
    twitter: ''
  });
  
  // Skills
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);
  const [skillSearchQuery, setSkillSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showSkillSelector, setShowSkillSelector] = useState(false);
  
  // Files
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [certificateFiles, setCertificateFiles] = useState<{ [key: number]: File }>({});
  const [newSpecialization, setNewSpecialization] = useState('');
  
  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'programming', label: 'Programming' },
    { value: 'design', label: 'Design' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'business', label: 'Business' },
    { value: 'data-science', label: 'Data Science' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    fetchProfile();
    fetchAvailableSkills();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const profile = await apiClient.getProfile();
      setProfileData(profile);
      
      if (profile.instructorProfile) {
        setBio(profile.instructorProfile.bio || '');
        setDesignation(profile.instructorProfile.designation || '');
        setExperience(profile.instructorProfile.experience || 0);
        setSpecializations(profile.instructorProfile.specializations || []);
        setEducation(profile.instructorProfile.education || []);
        setCertificates(profile.instructorProfile.certificates || []);
        setSocialLinks(profile.instructorProfile.socialLinks || {
          linkedin: '', github: '', website: '', twitter: ''
        });
        
        if (profile.instructorProfile.imageUrl) {
          setProfileImagePreview(profile.instructorProfile.imageUrl);
        }
        
        if (profile.instructorProfile.skills && Array.isArray(profile.instructorProfile.skills)) {
          const skillIds = profile.instructorProfile.skills.map((skill: any) => 
            typeof skill === 'string' ? skill : skill._id
          );
          setSelectedSkillIds(skillIds);
        }
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSkills = async () => {
    try {
      const response = await apiClient.getSkills();
      setAvailableSkills(response || []);
    } catch (error) {
      console.error('Error fetching skills:', error);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      setProfileImage(file);
      setProfileImagePreview(URL.createObjectURL(file));
    }
  };

  const handleResumeUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Resume size should be less than 10MB');
        return;
      }
      setResumeFile(file);
      toast.success('Resume selected');
    }
  };

  const handleCertificateUpload = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Certificate size should be less than 5MB');
        return;
      }
      setCertificateFiles(prev => ({ ...prev, [index]: file }));
      toast.success('Certificate file selected');
    }
  };

  const handleSkillToggle = (skillId: string) => {
    setSelectedSkillIds(prev => 
      prev.includes(skillId) ? prev.filter(id => id !== skillId) : [...prev, skillId]
    );
  };

  const addSpecialization = () => {
    if (newSpecialization.trim() && !specializations.includes(newSpecialization.trim())) {
      setSpecializations([...specializations, newSpecialization.trim()]);
      setNewSpecialization('');
    }
  };

  const removeSpecialization = (index: number) => {
    setSpecializations(specializations.filter((_, i) => i !== index));
  };

  const addEducation = () => {
    setEducation([...education, { 
      degree: '', institution: '', year: new Date().getFullYear(), grade: '' 
    }]);
  };

  const updateEducation = (index: number, field: keyof Education, value: string | number) => {
    const updated = [...education];
    updated[index] = { ...updated[index], [field]: value };
    setEducation(updated);
  };

  const removeEducation = (index: number) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  const addCertificate = () => {
    setCertificates([...certificates, { 
      name: '', url: '', issuedBy: '', 
      issuedDate: new Date().toISOString().split('T')[0]
    }]);
  };

  const updateCertificate = (index: number, field: keyof Certificate, value: string) => {
    const updated = [...certificates];
    updated[index] = { ...updated[index], [field]: value };
    setCertificates(updated);
  };

  const removeCertificate = (index: number) => {
    setCertificates(certificates.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
  if (!bio || bio.length < 50) {
    toast.error('Bio must be at least 50 characters');
    return;
  }
  if (!designation) {
    toast.error('Please enter your designation');
    return;
  }
  if (selectedSkillIds.length === 0) {
    toast.error('Please select at least one skill');
    return;
  }

  try {
    setSaving(true);

    // Prepare certificate files array
    const certificateFilesArray: File[] = [];
    certificates.forEach((cert, index) => {
      if (certificateFiles[index]) {
        certificateFilesArray[index] = certificateFiles[index];
      }
    });

    // Prepare the profile data
    const profileData = {
      bio,
      designation,
      experience,
      specializations,
      education,
      certificates,
      socialLinks,
      skills: selectedSkillIds
    };

    // Prepare files object
    const files: any = {};
    if (profileImage) {
      files.profileImage = profileImage;
    }
    if (resumeFile) {
      files.resume = resumeFile;
    }
    if (certificateFilesArray.length > 0) {
      files.certificates = certificateFilesArray;
    }

    // Update profile with files
    await apiClient.updateInstructorProfile(profileData, files);
    
    toast.success('Profile updated successfully!');
    
    // Clear file states after successful upload
    setProfileImage(null);
    setResumeFile(null);
    setCertificateFiles({});
    
    // Refresh profile data
    await fetchProfile();
    
    // Navigate to dashboard after a short delay
    setTimeout(() => {
      navigate('/instructor/dashboard');
    }, 1000);
  } catch (error: any) {
    console.error('Error updating profile:', error);
    toast.error(error.message || 'Failed to update profile');
  } finally {
    setSaving(false);
  }
};

  const filteredSkills = availableSkills.filter(skill => {
    const matchesSearch = skill.name.toLowerCase().includes(skillSearchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || skill.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getSelectedSkills = () => {
    return availableSkills.filter(skill => selectedSkillIds.includes(skill._id));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/instructor/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Update Profile</h1>
          <p className="text-gray-600 mt-2">
            {profileData?.instructorProfile?.isApproved 
              ? 'Keep your instructor profile up to date'
              : 'Complete your profile to get approved by admin'}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          {/* Profile Image */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Camera className="w-5 h-5 mr-2" />
              Profile Photo
            </h2>
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {profileImagePreview ? (
                  <img src={profileImagePreview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-gray-400" />
                )}
              </div>
              <div>
                <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Photo
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
                <p className="text-sm text-gray-500 mt-2">JPG, PNG up to 5MB</p>
              </div>
            </div>
          </div>

          {/* Basic Info (Read-only) */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                <div className="flex items-center px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                  <User className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">{profileData?.user?.firstName}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                <div className="flex items-center px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                  <User className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">{profileData?.user?.lastName}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <div className="flex items-center px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                  <Mail className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">{profileData?.user?.email}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <div className="flex items-center px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                  <Phone className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">{profileData?.user?.phone}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Professional Info */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Briefcase className="w-5 h-5 mr-2" />
              Professional Information
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tell us about yourself... (minimum 50 characters)"
                />
                <p className="text-sm text-gray-500 mt-1">{bio.length}/50 characters minimum</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Designation <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Senior Software Engineer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience (Years) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={experience}
                    onChange={(e) => setExperience(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Code className="w-5 h-5 mr-2" />
                Skills & Expertise <span className="text-red-500 ml-1">*</span>
              </h2>
              <button
                onClick={() => setShowSkillSelector(!showSkillSelector)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                {showSkillSelector ? 'Close' : 'Add Skills'}
              </button>
            </div>

            {selectedSkillIds.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-3">Selected Skills ({selectedSkillIds.length})</p>
                <div className="flex flex-wrap gap-2">
                  {getSelectedSkills().map((skill) => (
                    <span
                      key={skill._id}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                    >
                      {skill.name}
                      <button
                        onClick={() => handleSkillToggle(skill._id)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {showSkillSelector && (
              <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search skills..."
                      value={skillSearchQuery}
                      onChange={(e) => setSkillSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div className="max-h-64 overflow-y-auto space-y-2">
                  {filteredSkills.map((skill) => {
                    const isSelected = selectedSkillIds.includes(skill._id);
                    return (
                      <div
                        key={skill._id}
                        onClick={() => handleSkillToggle(skill._id)}
                        className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                          isSelected 
                            ? 'bg-blue-100 border-2 border-blue-500' 
                            : 'bg-white border border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          {isSelected ? (
                            <CheckSquare className="w-5 h-5 text-blue-600" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-400" />
                          )}
                          <div>
                            <p className="font-medium text-gray-900">{skill.name}</p>
                            {skill.description && (
                              <p className="text-sm text-gray-600">{skill.description}</p>
                            )}
                          </div>
                        </div>
                        <span className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded">
                          {skill.category}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={() => setShowSkillSelector(false)}
                  className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Done - {selectedSkillIds.length} Selected
                </button>
              </div>
            )}

            {selectedSkillIds.length === 0 && !showSkillSelector && (
              <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <Code className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No skills selected</p>
                <p className="text-sm text-gray-500">Click "Add Skills" to select your expertise</p>
              </div>
            )}
          </div>

          {/* Specializations */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Specializations</h2>
            <div className="space-y-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newSpecialization}
                  onChange={(e) => setNewSpecialization(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addSpecialization()}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Add specialization..."
                />
                <button
                  onClick={addSpecialization}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {specializations.map((spec, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800"
                  >
                    {spec}
                    <button
                      onClick={() => removeSpecialization(index)}
                      className="ml-2 text-purple-600 hover:text-purple-800"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Education */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <GraduationCap className="w-5 h-5 mr-2" />
                Education
              </h2>
              <button
                onClick={addEducation}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add
              </button>
            </div>
            <div className="space-y-4">
              {education.map((edu, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="Degree"
                    />
                    <input
                      type="text"
                      value={edu.institution}
                      onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="Institution"
                    />
                    <input
                      type="number"
                      min="1950"
                      max={new Date().getFullYear()}
                      value={edu.year}
                      onChange={(e) => updateEducation(index, 'year', parseInt(e.target.value))}
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="Year"
                    />
                    <input
                      type="text"
                      value={edu.grade}
                      onChange={(e) => updateEducation(index, 'grade', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="Grade"
                    />
                  </div>
                  <button
                    onClick={() => removeEducation(index)}
                    className="text-red-600 hover:text-red-800 flex items-center text-sm"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Certificates */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Award className="w-5 h-5 mr-2" />
                Certificates
              </h2>
              <button
                onClick={addCertificate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add
              </button>
            </div>
            <div className="space-y-4">
              {certificates.map((cert, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <input
                      type="text"
                      value={cert.name}
                      onChange={(e) => updateCertificate(index, 'name', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="Certificate Name"
                    />
                    <input
                      type="text"
                      value={cert.issuedBy}
                      onChange={(e) => updateCertificate(index, 'issuedBy', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="Issued By"
                    />
                    <input
                      type="date"
                      value={cert.issuedDate}
                      onChange={(e) => updateCertificate(index, 'issuedDate', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <label className="cursor-pointer">
                      <div className="px-3 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 flex items-center justify-center">
                        <Upload className="w-4 h-4 mr-2" />
                        <span className="text-sm">
                          {certificateFiles[index] ? 'File Selected' : 'Upload File'}
                        </span>
                      </div>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        // CONTINUATION FROM CERTIFICATE FILE UPLOAD
// Add this after the certificate upload input in the previous file

                        onChange={(e) => handleCertificateUpload(index, e)}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <button
                    onClick={() => removeCertificate(index)}
                    className="text-red-600 hover:text-red-800 flex items-center text-sm"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Resume Upload */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Upload className="w-5 h-5 mr-2" />
              Resume
            </h2>
            <div className="space-y-4">
              {profileData?.instructorProfile?.resumeUrl && !resumeFile && (
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <span className="text-sm text-green-800">Current resume uploaded</span>
                  <a
                    href={profileData.instructorProfile.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View Resume
                  </a>
                </div>
              )}
              <label className="cursor-pointer bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-6 block text-center hover:bg-gray-50 transition-colors">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <span className="text-gray-600 block">
                  {resumeFile ? resumeFile.name : 'Click to upload resume'}
                </span>
                <p className="text-sm text-gray-500 mt-1">PDF up to 10MB</p>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleResumeUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Social Links */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <LinkIcon className="w-5 h-5 mr-2" />
              Social Links (Optional)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  LinkedIn
                </label>
                <input
                  type="url"
                  value={socialLinks.linkedin}
                  onChange={(e) => setSocialLinks({...socialLinks, linkedin: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  GitHub
                </label>
                <input
                  type="url"
                  value={socialLinks.github}
                  onChange={(e) => setSocialLinks({...socialLinks, github: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="https://github.com/yourusername"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website
                </label>
                <input
                  type="url"
                  value={socialLinks.website}
                  onChange={(e) => setSocialLinks({...socialLinks, website: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="https://yourwebsite.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Twitter
                </label>
                <input
                  type="url"
                  value={socialLinks.twitter}
                  onChange={(e) => setSocialLinks({...socialLinks, twitter: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="https://twitter.com/yourusername"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-6 bg-gray-50">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
              <div className="text-sm text-gray-600">
                {!profileData?.instructorProfile?.isApproved && (
                  <p className="flex items-center">
                    <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                    Complete all required fields (*) to submit for approval
                  </p>
                )}
              </div>
              <div className="flex space-x-4 w-full sm:w-auto">
                <button
                  onClick={() => navigate('/instructor/dashboard')}
                  className="flex-1 sm:flex-none px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !bio || bio.length < 50 || !designation || selectedSkillIds.length === 0}
                  className="flex-1 sm:flex-none px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Profile
                    </>
                  )}
                </button>
              </div>
            </div>
            {(!bio || bio.length < 50 || !designation || selectedSkillIds.length === 0) && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800 font-medium">Required fields missing:</p>
                <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                  {(!bio || bio.length < 50) && <li>• Bio (minimum 50 characters)</li>}
                  {!designation && <li>• Designation</li>}
                  {selectedSkillIds.length === 0 && <li>• At least one skill</li>}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorProfile;