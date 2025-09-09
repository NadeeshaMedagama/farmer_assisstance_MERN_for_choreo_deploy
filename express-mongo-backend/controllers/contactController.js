const Contact = require('../models/Contact');
const logger = require('../utils/logger');

// Submit contact message
exports.submitContact = async (req, res, next) => {
  try {
    const { name, email, subject, message, phone, category } = req.body;

    // Validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, subject, and message are required'
      });
    }

    // Create contact message
    const contact = await Contact.create({
      name: name.trim(),
      email: email.toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
      phone: phone || '',
      category: category || 'general',
      source: 'api',
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent') || ''
    });

    logger.info(`New contact message received: ${contact._id} from ${contact.email}`);

    res.status(201).json({
      success: true,
      message: 'Message received successfully. We will get back to you soon!',
      data: {
        id: contact._id,
        subject: contact.subject,
        status: contact.status,
        submittedAt: contact.createdAt
      }
    });

  } catch (error) {
    logger.error('Contact submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while submitting message'
    });
  }
};

// Get all contact messages (admin only)
exports.getAllContacts = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      priority, 
      category, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const contacts = await Contact.find(filter)
      .populate('assignedTo', 'firstName lastName email')
      .populate('response.respondedBy', 'firstName lastName email')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Contact.countDocuments(filter);

    res.json({
      success: true,
      data: contacts,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total: total
      }
    });

  } catch (error) {
    logger.error('Get contacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching contact messages'
    });
  }
};

// Get contact by ID (admin only)
exports.getContact = async (req, res, next) => {
  try {
    const { id } = req.params;

    const contact = await Contact.findById(id)
      .populate('assignedTo', 'firstName lastName email')
      .populate('response.respondedBy', 'firstName lastName email');

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }

    // Mark as read if not already
    if (!contact.isRead) {
      contact.isRead = true;
      contact.readAt = new Date();
      await contact.save();
    }

    res.json({
      success: true,
      data: contact
    });

  } catch (error) {
    logger.error('Get contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching contact message'
    });
  }
};

// Update contact status (admin only)
exports.updateContactStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, priority, assignedTo, tags } = req.body;

    const updateData = {};
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (assignedTo) updateData.assignedTo = assignedTo;
    if (tags) updateData.tags = tags;

    const contact = await Contact.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('assignedTo', 'firstName lastName email');

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }

    logger.info(`Contact ${id} updated by ${req.user?.email || 'system'}`);

    res.json({
      success: true,
      message: 'Contact status updated successfully',
      data: contact
    });

  } catch (error) {
    logger.error('Update contact status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating contact status'
    });
  }
};

// Respond to contact (admin only)
exports.respondToContact = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { response } = req.body;

    if (!response || !response.message) {
      return res.status(400).json({
        success: false,
        message: 'Response message is required'
      });
    }

    const contact = await Contact.findByIdAndUpdate(
      id,
      {
        response: {
          message: response.message,
          respondedBy: req.user.id,
          respondedAt: new Date()
        },
        status: 'resolved'
      },
      { new: true, runValidators: true }
    ).populate('assignedTo', 'firstName lastName email')
     .populate('response.respondedBy', 'firstName lastName email');

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }

    logger.info(`Response sent to contact ${id} by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Response sent successfully',
      data: contact
    });

  } catch (error) {
    logger.error('Respond to contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error sending response'
    });
  }
};

// Delete contact (admin only)
exports.deleteContact = async (req, res, next) => {
  try {
    const { id } = req.params;

    const contact = await Contact.findByIdAndDelete(id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }

    logger.info(`Contact ${id} deleted by ${req.user?.email || 'system'}`);

    res.json({
      success: true,
      message: 'Contact message deleted successfully'
    });

  } catch (error) {
    logger.error('Delete contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting contact message'
    });
  }
};

// Get contact statistics (admin only)
exports.getContactStats = async (req, res, next) => {
  try {
    const stats = await Contact.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          new: { $sum: { $cond: [{ $eq: ['$status', 'new'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } },
          resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
          closed: { $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] } },
          urgent: { $sum: { $cond: [{ $eq: ['$priority', 'urgent'] }, 1, 0] } },
          high: { $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] } },
          unread: { $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] } }
        }
      }
    ]);

    const categoryStats = await Contact.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          total: 0,
          new: 0,
          inProgress: 0,
          resolved: 0,
          closed: 0,
          urgent: 0,
          high: 0,
          unread: 0
        },
        byCategory: categoryStats
      }
    });

  } catch (error) {
    logger.error('Get contact stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching contact statistics'
    });
  }
};
