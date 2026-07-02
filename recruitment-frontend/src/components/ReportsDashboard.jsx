import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";

const STATUS_COLORS = ["#f59e0b", "#2563eb", "#7c3aed", "#16a34a", "#dc2626"];
const ROLE_COLORS = ["#2563eb", "#16a34a", "#7c3aed"];
const VACANCY_COLORS = ["#16a34a", "#94a3b8"];

function ReportsDashboard({ stats, title = "Recruitment analytics" }) {
    if (!stats) {
        return <p className="muted">Loading analytics...</p>;
    }

    const summary = stats.summary;
    const approvalRate = summary.totalApplications
        ? Math.round((summary.approvedApplications / summary.totalApplications) * 100)
        : 0;

    return (
        <div className="reports-dashboard">
            <div className="grid stats-grid">
                <div className="stat-card highlight">
                    <div className="stat-label">Total applications</div>
                    <div className="stat-value">{summary.totalApplications}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Approval rate</div>
                    <div className="stat-value">{approvalRate}%</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Open vacancies</div>
                    <div className="stat-value">{summary.openJobs}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Registered users</div>
                    <div className="stat-value">{summary.totalUsers}</div>
                </div>
            </div>

            <div className="grid two-column chart-grid">
                <div className="panel chart-panel">
                    <h2 className="panel-title">{title} — application status</h2>
                    <div className="chart-wrap">
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={stats.applicationStatusChart}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e8edf5" />
                                <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 12 }} />
                                <YAxis allowDecimals={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                                <Tooltip />
                                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                                    {stats.applicationStatusChart.map((entry, index) => (
                                        <Cell key={entry.name} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="panel chart-panel">
                    <h2 className="panel-title">Application status distribution</h2>
                    <div className="chart-wrap">
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie
                                    data={stats.applicationStatusChart}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={95}
                                    paddingAngle={3}
                                >
                                    {stats.applicationStatusChart.map((entry, index) => (
                                        <Cell key={entry.name} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid two-column chart-grid">
                <div className="panel chart-panel">
                    <h2 className="panel-title">Monthly applications trend</h2>
                    <div className="chart-wrap">
                        <ResponsiveContainer width="100%" height={280}>
                            <LineChart data={stats.monthlyApplicationsChart}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e8edf5" />
                                <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 12 }} />
                                <YAxis allowDecimals={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                                <Tooltip />
                                <Line
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#2563eb"
                                    strokeWidth={3}
                                    dot={{ r: 5, fill: "#2563eb" }}
                                    activeDot={{ r: 7 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="panel chart-panel">
                    <h2 className="panel-title">Users & vacancies overview</h2>
                    <div className="chart-wrap dual-chart">
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie
                                    data={stats.userRoleChart}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={78}
                                >
                                    {stats.userRoleChart.map((entry, index) => (
                                        <Cell key={entry.name} fill={ROLE_COLORS[index % ROLE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>

                        <ResponsiveContainer width="100%" height={180}>
                            <BarChart data={stats.vacancyChart} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#e8edf5" />
                                <XAxis type="number" allowDecimals={false} />
                                <YAxis type="category" dataKey="name" width={70} />
                                <Tooltip />
                                <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                                    {stats.vacancyChart.map((entry, index) => (
                                        <Cell key={entry.name} fill={VACANCY_COLORS[index % VACANCY_COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ReportsDashboard;
