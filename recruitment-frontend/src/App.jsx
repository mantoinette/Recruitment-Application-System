import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";

import Home from "./components/Home";
import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";
import ApplicantDashboard from "./pages/applicant/Dashboard";
import ApplicantProfile from "./pages/applicant/Profile";
import ApplicantStatus from "./pages/applicant/Status";
import HrDashboard from "./pages/hr/Dashboard";
import AdminDashboard from "./pages/admin/Dashboard";
import ApplicationForm from "./pages/applicant/ApplicationForm";


function App() {

    return (

        <BrowserRouter>

            <Routes>

                <Route
                    path="/"
                    element={<Home />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/applicant/dashboard"
                    element={<ApplicantDashboard />}
                />

                <Route
                    path="/applicant/apply"
                    element={<ApplicationForm />}
                />

                <Route
                    path="/applicant/status"
                    element={<ApplicantStatus />}
                />

                <Route
                    path="/applicant/profile"
                    element={<ApplicantProfile />}
                />

                <Route
                    path="/hr/dashboard"
                    element={<HrDashboard />}
                />

                <Route
                    path="/admin/dashboard"
                    element={<AdminDashboard />}
                />

                <Route
                    path="/apply"
                    element={<Navigate to="/applicant/apply" replace />}
                />

                <Route
                    path="*"
                    element={<Navigate to="/" replace />}
                />

            </Routes>

        </BrowserRouter>

    );

}

export default App;
