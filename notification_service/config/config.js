module.exports = {
  kafka: {
    brokers: process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'],
    groupId: process.env.KAFKA_GROUP_ID || 'notification-service',
    topic: process.env.KAFKA_TOPIC || 'bank.transactions',
    clientId: process.env.KAFKA_CLIENT_ID || 'notification-service-client',
  },
  email: {
    service: process.env.EMAIL_SERVICE || 'gmail',
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true' || false,
    auth: {
      user: process.env.EMAIL_USER || 'noreply@securebank.com',
      pass: process.env.EMAIL_PASSWORD || '',
    },
    from: process.env.EMAIL_FROM || 'SecureBank <noreply@securebank.com>',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || '',
    db: parseInt(process.env.REDIS_DB || '0'),
    tls: process.env.REDIS_TLS === 'true' || false,
  },
  service: {
    port: parseInt(process.env.SERVICE_PORT || '3000'),
    environment: process.env.NODE_ENV || 'development',
    logLevel: process.env.LOG_LEVEL || 'info',
  },
  rateLimit: {
    maxEmailsPerUserPerHour: parseInt(process.env.MAX_EMAILS_PER_USER_PER_HOUR || '5'),
    redisKeyPrefix: 'notification:email:',
  },
  retry: {
    maxRetries: parseInt(process.env.MAX_RETRIES || '3'),
    retryDelayMs: parseInt(process.env.RETRY_DELAY_MS || '1000'),
  },
};
