export class AppointmentNotFoundError extends Error {
  constructor() {
    super('error-appointment-not-found');
  }
}
