import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import {
    LayoutDashboard,
    Calendar,
    Clock,
    FileText,
    Pill,
    CalendarDays,
    Award,
    LogOut,
    Bell,
    User,
    Badge
} from "lucide-react";
import type { ReactNode } from "react";

interface LayoutProps {
    children: ReactNode;
    currentPage: string;
    onNavigate: (page: string) => void;
    onLogout: () => void;
}

const navigation = [
    { id: "dashboard", label: "Trang chủ", icon: LayoutDashboard },
    { id: "appointments", label: "Lịch hẹn", icon: Calendar },
    { id: "schedule", label: "Lịch làm việc", icon: Clock },
    { id: "records", label: "Hồ sơ Y Tế", icon: FileText },
    { id: "prescriptions", label: "Đơn thuốc", icon: Pill },
    { id: "leave", label: "Yêu cầu nghỉ phép", icon: CalendarDays },
    { id: "certificates", label: "Chứng thư", icon: Award },
];

export default function Layout({ children, currentPage, onNavigate, onLogout }: LayoutProps) {
    const { user } = useAuth();
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sidebar */}
            <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="flex items-center h-16 px-6 border-b">
                        <div className="flex items-center space-x-2">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <FileText className="h-6 w-6 text-[#007BFF]" />
                            </div>
                            <div>
                                <h1 className="text-lg text-gray-900">Vinmec Doctor </h1>
                                <p className="text-xs text-gray-500">Cổng chăm sóc sức khỏe</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-2">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            const isActive = currentPage === item.id;

                            return (
                                <button
                                    key={item.id}
                                    onClick={() => onNavigate(item.id)}
                                    className={`w-full flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${isActive
                                        ? "bg-[#007BFF] text-white"
                                        : "text-gray-700 hover:bg-gray-100"
                                        }`}
                                >
                                    <Icon className="h-5 w-5 mr-3" />
                                    {item.label}
                                </button>
                            );
                        })}
                    </nav>

                    {/* Logout */}
                    <div className="p-4 border-t">
                        <Button
                            onClick={onLogout}
                            variant="ghost"
                            className="w-full justify-start text-gray-700 hover:text-red-600 hover:bg-red-50"
                        >
                            <LogOut className="h-5 w-5 mr-3" />
                            Logout
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="pl-64">
                {/* Header */}
                <header className="bg-white shadow-sm border-b h-16 flex items-center justify-between px-6">
                    <div>
                        <h2 className="text-xl text-gray-900 capitalize">
                            {currentPage === "dashboard" ? "Dashboard" :
                                currentPage === "appointments" ? "Appointments" :
                                    currentPage === "schedule" ? "Work Schedule" :
                                        currentPage === "records" ? "Medical Records" :
                                            currentPage === "prescriptions" ? "Prescriptions" :
                                                currentPage === "leave" ? "Leave Requests" :
                                                    currentPage === "certificates" ? "Certificates" :
                                                        currentPage}
                        </h2>
                    </div>

                    <div className="flex items-center space-x-4">
                        {/* Notifications */}
                        <Button variant="ghost" size="sm" className="relative">
                            <Bell className="h-5 w-5" />
                            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center p-0">
                                3
                            </Badge>
                        </Button>

                        {/* User Info */}
                        <div className="flex items-center space-x-3">
                            <div className="text-right">
                                <p className="text-sm text-gray-900">{user?.full_name}</p>
                                <p className="text-xs text-gray-500">{user?.role}</p>
                            </div>
                            <div className="p-2 bg-gray-100 rounded-full">
                                <User className="h-5 w-5 text-gray-600" />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}