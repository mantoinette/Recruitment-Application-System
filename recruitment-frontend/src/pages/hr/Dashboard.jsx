import { NavLink, useNavigate } from "react-router-dom";
import { FiUsers, FiUserCheck, FiCalendar, FiLogOut } from "react-icons/fi";
import { getUser, logout } from "../../utils/auth";
import "../../assets/hr-dashboard.css";

function Dashboard() {

    const navigate = useNavigate();
    const user = getUser();

    return (

        <div className="app-shell">

            {/* SIDEBAR */}
            <aside className="app-sidebar">

                <div className="brand-block">
                    <h2 className="brand-title">Recruitment</h2>
                    <div className="brand-subtitle">HR Panel</div>
                </div>

                <nav className="app-nav">

                    <NavLink to="/hr/dashboard" end>
                        <FiUsers /> Dashboard
                    </NavLink>

                    <NavLink to="/hr/applicants">
                        <FiUsers /> Applicants
                    </NavLink>

                    <NavLink to="/hr/shortlist">
                        <FiUserCheck /> Shortlist
                    </NavLink>

                    <NavLink to="/hr/interviews">
                        <FiCalendar /> Interviews
                    </NavLink>

                </nav>

                <button
                    className="logout-link"
                    onClick={() => logout(navigate)}
                >
                    <FiLogOut /> Logout
                </button>

            </aside>

            {/* MAIN */}
            <main className="app-main">

                {/* TOPBAR */}
                <header className="topbar">

                    <div className="topbar-title">
                        HR Dashboard
                    </div>

                    <div className="topbar-user">

                        <div className="avatar">
                            {user?.fullName?.charAt(0) || "H"}
                        </div>

                        <div>
                            <div className="user-name">
                                {user?.fullName || "HR User"}
                            </div>
                            <div className="user-role">
                                HR Manager
                            </div>
                        </div>

                    </div>

                </header>

                {/* PAGE */}
                <div className="page">

                    {/* HEADER */}
                    <div className="page-header">

                        <div>
                            <div className="page-kicker">Recruitment Overview</div>
                            <h1 className="page-title">Manage Hiring Process</h1>
                            <p className="page-copy">
                                Review applicants, shortlist candidates, and manage interviews efficiently.
                            </p>
                        </div>

                    </div>

                    {/* STATS */}
                    <div className="grid stats-grid">

                        <div className="stat-card">
                            <div className="stat-label">Total Applicants</div>
                            <div className="stat-value">320</div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-label">Shortlisted</div>
                            <div className="stat-value">85</div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-label">Interviews</div>
                            <div className="stat-value">42</div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-label">Hired</div>
                            <div className="stat-value">18</div>
                        </div>

                    </div>

                    {/* CONTENT */}
                    <div className="grid two-column">

                        {/* LEFT */}
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
                                    <span className="badge pending">New</span>
                                </div>

                                <div className="status-item">
                                    <div>
                                        <strong>Mary Johnson</strong>
                                        <div className="muted">Backend Developer</div>
                                    </div>
                                    <span className="badge approved">Shortlisted</span>
                                </div>

                                <div className="status-item">
                                    <div>
                                        <strong>Peter Kim</strong>
                                        <div className="muted">UI/UX Designer</div>
                                    </div>
                                    <span className="badge approved">Interview</span>
                                </div>

                            </div>

                        </div>

                        {/* RIGHT */}
                        <div className="panel">

                            <h2 className="panel-title">
                                HR Actions
                            </h2>

                            <div className="steps">

                                <div className="step-row">
                                    <div className="step-number">1</div>
                                    <div>
                                        <div className="step-title">Screen Applications</div>
                                        <div className="muted">Filter new candidates</div>
                                    </div>
                                </div>

                                <div className="step-row">
                                    <div className="step-number">2</div>
                                    <div>
                                        <div className="step-title">Shortlist Candidates</div>
                                        <div className="muted">Select qualified applicants</div>
                                    </div>
                                </div>

                                <div className="step-row">
                                    <div className="step-number">3</div>
                                    <div>
                                        <div className="step-title">Schedule Interviews</div>
                                        <div className="muted">Coordinate hiring process</div>
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