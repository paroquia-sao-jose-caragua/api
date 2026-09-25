export class AppointmentsDisabledError extends Error {
  constructor(message = 'error-appointments-disabled') {
    super(message);
    this.name = 'AppointmentsDisabledError';
  }
}
