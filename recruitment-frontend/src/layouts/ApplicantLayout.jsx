import { NavLink, useNavigate } from "react-router-dom";
import {
    FiBell,
    FiBriefcase,
    FiClipboard,
    FiFileText,
    FiHome,
    FiLogOut,
    FiUser
} from "react-icons/fi";
import "../assets/applicant.css";

function ApplicantLayout({ children, title = "Applicant Portal" }) {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const fullName = user.fullName || "Applicant";
    const initials = fullName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase() || "A";

    const logout = () => {
        localStorage.removeItem("user");
        navigate("/login");
    };

    return (
        <div className="app-shell">
            <aside className="app-sidebar">
                <div className="brand-block">
                    <h2 className="brand-title">RecruitPro</h2>
                    <div className="brand-subtitle">Applicant workspace</div>
                </div>

                <nav className="app-nav">
                    <NavLink to="/applicant/dashboard">
                        <FiHome /> Dashboard
                    </NavLink>
                    <NavLink to="/applicant/profile">
                        <FiUser /> Profile
                    </NavLink>
                    <NavLink to="/applicant/jobs">
                        <FiBriefcase /> Available Jobs
                    </NavLink>
                    <NavLink to="/applicant/applications">
                        <FiFileText /> My Applications
                    </NavLink>
                    <NavLink to="/applicant/status">
                        <FiClipboard /> Application Status
                    </NavLink>
                    <NavLink to="/applicant/notifications">
                        <FiBell /> Notifications
                    </NavLink>
                </nav>

                <button className="logout-link" type="button" onClick={logout}>
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
                            <div className="user-role">{(user.role || "APPLICANT").toLowerCase()}</div>
                        </div>
                    </div>
                </header>

                {children}
            </main>
        </div>
    );
}

export default ApplicantLayout;
