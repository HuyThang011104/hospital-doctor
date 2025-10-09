import type {
  Department,
  DoctorWorkSchedule,
  Room,
  Shift,
} from "../mock/mock-data";
import { supabase } from "./client";

// Database types - extending base interfaces with database-specific fields

// Fetch work schedules for a specific doctor
export async function fetchDoctorWorkSchedules(
  doctorId: number
): Promise<DoctorWorkSchedule[]> {
  const { data, error } = await supabase
    .from("doctor_work_schedule")
    .select("*")
    .eq("doctor_id", doctorId)
    .order("work_date", { ascending: true });

  if (error) {
    console.error("Error fetching doctor work schedules:", error);
    throw error;
  }

  return data || [];
}

// Fetch all shifts
export async function fetchShifts(): Promise<Shift[]> {
  const { data, error } = await supabase
    .from("shift")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    console.error("Error fetching shifts:", error);
    throw error;
  }

  return data || [];
}

// Fetch all rooms
export async function fetchRooms(): Promise<Room[]> {
  const { data, error } = await supabase
    .from("room")
    .select("*")
    .order("department_id", { ascending: true });

  if (error) {
    console.error("Error fetching rooms:", error);
    throw error;
  }

  return data || [];
}

// Fetch all departments
export async function fetchDepartments(): Promise<Department[]> {
  const { data, error } = await supabase
    .from("department")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching departments:", error);
    throw error;
  }

  return data || [];
}

// Fetch work schedules for a specific date range
export async function fetchWorkSchedulesByDateRange(
  doctorId: number,
  startDate: string,
  endDate: string
): Promise<DoctorWorkSchedule[]> {
  const { data, error } = await supabase
    .from("doctor_work_schedule")
    .select("*")
    .eq("doctor_id", doctorId)
    .gte("work_date", startDate)
    .lte("work_date", endDate)
    .order("work_date", { ascending: true });

  if (error) {
    console.error("Error fetching work schedules by date range:", error);
    throw error;
  }

  return data || [];
}

// Helper functions to get related data
export const getShiftById = async (id: number): Promise<Shift | undefined> => {
  const { data, error } = await supabase
    .from("shift")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching shift:", error);
    return undefined;
  }

  return data;
};

export const getRoomById = async (id: number): Promise<Room | undefined> => {
  const { data, error } = await supabase
    .from("room")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching room:", error);
    return undefined;
  }

  return data;
};

export const getDepartmentById = async (
  id: number
): Promise<Department | undefined> => {
  const { data, error } = await supabase
    .from("department")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching department:", error);
    return undefined;
  }

  return data;
};

// Export types for use in components
export type { DoctorWorkSchedule, Shift, Room, Department };

// Get comprehensive schedule data with related entities
export async function fetchScheduleWithDetails(doctorId: number): Promise<{
  schedules: DoctorWorkSchedule[];
  shifts: Shift[];
  rooms: Room[];
  departments: Department[];
}> {
  try {
    const [schedulesData, shiftsData, roomsData, departmentsData] =
      await Promise.all([
        fetchDoctorWorkSchedules(doctorId),
        fetchShifts(),
        fetchRooms(),
        fetchDepartments(),
      ]);

    return {
      schedules: schedulesData,
      shifts: shiftsData,
      rooms: roomsData,
      departments: departmentsData,
    };
  } catch (error) {
    console.error("Error fetching schedule data:", error);
    throw error;
  }
}
