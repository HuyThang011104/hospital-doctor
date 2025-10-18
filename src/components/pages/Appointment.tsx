/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Calendar, Search, Filter, Eye, Clock, Check, X, AlertTriangle } from "lucide-react";
import { type Appointment } from "@/utils/mock/mock-data";
import { supabase } from "@/utils/backend/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";


interface AppointmentsPageProps {
    onNavigate: (page: string, data?: any) => void;
}

export default function AppointmentsPage({ onNavigate }: AppointmentsPageProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [dateFilter, setDateFilter] = useState("all");
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const { user } = useAuth();
    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const { data, error } = await supabase.from("appointment")
                .select(`*,
                    patient(*),
                    doctor(*),
                    shift(*)
                `)
                .eq("doctor_id", user?.id);
            if (error) throw error;
            console.log("Appointments: ", data);
            if (data) {
                setAppointments(data);
            }
        } catch (error) {
            console.error("Error fetching appointments:", error);
        }
    }

    const getStatusBadge = (status: string) => {
        const statusColors = {
            "Scheduled": "bg-blue-100 text-blue-800",
            "Completed": "bg-green-100 text-green-800",
            "Cancelled": "bg-red-100 text-red-800",
            "In Progress": "bg-yellow-100 text-yellow-800"
        };
        return statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800";
    };

    const filteredAppointments = appointments.filter(appointment => {
        const matchesSearch = appointment.patient?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            appointment.notes.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" || appointment.status === statusFilter;

        let matchesDate = true;
        if (dateFilter === "today") {
            const today = new Date().toISOString().split('T')[0];
            matchesDate = appointment.appointment_date.startsWith(today);
        } else if (dateFilter === "upcoming") {
            const today = new Date();
            const appointmentDate = new Date(appointment.appointment_date);
            matchesDate = appointmentDate >= today;
        }

        return matchesSearch && matchesStatus && matchesDate;
    });

    const getUpcomingCount = () => {
        const today = new Date();
        return appointments.filter(apt => new Date(apt.appointment_date) >= today).length;
    };

    const getStatusCount = (status: string) => {
        return appointments.filter(apt => apt.status === status).length;
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
            // Update local state immediately
            setAppointments(prev =>
                prev.map(apt =>
                    apt.id === appointment.id
                        ? { ...apt, status: "Accepted" }
                        : apt
                )
            );
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
            // Update local state immediately
            setAppointments(prev =>
                prev.map(apt =>
                    apt.id === appointment.id
                        ? { ...apt, status: "Rejected" }
                        : apt
                )
            );
        }
    };


    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
                    <p className="text-gray-600 mt-1">Manage all patient appointments</p>
                </div>
                {/* <Button className="bg-[#007BFF] hover:bg-blue-600">
                    <Plus className="h-4 w-4 mr-2" />
                    New Appointment
                </Button> */}
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-0 shadow-md">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total</p>
                                <p className="text-2xl font-bold text-gray-900">{appointments.length}</p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <Calendar className="h-5 w-5 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-md">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Upcoming</p>
                                <p className="text-2xl font-bold text-gray-900">{getUpcomingCount()}</p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-lg">
                                <Clock className="h-5 w-5 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-md">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Completed</p>
                                <p className="text-2xl font-bold text-gray-900">{getStatusCount("Completed")}</p>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <Calendar className="h-5 w-5 text-purple-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-md">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Scheduled</p>
                                <p className="text-2xl font-bold text-gray-900">{getStatusCount("Scheduled")}</p>
                            </div>
                            <div className="p-3 bg-orange-100 rounded-lg">
                                <Calendar className="h-5 w-5 text-orange-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card className="border-0 shadow-md">
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Filter className="h-5 w-5 text-[#007BFF]" />
                        <span>Filter Appointments</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search by patient name or notes..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="Scheduled">Scheduled</SelectItem>
                                <SelectItem value="Completed">Completed</SelectItem>
                                <SelectItem value="Cancelled">Cancelled</SelectItem>
                                <SelectItem value="In Progress">In Progress</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={dateFilter} onValueChange={setDateFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by date" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Dates</SelectItem>
                                <SelectItem value="today">Today</SelectItem>
                                <SelectItem value="upcoming">Upcoming</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Appointments Table */}
            <Card className="border-0 shadow-md">
                <CardHeader>
                    <CardTitle>All Appointments</CardTitle>
                    <CardDescription>
                        {filteredAppointments.length} appointment{filteredAppointments.length !== 1 ? 's' : ''} found
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Khách Hàng</TableHead>
                                <TableHead>Ngày & Thời Gian</TableHead>
                                <TableHead>Ca</TableHead>
                                <TableHead>Trạng Thái</TableHead>
                                <TableHead>Ghi Chú</TableHead>
                                <TableHead>Hành Động</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredAppointments.map((appointment) => {
                                const appointmentDate = new Date(appointment.appointment_date);
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                const isPastDate = appointmentDate < today;
                                const isPending = appointment.status === "Scheduled" || appointment.status === "Pending";

                                return (
                                    <TableRow key={appointment.id} className={isPastDate && isPending ? "bg-red-50" : ""}>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{appointment.patient?.full_name || "Unknown Patient"}</p>
                                                <p className="text-sm text-gray-500">{appointment.patient?.phone}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium">
                                                    {appointmentDate.toLocaleDateString()}
                                                </p>
                                                {isPastDate && isPending && (
                                                    <AlertTriangle className="h-4 w-4 text-red-500" />
                                                )}
                                            </div>
                                            {/* <p className="text-sm text-gray-500">
                                                {appointmentDate.toLocaleTimeString('en-US', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p> */}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {appointment.shift?.name || "Unknown Shift"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Badge className={getStatusBadge(appointment.status)}>
                                                    {appointment.status}
                                                </Badge>
                                                {isPastDate && isPending && (
                                                    <span className="text-xs text-red-600 font-medium">Quá hạn</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="max-w-xs">
                                            <p className="truncate">{appointment.notes}</p>
                                        </TableCell>
                                        <TableCell className="w-min pr-0 whitespace-nowrap">
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={(e) => { e.stopPropagation(); onNavigate("appointment-detail", appointment); }}
                                                    className="text-[#007BFF] border-[#007BFF] hover:bg-blue-50"
                                                >
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    View
                                                </Button>
                                                {
                                                    appointment.status !== "Completed" && !isPastDate && (
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
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}