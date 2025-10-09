import type { LeaveRequest } from "../mock/mock-data";
import { supabase } from "./client";

// Leave Request operations
export async function fetchLeaveRequests(): Promise<LeaveRequest[]> {
  const { data, error } = await supabase
    .from("leave_request")
    .select("*")
    .order("request_date", { ascending: false });

  if (error) {
    console.error("Error fetching leave requests:", error);
    throw error;
  }

  return data || [];
}

export async function fetchLeaveRequestsByDoctor(
  doctorId: number
): Promise<LeaveRequest[]> {
  const { data, error } = await supabase
    .from("leave_request")
    .select("*")
    .eq("doctor_id", doctorId)
    .order("request_date", { ascending: false });

  if (error) {
    console.error("Error fetching doctor leave requests:", error);
    throw error;
  }

  return data || [];
}

export async function createLeaveRequest(
  leaveRequest: Omit<LeaveRequest, "id" | "created_at" | "updated_at">
): Promise<LeaveRequest> {
  const { data, error } = await supabase
    .from("leave_request")
    .insert([leaveRequest])
    .select()
    .single();

  if (error) {
    console.error("Error creating leave request:", error);
    throw error;
  }

  return data;
}

export async function updateLeaveRequest(
  id: number,
  leaveRequest: Partial<LeaveRequest>
): Promise<LeaveRequest> {
  const { data, error } = await supabase
    .from("leave_request")
    .update(leaveRequest)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating leave request:", error);
    throw error;
  }

  return data;
}

export async function updateLeaveRequestStatus(
  id: number,
  status: "Approved" | "Rejected"
): Promise<LeaveRequest> {
  return updateLeaveRequest(id, { status });
}

export async function cancelLeaveRequest(id: number): Promise<LeaveRequest> {
  return updateLeaveRequest(id, { status: "Cancelled" });
}

export async function deleteLeaveRequest(id: number): Promise<void> {
  const { error } = await supabase.from("leave_request").delete().eq("id", id);

  if (error) {
    console.error("Error deleting leave request:", error);
    throw error;
  }
}

// Helper functions
export async function getLeaveRequestById(
  id: number
): Promise<LeaveRequest | undefined> {
  const { data, error } = await supabase
    .from("leave_request")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching leave request:", error);
    return undefined;
  }

  return data;
}

export async function fetchLeaveRequestsByStatus(
  status: string
): Promise<LeaveRequest[]> {
  const { data, error } = await supabase
    .from("leave_request")
    .select("*")
    .eq("status", status)
    .order("request_date", { ascending: false });

  if (error) {
    console.error("Error fetching leave requests by status:", error);
    throw error;
  }

  return data || [];
}

export async function fetchLeaveRequestsByDateRange(
  doctorId: number,
  startDate: string,
  endDate: string
): Promise<LeaveRequest[]> {
  const { data, error } = await supabase
    .from("leave_request")
    .select("*")
    .eq("doctor_id", doctorId)
    .gte("request_date", startDate)
    .lte("request_date", endDate)
    .order("request_date", { ascending: false });

  if (error) {
    console.error("Error fetching leave requests by date range:", error);
    throw error;
  }

  return data || [];
}

// Statistics functions
export async function getLeaveRequestStats(doctorId: number) {
  try {
    const allRequests = await fetchLeaveRequestsByDoctor(doctorId);

    const stats = {
      total: allRequests.length,
      pending: allRequests.filter((req) => req.status === "Pending").length,
      approved: allRequests.filter((req) => req.status === "Approved").length,
      rejected: allRequests.filter((req) => req.status === "Rejected").length,
      cancelled: allRequests.filter((req) => req.status === "Cancelled").length,

      // Calculate total approved days off
      totalApprovedDays: allRequests
        .filter((req) => req.status === "Approved")
        .reduce((total, req) => {
          const start = new Date(req.start_date);
          const end = new Date(req.end_date);
          const diffTime = Math.abs(end.getTime() - start.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
          return total + diffDays;
        }, 0),
    };

    return stats;
  } catch (error) {
    console.error("Error calculating leave request stats:", error);
    throw error;
  }
}

// Export types for use in components
export type { LeaveRequest };
