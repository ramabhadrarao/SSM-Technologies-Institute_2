import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { useSettings } from '../../hooks/useSettings';

const Footer: React.FC = () => {
  const { generalSettings, loading } = useSettings();

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-blue-900 to-cyan-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <img src="/public/logo.jpeg" alt={generalSettings?.siteName || "SSM Technologies"} className="h-10 w-10 rounded-full" />
              <div>
                <h3 className="text-xl font-bold">{generalSettings?.siteName || "SSM Technologies"}</h3>
                <p className="text-sm text-gray-300">Coaching Institute</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              {generalSettings?.siteDescription || "Empowering students with quality education and professional training. Join us to achieve your career goals with expert guidance and comprehensive courses."}
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <nav className="space-y-2">
              <Link to="/" className="block text-gray-300 hover:text-blue-400 transition-colors text-sm">
                Home
              </Link>
              <Link to="/courses" className="block text-gray-300 hover:text-blue-400 transition-colors text-sm">
                Courses
              </Link>
              <Link to="/about" className="block text-gray-300 hover:text-blue-400 transition-colors text-sm">
                About Us
              </Link>
              <Link to="/contact" className="block text-gray-300 hover:text-blue-400 transition-colors text-sm">
                Contact
              </Link>
              <Link to="/register" className="block text-gray-300 hover:text-blue-400 transition-colors text-sm">
                Register
              </Link>
            </nav>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Our Services</h3>
            <nav className="space-y-2">
              <a href="#" className="block text-gray-300 hover:text-blue-400 transition-colors text-sm">
                Online Classes
              </a>
              <a href="#" className="block text-gray-300 hover:text-blue-400 transition-colors text-sm">
                Live Sessions
              </a>
              <a href="#" className="block text-gray-300 hover:text-blue-400 transition-colors text-sm">
                Study Materials
              </a>
              <a href="#" className="block text-gray-300 hover:text-blue-400 transition-colors text-sm">
                Mock Tests
              </a>
              <a href="#" className="block text-gray-300 hover:text-blue-400 transition-colors text-sm">
                Career Guidance
              </a>
            </nav>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-300 text-sm">
                    {loading ? (
                      <span className="animate-pulse">Loading address...</span>
                    ) : (
                      generalSettings?.address?.split(', ').map((line, index, array) => (
                        <React.Fragment key={index}>
                          {line}
                          {index < array.length - 1 && <br />}
                        </React.Fragment>
                      )) || (
                        <>
                          123 Education Street<br />
                          Knowledge City, KC 12345<br />
                          India
                        </>
                      )
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <p className="text-gray-300 text-sm">
                  {loading ? (
                    <span className="animate-pulse">Loading phone...</span>
                  ) : (
                    generalSettings?.contactPhone || "+91 98765 43210"
                  )}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <p className="text-gray-300 text-sm">
                  {loading ? (
                    <span className="animate-pulse">Loading email...</span>
                  ) : (
                    generalSettings?.contactEmail || "info@ssmtechnologies.co.in"
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © 2025 SSM Technologies. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link to="/privacy" className="text-gray-400 hover:text-blue-400 text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-blue-400 text-sm transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;