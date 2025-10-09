/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Pill, Search, Plus, Calendar, User } from "lucide-react";
import {
    fetchEnrichedPrescriptions,
    createPrescription,
    fetchMedicines,
    fetchPatients,
    type EnrichedPrescription,
    type Medicine,
    type Patient
} from "@/utils/backend/prescription-service";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";


interface PrescriptionsPageProps {
    onNavigate?: (page: string, data?: any) => void;
}

export default function PrescriptionsPage({ onNavigate }: PrescriptionsPageProps) {
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [isNewPrescriptionOpen, setIsNewPrescriptionOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [newPrescription, setNewPrescription] = useState({
        patient_id: "",
        medicine_id: "",
        dosage: "",
        frequency: "",
        duration: "",
        instructions: ""
    });

    const [prescriptionsData, setPrescriptionsData] = useState<EnrichedPrescription[]>([]);
    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [patients, setPatients] = useState<Patient[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                if (!user?.id) {
                    // Fetch all prescriptions if no user is logged in (for admin view)
                    const { fetchAllEnrichedPrescriptions } = await import("@/utils/backend/prescription-service");
                    const [prescriptionsData, medicinesData, patientsData] = await Promise.all([
                        fetchAllEnrichedPrescriptions(),
                        fetchMedicines(),
                        fetchPatients()
                    ]);

                    setPrescriptionsData(prescriptionsData);
                    setMedicines(medicinesData);
                    setPatients(patientsData);
                } else {
                    // Fetch prescriptions for current doctor
                    const [prescriptionsData, medicinesData, patientsData] = await Promise.all([
                        fetchEnrichedPrescriptions(user.id),
                        fetchMedicines(),
                        fetchPatients()
                    ]);

                    setPrescriptionsData(prescriptionsData);
                    setMedicines(medicinesData);
                    setPatients(patientsData);
                }
            } catch (err) {
                console.error('Error fetching prescription data:', err);
                setError(err instanceof Error ? err.message : 'Failed to load prescription data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user?.id]);

    const filteredPrescriptions = prescriptionsData.filter(prescription => {
        const matchesSearch =
            prescription.patient?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            prescription.medicine?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            prescription.dosage.toLowerCase().includes(searchTerm.toLowerCase());

        // For now, we'll treat all prescriptions as "Active" - in a real system you'd have status
        const matchesStatus = statusFilter === "all" || statusFilter === "active";

        return matchesSearch && matchesStatus;
    });

    const handleCreatePrescription = async () => {
        if (!newPrescription.patient_id || !newPrescription.medicine_id || !newPrescription.dosage) {
            toast.error("Please fill in all required fields");
            return;
        }

        try {
            // For now, we'll need to create a mock medical record or find an existing one
            // In a real system, you'd select from existing medical records
            const mockMedicalRecordId = 1; // This should come from selecting a medical record

            await createPrescription({
                medical_record_id: mockMedicalRecordId,
                medicine_id: parseInt(newPrescription.medicine_id),
                dosage: newPrescription.dosage,
                frequency: newPrescription.frequency,
                duration: newPrescription.duration,
            });

            toast.success("Prescription created successfully");
            setIsNewPrescriptionOpen(false);
            setNewPrescription({
                patient_id: "",
                medicine_id: "",
                dosage: "",
                frequency: "",
                duration: "",
                instructions: ""
            });

            // Refetch data to update the list
            if (user?.id) {
                const [updatedPrescriptions] = await Promise.all([
                    fetchEnrichedPrescriptions(user.id)
                ]);
                setPrescriptionsData(updatedPrescriptions);
            }

        } catch (error) {
            console.error('Error creating prescription:', error);
            toast.error("Failed to create prescription");
        }
    };

    const getFrequencyBadge = (frequency: string) => {
        const frequencyColors = {
            "Once daily": "bg-green-100 text-green-800",
            "Twice daily": "bg-blue-100 text-blue-800",
            "Three times daily": "bg-orange-100 text-orange-800",
            "Four times daily": "bg-red-100 text-red-800",
            "As needed": "bg-purple-100 text-purple-800"
        };
        return frequencyColors[frequency as keyof typeof frequencyColors] || "bg-gray-100 text-gray-800";
    };

    const getDurationStatus = (duration: string) => {
        if (duration === "Ongoing") return "text-blue-600";
        if (duration.includes("30 days") || duration.includes("month")) return "text-green-600";
        if (duration.includes("7 days") || duration.includes("week")) return "text-orange-600";
        return "text-gray-600";
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading prescription data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="text-red-600 mb-2">Error loading prescription data</div>
                    <p className="text-gray-600">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Prescriptions</h1>
                    <p className="text-gray-600 mt-1">Manage patient prescriptions and medications</p>
                </div>
                <Dialog open={isNewPrescriptionOpen} onOpenChange={setIsNewPrescriptionOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-[#007BFF] hover:bg-blue-600">
                            <Plus className="h-4 w-4 mr-2" />
                            New Prescription
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Create New Prescription</DialogTitle>
                            <DialogDescription>
                                Add a new prescription for a patient
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="patient">Patient *</Label>
                                <Select value={newPrescription.patient_id} onValueChange={(value) =>
                                    setNewPrescription(prev => ({ ...prev, patient_id: value }))
                                }>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select patient" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {patients.map(patient => (
                                            <SelectItem key={patient.id} value={patient.id.toString()}>
                                                {patient.full_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="medicine">Medicine *</Label>
                                <Select value={newPrescription.medicine_id} onValueChange={(value) =>
                                    setNewPrescription(prev => ({ ...prev, medicine_id: value }))
                                }>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select medicine" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {medicines.map(medicine => (
                                            <SelectItem key={medicine.id} value={medicine.id.toString()}>
                                                {medicine.name} ({medicine.description})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="dosage">Dosage *</Label>
                                <Input
                                    value={newPrescription.dosage}
                                    onChange={(e) => setNewPrescription(prev => ({ ...prev, dosage: e.target.value }))}
                                    placeholder="e.g., 10mg"
                                />
                            </div>
                            <div>
                                <Label htmlFor="frequency">Frequency</Label>
                                <Select value={newPrescription.frequency} onValueChange={(value) =>
                                    setNewPrescription(prev => ({ ...prev, frequency: value }))
                                }>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select frequency" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Once daily">Once daily</SelectItem>
                                        <SelectItem value="Twice daily">Twice daily</SelectItem>
                                        <SelectItem value="Three times daily">Three times daily</SelectItem>
                                        <SelectItem value="Four times daily">Four times daily</SelectItem>
                                        <SelectItem value="As needed">As needed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="duration">Duration</Label>
                                <Input
                                    value={newPrescription.duration}
                                    onChange={(e) => setNewPrescription(prev => ({ ...prev, duration: e.target.value }))}
                                    placeholder="e.g., 30 days"
                                />
                            </div>
                            <div>
                                <Label htmlFor="instructions">Special Instructions</Label>
                                <Textarea
                                    value={newPrescription.instructions}
                                    onChange={(e) => setNewPrescription(prev => ({ ...prev, instructions: e.target.value }))}
                                    placeholder="Additional instructions for the patient..."
                                    rows={3}
                                />
                            </div>
                            <div className="flex space-x-2 pt-4">
                                <Button onClick={handleCreatePrescription} className="flex-1 bg-[#007BFF] hover:bg-blue-600">
                                    Create Prescription
                                </Button>
                                <Button variant="outline" onClick={() => setIsNewPrescriptionOpen(false)} className="flex-1">
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-0 shadow-md">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Prescriptions</p>
                                <p className="text-2xl font-bold text-gray-900">{prescriptionsData.length}</p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <Pill className="h-5 w-5 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-md">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Active Prescriptions</p>
                                <p className="text-2xl font-bold text-gray-900">{prescriptionsData.length}</p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-lg">
                                <Calendar className="h-5 w-5 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-md">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Unique Patients</p>
                                <p className="text-2xl font-bold text-gray-900">{new Set(prescriptionsData.map(p => p.patient?.id)).size}</p>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <User className="h-5 w-5 text-purple-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-md">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Unique Medicines</p>
                                <p className="text-2xl font-bold text-gray-900">{new Set(prescriptionsData.map(p => p.medicine?.id)).size}</p>
                            </div>
                            <div className="p-3 bg-orange-100 rounded-lg">
                                <Pill className="h-5 w-5 text-orange-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card className="border-0 shadow-md">
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Search className="h-5 w-5 text-[#007BFF]" />
                        <span>Search & Filter Prescriptions</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search by patient, medicine, or dosage..."
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
                                <SelectItem value="all">All Prescriptions</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="discontinued">Discontinued</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Prescriptions Table */}
            <Card className="border-0 shadow-md">
                <CardHeader>
                    <CardTitle>Prescription History</CardTitle>
                    <CardDescription>
                        {filteredPrescriptions.length} prescription{filteredPrescriptions.length !== 1 ? 's' : ''} found
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Patient</TableHead>
                                <TableHead>Medicine</TableHead>
                                <TableHead>Dosage</TableHead>
                                <TableHead>Frequency</TableHead>
                                <TableHead>Duration</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredPrescriptions.map((prescription) => (
                                <TableRow key={prescription.id}>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium">{prescription.patient?.full_name || "Unknown Patient"}</p>
                                            <p className="text-sm text-gray-500">{prescription.patient?.personal_id}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium">{prescription.medicine?.name || "Unknown Medicine"}</p>
                                            <p className="text-sm text-gray-500">{prescription.medicine?.description}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="font-mono">
                                            {prescription.dosage}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={getFrequencyBadge(prescription.frequency)}>
                                            {prescription.frequency}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`font-medium ${getDurationStatus(prescription.duration)}`}>
                                            {prescription.duration}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}