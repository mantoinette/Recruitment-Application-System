import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
    FiArrowRight,
    FiBriefcase,
    FiCalendar,
    FiCheckCircle,
    FiClock,
    FiMapPin,
    FiShield,
    FiUserCheck,
    FiUsers,
    FiX
} from "react-icons/fi";
import api from "../api/axios";
import PublicFooter from "./PublicFooter";
import PublicHeader from "./PublicHeader";
import { getUser } from "../utils/auth";
import { getApiErrorMessage } from "../utils/apiError";
import heroImage from "../assets/hero.png";
import "../assets/public.css";

function formatDeadline(deadline) {
    if (!deadline) {
        return "Open";
    }

    return new Date(deadline).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric"
    });
}

function VacancyModal({ jobId, onClose }) {
    const navigate = useNavigate();
    const user = getUser();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    useEffect(() => {
        document.body.style.overflow = "hidden";
        window.scrollTo({ top: 0, behavior: "smooth" });

        const loadJob = async () => {
            try {
                const response = await api.get(`/jobs/${jobId}`);
                setJob(response.data);
            } catch (error) {
                setMessage(getApiErrorMessage(error, "Could not load vacancy details."));
            } finally {
                setLoading(false);
            }
        };

        loadJob();

        return () => {
            document.body.style.overflow = "";
        };
    }, [jobId]);

    const handleApply = () => {
        if (!user) {
            navigate("/login", { state: { from: `/applicant/apply/${jobId}` } });
            return;
        }

        if (user.role !== "APPLICANT") {
            setMessage("Only applicant accounts can apply for jobs.");
            return;
        }

        navigate(`/applicant/apply/${jobId}`);
    };

    return (
        <div className="vacancy-modal-overlay" onClick={onClose}>
            <div className="vacancy-modal" onClick={(event) => event.stopPropagation()}>
                <button className="vacancy-modal-close" type="button" onClick={onClose} aria-label="Close">
                    <FiX />
                </button>

                {loading && <p className="muted">Loading vacancy details...</p>}

                {!loading && !job && (
                    <div className="vacancy-modal-empty">
                        <p>{message || "Vacancy not found."}</p>
                    </div>
                )}

                {!loading && job && (
                    <>
                        <div className="vacancy-modal-hero">
                            <div className="vacancy-modal-badges">
                                <span className="job-badge">{job.employmentType}</span>
                                <span className="job-deadline">
                                    <FiCalendar /> Apply before {formatDeadline(job.deadline)}
                                </span>
                            </div>
                            <h2 className="vacancy-modal-title">{job.title}</h2>
                            <div className="job-meta job-meta-large">
                                <span><FiBriefcase /> {job.department}</span>
                                <span><FiMapPin /> {job.location}</span>
                            </div>
                        </div>

                        <p className="vacancy-modal-summary">{job.shortDescription}</p>

                        <div className="vacancy-modal-body">
                            <h3>Role overview</h3>
                            <p>{job.fullDescription}</p>
                        </div>

                        {message && <div className="auth-message">{message}</div>}

                        <div className="vacancy-modal-actions">
                            <button className="public-button primary" type="button" onClick={handleApply}>
                                Apply for this position <FiArrowRight />
                            </button>
                            <button className="public-button secondary" type="button" onClick={onClose}>
                                Back to vacancies
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

function Home() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    const location = useLocation();

    const selectedJobId = (() => {
        const raw = searchParams.get("job");
        if (!raw) {
            return null;
        }
        const id = Number(raw);
        return Number.isFinite(id) ? id : null;
    })();

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

    useEffect(() => {
        if (location.hash !== "#vacancies" || selectedJobId) {
            return;
        }

        const timer = window.setTimeout(() => {
            document.getElementById("vacancies")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 120);

        return () => window.clearTimeout(timer);
    }, [location.hash, location.pathname, selectedJobId]);

    const openVacancy = (jobId) => {
        setSearchParams({ job: String(jobId) });
    };

    const closeVacancy = () => {
        setSearchParams({});
        window.setTimeout(() => {
            document.getElementById("vacancies")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 80);
    };

    const handleCardKeyDown = (event, jobId) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openVacancy(jobId);
        }
    };

    return (
        <div className="public-page home-page">
            <PublicHeader />

            <section className="home-hero-banner">
                <div className="home-hero-inner">
                    <div className="home-hero-copy">
                        <div className="eyebrow">Rwanda&apos;s modern hiring platform</div>
                        <h1 className="hero-title">
                            Find your next role.<br />
                            Build teams that grow.
                        </h1>
                        <p className="hero-copy">
                            Discover open positions, apply in minutes, and track your application — all in one
                            beautiful workspace built for applicants, HR teams, and administrators.
                        </p>
                        <div className="hero-actions">
                            <a className="public-button primary" href="#vacancies">
                                Explore vacancies <FiArrowRight />
                            </a>
                            <Link className="public-button secondary" to="/register">
                                Create account
                            </Link>
                        </div>

                        <div className="hero-trust-row">
                            <span><FiShield /> Secure verification</span>
                            <span><FiUserCheck /> Profile-first applications</span>
                            <span><FiClock /> Real-time status updates</span>
                        </div>
                    </div>

                    <div className="home-hero-visual">
                        <div className="home-hero-image-wrap">
                            <img
                                src={heroImage}
                                alt="Professionals collaborating in a modern office"
                                className="home-hero-image"
                            />
                            <div className="home-hero-image-glow" />
                        </div>
                    </div>
                </div>

                <div className="hero-stats-strip home-stats">
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
                        <span>Smart user roles</span>
                    </div>
                    <div className="hero-stat">
                        <strong>100%</strong>
                        <span>Digital workflow</span>
                    </div>
                </div>
            </section>

            <section className="home-process">
                <div className="home-process-header">
                    <div className="eyebrow">How it works</div>
                    <h2 className="section-title">From vacancy to hire in three simple steps</h2>
                </div>
                <div className="home-process-grid">
                    <article className="process-card">
                        <div className="process-step">01</div>
                        <FiBriefcase />
                        <h3>Browse vacancies</h3>
                        <p>Explore roles by department, location, and deadline — then open details instantly.</p>
                    </article>
                    <article className="process-card">
                        <div className="process-step">02</div>
                        <FiUserCheck />
                        <h3>Complete your profile</h3>
                        <p>Upload documents, verify identity, and apply with a professional candidate profile.</p>
                    </article>
                    <article className="process-card">
                        <div className="process-step">03</div>
                        <FiCheckCircle />
                        <h3>Track your journey</h3>
                        <p>Follow every stage from review to interview and final decision with notifications.</p>
                    </article>
                </div>
            </section>

            <main className="jobs-section home-vacancies" id="vacancies">
                <div className="section-header home-vacancies-header">
                    <div>
                        <div className="eyebrow">Career opportunities</div>
                        <h2 className="section-title">Featured vacancies</h2>
                        <p className="section-copy">
                            Click any role to view full details above. Apply when you are ready — no page reload needed.
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

                <div className="jobs-grid home-jobs-grid">
                    {jobs.map((job) => (
                        <article
                            className="job-card home-job-card clickable-job-card"
                            key={job.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => openVacancy(job.id)}
                            onKeyDown={(event) => handleCardKeyDown(event, job.id)}
                        >
                            <div className="job-card-accent" />
                            <div className="job-card-top">
                                <span className="job-badge">{job.employmentType}</span>
                                <span className="job-deadline">
                                    <FiCalendar /> {formatDeadline(job.deadline)}
                                </span>
                            </div>

                            <h3 className="job-title">{job.title}</h3>
                            <div className="job-meta">
                                <span><FiBriefcase /> {job.department}</span>
                                <span><FiMapPin /> {job.location}</span>
                            </div>
                            <p className="job-description">{job.shortDescription}</p>

                            <span className="public-button primary job-card-button">
                                View details <FiArrowRight />
                            </span>
                        </article>
                    ))}
                </div>
            </main>

            <section className="company-section home-about" id="about">
                <div className="company-grid home-about-grid">
                    <div className="home-about-copy">
                        <div className="eyebrow">Why RecruitPro</div>
                        <h2 className="section-title">Hiring that feels modern, clear, and human</h2>
                        <p className="section-copy">
                            Whether you are launching your career or building a high-performing team, RecruitPro gives
                            everyone a polished experience — from the first vacancy click to the final hiring decision.
                        </p>
                        <Link className="public-button primary" to="/register">
                            Join RecruitPro <FiArrowRight />
                        </Link>
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
                            <p>Review applications, schedule interviews, and keep candidates informed at every step.</p>
                        </div>
                        <div className="company-card">
                            <FiShield />
                            <h3>For administrators</h3>
                            <p>Manage users, departments, vacancies, and platform-wide recruitment analytics.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="cta-section">
                <div className="cta-card">
                    <h2>Your next opportunity is one click away</h2>
                    <p>Create your account, explore vacancies, and start your recruitment journey today.</p>
                    <div className="hero-actions">
                        <Link className="public-button primary" to="/register">Get started free</Link>
                        <a className="public-button secondary" href="#vacancies">Browse vacancies</a>
                    </div>
                </div>
            </section>

            <PublicFooter />

            {selectedJobId && <VacancyModal jobId={selectedJobId} onClose={closeVacancy} />}
        </div>
    );
}

export default Home;
