export class InvalidOrExpiredTokenError extends Error {
  constructor(message = 'Invalid or expired token') {
    super(message);
    this.name = 'InvalidOrExpiredTokenError';
  }
}
