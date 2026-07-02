import { Link } from "react-router-dom";

function PublicHeader() {
    return (
        <header className="public-header">
            <Link className="public-brand" to="/">
                <strong>RecruitPro</strong>
                <span>Recruitment Management System</span>
            </Link>

            <nav className="public-nav">
                <Link to="/#vacancies">Vacancies</Link>
                <Link to="/#about">About</Link>
                <Link to="/login">Login</Link>
                <Link className="public-button primary" to="/register">
                    Register
                </Link>
            </nav>
        </header>
    );
}

export default PublicHeader;
