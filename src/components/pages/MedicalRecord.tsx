/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { FileText, Search, Eye, Users, TestTube, Pill, Calendar } from "lucide-react";
import type { MedicalRecord, Patient, Prescription, Medicine, LabTest } from "@/utils/mock/mock-data";
import { supabase } from "@/utils/backend/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

interface MedicalRecordsPageProps {
    onNavigate: (page: string, data?: any) => void;
}

export default function MedicalRecordsPage({ onNavigate }: MedicalRecordsPageProps) {
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRecord, setSelectedRecord] = useState<any>(null);
    const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [labTests, setLabTests] = useState<LabTest[]>([]);
    const [loading, setLoading] = useState(true);



    const fetchMedicalRecordsData = useCallback(async () => {
        if (!user?.id) return;

        try {
            setLoading(true);

            // Fetch medical records for this doctor
            const { data: recordsData, error: recordsError } = await supabase
                .from("medical_record")
                .select("*")
                .eq("doctor_id", user.id);

            if (recordsError) throw recordsError;

            // Fetch patients who have records with this doctor
            const patientIds = [...new Set(recordsData?.map(r => r.patient_id) || [])];
            const { data: patientsData, error: patientsError } = await supabase
                .from("patient")
                .select("*")
                .in("id", patientIds);

            if (patientsError) throw patientsError;

            // Fetch prescriptions for these medical records
            const recordIds = [...new Set(recordsData?.map(r => r.id) || [])];
            const { data: prescriptionsData, error: prescriptionsError } = await supabase
                .from("prescription")
                .select("*")
                .in("medical_record_id", recordIds);

            if (prescriptionsError) throw prescriptionsError;

            // Fetch medicines referenced in prescriptions
            const medicineIds = [...new Set(prescriptionsData?.map(p => p.medicine_id) || [])];
            const { data: medicinesData, error: medicinesError } = await supabase
                .from("medicine")
                .select("*")
                .in("id", medicineIds);

            if (medicinesError) throw medicinesError;

            // Fetch lab tests for these medical records
            const { data: labTestsData, error: labTestsError } = await supabase
                .from("lab_test")
                .select("*")
                .in("medical_record_id", recordIds);

            if (labTestsError) throw labTestsError;

            setMedicalRecords(recordsData || []);
            setPatients(patientsData || []);
            setPrescriptions(prescriptionsData || []);
            setMedicines(medicinesData || []);
            setLabTests(labTestsData || []);

        } catch (error) {
            console.error("Error fetching medical records data:", error);
            toast.error("Failed to load medical records");
        } finally {
            setLoading(false);
        }
    }, [user?.id]);
    useEffect(() => {
        fetchMedicalRecordsData();
    }, [fetchMedicalRecordsData]);

    const getPatientById = (id: number): Patient | undefined => {
        return patients.find(p => p.id === id);
    };

    const getPrescriptionsByRecordId = (recordId: number): Prescription[] => {
        return prescriptions.filter(p => p.medical_record_id === recordId);
    };

    const getMedicineById = (id: number): Medicine | undefined => {
        return medicines.find(m => m.id === id);
    };

    const getLabTestsByRecordId = (recordId: number): LabTest[] => {
        return labTests.filter(l => l.medical_record_id === recordId);
    };

    const filteredRecords = medicalRecords.filter(record => {
        const patient = getPatientById(record.patient_id);
        const searchLower = searchTerm.toLowerCase();

        const matchesSearch =
            patient?.full_name.toLowerCase().includes(searchLower) ||
            record.diagnosis.toLowerCase().includes(searchLower) ||
            record.treatment.toLowerCase().includes(searchLower);

        return matchesSearch;
    });

    const stats = [
        {
            title: "Total Records",
            value: medicalRecords.length,
            description: "All medical records",
            icon: FileText,
            color: "text-blue-600",
            bgColor: "bg-blue-100"
        },
        {
            title: "Patients Treated",
            value: new Set(medicalRecords.map(r => r.patient_id)).size,
            description: "Unique patients",
            icon: Users,
            color: "text-green-600",
            bgColor: "bg-green-100"
        },
        {
            title: "Lab Tests",
            value: labTests.length,
            description: "Tests ordered",
            icon: TestTube,
            color: "text-orange-600",
            bgColor: "bg-orange-100"
        },
        {
            title: "Prescriptions",
            value: prescriptions.length,
            description: "Medications prescribed",
            icon: Pill,
            color: "text-purple-600",
            bgColor: "bg-purple-100"
        }
    ];

    const recentRecords = medicalRecords
        .sort((a, b) => new Date(b.record_date).getTime() - new Date(a.record_date).getTime())
        .slice(0, 5);

    const openRecordDetail = (record: any) => {
        setSelectedRecord(record);
    };

    // const handleCreateNewRecord = () => {
    //     onNavigate('create-medical-record');
    // };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading medical records...</p>
                </div>
            </div>
        );
    }

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

            {/* Search and Filters */}
            <Card className="border-0 shadow-md">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Search Medical Records</CardTitle>
                            <CardDescription>Find patient records by name, diagnosis, or treatment</CardDescription>
                        </div>
                        {/* <Button onClick={handleCreateNewRecord} className="bg-[#007BFF] hover:bg-blue-600">
                            <FileText className="h-4 w-4 mr-2" />
                            Create New Record
                        </Button> */}
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <Label htmlFor="search">Search Records</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    id="search"
                                    placeholder="Search by patient name, diagnosis, or treatment..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                        </div>
                        <div className="flex items-end">
                            <Button className="bg-[#007BFF] hover:bg-blue-600">
                                <Search className="h-4 w-4 mr-2" />
                                Search
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="border-0 shadow-md">
                <CardHeader>
                    <CardTitle>Recent Medical Records</CardTitle>
                    <CardDescription>Your most recent patient consultations and treatments</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {recentRecords.map((record) => {
                            const patient = getPatientById(record.patient_id);

                            return (
                                <Card key={record.id} className="border border-gray-200">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className="p-2 bg-blue-100 rounded-full">
                                                    <FileText className="h-4 w-4 text-blue-600" />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium">{patient?.full_name}</h4>
                                                    <p className="text-sm text-gray-600">{record.diagnosis}</p>
                                                    <div className="flex items-center space-x-4 mt-1">
                                                        <div className="flex items-center space-x-1">
                                                            <Calendar className="h-3 w-3 text-gray-400" />
                                                            <span className="text-xs text-gray-500">
                                                                {new Date(record.record_date).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        <Badge variant="outline" className="text-xs">
                                                            {getPrescriptionsByRecordId(record.id).length} prescriptions
                                                        </Badge>
                                                        <Badge variant="outline" className="text-xs">
                                                            {getLabTestsByRecordId(record.id).length} lab tests
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => openRecordDetail(record)}
                                                className="text-[#007BFF] border-[#007BFF] hover:bg-blue-50"
                                            >
                                                <Eye className="h-4 w-4 mr-1" />
                                                View Details
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Medical Records Table */}
            <Card className="border-0 shadow-md">
                <CardHeader>
                    <CardTitle>All Medical Records</CardTitle>
                    <CardDescription>Complete list of patient medical records you've created</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Patient Name</TableHead>
                                <TableHead>Diagnosis</TableHead>
                                <TableHead>Treatment</TableHead>
                                <TableHead>Record Date</TableHead>
                                <TableHead>Prescriptions</TableHead>
                                <TableHead>Lab Tests</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredRecords.map((record) => {
                                const patient = getPatientById(record.patient_id);
                                const recordPrescriptions = getPrescriptionsByRecordId(record.id);
                                const recordLabTests = getLabTestsByRecordId(record.id);

                                return (
                                    <TableRow key={record.id}>
                                        <TableCell className="font-medium">
                                            {patient?.full_name}
                                        </TableCell>
                                        <TableCell className="max-w-xs">
                                            <p className="truncate" title={record.diagnosis}>
                                                {record.diagnosis}
                                            </p>
                                        </TableCell>
                                        <TableCell className="max-w-xs">
                                            <p className="truncate" title={record.treatment}>
                                                {record.treatment}
                                            </p>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(record.record_date).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {recordPrescriptions.length}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {recordLabTests.length}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => openRecordDetail(record)}
                                                    className="text-[#007BFF] border-[#007BFF] hover:bg-blue-50"
                                                >
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    View
                                                </Button>
                                                {recordPrescriptions.length > 0 && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => onNavigate('prescription', { medicalRecord: record })}
                                                        className="text-purple-600 border-purple-600 hover:bg-purple-50"
                                                    >
                                                        <Pill className="h-4 w-4 mr-1" />
                                                        Prescriptions
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Record Detail Dialog */}
            <Dialog open={!!selectedRecord} onOpenChange={() => setSelectedRecord(null)}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Medical Record Details</DialogTitle>
                        <DialogDescription>
                            Complete medical record information including prescriptions and lab tests
                        </DialogDescription>
                    </DialogHeader>

                    {selectedRecord && (
                        <div className="space-y-6">
                            {/* Patient & Record Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Patient Information</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        {(() => {
                                            const patient = getPatientById(selectedRecord.patient_id);
                                            return (
                                                <>
                                                    <div>
                                                        <Label className="text-sm text-gray-600">Name</Label>
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
                                                </>
                                            );
                                        })()}
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Record Information</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <div>
                                            <Label className="text-sm text-gray-600">Record Date</Label>
                                            <p className="font-medium">{new Date(selectedRecord.record_date).toLocaleDateString()}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm text-gray-600">Diagnosis</Label>
                                            <p>{selectedRecord.diagnosis}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm text-gray-600">Treatment</Label>
                                            <p>{selectedRecord.treatment}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Prescriptions and Lab Tests */}
                            <Tabs defaultValue="prescriptions" className="w-full">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="prescriptions">
                                        Prescriptions ({getPrescriptionsByRecordId(selectedRecord.id).length})
                                    </TabsTrigger>
                                    <TabsTrigger value="labtests">
                                        Lab Tests ({getLabTestsByRecordId(selectedRecord.id).length})
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="prescriptions">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg">Prescribed Medications</CardTitle>
                                        </CardHeader>
                                        <CardContent>
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
                                                    {getPrescriptionsByRecordId(selectedRecord.id).map((prescription) => {
                                                        const medicine = getMedicineById(prescription.medicine_id);
                                                        return (
                                                            <TableRow key={prescription.id}>
                                                                <TableCell>
                                                                    <div>
                                                                        <p className="font-medium">{medicine?.name}</p>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell>{prescription.dosage}</TableCell>
                                                                <TableCell>{prescription.frequency}</TableCell>
                                                                <TableCell>{prescription.duration}</TableCell>
                                                            </TableRow>
                                                        );
                                                    })}
                                                    {getPrescriptionsByRecordId(selectedRecord.id).length === 0 && (
                                                        <TableRow>
                                                            <TableCell colSpan={4} className="text-center text-gray-500">
                                                                No prescriptions for this record
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="labtests">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg">Laboratory Tests</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Test Type</TableHead>
                                                        <TableHead>Test Date</TableHead>
                                                        <TableHead>Result</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {getLabTestsByRecordId(selectedRecord.id).map((test) => (
                                                        <TableRow key={test.id}>
                                                            <TableCell className="font-medium">{test.test_type}</TableCell>
                                                            <TableCell>{test.test_date}</TableCell>
                                                            <TableCell>

                                                                {test.result}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                    {getLabTestsByRecordId(selectedRecord.id).length === 0 && (
                                                        <TableRow>
                                                            <TableCell colSpan={3} className="text-center text-gray-500">
                                                                No lab tests for this record
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            </Tabs>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}