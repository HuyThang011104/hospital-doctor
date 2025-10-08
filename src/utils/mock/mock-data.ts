// Mock data for Hospital Doctor Portal

export interface Doctor {
  id: number;
  specialty_id: number;
  full_name: string;
  username: string;
  password: string;
  phone: string;
  birth_date: string;
  gender: string;
  status: string;
  email: string;
  join_date: string;
  role: string;
  address: string;
}

export interface Specialty {
  id: number;
  name: string;
  description: string;
}

export interface Department {
  id: number;
  name: string;
  description: string;
  location: string;
}

export interface Patient {
  id: number;
  full_name: string;
  personal_id: string;
  phone: string;
  birth_date: string;
  gender: string;
  status: string;
  email: string;
  address: string;
}

export interface Appointment {
  id: number;
  patient_id: number;
  doctor_id: number;
  appointment_date: string;
  shift_id: number;
  status: string;
  notes: string;
  patient?: Patient;
  doctor?: Doctor;
  shift?: Shift;
}

export interface Shift {
  id: number;
  name: string;
  start_time: string;
  end_time: string;
}

export interface Room {
  id: number;
  name: string;
  type: string;
  floor: number;
  department_id: number;
}

export interface DoctorWorkSchedule {
  id: number;
  doctor_id: number;
  shift_id: number;
  room_id: number;
  work_date: string;
  status: string;
}

export interface MedicalRecord {
  id: number;
  patient_id: number;
  doctor_id: number;
  diagnosis: string;
  treatment: string;
  record_date: string;
}

export interface Prescription {
  id: number;
  medical_record_id: number;
  medicine_id: number;
  dosage: string;
  frequency: string;
  duration: string;
}

export interface Medicine {
  id: number;
  name: string;
  description: string;
  unit_price: number;
  quantity: number;
  expiry_date: string;
}

export interface LabTest {
  id: number;
  medical_record_id: number;
  test_type: string;
  result: string;
  test_date: string;
}

export interface LeaveRequest {
  id: number;
  doctor_id: number;
  request_date: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: string;
}

export interface Certificate {
  id: number;
  doctor_id: number;
  name: string;
  issued_by: string;
  issue_date: string;
  expiry_date: string;
}

// Mock Data
export const currentDoctor: Doctor = {
  id: 1,
  specialty_id: 1,
  full_name: "Dr. Sarah Johnson",
  username: "sjohnson",
  password: "password123",
  phone: "+1-555-0123",
  birth_date: "1985-03-15",
  gender: "Female",
  status: "Active",
  email: "sarah.johnson@hospital.com",
  join_date: "2018-01-15",
  role: "Senior Doctor",
  address: "123 Medical Street, Healthcare City, HC 12345",
};

export const specialties: Specialty[] = [
  {
    id: 1,
    name: "Cardiology",
    description: "Heart and cardiovascular system specialists",
  },
  {
    id: 2,
    name: "Neurology",
    description: "Brain and nervous system specialists",
  },
  { id: 3, name: "Orthopedics", description: "Bone and joint specialists" },
  {
    id: 4,
    name: "Pediatrics",
    description: "Children's healthcare specialists",
  },
];

export const departments: Department[] = [
  {
    id: 1,
    name: "Cardiology",
    description: "Heart Care Department",
    location: "Building A, Floor 3",
  },
  {
    id: 2,
    name: "Emergency",
    description: "Emergency Care",
    location: "Building A, Floor 1",
  },
  {
    id: 3,
    name: "Surgery",
    description: "Surgical Department",
    location: "Building B, Floor 2",
  },
  {
    id: 4,
    name: "ICU",
    description: "Intensive Care Unit",
    location: "Building A, Floor 4",
  },
];

export const patients: Patient[] = [
  {
    id: 1,
    full_name: "John Smith",
    personal_id: "123456789",
    phone: "+1-555-0101",
    birth_date: "1978-06-20",
    gender: "Male",
    status: "Active",
    email: "john.smith@email.com",
    address: "456 Patient Ave, City, ST 12345",
  },
  {
    id: 2,
    full_name: "Emily Davis",
    personal_id: "987654321",
    phone: "+1-555-0102",
    birth_date: "1990-11-12",
    gender: "Female",
    status: "Active",
    email: "emily.davis@email.com",
    address: "789 Health St, City, ST 12345",
  },
  {
    id: 3,
    full_name: "Michael Brown",
    personal_id: "456789123",
    phone: "+1-555-0103",
    birth_date: "1965-09-08",
    gender: "Male",
    status: "Active",
    email: "michael.brown@email.com",
    address: "321 Care Blvd, City, ST 12345",
  },
  {
    id: 4,
    full_name: "Lisa Wilson",
    personal_id: "789123456",
    phone: "+1-555-0104",
    birth_date: "1982-04-25",
    gender: "Female",
    status: "Active",
    email: "lisa.wilson@email.com",
    address: "654 Wellness Dr, City, ST 12345",
  },
];

export const shifts: Shift[] = [
  { id: 1, name: "Morning", start_time: "08:00", end_time: "16:00" },
  { id: 2, name: "Evening", start_time: "16:00", end_time: "00:00" },
  { id: 3, name: "Night", start_time: "00:00", end_time: "08:00" },
];

export const rooms: Room[] = [
  { id: 1, name: "Room 301", type: "Consultation", floor: 3, department_id: 1 },
  { id: 2, name: "Room 302", type: "Consultation", floor: 3, department_id: 1 },
  { id: 3, name: "Room 101", type: "Emergency", floor: 1, department_id: 2 },
  { id: 4, name: "OR 201", type: "Surgery", floor: 2, department_id: 3 },
];

export const appointments: Appointment[] = [
  {
    id: 1,
    patient_id: 1,
    doctor_id: 1,
    appointment_date: "2024-12-20T10:00:00",
    shift_id: 1,
    status: "Scheduled",
    notes: "Regular cardiology checkup",
  },
  {
    id: 2,
    patient_id: 2,
    doctor_id: 1,
    appointment_date: "2024-12-20T14:30:00",
    shift_id: 1,
    status: "Scheduled",
    notes: "Follow-up appointment",
  },
  {
    id: 3,
    patient_id: 3,
    doctor_id: 1,
    appointment_date: "2024-12-20T16:00:00",
    shift_id: 2,
    status: "Completed",
    notes: "Chest pain evaluation",
  },
  {
    id: 4,
    patient_id: 4,
    doctor_id: 1,
    appointment_date: "2024-12-21T09:00:00",
    shift_id: 1,
    status: "Scheduled",
    notes: "New patient consultation",
  },
];

export const doctorWorkSchedule: DoctorWorkSchedule[] = [
  {
    id: 1,
    doctor_id: 1,
    shift_id: 1,
    room_id: 1,
    work_date: "2024-12-20",
    status: "Active",
  },
  {
    id: 2,
    doctor_id: 1,
    shift_id: 1,
    room_id: 1,
    work_date: "2024-12-21",
    status: "Active",
  },
  {
    id: 3,
    doctor_id: 1,
    shift_id: 2,
    room_id: 2,
    work_date: "2024-12-22",
    status: "Active",
  },
  {
    id: 4,
    doctor_id: 1,
    shift_id: 1,
    room_id: 1,
    work_date: "2024-12-23",
    status: "Active",
  },
];

export const medicalRecords: MedicalRecord[] = [
  {
    id: 1,
    patient_id: 1,
    doctor_id: 1,
    diagnosis: "Hypertension",
    treatment: "ACE inhibitor medication, lifestyle modifications",
    record_date: "2024-12-19",
  },
  {
    id: 2,
    patient_id: 2,
    doctor_id: 1,
    diagnosis: "Anxiety disorder",
    treatment: "Counseling sessions, stress management techniques",
    record_date: "2024-12-18",
  },
  {
    id: 3,
    patient_id: 3,
    doctor_id: 1,
    diagnosis: "Chest pain - ruled out cardiac cause",
    treatment: "Pain management, follow-up in 2 weeks",
    record_date: "2024-12-17",
  },
];

export const medicines: Medicine[] = [
  {
    id: 1,
    name: "Lisinopril",
    unit_price: 10,
    quantity: 100,
    expiry_date: "2024-12-31",
    description: "ACE Inhibitor",
  },
  {
    id: 2,
    name: "Metoprolol",
    unit_price: 20,
    quantity: 50,
    expiry_date: "2024-12-31",
    description: "Beta Blocker",
  },
  {
    id: 3,
    name: "Atorvastatin",
    unit_price: 30,
    quantity: 100,
    expiry_date: "2024-12-31",
    description: "Statin",
  },
  {
    id: 4,
    name: "Aspirin",
    unit_price: 40,
    quantity: 50,
    expiry_date: "2024-12-31",
    description: "Antiplatelet",
  },
  {
    id: 5,
    name: "Ibuprofen",
    unit_price: 50,
    quantity: 100,
    expiry_date: "2024-12-31",
    description: "NSAID",
  },
];

export const prescriptions: Prescription[] = [
  {
    id: 1,
    medical_record_id: 1,
    medicine_id: 1,
    dosage: "10mg",
    frequency: "Once daily",
    duration: "30 days",
  },
  {
    id: 2,
    medical_record_id: 1,
    medicine_id: 4,
    dosage: "81mg",
    frequency: "Once daily",
    duration: "Ongoing",
  },
  {
    id: 3,
    medical_record_id: 3,
    medicine_id: 5,
    dosage: "400mg",
    frequency: "Three times daily",
    duration: "7 days",
  },
];

export const labTests: LabTest[] = [
  {
    id: 1,
    medical_record_id: 1,
    test_type: "Complete Blood Count",
    result: "Normal",
    test_date: "2024-12-19",
  },
  {
    id: 2,
    medical_record_id: 1,
    test_type: "Lipid Panel",
    result: "Elevated cholesterol",
    test_date: "2024-12-19",
  },
  {
    id: 3,
    medical_record_id: 3,
    test_type: "ECG",
    result: "Normal sinus rhythm",
    test_date: "2024-12-17",
  },
];

export const leaveRequests: LeaveRequest[] = [
  {
    id: 1,
    doctor_id: 1,
    request_date: "2024-12-10",
    start_date: "2024-12-25",
    end_date: "2024-12-31",
    reason: "Annual vacation",
    status: "Approved",
  },
  {
    id: 2,
    doctor_id: 1,
    request_date: "2024-11-15",
    start_date: "2024-11-20",
    end_date: "2024-11-22",
    reason: "Medical conference",
    status: "Approved",
  },
  {
    id: 3,
    doctor_id: 1,
    request_date: "2024-12-15",
    start_date: "2025-01-10",
    end_date: "2025-01-12",
    reason: "Personal leave",
    status: "Pending",
  },
];

export const certificates: Certificate[] = [
  {
    id: 1,
    doctor_id: 1,
    name: "Board Certification in Cardiology",
    issued_by: "American Board of Internal Medicine",
    issue_date: "2020-06-15",
    expiry_date: "2030-06-15",
  },
  {
    id: 2,
    doctor_id: 1,
    name: "Basic Life Support (BLS)",
    issued_by: "American Heart Association",
    issue_date: "2024-01-10",
    expiry_date: "2026-01-10",
  },
  {
    id: 3,
    doctor_id: 1,
    name: "Advanced Cardiac Life Support (ACLS)",
    issued_by: "American Heart Association",
    issue_date: "2024-02-15",
    expiry_date: "2026-02-15",
  },
  {
    id: 4,
    doctor_id: 1,
    name: "Medical License",
    issued_by: "State Medical Board",
    issue_date: "2018-01-01",
    expiry_date: "2025-01-01",
  },
];

// Helper functions
export const getPatientById = (id: number): Patient | undefined => {
  return patients.find((patient) => patient.id === id);
};

export const getShiftById = (id: number): Shift | undefined => {
  return shifts.find((shift) => shift.id === id);
};

export const getRoomById = (id: number): Room | undefined => {
  return rooms.find((room) => room.id === id);
};

export const getDepartmentById = (id: number): Department | undefined => {
  return departments.find((dept) => dept.id === id);
};

export const getMedicineById = (
  id: number,
  medicines: Medicine[]
): Medicine | undefined => {
  return medicines.find((medicine) => medicine.id === id);
};

export const getAppointmentsByDate = (date: string): Appointment[] => {
  return appointments.filter((apt) => apt.appointment_date.startsWith(date));
};

export const getTodaysAppointments = (): Appointment[] => {
  const today = new Date().toISOString().split("T")[0];
  return getAppointmentsByDate(today);
};

export const getScheduleByDate = (date: string): DoctorWorkSchedule[] => {
  return doctorWorkSchedule.filter((schedule) => schedule.work_date === date);
};

export const getPrescriptionsByRecordId = (
  recordId: number,
  prescriptions: Prescription[]
): Prescription[] => {
  return prescriptions.filter(
    (prescription) => prescription.medical_record_id === recordId
  );
};

export const getLabTestsByRecordId = (
  recordId: number,
  labTests: LabTest[]
): LabTest[] => {
  return labTests.filter((test) => test.medical_record_id === recordId);
};
