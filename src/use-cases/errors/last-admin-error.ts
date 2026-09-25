export class LastAdminError extends Error {
  constructor(message = 'Cannot demote or suspend the last active administrator') {
    super(message);
    this.name = 'LastAdminError';
  }
}
