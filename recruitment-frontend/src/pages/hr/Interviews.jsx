import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiCalendar } from "react-icons/fi";
import api from "../../api/axios";
import HrLayout from "../../layouts/HrLayout";
import { statusClass, statusLabel } from "../../utils/statusHelpers";

function Interviews() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");

    useEffect(() => {
        const loadInterviews = async () => {
            setLoadError("");
            try {
                const response = await api.get("/applications/hr/interviews");
                setApplications(Array.isArray(response.data) ? response.data : []);
            } catch (error) {
                console.error("Failed to load interviews", error);
                setApplications([]);
                setLoadError("Could not load interviews. Make sure the backend is running on http://localhost:8080.");
            } finally {
                setLoading(false);
            }
        };

        loadInterviews();
    }, []);

    return (
        <HrLayout title="Interviews">
            <div className="page">
                <div className="page-header">
                    <div>
                        <div className="page-kicker">Interview schedule</div>
                        <h1 className="page-title">Scheduled interviews</h1>
                        <p className="page-copy">
                            This page lists interviews already scheduled. To schedule a new one, go to Applications, open Review, and use the Schedule interview panel.
                        </p>
                    </div>
                    <Link className="primary-button" to="/hr/applications">
                        Schedule interview <FiArrowRight />
                    </Link>
                </div>

                {loadError && <div className="message error">{loadError}</div>}

                <div className="panel">
                    <h2 className="panel-title"><FiCalendar /> Upcoming interviews</h2>

                    {loading ? (
                        <p className="muted">Loading interviews...</p>
                    ) : applications.length === 0 ? (
                        <div className="empty-state-block">
                            <p className="muted">No interviews scheduled yet.</p>
                            <p className="muted">
                                HR must set date, time, and location under Applications → Review → Schedule interview.
                                Sending only a notification template does not create an interview here.
                            </p>
                            <Link className="secondary-button" to="/hr/applications">
                                Go to Applications
                            </Link>
                        </div>
                    ) : (
                        <div className="status-list">
                            {applications.map((application) => (
                                <div className="status-item" key={application.id}>
                                    <div>
                                        <strong>{application.user?.fullName || application.user?.email || "Applicant"}</strong>
                                        <div className="muted">{application.positionApplied || application.job?.title || "-"}</div>
                                        <div className="muted">
                                            {application.interviewScheduledAt
                                                ? new Date(application.interviewScheduledAt).toLocaleString()
                                                : "Date not set"}
                                        </div>
                                        <div className="muted">{application.interviewLocation || "Location TBD"}</div>
                                        {application.interviewNotes && (
                                            <div className="muted">Notes: {application.interviewNotes}</div>
                                        )}
                                    </div>
                                    <span className={`badge ${statusClass(application.status)}`}>
                                        {statusLabel(application.status)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </HrLayout>
    );
}

export default Interviews;
