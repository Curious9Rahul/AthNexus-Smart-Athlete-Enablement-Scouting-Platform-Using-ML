import { sportsCatalog } from "./sportsCatalog";
import type { Event } from "../types";

const generatedLevels = ["Interclg", "Mumbai University", "Khelo India", "National"] as const;

const venueByLevel: Record<(typeof generatedLevels)[number], string[]> = {
  Interclg: ["University Sports Complex, Kalina", "Campus Arena, Fort"],
  "Mumbai University": ["MU Cricket Ground, Marine Lines", "MU Pavilion, Kalina"],
  "Khelo India": ["Kalinga Stadium, Bhubaneswar", "JLN Stadium, New Delhi"],
  National: ["Netaji Indoor Arena, Kolkata", "IGI Indoor Hall, New Delhi"]
};

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

const formatDate = (date: Date) => date.toISOString().slice(0, 10);

const formatTime = (date: Date) =>
  date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });

const shiftDate = (isoDate: string, days: number) => {
  const date = new Date(`${isoDate}T00:00:00`);
  date.setDate(date.getDate() + days);
  return formatDate(date);
};

type SyntheticScheduleConfig = {
  startOffsetDays: number;
  durationDays: number;
  submissionLeadDays?: number;
  queryLeadDays?: number;
  reportingLeadDays?: number;
};

const syntheticToday = new Date();
syntheticToday.setHours(0, 0, 0, 0);

const syntheticScheduleByEventId: Record<number, SyntheticScheduleConfig> = {
  1: { startOffsetDays: 3, durationDays: 1 },
  2: { startOffsetDays: 3, durationDays: 1 },
  3: { startOffsetDays: 6, durationDays: 3 },
  4: { startOffsetDays: 6, durationDays: 3 },
  5: { startOffsetDays: 10, durationDays: 2 },
  6: { startOffsetDays: 10, durationDays: 2 },
  7: { startOffsetDays: 17, durationDays: 3 },
  8: { startOffsetDays: 17, durationDays: 3 },
  9: { startOffsetDays: 8, durationDays: 5 },
  10: { startOffsetDays: 8, durationDays: 5 },
  11: { startOffsetDays: 35, durationDays: 11 },
  12: { startOffsetDays: 35, durationDays: 11 },
  13: { startOffsetDays: 2, durationDays: 2, submissionLeadDays: 1, queryLeadDays: 1, reportingLeadDays: 1 },
  14: { startOffsetDays: 2, durationDays: 2, submissionLeadDays: 1, queryLeadDays: 1, reportingLeadDays: 1 }
};

const buildOffsetDate = (offsetDays: number) => {
  const date = new Date(syntheticToday.getTime() + offsetDays * DAY_MS);
  return formatDate(date);
};

const applySyntheticSchedule = (event: Event): Event => {
  const config = syntheticScheduleByEventId[event.id];

  if (!config) {
    return event;
  }

  const eventDate = buildOffsetDate(config.startOffsetDays);
  const submissionLeadDays = Math.min(config.submissionLeadDays ?? 5, config.startOffsetDays);
  const queryLeadDays = Math.min(config.queryLeadDays ?? 3, config.startOffsetDays);
  const reportingLeadDays = Math.min(config.reportingLeadDays ?? 1, config.startOffsetDays);

  return {
    ...event,
    date: eventDate,
    submissionDeadline: shiftDate(eventDate, -submissionLeadDays),
    queryResolutionDeadline: shiftDate(eventDate, -queryLeadDays),
    reportingDate: shiftDate(eventDate, -reportingLeadDays),
    reportingTime: event.reportingTime ?? event.time,
    tournamentEndDate: shiftDate(eventDate, Math.max(config.durationDays - 1, 0))
  };
};

const districtBrochureUrl = "https://www.mu.ac.in/";
const stateBrochureUrl = "https://maharashtraathletics.in/event/";

// Seed records are intentionally rebased to near-current synthetic dates.
const districtEvents: Event[] = ([
  {
    id: 1,
    name: "Mumbai Suburban Inter Collegiate Yogasana Tournament",
    sport: "Yogasana",
    level: "District",
    gender: "Men",
    location: "SES's L. S. Raheja College, Santacruz",
    date: "2025-09-16",
    time: "09:00 AM - 06:00 PM",
    submissionDeadline: "2025-09-10",
    queryResolutionDeadline: "2025-09-13",
    reportingDate: "2025-09-16",
    reportingTime: "09:00 AM - 06:00 PM",
    tournamentEndDate: "2025-09-16",
    description:
      "Mumbai Suburban Zone Inter Collegiate Tournament 2025-2026. Yogasana (Men). Organizing college: SES's L. S. Raheja College, Santacruz.",
    brochureUrl: districtBrochureUrl
  },
  {
    id: 2,
    name: "Mumbai Suburban Inter Collegiate Yogasana Tournament",
    sport: "Yogasana",
    level: "District",
    gender: "Women",
    location: "SES's L. S. Raheja College, Santacruz",
    date: "2025-09-16",
    time: "09:00 AM - 06:00 PM",
    submissionDeadline: "2025-09-10",
    queryResolutionDeadline: "2025-09-13",
    reportingDate: "2025-09-16",
    reportingTime: "09:00 AM - 06:00 PM",
    tournamentEndDate: "2025-09-16",
    description:
      "Mumbai Suburban Zone Inter Collegiate Tournament 2025-2026. Yogasana (Women). Organizing college: SES's L. S. Raheja College, Santacruz.",
    brochureUrl: districtBrochureUrl
  },
  {
    id: 3,
    name: "Mumbai Suburban Inter Collegiate Kabaddi Tournament",
    sport: "Kabaddi",
    level: "District",
    gender: "Men",
    location: "S. M. Shetty College, Powai",
    date: "2025-09-18",
    time: "07:30 AM - 07:00 PM",
    submissionDeadline: "2025-09-11",
    queryResolutionDeadline: "2025-09-13",
    reportingDate: "2025-09-17",
    reportingTime: "09:00 AM - 01:00 PM",
    tournamentEndDate: "2025-09-20",
    description:
      "Mumbai Suburban Zone Inter Collegiate Tournament 2025-2026. Kabaddi (Men). Organizing college: S. M. Shetty College, Powai.",
    brochureUrl: districtBrochureUrl
  },
  {
    id: 4,
    name: "Mumbai Suburban Inter Collegiate Kabaddi Tournament",
    sport: "Kabaddi",
    level: "District",
    gender: "Women",
    location: "S. M. Shetty College, Powai",
    date: "2025-09-18",
    time: "07:30 AM - 07:00 PM",
    submissionDeadline: "2025-09-10",
    queryResolutionDeadline: "2025-09-13",
    reportingDate: "2025-09-17",
    reportingTime: "07:30 AM - 07:00 PM",
    tournamentEndDate: "2025-09-20",
    description:
      "Mumbai Suburban Zone Inter Collegiate Tournament 2025-2026. Kabaddi (Women). Organizing college: S. M. Shetty College, Powai.",
    brochureUrl: districtBrochureUrl
  },
  {
    id: 5,
    name: "Mumbai Suburban Inter Collegiate Table Tennis Tournament",
    sport: "Table Tennis",
    level: "District",
    gender: "Men",
    location: "Sathaye College, Vile Parle",
    date: "2025-09-23",
    time: "09:00 AM - 06:00 PM",
    submissionDeadline: "2025-09-13",
    queryResolutionDeadline: "2025-09-16",
    reportingDate: "2025-09-23",
    reportingTime: "09:00 AM - 06:00 PM",
    tournamentEndDate: "2025-09-24",
    description:
      "Mumbai Suburban Zone Inter Collegiate Tournament 2025-2026. Table Tennis (Men). Organizing college: Sathaye College, Vile Parle.",
    brochureUrl: districtBrochureUrl
  },
  {
    id: 6,
    name: "Mumbai Suburban Inter Collegiate Table Tennis Tournament",
    sport: "Table Tennis",
    level: "District",
    gender: "Women",
    location: "Sathaye College, Vile Parle",
    date: "2025-09-23",
    time: "09:00 AM - 06:00 PM",
    submissionDeadline: "2025-09-13",
    queryResolutionDeadline: "2025-09-16",
    reportingDate: "2025-09-23",
    reportingTime: "09:00 AM - 06:00 PM",
    tournamentEndDate: "2025-09-24",
    description:
      "Mumbai Suburban Zone Inter Collegiate Tournament 2025-2026. Table Tennis (Women). Organizing college: Sathaye College, Vile Parle.",
    brochureUrl: districtBrochureUrl
  },
  {
    id: 7,
    name: "Mumbai Suburban Inter Collegiate Shooting Tournament",
    sport: "Shooting",
    level: "District",
    gender: "Men",
    location: "Tolani College, Andheri",
    date: "2025-11-07",
    time: "08:00 AM - 06:00 PM",
    submissionDeadline: "2025-09-05",
    queryResolutionDeadline: "2025-10-02",
    reportingDate: "2025-11-07",
    reportingTime: "08:00 AM - 06:00 PM",
    tournamentEndDate: "2025-11-09",
    description:
      "Mumbai Suburban Zone Inter Collegiate Tournament 2025-2026. Shooting (Men). Organizing college: Tolani College, Andheri.",
    brochureUrl: districtBrochureUrl
  },
  {
    id: 8,
    name: "Mumbai Suburban Inter Collegiate Shooting Tournament",
    sport: "Shooting",
    level: "District",
    gender: "Women",
    location: "Tolani College, Andheri",
    date: "2025-11-07",
    time: "08:00 AM - 06:00 PM",
    submissionDeadline: "2025-09-05",
    queryResolutionDeadline: "2025-10-02",
    reportingDate: "2025-11-07",
    reportingTime: "08:00 AM - 06:00 PM",
    tournamentEndDate: "2025-11-09",
    description:
      "Mumbai Suburban Zone Inter Collegiate Tournament 2025-2026. Shooting (Women). Organizing college: Tolani College, Andheri.",
    brochureUrl: districtBrochureUrl
  }
] as Event[]).map(applySyntheticSchedule);

const indoorAthleticsDisciplines =
  "Disciplines: 60m, 60m hurdles, indoor heptathlon, track events (100m/200m/400m/800m/1500m/5000m/10000m, relays 4x100m and 4x400m), field events (high jump, long jump, triple jump, pole vault, shot put, discus, javelin, hammer throw), and endurance events (3000m steeplechase and race walking up to 20000m).";

const standardAthleticsDisciplines =
  "Disciplines: track events (100m/200m/400m/800m/1500m/5000m/10000m, relays 4x100m and 4x400m), field events (high jump, long jump, triple jump, pole vault, shot put, discus, javelin, hammer throw), and endurance events (3000m steeplechase and race walking up to 20000m).";

const stateEvents: Event[] = ([
  {
    id: 9,
    name: "Maharashtra State Championships for National Indoor Meet",
    sport: "Athletics",
    level: "State",
    gender: "Men",
    location: "Maharashtra Athletics Association, Kopargaon (Ahilyanagar)",
    date: "2026-02-15",
    time: "08:00 AM - 05:00 PM",
    submissionDeadline: "2026-02-12",
    queryResolutionDeadline: "2026-02-14",
    reportingDate: "2026-02-15",
    reportingTime: "08:00 AM - 05:00 PM",
    tournamentEndDate: "2026-02-28",
    description:
      `Organizing body: Maharashtra Athletics Association, Kopargaon (Ahilyanagar). ${indoorAthleticsDisciplines}`,
    brochureUrl: stateBrochureUrl
  },
  {
    id: 10,
    name: "Maharashtra State Championships for National Indoor Meet",
    sport: "Athletics",
    level: "State",
    gender: "Women",
    location: "Maharashtra Athletics Association, Kopargaon (Ahilyanagar)",
    date: "2026-02-15",
    time: "08:00 AM - 05:00 PM",
    submissionDeadline: "2026-02-12",
    queryResolutionDeadline: "2026-02-14",
    reportingDate: "2026-02-15",
    reportingTime: "08:00 AM - 05:00 PM",
    tournamentEndDate: "2026-02-28",
    description:
      `Organizing body: Maharashtra Athletics Association, Kopargaon (Ahilyanagar). ${indoorAthleticsDisciplines}`,
    brochureUrl: stateBrochureUrl
  },
  {
    id: 11,
    name: "Maharashtra State Senior Athletics Championship",
    sport: "Athletics",
    level: "State",
    gender: "Men",
    location: "Maharashtra Athletics Association, Pune",
    date: "2026-05-26",
    time: "09:00 AM - 06:00 PM",
    submissionDeadline: "2026-05-15",
    queryResolutionDeadline: "2026-05-20",
    reportingDate: "2026-05-25",
    reportingTime: "09:00 AM - 06:00 PM",
    tournamentEndDate: "2026-06-05",
    description: `Organizing body: Maharashtra Athletics Association, Pune. ${standardAthleticsDisciplines}`,
    brochureUrl: stateBrochureUrl
  },
  {
    id: 12,
    name: "Maharashtra State Senior Athletics Championship",
    sport: "Athletics",
    level: "State",
    gender: "Women",
    location: "Maharashtra Athletics Association, Pune",
    date: "2026-05-26",
    time: "09:00 AM - 06:00 PM",
    submissionDeadline: "2026-05-15",
    queryResolutionDeadline: "2026-05-20",
    reportingDate: "2026-05-25",
    reportingTime: "09:00 AM - 06:00 PM",
    tournamentEndDate: "2026-06-05",
    description: `Organizing body: Maharashtra Athletics Association, Pune. ${standardAthleticsDisciplines}`,
    brochureUrl: stateBrochureUrl
  },
  {
    id: 13,
    name: "U-14 Basketball 3x3 Tournament",
    sport: "Basketball",
    level: "State",
    gender: "Men",
    location: "District Sports Complex, Sangli",
    date: "2026-02-14",
    time: "07:30 AM - 09:00 AM",
    submissionDeadline: "2026-02-08",
    queryResolutionDeadline: "2026-02-11",
    reportingDate: "2026-02-14",
    reportingTime: "07:30 AM - 09:00 AM",
    tournamentEndDate: "2026-02-15",
    description:
      "Format: 3x3 half-court, league-cum-knockout, with three players on court. Competitions include Open Men, Open Women, and U-14 brackets.",
    brochureUrl: stateBrochureUrl
  },
  {
    id: 14,
    name: "U-14 Basketball 3x3 Tournament",
    sport: "Basketball",
    level: "State",
    gender: "Women",
    location: "District Sports Complex, Sangli",
    date: "2026-02-14",
    time: "07:30 AM - 09:00 AM",
    submissionDeadline: "2026-02-08",
    queryResolutionDeadline: "2026-02-11",
    reportingDate: "2026-02-14",
    reportingTime: "07:30 AM - 09:00 AM",
    tournamentEndDate: "2026-02-15",
    description:
      "Format: 3x3 half-court, league-cum-knockout, with three players on court. Competitions include Open Men, Open Women, and U-14 brackets.",
    brochureUrl: stateBrochureUrl
  }
] as Event[]).map(applySyntheticSchedule);

const buildGeneratedSchedule = (eventDate: string, eventTime: string, durationDays: number) => ({
  submissionDeadline: shiftDate(eventDate, -12),
  queryResolutionDeadline: shiftDate(eventDate, -8),
  reportingDate: shiftDate(eventDate, -1),
  reportingTime: "09:00 AM - 01:00 PM",
  tournamentEndDate: shiftDate(eventDate, Math.max(durationDays - 1, 0)),
  description: `Online submission closes on ${shiftDate(eventDate, -12)}. Query resolution closes on ${shiftDate(eventDate, -8)}. Reporting on ${shiftDate(eventDate, -1)} (09:00 AM - 01:00 PM). Tournament timing: ${eventTime}.`
});

const buildEventsForGender = (gender: "Men" | "Women", startId: number): Event[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let nextId = startId;
  const events: Event[] = [];

  generatedLevels.forEach((level, levelIndex) => {
    const venues = venueByLevel[level];

    sportsCatalog.forEach((sport, sportIndex) => {
      const dayOffset = (sportIndex % 45) + levelIndex + (gender === "Women" ? 1 : 0);
      const start = new Date(today.getTime() + dayOffset * DAY_MS);
      const startHour = 7 + ((sportIndex + levelIndex * 3) % 11);
      start.setHours(startHour, sportIndex % 2 === 0 ? 0 : 30, 0, 0);

      const durationHours = 2 + (sportIndex % 3);
      const end = new Date(start.getTime() + durationHours * HOUR_MS);

      const levelLabel = level === "Mumbai University" ? "University" : level;
      const eventDate = formatDate(start);
      const eventTime = `${formatTime(start)} - ${formatTime(end)}`;
      const durationDays = sport.category === "Outdoor" ? 2 : 1;
      const schedule = buildGeneratedSchedule(eventDate, eventTime, durationDays);

      events.push({
        id: nextId,
        name: `${levelLabel} ${sport.name} Championship`,
        sport: sport.name,
        level,
        gender,
        location: venues[sportIndex % venues.length],
        date: eventDate,
        time: eventTime,
        submissionDeadline: schedule.submissionDeadline,
        queryResolutionDeadline: schedule.queryResolutionDeadline,
        reportingDate: schedule.reportingDate,
        reportingTime: schedule.reportingTime,
        tournamentEndDate: schedule.tournamentEndDate,
        description: `${sport.name} (${sport.category.toLowerCase()}) event for ${levelLabel.toLowerCase()} level athletes. ${schedule.description}`,
        brochureUrl:
          sportIndex % 5 === 0
            ? `https://example.com/brochures/${sport.name.toLowerCase().replace(/\s+/g, "-")}.pdf`
            : undefined
      });

      nextId += 1;
    });
  });

  return events;
};

const menStartId = districtEvents.length + stateEvents.length + 1;
const menEvents = buildEventsForGender("Men", menStartId);
const womenStartId = menStartId + menEvents.length;
const womenEvents = buildEventsForGender("Women", womenStartId);

export const events: Event[] = [...districtEvents, ...stateEvents, ...menEvents, ...womenEvents];
