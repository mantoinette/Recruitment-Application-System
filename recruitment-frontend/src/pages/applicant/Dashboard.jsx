import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiCheckCircle, FiClock, FiFileText, FiXCircle } from "react-icons/fi";
import api from "../../api/axios";
import ApplicantLayout from "../../layouts/ApplicantLayout";

function Dashboard() {
    const [applications, setApplications] = useState([]);
    const user = useMemo(() => JSON.parse(localStorage.getItem("user") || "{}"), []);

    useEffect(() => {
        const loadApplications = async () => {
            try {
                const response = await api.get("/applications");
                const allApplications = Array.isArray(response.data) ? response.data : [];
                const ownApplications = allApplications.filter((application) => {
                    if (!user.id) {
                        return false;
                    }

                    return application.user?.id === user.id;
                });

                setApplications(ownApplications);
            } catch (error) {
                console.error("Failed to load applications", error);
            }
        };

        loadApplications();
    }, [user.id]);

    const total = applications.length;
    const pending = applications.filter((application) => application.status === "PENDING").length;
    const approved = applications.filter((application) => application.status === "APPROVED").length;
    const rejected = applications.filter((application) => application.status === "REJECTED").length;

    return (
        <ApplicantLayout title="Applicant Dashboard">
            <section className="page">
                <div className="page-header">
                    <div>
                        <div className="page-kicker">Overview</div>
                        <h1 className="page-title">Welcome back, {user.fullName || "Applicant"}</h1>
                        <p className="page-copy">
                            Track your application progress, keep your profile ready, and submit your details for review.
                        </p>
                    </div>

                    <Link className="primary-button" to="/applicant/apply">
                        New application <FiArrowRight />
                    </Link>
                </div>

                <div className="grid stats-grid">
                    <div className="stat-card">
                        <div className="stat-label">Total applications</div>
                        <div className="stat-value">{total}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Pending review</div>
                        <div className="stat-value">{pending}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Approved</div>
                        <div className="stat-value">{approved}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Rejected</div>
                        <div className="stat-value">{rejected}</div>
                    </div>
                </div>

                <div className="grid two-column">
                    <div className="panel">
                        <h2 className="panel-title">Application steps</h2>
                        <div className="steps">
                            <div className="step-row">
                                <div className="step-number"><FiFileText /></div>
                                <div>
                                    <div className="step-title">Submit your application</div>
                                    <div className="muted">Provide contact, education, and work experience details.</div>
                                </div>
                            </div>
                            <div className="step-row">
                                <div className="step-number"><FiClock /></div>
                                <div>
                                    <div className="step-title">Wait for HR review</div>
                                    <div className="muted">Your status remains pending while the HR team reviews it.</div>
                                </div>
                            </div>
                            <div className="step-row">
                                <div className="step-number"><FiCheckCircle /></div>
                                <div>
                                    <div className="step-title">Check the decision</div>
                                    <div className="muted">Approved and rejected outcomes appear on the status page.</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="panel">
                        <h2 className="panel-title">Quick actions</h2>
                        <div className="steps">
                            <Link className="secondary-button" to="/applicant/status">
                                <FiClock /> View status
                            </Link>
                            <Link className="secondary-button" to="/applicant/profile">
                                <FiCheckCircle /> Review profile
                            </Link>
                            <Link className="secondary-button" to="/applicant/apply">
                                <FiXCircle /> Update application
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </ApplicantLayout>
    );
}

export default Dashboard;
