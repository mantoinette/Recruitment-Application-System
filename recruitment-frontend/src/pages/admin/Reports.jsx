import { useEffect, useState } from "react";
import { FiBarChart2 } from "react-icons/fi";
import api from "../../api/axios";
import AdminLayout from "../../layouts/AdminLayout";
import ReportsDashboard from "../../components/ReportsDashboard";

function Reports() {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const response = await api.get("/stats/detailed");
                setStats(response.data);
            } catch (error) {
                console.error("Failed to load admin reports", error);
            }
        };

        loadStats();
    }, []);

    return (
        <AdminLayout title="System Reports">
            <div className="page">
                <div className="page-header">
                    <div>
                        <div className="page-kicker">Analytics</div>
                        <h1 className="page-title">System reports</h1>
                        <p className="page-copy">
                            Statistical presentation of all recruitment and user activity across the platform.
                        </p>
                    </div>
                </div>

                <div className="panel reports-intro">
                    <h2 className="panel-title"><FiBarChart2 /> Administrator analytics</h2>
                    <p className="page-copy">
                        Full visibility into applications, user distribution, vacancy status, and monthly hiring trends.
                    </p>
                </div>

                <ReportsDashboard stats={stats} title="Admin" />
            </div>
        </AdminLayout>
    );
}

export default Reports;
