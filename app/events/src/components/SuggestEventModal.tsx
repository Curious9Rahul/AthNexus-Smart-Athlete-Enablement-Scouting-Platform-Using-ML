import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { sportNames } from "../data/sportsCatalog";
import type { NewEventInput } from "../types";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (event: NewEventInput) => void;
};

type FormValues = {
  name: string;
  sport: string;
  level: string;
  venue: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  brochureUrl?: string;
};

type FormField = keyof FormValues | "brochure";

type FormErrors = Partial<Record<FormField, string>>;

const levels = ["District", "Interclg", "University", "State", "Khelo India", "National"];

const sports = sportNames;

const initialValues: FormValues = {
  name: "",
  sport: sports[0],
  level: "Interclg",
  venue: "",
  date: "",
  startTime: "09:00",
  endTime: "12:00",
  description: "",
  brochureUrl: undefined
};

const namePattern = /^[A-Za-z0-9][A-Za-z0-9 '&().,-]{4,79}$/;
const venuePattern = /^[A-Za-z0-9][A-Za-z0-9 '&().,/-]{4,119}$/;

const formatTo12Hour = (value: string) => {
  const [hourText, minuteText] = value.split(":");
  const hour = Number(hourText);
  const minute = Number(minuteText);

  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return value;
  }

  const suffix = hour >= 12 ? "PM" : "AM";
  const normalizedHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${normalizedHour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")} ${suffix}`;
};

const minutesFromTime = (value: string) => {
  const [hourText, minuteText] = value.split(":");
  const hour = Number(hourText);
  const minute = Number(minuteText);

  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return -1;
  }

  return hour * 60 + minute;
};

const getToday = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

const validateForm = (values: FormValues): FormErrors => {
  const errors: FormErrors = {};

  const trimmedName = values.name.trim();
  if (!namePattern.test(trimmedName) || !/[A-Za-z]/.test(trimmedName)) {
    errors.name = "Use a real event title (5-80 chars, letters/numbers, valid punctuation).";
  }

  if (!sports.includes(values.sport)) {
    errors.sport = "Choose a valid sport from the list.";
  }

  const trimmedVenue = values.venue.trim();
  if (!venuePattern.test(trimmedVenue) || !/[A-Za-z]/.test(trimmedVenue)) {
    errors.venue = "Use a valid venue name (5-120 chars).";
  }

  if (!values.date) {
    errors.date = "Date is required.";
  } else {
    const selectedDate = new Date(values.date);
    selectedDate.setHours(0, 0, 0, 0);

    const minDate = getToday();
    const maxDate = new Date(minDate);
    maxDate.setFullYear(maxDate.getFullYear() + 2);

    if (selectedDate < minDate || selectedDate > maxDate) {
      errors.date = "Date must be from today up to the next 2 years.";
    }
  }

  const startMinutes = minutesFromTime(values.startTime);
  const endMinutes = minutesFromTime(values.endTime);

  if (startMinutes < 0) {
    errors.startTime = "Start time is invalid.";
  }

  if (endMinutes < 0) {
    errors.endTime = "End time is invalid.";
  }

  if (startMinutes >= 0 && endMinutes >= 0 && endMinutes <= startMinutes) {
    errors.endTime = "End time must be after start time.";
  }

  const trimmedDescription = values.description.trim();
  const descriptionWords = trimmedDescription.split(/\s+/).filter(Boolean);

  if (trimmedDescription.length < 20 || trimmedDescription.length > 600 || descriptionWords.length < 5) {
    errors.description = "Add a real description (min 20 chars, at least 5 words).";
  }

  return errors;
};

const SuggestEventModal = ({ isOpen, onClose, onSubmit }: Props) => {
  const [formValues, setFormValues] = useState<FormValues>(initialValues);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  if (!isOpen) {
    return null;
  }

  const updateField = (key: keyof FormValues, value: string) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
    setFormErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleBrochureUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setFormValues((prev) => ({ ...prev, brochureUrl: undefined }));
      setFormErrors((prev) => ({ ...prev, brochure: undefined }));
      return;
    }

    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    const maxSize = 10 * 1024 * 1024;

    if (!isPdf) {
      setFormErrors((prev) => ({ ...prev, brochure: "Only PDF files are allowed." }));
      return;
    }

    if (file.size > maxSize) {
      setFormErrors((prev) => ({ ...prev, brochure: "PDF must be 10MB or smaller." }));
      return;
    }

    const brochureUrl = URL.createObjectURL(file);
    setFormValues((prev) => ({ ...prev, brochureUrl }));
    setFormErrors((prev) => ({ ...prev, brochure: undefined }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const errors = validateForm(formValues);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    const payload: NewEventInput = {
      name: formValues.name.trim(),
      sport: formValues.sport.trim(),
      level: formValues.level,
      gender: "Men",
      location: formValues.venue.trim(),
      date: formValues.date,
      time: `${formatTo12Hour(formValues.startTime)} - ${formatTo12Hour(formValues.endTime)}`,
      description: formValues.description.trim(),
      brochureUrl: formValues.brochureUrl
    };

    onSubmit(payload);
    setFormValues(initialValues);
    setFormErrors({});
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <article className="modal-card" onClick={(event) => event.stopPropagation()}>
        <h2>Suggest Event</h2>
        <form className="suggest-form" onSubmit={handleSubmit} noValidate>
          <label>
            Event Name
            <input
              required
              value={formValues.name}
              onChange={(event) => updateField("name", event.target.value)}
              className={formErrors.name ? "invalid-field" : ""}
            />
            {formErrors.name && <span className="field-error">{formErrors.name}</span>}
          </label>

          <label>
            Sport
            <select
              value={formValues.sport}
              onChange={(event) => updateField("sport", event.target.value)}
              className={formErrors.sport ? "invalid-field" : ""}
            >
              {sports.map((sport) => (
                <option key={sport} value={sport}>
                  {sport}
                </option>
              ))}
            </select>
            {formErrors.sport && <span className="field-error">{formErrors.sport}</span>}
          </label>

          <label>
            Level
            <select value={formValues.level} onChange={(event) => updateField("level", event.target.value)}>
              {levels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </label>

          <label>
            Venue
            <input
              required
              value={formValues.venue}
              onChange={(event) => updateField("venue", event.target.value)}
              className={formErrors.venue ? "invalid-field" : ""}
            />
            {formErrors.venue && <span className="field-error">{formErrors.venue}</span>}
          </label>

          <label>
            Date
            <input
              required
              type="date"
              value={formValues.date}
              onChange={(event) => updateField("date", event.target.value)}
              className={formErrors.date ? "invalid-field" : ""}
            />
            {formErrors.date && <span className="field-error">{formErrors.date}</span>}
          </label>

          <div className="time-row">
            <label>
              Start Time
              <input
                required
                type="time"
                value={formValues.startTime}
                onChange={(event) => updateField("startTime", event.target.value)}
                className={formErrors.startTime ? "invalid-field" : ""}
              />
              {formErrors.startTime && <span className="field-error">{formErrors.startTime}</span>}
            </label>

            <label>
              End Time
              <input
                required
                type="time"
                value={formValues.endTime}
                onChange={(event) => updateField("endTime", event.target.value)}
                className={formErrors.endTime ? "invalid-field" : ""}
              />
              {formErrors.endTime && <span className="field-error">{formErrors.endTime}</span>}
            </label>
          </div>

          <label>
            Description
            <textarea
              rows={4}
              value={formValues.description}
              onChange={(event) => updateField("description", event.target.value)}
              className={formErrors.description ? "invalid-field" : ""}
            />
            {formErrors.description && <span className="field-error">{formErrors.description}</span>}
          </label>

          <label>
            Brochure PDF (optional)
            <input type="file" accept="application/pdf" onChange={handleBrochureUpload} />
            {formErrors.brochure && <span className="field-error">{formErrors.brochure}</span>}
            {formValues.brochureUrl && <span className="upload-hint">PDF attached</span>}
          </label>

          <div className="modal-actions">
            <button type="button" className="secondary-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary-btn">
              Submit Suggestion
            </button>
          </div>
        </form>
      </article>
    </div>
  );
};

export default SuggestEventModal;

