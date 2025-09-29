// src/components/Home/HeroSlider.tsx
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

// For now, using static data since slider API is not implemented yet
const staticSlides = [
  {
    id: 1,
    title: 'Welcome to SSM Technologies',
    description: 'Excellence in Education, Innovation in Learning',
    buttonText: 'Explore Courses',
    buttonLink: '/courses',
    imageUrl: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg'
  },
  {
    id: 2,
    title: 'Master Modern Technologies',
    description: 'Learn cutting-edge skills from industry experts',
    buttonText: 'Start Learning',
    buttonLink: '/register',
    imageUrl: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg'
  },
  {
    id: 3,
    title: 'Build Your Career',
    description: 'Transform your future with our comprehensive courses',
    buttonText: 'Join Now',
    buttonLink: '/register',
    imageUrl: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg'
  }
];

const HeroSlider: React.FC = () => {
  const [slides] = useState(staticSlides);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (slides.length > 1) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="relative h-96 md:h-[500px] overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
            index === currentSlide ? 'translate-x-0' : 
            index < currentSlide ? '-translate-x-full' : 'translate-x-full'
          }`}
        >
          <div
            className="w-full h-full bg-gradient-to-r from-blue-600/80 to-cyan-600/80 bg-cover bg-center relative"
            style={{ 
              backgroundImage: slide.imageUrl ? 
                `linear-gradient(rgba(59, 130, 246, 0.8), rgba(8, 145, 178, 0.8)), url(${slide.imageUrl})` : 
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