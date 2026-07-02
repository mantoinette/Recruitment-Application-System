import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import api from "../../api/axios";
import AdminLayout from "../../layouts/AdminLayout";
import StatBarChart from "../../components/StatBarChart";
import ActivityFeed from "../../components/ActivityFeed";

function Dashboard() {
    const [stats, setStats] = useState(null);
    const [applications, setApplications] = useState([]);

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const [statsResponse, applicationsResponse] = await Promise.all([
                    api.get("/stats"),
                    api.get("/applications/hr/latest")
                ]);

                setStats(statsResponse.data);
                setApplications(Array.isArray(applicationsResponse.data) ? applicationsResponse.data.slice(0, 6) : []);
            } catch (error) {
                console.error("Failed to load admin dashboard", error);
            }
        };

        loadDashboard();
    }, []);

    const userChart = [
        { label: "Applicants", value: stats?.applicantUsers ?? 0, color: "#2563eb" },
        { label: "HR", value: stats?.hrUsers ?? 0, color: "#16a34a" },
        { label: "Admins", value: stats?.adminUsers ?? 0, color: "#7c3aed" }
    ];

    const activities = applications.map((app) => ({
        id: app.id,
        title: app.user?.fullName || "Applicant",
        subtitle: app.positionApplied || "Application submitted",
        status: app.status,
        statusClass: (app.status || "PENDING").toLowerCase(),
        color: "#7c3aed"
    }));

    return (
        <AdminLayout title="Admin Dashboard">
            <div className="page">
                <div className="page-header">
                    <div>
                        <div className="page-kicker">System Overview</div>
                        <h1 className="page-title">Administration dashboard</h1>
                        <p className="page-copy">
                            Monitor platform activity, user distribution, and recruitment performance.
                        </p>
                    </div>
                    <Link className="primary-button" to="/admin/users">
                        Manage users <FiArrowRight />
                    </Link>
                </div>

                <div className="grid stats-grid">
                    <div className="stat-card highlight">
                        <div className="stat-label">Total users</div>
                        <div className="stat-value">{stats?.totalUsers ?? 0}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Open jobs</div>
                        <div className="stat-value">{stats?.openJobs ?? 0}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Applications</div>
                        <div className="stat-value">{stats?.totalApplications ?? 0}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Approved</div>
                        <div className="stat-value">{stats?.approvedApplications ?? 0}</div>
                    </div>
                </div>

                <div className="grid two-column">
                    <div className="panel">
                        <h2 className="panel-title">User distribution</h2>
                        <StatBarChart items={userChart} />
                    </div>

                    <div className="panel">
                        <h2 className="panel-title">Recent platform activity</h2>
                        <ActivityFeed items={activities} />
                    </div>
                </div>

                <div className="panel quick-links-panel">
                    <h2 className="panel-title">Quick access</h2>
                    <div className="quick-links">
                        <Link className="quick-link-card" to="/admin/users">Manage users</Link>
                        <Link className="quick-link-card" to="/">View public vacancies</Link>
                        <Link className="quick-link-card" to="/admin/reports">View reports</Link>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

export default Dashboard;
