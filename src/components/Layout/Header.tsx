import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, Home, BookOpen, Users, Phone, FileText } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Error signing out');
    }
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'admin':
        return '/admin/dashboard';
      case 'instructor':
        return '/instructor/dashboard';
      case 'student':
        return '/student/dashboard';
      default:
        return '/';
    }
  };

  const navigationItems = [
    { path: '/', label: 'Home', icon: <Home className="w-4 h-4 mr-1" /> },
    { path: '/courses', label: 'Courses', icon: <BookOpen className="w-4 h-4 mr-1" /> },
    { path: '/subjects', label: 'Subjects', icon: <FileText className="w-4 h-4 mr-1" /> },
    { path: '/about', label: 'About', icon: <Users className="w-4 h-4 mr-1" /> },
    { path: '/contact', label: 'Contact', icon: <Phone className="w-4 h-4 mr-1" /> },
  ];

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <img src="/logo.jpeg" alt="SSM Technologies" className="h-10 w-10 rounded-full" />
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  SSM Technologies
                </h1>
                <p className="text-xs text-gray-500">Coaching Institute</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center"
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <Link
                  to={getDashboardLink()}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 flex items-center"
                >
                  <User className="w-4 h-4 mr-1" />
                  Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-gray-700 hover:text-red-600 p-2 rounded-md transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Login
                </Link>
                <Link to="/register" className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-cyan-700 transition-all duration-200">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-blue-600 p-2 rounded-md transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium transition-colors flex items-center"
                onClick={() => setIsOpen(false)}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link
                  to={getDashboardLink()}
                  className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium transition-colors flex items-center"
                  onClick={() => setIsOpen(false)}
                >
                  <User className="w-4 h-4 mr-1" />
                  Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-red-600 hover:text-red-700 block px-3 py-2 rounded-md text-base font-medium transition-colors w-full text-left flex items-center"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;