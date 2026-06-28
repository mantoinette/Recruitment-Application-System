import { Link } from "react-router-dom";
import { FiArrowRight, FiBarChart2, FiCheckCircle, FiClipboard } from "react-icons/fi";
import "../assets/public.css";

function Home() {
    return (
        <div className="public-page">
            <header className="public-header">
                <Link className="public-brand" to="/">
                    <strong>Recruitment</strong>
                    <span>Application Management System</span>
                </Link>

                <nav className="public-nav">
                    <Link to="/login">Login</Link>
                    <Link className="public-button primary" to="/register">
                        Apply now
                    </Link>
                </nav>
            </header>

            <main className="home-hero">
                <section className="hero-content">
                    <div className="eyebrow">Simple recruitment workflow</div>
                    <h1 className="hero-title">Recruitment Management System</h1>
                    <p className="hero-copy">
                        Submit applications, track review status, and help HR teams manage candidates from one organized workspace.
                    </p>

                    <div className="hero-actions">
                        <Link className="public-button primary" to="/register">
                            Start application <FiArrowRight />
                        </Link>
                        <Link className="public-button secondary" to="/login">
                            Sign in
                        </Link>
                    </div>

                    <div className="hero-proof">
                        <div className="proof-item">
                            <div className="proof-value">CV</div>
                            <div className="proof-label">Attach and submit candidate documents</div>
                        </div>
                        <div className="proof-item">
                            <div className="proof-value">HR</div>
                            <div className="proof-label">Review, approve, or reject applications</div>
                        </div>
                        <div className="proof-item">
                            <div className="proof-value">Admin</div>
                            <div className="proof-label">Manage users and system access</div>
                        </div>
                    </div>
                </section>

                <section className="hero-media" aria-label="Recruitment workspace preview">
                    <div className="hero-panel">
                        <div className="hero-panel-title">Application workflow</div>
                        <div className="hero-panel-row">
                            <div className="panel-icon"><FiClipboard /></div>
                            <div>
                                <div className="panel-main">Applicant submits profile</div>
                                <div className="panel-sub">Personal details, education, experience, and CV</div>
                            </div>
                        </div>
                        <div className="hero-panel-row">
                            <div className="panel-icon"><FiCheckCircle /></div>
                            <div>
                                <div className="panel-main">HR reviews decision</div>
                                <div className="panel-sub">Application status is visible to the applicant</div>
                            </div>
                        </div>
                        <div className="hero-panel-row">
                            <div className="panel-icon"><FiBarChart2 /></div>
                            <div>
                                <div className="panel-main">Dashboards stay current</div>
                                <div className="panel-sub">Role-based access keeps work organized</div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}

export default Home;
