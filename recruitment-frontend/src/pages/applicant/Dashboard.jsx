import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiBriefcase, FiCheckCircle, FiClock } from "react-icons/fi";
import api from "../../api/axios";
import ApplicantLayout from "../../layouts/ApplicantLayout";
import StatBarChart from "../../components/StatBarChart";
import ActivityFeed from "../../components/ActivityFeed";
import { getUser } from "../../utils/auth";

function Dashboard() {
    const user = getUser() || {};
    const [applications, setApplications] = useState([]);
    const [profileComplete, setProfileComplete] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            if (!user.id) {
                return;
            }

            try {
                const [appsResponse, profileStatus] = await Promise.all([
                    api.get(`/applications/user/${user.id}`),
                    api.get(`/profile/${user.id}/status`)
                ]);

                setApplications(Array.isArray(appsResponse.data) ? appsResponse.data : []);
                setProfileComplete(Boolean(profileStatus.data.profileComplete));
            } catch (error) {
                console.error("Failed to load dashboard", error);
            }
        };

        loadData();
    }, [user.id]);

    const total = applications.length;
    const pending = applications.filter((a) => a.status === "PENDING").length;
    const approved = applications.filter((a) => a.status === "APPROVED").length;
    const rejected = applications.filter((a) => a.status === "REJECTED").length;

    const chartItems = [
        { label: "Pending", value: pending, color: "#f59e0b" },
        { label: "Approved", value: approved, color: "#16a34a" },
        { label: "Rejected", value: rejected, color: "#dc2626" }
    ];

    const activities = applications.slice(0, 5).map((app) => ({
        id: app.id,
        title: app.positionApplied || app.job?.title || `Application #${app.id}`,
        subtitle: "Your submitted application",
        status: app.status,
        statusClass: (app.status || "PENDING").toLowerCase(),
        color: "#2563eb"
    }));

    return (
        <ApplicantLayout title="Applicant Dashboard">
            <section className="page">
                <div className="page-header">
                    <div>
                        <div className="page-kicker">Overview</div>
                        <h1 className="page-title">Welcome back, {user.fullName || "Applicant"}</h1>
                        <p className="page-copy">
                            Complete your profile, browse vacancies, and track your applications.
                        </p>
                    </div>
                    <Link className="primary-button" to="/">
                        Browse jobs <FiArrowRight />
                    </Link>
                </div>

                {!profileComplete && (
                    <div className="alert-banner">
                        <FiClock />
                        <div>
                            <strong>Complete your profile before applying.</strong>
                            <div className="muted">Personal info, education, skills, and documents are required.</div>
                        </div>
                        <Link className="secondary-button" to="/applicant/profile">Complete profile</Link>
                    </div>
                )}

                <div className="grid stats-grid">
                    <div className="stat-card highlight">
                        <div className="stat-label">Profile status</div>
                        <div className="stat-value small">{profileComplete ? "Complete" : "Incomplete"}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Applications</div>
                        <div className="stat-value">{total}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Pending</div>
                        <div className="stat-value">{pending}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Approved</div>
                        <div className="stat-value">{approved}</div>
                    </div>
                </div>

                <div className="grid two-column">
                    <div className="panel">
                        <h2 className="panel-title">Application breakdown</h2>
                        <StatBarChart items={chartItems} />
                    </div>

                    <div className="panel">
                        <h2 className="panel-title">Recent activity</h2>
                        <ActivityFeed items={activities} />
                    </div>
                </div>

                <div className="panel quick-links-panel">
                    <h2 className="panel-title">Quick actions</h2>
                    <div className="quick-links">
                        <Link className="quick-link-card" to="/applicant/profile">
                            <FiCheckCircle /> Update profile
                        </Link>
                        <Link className="quick-link-card" to="/applicant/status">
                            <FiClock /> View status
                        </Link>
                        <Link className="quick-link-card" to="/">
                            <FiBriefcase /> Browse vacancies
                        </Link>
                    </div>
                </div>
            </section>
        </ApplicantLayout>
    );
}

export default Dashboard;
