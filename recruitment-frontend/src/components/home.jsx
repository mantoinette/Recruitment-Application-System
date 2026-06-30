import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiBriefcase, FiCalendar, FiMapPin } from "react-icons/fi";
import api from "../api/axios";
import "../assets/public.css";

function Home() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadJobs = async () => {
            try {
                const response = await api.get("/jobs/open");
                setJobs(Array.isArray(response.data) ? response.data : []);
            } catch (error) {
                console.error("Failed to load jobs", error);
            } finally {
                setLoading(false);
            }
        };

        loadJobs();
    }, []);

    return (
        <div className="public-page">
            <header className="public-header">
                <Link className="public-brand" to="/">
                    <strong>RecruitPro</strong>
                    <span>Professional Recruitment Platform</span>
                </Link>

                <nav className="public-nav">
                    <Link to="/login">Login</Link>
                    <Link className="public-button primary" to="/register">
                        Create account
                    </Link>
                </nav>
            </header>

            <section className="jobs-hero">
                <div className="jobs-hero-content">
                    <div className="eyebrow">Career opportunities</div>
                    <h1 className="hero-title">Find your next role</h1>
                    <p className="hero-copy">
                        Browse open vacancies, review full job details, complete your profile, and apply with confidence.
                    </p>
                    <div className="hero-actions">
                        <Link className="public-button primary" to="/register">
                            Get started <FiArrowRight />
                        </Link>
                        <Link className="public-button secondary" to="/login">
                            Sign in
                        </Link>
                    </div>
                </div>

                <div className="hero-stats-strip">
                    <div className="hero-stat">
                        <strong>{jobs.length}</strong>
                        <span>Open positions</span>
                    </div>
                    <div className="hero-stat">
                        <strong>3</strong>
                        <span>User roles</span>
                    </div>
                    <div className="hero-stat">
                        <strong>100%</strong>
                        <span>Online process</span>
                    </div>
                </div>
            </section>

            <main className="jobs-section">
                <div className="section-header">
                    <div>
                        <div className="eyebrow">Vacancies</div>
                        <h2 className="section-title">Available job openings</h2>
                        <p className="section-copy">
                            Explore current opportunities across departments and locations.
                        </p>
                    </div>
                </div>

                {loading && <p className="muted">Loading vacancies...</p>}

                {!loading && jobs.length === 0 && (
                    <div className="empty-state">
                        <FiBriefcase size={28} />
                        <p>No open vacancies at the moment. Please check back soon.</p>
                    </div>
                )}

                <div className="jobs-grid">
                    {jobs.map((job) => (
                        <article className="job-card" key={job.id}>
                            <div className="job-card-top">
                                <span className="job-badge">{job.employmentType}</span>
                                <span className="job-deadline">
                                    <FiCalendar /> Deadline: {job.deadline}
                                </span>
                            </div>

                            <h3 className="job-title">{job.title}</h3>
                            <div className="job-meta">
                                <span><FiBriefcase /> {job.department}</span>
                                <span><FiMapPin /> {job.location}</span>
                            </div>
                            <p className="job-description">{job.shortDescription}</p>

                            <Link className="public-button primary job-card-button" to={`/jobs/${job.id}`}>
                                View details <FiArrowRight />
                            </Link>
                        </article>
                    ))}
                </div>
            </main>
        </div>
    );
}

export default Home;
