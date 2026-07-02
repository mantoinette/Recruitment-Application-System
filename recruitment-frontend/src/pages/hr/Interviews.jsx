import { useEffect, useState } from "react";
import { FiCalendar } from "react-icons/fi";
import api from "../../api/axios";
import HrLayout from "../../layouts/HrLayout";
import { statusClass, statusLabel } from "../../utils/statusHelpers";

function Interviews() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadInterviews = async () => {
            try {
                const response = await api.get("/applications/hr/interviews");
                setApplications(Array.isArray(response.data) ? response.data : []);
            } catch (error) {
                console.error("Failed to load interviews", error);
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
                            Applicants notified to be interview-ready. Schedule new interviews from the applications review page.
                        </p>
                    </div>
                </div>

                <div className="panel">
                    <h2 className="panel-title"><FiCalendar /> Upcoming interviews</h2>

                    {loading ? (
                        <p className="muted">Loading interviews...</p>
                    ) : applications.length === 0 ? (
                        <p className="muted">No interviews scheduled yet.</p>
                    ) : (
                        <div className="status-list">
                            {applications.map((application) => (
                                <div className="status-item" key={application.id}>
                                    <div>
                                        <strong>{application.user?.fullName}</strong>
                                        <div className="muted">{application.positionApplied}</div>
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
