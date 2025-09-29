// src/lib/api.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('accessToken');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data || data;
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('accessToken', token);
  }

  removeToken() {
    this.token = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  // ========== AUTH METHODS ==========
  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    whatsapp?: string;
    role: 'student' | 'instructor';
  }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(email: string, password: string) {
    const response = await this.request<{
      user: any;
      accessToken: string;
      refreshToken: string;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.accessToken) {
      this.setToken(response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
    }

    return response;
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.removeToken();
    }
  }

  async getProfile() {
    return this.request('/auth/profile');
  }

  async updateProfile(userData: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    whatsapp?: string;
  }) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async updateInstructorProfile(profileData: {
  bio?: string;
  designation?: string;
  experience?: number;
  specializations?: string[];
  education?: any[];
  certificates?: any[];
  socialLinks?: any;
  skills?: string[];
}, files?: {
  profileImage?: File;
  resume?: File;
  certificates?: File[];
}) {
  const formData = new FormData();
  
  // Append text data
  Object.keys(profileData).forEach(key => {
    const value = (profileData as any)[key];
    if (value !== undefined) {
      if (typeof value === 'object') {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value.toString());
      }
    }
  });
  
  // Append files
  if (files) {
    if (files.profileImage) {
      formData.append('profileImage', files.profileImage);
    }
    if (files.resume) {
      formData.append('resume', files.resume);
    }
    if (files.certificates) {
      files.certificates.forEach((cert, index) => {
        if (cert) {
          formData.append('certificates', cert);
        }
      });
    }
  }
  
  const headers = this.token ? { Authorization: `Bearer ${this.token}` } : {};
  
  return fetch(`${this.baseURL}/auth/instructor-profile`, {
    method: 'PUT',
    headers,
    body: formData,
  }).then(async response => {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.data || data;
  });
}

// Add this helper method for single file uploads
async uploadInstructorFile(file: File, fileType: 'profileImage' | 'resume' | 'certificate') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('fileType', fileType);
  
  const headers = this.token ? { Authorization: `Bearer ${this.token}` } : {};
  
  return fetch(`${this.baseURL}/auth/instructor-file-upload`, {
    method: 'POST',
    headers,
    body: formData,
  }).then(async response => {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(errorData.message || `Upload error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.data || data;
  });
}

  async changePassword(passwordData: {
    currentPassword: string;
    newPassword: string;
  }) {
    return this.request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(passwordData),
    });
  }

  async forgotPassword(email: string) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async validateResetToken(token: string) {
    return this.request(`/auth/validate-reset-token/${token}`, {
      method: 'GET',
    });
  }

  async resetPassword(token: string, newPassword: string) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  }

  async refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.request<{
      accessToken: string;
      refreshToken: string;
    }>('/auth/refresh-token', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });

    if (response.accessToken) {
      this.setToken(response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
    }

    return response;
  }
// Add these methods to src/lib/api.ts in the ApiClient class

// ========== SKILLS METHODS ==========
async getSkills(params?: {
  category?: string;
  search?: string;
}) {
  const queryParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryParams.append(key, value.toString());
      }
    });
  }
  
  const endpoint = `/skills${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return this.request(endpoint);
}

async getSkillsByCategory() {
  return this.request('/skills/by-category');
}

async createSkill(skillData: {
  name: string;
  description?: string;
  category: string;
  level?: string;
}) {
  return this.request('/skills', {
    method: 'POST',
    body: JSON.stringify(skillData),
  });
}

async updateSkill(id: string, skillData: {
  name?: string;
  description?: string;
  category?: string;
  level?: string;
  isActive?: boolean;
}) {
  return this.request(`/skills/${id}`, {
    method: 'PUT',
    body: JSON.stringify(skillData),
  });
}

async deleteSkill(id: string) {
  return this.request(`/skills/${id}`, {
    method: 'DELETE',
  });
}
  // ========== DASHBOARD METHODS ==========
  async getAdminDashboard() {
    return this.request('/dashboard/admin');
  }

  async getStudentDashboard() {
    return this.request('/dashboard/student');
  }

  async getInstructorDashboard() {
    return this.request('/dashboard/instructor');
  }

  // ========== COURSE METHODS ==========
  async getCourses(params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    minFees?: number;
    maxFees?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/courses${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request(endpoint);
  }

  async getCourse(id: string) {
    return this.request(`/courses/${id}`);
  }

  async createCourse(courseData: FormData) {
    const headers = this.token ? { Authorization: `Bearer ${this.token}` } : {};

    return fetch(`${this.baseURL}/courses`, {
      method: 'POST',
      headers,
      body: courseData,
    }).then(async response => {
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Network error' }));
        
        // Handle instructor approval restriction errors
        if (response.status === 403 && errorData.message?.includes('pending approval')) {
          throw new Error('Your instructor account is pending approval. Please wait for admin approval to create courses.');
        }
        
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.data || data;
    });
  }

  async updateCourse(id: string, courseData: FormData) {
    const headers = this.token ? { Authorization: `Bearer ${this.token}` } : {};

    return fetch(`${this.baseURL}/courses/${id}`, {
      method: 'PUT',
      headers,
      body: courseData,
    }).then(async response => {
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Network error' }));
        
        // Handle instructor approval restriction errors
        if (response.status === 403 && errorData.message?.includes('pending approval')) {
          throw new Error('Your instructor account is pending approval. Please wait for admin approval to update courses.');
        }
        
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.data || data;
    });
  }

  async deleteCourse(id: string) {
    return this.request(`/courses/${id}`, {
      method: 'DELETE',
    });
  }

  async addCourseReview(courseId: string, reviewData: {
    rating: number;
    comment?: string;
  }) {
    return this.request(`/courses/${courseId}/review`, {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  }

  // ========== SUBJECT METHODS ==========
  async getSubjects(params?: {
    page?: number;
    limit?: number;
    search?: string;
    course?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/subjects${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request(endpoint);
  }

  async getSubject(id: string) {
    return this.request(`/subjects/${id}`);
  }

  async createSubject(subjectData: FormData) {
    const headers = this.token ? { Authorization: `Bearer ${this.token}` } : {};

    return fetch(`${this.baseURL}/subjects`, {
      method: 'POST',
      headers,
      body: subjectData,
    }).then(async response => {
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Network error' }));
        
        // Handle instructor approval restriction errors
        if (response.status === 403 && errorData.message?.includes('pending approval')) {
          throw new Error('Your instructor account is pending approval. Please wait for admin approval to create subjects.');
        }
        
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.data || data;
    });
  }

  async updateSubject(id: string, subjectData: FormData) {
    const headers = this.token ? { Authorization: `Bearer ${this.token}` } : {};

    return fetch(`${this.baseURL}/subjects/${id}`, {
      method: 'PUT',
      headers,
      body: subjectData,
    }).then(async response => {
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Network error' }));
        
        // Handle instructor approval restriction errors
        if (response.status === 403 && errorData.message?.includes('pending approval')) {
          throw new Error('Your instructor account is pending approval. Please wait for admin approval to update subjects.');
        }
        
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.data || data;
    });
  }

  async deleteSubject(id: string) {
    return this.request(`/subjects/${id}`, {
      method: 'DELETE',
    });
  }

  // ========== USER MANAGEMENT METHODS (Admin) ==========
  async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/admin/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request(endpoint);
  }

  async getUser(id: string) {
    return this.request(`/admin/users/${id}`);
  }

  async createUser(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    whatsapp?: string;
    role: 'admin' | 'student' | 'instructor';
  }) {
    return this.request('/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id: string, userData: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    whatsapp?: string;
    role?: 'admin' | 'student' | 'instructor';
    isActive?: boolean;
  }) {
    return this.request(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id: string) {
    return this.request(`/admin/users/${id}`, {
      method: 'DELETE',
    });
  }

  async toggleUserStatus(id: string) {
    return this.request(`/admin/users/${id}/toggle-status`, {
      method: 'PATCH',
    });
  }

  async bulkUpdateUsers(userIds: string[], action: 'activate' | 'deactivate' | 'delete', data?: any) {
    return this.request('/admin/users/bulk-update', {
      method: 'PATCH',
      body: JSON.stringify({ userIds, action, data }),
    });
  }

  async getUserStats() {
    return this.request('/admin/users/stats');
  }

  // ========== ADMIN COURSE MANAGEMENT ==========
  async getAdminCourses(params?: {
    page?: number;
    limit?: number;
    search?: string;
    instructor?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    return this.request(`/admin/courses${queryParams.toString() ? `?${queryParams.toString()}` : ''}`);
  }

  async getAdminCourse(id: string) {
    return this.request(`/admin/courses/${id}`);
  }

  async createAdminCourse(courseData: FormData) {
    const headers = this.token ? { Authorization: `Bearer ${this.token}` } : {};
    
    return fetch(`${this.baseURL}/admin/courses`, {
      method: 'POST',
      headers,
      body: courseData,
    }).then(async response => {
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Network error' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.data || data;
    });
  }

  async updateAdminCourse(id: string, courseData: FormData) {
    const headers = this.token ? { Authorization: `Bearer ${this.token}` } : {};
    
    return fetch(`${this.baseURL}/admin/courses/${id}`, {
      method: 'PUT',
      headers,
      body: courseData,
    }).then(async response => {
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Network error' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.data || data;
    });
  }

  async deleteAdminCourse(id: string, hard = false) {
    return this.request(`/admin/courses/${id}?hard=${hard}`, {
      method: 'DELETE',
    });
  }

  async bulkUpdateCourses(courseIds: string[], action: string, data?: any) {
    return this.request('/admin/courses/bulk-update', {
      method: 'PATCH',
      body: JSON.stringify({ courseIds, action, data }),
    });
  }

  async getCourseStats() {
    return this.request('/admin/courses/stats');
  }

  async getAvailableInstructors() {
    return this.request('/admin/courses/instructors');
  }

  // ========== ADMIN BATCH MANAGEMENT ==========
  async getAdminBatches(params?: {
    page?: number;
    limit?: number;
    search?: string;
    course?: string;
    instructor?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    return this.request(`/admin/batches${queryParams.toString() ? `?${queryParams.toString()}` : ''}`);
  }

  async getAdminBatch(id: string) {
    return this.request(`/admin/batches/${id}`);
  }

  async createAdminBatch(batchData: {
    name: string;
    course: string;
    instructor: string;
    maxStudents: number;
    startDate: string;
    endDate: string;
    schedule: Array<{
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      subject?: string;
    }>;
    isActive?: boolean;
  }) {
    return this.request('/admin/batches', {
      method: 'POST',
      body: JSON.stringify(batchData),
    });
  }

  async updateAdminBatch(id: string, batchData: any) {
    return this.request(`/admin/batches/${id}`, {
      method: 'PUT',
      body: JSON.stringify(batchData),
    });
  }

  async deleteAdminBatch(id: string, hard = false) {
    return this.request(`/admin/batches/${id}?hard=${hard}`, {
      method: 'DELETE',
    });
  }

  async addStudentsToBatch(batchId: string, studentIds: string[]) {
    return this.request(`/admin/batches/${batchId}/students`, {
      method: 'POST',
      body: JSON.stringify({ studentIds }),
    });
  }

  async removeStudentFromBatch(batchId: string, studentId: string) {
    return this.request(`/admin/batches/${batchId}/students/${studentId}`, {
      method: 'DELETE',
    });
  }

  async getBatchStats() {
    return this.request('/admin/batches/stats');
  }

  async scheduleClass(batchId: string, classData: {
    date: string;
    startTime: string;
    endTime: string;
    subject?: string;
    meetingLink?: string;
  }) {
    return this.request(`/admin/batches/${batchId}/classes`, {
      method: 'POST',
      body: JSON.stringify(classData),
    });
  }

  async updateClassAttendance(batchId: string, classId: string, attendance: any[]) {
    return this.request(`/admin/batches/${batchId}/classes/${classId}/attendance`, {
      method: 'PUT',
      body: JSON.stringify({ attendance }),
    });
  }

  // ========== ADMIN SUBJECT MANAGEMENT ==========
  async getAdminSubjects(params?: {
    page?: number;
    limit?: number;
    search?: string;
    course?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    return this.request(`/admin/subjects${queryParams.toString() ? `?${queryParams.toString()}` : ''}`);
  }

  async getAdminSubject(id: string) {
    return this.request(`/admin/subjects/${id}`);
  }

  async createAdminSubject(subjectData: FormData) {
    const headers = this.token ? { Authorization: `Bearer ${this.token}` } : {};
    
    return fetch(`${this.baseURL}/admin/subjects`, {
      method: 'POST',
      headers,
      body: subjectData,
    }).then(async response => {
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Network error' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.data || data;
    });
  }

  async updateAdminSubject(id: string, subjectData: FormData) {
    const headers = this.token ? { Authorization: `Bearer ${this.token}` } : {};
    
    return fetch(`${this.baseURL}/admin/subjects/${id}`, {
      method: 'PUT',
      headers,
      body: subjectData,
    }).then(async response => {
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Network error' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.data || data;
    });
  }

  async deleteAdminSubject(id: string, hard = false) {
    return this.request(`/admin/subjects/${id}?hard=${hard}`, {
      method: 'DELETE',
    });
  }

  async bulkUpdateSubjects(subjectIds: string[], action: string, data?: any) {
    return this.request('/admin/subjects/bulk-update', {
      method: 'PATCH',
      body: JSON.stringify({ subjectIds, action, data }),
    });
  }

  async getSubjectStats() {
    return this.request('/admin/subjects/stats');
  }

  async addSubjectMaterial(subjectId: string, materialData: FormData) {
    const headers = this.token ? { Authorization: `Bearer ${this.token}` } : {};
    
    return fetch(`${this.baseURL}/admin/subjects/${subjectId}/materials`, {
      method: 'POST',
      headers,
      body: materialData,
    }).then(async response => {
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Network error' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.data || data;
    });
  }

  async removeSubjectMaterial(subjectId: string, materialId: string) {
    return this.request(`/admin/subjects/${subjectId}/materials/${materialId}`, {
      method: 'DELETE',
    });
  }

  // ========== CONTACT MESSAGES MANAGEMENT ==========
  async getContactMessages(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    priority?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    return this.request(`/admin/messages${queryParams.toString() ? `?${queryParams.toString()}` : ''}`);
  }

  async getContactMessage(id: string) {
    return this.request(`/admin/messages/${id}`);
  }

  async updateMessageStatus(id: string, status: 'new' | 'read' | 'replied' | 'closed') {
    return this.request(`/admin/messages/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async updateMessagePriority(id: string, priority: 'low' | 'medium' | 'high' | 'urgent') {
    return this.request(`/admin/messages/${id}/priority`, {
      method: 'PATCH',
      body: JSON.stringify({ priority }),
    });
  }

  async replyToMessage(id: string, replyMessage: string) {
    return this.request(`/admin/messages/${id}/reply`, {
      method: 'POST',
      body: JSON.stringify({ replyMessage }),
    });
  }

  async deleteContactMessage(id: string) {
    return this.request(`/admin/messages/${id}`, {
      method: 'DELETE',
    });
  }

  async bulkUpdateMessages(messageIds: string[], action: string, data?: any) {
    return this.request('/admin/messages/bulk-update', {
      method: 'PATCH',
      body: JSON.stringify({ messageIds, action, data }),
    });
  }

  async getContactStats() {
    return this.request('/admin/messages/stats');
  }

  // ========== PUBLIC CONTACT FORM ==========
  async createContactMessage(messageData: {
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
    captchaToken: string;
    formStartTime: string;
    website?: string;
    url?: string;
    link?: string;
    agreeToTerms?: boolean;
  }) {
    return this.request('/contact', {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  }

  // ========== ANALYTICS & REPORTS ==========
  async getDashboardAnalytics(params?: {
    startDate?: string;
    endDate?: string;
    period?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    return this.request(`/admin/analytics/dashboard${queryParams.toString() ? `?${queryParams.toString()}` : ''}`);
  }

  async getUserAnalytics(params?: {
    period?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    return this.request(`/admin/analytics/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`);
  }

  async getCourseAnalytics(params?: any) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    return this.request(`/admin/analytics/courses${queryParams.toString() ? `?${queryParams.toString()}` : ''}`);
  }

  async getFinancialAnalytics(params?: any) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    return this.request(`/admin/analytics/financial${queryParams.toString() ? `?${queryParams.toString()}` : ''}`);
  }

  async getInstructorAnalytics() {
    return this.request('/admin/analytics/instructors');
  }

  async getStudentAnalytics() {
    return this.request('/admin/analytics/students');
  }

  async generateCustomReport(reportData: {
    reportType: 'enrollment' | 'revenue' | 'performance' | 'attendance';
    startDate: string;
    endDate: string;
    filters?: any;
    groupBy?: string;
    metrics?: string[];
  }) {
    return this.request('/admin/reports/generate', {
      method: 'POST',
      body: JSON.stringify(reportData),
    });
  }

  // ========== SYSTEM SETTINGS ==========
  async getSystemSettings() {
    return this.request('/admin/settings');
  }

  async getSettingCategory(category: string) {
    return this.request(`/admin/settings/${category}`);
  }

  async updateSystemSettings(category: string, settings: any) {
    return this.request('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify({ category, settings }),
    });
  }

  async resetSettings(category?: string) {
    return this.request('/admin/settings/reset', {
      method: 'POST',
      body: JSON.stringify({ category }),
    });
  }

  async getSystemInfo() {
    return this.request('/admin/system/info');
  }

  async backupSystem() {
    return this.request('/admin/system/backup', {
      method: 'POST',
    });
  }

  async testEmailConfig(testEmail: string) {
    return this.request('/admin/system/test-email', {
      method: 'POST',
      body: JSON.stringify({ testEmail }),
    });
  }

  async getMaintenanceMode() {
    return this.request('/admin/system/maintenance');
  }

  async toggleMaintenanceMode(enabled: boolean, message?: string, allowedIPs?: string[]) {
    return this.request('/admin/system/maintenance', {
      method: 'POST',
      body: JSON.stringify({ enabled, message, allowedIPs }),
    });
  }

  // ========== ENROLLMENT METHODS ==========
  async enrollInCourse(courseId: string) {
    return this.request(`/enrollments/${courseId}`, {
      method: 'POST',
    });
  }

  async getMyEnrollments() {
    return this.request('/enrollments/my');
  }

  async updateEnrollmentProgress(enrollmentId: string, progress: number) {
    return this.request(`/enrollments/${enrollmentId}/progress`, {
      method: 'PUT',
      body: JSON.stringify({ progress }),
    });
  }

  // ========== FILE UPLOAD METHODS ==========
  async uploadFile(file: File, type: 'profile' | 'course' | 'subject' | 'certificate' | 'resume') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const headers = this.token ? { Authorization: `Bearer ${this.token}` } : {};

    return fetch(`${this.baseURL}/upload`, {
      method: 'POST',
      headers,
      body: formData,
    }).then(async response => {
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Upload failed' }));
        throw new Error(errorData.message || `Upload error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.data || data;
    });
  }

  // ========== SEARCH METHODS ==========
  async globalSearch(query: string, filters?: {
    type?: 'courses' | 'subjects' | 'users' | 'all';
    limit?: number;
  }) {
    const queryParams = new URLSearchParams();
    queryParams.append('q', query);
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/search?${queryParams.toString()}`;
    return this.request(endpoint);
  }

  // ========== NOTIFICATION METHODS ==========
  async getNotifications(params?: {
    page?: number;
    limit?: number;
    read?: boolean;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/notifications${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request(endpoint);
  }

  async markNotificationAsRead(notificationId: string) {
    return this.request(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  }

  async markAllNotificationsAsRead() {
    return this.request('/notifications/read-all', {
      method: 'PUT',
    });
  }

  // ========== TEAM MANAGEMENT METHODS ==========
  async getTeamMembers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    department?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }
    return this.request(`/admin/team?${queryParams.toString()}`);
  }

  async getTeamMember(id: string) {
    return this.request(`/admin/team/${id}`);
  }

  async createTeamMember(teamData: FormData) {
    const headers = this.token ? { Authorization: `Bearer ${this.token}` } : {};
    
    return fetch(`${this.baseURL}/admin/team`, {
      method: 'POST',
      headers,
      body: teamData,
    }).then(async response => {
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Network error' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.data || data;
    });
  }

  async updateTeamMember(id: string, teamData: FormData) {
    const headers = this.token ? { Authorization: `Bearer ${this.token}` } : {};
    
    return fetch(`${this.baseURL}/admin/team/${id}`, {
      method: 'PUT',
      headers,
      body: teamData,
    }).then(async response => {
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Network error' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.data || data;
    });
  }

  async deleteTeamMember(id: string) {
    return this.request(`/admin/team/${id}`, {
      method: 'DELETE',
    });
  }

  async bulkDeleteTeamMembers(memberIds: string[]) {
    return this.request('/admin/team', {
      method: 'DELETE',
      body: JSON.stringify({ ids: memberIds }),
    });
  }

  async getPublicTeamMembers() {
    return this.request('/team');
  }

  // ========== UTILITY METHODS ==========
  async healthCheck() {
    return fetch(`${this.baseURL.replace('/api', '')}/health`)
      .then(res => res.json())
      .catch(() => ({ success: false, message: 'Health check failed' }));
  }

  // ========== HELPER METHODS ==========
  isAuthenticated(): boolean {
    return !!this.token;
  }

  getToken(): string | null {
    return this.token;
  }

  getApiBaseUrl(): string {
    return this.baseURL;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export class for testing or multiple instances if needed
export { ApiClient };