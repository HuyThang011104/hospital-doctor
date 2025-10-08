/* eslint-disable @typescript-eslint/no-unused-vars */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Badge } from "../ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { getLabTestsByRecordId, getMedicineById, getPatientById, getPrescriptionsByRecordId, getShiftById, type Appointment, type LabTest, type MedicalRecord, type Medicine, type Prescription } from "@/utils/mock/mock-data";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Calendar, CheckCircle, Plus, Save, Trash2, User } from "lucide-react";
import { supabase } from "@/utils/backend/client";

interface AppointmentDetailPageProps {
    appointment: Appointment;
    onBack: () => void;
}

export default function AppointmentDetailPage({ appointment, onBack }: AppointmentDetailPageProps) {
    const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
    const [labTests, setLabTests] = useState<LabTest[]>([]);
    useEffect(() => {
        const fetchMedicalRecords = async () => {
            try {
                const { data, error } = await supabase.from("medical_record")
                    .select(`*,
                    patient(*),
                    doctor(*)
                `)
                if (error) throw error;
                console.log("Medical Records: ", data);
                if (data) {
                    setMedicalRecords(data);
                }
            } catch (error) {
                console.error("Error fetching medical records:", error);
            }
        }
        fetchMedicalRecords();
    }, [appointment.id]);

    useEffect(() => {
        const fetchMedicine = async () => {
            try {
                const { data, error } = await supabase.from("medicine")
                    .select(`
                    *
                `);
                if (error) throw error;
                console.log("Medicine: ", data);
                if (data) {
                    setMedicines(data);
                }
            } catch (error) {
                console.error("Error fetching medicine:", error);
            }
        }
        fetchMedicine();
    }, []);

    useEffect(() => {
        const fetchPrescriptions = async () => {
            try {
                const { data, error } = await supabase.from("prescription")
                    .select(`*`);
                if (error) throw error;
                console.log("Prescription: ", data);
                if (data) {
                    setPrescriptions(data);
                }
            } catch (error) {
                console.error("Error fetching prescription:", error);
            }
        }
        fetchPrescriptions();
    }, []);

    useEffect(() => {
        const fetchLabTests = async () => {
            try {
                const { data, error } = await supabase.from("lab_test")
                    .select(`
                    *
                `);
                if (error) throw error;
                console.log("Lab Test: ", data);
                if (data) {
                    setLabTests(data);
                }
            } catch (error) {
                console.error("Error fetching lab tests:", error);
            }
        }
        fetchLabTests();
    }, []);
    const patient = appointment.patient;
    const shift = appointment.shift;
    const appointmentDate = new Date(appointment.appointment_date);

    // Medical record state
    const [diagnosis, setDiagnosis] = useState("");
    const [treatment, setTreatment] = useState("");
    const [notes, setNotes] = useState(appointment.notes);

    // Lab test state
    const [newLabTest, setNewLabTest] = useState({
        test_type: "",
        test_date: new Date().toISOString().split('T')[0]
    });
    const [showLabTestForm, setShowLabTestForm] = useState(false);

    // Prescription state
    const [newPrescription, setNewPrescription] = useState({
        medicine_id: "",
        dosage: "",
        frequency: "",
        duration: ""
    });
    const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);

    // Find existing medical record for this appointment
    const existingRecord = medicalRecords.find(
        record => record.patient_id === appointment.patient_id &&
            record.doctor_id === appointment.doctor_id
    );

    const recordPrescriptions = existingRecord ? getPrescriptionsByRecordId(existingRecord.id, prescriptions) : [];
    const recordLabTests = existingRecord ? getLabTestsByRecordId(existingRecord.id, labTests) : [];

    useEffect(() => {
        if (existingRecord) {
            setDiagnosis(existingRecord.diagnosis);
            setTreatment(existingRecord.treatment);
        }
    }, [existingRecord]);

    const handleSaveRecord = () => {
        if (!diagnosis.trim() || !treatment.trim()) {
            toast.error("Please fill in both diagnosis and treatment");
            return;
        }

        toast.success("Medical record saved successfully");
    };

    const handleCompleteAppointment = () => {
        if (!diagnosis.trim() || !treatment.trim()) {
            toast.error("Please complete the medical record before marking as completed");
            return;
        }

        toast.success("Appointment marked as completed");
    };

    const handleAddLabTest = () => {
        if (!newLabTest.test_type.trim()) {
            toast.error("Please enter test type");
            return;
        }

        toast.success("Lab test ordered successfully");
        setNewLabTest({ test_type: "", test_date: new Date().toISOString().split('T')[0] });
        setShowLabTestForm(false);
    };

    const handleAddPrescription = () => {
        if (!newPrescription.medicine_id || !newPrescription.dosage.trim() ||
            !newPrescription.frequency.trim() || !newPrescription.duration.trim()) {
            toast.error("Please fill in all prescription fields");
            return;
        }

        toast.success("Prescription added successfully");
        setNewPrescription({ medicine_id: "", dosage: "", frequency: "", duration: "" });
        setShowPrescriptionForm(false);
    };

    const getStatusBadge = (status: string) => {
        const statusColors = {
            "Scheduled": "bg-blue-100 text-blue-800",
            "Completed": "bg-green-100 text-green-800",
            "Cancelled": "bg-red-100 text-red-800",
            "In Progress": "bg-yellow-100 text-yellow-800"
        };
        return statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800";
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Button variant="outline" onClick={onBack}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Dashboard
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Appointment Details</h1>
                        <p className="text-gray-600">
                            {appointmentDate.toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })} at {appointmentDate.toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </p>
                    </div>
                </div>
                <Badge className={getStatusBadge(appointment.status)}>
                    {appointment.status}
                </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Patient Information */}
                <Card className="border-0 shadow-md">
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <User className="h-5 w-5 text-[#007BFF]" />
                            <span>Patient Information</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label className="text-sm text-gray-600">Full Name</Label>
                            <p className="font-medium">{patient?.full_name}</p>
                        </div>
                        <div>
                            <Label className="text-sm text-gray-600">Gender</Label>
                            <p>{patient?.gender}</p>
                        </div>
                        <div>
                            <Label className="text-sm text-gray-600">Birth Date</Label>
                            <p>{patient?.birth_date}</p>
                        </div>
                        <div>
                            <Label className="text-sm text-gray-600">Phone</Label>
                            <p>{patient?.phone}</p>
                        </div>
                        <div>
                            <Label className="text-sm text-gray-600">Email</Label>
                            <p className="text-sm">{patient?.email}</p>
                        </div>
                        <div>
                            <Label className="text-sm text-gray-600">Address</Label>
                            <p className="text-sm">{patient?.address}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Appointment Details */}
                <Card className="border-0 shadow-md">
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Calendar className="h-5 w-5 text-[#007BFF]" />
                            <span>Appointment Details</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label className="text-sm text-gray-600">Date & Time</Label>
                            <p className="font-medium">
                                {appointmentDate.toLocaleDateString()} at {appointmentDate.toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        </div>
                        <div>
                            <Label className="text-sm text-gray-600">Shift</Label>
                            <p>{shift?.name} ({shift?.start_time} - {shift?.end_time})</p>
                        </div>
                        <div>
                            <Label className="text-sm text-gray-600">Status</Label>
                            <Badge className={getStatusBadge(appointment.status)}>
                                {appointment.status}
                            </Badge>
                        </div>
                        <div>
                            <Label htmlFor="notes" className="text-sm text-gray-600">Notes</Label>
                            <Textarea
                                id="notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Appointment notes..."
                                className="mt-1"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="border-0 shadow-md">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Button
                            className="w-full bg-[#007BFF] hover:bg-blue-600"
                            onClick={handleSaveRecord}
                        >
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                        </Button>
                        <Button
                            className="w-full bg-green-600 hover:bg-green-700"
                            onClick={handleCompleteAppointment}
                        >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Complete Appointment
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Medical Record */}
            <Card className="border-0 shadow-md">
                <CardHeader>
                    <CardTitle>Medical Record</CardTitle>
                    <CardDescription>
                        Diagnosis, treatment, and medical notes for this visit
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="diagnosis">Diagnosis</Label>
                            <Textarea
                                id="diagnosis"
                                value={diagnosis}
                                onChange={(e) => setDiagnosis(e.target.value)}
                                placeholder="Enter diagnosis..."
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="treatment">Treatment</Label>
                            <Textarea
                                id="treatment"
                                value={treatment}
                                onChange={(e) => setTreatment(e.target.value)}
                                placeholder="Enter treatment plan..."
                                className="mt-1"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Lab Tests */}
            <Card className="border-0 shadow-md">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Lab Tests</CardTitle>
                            <CardDescription>Ordered tests for this patient</CardDescription>
                        </div>
                        <Button
                            onClick={() => setShowLabTestForm(!showLabTestForm)}
                            className="bg-[#007BFF] hover:bg-blue-600"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Order Test
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {showLabTestForm && (
                        <Card className="mb-4 bg-blue-50 border-blue-200">
                            <CardContent className="pt-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="test_type">Test Type</Label>
                                        <Input
                                            id="test_type"
                                            value={newLabTest.test_type}
                                            onChange={(e) => setNewLabTest({ ...newLabTest, test_type: e.target.value })}
                                            placeholder="e.g., Complete Blood Count"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="test_date">Test Date</Label>
                                        <Input
                                            id="test_date"
                                            type="date"
                                            value={newLabTest.test_date}
                                            onChange={(e) => setNewLabTest({ ...newLabTest, test_date: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="flex space-x-2 mt-4">
                                    <Button onClick={handleAddLabTest} size="sm">
                                        Order Test
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowLabTestForm(false)}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Test Type</TableHead>
                                <TableHead>Test Date</TableHead>
                                <TableHead>Result</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recordLabTests.map((test) => (
                                <TableRow key={test.id}>
                                    <TableCell className="font-medium">{test.test_type}</TableCell>
                                    <TableCell>{test.test_date}</TableCell>
                                    <TableCell>{test.result}</TableCell>
                                    <TableCell>
                                        <Button variant="outline" size="sm">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {recordLabTests.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-gray-500">
                                        No lab tests ordered yet
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Prescriptions */}
            <Card className="border-0 shadow-md">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Prescriptions</CardTitle>
                            <CardDescription>Medications prescribed for this patient</CardDescription>
                        </div>
                        <Button
                            onClick={() => setShowPrescriptionForm(!showPrescriptionForm)}
                            className="bg-[#007BFF] hover:bg-blue-600"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Prescription
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {showPrescriptionForm && (
                        <Card className="mb-4 bg-green-50 border-green-200">
                            <CardContent className="pt-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="medicine">Medicine</Label>
                                        <Select
                                            value={newPrescription.medicine_id}
                                            onValueChange={(value) => setNewPrescription({ ...newPrescription, medicine_id: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select medicine" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {medicines.map((medicine) => (
                                                    <SelectItem key={medicine.id} value={medicine.id.toString()}>
                                                        {medicine.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="dosage">Dosage</Label>
                                        <Input
                                            id="dosage"
                                            value={newPrescription.dosage}
                                            onChange={(e) => setNewPrescription({ ...newPrescription, dosage: e.target.value })}
                                            placeholder="e.g., 10mg"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="frequency">Frequency</Label>
                                        <Input
                                            id="frequency"
                                            value={newPrescription.frequency}
                                            onChange={(e) => setNewPrescription({ ...newPrescription, frequency: e.target.value })}
                                            placeholder="e.g., Once daily"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="duration">Duration</Label>
                                        <Input
                                            id="duration"
                                            value={newPrescription.duration}
                                            onChange={(e) => setNewPrescription({ ...newPrescription, duration: e.target.value })}
                                            placeholder="e.g., 30 days"
                                        />
                                    </div>
                                </div>
                                <div className="flex space-x-2 mt-4">
                                    <Button onClick={handleAddPrescription} size="sm">
                                        Add Prescription
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowPrescriptionForm(false)}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Medicine</TableHead>
                                <TableHead>Dosage</TableHead>
                                <TableHead>Frequency</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recordPrescriptions.map((prescription) => {
                                const medicine = getMedicineById(prescription.medicine_id, medicines);
                                return (
                                    <TableRow key={prescription.id}>
                                        <TableCell className="font-medium">
                                            {medicine?.name}
                                        </TableCell>
                                        <TableCell>{prescription.dosage}</TableCell>
                                        <TableCell>{prescription.frequency}</TableCell>
                                        <TableCell>{prescription.duration}</TableCell>
                                        <TableCell>
                                            <Button variant="outline" size="sm">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                            {recordPrescriptions.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-gray-500">
                                        No prescriptions added yet
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}