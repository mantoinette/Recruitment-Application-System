import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiBriefcase, FiCalendar, FiMapPin } from "react-icons/fi";
import api from "../../api/axios";
import { getUser } from "../../utils/auth";
import "../../assets/public.css";

function JobDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const user = getUser();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const loadJob = async () => {
            try {
                const response = await api.get(`/jobs/${id}`);
                setJob(response.data);
            } catch (error) {
                console.error("Failed to load job", error);
            } finally {
                setLoading(false);
            }
        };

        loadJob();
    }, [id]);

    const handleApply = () => {
        if (!user) {
            navigate("/register", { state: { jobId: id } });
            return;
        }

        if (user.role !== "APPLICANT") {
            setMessage("Only applicant accounts can apply for jobs.");
            return;
        }

        navigate(`/applicant/apply/${id}`);
    };

    if (loading) {
        return (
            <div className="public-page">
                <main className="job-detail-page"><p className="muted">Loading job details...</p></main>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="public-page">
                <main className="job-detail-page">
                    <p className="muted">Job vacancy not found.</p>
                    <Link to="/">Back to vacancies</Link>
                </main>
            </div>
        );
    }

    return (
        <div className="public-page">
            <header className="public-header">
                <Link className="public-brand" to="/">
                    <strong>RecruitPro</strong>
                    <span>Professional Recruitment Platform</span>
                </Link>
                <nav className="public-nav">
                    <Link to="/login">Login</Link>
                    <Link className="public-button primary" to="/register">Register</Link>
                </nav>
            </header>

            <main className="job-detail-page">
                <Link className="back-link" to="/">
                    <FiArrowLeft /> Back to vacancies
                </Link>

                <div className="job-detail-card">
                    <div className="job-card-top">
                        <span className="job-badge">{job.employmentType}</span>
                        <span className="job-deadline">
                            <FiCalendar /> Apply before {job.deadline}
                        </span>
                    </div>

                    <h1 className="job-detail-title">{job.title}</h1>

                    <div className="job-meta job-meta-large">
                        <span><FiBriefcase /> {job.department}</span>
                        <span><FiMapPin /> {job.location}</span>
                    </div>

                    <p className="job-detail-summary">{job.shortDescription}</p>

                    <div className="job-detail-body">
                        <h2>Full description</h2>
                        <p>{job.fullDescription}</p>
                    </div>

                    {message && <div className="auth-message">{message}</div>}

                    <div className="job-detail-actions">
                        <button className="public-button primary" type="button" onClick={handleApply}>
                            Apply for this position
                        </button>
                        {!user && (
                            <p className="muted">
                                You will be asked to register or log in before applying.
                            </p>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default JobDetail;
