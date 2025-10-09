/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Award, Plus, AlertTriangle, CheckCircle, Calendar, Building, Trash2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import type { Certificate } from "@/utils/mock/mock-data";
import { supabase } from "@/utils/backend/client";
import { useAuth } from "@/hooks/use-auth";

export default function CertificatesPage() {
    const [showNewCertForm, setShowNewCertForm] = useState(false);
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const { user } = useAuth();

    useEffect(() => {
        fetchCertificates();
    }, [user?.id]);

    const fetchCertificates = async () => {
        try {
            if (!user?.id) return;

            const { data, error } = await supabase
                .from("certificate")
                .select(`
                    *,
                    doctor:doctor_id ( id, full_name )
                `)
                .eq("doctor_id", user.id);

            if (error) throw error;
            console.log("certificates", data);
            setCertificates(data || []);
        } catch (error) {
            console.error("Error fetching certificates:", error);
            toast.error("Failed to fetch certificates");
        }
    };

    const handleDeleteCertificate = async (certificateId: number) => {
        try {
            const { error } = await supabase
                .from("certificate")
                .delete()
                .eq("id", certificateId);

            if (error) throw error;

            toast.success("Certificate deleted successfully");
            fetchCertificates();
        } catch (error) {
            console.error("Error deleting certificate:", error);
            toast.error("Failed to delete certificate");
        }
    };

    const [newCertificate, setNewCertificate] = useState({
        name: "",
        issued_by: "",
        issue_date: "",
        expiry_date: ""
    });

    const handleAddCertificate = async () => {
        if (!newCertificate.name.trim() || !newCertificate.issued_by.trim() ||
            !newCertificate.issue_date || !newCertificate.expiry_date) {
            toast.error("Please fill in all fields");
            return;
        }

        if (new Date(newCertificate.issue_date) > new Date(newCertificate.expiry_date)) {
            toast.error("Expiry date must be after issue date");
            return;
        }

        try {
            if (!user?.id) {
                toast.error("User not authenticated");
                return;
            }

            const { error } = await supabase
                .from("certificate")
                .insert([{
                    doctor_id: user.id,
                    name: newCertificate.name,
                    issued_by: newCertificate.issued_by,
                    issue_date: newCertificate.issue_date,
                    expiry_date: newCertificate.expiry_date
                }]);

            if (error) throw error;

            toast.success("Certificate added successfully");
            setNewCertificate({ name: "", issued_by: "", issue_date: "", expiry_date: "" });
            setShowNewCertForm(false);
            fetchCertificates();
        } catch (error) {
            console.error("Error adding certificate:", error);
            toast.error("Failed to add certificate");
        }
    };

    const getDaysUntilExpiry = (expiryDate: string) => {
        const today = new Date();
        const expiry = new Date(expiryDate);
        const diffTime = expiry.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const categorizedCertificates = {
        medical: certificates.filter(cert =>
            cert.name.toLowerCase().includes('medical') ||
            cert.name.toLowerCase().includes('board') ||
            cert.name.toLowerCase().includes('license')
        ),
        emergency: certificates.filter(cert =>
            cert.name.toLowerCase().includes('bls') ||
            cert.name.toLowerCase().includes('acls') ||
            cert.name.toLowerCase().includes('life support')
        ),
        specialty: certificates.filter(cert =>
            !cert.name.toLowerCase().includes('medical') &&
            !cert.name.toLowerCase().includes('board') &&
            !cert.name.toLowerCase().includes('license') &&
            !cert.name.toLowerCase().includes('bls') &&
            !cert.name.toLowerCase().includes('acls') &&
            !cert.name.toLowerCase().includes('life support')
        )
    };

    const expiringCertificates = certificates.filter(cert => {
        const days = getDaysUntilExpiry(cert.expiry_date);
        return days <= 90 && days >= 0;
    });

    const expiredCertificates = certificates.filter(cert => {
        return getDaysUntilExpiry(cert.expiry_date) < 0;
    });

    const stats = [
        {
            title: "Total Certificates",
            value: certificates.length,
            description: "All certificates",
            icon: Award,
            color: "text-blue-600",
            bgColor: "bg-blue-100"
        },
        {
            title: "Valid",
            value: certificates.filter(cert => getDaysUntilExpiry(cert.expiry_date) > 90).length,
            description: "Currently valid",
            icon: CheckCircle,
            color: "text-green-600",
            bgColor: "bg-green-100"
        },
        {
            title: "Expiring Soon",
            value: expiringCertificates.length,
            description: "Within 90 days",
            icon: AlertTriangle,
            color: "text-orange-600",
            bgColor: "bg-orange-100"
        },
        {
            title: "Expired",
            value: expiredCertificates.length,
            description: "Need renewal",
            icon: AlertTriangle,
            color: "text-red-600",
            bgColor: "bg-red-100"
        }
    ];

    return (
        <div className="space-y-6">
            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={index} className="border-0 shadow-md">
                            <CardContent className="p-6">
                                <div className="flex items-center space-x-3">
                                    <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                                        <Icon className={`h-5 w-5 ${stat.color}`} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">{stat.title}</p>
                                        <p className="text-2xl font-bold">{stat.value}</p>
                                        <p className="text-xs text-gray-500">{stat.description}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Expiry Alerts */}
            {(expiringCertificates.length > 0 || expiredCertificates.length > 0) && (
                <Card className="border-0 shadow-md border-l-4 border-l-orange-500">
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2 text-orange-700">
                            <AlertTriangle className="h-5 w-5" />
                            <span>Certificate Renewals Required</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {expiredCertificates.map((cert) => (
                                <div key={cert.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                                    <div>
                                        <p className="font-medium text-red-800">{cert.name}</p>
                                        <p className="text-sm text-red-600">Expired {Math.abs(getDaysUntilExpiry(cert.expiry_date))} days ago</p>
                                    </div>
                                    <Button size="sm" className="bg-red-600 hover:bg-red-700">
                                        <RefreshCw className="h-4 w-4 mr-1" />
                                        Renew Now
                                    </Button>
                                </div>
                            ))}
                            {expiringCertificates.map((cert) => (
                                <div key={cert.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                    <div>
                                        <p className="font-medium text-yellow-800">{cert.name}</p>
                                        <p className="text-sm text-yellow-600">Expires in {getDaysUntilExpiry(cert.expiry_date)} days</p>
                                    </div>
                                    <Button size="sm" variant="outline" className="border-yellow-600 text-yellow-600 hover:bg-yellow-50">
                                        <RefreshCw className="h-4 w-4 mr-1" />
                                        Schedule Renewal
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Add New Certificate */}
            <Card className="border-0 shadow-md">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Add New Certificate</CardTitle>
                            <CardDescription>Add a new professional certificate or license</CardDescription>
                        </div>
                        <Button
                            onClick={() => setShowNewCertForm(!showNewCertForm)}
                            className="bg-[#007BFF] hover:bg-blue-600"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Certificate
                        </Button>
                    </div>
                </CardHeader>
                {showNewCertForm && (
                    <CardContent>
                        <Card className="bg-blue-50 border-blue-200">
                            <CardContent className="pt-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <Label htmlFor="cert_name">Certificate Name</Label>
                                        <Input
                                            id="cert_name"
                                            value={newCertificate.name}
                                            onChange={(e) => setNewCertificate({ ...newCertificate, name: e.target.value })}
                                            placeholder="e.g., Board Certification in Cardiology"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="issued_by">Issued By</Label>
                                        <Input
                                            id="issued_by"
                                            value={newCertificate.issued_by}
                                            onChange={(e) => setNewCertificate({ ...newCertificate, issued_by: e.target.value })}
                                            placeholder="e.g., American Board of Internal Medicine"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="issue_date">Issue Date</Label>
                                        <Input
                                            id="issue_date"
                                            type="date"
                                            value={newCertificate.issue_date}
                                            onChange={(e) => setNewCertificate({ ...newCertificate, issue_date: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="expiry_date">Expiry Date</Label>
                                        <Input
                                            id="expiry_date"
                                            type="date"
                                            value={newCertificate.expiry_date}
                                            onChange={(e) => setNewCertificate({ ...newCertificate, expiry_date: e.target.value })}
                                            min={newCertificate.issue_date}
                                        />
                                    </div>
                                </div>

                                <div className="flex space-x-2">
                                    <Button onClick={handleAddCertificate} className="bg-[#007BFF] hover:bg-blue-600">
                                        <Award className="h-4 w-4 mr-2" />
                                        Add Certificate
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowNewCertForm(false)}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </CardContent>
                )}
            </Card>

            {/* Certificates by Category */}
            <Card className="border-0 shadow-md">
                <CardHeader>
                    <CardTitle>My Certificates</CardTitle>
                    <CardDescription>View and manage your professional certificates by category</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="all" className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="all">All ({certificates.length})</TabsTrigger>
                            <TabsTrigger value="medical">Medical ({categorizedCertificates.medical.length})</TabsTrigger>
                            <TabsTrigger value="emergency">Emergency ({categorizedCertificates.emergency.length})</TabsTrigger>
                            <TabsTrigger value="specialty">Specialty ({categorizedCertificates.specialty.length})</TabsTrigger>
                        </TabsList>

                        <TabsContent value="all">
                            <CertificateTable
                                certificates={certificates}
                                onDelete={handleDeleteCertificate}
                            />
                        </TabsContent>

                        <TabsContent value="medical">
                            <CertificateTable
                                certificates={categorizedCertificates.medical}
                                onDelete={handleDeleteCertificate}
                            />
                        </TabsContent>

                        <TabsContent value="emergency">
                            <CertificateTable
                                certificates={categorizedCertificates.emergency}
                                onDelete={handleDeleteCertificate}
                            />
                        </TabsContent>

                        <TabsContent value="specialty">
                            <CertificateTable
                                certificates={categorizedCertificates.specialty}
                                onDelete={handleDeleteCertificate}
                            />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}

interface CertificateTableProps {
    certificates: any[];
    onDelete: (id: number) => void;
}

function CertificateTable({ certificates: certs, onDelete }: CertificateTableProps) {
    const getDaysUntilExpiry = (expiryDate: string) => {
        const today = new Date();
        const expiry = new Date(expiryDate);
        const diffTime = expiry.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const getExpiryStatus = (expiryDate: string) => {
        const daysUntilExpiry = getDaysUntilExpiry(expiryDate);

        if (daysUntilExpiry < 0) {
            return { status: "Expired", color: "bg-red-100 text-red-800" };
        } else if (daysUntilExpiry <= 30) {
            return { status: "Expiring Soon", color: "bg-yellow-100 text-yellow-800" };
        } else if (daysUntilExpiry <= 90) {
            return { status: "Renewal Due", color: "bg-orange-100 text-orange-800" };
        } else {
            return { status: "Valid", color: "bg-green-100 text-green-800" };
        }
    };

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Certificate Name</TableHead>
                    <TableHead>Issuing Organization</TableHead>
                    <TableHead>Issue Date</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {certs.map((cert) => {
                    const expiryStatus = getExpiryStatus(cert.expiry_date);

                    return (
                        <TableRow key={cert.id}>
                            <TableCell>
                                <div className="flex items-center space-x-2">
                                    <Award className="h-4 w-4 text-[#007BFF]" />
                                    <span className="font-medium">{cert.name}</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center space-x-2">
                                    <Building className="h-4 w-4 text-gray-400" />
                                    <span>{cert.issued_by}</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center space-x-2">
                                    <Calendar className="h-4 w-4 text-gray-400" />
                                    <span>{new Date(cert.issue_date).toLocaleDateString()}</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center space-x-2">
                                    <Calendar className="h-4 w-4 text-gray-400" />
                                    <span>{new Date(cert.expiry_date).toLocaleDateString()}</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge className={expiryStatus.color}>
                                    {expiryStatus.status}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <div className="flex space-x-2">
                                    <Button
                                        onClick={() => onDelete(cert.id)}
                                        variant="outline"
                                        size="sm"
                                        className="text-red-600 border-red-600 hover:bg-red-50"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    );
                })}
                {certs.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                            No certificates found in this category
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
}