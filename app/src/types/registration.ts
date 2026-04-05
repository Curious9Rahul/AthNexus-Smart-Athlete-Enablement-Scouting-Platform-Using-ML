export interface RegistrationField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'date' | 'file';
  required: boolean;
  placeholder?: string;
  options?: string[];
}

export interface Registration {
  athleteId: string;
  athleteName: string;
  athleteEmail: string;
  reg_status: 'PENDING' | 'APPROVED' | 'REJECTED';
  registeredAt: string;
  formData: Record<string, string>;
  reject_reason?: string;
}
