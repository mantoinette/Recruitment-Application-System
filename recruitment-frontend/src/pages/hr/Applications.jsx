import { useEffect, useState } from "react";
import { FiEye } from "react-icons/fi";
import api from "../../api/axios";
import HrLayout from "../../layouts/HrLayout";

function Applications() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [rejectReason, setRejectReason] = useState("");
    const [actionMessage, setActionMessage] = useState("");
    const [actionLoading, setActionLoading] = useState(false);

    const loadApplications = async () => {
        setLoading(true);
        try {
            const response = await api.get("/applications/hr/latest");
            setApplications(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Failed to load applications", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadApplications();
    }, []);

    const openDetails = async (applicationId) => {
        try {
            const response = await api.get(`/applications/${applicationId}`);
            setSelected(response.data);
            setRejectReason("");
            setActionMessage("");
        } catch (error) {
            console.error("Failed to load application details", error);
        }
    };

    const closeDetails = () => {
        setSelected(null);
        setRejectReason("");
        setActionMessage("");
    };

    const handleReview = async () => {
        if (!selected) {
            return;
        }

        setActionLoading(true);
        try {
            const response = await api.put(`/applications/${selected.id}/review`);
            setSelected(response.data);
            setActionMessage("Application marked as reviewed.");
            await loadApplications();
        } catch (error) {
            setActionMessage(error.response?.data || "Review action failed.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!selected) {
            return;
        }

        setActionLoading(true);
        try {
            const response = await api.put(`/applications/${selected.id}/approve`);
            setSelected(response.data);
            setActionMessage("Application approved.");
            await loadApplications();
        } catch (error) {
            setActionMessage(error.response?.data || "Approval failed.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        if (!selected || !rejectReason.trim()) {
            setActionMessage("A rejection reason is required.");
            return;
        }

        setActionLoading(true);
        try {
            const response = await api.put(
                `/applications/${selected.id}/reject?reason=${encodeURIComponent(rejectReason.trim())}`
            );
            setSelected(response.data);
            setActionMessage("Application rejected.");
            await loadApplications();
        } catch (error) {
            setActionMessage(error.response?.data || "Rejection failed.");
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <HrLayout title="Applications">
            <div className="page">
                <div className="page-header">
                    <div>
                        <div className="page-kicker">HR Management</div>
                        <h1 className="page-title">Applicant applications</h1>
                        <p className="page-copy">
                            Latest 10 applications sorted alphabetically by applicant name.
                        </p>
                    </div>
                </div>

                <div className="panel">
                    <div className="panel-title">Latest applications</div>

                    {loading ? (
                        <p className="muted">Loading applications...</p>
                    ) : (
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
                                        <td colSpan="5" className="muted">No applications submitted yet.</td>
                                    </tr>
                                )}
                                {applications.map((application) => (
                                    <tr key={application.id}>
                                        <td>{application.user?.fullName || "Unknown"}</td>
                                        <td>{application.user?.email || "-"}</td>
                                        <td>{application.positionApplied || "-"}</td>
                                        <td>
                                            <span className={`badge ${(application.status || "PENDING").toLowerCase()}`}>
                                                {application.status}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                className="secondary-button"
                                                type="button"
                                                onClick={() => openDetails(application.id)}
                                            >
                                                <FiEye /> View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {selected && (
                <div className="modal-overlay" onClick={closeDetails}>
                    <div className="modal-panel" onClick={(event) => event.stopPropagation()}>
                        <div className="page-header">
                            <div>
                                <div className="page-kicker">Application review</div>
                                <h2 className="page-title">{selected.user?.fullName}</h2>
                                <p className="page-copy">{selected.user?.email}</p>
                            </div>
                            <button className="secondary-button" type="button" onClick={closeDetails}>
                                Close
                            </button>
                        </div>

                        <div className="profile-card">
                            <div className="profile-row">
                                <div className="profile-label">National ID</div>
                                <div className="profile-value">{selected.nationalId || "-"}</div>
                            </div>
                            <div className="profile-row">
                                <div className="profile-label">Phone</div>
                                <div className="profile-value">{selected.phone || "-"}</div>
                            </div>
                            <div className="profile-row">
                                <div className="profile-label">Address</div>
                                <div className="profile-value">{selected.address || "-"}</div>
                            </div>
                            <div className="profile-row">
                                <div className="profile-label">Education</div>
                                <div className="profile-value">{selected.education || "-"}</div>
                            </div>
                            <div className="profile-row">
                                <div className="profile-label">NESA grade</div>
                                <div className="profile-value">{selected.nesaGrade || "-"}</div>
                            </div>
                            <div className="profile-row">
                                <div className="profile-label">NESA option</div>
                                <div className="profile-value">{selected.nesaOption || "-"}</div>
                            </div>
                            <div className="profile-row">
                                <div className="profile-label">Position</div>
                                <div className="profile-value">{selected.positionApplied || "-"}</div>
                            </div>
                            <div className="profile-row">
                                <div className="profile-label">Experience</div>
                                <div className="profile-value">{selected.experience || "-"}</div>
                            </div>
                            <div className="profile-row">
                                <div className="profile-label">Status</div>
                                <div className="profile-value">{selected.status}</div>
                            </div>
                        </div>

                        <div className="field full">
                            <label htmlFor="rejectReason">Rejection reason</label>
                            <textarea
                                id="rejectReason"
                                value={rejectReason}
                                onChange={(event) => setRejectReason(event.target.value)}
                                placeholder="Required when rejecting an application"
                            />
                        </div>

                        {actionMessage && <div className="message">{actionMessage}</div>}

                        <div className="form-actions">
                            <button
                                className="secondary-button"
                                type="button"
                                onClick={handleReview}
                                disabled={actionLoading}
                            >
                                Mark reviewed
                            </button>
                            <button
                                className="primary-button"
                                type="button"
                                onClick={handleApprove}
                                disabled={actionLoading}
                            >
                                Approve
                            </button>
                            <button
                                className="secondary-button"
                                type="button"
                                onClick={handleReject}
                                disabled={actionLoading}
                            >
                                Reject
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </HrLayout>
    );
}

export default Applications;
