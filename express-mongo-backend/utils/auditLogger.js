const logger = require('./logger');

function redact(input) {
  if (!input) return undefined;
  if (typeof input === 'string') return '[redacted]';
  if (typeof input === 'object') return '[object redacted]';
  return '[redacted]';
}

function baseEvent(req) {
  return {
    ip: req.ip,
    method: req.method,
    path: req.originalUrl,
    userId: req.user ? req.user.id || req.user._id : undefined,
    timestamp: new Date().toISOString(),
  };
}

const auditLogger = {
  authSuccess(req, details = {}) {
    logger.info(JSON.stringify({ type: 'auth.success', ...baseEvent(req), ...details }));
  },
  authFailure(req, reason = 'unknown') {
    logger.warn(JSON.stringify({ type: 'auth.failure', ...baseEvent(req), reason }));
  },
  accessDenied(req, reason = 'forbidden') {
    logger.warn(JSON.stringify({ type: 'access.denied', ...baseEvent(req), reason }));
  },
  sensitiveAction(req, action, details = {}) {
    logger.info(JSON.stringify({ type: 'sensitive.action', action, ...baseEvent(req), ...details }));
  },
  dataRead(req, resource, id) {
    logger.info(JSON.stringify({ type: 'data.read', resource, id, ...baseEvent(req) }));
  },
  dataWrite(req, resource, id) {
    logger.info(JSON.stringify({ type: 'data.write', resource, id, ...baseEvent(req) }));
  },
  redact,
};

module.exports = auditLogger;


