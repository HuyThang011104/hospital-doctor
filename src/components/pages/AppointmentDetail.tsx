import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Badge } from "../ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { type Appointment, type LabTest, type MedicalRecord, type Medicine, type Prescription } from "@/utils/mock/mock-data";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Calendar, CheckCircle, Plus, Save, User } from "lucide-react";
import { supabase } from "@/utils/backend/client";

interface AppointmentDetailPageProps {
    appointment: Appointment;
    onBack: () => void;
}

type AppointmentMedicalRecord = MedicalRecord & {
    appointment_id?: string | number | null;
};

export default function AppointmentDetailPage({ appointment, onBack }: AppointmentDetailPageProps) {
    const [medicalRecord, setMedicalRecord] = useState<AppointmentMedicalRecord | null>(null);
    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [recordPrescriptions, setRecordPrescriptions] = useState<Prescription[]>([]);
    const [recordLabTests, setRecordLabTests] = useState<LabTest[]>([]);
    const [labTests, setLabTests] = useState<LabTest[]>([]);
    useEffect(() => {
        const fetchMedicalRecord = async () => {
            try {
                const { data, error } = await supabase.from("medical_record")
                    .select(`*, patient(*), doctor(*)`)
                    .eq("appointment_id", appointment.id)
                    .maybeSingle();

                if (error) throw error;

                setMedicalRecord(data ?? null);
            } catch (error) {
                console.error("Error fetching medical record:", error);
                setMedicalRecord(null);
            }
        }
        fetchMedicalRecord();
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
        const fetchLabTests = async () => {
            try {
                const { data, error } = await supabase.from("lab_test").select(`*`);
                if (error) throw error;
                console.log("Lab tests: ", data);
                if (data) {
                    setLabTests(data);
                }
            } catch (error) {
                console.error("Error fetching lab tests:", error);
            }
        }
        fetchLabTests();
    }, [medicalRecord?.id]);

    const recordId = useMemo(() => {
        if (!medicalRecord) return undefined;
        if (medicalRecord.appointment_id && String(medicalRecord.appointment_id) !== String(appointment.id)) {
            return undefined;
        }
        return medicalRecord.id ? String(medicalRecord.id) : undefined;
    }, [medicalRecord, appointment.id]);

    useEffect(() => {
        if (!recordId) {
            setRecordPrescriptions([]);
            setRecordLabTests([]);
            return;
        }

        const fetchRecordDetails = async () => {
            try {
                // Fetch examinations for this medical record first
                const { data: examinationsData, error: examinationsError } = await supabase
                    .from("examination")
                    .select("*")
                    .eq("medical_record_id", recordId);

                if (examinationsError) throw examinationsError;

                // Then fetch lab tests for those examinations
                const examinationIds = examinationsData?.map(e => e.id) || [];
                let labTestsData: LabTest[] = [];

                if (examinationIds.length > 0) {
                    const { data: labTestsResult, error: labTestsError } = await supabase
                        .from("lab_test")
                        .select("*")
                        .in("examination_id", examinationIds);

                    if (labTestsError) throw labTestsError;
                    labTestsData = labTestsResult || [];
                }

                const [prescriptionsResult] = await Promise.all([
                    supabase.from("prescription").select(`*`).eq("medical_record_id", recordId)
                ]);

                if (prescriptionsResult.error) throw prescriptionsResult.error;

                setRecordPrescriptions(prescriptionsResult.data ?? []);
                setRecordLabTests(labTestsData);
            } catch (error) {
                console.error("Error fetching record details:", error);
                toast.error("Failed to load record details");
            }
        };

        fetchRecordDetails();
    }, [recordId]);
    const patient = appointment.patient;
    const shift = appointment.shift;
    const appointmentDate = new Date(appointment.appointment_date);

    // Medical record state
    const [diagnosis, setDiagnosis] = useState("");
    const [treatment, setTreatment] = useState("");
    const [notes, setNotes] = useState(appointment.notes);

    // Lab test state
    const [newLabTest, setNewLabTest] = useState({
        lab_test_id: "",
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
    const findMedicineById = (id: string | number) => {
        return medicines.find((medicine) => String(medicine.id) === String(id));
    };

    useEffect(() => {
        if (medicalRecord) {
            setDiagnosis(medicalRecord.diagnosis);
            setTreatment(medicalRecord.treatment);
        } else {
            setDiagnosis("");
            setTreatment("");
        }
    }, [medicalRecord]);

    const handleSaveRecord = async () => {
        if (!diagnosis.trim() || !treatment.trim()) {
            toast.error("Please fill in both diagnosis and treatment");
            return;
        }

        try {
            let recordIdToUse = recordId;

            if (recordIdToUse) {
                // Cập nhật record
                const { error } = await supabase
                    .from("medical_record")
                    .update({
                        diagnosis,
                        treatment,
                    })
                    .eq("id", recordIdToUse);

                if (error) throw error;
            } else {
                // Tạo mới record
                const { data, error } = await supabase
                    .from("medical_record")
                    .insert([{
                        appointment_id: appointment.id,
                        doctor_id: appointment.doctor_id,
                        patient_id: appointment.patient_id,
                        diagnosis,
                        treatment,
                    }])
                    .select()
                    .single();

                if (error) throw error;
                recordIdToUse = data.id;
                setMedicalRecord(data);
            }

            // Cập nhật ghi chú cuộc hẹn
            const { error: updateAppointmentError } = await supabase
                .from("appointment")
                .update({ notes })
                .eq("id", appointment.id);

            if (updateAppointmentError) throw updateAppointmentError;

            toast.success("Medical record saved successfully");
        } catch (error) {
            console.error(error);
            toast.error("Failed to save medical record");
        }
    };


    const handleCompleteAppointment = async () => {
        if (!diagnosis.trim() || !treatment.trim()) {
            toast.error("Please complete the medical record before marking as completed");
            return;
        }

        try {
            await handleSaveRecord();

            const { error } = await supabase
                .from("appointment")
                .update({ status: "Completed" })
                .eq("id", appointment.id);

            if (error) throw error;

            toast.success("Appointment marked as completed");
        } catch (error) {
            console.error(error);
            toast.error("Failed to complete appointment");
        }
    };

    const handleAddLabTest = async () => {
        if (!newLabTest.lab_test_id) {
            toast.error("Please select a test type");
            return;
        }
        if (!recordId) {
            toast.error("Please save medical record first");
            return;
        }

        try {
            // First create an examination for this medical record
            const { data: examinationData, error: examinationError } = await supabase
                .from("examination")
                .insert([{
                    medical_record_id: recordId,
                    examination_type: "Lab Test",
                    examination_date: new Date().toISOString(),
                    details: `Lab test ordered: ${labTests.find(t => String(t.id) === newLabTest.lab_test_id)?.test_type}`,
                }])
                .select()
                .single();

            if (examinationError) throw examinationError;

            // Then create lab test linked to this examination
            const selectedTest = labTests.find(
                (t) => String(t.id) === newLabTest.lab_test_id
            );

            const { data, error } = await supabase
                .from("lab_test")
                .insert([
                    {
                        examination_id: examinationData.id,
                        test_type: selectedTest?.test_type || "",
                        test_date: newLabTest.test_date,
                        result: null,
                    },
                ])
                .select();

            if (error) throw error;

            setRecordLabTests([...recordLabTests, ...data]);
            setNewLabTest({
                lab_test_id: "",
                test_date: new Date().toISOString().split("T")[0],
            });
            setShowLabTestForm(false);
            toast.success("Lab test ordered successfully");
        } catch (error) {
            console.error(error);
            toast.error("Failed to add lab test");
        }
    };



    const handleAddPrescription = async () => {
        if (!newPrescription.medicine_id || !newPrescription.dosage.trim() ||
            !newPrescription.frequency.trim() || !newPrescription.duration.trim()) {
            toast.error("Please fill in all prescription fields");
            return;
        }
        if (!recordId) {
            toast.error("Please save medical record first");
            return;
        }

        try {
            const { data, error } = await supabase
                .from("prescription")
                .insert([{
                    medical_record_id: recordId,
                    medicine_id: newPrescription.medicine_id,
                    dosage: newPrescription.dosage,
                    frequency: newPrescription.frequency,
                    duration: newPrescription.duration,
                }])
                .select();

            if (error) throw error;

            setRecordPrescriptions([...recordPrescriptions, ...data]);
            setNewPrescription({ medicine_id: "", dosage: "", frequency: "", duration: "" });
            setShowPrescriptionForm(false);
            toast.success("Prescription added successfully");
        } catch (error) {
            console.error(error);
            toast.error("Failed to add prescription");
        }
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

    // Check if appointment can be edited (medical record, lab tests, prescriptions)
    const isAppointmentEditable = () => {
        return appointment.status === "Completed" || appointment.status === "Accepted";
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
                                disabled={!isAppointmentEditable()}
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
                            disabled={!isAppointmentEditable()}
                        >
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                        </Button>
                        <Button
                            className="w-full bg-green-600 hover:bg-green-700"
                            onClick={handleCompleteAppointment}
                            disabled={!isAppointmentEditable()}
                        >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Complete Appointment
                        </Button>
                        {!isAppointmentEditable() && (
                            <p className="text-xs text-gray-500 text-center">
                                This appointment cannot be modified.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Medical Record - Only show if editable */}
            {isAppointmentEditable() && (
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
            )}

            {/* Medical Record Display for non-editable appointments */}
            {!isAppointmentEditable() && medicalRecord && (
                <Card className="border-0 shadow-md">
                    <CardHeader>
                        <CardTitle>Medical Record</CardTitle>
                        <CardDescription>
                            Diagnosis and treatment for this visit (read-only)
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label className="text-sm text-gray-600">Diagnosis</Label>
                                <p className="mt-1 p-3 bg-gray-50 rounded text-sm">{medicalRecord.diagnosis || 'No diagnosis recorded'}</p>
                            </div>
                            <div>
                                <Label className="text-sm text-gray-600">Treatment</Label>
                                <p className="mt-1 p-3 bg-gray-50 rounded text-sm">{medicalRecord.treatment || 'No treatment recorded'}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Lab Tests */}
            <Card className="border-0 shadow-md">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Lab Tests</CardTitle>
                            <CardDescription>Ordered tests for this patient</CardDescription>
                        </div>
                        {isAppointmentEditable() && (
                            <Button
                                onClick={() => setShowLabTestForm(!showLabTestForm)}
                                className="bg-[#007BFF] hover:bg-blue-600"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Order Test
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {isAppointmentEditable() && showLabTestForm && (
                        <Card className="mb-4 bg-blue-50 border-blue-200">
                            <CardContent className="pt-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="lab_test">Test Type</Label>
                                        <Select
                                            value={newLabTest.lab_test_id}
                                            onValueChange={(value) =>
                                                setNewLabTest({ ...newLabTest, lab_test_id: value })
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select test type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {labTests.map((test) => (
                                                    <SelectItem key={test.id} value={test.id.toString()}>
                                                        {test.test_type}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label htmlFor="test_date">Test Date</Label>
                                        <Input
                                            id="test_date"
                                            type="date"
                                            value={newLabTest.test_date}
                                            onChange={(e) =>
                                                setNewLabTest({ ...newLabTest, test_date: e.target.value })
                                            }
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
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recordLabTests.map((test) => (
                                <TableRow key={test.id}>
                                    <TableCell className="font-medium">{test.test_type}</TableCell>
                                    <TableCell>{test.test_date}</TableCell>
                                    <TableCell>{test.result}</TableCell>
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
                        {isAppointmentEditable() && (
                            <Button
                                onClick={() => setShowPrescriptionForm(!showPrescriptionForm)}
                                className="bg-[#007BFF] hover:bg-blue-600"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Prescription
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {isAppointmentEditable() && showPrescriptionForm && (
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
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recordPrescriptions.map((prescription) => {
                                const medicine = findMedicineById(prescription.medicine_id);
                                return (
                                    <TableRow key={prescription.id}>
                                        <TableCell className="font-medium">
                                            {medicine?.name}
                                        </TableCell>
                                        <TableCell>{prescription.dosage}</TableCell>
                                        <TableCell>{prescription.frequency}</TableCell>
                                        <TableCell>{prescription.duration}</TableCell>
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