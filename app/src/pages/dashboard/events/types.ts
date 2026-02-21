export type Event = {
  id: number;
  name: string;
  sport: string;
  level: string;
  gender: "Men" | "Women";
  location: string;
  date: string;
  time: string;
  submissionDeadline?: string;
  queryResolutionDeadline?: string;
  reportingDate?: string;
  reportingTime?: string;
  tournamentEndDate?: string;
  description?: string;
  brochureUrl?: string;
};

export type ParticipationRequestStatus = "Pending" | "Approved" | "Rejected";

export type ParticipationRequest = {
  requestId: number;
  eventId: number;
  candidateName: string;
  candidateEmail: string;
  status: ParticipationRequestStatus;
};

export type NewEventInput = Omit<Event, "id">;