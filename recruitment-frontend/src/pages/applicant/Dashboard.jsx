import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiBriefcase, FiCheckCircle, FiClock } from "react-icons/fi";
import api from "../../api/axios";
import ApplicantLayout from "../../layouts/ApplicantLayout";
import StatBarChart from "../../components/StatBarChart";
import ActivityFeed from "../../components/ActivityFeed";
import PageLoading from "../../components/PageLoading";
import ProfileStatusBanner from "../../components/ProfileStatusBanner";
import { useProfileStatus } from "../../hooks/useProfileStatus";
import { getUser } from "../../utils/auth";
import { statusClass, statusLabel } from "../../utils/statusHelpers";

function Dashboard() {
    const user = getUser() || {};
    const { profileComplete, loading: profileLoading, userId } = useProfileStatus();
    const [applications, setApplications] = useState([]);
    const [loadingApps, setLoadingApps] = useState(true);

    useEffect(() => {
        const loadApplications = async () => {
            if (!userId) {
                setLoadingApps(false);
                return;
            }

            try {
                const appsResponse = await api.get(`/applications/user/${userId}`);
                setApplications(Array.isArray(appsResponse.data) ? appsResponse.data : []);
            } catch (error) {
                console.error("Failed to load dashboard", error);
            } finally {
                setLoadingApps(false);
            }
        };

        loadApplications();
    }, [userId]);

    const loading = profileLoading || loadingApps;

    const total = applications.length;
    const pending = applications.filter((a) => a.status === "PENDING").length;
    const underReview = applications.filter((a) => a.status === "UNDER_REVIEW").length;
    const interview = applications.filter((a) => a.status === "INTERVIEW").length;
    const approved = applications.filter((a) => a.status === "APPROVED").length;
    const rejected = applications.filter((a) => a.status === "REJECTED").length;

    const chartItems = [
        { label: "Pending", value: pending, color: "#f59e0b" },
        { label: "Under Review", value: underReview, color: "#2563eb" },
        { label: "Interview", value: interview, color: "#7c3aed" },
        { label: "Approved", value: approved, color: "#16a34a" },
        { label: "Rejected", value: rejected, color: "#dc2626" }
    ];

    const activities = applications.slice(0, 5).map((app) => ({
        id: app.id,
        title: app.positionApplied || app.job?.title || `Application #${app.id}`,
        subtitle: app.status === "INTERVIEW" && app.interviewScheduledAt
            ? `Interview: ${new Date(app.interviewScheduledAt).toLocaleString()}`
            : "Your submitted application",
        status: statusLabel(app.status),
        statusClass: statusClass(app.status),
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
                            {profileComplete
                                ? "Your profile is complete. Browse vacancies and track your applications."
                                : "Complete your profile, browse vacancies, and track your applications."}
                        </p>
                    </div>
                    <Link className="primary-button" to="/applicant/jobs">
                        Browse jobs <FiArrowRight />
                    </Link>
                </div>

                {loading ? (
                    <PageLoading message="Loading dashboard..." />
                ) : (
                    <>
                        <ProfileStatusBanner
                            loading={profileLoading}
                            profileComplete={profileComplete}
                        />

                        <div className="grid stats-grid">
                            <div className={`stat-card highlight ${profileComplete ? "complete" : ""}`}>
                                <div className="stat-label">Profile status</div>
                                <div className="stat-value small">
                                    {profileComplete ? "Complete" : "Incomplete"}
                                </div>
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
                                <Link className="quick-link-card" to="/applicant/applications">
                                    <FiClock /> My applications
                                </Link>
                                <Link className="quick-link-card" to="/applicant/jobs">
                                    <FiBriefcase /> Browse vacancies
                                </Link>
                            </div>
                        </div>
                    </>
                )}
            </section>
        </ApplicantLayout>
    );
}

export default Dashboard;
