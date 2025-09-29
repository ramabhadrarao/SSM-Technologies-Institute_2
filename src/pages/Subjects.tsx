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
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { apiClient } from '../lib/api';
import { Subject } from '../types';
import Card from '../components/UI/Card';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { toast } from 'react-hot-toast';

interface PaginationData {
  current: number;
  pages: number;
  total: number;
  limit: number;
}

const Subjects: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchSubjects = async (page: number = 1, search?: string) => {
    try {
      setLoading(true);
      const response = await apiClient.getSubjects({
        page,
        limit: 12,
        search: search || searchQuery,
        sortBy: 'name',
        sortOrder: 'asc'
      });
      
      // The API client already extracts the data property
      if (response && response.subjects) {
        setSubjects(response.subjects || []);
        setPagination(response.pagination || null);
      } else {
        setSubjects([]);
        setPagination(null);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
      toast.error('Failed to load subjects');
      setSubjects([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects(1);
  }, []);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchQuery !== '') {
        fetchSubjects(1, searchQuery);
        setCurrentPage(1);
      } else {
        fetchSubjects(1);
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery]);

  const getCategoryIcon = (subjectName: string) => {
    const name = subjectName.toLowerCase();
    if (name.includes('html') || name.includes('css') || name.includes('javascript') || name.includes('react') || name.includes('node') || name.includes('php') || name.includes('web') || name.includes('frontend') || name.includes('backend')) {
      return <Code className="w-6 h-6 text-blue-600" />;
    } else if (name.includes('data') || name.includes('python') || name.includes('machine learning') || name.includes('ai') || name.includes('analytics')) {
      return <Database className="w-6 h-6 text-green-600" />;
    } else if (name.includes('design') || name.includes('ui') || name.includes('ux') || name.includes('graphic')) {
      return <Palette className="w-6 h-6 text-purple-600" />;
    } else if (name.includes('marketing') || name.includes('seo') || name.includes('digital') || name.includes('social')) {
      return <TrendingUp className="w-6 h-6 text-orange-600" />;
    } else {
      return <BookOpen className="w-6 h-6 text-gray-600" />;
    }
  };

  const filteredSubjects = subjects.filter(subject => {
    const matchesCategory = selectedCategory === 'all' || 
                           subject.name.toLowerCase().includes(selectedCategory.toLowerCase());
    
    return matchesCategory;
  });

  const categories = [
    { value: 'all', label: 'All Subjects' },
    { value: 'web', label: 'Web Development' },
    { value: 'data', label: 'Data Science' },
    { value: 'marketing', label: 'Digital Marketing' },
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchSubjects(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
            {pagination && (
              <p className="mt-4 text-lg opacity-80">
                {pagination.total} subjects available
              </p>
            )}
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
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No subjects found</h3>
            <p className="text-gray-500">
              {searchQuery ? 'Try adjusting your search terms' : 'No subjects available at the moment'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredSubjects.map((subject) => (
                <Card key={subject._id} className="h-full" hover>
                  <div className="p-6">
                    {/* Subject Header */}
                    <div className="flex items-start gap-4 mb-4">
                      {getCategoryIcon(subject.name)}
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {subject.name}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-3">
                          {subject.description}
                        </p>
                      </div>
                    </div>

                    {/* Subject Stats */}
                    <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{getTotalDuration(subject.syllabus)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        <span>{subject.syllabus?.length || 0} topics</span>
                      </div>
                      {subject.materials && subject.materials.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Download className="w-4 h-4" />
                          <span>{subject.materials.length} materials</span>
                        </div>
                      )}
                    </div>

                    {/* Syllabus Preview */}
                    {subject.syllabus && subject.syllabus.length > 0 && (
                      <div className="mb-4">
                        <button
                          onClick={() => setExpandedSubject(
                            expandedSubject === subject._id ? null : subject._id
                          )}
                          className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                        >
                          <span>Syllabus ({subject.syllabus.length} topics)</span>
                          {expandedSubject === subject._id ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>

                        {expandedSubject === subject._id && (
                          <div className="mt-3 space-y-2">
                            {subject.syllabus.slice(0, 5).map((item, index) => (
                              <div key={index} className="flex items-start gap-2 text-sm">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                                <div>
                                  <div className="font-medium text-gray-800">{item.topic}</div>
                                  {item.duration && (
                                    <div className="text-gray-500 text-xs">{item.duration}</div>
                                  )}
                                </div>
                              </div>
                            ))}
                            {subject.syllabus.length > 5 && (
                              <div className="text-xs text-gray-500 pl-4">
                                +{subject.syllabus.length - 5} more topics
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Materials */}
                    {subject.materials && subject.materials.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Materials</h4>
                        <div className="space-y-1">
                          {subject.materials.slice(0, 3).map((material, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                              {material.type === 'video' && <PlayCircle className="w-4 h-4" />}
                              {material.type === 'pdf' && <FileText className="w-4 h-4" />}
                              {material.type === 'link' && <ExternalLink className="w-4 h-4" />}
                              {material.type === 'document' && <FileText className="w-4 h-4" />}
                              <span className="truncate">{material.title}</span>
                            </div>
                          ))}
                          {subject.materials.length > 3 && (
                            <div className="text-xs text-gray-500">
                              +{subject.materials.length - 3} more materials
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    <Link
                      to={`/subjects/${subject._id}`}
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
                    >
                      View Details
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="mt-12 flex justify-center">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === pagination.pages}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Subjects;