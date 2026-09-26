export class UserNotPendingError extends Error {
  constructor(message = 'User does not have pending status') {
    super(message);
    this.name = 'UserNotPendingError';
  }
}
