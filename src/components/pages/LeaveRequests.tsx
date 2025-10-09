import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { CalendarDays, Plus, Send, Clock, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import {
    fetchLeaveRequestsByDoctor,
    createLeaveRequest,
    cancelLeaveRequest,
    getLeaveRequestStats,
    type LeaveRequest
} from "@/utils/backend/leave-request-service";
import { useAuth } from "@/hooks/use-auth";

export default function LeaveRequestsPage() {
    const { user } = useAuth();
    const [showNewRequestForm, setShowNewRequestForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [newRequest, setNewRequest] = useState({
        start_date: "",
        end_date: "",
        reason: ""
    });

    const [leaveRequestsData, setLeaveRequestsData] = useState<LeaveRequest[]>([]);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        cancelled: 0,
        totalApprovedDays: 0
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                if (!user?.id) {
                    throw new Error('User not authenticated');
                }

                const [requestsData, statsData] = await Promise.all([
                    fetchLeaveRequestsByDoctor(user.id),
                    getLeaveRequestStats(user.id)
                ]);

                setLeaveRequestsData(requestsData);
                setStats(statsData);
            } catch (err) {
                console.error('Error fetching leave request data:', err);
                setError(err instanceof Error ? err.message : 'Failed to load leave requests');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user?.id]);

    const handleSubmitRequest = async () => {
        if (!newRequest.start_date || !newRequest.end_date || !newRequest.reason.trim()) {
            toast.error("Please fill in all fields");
            return;
        }

        if (new Date(newRequest.start_date) > new Date(newRequest.end_date)) {
            toast.error("End date must be after start date");
            return;
        }

        try {
            if (!user?.id) {
                toast.error("User not authenticated");
                return;
            }

            await createLeaveRequest({
                doctor_id: user.id,
                request_date: new Date().toISOString().split('T')[0],
                start_date: newRequest.start_date,
                end_date: newRequest.end_date,
                reason: newRequest.reason,
                status: "Pending"
            });

            toast.success("Leave request submitted successfully");
            setNewRequest({ start_date: "", end_date: "", reason: "" });
            setShowNewRequestForm(false);

            // Refetch data to update the list and stats
            const [updatedRequests, updatedStats] = await Promise.all([
                fetchLeaveRequestsByDoctor(user.id),
                getLeaveRequestStats(user.id)
            ]);
            setLeaveRequestsData(updatedRequests);
            setStats(updatedStats);

        } catch (error) {
            console.error('Error creating leave request:', error);
            toast.error("Failed to submit leave request");
        }
    };

    const handleCancelRequest = async (requestId: number) => {
        try {
            await cancelLeaveRequest(requestId);
            toast.success("Leave request cancelled successfully");

            // Refetch data to update the list and stats
            if (user?.id) {
                const [updatedRequests, updatedStats] = await Promise.all([
                    fetchLeaveRequestsByDoctor(user.id),
                    getLeaveRequestStats(user.id)
                ]);
                setLeaveRequestsData(updatedRequests);
                setStats(updatedStats);
            }
        } catch (error) {
            console.error('Error cancelling leave request:', error);
            toast.error("Failed to cancel leave request");
        }
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            "Pending": { className: "bg-yellow-100 text-yellow-800", icon: Clock },
            "Approved": { className: "bg-green-100 text-green-800", icon: CheckCircle },
            "Rejected": { className: "bg-red-100 text-red-800", icon: XCircle },
            "Cancelled": { className: "bg-gray-100 text-gray-800", icon: XCircle }
        };
        const config = statusConfig[status as keyof typeof statusConfig] ||
            { className: "bg-gray-100 text-gray-800", icon: Clock };

        const Icon = config.icon;
        return (
            <Badge className={config.className}>
                <Icon className="h-3 w-3 mr-1" />
                {status}
            </Badge>
        );
    };

    const calculateDuration = (startDate: string, endDate: string) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return diffDays;
    };

    // Create stats array for rendering
    const statsArray = [
        {
            title: "Total Requests",
            value: stats.total,
            description: "All time",
            color: "text-blue-600",
            bgColor: "bg-blue-100"
        },
        {
            title: "Pending",
            value: stats.pending,
            description: "Awaiting approval",
            color: "text-yellow-600",
            bgColor: "bg-yellow-100"
        },
        {
            title: "Approved",
            value: stats.approved,
            description: "This year",
            color: "text-green-600",
            bgColor: "bg-green-100"
        },
        {
            title: "Days Off",
            value: stats.totalApprovedDays,
            description: "Total approved",
            color: "text-purple-600",
            bgColor: "bg-purple-100"
        }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading leave requests...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="text-red-600 mb-2">Error loading leave requests</div>
                    <p className="text-gray-600">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statsArray.map((stat, index) => (
                    <Card key={index} className="border-0 shadow-md">
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-3">
                                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                                    <CalendarDays className={`h-5 w-5 ${stat.color}`} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">{stat.title}</p>
                                    <p className="text-2xl font-bold">{stat.value}</p>
                                    <p className="text-xs text-gray-500">{stat.description}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* New Request Form */}
            <Card className="border-0 shadow-md">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Request Leave</CardTitle>
                            <CardDescription>Submit a new leave request for approval</CardDescription>
                        </div>
                        <Button
                            onClick={() => setShowNewRequestForm(!showNewRequestForm)}
                            className="bg-[#007BFF] hover:bg-blue-600"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            New Request
                        </Button>
                    </div>
                </CardHeader>
                {showNewRequestForm && (
                    <CardContent>
                        <Card className="bg-blue-50 border-blue-200">
                            <CardContent className="pt-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <Label htmlFor="start_date">Start Date</Label>
                                        <Input
                                            id="start_date"
                                            type="date"
                                            value={newRequest.start_date}
                                            onChange={(e) => setNewRequest({ ...newRequest, start_date: e.target.value })}
                                            min={new Date().toISOString().split('T')[0]}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="end_date">End Date</Label>
                                        <Input
                                            id="end_date"
                                            type="date"
                                            value={newRequest.end_date}
                                            onChange={(e) => setNewRequest({ ...newRequest, end_date: e.target.value })}
                                            min={newRequest.start_date || new Date().toISOString().split('T')[0]}
                                        />
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <Label htmlFor="reason">Reason for Leave</Label>
                                    <Textarea
                                        id="reason"
                                        value={newRequest.reason}
                                        onChange={(e) => setNewRequest({ ...newRequest, reason: e.target.value })}
                                        placeholder="Please provide the reason for your leave request..."
                                        rows={3}
                                    />
                                </div>

                                {newRequest.start_date && newRequest.end_date && (
                                    <div className="mb-4 p-3 bg-white rounded-lg border">
                                        <p className="text-sm text-gray-600">
                                            <strong>Duration:</strong> {calculateDuration(newRequest.start_date, newRequest.end_date)} day(s)
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            <strong>From:</strong> {new Date(newRequest.start_date).toLocaleDateString()}
                                            <strong> To:</strong> {new Date(newRequest.end_date).toLocaleDateString()}
                                        </p>
                                    </div>
                                )}

                                <div className="flex space-x-2">
                                    <Button onClick={handleSubmitRequest} className="bg-[#007BFF] hover:bg-blue-600">
                                        <Send className="h-4 w-4 mr-2" />
                                        Submit Request
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowNewRequestForm(false)}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </CardContent>
                )}
            </Card>

            {/* Leave Requests History */}
            <Card className="border-0 shadow-md">
                <CardHeader>
                    <CardTitle>Leave Request History</CardTitle>
                    <CardDescription>View all your submitted leave requests and their status</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Request Date</TableHead>
                                <TableHead>Leave Period</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead>Reason</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {leaveRequestsData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                                        No leave requests found. Click "New Request" to submit your first request.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                leaveRequestsData.map((request) => {
                                    const duration = calculateDuration(request.start_date, request.end_date);

                                    return (
                                        <TableRow key={request.id}>
                                            <TableCell>
                                                {new Date(request.request_date).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="text-sm font-medium">
                                                        {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {duration} day{duration !== 1 ? 's' : ''}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="max-w-xs">
                                                <p className="truncate" title={request.reason}>
                                                    {request.reason}
                                                </p>
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(request.status)}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex space-x-2">
                                                    {request.status === "Pending" && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="text-red-600 hover:bg-red-50"
                                                            onClick={() => handleCancelRequest(request.id)}
                                                        >
                                                            Cancel
                                                        </Button>
                                                    )}
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

            {/* Leave Policies */}
            <Card className="border-0 shadow-md">
                <CardHeader>
                    <CardTitle>Leave Policies</CardTitle>
                    <CardDescription>Important information about leave requests</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-medium text-gray-900 mb-2">Annual Leave</h4>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li>• 25 days per calendar year</li>
                                <li>• Must be requested at least 2 weeks in advance</li>
                                <li>• Maximum 10 consecutive days without special approval</li>
                                <li>• Unused leave may carry over (max 5 days)</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-900 mb-2">Sick Leave</h4>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li>• 12 days per calendar year</li>
                                <li>• Medical certificate required for 3+ consecutive days</li>
                                <li>• Can be used for immediate family care</li>
                                <li>• Does not carry over to next year</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-900 mb-2">Emergency Leave</h4>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li>• Up to 5 days per year</li>
                                <li>• For unexpected emergencies only</li>
                                <li>• Requires immediate supervisor approval</li>
                                <li>• Documentation may be required</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-900 mb-2">Professional Development</h4>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li>• Up to 7 days per year for conferences/training</li>
                                <li>• Must be pre-approved by department head</li>
                                <li>• Hospital may cover expenses</li>
                                <li>• Certificate of attendance required</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}