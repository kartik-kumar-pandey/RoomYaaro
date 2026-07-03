/**
 * Structured logger for RoomYaaro backend.
 * Outputs JSON-formatted log lines to console so they can be
 * captured by any log aggregator (e.g. Papertrail, Logtail, stdout).
 */

const LOG_LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };

const currentLevel =
  process.env.LOG_LEVEL ||
  (process.env.NODE_ENV === 'production' ? 'warn' : 'info');

const shouldLog = (level) =>
  LOG_LEVELS[level] <= LOG_LEVELS[currentLevel];

const formatEntry = (level, message, meta = {}) => {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    service: 'roomyaaro-api',
    ...meta,
  };
  return JSON.stringify(entry);
};

const logger = {
  error: (message, meta = {}) => {
    if (shouldLog('error')) console.error(formatEntry('error', message, meta));
  },
  warn: (message, meta = {}) => {
    if (shouldLog('warn')) console.warn(formatEntry('warn', message, meta));
  },
  info: (message, meta = {}) => {
    if (shouldLog('info')) console.log(formatEntry('info', message, meta));
  },
  debug: (message, meta = {}) => {
    if (shouldLog('debug')) console.log(formatEntry('debug', message, meta));
  },

  /**
   * Specialized auth event logger for security audit trails.
   * @param {'login_success'|'login_failure'|'register'|'password_reset_request'|'password_reset_success'|'email_verified'} event
   */
  auth: (event, meta = {}) => {
    if (shouldLog('info')) {
      console.log(formatEntry('info', `AUTH_EVENT:${event}`, { event, ...meta }));
    }
  },
};

export default logger;
