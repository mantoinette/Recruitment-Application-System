import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiCalendar, FiMapPin } from "react-icons/fi";
import api from "../../api/axios";
import ApplicantLayout from "../../layouts/ApplicantLayout";
import PageLoading from "../../components/PageLoading";
import ProfileStatusBanner from "../../components/ProfileStatusBanner";
import { useProfileStatus } from "../../hooks/useProfileStatus";

function AvailableJobs() {
    const { profileComplete, loading: profileLoading } = useProfileStatus();
    const [jobs, setJobs] = useState([]);
    const [loadingJobs, setLoadingJobs] = useState(true);

    useEffect(() => {
        const loadJobs = async () => {
            try {
                const jobsResponse = await api.get("/jobs/open");
                setJobs(Array.isArray(jobsResponse.data) ? jobsResponse.data : []);
            } catch (error) {
                console.error("Failed to load jobs", error);
            } finally {
                setLoadingJobs(false);
            }
        };

        loadJobs();
    }, []);

    const loading = profileLoading || loadingJobs;

    return (
        <ApplicantLayout title="Available Jobs">
            <section className="page">
                <div className="page-header">
                    <div>
                        <div className="page-kicker">Vacancies</div>
                        <h1 className="page-title">Browse open positions</h1>
                        <p className="page-copy">
                            {profileComplete
                                ? "Your profile is complete. Choose a vacancy and apply."
                                : "Explore current openings and apply once your profile is complete."}
                        </p>
                    </div>
                </div>

                <ProfileStatusBanner
                    loading={profileLoading}
                    profileComplete={profileComplete}
                />

                <div className="panel">
                    {loading && <PageLoading message="Loading vacancies..." />}
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
