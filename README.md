# Hospital Doctor Management System

A comprehensive hospital management system built with React, TypeScript, and Supabase for managing doctor appointments, medical records, work schedules, and administrative tasks.

## 🏥 Overview

This is a hospital management project developed by Group 1 for the ERP course. Although the system is still incomplete in some parts, it already includes the essential functions of a management system with full user roles. Due to the urgent two-week deadline, our goal was to complete a working version. After that, we plan to continuously improve and restructure the code.

This project is created for the community — a place where we contribute our humble knowledge, and above all, our dedication and passion.

Most importantly, we had the opportunity to work together — staying up late, discussing ideas, and coding side by side. As time passes and we each take different paths, we’ll always look back fondly on this beautiful period — when we had one another and shared the burning passion and aspirations of our youth.

## 📋 Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [Key Features](#key-features)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

- **Dashboard**: Overview of appointments, schedules, and important metrics
- **Appointment Management**: Create, view, and manage patient appointments
- **Medical Records**: Comprehensive patient medical record management
- **Work Schedule**: Manage doctor work schedules and availability
- **Leave Requests**: Submit and manage leave requests
- **Certificates**: Generate and manage medical certificates
- **Authentication**: Secure user authentication system
- **Responsive Design**: Mobile-friendly interface

## 🛠 Technology Stack

### Frontend

- **React 19.1.1** - UI framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool and development server
- **Tailwind CSS 4.1.14** - Utility-first CSS framework

### UI Components

- **Radix UI** - Unstyled, accessible components
- **Lucide React** - Icon library
- **Recharts** - Data visualization charts
- **React Hook Form** - Form management with validation
- **Zod** - Schema validation
- **Sonner** - Toast notifications

### Backend & Database

- **Supabase** - Backend as a Service (Authentication, Database, Storage)

### Development Tools

- **ESLint** - Code linting
- **TypeScript ESLint** - TypeScript specific linting rules
- **React Compiler** - Experimental React compiler optimization

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 18 or higher)
- **npm** (comes with Node.js)
- **Git** for version control
- **Supabase account** for backend services

## 🚀 Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/HuyThang011104/hospital-doctor
   cd hospital-doctor
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up Supabase**

   - Create a new Supabase project
   - Configure your database tables
   - Enable authentication
   - Get your Supabase URL and anon key

4. **Environment Variables**
   Create a `.env` file in the root directory:

   ```env
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## ⚙️ Configuration

### Database Setup

Make sure your Supabase database has the following tables (or similar):

- **users** - User information and roles
- **appointments** - Appointment scheduling and details
- **medical_records** - Patient medical history
- **work_schedules** - Doctor work schedules
- **leave_requests** - Leave request management
- **certificates** - Medical certificates

### Authentication

Configure Supabase authentication with appropriate providers (email, OAuth, etc.) and set up user roles (doctor, admin, etc.).

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## 📁 Project Structure

```
src/
├── components/
│   ├── pages/           # Page components
│   │   ├── Dashboard.tsx
│   │   ├── Appointment.tsx
│   │   ├── AppointmentDetail.tsx
│   │   ├── MedicalRecord.tsx
│   │   ├── WorkSchedule.tsx
│   │   ├── LeaveRequests.tsx
│   │   ├── Certificate.tsx
│   │   └── Login.tsx
│   └── ui/              # Reusable UI components
├── context/             # React context providers
│   └── auth-context.tsx
├── hooks/               # Custom React hooks
│   └── use-auth.tsx
├── layout/              # Layout components
├── lib/                 # Utility libraries
├── types/               # TypeScript type definitions
├── utils/               # Helper functions
├── App.tsx              # Main App component
├── main.tsx             # Application entry point
└── assets/              # Static assets
```

## 🎯 Key Features

### Dashboard

- Overview statistics and charts
- Quick access to main features
- Recent notifications and alerts

### Appointment Management

- Schedule new appointments
- View appointment details
- Manage appointment status
- Patient information management

### Medical Records

- Comprehensive patient history
- Lab test results
- Prescription management
- Document attachments

### Work Schedule

- Calendar view of schedules
- Shift management
- Availability tracking
- Time-off requests

### Leave Requests

- Submit leave requests
- Track request status
- Approval workflow
- Leave balance tracking

### Certificates

- Generate medical certificates
- Certificate templates
- Digital signatures
- Export functionality

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:

- Email: lehuythangvnsao@gmail.com
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Note**: This is a hospital management system designed specifically for doctor workflows and hospital administration. Ensure compliance with healthcare regulations and data privacy laws when deploying in a production environment.
