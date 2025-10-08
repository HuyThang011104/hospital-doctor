/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Heart } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";


export default function LoginPage() {
    const { login } = useAuth();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const success = await login(username, password);
            if (success) {
                toast.success('Login successful!');
            } else {
                toast.error('Invalid email or password');
            }
        } catch (error) {
            toast.error('Login failed. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="text-center space-y-4">
                    <div className="flex items-center justify-center space-x-2">
                        <div className="p-2 bg-blue-100 rounded-full">
                            <Heart className="h-8 w-8 text-[#007BFF]" />
                        </div>
                    </div>
                    <div>
                        <CardTitle className="text-2xl">Hospital Portal</CardTitle>
                        <CardDescription>
                            Doctor Access System
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                type="text"
                                placeholder="Enter your username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                className="border-gray-200 focus:border-[#007BFF] focus:ring-[#007BFF]"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="border-gray-200 focus:border-[#007BFF] focus:ring-[#007BFF]"
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full bg-[#007BFF] hover:bg-blue-600 text-white"
                        >
                            Sign In
                        </Button>
                    </form>
                    <div className="mt-4 text-center">
                        <p className="text-sm text-gray-600">
                            Demo credentials: <span className="font-mono bg-gray-100 px-1 rounded">hminh@hospital.com</span> / <span className="font-mono bg-gray-100 px-1 rounded">docpass1</span>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}