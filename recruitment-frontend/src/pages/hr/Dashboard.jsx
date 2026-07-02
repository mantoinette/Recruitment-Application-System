import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
    FiArrowRight,
    FiCalendar,
    FiCheckCircle,
    FiClipboard,
    FiEye,
    FiUsers,
    FiXCircle
} from "react-icons/fi";
import api from "../../api/axios";
import HrLayout from "../../layouts/HrLayout";
import StatBarChart from "../../components/StatBarChart";
import { statusClass, statusLabel } from "../../utils/statusHelpers";

const workflowSteps = [
    {
        step: 1,
        title: "Review applications",
        description: "Open applicant profiles, verify documents, and mark cases under review.",
        link: "/hr/applications",
        icon: FiClipboard
    },
    {
        step: 2,
        title: "View latest 10",
        description: "Monitor the most recent submissions sorted alphabetically for quick triage.",
        link: "#latest-applications",
        icon: FiUsers
    },
    {
        step: 3,
        title: "Approve / reject",
        description: "Approve successful candidates or reject with a clear reason sent to the applicant.",
        link: "/hr/applications",
        icon: FiCheckCircle
    },
    {
        step: 4,
        title: "Schedule interviews",
        description: "Set interview date, location, and notes. Applicants are notified to be ready.",
        link: "/hr/interviews",
        icon: FiCalendar
    }
];

function Dashboard() {
    const [stats, setStats] = useState(null);
    const [applications, setApplications] = useState([]);
    const latestRef = useRef(null);

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
        { label: "Under Review", value: stats?.underReviewApplications ?? 0, color: "#2563eb" },
        { label: "Interview", value: stats?.interviewApplications ?? 0, color: "#7c3aed" },
        { label: "Approved", value: stats?.approvedApplications ?? 0, color: "#16a34a" },
        { label: "Rejected", value: stats?.rejectedApplications ?? 0, color: "#dc2626" }
    ];

    return (
        <HrLayout title="HR Dashboard">
            <div className="page">
                <div className="page-header">
                    <div>
                        <div className="page-kicker">Recruitment Overview</div>
                        <h1 className="page-title">Hiring command center</h1>
                        <p className="page-copy">
                            Follow the recruitment process: review applications, decide outcomes, schedule interviews, and keep applicants informed.
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
                        <div className="stat-label">Interviews scheduled</div>
                        <div className="stat-value">{stats?.interviewApplications ?? 0}</div>
                    </div>
                </div>

                <div className="panel recruitment-workflow-panel">
                    <div className="workflow-header">
                        <div>
                            <h2 className="panel-title">HR recruitment process</h2>
                            <p className="page-copy">Each action updates the applicant status and sends an in-app notification.</p>
                        </div>
                        <div className="workflow-outcome">
                            <span className="workflow-outcome-label">Applicant outcome</span>
                            <strong>Applicant tracks status</strong>
                        </div>
                    </div>

                    <div className="workflow-steps">
                        {workflowSteps.map((item) => {
                            const Icon = item.icon;
                            const isAnchor = typeof item.link === "string" && item.link.startsWith("#");
                            return (
                                isAnchor ? (
                                    <button
                                        key={item.step}
                                        type="button"
                                        className="workflow-step-card workflow-step-button"
                                        onClick={() => latestRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
                                    >
                                        <div className="workflow-step-number">{item.step}</div>
                                        <div className="workflow-step-body">
                                            <div className="workflow-step-title">
                                                <Icon /> {item.title}
                                            </div>
                                            <p className="muted">{item.description}</p>
                                        </div>
                                        <FiArrowRight className="workflow-step-arrow" />
                                    </button>
                                ) : (
                                    <Link className="workflow-step-card" to={item.link} key={item.step}>
                                        <div className="workflow-step-number">{item.step}</div>
                                        <div className="workflow-step-body">
                                            <div className="workflow-step-title">
                                                <Icon /> {item.title}
                                            </div>
                                            <p className="muted">{item.description}</p>
                                        </div>
                                        <FiArrowRight className="workflow-step-arrow" />
                                    </Link>
                                )
                            );
                        })}
                    </div>
                </div>

                <div className="grid two-column">
                    <div className="panel">
                        <h2 className="panel-title">Application pipeline</h2>
                        <StatBarChart items={chartItems} />
                    </div>

                    <div className="panel workflow-notes-panel">
                        <h2 className="panel-title">Decision guidelines</h2>
                        <div className="workflow-notes">
                            <div className="workflow-note">
                                <FiCheckCircle />
                                <div>
                                    <strong>Approve</strong>
                                    <p className="muted">Candidate moves forward. Applicant receives approval notification.</p>
                                </div>
                            </div>
                            <div className="workflow-note">
                                <FiXCircle />
                                <div>
                                    <strong>Reject with reason</strong>
                                    <p className="muted">A rejection reason is required and sent to the applicant immediately.</p>
                                </div>
                            </div>
                            <div className="workflow-note">
                                <FiCalendar />
                                <div>
                                    <strong>Schedule interview</strong>
                                    <p className="muted">Set date, time, and location. Applicant is notified to be interview-ready.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="panel" id="latest-applications" ref={latestRef}>
                    <div className="vacancy-list-header">
                        <h2 className="panel-title"><FiUsers /> Latest 10 applications</h2>
                        <Link className="secondary-button" to="/hr/applications">View all applicants</Link>
                    </div>

                    {applications.length === 0 ? (
                        <p className="muted">No applications submitted yet.</p>
                    ) : (
                        <div className="latest-applications-table-wrap">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Applicant</th>
                                        <th>Position</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {applications.map((application) => (
                                        <tr key={application.id}>
                                            <td>
                                                <div className="step-title">{application.user?.fullName || application.user?.email}</div>
                                                <div className="muted">{application.user?.email || "-"}</div>
                                            </td>
                                            <td>{application.positionApplied || application.job?.title || "-"}</td>
                                            <td>
                                                <span className={`badge ${statusClass(application.status)}`}>
                                                    {statusLabel(application.status)}
                                                </span>
                                            </td>
                                            <td>
                                                <Link className="secondary-button small" to="/hr/applications">
                                                    <FiEye /> Review
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="panel quick-links-panel">
                    <h2 className="panel-title">Quick access</h2>
                    <div className="quick-links">
                        <Link className="quick-link-card" to="/hr/applications">Review applications</Link>
                        <Link className="quick-link-card" to="/hr/interviews">Scheduled interviews</Link>
                        <Link className="quick-link-card" to="/hr/jobs">Manage vacancies</Link>
                        <Link className="quick-link-card" to="/hr/candidates">Approved candidates</Link>
                    </div>
                </div>
            </div>
        </HrLayout>
    );
}

export default Dashboard;
