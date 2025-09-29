// src/types/index.ts
export interface User {
  _id: string;
  email: string;
  role: 'admin' | 'student' | 'instructor';
  firstName?: string;
  lastName?: string;
  phone?: string;
  whatsapp?: string;
  profileImageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  _id: string;
  name: string;
  description: string;
  imageUrl?: string;
  videoUrl?: string;
  fees: number;
  duration: string;
  structure: string[];
  subjects: string[];
  instructor?: string;
  isActive: boolean;
  enrollmentCount: number;
  rating: number;
  reviews: Review[];
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  student: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface Subject {
  _id: string;
  name: string;
  description: string;
  imageUrl?: string;
  course?: string;
  syllabus: {
    topic: string;
    duration?: string;
    description?: string;
  }[];
  materials: {
    title: string;
    type: 'pdf' | 'video' | 'link' | 'document';
    url: string;
    uploadedAt: string;
  }[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Instructor {
  _id: string;
  user: string;
  bio: string;
  designation: string;
  imageUrl?: string;
  resumeUrl?: string;
  certificates: {
    name: string;
    url: string;
    issuedBy: string;
    issuedDate: string;
    uploadedAt: string;
  }[];
  skills: string[];
  experience: number;
  specializations: string[];
  education: {
    degree: string;
    institution: string;
    year: number;
    grade?: string;
  }[];
  socialLinks: {
    linkedin?: string;
    github?: string;
    website?: string;
    twitter?: string;
  };
  rating: number;
  totalStudents: number;
  isApproved: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Student {
  _id: string;
  user: string;
  enrolledCourses: {
    course: string;
    enrolledAt: string;
    progress: number;
    completedSubjects: string[];
    status: 'active' | 'completed' | 'suspended' | 'dropped';
  }[];
  batches: string[];
  attendance: {
    batch: string;
    date: string;
    status: 'present' | 'absent' | 'late';
    classId: string;
  }[];
  assignments: {
    title: string;
    subject: string;
    submittedAt?: string;
    fileUrl?: string;
    grade?: number;
    feedback?: string;
  }[];
  performance: {
    overallGrade: number;
    attendancePercentage: number;
    assignmentCompletion: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Batch {
  _id: string;
  name: string;
  course: string;
  instructor: string;
  schedule: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    subject?: string;
  }[];
  classes: {
    date: string;
    startTime: string;
    endTime: string;
    subject?: string;
    meetingLink?: string;
    recordingUrl?: string;
    status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
    attendance: {
      student: string;
      status: 'present' | 'absent' | 'late';
      joinTime?: string;
      leaveTime?: string;
    }[];
  }[];
  maxStudents: number;
  enrolledStudents: {
    student: string;
    enrolledAt: string;
    status: 'active' | 'inactive' | 'completed';
  }[];
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Slider {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  buttonText?: string;
  buttonLink?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AboutMember {
  _id: string;
  name: string;
  designation: string;
  bio: string;
  imageUrl?: string;
  socialLinks: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Skill {
  _id: string;
  name: string;
  description: string;
  category: 'programming' | 'design' | 'marketing' | 'business' | 'data-science' | 'other';
  level: 'beginner' | 'intermediate' | 'advanced';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'closed';
  reply?: {
    message: string;
    repliedBy: string;
    repliedAt: string;
  };
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  updatedAt: string;
}