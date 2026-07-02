import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";

import Home from "./components/home";
import JobDetail from "./pages/public/JobDetail";
import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import ApplicantDashboard from "./pages/applicant/Dashboard";
import ApplicantProfile from "./pages/applicant/Profile";
import ApplicantStatus from "./pages/applicant/Status";
import ApplicantJobs from "./pages/applicant/AvailableJobs";
import ApplicantApplications from "./pages/applicant/MyApplications";
import ApplicantNotifications from "./pages/applicant/Notifications";
import HrDashboard from "./pages/hr/Dashboard";
import HrApplications from "./pages/hr/Applications";
import HrCandidates from "./pages/hr/Candidates";
import HrReports from "./pages/hr/Reports";
import HrInterviews from "./pages/hr/Interviews";
import HrJobs from "./pages/hr/Jobs";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import AdminReports from "./pages/admin/Reports";
import AdminJobs from "./pages/admin/Jobs";
import AdminDepartments from "./pages/admin/Departments";
import AdminSettings from "./pages/admin/Settings";
import ApplicationForm from "./pages/applicant/ApplicationForm";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/jobs/:id" element={<JobDetail />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />

                <Route
                    path="/applicant/dashboard"
                    element={
                        <ProtectedRoute allowedRoles={["APPLICANT"]}>
                            <ApplicantDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/applicant/apply/:jobId"
                    element={
                        <ProtectedRoute allowedRoles={["APPLICANT"]}>
                            <ApplicationForm />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/applicant/status"
                    element={
                        <ProtectedRoute allowedRoles={["APPLICANT"]}>
                            <ApplicantStatus />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/applicant/profile"
                    element={
                        <ProtectedRoute allowedRoles={["APPLICANT"]}>
                            <ApplicantProfile />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/applicant/jobs"
                    element={
                        <ProtectedRoute allowedRoles={["APPLICANT"]}>
                            <ApplicantJobs />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/applicant/applications"
                    element={
                        <ProtectedRoute allowedRoles={["APPLICANT"]}>
                            <ApplicantApplications />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/applicant/notifications"
                    element={
                        <ProtectedRoute allowedRoles={["APPLICANT"]}>
                            <ApplicantNotifications />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/hr/dashboard"
                    element={
                        <ProtectedRoute allowedRoles={["HR"]}>
                            <HrDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/hr/applications"
                    element={
                        <ProtectedRoute allowedRoles={["HR"]}>
                            <HrApplications />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/hr/jobs"
                    element={
                        <ProtectedRoute allowedRoles={["HR"]}>
                            <HrJobs />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/hr/candidates"
                    element={
                        <ProtectedRoute allowedRoles={["HR"]}>
                            <HrCandidates />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/hr/interviews"
                    element={
                        <ProtectedRoute allowedRoles={["HR"]}>
                            <HrInterviews />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/hr/reports"
                    element={
                        <ProtectedRoute allowedRoles={["HR"]}>
                            <HrReports />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/dashboard"
                    element={
                        <ProtectedRoute allowedRoles={["ADMIN"]}>
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/users"
                    element={
                        <ProtectedRoute allowedRoles={["ADMIN"]}>
                            <AdminUsers />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/reports"
                    element={
                        <ProtectedRoute allowedRoles={["ADMIN"]}>
                            <AdminReports />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/jobs"
                    element={
                        <ProtectedRoute allowedRoles={["ADMIN"]}>
                            <AdminJobs />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/departments"
                    element={
                        <ProtectedRoute allowedRoles={["ADMIN"]}>
                            <AdminDepartments />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/settings"
                    element={
                        <ProtectedRoute allowedRoles={["ADMIN"]}>
                            <AdminSettings />
                        </ProtectedRoute>
                    }
                />

                <Route path="/applicant/apply" element={<Navigate to="/" replace />} />
                <Route path="/apply" element={<Navigate to="/" replace />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
