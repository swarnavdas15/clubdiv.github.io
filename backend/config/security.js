import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import compression from 'compression';
import winston from 'winston';

// Rate limiting configurations
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    error: 'Too many login attempts',
    message: 'Too many login attempts from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
});

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    error: 'Too many requests',
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // 200 API requests per window
  message: {
    error: 'API rate limit exceeded',
    message: 'API rate limit exceeded, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Security headers configuration
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      imgSrc: ["'self'", "data:", "https:", "http://localhost:*"],
      connectSrc: ["'self'", "https:", "http://localhost:*", "ws:", "wss:"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// Compression configuration
export const compressionConfig = compression({
  level: 6, // Compression level (1-9)
  threshold: 1024, // Only compress responses larger than 1KB
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
});

// Logger configuration
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'divclub-api' },
  transports: [
    // Write all logs with importance level of `error` or less to `error.log`
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Write all logs with importance level of `info` or less to `combined.log`
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Morgan stream for HTTP request logging
export const morganStream = {
  write: (message) => {
    logger.info(message.trim());
  },
};

// Security middleware for production
export const productionSecurity = (app) => {
  // Trust proxy for production (important for rate limiting behind load balancers)
  app.set('trust proxy', 1);

  // Security headers
  app.use(securityHeaders);

  // Compression
  app.use(compressionConfig);

  // General rate limiting
  app.use(generalLimiter);

  // Specific rate limiting for sensitive endpoints
  app.use('/api/login', loginLimiter);
  app.use('/api/register', loginLimiter);
  app.use('/api/forgot-password', loginLimiter);
  app.use('/api/2fa', apiLimiter);

  // API rate limiting for all /api routes
  app.use('/api/', apiLimiter);

  return app;
};

// Development security (less restrictive)
export const developmentSecurity = (app) => {
  // Basic security headers (less restrictive for development)
  app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP for development
    crossOriginEmbedderPolicy: false,
  }));

  // Compression
  app.use(compressionConfig);

  // Less restrictive rate limiting for development
  const devLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000, // Much higher limit for development
    message: 'Too many requests',
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use(devLimiter);

  return app;
};
