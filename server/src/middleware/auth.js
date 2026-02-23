import { UnauthorizedError } from './errorHandler.js';

export function requireJarvisAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing or invalid authorization header');
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  const expectedToken = process.env.JARVIS_SECRET_TOKEN;

  if (!expectedToken) {
    console.error('JARVIS_SECRET_TOKEN not configured in environment');
    throw new Error('Server configuration error');
  }

  if (token !== expectedToken) {
    console.warn('Invalid Jarvis auth attempt with token:', token.substring(0, 8) + '...');
    throw new UnauthorizedError('Invalid authorization token');
  }

  // Token is valid
  req.jarvisAuth = true;
  next();
}
