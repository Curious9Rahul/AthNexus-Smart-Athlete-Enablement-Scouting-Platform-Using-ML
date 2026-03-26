export interface TournamentEmail {
  id?: string;
  title: string;
  sport: string;
  level: string;
  type: string;
  format: 'Solo' | 'Duo' | 'Team';
  gender: string;
  venue: string;
  city: string;
  state: string;
  description: string;
  start_date: string;
  end_date: string;
  deadline: string;
  approval_status: "PENDING" | "APPROVED" | "REJECTED";
  status: "LIVE" | "UPCOMING" | "COMPLETED";
  max_participants: number;
  registered_count: number;
  prize: string;
  image_emoji: string;
  created_by: string;
  created_by_role: "admin" | "athlete";
  created_at: string;
  registrations: any[];
}

export const tournamentsData: TournamentEmail[] = [
  {
    "id": "evt_001",
    "title": "District Athletics Championship 2026",
    "sport": "Athletics",
    "level": "District",
    "type": "Outdoor",
    "format": "Solo",
    "gender": "Open",
    "venue": "Shivaji Sports Complex",
    "city": "Mumbai",
    "state": "Maharashtra",
    "description": "Annual district-level athletics meet covering sprints, jumps, and throws. Top 3 athletes qualify for State level.",
    "start_date": "2026-04-10T09:00:00",
    "end_date": "2026-04-12T18:00:00",
    "deadline": "2026-04-05T23:59:00",
    "approval_status": "APPROVED",
    "status": "UPCOMING",
    "max_participants": 120,
    "registered_count": 47,
    "prize": "Certificate + ₹5,000",
    "image_emoji": "🏃",
    "created_by": "admin",
    "created_by_role": "admin",
    "created_at": "2026-03-01T10:00:00",
    "registrations": []
  },
  {
    "id": "evt_002",
    "title": "Intercollegiate Basketball Tournament",
    "sport": "Basketball",
    "level": "Interclg",
    "type": "Indoor",
    "format": "Team",
    "gender": "Open",
    "venue": "Rajiv Gandhi Indoor Stadium",
    "city": "Pune",
    "state": "Maharashtra",
    "description": "5v5 basketball tournament open to all Maharashtra colleges. Teams of 12 players. Round-robin + knockout format.",
    "start_date": "2026-03-22T10:00:00",
    "end_date": "2026-03-24T20:00:00",
    "deadline": "2026-03-21T23:59:00",
    "approval_status": "APPROVED",
    "status": "LIVE",
    "max_participants": 16,
    "registered_count": 14,
    "prize": "Trophy + ₹15,000",
    "image_emoji": "🏀",
    "created_by": "admin",
    "created_by_role": "admin",
    "created_at": "2026-03-01T10:00:00",
    "registrations": []
  },
  {
    "id": "evt_003",
    "title": "Khelo India Women's Badminton Cup",
    "sport": "Badminton",
    "level": "Khelo India",
    "type": "Indoor",
    "format": "Solo",
    "gender": "Women",
    "venue": "Balewadi Sports Authority",
    "city": "Pune",
    "state": "Maharashtra",
    "description": "Women-only badminton singles under Khelo India initiative. U-21 category. Top performer gets national camp recommendation.",
    "start_date": "2026-05-01T08:00:00",
    "end_date": "2026-05-03T17:00:00",
    "deadline": "2026-04-25T23:59:00",
    "approval_status": "APPROVED",
    "status": "UPCOMING",
    "max_participants": 64,
    "registered_count": 23,
    "prize": "Medal + National Camp Entry",
    "image_emoji": "🏸",
    "created_by": "admin",
    "created_by_role": "admin",
    "created_at": "2026-03-10T10:00:00",
    "registrations": []
  }
];
