/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Calendar, Users, TestTube, CalendarDays, Eye, FileText, Check, X } from "lucide-react";
import { supabase } from "@/utils/backend/client";
import { useAuth } from "@/hooks/use-auth";
import { formatDateVn } from "@/utils/functions/formatTime";
import { toast } from "sonner";
import type { Appointment, LabTest, LeaveRequest } from "@/utils/mock/mock-data";

interface DashboardPageProps {
    onNavigate: (page: string, data?: any) => void;
}

export default function DashboardPage({ onNavigate }: DashboardPageProps) {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [labTests, setLabTests] = useState<LabTest[]>([]);
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = useCallback(async () => {
        if (!user?.id) return;

        try {
            setLoading(true);

            // Fetch appointments
            const { data: appointmentsData, error: appointmentsError } = await supabase
                .from("appointment")
                .select(`
                    *,
                    patient(*),
                    doctor(*),
                    shift(*)
                `)
                .eq("doctor_id", user.id);

            if (appointmentsError) throw appointmentsError;

            // Fetch lab tests
            const { data: labTestsData, error: labTestsError } = await supabase
                .from("lab_test")
                .select("*")
                .is("result", null);

            if (labTestsError) throw labTestsError;

            // Fetch leave requests
            const { data: leaveRequestsData, error: leaveRequestsError } = await supabase
                .from("leave_request")
                .select("*")
                .eq("doctor_id", user.id)
                .eq("status", "Pending");

            if (leaveRequestsError) throw leaveRequestsError;

            setAppointments(appointmentsData || []);
            setLabTests(labTestsData || []);
            setLeaveRequests(leaveRequestsData || []);
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const getTodaysAppointments = () => {
        const today = new Date().toISOString().split('T')[0];
        return appointments.filter(apt =>
            apt.appointment_date.toString().startsWith(today)
        );
    };

    const todaysAppointments = getTodaysAppointments();
    const pendingLabTests = labTests;
    const pendingLeaveRequests = leaveRequests;

    const stats = [
        {
            title: "Total Appointments",
            value: loading ? "..." : appointments.length,
            description: "All appointments",
            icon: Calendar,
            color: "text-blue-600",
            bgColor: "bg-blue-100"
        },
        {
            title: "Today's Patients",
            value: loading ? "..." : todaysAppointments.length,
            description: "Scheduled for today",
            icon: Users,
            color: "text-green-600",
            bgColor: "bg-green-100"
        },
        {
            title: "Pending Lab Tests",
            value: loading ? "..." : pendingLabTests.length,
            description: "Awaiting results",
            icon: TestTube,
            color: "text-orange-600",
            bgColor: "bg-orange-100"
        },
        {
            title: "Leave Requests",
            value: loading ? "..." : pendingLeaveRequests.length,
            description: "Pending approval",
            icon: CalendarDays,
            color: "text-purple-600",
            bgColor: "bg-purple-100"
        }
    ];

    const getStatusBadge = (status: string) => {
        const statusColors = {
            "Scheduled": "bg-blue-100 text-blue-800",
            "Completed": "bg-green-100 text-green-800",
            "Cancelled": "bg-red-100 text-red-800",
            "In Progress": "bg-yellow-100 text-yellow-800"
        };
        return statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800";
    };

    const handleAccept = async (appointment: Appointment) => {
        const { error } = await supabase
            .from("appointment")
            .update({ status: "Accepted" })
            .eq("id", appointment.id);

        if (error) {
            console.error(error);
            toast.error("Không thể chấp nhận cuộc hẹn!");
        } else {
            toast.success("Đã chấp nhận cuộc hẹn!");
        }
    };

    const handleReject = async (appointment: Appointment) => {
        const { error } = await supabase
            .from("appointment")
            .update({ status: "Rejected" })
            .eq("id", appointment.id);

        if (error) {
            console.error(error);
            toast.error("Không thể từ chối cuộc hẹn!");
        } else {
            toast.success("Đã từ chối cuộc hẹn!");
        }
    };

    return (
        <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={index} className="border-0 shadow-md">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">
                                    {stat.title}
                                </CardTitle>
                                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                                    <Icon className={`h-4 w-4 ${stat.color}`} />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                                <p className="text-xs text-gray-500 mt-1">
                                    {stat.description}
                                </p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Today's Appointments */}
            <Card className="border-0 shadow-md">
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Calendar className="h-5 w-5 text-[#007BFF]" />
                        <span>Today's Appointments</span>
                    </CardTitle>
                    <CardDescription>
                        Appointments scheduled for {formatDateVn(new Date().toISOString())}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Patient Name</TableHead>
                                <TableHead>Time</TableHead>
                                <TableHead>Shift</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                        Loading appointments...
                                    </TableCell>
                                </TableRow>
                            ) : todaysAppointments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                        No appointments scheduled for today
                                    </TableCell>
                                </TableRow>
                            ) : (
                                todaysAppointments.map((appointment) => {
                                    const appointmentTime = new Date(appointment.appointment_date);

                                    return (
                                        <TableRow key={appointment.id}>
                                            <TableCell className="font-medium">
                                                {appointment.patient?.full_name || "Unknown Patient"}
                                            </TableCell>
                                            <TableCell>
                                                {appointmentTime.toLocaleTimeString('en-US', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </TableCell>
                                            <TableCell>
                                                {appointment.shift?.name || "Unknown Shift"}
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getStatusBadge(appointment.status)}>
                                                    {appointment.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="w-min whitespace-nowrap">
                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => onNavigate("appointment-detail", appointment)}
                                                        className="text-[#007BFF] border-[#007BFF] hover:bg-blue-50"
                                                    >
                                                        <Eye className="h-4 w-4 mr-1" />
                                                        View
                                                    </Button>
                                                    {
                                                        appointment.status !== "Completed" && (
                                                            <>
                                                                <span
                                                                    role="button"
                                                                    title="Accept"
                                                                    aria-label="Accept appointment"
                                                                    onClick={(e) => { e.stopPropagation(); handleAccept(appointment); }}
                                                                    className="cursor-pointer p-1 rounded hover:bg-green-50"
                                                                >
                                                                    <Check className="h-4 w-4" color="green" />
                                                                </span>

                                                                <span
                                                                    role="button"
                                                                    title="Reject"
                                                                    aria-label="Reject appointment"
                                                                    onClick={(e) => { e.stopPropagation(); handleReject(appointment); }}
                                                                    className="cursor-pointer p-1 rounded hover:bg-red-50"
                                                                >
                                                                    <X className="h-4 w-4" color="red" />
                                                                </span>
                                                            </>
                                                        )
                                                    }
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-0 shadow-md">
                    <CardHeader>
                        <CardTitle className="text-lg">Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                    <Users className="h-4 w-4 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Completed appointment</p>
                                    <p className="text-xs text-gray-500">with John Smith</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                    <TestTube className="h-4 w-4 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Lab results received</p>
                                    <p className="text-xs text-gray-500">for Emily Davis</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                    <CalendarDays className="h-4 w-4 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Leave request approved</p>
                                    <p className="text-xs text-gray-500">Dec 25-31, 2024</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-md">
                    <CardHeader>
                        <CardTitle className="text-lg">Upcoming Tasks</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium">Review lab results</p>
                                    <p className="text-xs text-gray-500">Due today</p>
                                </div>
                                <Badge className="bg-red-100 text-red-800">Urgent</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium">Complete patient records</p>
                                    <p className="text-xs text-gray-500">Due tomorrow</p>
                                </div>
                                <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium">Certificate renewal</p>
                                    <p className="text-xs text-gray-500">Due next week</p>
                                </div>
                                <Badge className="bg-blue-100 text-blue-800">Low</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-md">
                    <CardHeader>
                        <CardTitle className="text-lg">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <Button
                                className="w-full justify-start bg-[#007BFF] hover:bg-blue-600"
                                onClick={() => onNavigate("schedule")}
                            >
                                <Calendar className="h-4 w-4 mr-2" />
                                View Schedule
                            </Button>
                            <Button
                                className="w-full justify-start"
                                variant="outline"
                                onClick={() => onNavigate("records")}
                            >
                                <FileText className="h-4 w-4 mr-2" />
                                Medical Records
                            </Button>
                            <Button
                                className="w-full justify-start"
                                variant="outline"
                                onClick={() => onNavigate("leave")}
                            >
                                <CalendarDays className="h-4 w-4 mr-2" />
                                Request Leave
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}