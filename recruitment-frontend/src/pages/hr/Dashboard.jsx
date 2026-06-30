import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import api from "../../api/axios";
import HrLayout from "../../layouts/HrLayout";
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
                setApplications(Array.isArray(applicationsResponse.data) ? applicationsResponse.data : []);
            } catch (error) {
                console.error("Failed to load HR dashboard", error);
            }
        };

        loadDashboard();
    }, []);

    const chartItems = [
        { label: "Pending", value: stats?.pendingApplications ?? 0, color: "#f59e0b" },
        { label: "Reviewed", value: stats?.reviewedApplications ?? 0, color: "#2563eb" },
        { label: "Approved", value: stats?.approvedApplications ?? 0, color: "#16a34a" },
        { label: "Rejected", value: stats?.rejectedApplications ?? 0, color: "#dc2626" }
    ];

    const activities = applications.map((app) => ({
        id: app.id,
        title: app.user?.fullName || "Applicant",
        subtitle: app.positionApplied || app.job?.title || "New application",
        status: app.status,
        statusClass: (app.status || "PENDING").toLowerCase(),
        color: "#16a34a"
    }));

    return (
        <HrLayout title="HR Dashboard">
            <div className="page">
                <div className="page-header">
                    <div>
                        <div className="page-kicker">Recruitment Overview</div>
                        <h1 className="page-title">Hiring command center</h1>
                        <p className="page-copy">
                            Monitor applications, review candidates, and manage open vacancies.
                        </p>
                    </div>
                    <Link className="primary-button" to="/hr/applications">
                        Review applications <FiArrowRight />
                    </Link>
                </div>

                <div className="grid stats-grid">
                    <div className="stat-card highlight">
                        <div className="stat-label">Open vacancies</div>
                        <div className="stat-value">{stats?.openJobs ?? 0}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Total applications</div>
                        <div className="stat-value">{stats?.totalApplications ?? 0}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Pending review</div>
                        <div className="stat-value">{stats?.pendingApplications ?? 0}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Approved</div>
                        <div className="stat-value">{stats?.approvedApplications ?? 0}</div>
                    </div>
                </div>

                <div className="grid two-column">
                    <div className="panel">
                        <h2 className="panel-title">Application pipeline</h2>
                        <StatBarChart items={chartItems} />
                    </div>

                    <div className="panel">
                        <h2 className="panel-title">Recent applications</h2>
                        <ActivityFeed items={activities} />
                    </div>
                </div>

                <div className="panel quick-links-panel">
                    <h2 className="panel-title">Quick access</h2>
                    <div className="quick-links">
                        <Link className="quick-link-card" to="/hr/applications">Review applications</Link>
                        <Link className="quick-link-card" to="/hr/jobs">Manage vacancies</Link>
                        <Link className="quick-link-card" to="/hr/candidates">Approved candidates</Link>
                        <Link className="quick-link-card" to="/hr/reports">View reports</Link>
                    </div>
                </div>
            </div>
        </HrLayout>
    );
}

export default Dashboard;
