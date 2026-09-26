export class AppointmentSlotUnavailableError extends Error {
  constructor() {
    super('error-appointment-slot-unavailable');
  }
}
