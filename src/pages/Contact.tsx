// src/pages/Contact.tsx - With Alternative CAPTCHA
import React, { useState, useRef, useEffect } from 'react';
import { Mail, Phone, MapPin, Send, Shield, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { apiClient } from '../lib/api';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import AlternativeCaptcha, { AlternativeCaptchaRef } from '../components/UI/AlternativeCaptcha';
import toast from 'react-hot-toast';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    website: '',
    url: '',
    link: '',
    agreeToTerms: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [captchaAnswer, setCaptchaAnswer] = useState<string>('');
  const [formStartTime] = useState(Date.now());
  const [isFormValid, setIsFormValid] = useState(false);
  const [charCounts, setCharCounts] = useState({ subject: 0, message: 0 });
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [interactionCount, setInteractionCount] = useState(0);
  
  // CAPTCHA type selector
  const [captchaType, setCaptchaType] = useState<'math' | 'slider' | 'puzzle' | 'text' | 'time'>('math');

  const captchaRef = useRef<AlternativeCaptchaRef>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    validateForm();
  }, [formData, captchaVerified]);

  const validationPatterns = {
    name: {
      pattern: /^[a-zA-Z\s'-]{2,50}$/,
      message: 'Name must be 2-50 characters and contain only letters'
    },
    email: {
      pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      message: 'Please enter a valid email address'
    },
    phone: {
      pattern: /^[+]?[\d\s\-()]{10,}$/,
      message: 'Please enter a valid phone number'
    },
    subject: {
      pattern: /^[a-zA-Z0-9\s\-,.'!?()]{5,200}$/,
      message: 'Subject must be 5-200 characters'
    },
    message: {
      pattern: /^[\s\S]{20,2000}$/,
      message: 'Message must be 20-2000 characters'
    }
  };

  const spamKeywords = [
    'viagra', 'casino', 'lottery', 'winner', 'click here',
    'free money', 'cryptocurrency', 'bitcoin', 'seo services'
  ];

  const validateField = (name: string, value: string): string => {
    if (!value.trim()) {
      return `${name.charAt(0).toUpperCase() + name.slice(1)} is required`;
    }

    const pattern = validationPatterns[name as keyof typeof validationPatterns];
    if (pattern && !pattern.pattern.test(value)) {
      return pattern.message;
    }

    const lowerValue = value.toLowerCase();
    const hasSpam = spamKeywords.some(keyword => lowerValue.includes(keyword));
    if (hasSpam && (name === 'subject' || name === 'message')) {
      return 'Your message contains suspicious content';
    }

    const specialCharCount = (value.match(/[^a-zA-Z0-9\s]/g) || []).length;
    if (specialCharCount > value.length * 0.3) {
      return 'Too many special characters detected';
    }

    const urlPattern = /(https?:\/\/|www\.)/gi;
    const urlCount = (value.match(urlPattern) || []).length;
    if (name === 'message' && urlCount > 2) {
      return 'Maximum 2 URLs allowed';
    }

    return '';
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    Object.keys(validationPatterns).forEach(field => {
      const error = validateField(field, formData[field as keyof typeof formData] as string);
      if (error) {
        newErrors[field] = error;
      }
    });

    if (formData.website || formData.url || formData.link) {
      newErrors.bot = 'Bot detection triggered';
    }

    if (!captchaVerified) {
      newErrors.captcha = 'Please complete the verification challenge';
    }

    if (!formData.agreeToTerms) {
      newErrors.terms = 'You must agree to the terms';
    }

    setErrors(newErrors);
    setIsFormValid(Object.keys(newErrors).length === 0);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const fieldValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    setInteractionCount(prev => prev + 1);

    setFormData(prev => ({
      ...prev,
      [name]: fieldValue
    }));

    if (name === 'subject' || name === 'message') {
      setCharCounts(prev => ({
        ...prev,
        [name]: value.length
      }));
    }

    if (value && name !== 'agreeToTerms') {
      const error = validateField(name, value as string);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  const handleCaptchaVerify = (isValid: boolean, answer?: string) => {
    setCaptchaVerified(isValid);
    if (answer) {
      setCaptchaAnswer(answer);
    }
    
    if (isValid) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.captcha;
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    validateForm();
    if (!isFormValid) {
      toast.error('Please fix all errors before submitting');
      return;
    }

    const formFillTime = Date.now() - formStartTime;
    if (formFillTime < 5000) {
      toast.error('Please take your time to fill out the form');
      return;
    }

    if (formData.website || formData.url || formData.link) {
      console.log('Bot detected');
      setShowSuccessMessage(true);
      return;
    }

    setLoading(true);

    try {
      const submissionData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
        captchaToken: `alternative-captcha-${captchaType}-${captchaAnswer || 'verified'}`,
        formStartTime: formStartTime.toString()
        // interactionCount,
        // agreeToTerms: formData.agreeToTerms
      };

      await apiClient.createContactMessage(submissionData);

      setShowSuccessMessage(true);
      toast.success('Message sent successfully!');
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        website: '',
        url: '',
        link: '',
        agreeToTerms: false
      });
      setCharCounts({ subject: 0, message: 0 });
      setCaptchaVerified(false);
      captchaRef.current?.reset();
      
      setTimeout(() => setShowSuccessMessage(false), 10000);

    } catch (error: any) {
      console.error('Contact form error:', error);
      
      if (error.message?.includes('Too many')) {
        toast.error('Too many attempts. Please try again later.');
      } else {
        toast.error(error.message || 'Failed to send message');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Get In Touch</h1>
            <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto">
              Have questions? We'd love to hear from you.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-semibold text-gray-900">Address</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      123 Education Street<br />
                      Knowledge City, KC 12345<br />
                      India
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Phone className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-semibold text-gray-900">Phone</h3>
                    <p className="mt-1 text-sm text-gray-600">+91 98765 43210</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Mail className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-semibold text-gray-900">Email</h3>
                    <p className="mt-1 text-sm text-gray-600">info@ssmtechnologies.co.in</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-semibold text-gray-900">Business Hours</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Monday - Saturday<br />
                      9:00 AM - 6:00 PM
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Security Notice */}
            <Card className="p-6 bg-blue-50 border-blue-200">
              <div className="flex items-start">
                <Shield className="w-8 h-8 text-blue-600 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">
                    Secure Form
                  </h3>
                  <p className="text-sm text-blue-800 leading-relaxed">
                    This form is protected by advanced validation, spam detection, 
                    honeypot fields, and interactive verification challenges.
                  </p>
                </div>
              </div>
            </Card>

            {/* CAPTCHA Type Selector */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Choose Verification Method
              </h3>
              <div className="space-y-2">
                {[
                  { value: 'math', label: '🔢 Math Problem', desc: 'Solve simple math' },
                  { value: 'slider', label: '👆 Slider', desc: 'Slide to verify' },
                  { value: 'puzzle', label: '🧩 Number Puzzle', desc: 'Click in order' },
                  { value: 'text', label: '📝 Text Code', desc: 'Type what you see' },
                  { value: 'time', label: '⏱️ Timer', desc: 'Click at right time' }
                ].map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => {
                      setCaptchaType(type.value as any);
                      setCaptchaVerified(false);
                      captchaRef.current?.reset();
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                      captchaType === type.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="font-medium text-gray-900">{type.label}</div>
                    <div className="text-xs text-gray-600">{type.desc}</div>
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>

              {showSuccessMessage && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-green-900">Message Sent Successfully!</h3>
                    <p className="text-sm text-green-800 mt-1">
                      Thank you for contacting us. We'll respond within 24-48 hours.
                    </p>
                  </div>
                </div>
              )}

              <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                {/* Name Field */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your full name"
                    maxLength={50}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="your.email@example.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Phone Field */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="+91 98765 43210"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.phone}
                    </p>
                  )}
                </div>

                {/* Subject Field */}
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.subject ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="What is this regarding?"
                    maxLength={200}
                  />
                  <div className="flex justify-between mt-1">
                    {errors.subject ? (
                      <p className="text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.subject}
                      </p>
                    ) : (
                      <span className="text-sm text-gray-500">Min 5 characters</span>
                    )}
                    <span className={`text-sm ${charCounts.subject > 180 ? 'text-orange-600' : 'text-gray-500'}`}>
                      {charCounts.subject}/200
                    </span>
                  </div>
                </div>

                {/* Message Field */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    value={formData.message}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                      errors.message ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Tell us more... (minimum 20 characters)"
                    maxLength={2000}
                  />
                  <div className="flex justify-between mt-1">
                    {errors.message ? (
                      <p className="text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.message}
                      </p>
                    ) : (
                      <span className="text-sm text-gray-500">Min 20 characters</span>
                    )}
                    <span className={`text-sm ${charCounts.message > 1800 ? 'text-orange-600' : 'text-gray-500'}`}>
                      {charCounts.message}/2000
                    </span>
                  </div>
                </div>

                {/* Honeypot Fields (Hidden) */}
                <input
                  type="text"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="hidden"
                  tabIndex={-1}
                  autoComplete="off"
                />
                <input
                  type="text"
                  name="url"
                  value={formData.url}
                  onChange={handleInputChange}
                  className="hidden"
                  tabIndex={-1}
                  autoComplete="off"
                />
                <input
                  type="text"
                  name="link"
                  value={formData.link}
                  onChange={handleInputChange}
                  className="hidden"
                  tabIndex={-1}
                  autoComplete="off"
                />

                {/* Terms Checkbox */}
                <div>
                  <label className="flex items-start">
                    <input
                      type="checkbox"
                      name="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={handleInputChange}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      I agree to the terms and conditions and consent to my data being processed. 
                      <span className="text-red-500">*</span>
                    </span>
                  </label>
                  {errors.terms && (
                    <p className="mt-1 text-sm text-red-600 flex items-center ml-6">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.terms}
                    </p>
                  )}
                </div>

                {/* Alternative CAPTCHA */}
                <div>
                  <AlternativeCaptcha
                    ref={captchaRef}
                    type={captchaType}
                    difficulty="medium"
                    onVerify={handleCaptchaVerify}
                  />
                  {errors.captcha && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.captcha}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={!isFormValid || loading}
                  loading={loading}
                  className="w-full"
                  size="lg"
                >
                  <Send className="w-5 h-5 mr-2" />
                  {loading ? 'Sending...' : 'Send Message'}
                </Button>

                {/* Security Info */}
                <p className="text-xs text-gray-500 text-center">
                  <Shield className="w-3 h-3 inline mr-1" />
                  Protected by advanced spam detection and interactive verification
                </p>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;