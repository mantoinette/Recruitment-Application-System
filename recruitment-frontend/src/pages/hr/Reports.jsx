import { useEffect, useState } from "react";
import { FiBarChart2 } from "react-icons/fi";
import api from "../../api/axios";
import HrLayout from "../../layouts/HrLayout";
import ReportsDashboard from "../../components/ReportsDashboard";

function Reports() {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const response = await api.get("/stats/detailed");
                setStats(response.data);
            } catch (error) {
                console.error("Failed to load reports", error);
            }
        };

        loadStats();
    }, []);

    return (
        <HrLayout title="Recruitment Reports">
            <div className="page">
                <div className="page-header">
                    <div>
                        <div className="page-kicker">Analytics</div>
                        <h1 className="page-title">Recruitment reports</h1>
                        <p className="page-copy">
                            Visual dashboard with bar, pie, and line charts for recruitment performance.
                        </p>
                    </div>
                </div>

                <div className="panel reports-intro">
                    <h2 className="panel-title"><FiBarChart2 /> HR analytics overview</h2>
                    <p className="page-copy">
                        Monitor application volume, status distribution, monthly trends, user roles, and vacancy availability.
                    </p>
                </div>

                <ReportsDashboard stats={stats} title="HR" />
            </div>
        </HrLayout>
    );
}

export default Reports;
