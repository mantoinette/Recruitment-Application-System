import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    FiArrowRight,
    FiAward,
    FiBriefcase,
    FiCalendar,
    FiMapPin,
    FiShield,
    FiTrendingUp,
    FiUsers
} from "react-icons/fi";
import api from "../api/axios";
import PublicFooter from "./PublicFooter";
import PublicHeader from "./PublicHeader";
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
            <PublicHeader />

            <section className="landing-hero">
                <div className="landing-hero-grid">
                    <div className="landing-hero-copy">
                        <div className="eyebrow">Recruitment Management System</div>
                        <h1 className="hero-title">Hire smarter. Apply with confidence.</h1>
                        <p className="hero-copy">
                            RecruitPro helps organizations publish vacancies, review candidates, and manage hiring —
                            while giving applicants a clear path to build profiles and track applications.
                        </p>
                        <div className="hero-actions">
                            <Link className="public-button primary" to="/register">
                                Get started <FiArrowRight />
                            </Link>
                            <Link className="public-button secondary" to="/login">
                                Login
                            </Link>
                            <a className="public-button secondary" href="#vacancies">
                                Browse jobs
                            </a>
                        </div>
                    </div>

                    <div className="landing-hero-card">
                        <div className="hero-feature">
                            <FiShield />
                            <div>
                                <strong>Secure access</strong>
                                <p>Role-based dashboards for applicants, HR, and administrators.</p>
                            </div>
                        </div>
                        <div className="hero-feature">
                            <FiTrendingUp />
                            <div>
                                <strong>Live analytics</strong>
                                <p>Track applications, approvals, and recruitment performance.</p>
                            </div>
                        </div>
                        <div className="hero-feature">
                            <FiAward />
                            <div>
                                <strong>Verified profiles</strong>
                                <p>NID and NESA API simulation during candidate onboarding.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="hero-stats-strip">
                    <div className="hero-stat">
                        <strong>{jobs.length}</strong>
                        <span>Open positions</span>
                    </div>
                    <div className="hero-stat">
                        <strong>24/7</strong>
                        <span>Online applications</span>
                    </div>
                    <div className="hero-stat">
                        <strong>3</strong>
                        <span>User roles</span>
                    </div>
                </div>
            </section>

            <main className="jobs-section" id="vacancies">
                <div className="section-header">
                    <div>
                        <div className="eyebrow">Vacancies</div>
                        <h2 className="section-title">Available job openings</h2>
                        <p className="section-copy">
                            Explore current opportunities. View full details before registering and applying.
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

            <section className="company-section" id="about">
                <div className="company-grid">
                    <div>
                        <div className="eyebrow">About RecruitPro</div>
                        <h2 className="section-title">A real-world recruitment experience</h2>
                        <p className="section-copy">
                            RecruitPro is designed for modern hiring teams and job seekers. Applicants complete a full
                            profile with CV and supporting documents, verify identity through NID, and validate education
                            through NESA before applying. HR reviews the latest applications, and administrators manage
                            users and monitor platform activity.
                        </p>
                    </div>

                    <div className="company-cards">
                        <div className="company-card">
                            <FiUsers />
                            <h3>For applicants</h3>
                            <p>Build your profile, apply to vacancies, and track application status in real time.</p>
                        </div>
                        <div className="company-card">
                            <FiBriefcase />
                            <h3>For HR teams</h3>
                            <p>Review the latest 10 applications, approve or reject with reasons, and manage vacancies.</p>
                        </div>
                        <div className="company-card">
                            <FiShield />
                            <h3>For administrators</h3>
                            <p>Manage system users and view statistical dashboards across the entire platform.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="cta-section">
                <div className="cta-card">
                    <h2>Ready to join RecruitPro?</h2>
                    <p>Create your account, choose your role, and access your personalized dashboard.</p>
                    <div className="hero-actions">
                        <Link className="public-button primary" to="/register">Register now</Link>
                        <Link className="public-button secondary" to="/login">Login</Link>
                    </div>
                </div>
            </section>

            <PublicFooter />
        </div>
    );
}

export default Home;
