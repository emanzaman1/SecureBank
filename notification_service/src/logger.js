const winston = require('winston');
const config = require('../config/config');

const logger = winston.createLogger({
  level: config.service.logLevel,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'notification-service' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp, ...meta }) => {
          const metaStr = Object.keys(meta).length > 0 ? JSON.stringify(meta) : '';
          return `${timestamp} [${level}]: ${message} ${metaStr}`;
        })
      ),
    }),
    new winston.transports.File({ 
      filename: 'logs/notification-service.log',
      maxsize: 5242880,
      maxFiles: 5,
    }),
    new winston.transports.File({ 
      filename: 'logs/notification-service-error.log',
      level: 'error',
      maxsize: 5242880,
      maxFiles: 5,
    }),
  ],
});

module.exports = logger;
