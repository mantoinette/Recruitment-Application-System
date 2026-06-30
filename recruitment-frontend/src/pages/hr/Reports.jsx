import { useEffect, useState } from "react";
import { FiBarChart2 } from "react-icons/fi";
import api from "../../api/axios";
import HrLayout from "../../layouts/HrLayout";

function Reports() {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const response = await api.get("/stats");
                setStats(response.data);
            } catch (error) {
                console.error("Failed to load reports", error);
            }
        };

        loadStats();
    }, []);

    const approvalRate = stats?.totalApplications
        ? Math.round((stats.approvedApplications / stats.totalApplications) * 100)
        : 0;

    const rejectionRate = stats?.totalApplications
        ? Math.round((stats.rejectedApplications / stats.totalApplications) * 100)
        : 0;

    return (
        <HrLayout title="Recruitment Reports">
            <div className="page">
                <div className="page-header">
                    <div>
                        <div className="page-kicker">Analytics</div>
                        <h1 className="page-title">Recruitment reports</h1>
                        <p className="page-copy">Statistical summary of recruitment activities.</p>
                    </div>
                </div>

                <div className="grid stats-grid">
                    <div className="stat-card">
                        <div className="stat-label">Total applicants</div>
                        <div className="stat-value">{stats?.totalApplications ?? 0}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Approved</div>
                        <div className="stat-value">{stats?.approvedApplications ?? 0}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Rejected</div>
                        <div className="stat-value">{stats?.rejectedApplications ?? 0}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Pending</div>
                        <div className="stat-value">{stats?.pendingApplications ?? 0}</div>
                    </div>
                </div>

                <div className="panel">
                    <h2 className="panel-title">
                        <FiBarChart2 /> Recruitment statistics
                    </h2>

                    <div className="stats-breakdown">
                        <div className="profile-row">
                            <div className="profile-label">Approval rate</div>
                            <div className="profile-value">{approvalRate}%</div>
                        </div>
                        <div className="profile-row">
                            <div className="profile-label">Rejection rate</div>
                            <div className="profile-value">{rejectionRate}%</div>
                        </div>
                        <div className="profile-row">
                            <div className="profile-label">Under review</div>
                            <div className="profile-value">{stats?.reviewedApplications ?? 0}</div>
                        </div>
                        <div className="profile-row">
                            <div className="profile-label">Registered users</div>
                            <div className="profile-value">{stats?.totalUsers ?? 0}</div>
                        </div>
                    </div>
                </div>
            </div>
        </HrLayout>
    );
}

export default Reports;
