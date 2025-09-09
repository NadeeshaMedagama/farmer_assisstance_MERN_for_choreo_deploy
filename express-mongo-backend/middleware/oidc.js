const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

const issuer = process.env.OIDC_ISSUER;
const audience = process.env.OIDC_AUDIENCE;

const client = issuer ? jwksClient({
  jwksUri: `${issuer.replace(/\/$/, '')}/.well-known/jwks.json`,
  cache: true,
  cacheMaxEntries: 5,
  cacheMaxAge: 10 * 60 * 1000
}) : null;

function getKey(header, callback) {
  if (!client) return callback(new Error('OIDC not configured'));
  client.getSigningKey(header.kid, function (err, key) {
    if (err) return callback(err);
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

// Middleware: validate OIDC Bearer token and attach claims to req.oidc
const oidcProtect = (req, res, next) => {
  // Skip OIDC validation in development if issuer is not properly configured
  if (process.env.NODE_ENV === 'development' && (!issuer || issuer.includes('example.com'))) {
    console.warn('OIDC validation skipped in development mode - using mock user');
    req.oidc = { 
      token: 'mock-token', 
      claims: { 
        sub: 'dev-user-123',
        email: 'dev@example.com',
        name: 'Development User',
        preferred_username: 'devuser'
      } 
    };
    return next();
  }

  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ success: false, message: 'Missing Bearer token' });

    jwt.verify(token, getKey, {
      audience,
      issuer,
      algorithms: ['RS256']
    }, (err, decoded) => {
      if (err) return res.status(401).json({ success: false, message: 'Invalid token', error: err.message });
      req.oidc = { token, claims: decoded };
      next();
    });
  } catch (e) {
    next(e);
  }
};

module.exports = { oidcProtect };
