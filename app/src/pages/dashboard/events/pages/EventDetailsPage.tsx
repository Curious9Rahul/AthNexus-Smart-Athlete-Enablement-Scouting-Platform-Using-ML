import type { Event } from "../types";

type Props = {
  event: Event;
  onBack: () => void;
};

type ReferenceItem = {
  label: string;
  url: string;
};

type TimelineStage = {
  id: string;
  title: string;
  startDate: string;
  endDate?: string;
  description: string;
};

type ScheduleData = {
  submissionDeadline: string;
  queryResolutionDeadline: string;
  reportingDate: string;
  reportingTime: string;
  tournamentStartDate: string;
  tournamentEndDate: string;
};

const baseReferencesByCategory: Record<string, ReferenceItem[]> = {
  District: [
    { label: "Directorate of Sports Maharashtra (DSYS)", url: "https://sports.maharashtra.gov.in" },
    { label: "District Sports Office (DSO) Portal", url: "https://dso.maharashtra.gov.in" }
  ],
  "University / Inter-College": [
    { label: "Association of Indian Universities (AIU)", url: "https://www.aiu.ac.in" },
    { label: "University of Mumbai (Sports Section)", url: "https://mu.ac.in" }
  ],
  State: [{ label: "Maharashtra Olympic Association", url: "https://maharashtraolympic.org" }],
  National: [
    { label: "Sports Authority of India (SAI)", url: "https://sportsauthorityofindia.nic.in" },
    { label: "Indian Olympic Association", url: "https://olympic.ind.in" }
  ],
  "Khelo India": [
    { label: "Khelo India Official Portal", url: "https://kheloindia.gov.in" },
    { label: "Ministry of Youth Affairs and Sports (MYAS)", url: "https://yas.nic.in" }
  ]
};

const nationalFederationReferences: ReferenceItem[] = [
  { label: "BCCI (Cricket)", url: "https://www.bcci.tv" },
  { label: "AIFF (Football)", url: "https://www.the-aiff.com" },
  { label: "Hockey India", url: "https://hockeyindia.org" },
  { label: "Badminton Association of India", url: "https://badmintonindia.org" },
  { label: "Table Tennis Federation of India", url: "https://ttfi.org" }
];

const eligibilityByCategory: Record<string, string[]> = {
  District: [
    "School and college athletes as per district circulars",
    "Valid institute ID and district eligibility documents",
    "Entries must follow DSYS/DSO tournament guidelines"
  ],
  "University / Inter-College": [
    "Students enrolled in affiliated colleges or universities",
    "College sports department nomination may be required",
    "ID card and academic enrollment proof at reporting"
  ],
  State: [
    "Athletes selected through district or federation pathways",
    "State association rules and age/category criteria apply",
    "Approved registration documents required before reporting"
  ],
  National: [
    "Qualified athletes through federation or state-level channels",
    "Compliance with national federation eligibility norms",
    "Mandatory identification and participation approval documents"
  ],
  "Khelo India": [
    "Athletes meeting scheme-specific age and category criteria",
    "Registration and verification through Khelo India process",
    "Compliance with MYAS and event-specific eligibility terms"
  ]
};

const getReferenceCategory = (level: string) => {
  if (level === "Interclg" || level === "University" || level === "Mumbai University") {
    return "University / Inter-College";
  }

  return level;
};

const shiftDate = (isoDate: string, days: number) => {
  const date = new Date(`${isoDate}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

const formatDateLabel = (isoDate: string) => {
  const date = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return { day: "--", month: "--", full: isoDate };
  }

  const day = date.toLocaleDateString("en-IN", { day: "2-digit" });
  const month = date.toLocaleDateString("en-IN", { month: "short" });
  const full = date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" });

  return { day, month, full };
};

const getScheduleData = (event: Event): ScheduleData => {
  const tournamentStartDate = event.date;
  const tournamentEndDate = event.tournamentEndDate ?? event.date;

  return {
    submissionDeadline: event.submissionDeadline ?? shiftDate(tournamentStartDate, -12),
    queryResolutionDeadline: event.queryResolutionDeadline ?? shiftDate(tournamentStartDate, -8),
    reportingDate: event.reportingDate ?? shiftDate(tournamentStartDate, -1),
    reportingTime: event.reportingTime ?? event.time,
    tournamentStartDate,
    tournamentEndDate
  };
};

const buildTimelineStages = (event: Event, schedule: ScheduleData): TimelineStage[] => {
  return [
    {
      id: "reporting",
      title: "Reporting and Verification",
      startDate: schedule.reportingDate,
      description: `Report with required documents and kit. Reporting time: ${schedule.reportingTime}.`
    },
    {
      id: "tournament-window",
      title: "Tournament Window",
      startDate: schedule.tournamentStartDate,
      endDate: schedule.tournamentEndDate,
      description: `Competition schedule at ${event.location}. Event timing: ${event.time}.`
    }
  ];
};

const EventDetailsPage = ({ event, onBack }: Props) => {
  if (!event) {
    return (
      <div className="details-page">
        <section className="details-shell">
          <h1>Event not found</h1>
          <button className="back-link" onClick={onBack}>
            Back to events
          </button>
        </section>
      </div>
    );
  }

  const brochureUrl = event.brochureUrl;
  const isPdfBrochure =
    !!brochureUrl && (brochureUrl.toLowerCase().includes(".pdf") || brochureUrl.startsWith("blob:"));

  const referenceCategory = getReferenceCategory(event.level);
  const baseReferences = baseReferencesByCategory[referenceCategory] ?? [];
  const categoryReferences =
    referenceCategory === "National" ? [...baseReferences, ...nationalFederationReferences] : baseReferences;
  const eligibility = eligibilityByCategory[referenceCategory] ?? [
    "Check official circular and notification for exact eligibility.",
    "Carry valid identification and required participation documents."
  ];

  const schedule = getScheduleData(event);
  const timelineStages = buildTimelineStages(event, schedule);

  const hashtags = [
    `#${event.sport.replace(/\s+/g, "")}`,
    `#${referenceCategory.replace(/[^a-zA-Z]/g, "")}`,
    "#AthNexus"
  ];

  const sectionTabs = [
    { id: "eligibility", label: "Eligibility" },
    { id: "submission", label: "Schedule" },
    { id: "stages", label: "Stages & Timeline" },
    { id: "details", label: "Details" },
    { id: "references", label: "References" },
    { id: "brochure", label: "Brochure" }
  ];

  return (
    <div className="details-page details-remix-page">
      <section className="details-shell details-remix-shell">
        <div className="details-top-strip">
          <button className="back-link details-back-link" onClick={onBack}>
            Back to events
          </button>
          <nav className="details-anchor-tabs" aria-label="Event details sections">
            {sectionTabs.map((tab) => (
              <a key={tab.id} href={`#${tab.id}`}>
                {tab.label}
              </a>
            ))}
          </nav>
        </div>

        <article className="details-hero-card">
          <div className="details-hero-main">
            <p className="details-level-kicker">{referenceCategory}</p>
            <h1>{event.name}</h1>
            <p className="details-organizer">{event.location}</p>

            <div className="details-team-info">
              <p>Team Size</p>
              <strong>Individual Participation</strong>
            </div>

            <div className="details-category-pills">
              <span>{event.level} Level</span>
              <span>{event.sport}</span>
              <span>{event.gender}</span>
            </div>

            <p className="details-hashtags">{hashtags.join("   ")}</p>
          </div>

          <aside className="details-hero-side">
            <p className="status-chip">Open</p>
            <p className="date-chip">{formatDateLabel(event.date).full}</p>
            <p className="time-chip">{event.time}</p>
          </aside>
        </article>

        <section id="eligibility" className="details-block details-eligibility-block">
          <h2>Eligibility</h2>
          <p>{eligibility.join(" | ")}</p>
        </section>

        <section id="submission" className="details-block">
          <h2>Schedule</h2>
          <div className="submission-grid">
            <article className="submission-card">
              <h3>Reporting and Verification</h3>
              <p>
                {formatDateLabel(schedule.reportingDate).full} | {schedule.reportingTime}
              </p>
            </article>
            <article className="submission-card">
              <h3>Tournament Window</h3>
              <p>
                {formatDateLabel(schedule.tournamentStartDate).full} - {formatDateLabel(schedule.tournamentEndDate).full}
              </p>
            </article>
          </div>
        </section>

        <section id="stages" className="details-block">
          <h2>Stages and Timelines</h2>
          <div className="timeline-list">
            {timelineStages.map((stage) => {
              const start = formatDateLabel(stage.startDate);
              const end = stage.endDate ? formatDateLabel(stage.endDate) : undefined;
              const rangeText = end ? `${start.full} -> ${end.full}` : `${start.full}`;

              return (
                <article key={stage.id} className="timeline-item">
                  <div className="timeline-date-badge">
                    <strong>{start.day}</strong>
                    <span>{start.month}</span>
                  </div>

                  <div className="timeline-content">
                    <p className="timeline-range">{rangeText}</p>
                    <div className="timeline-card">
                      <h3>{stage.title}</h3>
                      <p>{stage.description}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section id="details" className="details-block">
          <h2>All that you need to know about {event.name}</h2>
          <p>
            {event.description ??
              `${event.name} is a ${referenceCategory.toLowerCase()} sports opportunity for ${event.gender.toLowerCase()} participants in ${event.sport}.`}
          </p>

          <h3>Rules and Regulations</h3>
          <ul>
            <li>Participants must report with valid identification and event documents.</li>
            <li>Entries are subject to organizer and federation verification rules.</li>
            <li>Scheduling or venue changes, if any, will follow official circulars.</li>
          </ul>
        </section>

        <section id="references" className="details-block">
          <h2>Official References</h2>
          {categoryReferences.length > 0 ? (
            <ul>
              {categoryReferences.map((item) => (
                <li key={item.url}>
                  <a href={item.url} target="_blank" rel="noreferrer">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p>Official references will be added for this category.</p>
          )}
        </section>

        <section id="brochure" className="details-block">
          <h2>Brochure Preview</h2>
          {brochureUrl ? (
            isPdfBrochure ? (
              <iframe title={`${event.name} brochure`} src={brochureUrl} className="brochure-frame" />
            ) : (
              <p>
                Reference link:{" "}
                <a href={brochureUrl} target="_blank" rel="noreferrer">
                  {brochureUrl}
                </a>
              </p>
            )
          ) : (
            <p>Brochure coming soon</p>
          )}
        </section>
      </section>
    </div>
  );
};

export default EventDetailsPage;

