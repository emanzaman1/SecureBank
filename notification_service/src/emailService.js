const nodemailer = require('nodemailer');
const logger = require('./logger');
const config = require('../config/config');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    try {
      this.transporter = nodemailer.createTransport({
        host: config.email.host,
        port: config.email.port,
        secure: config.email.secure,
        auth: {
          user: config.email.auth.user,
          pass: config.email.auth.pass,
        },
      });
      logger.info('Email transporter initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize email transporter', { error: error.message });
      throw error;
    }
  }

  async sendEmail(to, subject, htmlContent) {
    try {
      if (!this.isValidEmail(to)) {
        throw new Error(`Invalid email address: ${to}`);
      }
      const result = await this.transporter.sendMail({
        from: config.email.from,
        to: to,
        subject: subject,
        html: htmlContent,
      });
      logger.info('Email sent successfully', { to, subject, messageId: result.messageId });
      return { success: true, messageId: result.messageId, timestamp: new Date() };
    } catch (error) {
      logger.error('Failed to send email', { to, subject, error: error.message });
      throw error;
    }
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  async sendSuspiciousLoginAlert(email, userName, ipAddress, timestamp) {
    const subject = '⚠️ Suspicious Login Alert - SecureBank';
    const htmlContent = `<h2>Suspicious Login Detected</h2><p>Hi ${userName},</p><p>We detected an unusual login from IP: ${ipAddress} at ${timestamp}</p>`;
    return this.sendEmail(email, subject, htmlContent);
  }

  async sendFailedLoginAttemptsAlert(email, userName, attemptCount, timestamp) {
    const subject = '🔒 Multiple Failed Login Attempts - SecureBank';
    const htmlContent = `<h2>Failed Login Attempts</h2><p>Hi ${userName},</p><p>We detected ${attemptCount} failed attempts at ${timestamp}</p>`;
    return this.sendEmail(email, subject, htmlContent);
  }

  async sendLargeTransferConfirmation(email, userName, amount, recipient, timestamp) {
    const subject = '💰 Large Transfer - SecureBank';
    const htmlContent = `<h2>Transfer Confirmation</h2><p>Amount: $${amount} to ${recipient} at ${timestamp}</p>`;
    return this.sendEmail(email, subject, htmlContent);
  }

  async sendAccountLockedNotification(email, userName, reason, timestamp) {
    const subject = '🔐 Account Locked - SecureBank';
    const htmlContent = `<h2>Account Locked</h2><p>Reason: ${reason} at ${timestamp}</p>`;
    return this.sendEmail(email, subject, htmlContent);
  }
}

module.exports = new EmailService();
