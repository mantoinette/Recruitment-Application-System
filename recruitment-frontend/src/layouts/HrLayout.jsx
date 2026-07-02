import { NavLink, useNavigate } from "react-router-dom";
import { FiBarChart2, FiBriefcase, FiCalendar, FiLogOut, FiUserCheck, FiUsers } from "react-icons/fi";
import { getUser, logout } from "../utils/auth";
import "../assets/applicant.css";
import "../assets/hr-dashboard.css";

function HrLayout({ children, title = "HR Panel" }) {
    const navigate = useNavigate();
    const user = getUser();
    const fullName = user?.fullName || "HR User";
    const initials = fullName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase() || "H";

    return (
        <div className="app-shell">
            <aside className="app-sidebar">
                <div className="brand-block">
                    <h2 className="brand-title">RecruitPro</h2>
                    <div className="brand-subtitle">HR Panel</div>
                </div>

                <nav className="app-nav">
                    <NavLink to="/hr/dashboard" end>
                        <FiUsers /> Dashboard
                    </NavLink>
                    <NavLink to="/hr/applications">
                        <FiUsers /> Applications
                    </NavLink>
                    <NavLink to="/hr/jobs">
                        <FiBriefcase /> Vacancies
                    </NavLink>
                    <NavLink to="/hr/candidates">
                        <FiUserCheck /> Approved
                    </NavLink>
                    <NavLink to="/hr/interviews">
                        <FiCalendar /> Interviews
                    </NavLink>
                    <NavLink to="/hr/reports">
                        <FiBarChart2 /> Reports
                    </NavLink>
                </nav>

                <button className="logout-link" type="button" onClick={() => logout(navigate)}>
                    <FiLogOut /> Logout
                </button>
            </aside>

            <main className="app-main">
                <header className="topbar">
                    <div className="topbar-title">{title}</div>
                    <div className="topbar-user">
                        <div className="avatar">{initials}</div>
                        <div>
                            <div className="user-name">{fullName}</div>
                            <div className="user-role">hr manager</div>
                        </div>
                    </div>
                </header>

                {children}
            </main>
        </div>
    );
}

export default HrLayout;
