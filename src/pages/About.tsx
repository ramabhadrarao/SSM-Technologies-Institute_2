// src/pages/About.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Award, 
  Users, 
  BookOpen, 
  TrendingUp, 
  Linkedin, 
  Twitter, 
  Mail,
  ExternalLink, 
  Target, 
  Eye, 
  Heart,
  Quote,
  Briefcase,
  GraduationCap
} from 'lucide-react';
import { apiClient } from '../lib/api';
import Card from '../components/UI/Card';
import LoadingSpinner from '../components/UI/LoadingSpinner';

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
}

const About: React.FC = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  useEffect(() => {
    fetchTeamData();
  }, []);

  const fetchTeamData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getPublicTeamMembers();
      setTeamMembers(response || []);
    } catch (error) {
      console.error('Error fetching team data:', error);
      setTeamMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { icon: <Users className="w-8 h-8" />, number: '5000+', label: 'Students Trained' },
    { icon: <Award className="w-8 h-8" />, number: '95%', label: 'Placement Rate' },
    { icon: <BookOpen className="w-8 h-8" />, number: '25+', label: 'Expert Courses' },
    { icon: <TrendingUp className="w-8 h-8" />, number: '200+', label: 'Industry Partners' },
  ];

  const values = [
    {
      icon: <Target className="w-12 h-12 text-blue-600" />,
      title: 'Excellence',
      description: 'We strive for excellence in everything we do, from curriculum design to student support.'
    },
    {
      icon: <Eye className="w-12 h-12 text-blue-600" />,
      title: 'Innovation',
      description: 'We continuously innovate our teaching methods and stay updated with industry trends.'
    },
    {
      icon: <Heart className="w-12 h-12 text-blue-600" />,
      title: 'Student Success',
      description: 'Your success is our success. We are committed to helping you achieve your career goals.'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading about information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              About SSM Technologies
            </h1>
            <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto">
              Empowering students with quality education and transforming careers through innovative learning
            </p>
          </div>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="relative">
              <div className="absolute top-0 left-0 w-16 h-16 text-blue-100">
                <Quote className="w-full h-full" />
              </div>
              <div className="pl-20">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Empowering individuals and organizations through cutting-edge IT education, SSM Technologies is committed to delivering industry-relevant training that fosters innovation, enhances career growth, and builds a skilled digital workforce. We strive to bridge the gap between academic learning and practical expertise by offering hands-on, personalized, and globally competitive technology programs.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="absolute top-0 left-0 w-16 h-16 text-cyan-100">
                <Quote className="w-full h-full" />
              </div>
              <div className="pl-20">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Vision</h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  To become a transformative force in global IT education by nurturing talent, fostering innovation, and delivering future-ready skills that empower individuals and organizations to thrive in the digital age. SSM Technologies envisions a world where technology is accessible, inclusive, and a catalyst for positive change.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-gradient-to-r from-blue-600 to-cyan-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Our Impact in Numbers
            </h2>
            <p className="text-xl text-white opacity-90">
              Building success stories every day
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center text-white">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
                  {stat.icon}
                </div>
                <div className="text-3xl md:text-4xl font-bold mb-2">{stat.number}</div>
                <div className="text-lg opacity-90">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Core Values
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center p-8 h-full hover:shadow-2xl transition-shadow">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-50 rounded-full mb-6">
                  {value.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Meet Our Leadership Team
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experienced professionals dedicated to your success
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member) => (
              <Card 
                key={member._id} 
                className="group overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                {/* Image Section with Overlay */}
                <div className="relative h-80 overflow-hidden bg-gradient-to-br from-blue-500 to-cyan-500">
                  {member.imageUrl ? (
                    <img
                      src={member.imageUrl}
                      alt={member.name}
                      className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <Users className="w-24 h-24 text-white" />
                    </div>
                  )}
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Department Badge */}
                  {member.department && (
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                      <span className="text-xs font-semibold text-blue-600">{member.department}</span>
                    </div>
                  )}
                  
                  {/* Social Links - Appear on Hover */}
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                    {member.socialLinks?.linkedin && (
                      <a
                        href={member.socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-blue-600 hover:text-white transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Linkedin className="w-5 h-5" />
                      </a>
                    )}
                    {member.socialLinks?.twitter && (
                      <a
                        href={member.socialLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-blue-400 hover:text-white transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Twitter className="w-5 h-5" />
                      </a>
                    )}
                    {member.email && (
                      <a
                        href={`mailto:${member.email}`}
                        className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-gray-800 hover:text-white transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Mail className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6">
                  {/* Name and Designation */}
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {member.name}
                    </h3>
                    <p className="text-blue-600 font-semibold text-sm mb-1">
                      {member.designation}
                    </p>
                  </div>

                  {/* Experience Badge */}
                  {member.experience && (
                    <div className="flex items-center text-sm text-gray-600 mb-4 bg-gray-50 rounded-lg px-3 py-2">
                      <Briefcase className="w-4 h-4 mr-2 text-blue-500" />
                      <span className="font-medium">{member.experience}</span>
                    </div>
                  )}

                  {/* Bio */}
                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-4 mb-4">
                    {member.bio}
                  </p>

                  {/* Read More Button */}
                  <button
                    onClick={() => setSelectedMember(member)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-semibold flex items-center transition-colors"
                  >
                    Read More
                    <ExternalLink className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Story Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Story
            </h2>
          </div>
          
          <div className="prose prose-lg mx-auto text-gray-600">
            <p className="text-lg leading-relaxed mb-6">
              Founded in 2018, SSM Technologies began with a simple yet powerful vision: to bridge 
              the gap between traditional education and industry requirements. Our founders, having 
              experienced firsthand the challenges faced by fresh graduates entering the tech industry, 
              were determined to create a learning platform that would truly prepare students for 
              real-world challenges.
            </p>
            
            <p className="text-lg leading-relaxed mb-6">
              What started as a small coaching center with 10 students has grown into one of India's 
              most trusted technology education providers. We have successfully trained over 5,000 
              students, with 95% of them securing placements in top companies across various industries.
            </p>
            
            <p className="text-lg leading-relaxed mb-6">
              Our success lies in our commitment to practical, hands-on learning combined with strong 
              theoretical foundations. We continuously update our curriculum to match industry trends 
              and work closely with hiring partners to understand their requirements.
            </p>
            
            <p className="text-lg leading-relaxed">
              Today, SSM Technologies stands as a testament to the power of quality education, 
              dedicated mentorship, and unwavering commitment to student success. Our alumni work 
              in leading technology companies worldwide, and many have started their own successful 
              ventures.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-white opacity-90 mb-8">
            Join thousands of successful students and transform your career with us
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center"
            >
              <Users className="w-5 h-5 mr-2" />
              Join Our Community
            </Link>
            <Link
              to="/courses"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors inline-flex items-center justify-center"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              Explore Courses
            </Link>
          </div>
        </div>
      </div>

      {/* Team Member Modal */}
      {selectedMember && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedMember(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              {/* Header with Image */}
              <div className="relative h-64 bg-gradient-to-br from-blue-500 to-cyan-500">
                {selectedMember.imageUrl ? (
                  <img
                    src={selectedMember.imageUrl}
                    alt={selectedMember.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <Users className="w-24 h-24 text-white" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                
                {/* Close Button */}
                <button
                  onClick={() => setSelectedMember(null)}
                  className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors"
                >
                  <ExternalLink className="w-5 h-5 text-gray-800 transform rotate-45" />
                </button>
              </div>

              {/* Content */}
              <div className="p-8">
                {/* Name and Title */}
                <div className="mb-6">
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">
                    {selectedMember.name}
                  </h3>
                  <p className="text-xl text-blue-600 font-semibold mb-2">
                    {selectedMember.designation}
                  </p>
                  {selectedMember.department && (
                    <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {selectedMember.department}
                    </span>
                  )}
                </div>

                {/* Experience */}
                {selectedMember.experience && (
                  <div className="flex items-center text-gray-700 mb-6 bg-gray-50 rounded-lg px-4 py-3">
                    <GraduationCap className="w-5 h-5 mr-3 text-blue-500" />
                    <span className="font-medium">{selectedMember.experience}</span>
                  </div>
                )}

                {/* Bio */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">About</h4>
                  <p className="text-gray-600 leading-relaxed">
                    {selectedMember.bio}
                  </p>
                </div>

                {/* Contact Info */}
                {selectedMember.email && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Contact</h4>
                    <a 
                      href={`mailto:${selectedMember.email}`}
                      className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <Mail className="w-5 h-5 mr-2" />
                      {selectedMember.email}
                    </a>
                  </div>
                )}

                {/* Social Links */}
                <div className="flex space-x-4 pt-6 border-t">
                  {selectedMember.socialLinks?.linkedin && (
                    <a
                      href={selectedMember.socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Linkedin className="w-6 h-6" />
                    </a>
                  )}
                  {selectedMember.socialLinks?.twitter && (
                    <a
                      href={selectedMember.socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-12 h-12 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition-colors"
                    >
                      <Twitter className="w-6 h-6" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default About;