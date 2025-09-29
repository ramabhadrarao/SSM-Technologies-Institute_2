import React from 'react';
import HeroSlider from '../components/Home/HeroSlider';
import CoursesSection from '../components/Home/CoursesSection';
import { Link } from 'react-router-dom';
import { BookOpen, Users, Award, Clock, CheckCircle, Star } from 'lucide-react';

const Home: React.FC = () => {
  const features = [
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: 'Expert Faculty',
      description: 'Learn from industry experts with years of experience',
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Interactive Classes',
      description: 'Engage in live sessions with peer-to-peer learning',
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: 'Certified Courses',
      description: 'Get industry-recognized certifications upon completion',
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: 'Flexible Learning',
      description: 'Study at your own pace with recorded sessions',
    },
  ];

  const stats = [
    { number: '1000+', label: 'Students Enrolled' },
    { number: '50+', label: 'Expert Instructors' },
    { number: '25+', label: 'Courses Available' },
    { number: '95%', label: 'Success Rate' },
  ];

  const testimonials = [
    {
      name: 'Priya Sharma',
      role: 'Software Developer',
      content: 'SSM Technologies transformed my career. The quality of education and support from instructors is exceptional.',
      rating: 5,
    },
    {
      name: 'Rajesh Kumar',
      role: 'Data Analyst',
      content: 'The practical approach to learning helped me land my dream job. Highly recommended for career growth.',
      rating: 5,
    },
    {
      name: 'Sneha Patel',
      role: 'Digital Marketer',
      content: 'Flexible timing and comprehensive curriculum made it perfect for working professionals like me.',
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSlider />

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose SSM Technologies?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We provide world-class education with modern teaching methodologies
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 transition-all duration-300"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-full mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-cyan-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center text-white">
                <div className="text-3xl md:text-4xl font-bold mb-2">{stat.number}</div>
                <div className="text-lg opacity-90">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <CoursesSection />

      {/* Testimonials Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Students Say
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Success stories from our alumni who have achieved their career goals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-gray-900 via-blue-900 to-cyan-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Start Your Learning Journey?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of students who have transformed their careers with us
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center"
            >
              <Users className="w-5 h-5 mr-2" />
              Register Now
            </Link>
            <Link
              to="/courses"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors inline-flex items-center justify-center"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              Browse Courses
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;