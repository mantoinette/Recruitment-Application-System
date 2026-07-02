import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    FiBell,
    FiCalendar,
    FiCheckCircle,
    FiDownload,
    FiEye,
    FiSearch,
    FiX,
    FiXCircle
} from "react-icons/fi";
import api from "../../api/axios";
import HrLayout from "../../layouts/HrLayout";
import { fileDownloadUrl, statusClass, statusLabel } from "../../utils/statusHelpers";
import { getApiErrorMessage } from "../../utils/apiError";

function toDateTimeLocalValue(value) {
    if (!value) {
        return "";
    }

    if (typeof value === "string") {
        return value.slice(0, 16);
    }

    return "";
}

function Applications() {
    const location = useLocation();
    const navigate = useNavigate();
    const pendingReviewId = useRef(null);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [selected, setSelected] = useState(null);
    const [profile, setProfile] = useState(null);
    const [rejectReason, setRejectReason] = useState("");
    const [rejectReasonTemplate, setRejectReasonTemplate] = useState("");
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [interviewForm, setInterviewForm] = useState({
        scheduledAt: "",
        location: "",
        notes: ""
    });
    const [interviewNotesTemplate, setInterviewNotesTemplate] = useState("");
    const [notifyTemplateKey, setNotifyTemplateKey] = useState("");
    const [notifyDraft, setNotifyDraft] = useState({
        type: "INFO",
        title: "",
        message: ""
    });
    const [actionMessage, setActionMessage] = useState("");
    const [actionMessageType, setActionMessageType] = useState("success");
    const [actionLoading, setActionLoading] = useState(false);
    const [loadError, setLoadError] = useState("");

    const rejectionReasonTemplates = useMemo(
        () => [
            {
                label: "Skills mismatch for this role",
                value:
                    "After reviewing your application, we’ve decided to move forward with candidates whose skills and experience more closely match the requirements for this role."
            },
            {
                label: "Missing or incomplete documents",
                value:
                    "We’re unable to proceed at this time because the application is missing required documents or some submitted information is incomplete."
            },
            {
                label: "Experience gap for the position",
                value:
                    "At this stage, we’re prioritizing candidates with more directly relevant experience for the responsibilities of this position."
            },
            {
                label: "Position has been filled",
                value:
                    "Thank you for your interest. This position has been filled, and we are no longer accepting applications for this role."
            },
            {
                label: "Verification did not pass",
                value:
                    "We’re unable to proceed because the provided information could not be verified successfully during our validation process."
            },
            {
                label: "Did not meet minimum requirements",
                value:
                    "After review, we’ve determined that the application does not meet the minimum requirements outlined for this role."
            }
        ],
        []
    );

    const interviewNotesTemplates = useMemo(
        () => [
            {
                label: "On-site (bring ID, arrive early)",
                value:
                    "Please bring a valid government-issued ID and arrive 10–15 minutes early for check-in. If you have any accessibility needs, let us know in advance."
            },
            {
                label: "Online (join link etiquette)",
                value:
                    "Please join the meeting 5 minutes early using the provided link. Ensure a stable internet connection, test your microphone/camera beforehand, and choose a quiet, well-lit space."
            },
            {
                label: "Documents to prepare",
                value:
                    "Please prepare copies of your CV and any relevant certificates/portfolio items. You may be asked to discuss specific projects and responsibilities from your experience."
            }
        ],
        []
    );

    const notificationTemplates = useMemo(
        () => [
            {
                key: "INTERVIEW_REMINDER",
                label: "Interview reminder",
                type: "INFO",
                title: ({ name, position }) => `Interview reminder: ${position}`,
                message: ({ name, position }) =>
                    `Hello ${name}, this is a friendly reminder about your upcoming interview for the ${position} position. Please review the interview details in your application and arrive prepared. If you need to reschedule, reply as soon as possible.`
            },
            {
                key: "DOCUMENT_REQUEST",
                label: "Document request",
                type: "INFO",
                title: ({ position }) => `Additional documents requested: ${position}`,
                message: ({ name, position }) =>
                    `Hello ${name}, to continue reviewing your application for the ${position} position, please provide the requested documents (e.g., updated CV, certificates, portfolio, or supporting documentation). Upload them at your earliest convenience so we can proceed.`
            },
            {
                key: "ADDITIONAL_ASSESSMENT",
                label: "Additional assessment",
                type: "INFO",
                title: ({ position }) => `Next step: assessment for ${position}`,
                message: ({ name, position }) =>
                    `Hello ${name}, as part of the selection process for the ${position} position, we’d like you to complete an additional assessment. You will receive instructions and timing details shortly. Please confirm your availability if needed.`
            },
            {
                key: "STATUS_UPDATE",
                label: "Status update",
                type: "INFO",
                title: ({ position }) => `Application update: ${position}`,
                message: ({ name, position }) =>
                    `Hello ${name}, we wanted to share an update regarding your application for the ${position} position. Your application is currently being reviewed, and we will contact you with the next steps as soon as possible. Thank you for your patience.`
            },
            {
                key: "THANK_YOU_FOLLOW_UP",
                label: "Thank you / follow-up",
                type: "INFO",
                title: ({ position }) => `Thank you for your interest in ${position}`,
                message: ({ name, position }) =>
                    `Hello ${name}, thank you for your continued interest in the ${position} position. We appreciate the time you’ve taken to apply and will reach out if we need any additional information. Wishing you a great day.`
            }
        ],
        []
    );

    const loadApplications = async () => {
        setLoading(true);
        setLoadError("");
        try {
            const params = new URLSearchParams();
            if (search.trim()) {
                params.append("search", search.trim());
            }
            if (statusFilter !== "ALL") {
                params.append("status", statusFilter);
            }

            const query = params.toString();
            const url = query ? `/applications/hr/all?${query}` : "/applications/hr/all";
            const response = await api.get(url);
            setApplications(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Failed to load applications", error);
            setApplications([]);
            setLoadError("Could not load applications. Make sure the backend is running and try again.");
        } finally {
            setLoading(false);
        }
    };

    const openDetails = async (applicationId) => {
        try {
            const response = await api.get(`/applications/${applicationId}`);
            const application = response.data;
            setSelected(application);
            setRejectReason("");
            setRejectReasonTemplate("");
            setShowRejectModal(false);
            setActionMessage("");
            setInterviewForm({
                scheduledAt: toDateTimeLocalValue(application.interviewScheduledAt),
                location: application.interviewLocation || "",
                notes: application.interviewNotes || ""
            });
            setInterviewNotesTemplate("");
            setNotifyTemplateKey("");
            setNotifyDraft({
                type: "INFO",
                title: "",
                message: ""
            });

            if (application.user?.id) {
                const profileResponse = await api.get(`/profile/${application.user.id}`);
                setProfile(profileResponse.data);
            } else {
                setProfile(null);
            }
        } catch (error) {
            console.error("Failed to load application details", error);
            setLoadError("Could not open this application. Please try again.");
        }
    };

    const closeDetails = () => {
        setSelected(null);
        setProfile(null);
        setRejectReason("");
        setRejectReasonTemplate("");
        setShowRejectModal(false);
        setActionMessage("");
    };

    const refreshSelected = async (applicationId) => {
        await openDetails(applicationId);
        await loadApplications();
    };

    useEffect(() => {
        loadApplications();
    }, [statusFilter]);

    useEffect(() => {
        const reviewId = new URLSearchParams(location.search).get("review");
        if (!reviewId || loading || selected) {
            return;
        }

        const applicationId = Number(reviewId);
        if (!Number.isFinite(applicationId) || pendingReviewId.current === applicationId) {
            return;
        }

        pendingReviewId.current = applicationId;
        openDetails(applicationId).finally(() => {
            navigate("/hr/applications", { replace: true });
        });
    }, [location.search, loading, selected, navigate]);

    const filteredCount = useMemo(() => applications.length, [applications]);

    const showSuccess = (text) => {
        setActionMessageType("success");
        setActionMessage(text);
    };

    const showError = (text) => {
        setActionMessageType("error");
        setActionMessage(typeof text === "string" ? text : getApiErrorMessage({ response: { data: text } }));
    };

    const handleReview = async () => {
        if (!selected) return;
        setActionLoading(true);
        try {
            await api.put(`/applications/${selected.id}/review`);
            showSuccess("Application marked as Under Review. Applicant has been notified.");
            await refreshSelected(selected.id);
        } catch (error) {
            showError(getApiErrorMessage(error, "Update failed."));
        } finally {
            setActionLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!selected) return;
        setActionLoading(true);
        try {
            await api.put(`/applications/${selected.id}/approve`);
            showSuccess("Application approved. Applicant has been notified to prepare for the next stage.");
            await refreshSelected(selected.id);
        } catch (error) {
            showError(getApiErrorMessage(error, "Approval failed."));
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        if (!selected || !rejectReason.trim()) {
            showError("A rejection reason is required before rejecting an application.");
            return;
        }

        setActionLoading(true);
        try {
            await api.put(
                `/applications/${selected.id}/reject?reason=${encodeURIComponent(rejectReason.trim())}`
            );
            setShowRejectModal(false);
            showSuccess("Application rejected. The reason has been sent to the applicant as a notification.");
            await refreshSelected(selected.id);
        } catch (error) {
            showError(getApiErrorMessage(error, "Rejection failed."));
        } finally {
            setActionLoading(false);
        }
    };

    const handleScheduleInterview = async (successMessage = "Interview scheduled. Applicant has been notified with date, time, and location.") => {
        if (!selected || !interviewForm.scheduledAt) {
            showError("Interview date and time are required.");
            return false;
        }

        if (!interviewForm.location.trim()) {
            showError("Interview location or meeting link is required.");
            return false;
        }

        setActionLoading(true);
        try {
            await api.put(`/applications/${selected.id}/interview`, {
                scheduledAt: interviewForm.scheduledAt.length === 16
                    ? `${interviewForm.scheduledAt}:00`
                    : interviewForm.scheduledAt,
                location: interviewForm.location.trim(),
                notes: interviewForm.notes
            });
            showSuccess(successMessage);
            await refreshSelected(selected.id);
            await loadApplications();
            return true;
        } catch (error) {
            showError(getApiErrorMessage(error, "Interview scheduling failed."));
            return false;
        } finally {
            setActionLoading(false);
        }
    };

    const handleSendNotification = async () => {
        if (!selected?.id || !selected.user?.id) {
            showError("Applicant user information is missing. Please reload and try again.");
            return;
        }

        if (!notifyDraft.title.trim() || !notifyDraft.message.trim()) {
            showError("Notification title and message are required.");
            return;
        }

        const alreadyScheduled = selected.status === "INTERVIEW" && selected.interviewScheduledAt;

        if (notifyTemplateKey === "INTERVIEW_REMINDER" && !alreadyScheduled) {
            if (!interviewForm.scheduledAt || !interviewForm.location.trim()) {
                showError(
                    "To send an interview reminder, first fill date, time, and location in Schedule interview above, then click Schedule interview & notify applicant."
                );
                return;
            }

            const scheduled = await handleScheduleInterview(
                "Interview scheduled on HR Interviews. Applicant has been notified with date, time, and location."
            );
            if (scheduled) {
                setNotifyTemplateKey("");
                setNotifyDraft({ type: "INFO", title: "", message: "" });
            }
            return;
        }

        setActionLoading(true);
        try {
            await api.post(`/notifications/user/${selected.user.id}`, {
                applicationId: selected.id,
                type: notifyDraft.type,
                title: notifyDraft.title.trim(),
                message: notifyDraft.message.trim()
            });
            showSuccess("Notification sent to applicant successfully.");
        } catch (error) {
            showError(getApiErrorMessage(error, "Failed to send notification."));
        } finally {
            setActionLoading(false);
        }
    };

    const handleSelectNotificationTemplate = (templateKey) => {
        setNotifyTemplateKey(templateKey);
        const template = notificationTemplates.find((item) => item.key === templateKey);
        if (!template || !selected) return;

        const applicantName = selected.user?.fullName || selected.user?.email || "Applicant";
        const position = selected.positionApplied || selected.job?.title || "the role";

        setNotifyDraft({
            type: template.type,
            title: template.title({ name: applicantName, position }),
            message: template.message({ name: applicantName, position })
        });
    };

    return (
        <HrLayout title="Applicants">
            <div className="page">
                <div className="page-header">
                    <div>
                        <div className="page-kicker">HR Management</div>
                        <h1 className="page-title">Review applications</h1>
                        <p className="page-copy">
                            Review profiles, approve or reject with a reason, and schedule interviews. Applicants are notified at every decision.
                        </p>
                    </div>
                </div>

                <div className="panel filter-panel">
                    <div className="filter-row">
                        <div className="search-field">
                            <FiSearch />
                            <input
                                type="text"
                                placeholder="Search by name, email, or position"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                onKeyDown={(event) => event.key === "Enter" && loadApplications()}
                            />
                        </div>
                        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                            <option value="ALL">All statuses</option>
                            <option value="PENDING">Pending</option>
                            <option value="UNDER_REVIEW">Under Review</option>
                            <option value="INTERVIEW">Interview</option>
                            <option value="APPROVED">Approved</option>
                            <option value="REJECTED">Rejected</option>
                        </select>
                        <button className="primary-button" type="button" onClick={loadApplications}>
                            Apply filters
                        </button>
                    </div>
                    <p className="muted">{filteredCount} applicant(s) found</p>
                    {loadError && <div className="message error">{loadError}</div>}
                </div>

                <div className="panel">
                    {loading ? (
                        <p className="muted">Loading applicants...</p>
                    ) : (
                        <div className="latest-applications-table-wrap">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Position</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {applications.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="muted">No applicants found.</td>
                                        </tr>
                                    )}
                                    {applications.map((application) => (
                                        <tr key={application.id}>
                                            <td>{application.user?.fullName || application.user?.email || "-"}</td>
                                            <td>{application.user?.email || "-"}</td>
                                            <td>{application.positionApplied || application.job?.title || "-"}</td>
                                            <td>
                                                <span className={`badge ${statusClass(application.status)}`}>
                                                    {statusLabel(application.status)}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    className="secondary-button small"
                                                    type="button"
                                                    onClick={() => openDetails(application.id)}
                                                >
                                                    <FiEye /> Review
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {selected && (
                <div className="modal-overlay" onClick={closeDetails}>
                    <div className="modal-panel modal-panel-wide review-modal" onClick={(event) => event.stopPropagation()}>
                        <div className="page-header">
                            <div>
                                <div className="page-kicker">Applicant review</div>
                                <h2 className="page-title">{selected.user?.fullName}</h2>
                                <p className="page-copy">{selected.user?.email}</p>
                            </div>
                            <button className="icon-button" type="button" onClick={closeDetails} aria-label="Close">
                                <FiX />
                            </button>
                        </div>

                        <div className="review-status-bar">
                            <span className={`badge ${statusClass(selected.status)}`}>
                                {statusLabel(selected.status)}
                            </span>
                            <span className="muted review-status-note">
                                <FiBell /> Applicant receives a notification for every decision you make.
                            </span>
                        </div>

                        <div className="grid two-column">
                            <div className="profile-card">
                                <h3 className="panel-title">Application details</h3>
                                <div className="profile-row"><div className="profile-label">Position</div><div className="profile-value">{selected.positionApplied}</div></div>
                                <div className="profile-row"><div className="profile-label">National ID</div><div className="profile-value">{selected.nationalId}</div></div>
                                <div className="profile-row"><div className="profile-label">Phone</div><div className="profile-value">{selected.phone}</div></div>
                                <div className="profile-row"><div className="profile-label">Education</div><div className="profile-value">{selected.education}</div></div>
                                <div className="profile-row"><div className="profile-label">NESA grade</div><div className="profile-value">{selected.nesaGrade}</div></div>
                                <div className="profile-row"><div className="profile-label">Experience</div><div className="profile-value">{selected.experience}</div></div>
                            </div>

                            <div className="profile-card">
                                <h3 className="panel-title">Complete profile</h3>
                                {profile ? (
                                    <>
                                        <div className="profile-row"><div className="profile-label">Skills</div><div className="profile-value">{profile.skills || "-"}</div></div>
                                        <div className="profile-row"><div className="profile-label">Summary</div><div className="profile-value">{profile.professionalSummary || "-"}</div></div>
                                        <div className="profile-row">
                                            <div className="profile-label">CV</div>
                                            <div className="profile-value">
                                                {profile.cvUrl ? (
                                                    <a className="doc-link" href={fileDownloadUrl(profile.cvUrl)} target="_blank" rel="noreferrer">
                                                        <FiDownload /> Download CV
                                                    </a>
                                                ) : "-"}
                                            </div>
                                        </div>
                                        <div className="profile-row">
                                            <div className="profile-label">Supporting document</div>
                                            <div className="profile-value">
                                                {profile.supportingDocumentUrl ? (
                                                    <a className="doc-link" href={fileDownloadUrl(profile.supportingDocumentUrl)} target="_blank" rel="noreferrer">
                                                        <FiDownload /> Download document
                                                    </a>
                                                ) : "-"}
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <p className="muted">Profile not available.</p>
                                )}
                            </div>
                        </div>

                        <div className="panel inner-panel interview-panel">
                            <h3 className="panel-title"><FiCalendar /> Schedule interview</h3>
                            <p className="muted">
                                Required for HR Interviews and dashboard counts. Fill date, time, and location — the applicant is notified automatically.
                            </p>
                            <div className="form-grid">
                                <div className="field">
                                    <label htmlFor="scheduledAt">Date & time</label>
                                    <input
                                        id="scheduledAt"
                                        type="datetime-local"
                                        value={interviewForm.scheduledAt}
                                        onChange={(event) => setInterviewForm({ ...interviewForm, scheduledAt: event.target.value })}
                                    />
                                </div>
                                <div className="field">
                                    <label htmlFor="location">Location / meeting link</label>
                                    <input
                                        id="location"
                                        value={interviewForm.location}
                                        onChange={(event) => setInterviewForm({ ...interviewForm, location: event.target.value })}
                                        placeholder="Office address or online meeting link"
                                        required
                                    />
                                </div>
                                <div className="field full">
                                    <label htmlFor="interviewNotesTemplate">Interview instructions template</label>
                                    <select
                                        id="interviewNotesTemplate"
                                        value={interviewNotesTemplate}
                                        onChange={(event) => {
                                            const value = event.target.value;
                                            setInterviewNotesTemplate(value);
                                            if (value) {
                                                setInterviewForm({ ...interviewForm, notes: value });
                                            }
                                        }}
                                    >
                                        <option value="">Select a template (optional)</option>
                                        {interviewNotesTemplates.map((template) => (
                                            <option key={template.label} value={template.value}>
                                                {template.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="field full">
                                    <label htmlFor="notes">Instructions for applicant</label>
                                    <textarea
                                        id="notes"
                                        value={interviewForm.notes}
                                        onChange={(event) => setInterviewForm({ ...interviewForm, notes: event.target.value })}
                                        placeholder="What the applicant should bring or prepare"
                                    />
                                </div>
                            </div>
                            <button className="primary-button" type="button" onClick={() => handleScheduleInterview()} disabled={actionLoading}>
                                <FiCalendar /> Schedule interview & notify applicant
                            </button>
                        </div>

                        <div className="panel inner-panel interview-panel">
                            <h3 className="panel-title"><FiBell /> Notify applicant</h3>
                            <p className="muted">
                                Send general updates (documents, assessments, follow-ups). For a first interview notice, use Schedule interview above.
                                Interview reminder only works after an interview is scheduled, or it will schedule one if date and location are filled above.
                            </p>
                            <div className="form-grid">
                                <div className="field full">
                                    <label htmlFor="notifyTemplate">Template</label>
                                    <select
                                        id="notifyTemplate"
                                        value={notifyTemplateKey}
                                        onChange={(event) => handleSelectNotificationTemplate(event.target.value)}
                                    >
                                        <option value="">Select a template</option>
                                        {notificationTemplates.map((template) => (
                                            <option key={template.key} value={template.key}>
                                                {template.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="field full">
                                    <label htmlFor="notifyTitle">Title</label>
                                    <input
                                        id="notifyTitle"
                                        value={notifyDraft.title}
                                        onChange={(event) => setNotifyDraft({ ...notifyDraft, title: event.target.value })}
                                        placeholder="Notification title"
                                    />
                                </div>
                                <div className="field full">
                                    <label htmlFor="notifyMessage">Message</label>
                                    <textarea
                                        id="notifyMessage"
                                        value={notifyDraft.message}
                                        onChange={(event) => setNotifyDraft({ ...notifyDraft, message: event.target.value })}
                                        placeholder="Notification message"
                                    />
                                </div>
                            </div>
                            <button
                                className="primary-button"
                                type="button"
                                onClick={handleSendNotification}
                                disabled={actionLoading}
                            >
                                <FiBell /> Send notification
                            </button>
                        </div>

                        {selected.status === "REJECTED" && selected.rejectionReason && (
                            <div className="message error">
                                <strong>Rejection reason sent:</strong> {selected.rejectionReason}
                            </div>
                        )}

                        {selected.status === "INTERVIEW" && selected.interviewScheduledAt && (
                            <div className="message interview-notice">
                                <strong>Interview scheduled:</strong> {new Date(selected.interviewScheduledAt).toLocaleString()}
                                {selected.interviewLocation && <div>Location: {selected.interviewLocation}</div>}
                            </div>
                        )}

                        {actionMessage && (
                            <div className={`message ${actionMessageType === "error" ? "error" : ""}`}>{actionMessage}</div>
                        )}

                        <div className="review-actions">
                            <button className="secondary-button" type="button" onClick={handleReview} disabled={actionLoading}>
                                Mark under review
                            </button>
                            <button className="primary-button" type="button" onClick={handleApprove} disabled={actionLoading}>
                                <FiCheckCircle /> Approve
                            </button>
                            <button className="danger-button" type="button" onClick={() => setShowRejectModal(true)} disabled={actionLoading}>
                                <FiXCircle /> Reject
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showRejectModal && selected && (
                <div className="modal-overlay reject-overlay" onClick={() => setShowRejectModal(false)}>
                    <div className="modal-panel reject-modal" onClick={(event) => event.stopPropagation()}>
                        <h2 className="panel-title"><FiXCircle /> Reject application</h2>
                        <p className="page-copy">
                            Provide a clear reason for rejecting <strong>{selected.user?.fullName}</strong>.
                            This reason will be sent to the applicant as a notification.
                        </p>
                        <div className="field full">
                            <label htmlFor="rejectReasonTemplate">Common rejection reasons</label>
                            <select
                                id="rejectReasonTemplate"
                                value={rejectReasonTemplate}
                                onChange={(event) => {
                                    const value = event.target.value;
                                    setRejectReasonTemplate(value);
                                    if (value) {
                                        setRejectReason(value);
                                    }
                                }}
                            >
                                <option value="">Select a reason (optional)</option>
                                {rejectionReasonTemplates.map((template) => (
                                    <option key={template.label} value={template.value}>
                                        {template.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="field full">
                            <label htmlFor="rejectReason">Rejection reason (required)</label>
                            <textarea
                                id="rejectReason"
                                value={rejectReason}
                                onChange={(event) => setRejectReason(event.target.value)}
                                placeholder="Explain why this application was not successful"
                                required
                            />
                        </div>
                        <div className="form-actions">
                            <button className="secondary-button" type="button" onClick={() => setShowRejectModal(false)}>
                                Cancel
                            </button>
                            <button className="danger-button" type="button" onClick={handleReject} disabled={actionLoading || !rejectReason.trim()}>
                                Confirm rejection & notify applicant
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </HrLayout>
    );
}

export default Applications;
