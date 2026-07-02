import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import ApplicantLayout from "../../layouts/ApplicantLayout";
import { getUser } from "../../utils/auth";
import { statusClass, statusLabel } from "../../utils/statusHelpers";

function MyApplications() {
    const user = getUser() || {};
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadApplications = async () => {
            if (!user.id) {
                setLoading(false);
                return;
            }

            try {
                const response = await api.get(`/applications/user/${user.id}`);
                setApplications(Array.isArray(response.data) ? response.data : []);
            } catch (error) {
                console.error("Failed to load applications", error);
            } finally {
                setLoading(false);
            }
        };

        loadApplications();
    }, [user.id]);

    return (
        <ApplicantLayout title="My Applications">
            <section className="page">
                <div className="page-header">
                    <div>
                        <div className="page-kicker">Applications</div>
                        <h1 className="page-title">My submitted applications</h1>
                        <p className="page-copy">
                            Review every position you have applied for and open detailed status updates.
                        </p>
                    </div>
                    <Link className="primary-button" to="/applicant/jobs">Browse jobs</Link>
                </div>

                <div className="panel">
                    {loading && <p className="muted">Loading applications...</p>}
                    {!loading && applications.length === 0 && (
                        <div>
                            <p className="muted">You have not submitted any applications yet.</p>
                            <Link className="secondary-button" to="/applicant/jobs">View available jobs</Link>
                        </div>
                    )}
                    {!loading && applications.length > 0 && (
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
                                    </div>
                                    <div className="table-actions">
                                        <div className={`badge ${statusClass(application.status)}`}>
                                            {statusLabel(application.status)}
                                        </div>
                                        <Link className="secondary-button" to="/applicant/status">View status</Link>
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

export default MyApplications;
