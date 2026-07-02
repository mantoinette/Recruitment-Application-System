import { NavLink, useNavigate } from "react-router-dom";
import { FiBarChart2, FiBriefcase, FiLayers, FiLogOut, FiSettings, FiUsers } from "react-icons/fi";
import { getUser, logout } from "../utils/auth";
import "../assets/applicant.css";
import "../assets/hr-dashboard.css";
import "../assets/admin-dashboard.css";

function AdminLayout({ children, title = "Admin Panel" }) {
    const navigate = useNavigate();
    const user = getUser();
    const fullName = user?.fullName || "Admin User";
    const initials = fullName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase() || "A";

    return (
        <div className="app-shell">
            <aside className="app-sidebar">
                <div className="brand-block">
                    <h2 className="brand-title">RecruitPro</h2>
                    <div className="brand-subtitle">Admin Panel</div>
                </div>

                <nav className="app-nav">
                    <NavLink to="/admin/dashboard" end>
                        <FiBarChart2 /> Dashboard
                    </NavLink>
                    <NavLink to="/admin/users">
                        <FiUsers /> Users
                    </NavLink>
                    <NavLink to="/admin/jobs">
                        <FiBriefcase /> Vacancies
                    </NavLink>
                    <NavLink to="/admin/departments">
                        <FiLayers /> Departments
                    </NavLink>
                    <NavLink to="/admin/settings">
                        <FiSettings /> Settings
                    </NavLink>
                    <NavLink to="/admin/reports">
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
                            <div className="user-role">administrator</div>
                        </div>
                    </div>
                </header>

                {children}
            </main>
        </div>
    );
}

export default AdminLayout;
