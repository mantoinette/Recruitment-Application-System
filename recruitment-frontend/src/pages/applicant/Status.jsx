import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import ApplicantLayout from "../../layouts/ApplicantLayout";

function Status() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
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
                            See whether your submitted application is still pending, approved, or rejected.
                        </p>
                    </div>
                </div>

                <div className="panel">
                    <h2 className="panel-title">Your submissions</h2>

                    {loading && <p className="muted">Loading applications...</p>}

                    {!loading && error && <div className="message error">{error}</div>}

                    {!loading && !error && applications.length === 0 && (
                        <p className="muted">No applications found for this account.</p>
                    )}

                    {!loading && !error && applications.length > 0 && (
                        <div className="status-list">
                            {applications.map((application) => {
                                const status = (application.status || "PENDING").toLowerCase();

                                return (
                                    <div className="status-item" key={application.id}>
                                        <div>
                                            <div className="step-title">
                                                Application #{application.id}
                                            </div>
                                            <div className="muted">
                                                {application.education || "Education not provided"}
                                            </div>
                                            {application.rejectionReason && (
                                                <div className="message error">
                                                    Reason: {application.rejectionReason}
                                                </div>
                                            )}
                                        </div>
                                        <div className={`badge ${status}`}>{application.status}</div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>
        </ApplicantLayout>
    );
}

export default Status;
