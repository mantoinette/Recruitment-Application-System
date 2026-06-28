import { FiUsers, FiBriefcase, FiCalendar, FiFileText } from "react-icons/fi";

function Dashboard() {

    return (

        <div className="app-shell">

            {/* SIDEBAR (reuse same style system) */}
            <aside className="app-sidebar">

                <div className="brand-block">
                    <h2 className="brand-title">Recruitment</h2>
                    <div className="brand-subtitle">Admin Panel</div>
                </div>

                <nav className="app-nav">
                    <a className="active">Dashboard</a>
                    <a>Applicants</a>
                    <a>Jobs</a>
                    <a>Interviews</a>
                    <a>Users</a>
                    <a>Reports</a>
                </nav>

                <button className="logout-link">
                    Logout
                </button>

            </aside>

            {/* MAIN */}
            <main className="app-main">

                {/* TOP BAR */}
                <header className="topbar">

                    <div className="topbar-title">
                        Admin Dashboard
                    </div>

                    <div className="topbar-user">

                        <div className="avatar">A</div>

                        <div>
                            <div className="user-name">Admin User</div>
                            <div className="user-role">administrator</div>
                        </div>

                    </div>

                </header>

                {/* PAGE CONTENT */}
                <div className="page">

                    {/* HEADER */}
                    <div className="page-header">

                        <div>
                            <div className="page-kicker">Overview</div>
                            <h1 className="page-title">Welcome back, Admin</h1>
                            <p className="page-copy">
                                Manage applicants, job postings, interviews, and system activity.
                            </p>
                        </div>

                    </div>

                    {/* STATS */}
                    <div className="grid stats-grid">

                        <div className="stat-card">
                            <div className="stat-label">Total Applicants</div>
                            <div className="stat-value">120</div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-label">Open Jobs</div>
                            <div className="stat-value">15</div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-label">Interviews</div>
                            <div className="stat-value">45</div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-label">New Applications</div>
                            <div className="stat-value">8</div>
                        </div>

                    </div>

                    {/* TWO COLUMN SECTION */}
                    <div className="grid two-column">

                        {/* LEFT PANEL */}
                        <div className="panel">

                            <h2 className="panel-title">
                                Recent Applications
                            </h2>

                            <div className="status-list">

                                <div className="status-item">
                                    <div>
                                        <strong>John Doe</strong>
                                        <div className="muted">Software Engineer</div>
                                    </div>
                                    <span className="badge pending">Pending</span>
                                </div>

                                <div className="status-item">
                                    <div>
                                        <strong>Jane Smith</strong>
                                        <div className="muted">Backend Developer</div>
                                    </div>
                                    <span className="badge approved">Interview</span>
                                </div>

                                <div className="status-item">
                                    <div>
                                        <strong>Peter Johnson</strong>
                                        <div className="muted">UI/UX Designer</div>
                                    </div>
                                    <span className="badge approved">Accepted</span>
                                </div>

                            </div>

                        </div>

                        {/* RIGHT PANEL */}
                        <div className="panel">

                            <h2 className="panel-title">
                                Quick Actions
                            </h2>

                            <div className="steps">

                                <div className="step-row">
                                    <div className="step-number">1</div>
                                    <div>
                                        <div className="step-title">Add New Job</div>
                                        <div className="muted">Create job postings for applicants</div>
                                    </div>
                                </div>

                                <div className="step-row">
                                    <div className="step-number">2</div>
                                    <div>
                                        <div className="step-title">Review Applications</div>
                                        <div className="muted">Check incoming applications</div>
                                    </div>
                                </div>

                                <div className="step-row">
                                    <div className="step-number">3</div>
                                    <div>
                                        <div className="step-title">Schedule Interviews</div>
                                        <div className="muted">Manage interview process</div>
                                    </div>
                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </main>

        </div>
    );
}

export default Dashboard;