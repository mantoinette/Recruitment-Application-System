import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";

import Home from "./components/home";
import JobDetail from "./pages/public/JobDetail";
import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import ApplicantDashboard from "./pages/applicant/Dashboard";
import ApplicantProfile from "./pages/applicant/Profile";
import ApplicantStatus from "./pages/applicant/Status";
import HrDashboard from "./pages/hr/Dashboard";
import HrApplications from "./pages/hr/Applications";
import HrCandidates from "./pages/hr/Candidates";
import HrReports from "./pages/hr/Reports";
import HrJobs from "./pages/hr/Jobs";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
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

                <Route path="/applicant/apply" element={<Navigate to="/" replace />} />
                <Route path="/apply" element={<Navigate to="/" replace />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
