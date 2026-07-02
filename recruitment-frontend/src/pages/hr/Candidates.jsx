import { useEffect, useState } from "react";
import { FiUserCheck } from "react-icons/fi";
import api from "../../api/axios";
import HrLayout from "../../layouts/HrLayout";

function Candidates() {
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadCandidates = async () => {
            try {
                const response = await api.get("/applications/hr/approved");
                setCandidates(Array.isArray(response.data) ? response.data : []);
            } catch (error) {
                console.error("Failed to load approved candidates", error);
            } finally {
                setLoading(false);
            }
        };

        loadCandidates();
    }, []);

    return (
        <HrLayout title="Approved Candidates">
            <div className="page">
                <div className="page-header">
                    <div>
                        <div className="page-kicker">Recruitment</div>
                        <h1 className="page-title">Approved applicants</h1>
                        <p className="page-copy">Applicants approved by HR after review.</p>
                    </div>
                </div>

                <div className="panel">
                    <h2 className="panel-title">
                        <FiUserCheck /> Approved applicants
                    </h2>

                    {loading ? (
                        <p className="muted">Loading approved candidates...</p>
                    ) : (
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Position</th>
                                    <th>NESA grade</th>
                                </tr>
                            </thead>
                            <tbody>
                                {candidates.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="muted">No approved applicants yet.</td>
                                    </tr>
                                )}
                                {candidates.map((candidate) => (
                                    <tr key={candidate.id}>
                                        <td>{candidate.user?.fullName || candidate.user?.email || "-"}</td>
                                        <td>{candidate.user?.email || "-"}</td>
                                        <td>{candidate.positionApplied || "-"}</td>
                                        <td>{candidate.nesaGrade || "-"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </HrLayout>
    );
}

export default Candidates;
