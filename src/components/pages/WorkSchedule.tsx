import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Calendar, Clock, MapPin, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { departments, doctorWorkSchedule, getDepartmentById, getRoomById, getShiftById } from "@/utils/mock/mock-data";

export default function WorkSchedulePage() {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedDepartment, setSelectedDepartment] = useState("all");
    const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");

    // Generate date range for calendar view (current week)
    const generateWeekDates = (startDate: string) => {
        const start = new Date(startDate);
        const startOfWeek = new Date(start);
        const dayOfWeek = start.getDay();
        startOfWeek.setDate(start.getDate() - dayOfWeek);

        const dates = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            dates.push(date.toISOString().split('T')[0]);
        }
        return dates;
    };

    const [currentWeekStart, setCurrentWeekStart] = useState(() => {
        const today = new Date();
        const startOfWeek = new Date(today);
        const dayOfWeek = today.getDay();
        startOfWeek.setDate(today.getDate() - dayOfWeek);
        return startOfWeek.toISOString().split('T')[0];
    });

    const weekDates = generateWeekDates(currentWeekStart);

    const getScheduleForDate = (date: string) => {
        return doctorWorkSchedule.filter(schedule => schedule.work_date === date);
    };

    const getStatusBadge = (status: string) => {
        const statusColors = {
            "Active": "bg-green-100 text-green-800",
            "Completed": "bg-blue-100 text-blue-800",
            "Cancelled": "bg-red-100 text-red-800",
            "Pending": "bg-yellow-100 text-yellow-800"
        };
        return statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800";
    };

    const navigateWeek = (direction: "prev" | "next") => {
        const currentStart = new Date(currentWeekStart);
        const newStart = new Date(currentStart);
        newStart.setDate(currentStart.getDate() + (direction === "next" ? 7 : -7));
        setCurrentWeekStart(newStart.toISOString().split('T')[0]);
    };

    const filteredSchedule = doctorWorkSchedule.filter(schedule => {
        if (selectedDepartment === "all") return true;
        const room = getRoomById(schedule.room_id);
        return room?.department_id.toString() === selectedDepartment;
    });

    const scheduleStats = {
        totalShifts: doctorWorkSchedule.length,
        thisWeekShifts: doctorWorkSchedule.filter(s => weekDates.includes(s.work_date)).length,
        activeShifts: doctorWorkSchedule.filter(s => s.status === "Active").length,
        completedShifts: doctorWorkSchedule.filter(s => s.status === "Completed").length
    };

    return (
        <div className="space-y-6">
            {/* Header with Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-0 shadow-md">
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Calendar className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Shifts</p>
                                <p className="text-2xl font-bold">{scheduleStats.totalShifts}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-md">
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <Clock className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">This Week</p>
                                <p className="text-2xl font-bold">{scheduleStats.thisWeekShifts}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-md">
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <MapPin className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Active</p>
                                <p className="text-2xl font-bold">{scheduleStats.activeShifts}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-md">
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Clock className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Completed</p>
                                <p className="text-2xl font-bold">{scheduleStats.completedShifts}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters and View Controls */}
            <Card className="border-0 shadow-md">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>Work Schedule</span>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant={viewMode === "calendar" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setViewMode("calendar")}
                                className={viewMode === "calendar" ? "bg-[#007BFF] hover:bg-blue-600" : ""}
                            >
                                Calendar
                            </Button>
                            <Button
                                variant={viewMode === "list" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setViewMode("list")}
                                className={viewMode === "list" ? "bg-[#007BFF] hover:bg-blue-600" : ""}
                            >
                                List
                            </Button>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="flex-1">
                            <Label htmlFor="date">Date</Label>
                            <Input
                                id="date"
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                            />
                        </div>
                        <div className="flex-1">
                            <Label htmlFor="department">Department</Label>
                            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Departments" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Departments</SelectItem>
                                    {departments.map((dept) => (
                                        <SelectItem key={dept.id} value={dept.id.toString()}>
                                            {dept.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-end">
                            <Button variant="outline" className="h-10">
                                <Filter className="h-4 w-4 mr-2" />
                                Apply Filters
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {viewMode === "calendar" ? (
                /* Calendar View */
                <Card className="border-0 shadow-md">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Weekly Schedule</CardTitle>
                            <div className="flex items-center space-x-2">
                                <Button variant="outline" size="sm" onClick={() => navigateWeek("prev")}>
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <span className="text-sm font-medium">
                                    {new Date(weekDates[0]).toLocaleDateString()} - {new Date(weekDates[6]).toLocaleDateString()}
                                </span>
                                <Button variant="outline" size="sm" onClick={() => navigateWeek("next")}>
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-7 gap-2">
                            {/* Day Headers */}
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                                <div key={day} className="p-2 text-center font-medium text-gray-600 bg-gray-50 rounded">
                                    {day}
                                    <div className="text-xs text-gray-500">
                                        {new Date(weekDates[index]).getDate()}
                                    </div>
                                </div>
                            ))}

                            {/* Schedule Items */}
                            {weekDates.map((date) => {
                                const daySchedule = getScheduleForDate(date);
                                const isToday = date === new Date().toISOString().split('T')[0];

                                return (
                                    <div
                                        key={date}
                                        className={`min-h-32 p-2 border rounded-lg ${isToday ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'
                                            }`}
                                    >
                                        {daySchedule.map((schedule) => {
                                            const shift = getShiftById(schedule.shift_id);
                                            const room = getRoomById(schedule.room_id);

                                            return (
                                                <div
                                                    key={schedule.id}
                                                    className="mb-2 p-2 bg-white border border-gray-200 rounded text-xs"
                                                >
                                                    <div className="font-medium">{shift?.name}</div>
                                                    <div className="text-gray-600">{shift?.start_time} - {shift?.end_time}</div>
                                                    <div className="text-gray-600">{room?.name}</div>
                                                    <Badge className={`${getStatusBadge(schedule.status)} text-xs mt-1`}>
                                                        {schedule.status}
                                                    </Badge>
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            ) : (
                /* List View */
                <Card className="border-0 shadow-md">
                    <CardHeader>
                        <CardTitle>Schedule List</CardTitle>
                        <CardDescription>Detailed view of your work schedule</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {filteredSchedule.map((schedule) => {
                                const shift = getShiftById(schedule.shift_id);
                                const room = getRoomById(schedule.room_id);
                                const department = getDepartmentById(room?.department_id || 0);

                                return (
                                    <Card key={schedule.id} className="border border-gray-200">
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-4">
                                                    <div>
                                                        <div className="flex items-center space-x-2">
                                                            <Calendar className="h-4 w-4 text-gray-500" />
                                                            <span className="font-medium">
                                                                {new Date(schedule.work_date).toLocaleDateString('en-US', {
                                                                    weekday: 'long',
                                                                    year: 'numeric',
                                                                    month: 'long',
                                                                    day: 'numeric'
                                                                })}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center space-x-2 mt-1">
                                                            <Clock className="h-4 w-4 text-gray-500" />
                                                            <span className="text-sm text-gray-600">
                                                                {shift?.name} ({shift?.start_time} - {shift?.end_time})
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center space-x-2">
                                                            <MapPin className="h-4 w-4 text-gray-500" />
                                                            <span className="font-medium">{room?.name}</span>
                                                        </div>
                                                        <div className="text-sm text-gray-600 mt-1">
                                                            {department?.name} - {room?.type} (Floor {room?.floor})
                                                        </div>
                                                    </div>
                                                </div>
                                                <Badge className={getStatusBadge(schedule.status)}>
                                                    {schedule.status}
                                                </Badge>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}