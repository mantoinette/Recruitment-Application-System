import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiBriefcase, FiCalendar, FiMapPin } from "react-icons/fi";
import api from "../../api/axios";
import ApplicantLayout from "../../layouts/ApplicantLayout";
import { getUser } from "../../utils/auth";

function AvailableJobs() {
    const user = getUser() || {};
    const [jobs, setJobs] = useState([]);
    const [profileComplete, setProfileComplete] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [jobsResponse, statusResponse] = await Promise.all([
                    api.get("/jobs/open"),
                    user.id ? api.get(`/profile/${user.id}/status`) : Promise.resolve({ data: {} })
                ]);
                setJobs(Array.isArray(jobsResponse.data) ? jobsResponse.data : []);
                setProfileComplete(Boolean(statusResponse.data?.profileComplete));
            } catch (error) {
                console.error("Failed to load jobs", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [user.id]);

    return (
        <ApplicantLayout title="Available Jobs">
            <section className="page">
                <div className="page-header">
                    <div>
                        <div className="page-kicker">Vacancies</div>
                        <h1 className="page-title">Browse open positions</h1>
                        <p className="page-copy">
                            Explore current openings and apply once your profile is complete.
                        </p>
                    </div>
                </div>

                {!profileComplete && (
                    <div className="alert-banner">
                        <FiBriefcase />
                        <div>
                            <strong>Complete your profile before applying.</strong>
                            <div className="muted">NID/NESA verification and documents are required for Rwandan applicants.</div>
                        </div>
                        <Link className="secondary-button" to="/applicant/profile">Complete profile</Link>
                    </div>
                )}

                <div className="panel">
                    {loading && <p className="muted">Loading vacancies...</p>}
                    {!loading && jobs.length === 0 && (
                        <p className="muted">No open vacancies at the moment.</p>
                    )}
                    {!loading && jobs.length > 0 && (
                        <div className="status-list">
                            {jobs.map((job) => (
                                <div className="status-item" key={job.id}>
                                    <div>
                                        <div className="step-title">{job.title}</div>
                                        <div className="muted">{job.department} · {job.employmentType}</div>
                                        <div className="muted job-meta">
                                            <span><FiMapPin /> {job.location || "Location TBD"}</span>
                                            {job.deadline && (
                                                <span><FiCalendar /> Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
                                            )}
                                        </div>
                                        <p className="muted">{job.shortDescription}</p>
                                    </div>
                                    {profileComplete ? (
                                        <Link className="primary-button" to={`/applicant/apply/${job.id}`}>
                                            Apply <FiArrowRight />
                                        </Link>
                                    ) : (
                                        <Link className="secondary-button" to="/applicant/profile">
                                            Complete profile
                                        </Link>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </ApplicantLayout>
    );
}

export default AvailableJobs;
