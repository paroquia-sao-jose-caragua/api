export class InvalidCurrentPasswordError extends Error {
  constructor(message = 'Current password does not match') {
    super(message);
    this.name = 'InvalidCurrentPasswordError';
  }
}
