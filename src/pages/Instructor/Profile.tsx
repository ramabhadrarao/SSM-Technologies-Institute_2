import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  User, 
  Camera, 
  Upload, 
  Plus, 
  Trash2, 
  Save, 
  ArrowLeft,
  GraduationCap,
  Award,
  Briefcase,
  Link as LinkIcon,
  Mail,
  Phone
} from 'lucide-react';
import { apiClient } from '../../lib/api';

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
  uploadedAt?: string;
}

interface SocialLinks {
  linkedin: string;
  github: string;
  website: string;
  twitter: string;
}

interface ProfileData {
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    whatsapp: string;
    profileImageUrl?: string;
  };
  instructorProfile: {
    bio: string;
    designation: string;
    experience: number;
    specializations: string[];
    education: Education[];
    certificates: Certificate[];
    socialLinks: SocialLinks;
    imageUrl?: string;
    resumeUrl?: string;
  };
}

const InstructorProfile: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [certificateFiles, setCertificateFiles] = useState<{ [key: number]: File }>({});

  // Form states
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
  const [newSpecialization, setNewSpecialization] = useState('');

  useEffect(() => {
    fetchProfile();
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
          linkedin: '',
          github: '',
          website: '',
          twitter: ''
        });
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size should be less than 5MB');
        return;
      }
      setProfileImage(file);
    }
  };

  const handleResumeUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('Resume size should be less than 10MB');
        return;
      }
      setResumeFile(file);
    }
  };

  const handleCertificateUpload = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Certificate size should be less than 5MB');
        return;
      }
      setCertificateFiles(prev => ({ ...prev, [index]: file }));
    }
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
    setEducation([...education, { degree: '', institution: '', year: new Date().getFullYear(), grade: '' }]);
  };

  const updateEducation = (index: number, field: keyof Education, value: string | number) => {
    const updated = education.map((edu, i) => 
      i === index ? { ...edu, [field]: value } : edu
    );
    setEducation(updated);
  };

  const removeEducation = (index: number) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  const addCertificate = () => {
    setCertificates([...certificates, { 
      name: '', 
      url: '', 
      issuedBy: '', 
      issuedDate: new Date().toISOString().split('T')[0]
    }]);
  };

  const updateCertificate = (index: number, field: keyof Certificate, value: string) => {
    const updated = certificates.map((cert, i) => 
      i === index ? { ...cert, [field]: value } : cert
    );
    setCertificates(updated);
  };

  const removeCertificate = (index: number) => {
    setCertificates(certificates.filter((_, i) => i !== index));
    // Remove associated file if exists
    setCertificateFiles(prev => {
      const updated = { ...prev };
      delete updated[index];
      return updated;
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Upload profile image if selected
      let imageUrl = profileData?.instructorProfile?.imageUrl;
      if (profileImage) {
        const imageResponse = await apiClient.uploadFile(profileImage, 'profile');
        imageUrl = imageResponse.url;
      }

      // Upload resume if selected
      let resumeUrl = profileData?.instructorProfile?.resumeUrl;
      if (resumeFile) {
        const resumeResponse = await apiClient.uploadFile(resumeFile, 'resume');
        resumeUrl = resumeResponse.url;
      }

      // Upload certificates
      const updatedCertificates = [...certificates];
      for (const [index, file] of Object.entries(certificateFiles)) {
        const certResponse = await apiClient.uploadFile(file, 'certificate');
        updatedCertificates[parseInt(index)].url = certResponse.url;
      }

      // Update profile
      const updateData = {
        bio,
        designation,
        experience,
        specializations,
        education,
        certificates: updatedCertificates,
        socialLinks,
        imageUrl,
        resumeUrl
      };

      await apiClient.updateInstructorProfile(updateData);
      toast.success('Profile updated successfully!');
      navigate('/instructor/dashboard');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
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
          <p className="text-gray-600 mt-2">Manage your instructor profile information</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          {/* Profile Image Section */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Camera className="w-5 h-5 mr-2" />
              Profile Photo
            </h2>
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  {profileData?.instructorProfile?.imageUrl || profileImage ? (
                    <img
                      src={profileImage ? URL.createObjectURL(profileImage) : profileData?.instructorProfile?.imageUrl}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-gray-400" />
                  )}
                </div>
              </div>
              <div>
                <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-sm text-gray-500 mt-2">JPG, PNG up to 5MB</p>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  value={profileData?.user?.firstName || ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={profileData?.user?.lastName || ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={profileData?.user?.email || ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={profileData?.user?.phone || ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Briefcase className="w-5 h-5 mr-2" />
              Professional Information
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tell us about yourself..."
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Designation
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
                    Experience (Years)
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

          {/* Specializations */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Specializations
            </h2>
            <div className="space-y-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newSpecialization}
                  onChange={(e) => setNewSpecialization(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addSpecialization()}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add a specialization..."
                />
                <button
                  onClick={addSpecialization}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {specializations.map((spec, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                  >
                    {spec}
                    <button
                      onClick={() => removeSpecialization(index)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
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
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Education
              </button>
            </div>
            <div className="space-y-4">
              {education.map((edu, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Degree
                      </label>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Bachelor of Computer Science"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Institution
                      </label>
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., University of Technology"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Year
                      </label>
                      <input
                        type="number"
                        min="1950"
                        max={new Date().getFullYear()}
                        value={edu.year}
                        onChange={(e) => updateEducation(index, 'year', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Grade/CGPA
                      </label>
                      <input
                        type="text"
                        value={edu.grade}
                        onChange={(e) => updateEducation(index, 'grade', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., 8.5 CGPA or First Class"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => removeEducation(index)}
                    className="text-red-600 hover:text-red-800 flex items-center"
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
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Certificate
              </button>
            </div>
            <div className="space-y-4">
              {certificates.map((cert, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Certificate Name
                      </label>
                      <input
                        type="text"
                        value={cert.name}
                        onChange={(e) => updateCertificate(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., AWS Certified Solutions Architect"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Issued By
                      </label>
                      <input
                        type="text"
                        value={cert.issuedBy}
                        onChange={(e) => updateCertificate(index, 'issuedBy', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Amazon Web Services"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Issue Date
                      </label>
                      <input
                        type="date"
                        value={cert.issuedDate}
                        onChange={(e) => updateCertificate(index, 'issuedDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Certificate File
                      </label>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleCertificateUpload(index, e)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => removeCertificate(index)}
                    className="text-red-600 hover:text-red-800 flex items-center"
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
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Resume
            </h2>
            <div className="space-y-4">
              {profileData?.instructorProfile?.resumeUrl && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span>Current resume:</span>
                  <a
                    href={profileData.instructorProfile.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    View Resume
                  </a>
                </div>
              )}
              <div>
                <label className="cursor-pointer bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-6 block text-center hover:bg-gray-50 transition-colors">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <span className="text-gray-600">
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
          </div>

          {/* Social Links */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <LinkIcon className="w-5 h-5 mr-2" />
              Social Links
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://twitter.com/yourusername"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="p-6">
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => navigate('/instructor/dashboard')}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
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
        </div>
      </div>
    </div>
  );
};

export default InstructorProfile;