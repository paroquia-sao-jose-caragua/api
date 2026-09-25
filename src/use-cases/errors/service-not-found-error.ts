export class ServiceNotFoundError extends Error {
  constructor() {
    super('error-service-not-found');
  }
}
