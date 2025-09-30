// src/pages/CourseDetail.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Clock, 
  Users, 
  Star, 
  IndianRupee,
  Calendar,
  Award,
  PlayCircle,
  CheckCircle,
  ArrowLeft
} from 'lucide-react';
import { apiClient } from '../lib/api';
import { Course } from '../types';
import Card from '../components/UI/Card';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import Button from '../components/UI/Button';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import MaterialsTab from '../components/CourseDetail/MaterialsTab';

const CourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCourse();
      if (user && user.role === 'student') {
        checkEnrollmentStatus();
      }
    }
  }, [id, user]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getCourse(id!);
      setCourse(response);
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollmentStatus = async () => {
    if (!user || user.role !== 'student' || !id) return;
    
    try {
      setCheckingEnrollment(true);
      const response = await apiClient.checkEnrollmentStatus(id);
      setIsEnrolled(response.isEnrolled);
    } catch (error) {
      console.error('Error checking enrollment status:', error);
      setIsEnrolled(false);
    } finally {
      setCheckingEnrollment(false);
    }
  };

  const handleEnrollment = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'student') {
      toast.error('Only students can enroll in courses');
      return;
    }

    if (isEnrolled) {
      toast.info('You are already enrolled in this course');
      return;
    }

    try {
      setEnrolling(true);
      await apiClient.enrollInCourse(id!);
      toast.success('Enrollment request submitted! Your enrollment is pending admin approval.');
      setIsEnrolled(true); // Update enrollment status
      fetchCourse(); // Refresh course data
    } catch (error: any) {
      console.error('Enrollment error:', error);
      toast.error(error.response?.data?.message || 'Failed to enroll in course');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Course Not Found</h2>
          <p className="text-gray-600 mb-6">The course you're looking for doesn't exist.</p>
          <Link to="/courses" className="text-blue-600 hover:text-blue-800 font-medium">
            ← Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'video', label: 'Video Preview' },
    { id: 'curriculum', label: 'Curriculum' },
    { id: 'instructor', label: 'Instructor' },
    ...(user && user.role === 'student' && isEnrolled ? [{ id: 'materials', label: 'Materials' }] : []),
    { id: 'reviews', label: 'Reviews' }
  ];

  // Helper function to extract YouTube video ID and create embed URL
  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return null;
    
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`;
    }
    
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            to="/courses"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Link>
        </div>
      </div>

      {/* Course Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="lg:flex lg:items-start lg:space-x-8">
            {/* Course Image */}
            <div className="flex-shrink-0 lg:w-80">
              <div className="aspect-video bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl overflow-hidden">
                {course.imageUrl ? (
                  <img
                    src={course.imageUrl}
                    alt={course.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <BookOpen className="w-24 h-24 text-white" />
                  </div>
                )}
              </div>
            </div>

            {/* Course Info */}
            <div className="mt-6 lg:mt-0 lg:flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{course.name}</h1>
              <p className="text-lg text-gray-600 mb-6">{course.description}</p>

              {/* Course Stats */}
              <div className="flex flex-wrap gap-6 mb-6">
                <div className="flex items-center">
                  <IndianRupee className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-lg font-semibold">₹{course.fees?.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-blue-600 mr-2" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center">
                  <Users className="w-5 h-5 text-purple-600 mr-2" />
                  <span>{course.enrollmentCount} students</span>
                </div>
                {course.rating > 0 && (
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-yellow-500 mr-2 fill-current" />
                    <span>{course.rating.toFixed(1)} ({course.reviews?.length || 0} reviews)</span>
                  </div>
                )}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                {user && user.role === 'student' ? (
                  <Button 
                    size="lg" 
                    className={`flex-1 sm:flex-none ${isEnrolled ? 'bg-green-600 hover:bg-green-700' : ''}`}
                    onClick={handleEnrollment}
                    disabled={enrolling || checkingEnrollment || isEnrolled}
                  >
                    <Award className="w-5 h-5 mr-2" />
                    {checkingEnrollment ? 'Checking...' : 
                     enrolling ? 'Enrolling...' : 
                     isEnrolled ? 'Already Enrolled' : 
                     'Enroll Now'}
                  </Button>
                ) : (
                  <Button 
                    size="lg" 
                    className="flex-1 sm:flex-none"
                    onClick={handleEnrollment}
                  >
                    <Award className="w-5 h-5 mr-2" />
                    {user ? 'Login as Student to Enroll' : 'Login to Enroll'}
                  </Button>
                )}
                <Button variant="outline" size="lg" onClick={() => setSelectedTab('video')}>
                  <PlayCircle className="w-5 h-5 mr-2" />
                  Preview Course
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="border-b border-gray-200 mb-8">
              <nav className="-mb-px flex space-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedTab(tab.id)}
                    className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                      selectedTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="space-y-8">
              {selectedTab === 'overview' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Overview</h2>
                  <div className="prose prose-lg text-gray-600">
                    <p>{course.description}</p>
                    
                    {course.structure && course.structure.length > 0 && (
                      <div className="mt-8">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">What You'll Learn</h3>
                        <ul className="space-y-3">
                          {course.structure.map((item, index) => (
                            <li key={index} className="flex items-start">
                              <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedTab === 'video' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Video Preview</h2>
                  {course.videoUrl && getYouTubeEmbedUrl(course.videoUrl) ? (
                    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      <iframe
                        src={getYouTubeEmbedUrl(course.videoUrl)!}
                        title={`${course.name} - Video Preview`}
                        className="w-full h-full"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <PlayCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Video Preview Available</h3>
                        <p className="text-gray-600">Video preview will be available soon.</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {selectedTab === 'curriculum' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Curriculum</h2>
                  {course.subjects && course.subjects.length > 0 ? (
                    <div className="space-y-4">
                      {course.subjects.map((subject, index) => (
                        <Card key={index} className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">{subject}</h3>
                              <p className="text-gray-600">Subject {index + 1}</p>
                            </div>
                            <PlayCircle className="w-6 h-6 text-blue-600" />
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">Detailed curriculum will be available soon.</p>
                  )}
                </div>
              )}

              {selectedTab === 'instructor' && (
  <div>
    <h2 className="text-2xl font-bold text-gray-900 mb-4">Meet Your Instructor</h2>
    {course.instructor ? (
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6">
          {/* Instructor Avatar */}
          <div className="flex-shrink-0">
            {course.instructor.imageUrl ? (
              <img
                src={course.instructor.imageUrl}
                alt={`${course.instructor.user.firstName} ${course.instructor.user.lastName}`}
                className="w-24 h-24 rounded-full object-cover border-4 border-blue-100"
              />
            ) : (
              <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                <Users className="w-12 h-12 text-white" />
              </div>
            )}
          </div>
          
          {/* Instructor Details */}
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900">
              {course.instructor.user.firstName} {course.instructor.user.lastName}
            </h3>
            <p className="text-blue-600 font-medium mb-2">{course.instructor.designation}</p>
            
            {/* Instructor Stats */}
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <Award className="w-4 h-4 mr-1 text-gray-400" />
                <span>{course.instructor.experience} years experience</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Users className="w-4 h-4 mr-1 text-gray-400" />
                <span>{course.instructor.totalStudents || 0} students taught</span>
              </div>
              {course.instructor.rating > 0 && (
                <div className="flex items-center text-sm text-gray-600">
                  <Star className="w-4 h-4 mr-1 text-yellow-500 fill-current" />
                  <span>{course.instructor.rating.toFixed(1)} instructor rating</span>
                </div>
              )}
            </div>
            
            {/* Bio */}
            <div className="prose prose-sm max-w-none text-gray-600">
              <p>{course.instructor.bio}</p>
            </div>
            
            {/* Approval Badge */}
            {course.instructor.isApproved && (
              <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                Verified Instructor
              </div>
            )}
          </div>
        </div>
      </Card>
    ) : (
      <Card className="p-6">
        <div className="flex items-start space-x-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
            <Users className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Instructor Information</h3>
            <p className="text-gray-600 mt-2">
              Instructor details will be available soon. This course is taught by experienced professionals 
              who bring real-world expertise to the classroom.
            </p>
          </div>
        </div>
      </Card>
    )}
  </div>
)}

              {selectedTab === 'materials' && user && user.role === 'student' && isEnrolled && (
                <MaterialsTab courseId={id!} />
              )}

              {selectedTab === 'reviews' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Student Reviews</h2>
                  {course.reviews && course.reviews.length > 0 ? (
                    <div className="space-y-6">
                      {course.reviews.map((review, index) => (
                        <Card key={index} className="p-6">
                          <div className="flex items-start space-x-4">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                              <Users className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center mb-2">
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-4 h-4 ${
                                        i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="ml-2 text-sm text-gray-600">
                                  {new Date(review.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-gray-700">{review.comment}</p>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">No reviews yet. Be the first to review this course!</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="mt-12 lg:mt-0">
            <Card className="p-6 sticky top-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Details</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Price</span>
                  <span className="font-semibold text-green-600">₹{course.fees?.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-medium">{course.duration}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Students</span>
                  <span className="font-medium">{course.enrollmentCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Certificate</span>
                  <span className="font-medium text-green-600">Yes</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Access</span>
                  <span className="font-medium">Lifetime</span>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t">
                {user && user.role === 'student' ? (
                  <Button 
                    size="lg" 
                    className={`w-full ${isEnrolled ? 'bg-green-600 hover:bg-green-700' : ''}`}
                    onClick={handleEnrollment}
                    disabled={enrolling || checkingEnrollment || isEnrolled}
                  >
                    <Award className="w-5 h-5 mr-2" />
                    {checkingEnrollment ? 'Checking...' : 
                     enrolling ? 'Enrolling...' : 
                     isEnrolled ? 'Already Enrolled' : 
                     'Enroll Now'}
                  </Button>
                ) : (
                  <Button 
                    size="lg" 
                    className="w-full"
                    onClick={handleEnrollment}
                  >
                    <Award className="w-5 h-5 mr-2" />
                    {user ? 'Login as Student to Enroll' : 'Login to Enroll'}
                  </Button>
                )}
                <p className="text-xs text-gray-500 mt-2 text-center">
                  30-day money-back guarantee
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;