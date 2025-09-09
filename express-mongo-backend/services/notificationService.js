const Notification = require('../models/Notification');
const emailService = require('./emailService');
const twilio = require('twilio');

class NotificationService {
  constructor() {
    this.twilioClient = (process.env.TWILIO_SID && process.env.TWILIO_TOKEN)
      ? twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN)
      : null;
  }

  async list(userId, query = {}) {
    const filter = { user: userId };
    if (query.type) filter.type = query.type;
    if (query.isRead !== undefined) filter.isRead = query.isRead === 'true';
    return Notification.find(filter).sort({ createdAt: -1 }).limit(Number(query.limit || 50));
  }

  async create(payload) {
    const notification = await Notification.create(payload);
    // Email
    if (payload.channels?.email?.sent !== false && payload.userEmail) {
      try { await emailService.sendNotificationEmail(payload.userEmail, payload); } catch {}
    }
    // SMS
    if (this.twilioClient && payload.channels?.sms?.sent !== false && payload.userPhone) {
      try {
        await this.twilioClient.messages.create({
          from: process.env.TWILIO_FROM,
          to: payload.userPhone,
          body: `${payload.title}: ${payload.message}`
        });
      } catch {}
    }
    return notification;
  }

  async markRead(userId, id) {
    const doc = await Notification.findOneAndUpdate({ _id: id, user: userId }, { isRead: true, readAt: new Date() }, { new: true });
    return doc;
  }
}

module.exports = new NotificationService();
