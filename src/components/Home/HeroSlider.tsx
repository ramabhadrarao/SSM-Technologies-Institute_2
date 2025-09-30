// src/components/Home/HeroSlider.tsx
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../lib/api';

interface Slide {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  buttonText: string;
  buttonLink: string;
  order: number;
  isActive: boolean;
  isDefault: boolean;
}

// Fallback static slides in case API fails or no slides are available
const fallbackSlides = [
  {
    _id: 'fallback-1',
    title: 'Welcome to SSM Technologies',
    description: 'Excellence in Education, Innovation in Learning',
    buttonText: 'Explore Courses',
    buttonLink: '/courses',
    imageUrl: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg',
    order: 0,
    isActive: true,
    isDefault: true
  },
  {
    _id: 'fallback-2',
    title: 'Master Modern Technologies',
    description: 'Learn cutting-edge skills from industry experts',
    buttonText: 'Start Learning',
    buttonLink: '/register',
    imageUrl: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg',
    order: 1,
    isActive: true,
    isDefault: false
  },
  {
    _id: 'fallback-3',
    title: 'Build Your Career',
    description: 'Transform your future with our comprehensive courses',
    buttonText: 'Join Now',
    buttonLink: '/register',
    imageUrl: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg',
    order: 2,
    isActive: true,
    isDefault: false
  }
];

const HeroSlider: React.FC = () => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/sliders/active');
      
      if (response && response.length > 0) {
        // Sort slides by order
        const sortedSlides = response.sort((a: Slide, b: Slide) => a.order - b.order);
        setSlides(sortedSlides);
        
        // Set current slide to default slide if available, otherwise first slide
        const defaultSlideIndex = sortedSlides.findIndex((slide: Slide) => slide.isDefault);
        setCurrentSlide(defaultSlideIndex >= 0 ? defaultSlideIndex : 0);
      } else {
        // Use fallback slides if no slides are available
        setSlides(fallbackSlides);
        setCurrentSlide(0);
      }
    } catch (error) {
      console.error('Error fetching slides:', error);
      // Use fallback slides on error
      setSlides(fallbackSlides);
      setCurrentSlide(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slides.length > 1 && !loading) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [slides.length, loading]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const getImageUrl = (imageUrl: string) => {
    // If it's already a full URL (fallback slides), return as is
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    // Otherwise, prepend the server URL
    return `http://localhost:3001${imageUrl}`;
  };

  if (loading) {
    return (
      <div className="relative h-96 md:h-[500px] overflow-hidden bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading slides...</p>
        </div>
      </div>
    );
  }

  if (slides.length === 0) {
    return (
      <div className="relative h-96 md:h-[500px] overflow-hidden bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center">
        <div className="max-w-4xl mx-auto text-center text-white px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Welcome to SSM Technologies
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Excellence in Education, Innovation in Learning
          </p>
          <Link
            to="/courses"
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Explore Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-96 md:h-[500px] overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={slide._id}
          className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
            index === currentSlide ? 'translate-x-0' : 
            index < currentSlide ? '-translate-x-full' : 'translate-x-full'
          }`}
        >
          <div
            className="w-full h-full bg-gradient-to-r from-blue-600/80 to-cyan-600/80 bg-cover bg-center relative"
            style={{ 
              backgroundImage: slide.imageUrl ? 
                `linear-gradient(rgba(59, 130, 246, 0.8), rgba(8, 145, 178, 0.8)), url(${getImageUrl(slide.imageUrl)})` : 
                'linear-gradient(135deg, #3B82F6, #06B6D4)'
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="max-w-4xl mx-auto text-center text-white px-4">
                <h1 className="text-4xl md:text-6xl font-bold mb-6">
                  {slide.title}
                </h1>
                <p className="text-xl md:text-2xl mb-8 opacity-90">
                  {slide.description}
                </p>
                <Link
                  to={slide.buttonLink}
                  className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  {slide.buttonText || 'Learn More'}
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentSlide ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default HeroSlider;