import React from 'react';
import { Users, Star, Award, Mail, CheckCircle } from 'lucide-react';
import Card from '../UI/Card';

interface InstructorProps {
  instructor: {
    _id: string;
    user: {
      firstName: string;
      lastName: string;
      email?: string;
    };
    bio: string;
    designation: string;
    experience: number;
    rating?: number;
    totalStudents?: number;
    imageUrl?: string;
    isApproved?: boolean;
  };
}

const InstructorCard: React.FC<InstructorProps> = ({ instructor }) => {
  return (
    <Card className="p-6">
      <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6">
        {/* Instructor Avatar */}
        <div className="flex-shrink-0">
          {instructor.imageUrl ? (
            <img
              src={instructor.imageUrl}
              alt={`${instructor.user.firstName} ${instructor.user.lastName}`}
              className="w-24 h-24 rounded-full object-cover border-4 border-blue-100"
            />
          ) : (
            <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {instructor.user.firstName[0]}{instructor.user.lastName[0]}
              </span>
            </div>
          )}
        </div>
        
        {/* Instructor Details */}
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900">
            {instructor.user.firstName} {instructor.user.lastName}
          </h3>
          <p className="text-blue-600 font-medium mb-2">{instructor.designation}</p>
          
          {/* Instructor Stats */}
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <Award className="w-4 h-4 mr-1 text-gray-400" />
              <span>{instructor.experience} years experience</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Users className="w-4 h-4 mr-1 text-gray-400" />
              <span>{instructor.totalStudents || 0} students taught</span>
            </div>
            {instructor.rating && instructor.rating > 0 && (
              <div className="flex items-center text-sm text-gray-600">
                <Star className="w-4 h-4 mr-1 text-yellow-500 fill-current" />
                <span>{instructor.rating.toFixed(1)} instructor rating</span>
              </div>
            )}
            {instructor.user.email && (
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="w-4 h-4 mr-1 text-gray-400" />
                <span>{instructor.user.email}</span>
              </div>
            )}
          </div>
          
          {/* Bio */}
          <div className="text-gray-600 text-sm leading-relaxed">
            <p>{instructor.bio}</p>
          </div>
          
          {/* Badges */}
          <div className="flex flex-wrap gap-2 mt-4">
            {instructor.isApproved && (
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                Verified Instructor
              </div>
            )}
            {instructor.experience >= 5 && (
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                <Award className="w-3 h-3 mr-1" />
                Senior Instructor
              </div>
            )}
            {instructor.totalStudents && instructor.totalStudents >= 100 && (
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                <Users className="w-3 h-3 mr-1" />
                Popular Instructor
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default InstructorCard;