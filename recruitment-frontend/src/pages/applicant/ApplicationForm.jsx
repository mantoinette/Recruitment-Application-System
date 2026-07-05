import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import api from "../../api/axios";
import ApplicantLayout from "../../layouts/ApplicantLayout";
import { getUser } from "../../utils/auth";
import { getApiErrorMessage } from "../../utils/apiError";
import PageLoading from "../../components/PageLoading";
import { useProfileStatus } from "../../hooks/useProfileStatus";

function formatDeadline(deadline) {
    if (!deadline) {
        return "Open";
    }

    const date = new Date(deadline);
    if (Number.isNaN(date.getTime())) {
        return deadline;
    }

    return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric"
    });
}

function ApplicationForm() {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const user = getUser() || {};
    const { profileComplete, loading: profileLoading } = useProfileStatus();

    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("success");

    useEffect(() => {
        const loadData = async () => {
            if (!user.id || !jobId) {
                setLoading(false);
                return;
            }

            try {
                const jobResponse = await api.get(`/jobs/${jobId}`);
                setJob(jobResponse.data);
            } catch (error) {
                console.error("Failed to load application data", error);
                setMessageType("error");
                setMessage("Could not load job or profile information.");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [user.id, jobId]);

    const submitApplication = async () => {
        setSubmitting(true);
        setMessage("");

        try {
            await api.post("/applications/apply", {
                userId: user.id,
                jobId: Number(jobId)
            });

            setMessageType("success");
            setMessage("Application submitted successfully.");
            setTimeout(() => navigate("/applicant/status"), 1500);
        } catch (error) {
            setMessageType("error");
            setMessage(getApiErrorMessage(error, "Application submission failed."));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <ApplicantLayout title="Apply for Job">
            <section className="page">
                <div className="page-header">
                    <div>
                        <div className="page-kicker">Application</div>
                        <h1 className="page-title">Submit your application</h1>
                        <p className="page-copy">
                            Your completed profile will be used for this application.
                        </p>
                    </div>
                </div>

                {loading || profileLoading ? (
                    <PageLoading message="Loading application details..." />
                ) : job && (
                    <>
                        <div className="grid two-column">
                            <div className="panel">
                                <h2 className="panel-title">{job.title}</h2>
                                <div className="profile-row">
                                    <div className="profile-label">Department</div>
                                    <div className="profile-value">{job.department}</div>
                                </div>
                                <div className="profile-row">
                                    <div className="profile-label">Location</div>
                                    <div className="profile-value">{job.location}</div>
                                </div>
                                <div className="profile-row">
                                    <div className="profile-label">Employment type</div>
                                    <div className="profile-value">{job.employmentType}</div>
                                </div>
                                <div className="profile-row">
                                    <div className="profile-label">Deadline</div>
                                    <div className="profile-value">{formatDeadline(job.deadline)}</div>
                                </div>
                                {job.shortDescription && (
                                    <p className="page-copy">{job.shortDescription}</p>
                                )}
                            </div>

                            <div className="panel">
                                <h2 className="panel-title">Application checklist</h2>

                                <div className={`checklist-item ${profileComplete ? "done" : "pending"}`}>
                                    {profileComplete ? <FiCheckCircle /> : <FiAlertCircle />}
                                    <div>
                                        <div className="step-title">Profile completion</div>
                                        <div className="muted">
                                            {profileComplete
                                                ? "Profile complete — you are ready to submit."
                                                : "Complete your profile before applying."}
                                        </div>
                                    </div>
                                </div>

                                {!profileComplete && (
                                    <Link className="secondary-button" to="/applicant/profile">
                                        Complete profile
                                    </Link>
                                )}

                                {message && (
                                    <div className={`message ${messageType === "error" ? "error" : ""}`}>
                                        {message}
                                    </div>
                                )}

                                <div className="form-actions">
                                    <button
                                        className="primary-button"
                                        type="button"
                                        onClick={submitApplication}
                                        disabled={!profileComplete || submitting}
                                    >
                                        {submitting ? "Submitting..." : "Submit application"}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="panel apply-job-requirements">
                            <h2 className="panel-title">Job requirements</h2>
                            <p className="page-copy apply-job-requirements-intro">
                                Review the role requirements below before submitting your application.
                            </p>
                            <div className="apply-job-requirements-body">
                                {job.fullDescription ? (
                                    <p>{job.fullDescription}</p>
                                ) : (
                                    <p className="muted">No detailed requirements have been posted for this role yet.</p>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </section>
        </ApplicantLayout>
    );
}

export default ApplicationForm;
