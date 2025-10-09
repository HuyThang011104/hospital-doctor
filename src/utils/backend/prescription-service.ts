import type {
  MedicalRecord,
  Medicine,
  Patient,
  Prescription,
} from "../mock/mock-data";
import { supabase } from "./client";

// Prescription operations
export async function fetchPrescriptions(): Promise<Prescription[]> {
  const { data, error } = await supabase.from("prescription").select("*");

  if (error) {
    console.error("Error fetching prescriptions:", error);
    throw error;
  }

  return data || [];
}

export async function fetchPrescriptionsByDoctor(
  doctorId: number
): Promise<Prescription[]> {
  const { data, error } = await supabase
    .from("prescription")
    .select(
      `
      *,
      medical_record!inner(
        patient_id,
        doctor_id
      )
    `
    )
    .eq("medical_record.doctor_id", doctorId);

  if (error) {
    console.error("Error fetching doctor prescriptions:", error);
    throw error;
  }

  return data || [];
}

export async function createPrescription(
  prescription: Omit<Prescription, "id" | "created_at" | "updated_at">
): Promise<Prescription> {
  const { data, error } = await supabase
    .from("prescription")
    .insert([prescription])
    .select()
    .single();

  if (error) {
    console.error("Error creating prescription:", error);
    throw error;
  }

  return data;
}

export async function updatePrescription(
  id: number,
  prescription: Partial<Prescription>
): Promise<Prescription> {
  const { data, error } = await supabase
    .from("prescription")
    .update(prescription)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating prescription:", error);
    throw error;
  }

  return data;
}

export async function deletePrescription(id: number): Promise<void> {
  const { error } = await supabase.from("prescription").delete().eq("id", id);

  if (error) {
    console.error("Error deleting prescription:", error);
    throw error;
  }
}

// Medicine operations
export async function fetchMedicines(): Promise<Medicine[]> {
  const { data, error } = await supabase
    .from("medicine")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching medicines:", error);
    throw error;
  }

  return data || [];
}

export async function getMedicineById(
  id: number
): Promise<Medicine | undefined> {
  const { data, error } = await supabase
    .from("medicine")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching medicine:", error);
    return undefined;
  }

  return data;
}

// Patient operations
export async function fetchPatients(): Promise<Patient[]> {
  const { data, error } = await supabase
    .from("patient")
    .select("*")
    .order("full_name", { ascending: true });

  if (error) {
    console.error("Error fetching patients:", error);
    throw error;
  }

  return data || [];
}

export async function getPatientById(id: number): Promise<Patient | undefined> {
  const { data, error } = await supabase
    .from("patient")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching patient:", error);
    return undefined;
  }

  return data;
}

// Medical record operations
export async function fetchMedicalRecordsByDoctor(
  doctorId: number
): Promise<MedicalRecord[]> {
  const { data, error } = await supabase
    .from("medical_record")
    .select("*")
    .eq("doctor_id", doctorId)
    .order("record_date", { ascending: false });

  if (error) {
    console.error("Error fetching medical records:", error);
    throw error;
  }

  return data || [];
}

// Export types for use in components
export type { Prescription, Medicine, Patient, MedicalRecord };

// Enriched prescription with related data
export interface EnrichedPrescription extends Prescription {
  medicalRecord?: MedicalRecord;
  patient?: Patient;
  medicine?: Medicine;
}

export async function fetchEnrichedPrescriptions(
  doctorId: number
): Promise<EnrichedPrescription[]> {
  try {
    const [prescriptions, medicines, patients, medicalRecords] =
      await Promise.all([
        fetchPrescriptionsByDoctor(doctorId),
        fetchMedicines(),
        fetchPatients(),
        fetchMedicalRecordsByDoctor(doctorId),
      ]);

    return prescriptions.map((prescription) => {
      const medicalRecord = medicalRecords.find(
        (record) => record.id === prescription.medical_record_id
      );
      const patient = medicalRecord
        ? patients.find((p) => p.id === medicalRecord.patient_id)
        : undefined;
      const medicine = medicines.find((m) => m.id === prescription.medicine_id);

      return {
        ...prescription,
        medicalRecord,
        patient,
        medicine,
      };
    });
  } catch (error) {
    console.error("Error fetching enriched prescriptions:", error);
    throw error;
  }
}

// Helper function to get prescriptions with patient and medicine details for any doctor
export async function fetchAllEnrichedPrescriptions(): Promise<
  EnrichedPrescription[]
> {
  try {
    const [prescriptions, medicines, patients, medicalRecords] =
      await Promise.all([
        fetchPrescriptions(),
        fetchMedicines(),
        fetchPatients(),
        supabase.from("medical_record").select("*"),
      ]);

    return prescriptions.map((prescription) => {
      const medicalRecord = medicalRecords.data?.find(
        (record) => record.id === prescription.medical_record_id
      );
      const patient = medicalRecord
        ? patients.find((p) => p.id === medicalRecord.patient_id)
        : undefined;
      const medicine = medicines.find((m) => m.id === prescription.medicine_id);

      return {
        ...prescription,
        medicalRecord: medicalRecord || undefined,
        patient,
        medicine,
      };
    });
  } catch (error) {
    console.error("Error fetching all enriched prescriptions:", error);
    throw error;
  }
}
