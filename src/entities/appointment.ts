import type { AppointmentService } from './appointment-service';
import type { PastoralAgent } from './pastoral-agent';

export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled';

export interface PatientConditions {
  isBedridden?: boolean;
  canSwallowHost?: boolean;
  isLucid?: boolean;
  notes?: string;
}

export interface Appointment {
  id: string;
  agentId: string;
  serviceId: string;
  communityId: string | null;
  requesterName: string;
  requesterPhone: string;
  requesterEmail: string | null;
  requesterRelationship: string | null;
  patientName: string | null;
  patientAddress: string | null;
  patientConditions: PatientConditions | null;
  appointmentDate: string; // "YYYY-MM-DD"
  startTime: string; // "14:00"
  endTime: string; // "14:30"
  status: AppointmentStatus;
  accessToken: string;
  requesterNotes: string | null;
  privatePastoralNotes: string | null;
  cancellationReason: string | null;
  createdAt?: string;
  updatedAt?: string | null;

  // Joined relations
  service?: AppointmentService | null;
  agent?: PastoralAgent | null;
  community?: {
    id: string;
    name: string;
  } | null;
}
