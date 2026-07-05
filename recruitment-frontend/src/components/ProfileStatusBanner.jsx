import { Link } from "react-router-dom";
import { FiBriefcase, FiCheckCircle, FiClock } from "react-icons/fi";

function ProfileStatusBanner({ loading, profileComplete }) {
    if (loading) {
        return null;
    }

    if (profileComplete) {
        return (
            <div className="alert-banner success">
                <FiCheckCircle />
                <div>
                    <strong>Profile complete</strong>
                    <div className="muted">Your profile is ready. You can apply for open vacancies.</div>
                </div>
                <Link className="secondary-button" to="/applicant/jobs">
                    Browse jobs
                </Link>
            </div>
        );
    }

    return (
        <div className="alert-banner">
            <FiClock />
            <div>
                <strong>Complete your profile before applying.</strong>
                <div className="muted">Personal info, education, skills, and documents are required.</div>
            </div>
            <Link className="secondary-button" to="/applicant/profile">
                Complete profile
            </Link>
        </div>
    );
}

export default ProfileStatusBanner;
