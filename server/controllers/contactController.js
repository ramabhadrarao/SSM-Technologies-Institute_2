// server/controllers/contactController.js
const ContactMessage = require('../models/ContactMessage');
const User = require('../models/User');
const emailService = require('../utils/emailService');

// Get all contact messages for admin
const getContactMessages = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      status, 
      priority,
      startDate,
      endDate,
      sortBy = 'createdAt', 
      sortOrder = 'desc' 
    } = req.query;

    // Build query
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (priority && priority !== 'all') {
      query.priority = priority;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const messages = await ContactMessage.find(query)
      .populate('reply.repliedBy', 'firstName lastName email')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    // Get total count for pagination
    const total = await ContactMessage.countDocuments(query);

    res.json({
      success: true,
      data: {
        messages,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get contact messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get contact messages'
    });
  }
};

// Get single contact message
const getContactMessage = async (req, res) => {
  try {
    const { id } = req.params;
    
    const message = await ContactMessage.findById(id)
      .populate('reply.repliedBy', 'firstName lastName email')
      .lean();

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }

    // Mark as read if it's new
    if (message.status === 'new') {
      await ContactMessage.findByIdAndUpdate(id, { status: 'read' });
      message.status = 'read';
    }

    res.json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('Get contact message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get contact message'
    });
  }
};

// Create contact message (public endpoint)
const createContactMessage = async (req, res) => {
  try {
    const { name, email, phone, subject, message, captchaToken, formStartTime } = req.body;
    
    // Additional server-side validation
    if (!captchaToken || !formStartTime) {
      return res.status(400).json({
        success: false,
        message: 'Invalid form submission'
      });
    }

    // Auto-assign priority based on keywords
    let priority = 'medium';
    const urgentKeywords = ['urgent', 'emergency', 'asap', 'immediately', 'critical'];
    const highKeywords = ['important', 'problem', 'issue', 'error', 'bug', 'payment'];
    
    const fullText = `${subject} ${message}`.toLowerCase();
    
    if (urgentKeywords.some(keyword => fullText.includes(keyword))) {
      priority = 'urgent';
    } else if (highKeywords.some(keyword => fullText.includes(keyword))) {
      priority = 'high';
    }

    const contactMessage = new ContactMessage({
      name,
      email,
      phone,
      subject,
      message,
      priority,
      status: 'new',
      metadata: {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        fingerprint: req.fingerprint,
        submissionTime: new Date(),
        formFillTime: Date.now() - parseInt(formStartTime)
      }
    });

    await contactMessage.save();
    
    // Log successful submission for monitoring
    console.log(`✅ Contact message received from ${email} (IP: ${req.ip})`);

    res.status(201).json({
      success: true,
      message: 'Your message has been sent successfully. We will get back to you soon.',
      data: {
        id: contactMessage._id,
        priority
      }
    });
  } catch (error) {
    console.error('Create contact message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again.'
    });
  }
};

// Update message status
const updateMessageStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['new', 'read', 'replied', 'closed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const message = await ContactMessage.findByIdAndUpdate(
      id, 
      { status },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    res.json({
      success: true,
      message: 'Status updated successfully',
      data: message
    });
  } catch (error) {
    console.error('Update message status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update status'
    });
  }
};

// Update message priority
const updateMessagePriority = async (req, res) => {
  try {
    const { id } = req.params;
    const { priority } = req.body;

    if (!['low', 'medium', 'high', 'urgent'].includes(priority)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid priority'
      });
    }

    const message = await ContactMessage.findByIdAndUpdate(
      id, 
      { priority },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    res.json({
      success: true,
      message: 'Priority updated successfully',
      data: message
    });
  } catch (error) {
    console.error('Update message priority error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update priority'
    });
  }
};

// Reply to contact message
const replyToMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { replyMessage } = req.body;

    if (!replyMessage || replyMessage.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Reply message is required'
      });
    }

    const message = await ContactMessage.findById(id);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Update message with reply
    message.reply = {
      message: replyMessage,
      repliedBy: req.user._id,
      repliedAt: new Date()
    };
    message.status = 'replied';

    await message.save();

    // Populate the reply for response
    await message.populate('reply.repliedBy', 'firstName lastName email');

    // Send email notification to the user
    try {
      await emailService.sendReplyEmail(
        message.email, 
        message.name, 
        replyMessage, 
        message.subject
      );
      console.log(`✅ Reply email sent to ${message.email}`);
    } catch (emailError) {
      console.error('Failed to send reply email:', emailError);
      // Don't fail the entire operation if email fails
      // The reply is still saved to the database
    }

    res.json({
      success: true,
      message: 'Reply sent successfully',
      data: message
    });
  } catch (error) {
    console.error('Reply to message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send reply'
    });
  }
};

// Delete contact message
const deleteContactMessage = async (req, res) => {
  try {
    const { id } = req.params;
    
    const message = await ContactMessage.findByIdAndDelete(id);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Delete contact message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message'
    });
  }
};

// Bulk operations on messages
const bulkUpdateMessages = async (req, res) => {
  try {
    const { messageIds, action, data } = req.body;
    
    if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message IDs are required'
      });
    }

    let updateQuery = {};
    let message = '';

    switch (action) {
      case 'mark-read':
        updateQuery = { status: 'read' };
        message = 'Messages marked as read';
        break;
      case 'mark-closed':
        updateQuery = { status: 'closed' };
        message = 'Messages marked as closed';
        break;
      case 'set-priority':
        if (!data?.priority || !['low', 'medium', 'high', 'urgent'].includes(data.priority)) {
          return res.status(400).json({
            success: false,
            message: 'Valid priority is required'
          });
        }
        updateQuery = { priority: data.priority };
        message = `Priority set to ${data.priority}`;
        break;
      case 'delete':
        const result = await ContactMessage.deleteMany({ _id: { $in: messageIds } });
        return res.json({
          success: true,
          message: 'Messages deleted successfully',
          data: { deletedCount: result.deletedCount }
        });
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid action'
        });
    }

    const result = await ContactMessage.updateMany(
      { _id: { $in: messageIds } },
      updateQuery
    );

    res.json({
      success: true,
      message,
      data: {
        modifiedCount: result.modifiedCount
      }
    });
  } catch (error) {
    console.error('Bulk update messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update messages'
    });
  }
};

// Get contact message statistics
const getContactStats = async (req, res) => {
  try {
    const [
      totalMessages,
      newMessages,
      repliedMessages,
      closedMessages,
      messagesByPriority,
      recentMessages,
      messagesByMonth
    ] = await Promise.all([
      ContactMessage.countDocuments({}),
      ContactMessage.countDocuments({ status: 'new' }),
      ContactMessage.countDocuments({ status: 'replied' }),
      ContactMessage.countDocuments({ status: 'closed' }),
      ContactMessage.aggregate([
        {
          $group: {
            _id: '$priority',
            count: { $sum: 1 }
          }
        }
      ]),
      ContactMessage.find({})
        .sort({ createdAt: -1 })
        .limit(10)
        .select('name email subject status priority createdAt')
        .lean(),
      ContactMessage.aggregate([
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 12 }
      ])
    ]);

    // Calculate response rate and average response time
    const totalReplied = await ContactMessage.countDocuments({ 
      status: { $in: ['replied', 'closed'] } 
    });
    const responseRate = totalMessages > 0 ? (totalReplied / totalMessages * 100) : 0;

    // Get average response time
    const avgResponseTime = await ContactMessage.aggregate([
      {
        $match: {
          'reply.repliedAt': { $exists: true }
        }
      },
      {
        $project: {
          responseTime: {
            $subtract: ['$reply.repliedAt', '$createdAt']
          }
        }
      },
      {
        $group: {
          _id: null,
          avgResponseTime: { $avg: '$responseTime' }
        }
      }
    ]);

    const avgResponseHours = avgResponseTime.length > 0 
      ? Math.round((avgResponseTime[0].avgResponseTime / (1000 * 60 * 60)) * 10) / 10
      : 0;

    res.json({
      success: true,
      data: {
        totalMessages,
        newMessages,
        readMessages: await ContactMessage.countDocuments({ status: 'read' }),
        repliedMessages,
        closedMessages,
        responseRate: Math.round(responseRate * 10) / 10,
        avgResponseHours,
        messagesByPriority: messagesByPriority.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        recentMessages,
        messagesByMonth
      }
    });
  } catch (error) {
    console.error('Get contact stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get contact statistics'
    });
  }
};

module.exports = {
  getContactMessages,
  getContactMessage,
  createContactMessage,
  updateMessageStatus,
  updateMessagePriority,
  replyToMessage,
  deleteContactMessage,
  bulkUpdateMessages,
  getContactStats
};