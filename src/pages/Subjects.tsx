// src/pages/Subjects.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Clock, 
  PlayCircle, 
  FileText, 
  Code, 
  Database,
  Palette,
  TrendingUp,
  Search,
  Filter,
  ChevronRight,
  Download,
  ExternalLink
} from 'lucide-react';
import { apiClient } from '../lib/api';
import { Subject } from '../types';
import Card from '../components/UI/Card';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const Subjects: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const params = {
        limit: 50,
        sortBy: 'name',
        sortOrder: 'asc' as const
      };
      const response = await apiClient.getSubjects(params);
      setSubjects(response.subjects || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      // Fallback to empty array if API fails
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (subjectName: string) => {
    const name = subjectName.toLowerCase();
    if (name.includes('html') || name.includes('css') || name.includes('javascript') || name.includes('react') || name.includes('node') || name.includes('php')) {
      return <Code className="w-6 h-6 text-blue-600" />;
    } else if (name.includes('data') || name.includes('python') || name.includes('machine learning')) {
      return <Database className="w-6 h-6 text-green-600" />;
    } else if (name.includes('design') || name.includes('ui') || name.includes('ux')) {
      return <Palette className="w-6 h-6 text-purple-600" />;
    } else if (name.includes('marketing') || name.includes('seo')) {
      return <TrendingUp className="w-6 h-6 text-orange-600" />;
    } else {
      return <BookOpen className="w-6 h-6 text-gray-600" />;
    }
  };

  const filteredSubjects = subjects.filter(subject => {
    const matchesSearch = subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         subject.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || 
                           subject.name.toLowerCase().includes(selectedCategory.toLowerCase());
    
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { value: 'all', label: 'All Subjects' },
    { value: 'programming', label: 'Programming' },
    { value: 'data', label: 'Data Science' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'design', label: 'Design' },
  ];

  const getTotalDuration = (syllabus: any[]) => {
    if (!syllabus || syllabus.length === 0) return 'N/A';
    
    let totalMinutes = 0;
    syllabus.forEach(item => {
      if (item.duration) {
        const match = item.duration.match(/(\d+)\s*(hour|hr|minute|min)/i);
        if (match) {
          const value = parseInt(match[1]);
          const unit = match[2].toLowerCase();
          if (unit.includes('hour') || unit.includes('hr')) {
            totalMinutes += value * 60;
          } else {
            totalMinutes += value;
          }
        }
      }
    });
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (hours === 0) return `${minutes} minutes`;
    if (minutes === 0) return `${hours} hours`;
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading subjects...</p>
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
              Course Subjects
            </h1>
            <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto">
              Explore detailed curricula and learning materials for all our courses
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
                placeholder="Search subjects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-4">
              <Filter className="w-5 h-5 text-gray-400" />
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
            </div>
          </div>
        </div>
      </div>

      {/* Subjects Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {filteredSubjects.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              {subjects.length === 0 ? 'No Subjects Available' : 'No Subjects Found'}
            </h3>
            <p className="text-gray-600">
              {subjects.length === 0 
                ? 'Subjects will be available soon.' 
                : 'Try adjusting your search or filter criteria.'}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-gray-600">
                Showing {filteredSubjects.length} of {subjects.length} subjects
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {filteredSubjects.map((subject) => (<Card key={subject._id} className="overflow-hidden">
                  <div className="p-6">
                    {/* Subject Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {getCategoryIcon(subject.name)}
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{subject.name}</h3>
                          {subject.course && (
                            <p className="text-sm text-blue-600">Part of: {subject.course}</p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => setExpandedSubject(expandedSubject === subject._id ? null : subject._id)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <ChevronRight 
                          className={`w-5 h-5 transform transition-transform ${
                            expandedSubject === subject._id ? 'rotate-90' : ''
                          }`} 
                        />
                      </button>
                    </div>

                    {/* Subject Description */}
                    <p className="text-gray-600 mb-4 line-clamp-2">{subject.description}</p>

                    {/* Subject Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {getTotalDuration(subject.syllabus)}
                      </div>
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 mr-1" />
                        {subject.syllabus?.length || 0} topics
                      </div>
                      {subject.materials && subject.materials.length > 0 && (
                        <div className="flex items-center">
                          <Download className="w-4 h-4 mr-1" />
                          {subject.materials.length} resources
                        </div>
                      )}
                    </div>

                    {/* Quick Topics Preview */}
                    {subject.syllabus && subject.syllabus.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Topics covered:</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {subject.syllabus.slice(0, 3).map((item, index) => (
                            <li key={index} className="flex items-start">
                              <span className="w-1 h-1 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                              <span className="line-clamp-1">{item.topic}</span>
                            </li>
                          ))}
                          {subject.syllabus.length > 3 && (
                            <li className="text-blue-600 text-xs">
                              +{subject.syllabus.length - 3} more topics
                            </li>
                          )}
                        </ul>
                      </div>
                    )}

                    {/* Expanded Content */}
                    {expandedSubject === subject._id && (
                      <div className="border-t pt-4 mt-4">
                        {/* Detailed Syllabus */}
                        {subject.syllabus && subject.syllabus.length > 0 && (
                          <div className="mb-6">
                            <h4 className="text-lg font-semibold text-gray-900 mb-3">Complete Syllabus</h4>
                            <div className="space-y-3">
                              {subject.syllabus.map((item, index) => (
                                <div key={index} className="bg-gray-50 rounded-lg p-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <h5 className="font-medium text-gray-900">{item.topic}</h5>
                                    {item.duration && (
                                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                        {item.duration}
                                      </span>
                                    )}
                                  </div>
                                  {item.description && (
                                    <p className="text-sm text-gray-600">{item.description}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Learning Materials */}
                        {subject.materials && subject.materials.length > 0 && (
                          <div className="mb-6">
                            <h4 className="text-lg font-semibold text-gray-900 mb-3">Learning Materials</h4>
                            <div className="space-y-2">
                              {subject.materials.map((material, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                  <div className="flex items-center">
                                    {material.type === 'pdf' && <FileText className="w-4 h-4 text-red-500 mr-2" />}
                                    {material.type === 'video' && <PlayCircle className="w-4 h-4 text-green-500 mr-2" />}
                                    {material.type === 'link' && <ExternalLink className="w-4 h-4 text-blue-500 mr-2" />}
                                    {material.type === 'document' && <FileText className="w-4 h-4 text-gray-500 mr-2" />}
                                    <span className="text-sm font-medium text-gray-900">{material.title}</span>
                                  </div>
                                  <button className="text-blue-600 hover:text-blue-800 transition-colors">
                                    <Download className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Course Link */}
                        {subject.course && (
                          <div className="pt-4 border-t">
                            <Link
                              to="/courses"
                              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                            >
                              View Complete Course
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </Link>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action Button */}
                    <div className="flex justify-between items-center mt-4">
                      <button
                        onClick={() => setExpandedSubject(expandedSubject === subject._id ? null : subject._id)}
                        className="text-blue-600 hover:text-blue-700 font-medium flex items-center transition-colors"
                      >
                        {expandedSubject === subject._id ? 'Show Less' : 'View Details'}
                        <ChevronRight 
                          className={`w-4 h-4 ml-1 transform transition-transform ${
                            expandedSubject === subject._id ? 'rotate-90' : ''
                          }`} 
                        />
                      </button>
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
            Ready to Master These Subjects?
          </h2>
          <p className="text-xl text-white opacity-90 mb-8">
            Join our comprehensive courses and learn from industry experts
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/courses"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              Browse Courses
            </Link>
            <Link
              to="/register"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors inline-flex items-center justify-center"
            >
              Get Started Today
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subjects;