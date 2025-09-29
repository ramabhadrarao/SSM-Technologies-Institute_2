import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Code, Wrench, Clock } from 'lucide-react';

const UnderDevelopment: React.FC = () => {
  // Add a console log to debug if the component is rendering
  useEffect(() => {
    console.log('UnderDevelopment component mounted');
    document.title = 'Under Development - SSM Technologies Institute';
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Simplified Icon Section */}
        <div className="mb-8">
          <div className="bg-white rounded-full p-8 shadow-2xl border border-gray-100 inline-block">
            <div className="flex items-center justify-center space-x-4">
              <Code className="h-12 w-12 text-blue-600" />
              <Wrench className="h-10 w-10 text-indigo-600" />
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Under Development
          </h1>
          
          <div className="space-y-4">
            <p className="text-xl text-gray-600 leading-relaxed">
              We're working hard to bring you something amazing!
            </p>
            <p className="text-lg text-gray-500">
              This page is currently under construction. Our development team is crafting 
              an exceptional experience for you.
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full max-w-md mx-auto mt-8">
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>Progress</span>
              <span>75%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full" 
                   style={{ width: '75%' }}></div>
            </div>
          </div>

          {/* Features Coming Soon */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Coming Soon</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600">Enhanced User Interface</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                <span className="text-gray-600">Advanced Features</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-gray-600">Better Performance</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                <span className="text-gray-600">Mobile Optimization</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-lg"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
            
            <Link
              to="/courses"
              className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-medium rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition-colors duration-200"
            >
              View Courses
            </Link>
            
            <Link
              to="/contact"
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-200"
            >
              Contact Us
            </Link>
          </div>

          {/* Footer Message */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-400">
              Thank you for your patience. We'll be back soon with exciting updates!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnderDevelopment;