export class UserSuspendedError extends Error {
  constructor(message = 'User account is suspended') {
    super(message);
    this.name = 'UserSuspendedError';
  }
}
