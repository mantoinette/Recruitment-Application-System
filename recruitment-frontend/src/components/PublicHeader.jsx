import { Link, useLocation, useNavigate } from "react-router-dom";

function PublicHeader() {
    const navigate = useNavigate();
    const location = useLocation();

    const goToSection = (sectionId) => {
        if (location.pathname !== "/") {
            navigate(`/#${sectionId}`);
            return;
        }

        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        window.history.replaceState(null, "", `/#${sectionId}`);
    };

    return (
        <header className="public-header">
            <Link className="public-brand" to="/">
                <strong>RecruitPro</strong>
                <span>Recruitment Management System</span>
            </Link>

            <nav className="public-nav">
                <button className="public-nav-link" type="button" onClick={() => goToSection("vacancies")}>
                    Vacancies
                </button>
                <button className="public-nav-link" type="button" onClick={() => goToSection("about")}>
                    About
                </button>
                <Link to="/login">Login</Link>
                <Link className="public-button primary" to="/register">
                    Register
                </Link>
            </nav>
        </header>
    );
}

export default PublicHeader;
