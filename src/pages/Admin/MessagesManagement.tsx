import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  MessageSquare, 
  Search, 
  Filter, 
  Eye, 
  Reply, 
  Trash2, 
  CheckCircle,
  Clock,
  AlertTriangle,
  Zap,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  Calendar,
  User
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../lib/api';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'closed';
  reply?: {
    message: string;
    repliedBy: {
      firstName: string;
      lastName: string;
      email: string;
    };
    repliedAt: string;
  };
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
}

const AdminMessagesManagement: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMessages, setTotalMessages] = useState(0);
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [replyText, setReplyText] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [messageStats, setMessageStats] = useState<any>(null);

  useEffect(() => {
    fetchMessages();
    fetchMessageStats();
  }, [currentPage, selectedStatus, selectedPriority, searchQuery]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        search: searchQuery || undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        priority: selectedPriority !== 'all' ? selectedPriority : undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc' as const
      };

      const response = await apiClient.getContactMessages(params);
      setMessages(response.messages || []);
      setTotalPages(response.pagination?.pages || 1);
      setTotalMessages(response.pagination?.total || 0);
    } catch (error: any) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessageStats = async () => {
    try {
      const stats = await apiClient.getContactStats();
      setMessageStats(stats);
    } catch (error) {
      console.error('Error fetching message stats:', error);
    }
  };

  const handleViewMessage = async (message: ContactMessage) => {
    setSelectedMessage(message);
    setShowMessageModal(true);
    
    // Mark as read if it's new
    if (message.status === 'new') {
      try {
        await apiClient.updateMessageStatus(message._id, 'read');
        fetchMessages();
        fetchMessageStats();
      } catch (error) {
        console.error('Error updating message status:', error);
      }
    }
  };

  const handleReplyToMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMessage || !replyText.trim()) return;

    try {
      setActionLoading('reply');
      await apiClient.replyToMessage(selectedMessage._id, replyText);
      toast.success('Reply sent successfully');
      setReplyText('');
      setShowMessageModal(false);
      fetchMessages();
      fetchMessageStats();
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reply');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateStatus = async (messageId: string, status: 'new' | 'read' | 'replied' | 'closed') => {
    try {
      setActionLoading(messageId);
      await apiClient.updateMessageStatus(messageId, status);
      toast.success('Status updated successfully');
      fetchMessages();
      fetchMessageStats();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdatePriority = async (messageId: string, priority: 'low' | 'medium' | 'high' | 'urgent') => {
    try {
      setActionLoading(messageId);
      await apiClient.updateMessagePriority(messageId, priority);
      toast.success('Priority updated successfully');
      fetchMessages();
      fetchMessageStats();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update priority');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!window.confirm('Are you sure you want to delete this message?')) {
      return;
    }

    try {
      setActionLoading(messageId);
      await apiClient.deleteContactMessage(messageId);
      toast.success('Message deleted successfully');
      fetchMessages();
      fetchMessageStats();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete message');
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkActions = async (action: 'mark-read' | 'mark-closed' | 'delete') => {
    if (selectedMessages.length === 0) {
      toast.error('Please select messages first');
      return;
    }

    const actionText = action === 'mark-read' ? 'mark as read' : action === 'mark-closed' ? 'close' : 'delete';
    if (!window.confirm(`Are you sure you want to ${actionText} ${selectedMessages.length} message(s)?`)) {
      return;
    }

    try {
      setActionLoading('bulk');
      await apiClient.bulkUpdateMessages(selectedMessages, action);
      toast.success(`Messages ${actionText} successfully`);
      setSelectedMessages([]);
      fetchMessages();
      fetchMessageStats();
    } catch (error: any) {
      toast.error(error.message || `Failed to ${actionText} messages`);
    } finally {
      setActionLoading(null);
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Zap className="w-4 h-4 text-red-600" />;
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case 'medium':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'low':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'read':
        return 'bg-yellow-100 text-yellow-800';
      case 'replied':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  if (loading && currentPage === 1) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/admin/dashboard"
                className="inline-flex items-center text-blue-600 hover:text-blue-800"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Messages & Support</h1>
                <p className="text-gray-600">Handle student inquiries and support requests</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {messageStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Messages</p>
                  <p className="text-2xl font-bold text-gray-900">{messageStats.totalMessages}</p>
                </div>
                <MessageSquare className="w-8 h-8 text-blue-500" />
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">New Messages</p>
                  <p className="text-2xl font-bold text-red-600">{messageStats.newMessages}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Replied</p>
                  <p className="text-2xl font-bold text-green-600">{messageStats.repliedMessages}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Response Rate</p>
                  <p className="text-2xl font-bold text-blue-600">{messageStats.responseRate}%</p>
                </div>
                <Reply className="w-8 h-8 text-blue-500" />
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Response</p>
                  <p className="text-2xl font-bold text-purple-600">{messageStats.avgResponseHours}h</p>
                </div>
                <Clock className="w-8 h-8 text-purple-500" />
              </div>
            </Card>
          </div>
        )}

        {/* Filters and Search */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full lg:w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="read">Read</option>
                <option value="replied">Replied</option>
                <option value="closed">Closed</option>
              </select>

              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Priority</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            {selectedMessages.length > 0 && (
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleBulkActions('mark-read')}
                  loading={actionLoading === 'bulk'}
                >
                  Mark Read ({selectedMessages.length})
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkActions('mark-closed')}
                  loading={actionLoading === 'bulk'}
                >
                  Close ({selectedMessages.length})
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleBulkActions('delete')}
                  loading={actionLoading === 'bulk'}
                >
                  Delete ({selectedMessages.length})
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Messages Table */}
        <Card className="overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedMessages.length === messages.length && messages.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedMessages(messages.map(m => m._id));
                            } else {
                              setSelectedMessages([]);
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subject
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Priority
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Received
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {messages.map((message) => (
                      <tr 
                        key={message._id} 
                        className={`hover:bg-gray-50 cursor-pointer ${
                          message.status === 'new' ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => handleViewMessage(message)}
                      >
                        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedMessages.includes(message._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedMessages([...selectedMessages, message._id]);
                              } else {
                                setSelectedMessages(selectedMessages.filter(id => id !== message._id));
                              }
                            }}
                            className="rounded border-gray-300"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900 flex items-center">
                              <User className="w-4 h-4 mr-2 text-gray-400" />
                              {message.name}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center mt-1">
                              <Mail className="w-4 h-4 mr-2 text-gray-400" />
                              {message.email}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center mt-1">
                              <Phone className="w-4 h-4 mr-2 text-gray-400" />
                              {message.phone}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {message.subject}
                          </div>
                          <div className="text-sm text-gray-500 line-clamp-2">
                            {message.message}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            {getPriorityIcon(message.priority)}
                            <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(message.priority)}`}>
                              {message.priority}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(message.status)}`}>
                            {message.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {getTimeAgo(message.createdAt)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatDate(message.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleViewMessage(message)}
                              className="text-blue-600 hover:text-blue-900"
                              title="View Message"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteMessage(message._id)}
                              disabled={actionLoading === message._id}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50"
                              title="Delete Message"
                            >
                              {actionLoading === message._id ? (
                                <LoadingSpinner size="sm" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing{' '}
                        <span className="font-medium">{((currentPage - 1) * 10) + 1}</span>
                        {' '}to{' '}
                        <span className="font-medium">
                          {Math.min(currentPage * 10, totalMessages)}
                        </span>
                        {' '}of{' '}
                        <span className="font-medium">{totalMessages}</span>
                        {' '}results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="rounded-r-none"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        
                        {[...Array(Math.min(5, totalPages))].map((_, index) => {
                          const pageNumber = currentPage <= 3 
                            ? index + 1
                            : currentPage >= totalPages - 2
                            ? totalPages - 4 + index
                            : currentPage - 2 + index;
                          
                          if (pageNumber < 1 || pageNumber > totalPages) return null;
                          
                          return (
                            <Button
                              key={pageNumber}
                              variant={currentPage === pageNumber ? "primary" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(pageNumber)}
                              className="rounded-none"
                            >
                              {pageNumber}
                            </Button>
                          );
                        })}
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className="rounded-l-none"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
      </div>

      {/* Message Detail Modal */}
      {showMessageModal && selectedMessage && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-90vh overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Message Details</h3>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(selectedMessage.priority)}`}>
                    {selectedMessage.priority}
                  </span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedMessage.status)}`}>
                    {selectedMessage.status}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Message Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <p className="text-sm text-gray-900">{selectedMessage.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="text-sm text-gray-900">{selectedMessage.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <p className="text-sm text-gray-900">{selectedMessage.phone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Received</label>
                  <p className="text-sm text-gray-900">{formatDate(selectedMessage.createdAt)}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <p className="text-sm text-gray-900 font-medium">{selectedMessage.subject}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>
              </div>

              {/* Existing Reply */}
              {selectedMessage.reply && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Previous Reply</label>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedMessage.reply.message}</p>
                    <div className="mt-2 text-xs text-gray-600">
                      Replied by {selectedMessage.reply.repliedBy.firstName} {selectedMessage.reply.repliedBy.lastName} 
                      on {formatDate(selectedMessage.reply.repliedAt)}
                    </div>
                  </div>
                </div>
              )}

              {/* Reply Form */}
              <form onSubmit={handleReplyToMessage}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {selectedMessage.reply ? 'Send Follow-up Reply' : 'Send Reply'}
                </label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Type your reply here..."
                  required
                />
                <div className="flex justify-between items-center mt-4">
                  <div className="flex items-center space-x-4">
                    <select
                      value={selectedMessage.status}
                      onChange={(e) => handleUpdateStatus(selectedMessage._id, e.target.value as any)}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="new">New</option>
                      <option value="read">Read</option>
                      <option value="replied">Replied</option>
                      <option value="closed">Closed</option>
                    </select>
                    <select
                      value={selectedMessage.priority}
                      onChange={(e) => handleUpdatePriority(selectedMessage._id, e.target.value as any)}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div className="flex space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowMessageModal(false);
                        setSelectedMessage(null);
                        setReplyText('');
                      }}
                    >
                      Close
                    </Button>
                    <Button
                      type="submit"
                      loading={actionLoading === 'reply'}
                      disabled={!replyText.trim()}
                    >
                      <Reply className="w-4 h-4 mr-2" />
                      Send Reply
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMessagesManagement;