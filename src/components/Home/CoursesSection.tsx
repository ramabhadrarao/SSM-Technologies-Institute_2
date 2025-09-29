// src/components/Home/CoursesSection.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, Users, ArrowRight } from 'lucide-react';
import { apiClient } from '../../lib/api';
import { Course } from '../../types';
import Card from '../UI/Card';

const CoursesSection: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await apiClient.getCourses({ limit: 6 });
      setCourses(response.courses || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Featured Courses
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover our comprehensive courses designed to help you excel in your career
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-white rounded-xl h-64 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Our Featured Courses
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover our comprehensive courses designed to help you excel in your career
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <Card key={course._id} hover className="overflow-hidden">
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
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                  <span className="text-sm font-semibold text-blue-600">₹{course.fees}</span>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{course.name}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{course.description}</p>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {course.duration}
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {course.subjects?.length || 0} Subjects
                  </div>
                </div>

                <div className="flex items-center justify-between">
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

        {courses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Courses Available</h3>
            <p className="text-gray-600">Check back later for new courses.</p>
          </div>
        ) : (
          <div className="text-center mt-12">
            <Link
              to="/courses"
              className="inline-flex items-center bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all duration-200"
            >
              View All Courses
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default CoursesSection;