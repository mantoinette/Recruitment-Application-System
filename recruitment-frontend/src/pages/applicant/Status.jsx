import { useEffect, useState } from "react";
import api from "../../api/axios";
import ApplicantLayout from "../../layouts/ApplicantLayout";
import PageLoading from "../../components/PageLoading";
import { getUser } from "../../utils/auth";
import { statusClass, statusLabel } from "../../utils/statusHelpers";

function Status() {
    const user = getUser() || {};
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadApplications = async () => {
            if (!user.id) {
                setLoading(false);
                return;
            }

            try {
                const response = await api.get(`/applications/user/${user.id}`);
                setApplications(Array.isArray(response.data) ? response.data : []);
            } catch (fetchError) {
                console.error("Failed to load application status", fetchError);
                setError("Could not load your application status.");
            } finally {
                setLoading(false);
            }
        };

        loadApplications();
    }, [user.id]);

    return (
        <ApplicantLayout title="Application Status">
            <section className="page">
                <div className="page-header">
                    <div>
                        <div className="page-kicker">Status</div>
                        <h1 className="page-title">Track your applications</h1>
                        <p className="page-copy">
                            View pending, under review, interview, approval, and rejection updates for each application.
                        </p>
                    </div>
                </div>

                <div className="panel">
                    <h2 className="panel-title">Your submissions</h2>

                    {loading && <PageLoading message="Loading applications..." />}
                    {!loading && error && <div className="message error">{error}</div>}
                    {!loading && !error && applications.length === 0 && (
                        <p className="muted">No applications found for this account.</p>
                    )}

                    {!loading && !error && applications.length > 0 && (
                        <div className="status-list">
                            {applications.map((application) => (
                                <div className="status-item" key={application.id}>
                                    <div>
                                        <div className="step-title">
                                            {application.positionApplied || application.job?.title || `Application #${application.id}`}
                                        </div>
                                        <div className="muted">
                                            Submitted {application.createdAt
                                                ? new Date(application.createdAt).toLocaleDateString()
                                                : "recently"}
                                        </div>
                                        <div className="muted">
                                            {application.education || "Education not provided"}
                                        </div>

                                        {application.status === "INTERVIEW" && (
                                            <div className="message interview-notice">
                                                Interview scheduled: {application.interviewScheduledAt
                                                    ? new Date(application.interviewScheduledAt).toLocaleString()
                                                    : "details pending"}
                                                {application.interviewLocation && (
                                                    <div>Location: {application.interviewLocation}</div>
                                                )}
                                                {application.interviewNotes && (
                                                    <div>Notes: {application.interviewNotes}</div>
                                                )}
                                            </div>
                                        )}

                                        {application.status === "APPROVED" && (
                                            <div className="message">Your application has been approved.</div>
                                        )}

                                        {application.rejectionReason && (
                                            <div className="message error">
                                                Rejection reason: {application.rejectionReason}
                                            </div>
                                        )}
                                    </div>
                                    <div className={`badge ${statusClass(application.status)}`}>
                                        {statusLabel(application.status)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </ApplicantLayout>
    );
}

export default Status;
