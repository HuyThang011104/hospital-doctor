/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-refresh/only-export-components */
import { supabase } from '@/utils/backend/client';
import type { Patient } from '@/utils/mock/mock-data';
import { createContext, useState, useEffect, type ReactNode } from 'react';

interface AuthContextType {
    user: Patient | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
    updateProfile: (userData: Partial<Omit<Patient, 'id' | 'email'>>) => Promise<boolean>;
}

// Khởi tạo Context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);


// Key dùng để lưu ID người dùng vào localStorage
const USER_STORAGE_KEY = 'patient_user_id';

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<Patient | null>(null);
    const [loading, setLoading] = useState(true);

    // --- Khởi tạo: Tải người dùng từ Local Storage ---
    useEffect(() => {
        const loadUser = async () => {
            const userId = localStorage.getItem(USER_STORAGE_KEY);
            if (userId) {
                // Truy vấn bảng patients bằng ID đã lưu
                const { data, error } = await supabase
                    .from('doctor')
                    .select('*')
                    .eq('id', userId)
                    .limit(1)
                    .single();

                if (data && !error) {
                    // Loại bỏ trường password trước khi lưu vào state
                    const { password, ...patientData } = data;
                    setUser(patientData as Patient);
                } else {
                    console.error('Error loading stored user:', error);
                    localStorage.removeItem(USER_STORAGE_KEY); // Xóa ID lỗi
                }
            }
            setLoading(false);
        };

        loadUser();
    }, []);

    // --- Hàm Đăng nhập ---
    const login = async (email: string, password: string): Promise<boolean> => {
        const { data, error } = await supabase
            .from('doctor')
            .select('*')
            .eq('email', email)
            .eq('password', password)
            .limit(1)
            .single();

        if (error) {
            console.error('Login failed or user not found:', error);
            return false;
        }

        if (data) {
            const patientData = data as Patient;

            localStorage.setItem(USER_STORAGE_KEY, patientData.id.toString());
            setUser(patientData);
            return true;
        }

        return false; // Không khớp email/password
    };

    // --- Hàm Đăng xuất ---
    const logout = () => {
        localStorage.removeItem(USER_STORAGE_KEY);
        setUser(null);
    };

    // --- Hàm Cập nhật Hồ sơ ---
    const updateProfile = async (userData: Partial<Omit<Patient, 'id' | 'email'>>): Promise<boolean> => {
        if (!user) return false;

        const { error: updateError } = await supabase
            .from('doctor')
            .update(userData)
            .eq('id', user.id); // Cập nhật dựa trên ID người dùng hiện tại

        if (updateError) {
            console.error('Profile update error:', updateError.message);
            return false;
        }

        // Cập nhật trạng thái người dùng trong ứng dụng
        setUser({ ...user, ...userData });
        return true;
    };


    if (loading) {
        return <div>Loading authentication...</div>;
    }

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
            login,
            logout,
            updateProfile
        }}>
            {children}
        </AuthContext.Provider>
    );
}