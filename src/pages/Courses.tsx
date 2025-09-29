// src/pages/Courses.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, Users, Star, Filter, Search, ArrowRight, IndianRupee } from 'lucide-react';
import { apiClient } from '../lib/api';
import { Course } from '../types';
import Card from '../components/UI/Card';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const Courses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [priceRange, setPriceRange] = useState('all');

  useEffect(() => {
    fetchCourses();
  }, [sortBy]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params = {
        limit: 50,
        sortBy: sortBy,
        sortOrder: sortBy === 'fees' ? 'asc' : 'asc'
      };
      const response = await apiClient.getCourses(params);
      setCourses(response.courses || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || 
                           course.name.toLowerCase().includes(selectedCategory.toLowerCase());
    
    const matchesPriceRange = priceRange === 'all' || 
                             (priceRange === 'under25k' && course.fees < 25000) ||
                             (priceRange === '25k-50k' && course.fees >= 25000 && course.fees <= 50000) ||
                             (priceRange === 'above50k' && course.fees > 50000);
    
    return matchesSearch && matchesCategory && matchesPriceRange;
  });

  const categories = [
    { value: 'all', label: 'All Courses' },
    { value: 'development', label: 'Web Development' },
    { value: 'data', label: 'Data Science' },
    { value: 'marketing', label: 'Digital Marketing' },
    { value: 'design', label: 'UI/UX Design' },
    { value: 'programming', label: 'Programming' }
  ];

  const sortOptions = [
    { value: 'name', label: 'Name (A-Z)' },
    { value: 'fees', label: 'Price (Low to High)' },
    { value: 'rating', label: 'Rating (High to Low)' },
    { value: 'duration', label: 'Duration' }
  ];

  const priceRanges = [
    { value: 'all', label: 'All Prices' },
    { value: 'under25k', label: 'Under ₹25,000' },
    { value: '25k-50k', label: '₹25,000 - ₹50,000' },
    { value: 'above50k', label: 'Above ₹50,000' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading courses...</p>
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
              Explore Our Courses
            </h1>
            <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto">
              Transform your career with our comprehensive, industry-focused courses designed by experts
            </p>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>

              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {priceRanges.map(range => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Courses Found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-gray-600">
                Showing {filteredCourses.length} of {courses.length} courses
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCourses.map((course) => (
                <Card key={course._id} hover className="overflow-hidden h-full flex flex-col">
                  {/* Course Image */}
                  <div className="relative h-48 bg-gradient-to-br from-blue-500 to-cyan-500">
                    {course.imageUrl ? (
                      <img
                        src={course.imageUrl}
                        alt={course.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <BookOpen className="w-16 h-16 text-white" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full">
                      <span className="text-sm font-bold text-blue-600 flex items-center">
                        <IndianRupee className="w-4 h-4" />
                        {course.fees?.toLocaleString('en-IN')}
                      </span>
                    </div>
                    
                    {course.rating && course.rating > 0 && (
                      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-full">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-medium text-gray-800 ml-1">
                            {course.rating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Course Content */}
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                      {course.name}
                    </h3>
                    
                    <p className="text-gray-600 mb-4 line-clamp-3 flex-1">
                      {course.description}
                    </p>

                    {/* Course Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {course.duration}
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {course.enrollmentCount || 0} students
                      </div>
                    </div>

                    {/* Course Structure Preview */}
                    {course.structure && course.structure.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-700 mb-2">What you'll learn:</p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {course.structure.slice(0, 3).map((item, index) => (
                            <li key={index} className="flex items-start">
                              <span className="w-1 h-1 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                              <span className="line-clamp-1">{item}</span>
                            </li>
                          ))}
                          {course.structure.length > 3 && (
                            <li className="text-blue-600 text-xs">
                              +{course.structure.length - 3} more topics
                            </li>
                          )}
                        </ul>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between mt-auto">
                      <Link
                        to={`/courses/${course._id}`}
                        className="text-blue-600 hover:text-blue-700 font-medium flex items-center transition-colors"
                      >
                        Learn More
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Link>
                      <Link
                        to="/register"
                        className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-cyan-700 transition-all duration-200"
                      >
                        Enroll Now
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Start Learning?
          </h2>
          <p className="text-xl text-white opacity-90 mb-8">
            Join thousands of students and transform your career today
          </p>
          <Link
            to="/register"
            className="inline-flex items-center bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            <Users className="w-5 h-5 mr-2" />
            Get Started Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Courses;