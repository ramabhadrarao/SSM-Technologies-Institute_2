// src/pages/About.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Award, Users, BookOpen, TrendingUp, Linkedin, Twitter, ExternalLink, Target, Eye, Heart } from 'lucide-react';
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
      // Fallback to empty array if API fails
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
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600">
                "Empowering individuals and organizations through cutting-edge IT education, SSM Technologies is committed to delivering industry-relevant training that fosters innovation, enhances career growth, and builds a skilled digital workforce. We strive to bridge the gap between academic learning and practical expertise by offering hands-on, personalized, and globally competitive technology programs."
              </p>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Vision</h2>
              <p className="text-lg text-gray-600">
                "To become a transformative force in global IT education by nurturing talent, fostering innovation, and delivering future-ready skills that empower individuals and organizations to thrive in the digital age. SSM Technologies envisions a world where technology is accessible, inclusive, and a catalyst for positive change—driven by a community of learners, educators, and industry leaders committed to excellence, integrity, and lifelong learning."
              </p>
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
              <Card key={index} className="text-center p-8 h-full">
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {teamMembers.map((member) => (
              <Card key={member._id} className="overflow-hidden">
                <div className="md:flex">
                  <div className="md:flex-shrink-0">
                    <div className="h-48 w-full md:w-48 bg-gradient-to-br from-blue-500 to-cyan-500">
                      {member.imageUrl ? (
                        <img
                          src={member.imageUrl}
                          alt={member.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full flex items-center justify-center">
                          <Users className="w-16 h-16 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="p-6 flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {member.name}
                    </h3>
                    <p className="text-blue-600 font-medium mb-2">
                      {member.designation}
                    </p>
                    {member.department && (
                      <p className="text-sm text-gray-500 mb-2">
                        {member.department}
                      </p>
                    )}
                    {member.experience && (
                      <p className="text-sm text-gray-500 mb-4">
                        {member.experience}
                      </p>
                    )}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-4">
                      {member.bio}
                    </p>
                    
                    {/* Social Links */}
                    <div className="flex space-x-3">
                      {member.socialLinks?.linkedin && (
                        <a
                          href={member.socialLinks.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <Linkedin className="w-5 h-5" />
                        </a>
                      )}
                      {member.socialLinks?.twitter && (
                        <a
                          href={member.socialLinks.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-600 transition-colors"
                        >
                          <Twitter className="w-5 h-5" />
                        </a>
                      )}
                      {member.socialLinks?.email && (
                        <a
                          href={`mailto:${member.socialLinks.email}`}
                          className="text-gray-600 hover:text-gray-800 transition-colors"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  </div>
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
            <p>
              Founded in 2018, SSM Technologies began with a simple yet powerful vision: to bridge 
              the gap between traditional education and industry requirements. Our founders, having 
              experienced firsthand the challenges faced by fresh graduates entering the tech industry, 
              were determined to create a learning platform that would truly prepare students for 
              real-world challenges.
            </p>
            
            <p>
              What started as a small coaching center with 10 students has grown into one of India's 
              most trusted technology education providers. We have successfully trained over 5,000 
              students, with 95% of them securing placements in top companies across various industries.
            </p>
            
            <p>
              Our success lies in our commitment to practical, hands-on learning combined with strong 
              theoretical foundations. We continuously update our curriculum to match industry trends 
              and work closely with hiring partners to understand their requirements.
            </p>
            
            <p>
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
    </div>
  );
};

export default About;