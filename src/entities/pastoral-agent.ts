import type { AppointmentService } from './appointment-service';

export interface PastoralAgent {
  id: string;
  name: string;
  title: string | null;
  actingRole: string;
  userId: string | null;
  phone: string;
  email: string | null;
  communityId: string | null;
  photoId: string | null;
  acceptsAppointments: boolean;
  active: boolean;
  services?: AppointmentService[];
  community?: {
    id: string;
    name: string;
  } | null;
  photoUrl?: string | null;
  createdAt?: string;
  updatedAt?: string | null;
}
